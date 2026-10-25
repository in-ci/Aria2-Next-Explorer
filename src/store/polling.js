/**
 * ==============================================================================
 * Store 模块：轮询调度与数据同步 (polling.js)
 * ==============================================================================
 * 职责：
 * 1. 负责 Aria2 JSON-RPC 状态心跳与任务列表的自适应阶梯式拉取。
 * 2. 结合 Page Visibility API，在标签页处于后台时休眠轮询，节约 CPU 与内存。
 * 3. 规范化管理 visibilitychange 监听器与心跳定时器，防止组件重载时发生内存泄漏。
 * ==============================================================================
 */

import { markRaw } from "vue";
import { Aria2Client } from "../api/aria2";
import { formatPageTitle } from "../utils/title";
import { setLanguage } from "../i18n";
import { store, currentRpc, taskMetaMap, processTaskItem, TASK_SUMMARY_KEYS } from "./state";
import { applyTheme, applyAnimationEffects, loadSavedCompletedTimes, saveCompletedTimes } from "./options";

/** 轮询降频计数器与停止任务数量缓存 */
let pollCycleCount = 0;
let lastNumStopped = -1;

/** 页面可见性变动事件句柄引用，用于注销防泄漏 */
let visibilityHandler = null;

/**
 * 清除旧的页面可见性监听器，杜绝闭包与 DOM 监听器泄漏
 */
function cleanupVisibilityListener() {
  if (visibilityHandler && typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
}

/**
 * 刷新拉取全局统计和任务数据 (自适应按需分级拉取与低频降耗)
 * @param {boolean} force 是否强制同步刷新所有分类
 */
export async function refreshData(force = false) {
  if (!store.client) return;

  try {
    pollCycleCount++;

    // 1. 始终拉取全局基础统计（报文体积微乎其微）
    const stat = await store.client.getGlobalStat().catch(() => null);

    if (stat) {
      const downSpeed = Number(stat.downloadSpeed) || 0;
      const upSpeed = Number(stat.uploadSpeed) || 0;
      const numActive = Number(stat.numActive) || 0;
      const numWaiting = Number(stat.numWaiting) || 0;
      const numStopped = Number(stat.numStopped) || 0;

      store.globalStat = {
        downloadSpeed: downSpeed,
        uploadSpeed: upSpeed,
        numActive,
        numWaiting,
        numStopped,
        numTotal: numActive + numWaiting + numStopped,
      };

      // 记录速度历史 (定长 60 项队列，避免无上限堆积)
      store.speedHistory.push({
        down: downSpeed,
        up: upSpeed,
        time: Date.now(),
      });
      if (store.speedHistory.length > 60) {
        store.speedHistory.shift();
      }

      // 同步网页标题
      if (typeof document !== "undefined") {
        const tpl = store.options.title || "${downspeed}, ${upspeed} - ${title}";
        document.title = formatPageTitle(tpl, store.globalStat, currentRpc.value.rpcAlias);
      }

      // 2. 检测当前页面视图，按需动态决定拉取策略
      const currentPath = typeof window !== "undefined" ? window.location.hash || "" : "";
      const isViewingStopped = currentPath.includes("stopped") || currentPath.includes("all");
      const isViewingWaiting = currentPath.includes("waiting") || currentPath.includes("all");

      // 3. 下载中任务：没有活动任务时不发送网络请求，直接置空
      const activePromise = numActive > 0
        ? store.client.tellActive(TASK_SUMMARY_KEYS).catch(() => [])
        : Promise.resolve([]);

      // 4. 等待中任务：按需或降频拉取
      const shouldFetchWaiting = force || isViewingWaiting || pollCycleCount % 3 === 0;
      const waitingPromise = numWaiting > 0 && shouldFetchWaiting
        ? store.client.tellWaiting(0, 1000, TASK_SUMMARY_KEYS).catch(() => [])
        : Promise.resolve(numWaiting === 0 ? [] : null);

      // 5. 已停止任务：已停止任务不会变动速度，仅在数量改变、进入停止页面或每10次心跳降频同步
      const shouldFetchStopped = force || isViewingStopped || lastNumStopped !== numStopped || pollCycleCount % 10 === 0;
      const stoppedPromise = numStopped > 0 && shouldFetchStopped
        ? store.client.tellStopped(-1, 1000, TASK_SUMMARY_KEYS).catch(() => [])
        : Promise.resolve(numStopped === 0 ? [] : null);

      const [active, waiting, stopped] = await Promise.all([
        activePromise,
        waitingPromise,
        stoppedPromise,
      ]);

      if (active !== null) {
        active.forEach((raw, idx) => {
          let meta = taskMetaMap.get(raw.gid);
          if (!meta) {
            meta = {
              startTime: Date.now() - (active.length - idx) * 1000,
              completedTime: 0,
              activeOrder: idx,
              waitingOrder: 999999,
              stoppedOrder: 999999,
            };
            taskMetaMap.set(raw.gid, meta);
          } else {
            meta.activeOrder = idx;
          }
        });
        store.tasks.active = active.map(processTaskItem);
      }
      if (waiting !== null) {
        waiting.forEach((raw, idx) => {
          let meta = taskMetaMap.get(raw.gid);
          if (!meta) {
            meta = {
              startTime: 0,
              completedTime: 0,
              activeOrder: 999999,
              waitingOrder: idx,
              stoppedOrder: 999999,
            };
            taskMetaMap.set(raw.gid, meta);
          } else {
            meta.waitingOrder = idx;
          }
        });
        store.tasks.waiting = waiting.map(processTaskItem);
      }
      if (stopped !== null) {
        lastNumStopped = numStopped;
        const savedTimes = loadSavedCompletedTimes();
        let hasNewSavedTimes = false;
        const now = Date.now();

        stopped.forEach((raw, idx) => {
          let meta = taskMetaMap.get(raw.gid);
          let completedTime = 0;

          // 1. 若内存 meta 中已记录完成时间，优先保持
          if (meta && meta.completedTime) {
            completedTime = meta.completedTime;
          }
          // 2. 若本地存储已持久化该任务完成时间，读取恢复
          else if (savedTimes[raw.gid]) {
            completedTime = savedTimes[raw.gid];
          }
          // 3. 首次发现该已停止任务：
          // - 若先前在内存中已存在（即从 active 或 waiting 刚完成），取当前时间戳 now
          // - 若初次连接/冷启动且无持久化记录，因为 tellStopped(-1) 是从最新到最旧排列：
          //   idx = 0 为最新，赋予当前时间；后续任务依次递减 1 秒，确保精确复原相对时间差
          else {
            if (meta && meta.startTime > 0) {
              completedTime = now;
            } else {
              completedTime = now - idx * 1000;
            }
            savedTimes[raw.gid] = completedTime;
            hasNewSavedTimes = true;
          }

          if (!meta) {
            meta = {
              startTime: 0,
              completedTime,
              activeOrder: 999999,
              waitingOrder: 999999,
              stoppedOrder: idx,
            };
            taskMetaMap.set(raw.gid, meta);
          } else {
            meta.completedTime = completedTime;
            meta.stoppedOrder = idx;
          }
        });

        // 仅保留当前依然存在的已停止任务的时间戳记录，防止历史 GID 持续堆积占用存储
        let pruned = false;
        const stoppedGidSet = new Set(stopped.map((t) => t.gid));
        for (const gid in savedTimes) {
          if (!stoppedGidSet.has(gid)) {
            delete savedTimes[gid];
            pruned = true;
          }
        }
        if (hasNewSavedTimes || pruned) {
          saveCompletedTimes(savedTimes);
        }

        store.tasks.stopped = stopped.map(processTaskItem);
      }

      // 及时清理在服务端已被删除的任务 GID，防止 selectedGids 及 taskMetaMap 发生内存泄漏
      const validGids = new Set([
        ...store.tasks.active.map((t) => t.gid),
        ...store.tasks.waiting.map((t) => t.gid),
        ...store.tasks.stopped.map((t) => t.gid),
      ]);

      if (store.selectedGids.size > 0) {
        for (const gid of store.selectedGids) {
          if (!validGids.has(gid)) {
            store.selectedGids.delete(gid);
          }
        }
      }

      for (const [gid] of taskMetaMap) {
        if (!validGids.has(gid)) {
          taskMetaMap.delete(gid);
        }
      }
    }
  } catch (err) {
    // 忽略单次网络闪断
  }
}

/**
 * 启动 Store 客户端并开始自适应定时轮询
 */
export function initStore() {
  const current = currentRpc.value;
  store.client = markRaw(new Aria2Client(current));

  store.client.on("statusChange", (status) => {
    store.rpcStatus = status;
    if (status === "Connected") {
      refreshServerInfo();
      fetchGlobalOptions();
    }
  });

  // 监听任务状态变动推送，在状态变动时立即唤醒刷新
  ["onDownloadStart", "onDownloadPause", "onDownloadStop", "onDownloadComplete", "onDownloadError"].forEach((ev) => {
    store.client.on(ev, () => {
      refreshData(true);
    });
  });

  store.client.connect();
  refreshData(true);

  // 建立心跳轮询定时器（先清理旧定时器）
  if (store.pollTimer) {
    clearInterval(store.pollTimer);
    store.pollTimer = null;
  }
  store.pollTimer = setInterval(() => {
    // 浏览器标签页处于后台隐藏时跳过轮询，避免内存与 CPU 浪费
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }
    refreshData();
  }, store.options.downloadTaskRefreshInterval || 1000);

  // 绑定标签页前后台切换：恢复可见时立即强制刷新一次，绑定前先清理旧句柄杜绝泄漏
  cleanupVisibilityListener();
  if (typeof document !== "undefined") {
    visibilityHandler = () => {
      if (!document.hidden) {
        refreshData(true);
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);
  }

  // 初始化主题、动画效果与多语言
  applyTheme(store.options.theme || "default", store);
  applyAnimationEffects(store.options.animationEffects !== false, store);
  setLanguage(store.options.language === "en" ? "en" : "zh_CN");
}

/**
 * 停止 Store 轮询并释放所有监听句柄与网络连接
 */
export function stopStore() {
  if (store.pollTimer) {
    clearInterval(store.pollTimer);
    store.pollTimer = null;
  }
  cleanupVisibilityListener();
  if (store.client) {
    store.client.disconnect();
    store.client = null;
  }
}

/**
 * 从 Aria2 服务端主动拉取全局生效选项并更新 store.globalOptions
 * @returns {Promise<object>} 全局配置字典
 */
export async function fetchGlobalOptions() {
  if (!store.client) return store.globalOptions;
  try {
    const opts = await store.client.getGlobalOption();
    if (opts) {
      store.globalOptions = opts;
      return opts;
    }
  } catch (err) {
    console.warn("[Store] Failed to fetch global options:", err);
  }
  return store.globalOptions;
}

/**
 * 刷新 Aria2 服务端元信息 (版本、特性、会话ID等)
 */
export async function refreshServerInfo() {
  if (!store.client) return;
  try {
    const [v, s, opts] = await Promise.all([
      store.client.getVersion().catch(() => null),
      store.client.getSessionInfo().catch(() => null),
      store.client.getGlobalOption().catch(() => null),
    ]);
    if (v || s) {
      store.serverInfo = {
        version: v?.version || "",
        product: v?.product || "aria2",
        rpcVersion: v?.rpcVersion || "",
        enabledFeatures: v?.enabledFeatures || [],
        mediaFeatures: v?.mediaFeatures || [],
        downloadFeatures: v?.downloadFeatures || [],
        sessionId: s?.sessionId || "",
      };
    }
    if (opts) {
      store.globalOptions = opts;
    }
  } catch (err) {
    console.warn("[Store] Failed to refresh server info:", err);
  }
}
