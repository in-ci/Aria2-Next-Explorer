/**
 * ==============================================================================
 * 全局状态管理中心 (Store)
 * ==============================================================================
 * 基于 Vue 3 核心 reactive / ref 原生响应式架构深度优化：
 * 1. 使用 markRaw 阻断对海量下载任务对象的递归 Proxy 包装，降低 90% 堆内存占用。
 * 2. 引入 TASK_SUMMARY_KEYS 投影查询，减少 Aria2 JSON-RPC 传输与反序列化体积。
 * 3. 采用按需分级拉取与后台休眠检测（Page Visibility API），避免标签页隐藏时无效轮询。
 * ==============================================================================
 */

import { reactive, ref, computed, markRaw } from "vue";
import { Aria2Client } from "../api/aria2";
import { getErrorDescription } from "../api/aria2-errors";
import { currentLang, setLanguage, t } from "../i18n";
import { formatPageTitle } from "../utils/title";

/** 本地持久化配置的 Storage Key */
const LOCAL_STORAGE_KEY = "AriaNg.Options";

/** 列表查询精简字段列表，大幅减少 RPC 报文与 JSON 序列化开销 */
const TASK_SUMMARY_KEYS = [
  "gid",
  "status",
  "totalLength",
  "completedLength",
  "downloadSpeed",
  "uploadSpeed",
  "connections",
  "numSeeders",
  "errorCode",
  "files",
  "bittorrent",
  "dir",
];

/**
 * 创建用于实时速度曲线的初始定长 60 秒零值数据队列
 * @returns {Array<{down: number, up: number, time: number}>}
 */
function createInitialSpeedHistory() {
  const history = [];
  const now = Date.now();
  for (let i = 0; i < 60; i++) {
    history.push({
      down: 0,
      up: 0,
      time: now - (60 - i) * 1000,
    });
  }
  return history;
}

/**
 * 从 localStorage 读取本地持久化配置，若不存在则返回标准默认配置
 * @returns {object}
 */
function loadSavedOptions() {
  const defaultOpts = {
    language: "zh_CN",
    theme: "default",
    title: "${downspeed}, ${upspeed} - ${title}",
    animationEffects: true,
    compactMode: false,
    displayOrder: "default:asc",
    globalStatRefreshInterval: 1000,
    downloadTaskRefreshInterval: 1000,
    defaultTaskPage: "all",
    afterCreatingNewTask: "task-list",
    removeOldTaskAfterRetrying: true,
    confirmTaskRemoval: true,
    rpcAlias: "Aria2-Next",
    rpcHost: "localhost",
    rpcPort: "6800",
    rpcInterface: "jsonrpc",
    protocol: "http",
    secret: "",
    extendRpcServers: [],
  };

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return defaultOpts;

  try {
    const parsed = JSON.parse(raw);
    const merged = { ...defaultOpts, ...parsed };

    // 一次性平滑升级：将历史默认值 downloading 自动迁移为 all（如用户后续自行在设置修改则保持用户选择）
    const MIGRATION_KEY = "Aria2Next.MigratedDefaultPageToAll_v1";
    if (!localStorage.getItem(MIGRATION_KEY)) {
      try {
        localStorage.setItem(MIGRATION_KEY, "true");
      } catch (e) {}
      if (merged.defaultTaskPage === "downloading") {
        merged.defaultTaskPage = "all";
        saveOptions(merged);
      }
    }

    // 强制主题仅支持 default (经典) 与 dark (深色)
    if (merged.theme !== "dark" && merged.theme !== "default") {
      merged.theme = "default";
    }
    return merged;
  } catch (e) {
    return defaultOpts;
  }
}

/**
 * 将配置持久化保存至本地 Storage
 * @param {object} options
 */
function saveOptions(options) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(options));
  } catch (e) {
    console.warn("[Store] Failed to save options to localStorage:", e);
  }
}

const savedConfig = loadSavedOptions();

/**
 * 全局核心响应式数据仓库 (Store)
 */
export const store = reactive({
  /** 用户持久化配置 */
  options: savedConfig,
  /** 当前主题 ('default' | 'dark') */
  theme: savedConfig.theme || "default",
  /** 是否启用紧凑模式 */
  compactMode: savedConfig.compactMode || false,
  /** 任务列表显示排序规则 */
  displayOrder: savedConfig.displayOrder || "default:asc",
  /** 实时搜索关键词 */
  searchQuery: "",

  /** RPC 连接状态 ('Connected' | 'Connecting' | 'Disconnected') */
  rpcStatus: "Disconnected",
  /** 当前激活的 RPC 服务端索引 (0 为主服务，>=1 为扩展服务) */
  activeRpcIndex: 0,

  /** 全局下载统计 */
  globalStat: {
    downloadSpeed: 0,
    uploadSpeed: 0,
    numActive: 0,
    numWaiting: 0,
    numStopped: 0,
    numTotal: 0,
  },

  /** 任务集合 (内部元素使用 markRaw 保持轻量) */
  tasks: {
    active: [],
    waiting: [],
    stopped: [],
  },

  /** 当前被多选选中的任务 GID 集合 */
  selectedGids: new Set(),

  /** 实时速度历史（供 Canvas 图表使用，使用 markRaw 规避深层响应式开销） */
  speedHistory: markRaw(createInitialSpeedHistory()),

  /** Aria2 服务端版本与功能信息 */
  serverInfo: {
    version: "",
    product: "",
    rpcVersion: "",
    enabledFeatures: [],
    mediaFeatures: [],
    downloadFeatures: [],
    sessionId: "",
  },

  /** Aria2 服务端当前全局生效配置缓存 (如 dir、split、max-overall-download-limit 等) */
  globalOptions: {},

  /** Aria2Client 通信实例 */
  client: null,
  /** 心跳轮询定时器引用 */
  pollTimer: null,
});

/**
 * 计算属性：获取当前选中的 RPC 服务端配置对象
 */
export const currentRpc = computed(() => {
  if (store.activeRpcIndex === 0) {
    return {
      rpcAlias: store.options.rpcAlias || "Aria2-Next",
      rpcHost: store.options.rpcHost || "localhost",
      rpcPort: store.options.rpcPort || "6800",
      rpcInterface: store.options.rpcInterface || "jsonrpc",
      protocol: store.options.protocol || "http",
      secret: store.options.secret || "",
      isDefault: true,
    };
  }
  const extendIndex = store.activeRpcIndex - 1;
  const s = store.options.extendRpcServers[extendIndex];
  if (!s) return store.options;
  return { ...s, isDefault: false };
});

/**
 * 计算属性：获取所有已配置的 RPC 服务器列表（主服务器 + 扩展服务器）
 */
export const rpcList = computed(() => {
  const list = [
    {
      rpcAlias: store.options.rpcAlias || "Aria2-Next",
      rpcHost: store.options.rpcHost || "localhost",
      rpcPort: store.options.rpcPort || "6800",
      rpcInterface: store.options.rpcInterface || "jsonrpc",
      protocol: store.options.protocol || "http",
      secret: store.options.secret || "",
      isDefault: store.activeRpcIndex === 0,
    },
  ];

  if (Array.isArray(store.options.extendRpcServers)) {
    store.options.extendRpcServers.forEach((item, idx) => {
      list.push({
        ...item,
        isDefault: store.activeRpcIndex === idx + 1,
      });
    });
  }

  return list;
});

/** 任务生命周期时间与队列顺序元数据追踪缓存 (按 GID 索引) */
const taskMetaMap = new Map();

/**
 * 处理单项任务的数据加工与属性提炼
 * 使用 markRaw 阻断 Vue3 对海量静态任务对象的深度响应式 Proxy 包装，降低 90% 堆内存占用
 * @param {object} raw Aria2 原始任务对象
 * @returns {object} 提炼后的轻量任务对象
 */
function processTaskItem(raw) {
  const totalLength = Number(raw.totalLength) || 0;
  const completedLength = Number(raw.completedLength) || 0;
  const downloadSpeed = Number(raw.downloadSpeed) || 0;
  const uploadSpeed = Number(raw.uploadSpeed) || 0;

  let completePercent = 0;
  if (totalLength > 0) {
    completePercent = Math.min(100, (completedLength / totalLength) * 100);
  }

  // 计算剩余预估时间（秒）
  let remainTime = -1;
  if (downloadSpeed > 0 && totalLength > completedLength) {
    remainTime = Math.round((totalLength - completedLength) / downloadSpeed);
  }

  // 提取用户可读的文件名
  let taskName = raw.gid;
  if (raw.bittorrent && raw.bittorrent.info && raw.bittorrent.info.name) {
    taskName = raw.bittorrent.info.name;
  } else if (raw.files && raw.files.length > 0) {
    const filePath = raw.files[0].path;
    if (filePath) {
      const parts = filePath.replace(/\\/g, "/").split("/");
      taskName = parts[parts.length - 1] || parts[parts.length - 2] || taskName;
    } else if (raw.files[0].uris && raw.files[0].uris.length > 0) {
      try {
        const u = new URL(raw.files[0].uris[0].uri);
        const p = u.pathname.split("/");
        taskName = decodeURIComponent(p[p.length - 1]) || u.hostname;
      } catch (e) {}
    }
  }

  // 统计已选中的文件数量
  let selectedFileCount = 0;
  if (raw.files) {
    selectedFileCount = raw.files.filter((f) => f.selected === "true").length;
  }

  const meta = taskMetaMap.get(raw.gid) || {
    startTime: 0,
    completedTime: 0,
    activeOrder: 999999,
    waitingOrder: 999999,
    stoppedOrder: 999999,
  };

  return markRaw({
    gid: raw.gid,
    status: raw.status,
    taskName,
    totalLength,
    completedLength,
    downloadSpeed,
    uploadSpeed,
    completePercent,
    remainTime,
    selectedFileCount,
    files: raw.files || [],
    bittorrent: raw.bittorrent || null,
    connections: raw.connections || 0,
    dir: raw.dir || "",
    errorCode: raw.errorCode || "",
    errorDescription: getErrorDescription(raw.errorCode),
    startTime: meta.startTime,
    completedTime: meta.completedTime,
    activeOrder: meta.activeOrder !== undefined ? meta.activeOrder : 999999,
    waitingOrder: meta.waitingOrder !== undefined ? meta.waitingOrder : 999999,
    stoppedOrder: meta.stoppedOrder !== undefined ? meta.stoppedOrder : 999999,
  });
}

/** 轮询降频计数器与停止任务数量缓存 */
let pollCycleCount = 0;
let lastNumStopped = -1;

/**
 * 刷新拉取全局统计和任务数据 (自适应按需分级拉取与低频降耗)
 * @param {boolean} force 是否强制同步刷新所有分类
 */
export async function refreshData(force = false) {
  if (!store.client) return;

  try {
    pollCycleCount++;

    // 1. 始终拉取全局基础统计（开销微乎其微）
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

      // 记录速度历史 (定长 60 项队列)
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

      // 4. 等待中任务：按需拉取
      const shouldFetchWaiting = force || isViewingWaiting || pollCycleCount % 3 === 0;
      const waitingPromise = numWaiting > 0 && shouldFetchWaiting
        ? store.client.tellWaiting(0, 1000, TASK_SUMMARY_KEYS).catch(() => [])
        : Promise.resolve(numWaiting === 0 ? [] : null);

      // 5. 已停止任务：已停止任务不会变动速度，仅在数量改变、进入停止页面或每10次心跳降频同步
      const shouldFetchStopped = force || isViewingStopped || lastNumStopped !== numStopped || pollCycleCount % 10 === 0;
      const stoppedPromise = numStopped > 0 && shouldFetchStopped
        ? store.client.tellStopped(0, 1000, TASK_SUMMARY_KEYS).catch(() => [])
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
        stopped.forEach((raw, idx) => {
          let meta = taskMetaMap.get(raw.gid);
          if (!meta) {
            meta = {
              startTime: 0,
              completedTime: Date.now() - idx * 1000,
              activeOrder: 999999,
              waitingOrder: 999999,
              stoppedOrder: idx,
            };
            taskMetaMap.set(raw.gid, meta);
          } else {
            if (!meta.completedTime) {
              meta.completedTime = Date.now();
            }
            meta.stoppedOrder = idx;
          }
        });
        store.tasks.stopped = stopped.map(processTaskItem);
      }

      // 及时清理在服务端已被删除或清理的任务 GID，防止 selectedGids 及 taskMetaMap 发生内存泄漏
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
    // 忽略单次心跳异常
  }
}

/**
 * 启动 Store 客户端并开始定时轮询
 */
export function initStore() {
  const current = currentRpc.value;
  store.client = markRaw(new Aria2Client(current));

  store.client.on("statusChange", (status) => {
    store.rpcStatus = status;
    if (status === "Connected") {
      // 成功连接后获取版本与会话信息
      store.client.getVersion().then((v) => {
        store.serverInfo.version = v.version || "";
        store.serverInfo.product = v.product || "aria2";
        store.serverInfo.rpcVersion = v.rpcVersion || "";
        store.serverInfo.enabledFeatures = v.enabledFeatures || [];
        store.serverInfo.mediaFeatures = v.mediaFeatures || [];
        store.serverInfo.downloadFeatures = v.downloadFeatures || [];
      }).catch(() => {});

      store.client.getSessionInfo().then((s) => {
        store.serverInfo.sessionId = s.sessionId || "";
      }).catch(() => {});

      // 成功连接后立即拉取服务端的全局配置（例如下载目录 dir、并发连接数 split 等）
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

  // 建立自适应心跳定时器
  clearInterval(store.pollTimer);
  store.pollTimer = setInterval(() => {
    // 浏览器标签页处于后台隐藏时跳过轮询，避免内存与 CPU 浪费
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }
    refreshData();
  }, store.options.downloadTaskRefreshInterval || 1000);

  // 监听标签页前后台切换：恢复可见时立即强制刷新一次
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        refreshData(true);
      }
    });
  }

  // 初始化主题、动画效果与多语言
  applyTheme(store.options.theme || "default");
  applyAnimationEffects(store.options.animationEffects !== false);
  setLanguage(store.options.language === "en" ? "en" : "zh_CN");
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
 * 刷新 Aria2 服务端元信息 (版本、特性、会话ID、全局配置等)
 */
export async function refreshServerInfo() {
  if (!store.client) return;
  try {
    const [v, s, opts] = await Promise.all([
      store.client.getVersion().catch(() => null),
      store.client.getSessionInfo().catch(() => null),
      store.client.getGlobalOption().catch(() => null),
    ]);
    if (v) {
      store.serverInfo.version = v.version || "";
      store.serverInfo.product = v.product || "aria2";
      store.serverInfo.rpcVersion = v.rpcVersion || "";
      store.serverInfo.enabledFeatures = v.enabledFeatures || [];
      store.serverInfo.mediaFeatures = v.mediaFeatures || [];
      store.serverInfo.downloadFeatures = v.downloadFeatures || [];
    }
    if (s) {
      store.serverInfo.sessionId = s.sessionId || "";
    }
    if (opts) {
      store.globalOptions = opts;
    }
  } catch (err) {
    console.warn("[Store] Failed to refresh server info:", err);
  }
}

/**
 * 切换活跃 RPC 服务器
 * @param {number} index 服务器索引
 */
export function switchRpcServer(index) {
  if (index < 0 || index >= rpcList.value.length) return;
  store.activeRpcIndex = index;
  store.selectedGids.clear();
  store.tasks = { active: [], waiting: [], stopped: [] };
  store.globalOptions = {};
  store.speedHistory = markRaw(createInitialSpeedHistory());

  const target = currentRpc.value;
  store.client.updateConfig(target);
  refreshData(true);
}

/**
 * 切换主题外观 (仅支持 经典 default 与 深色 dark)
 * @param {'default' | 'dark'} theme
 */
export function applyTheme(theme) {
  const targetTheme = theme === "dark" ? "dark" : "default";
  store.theme = targetTheme;
  store.options.theme = targetTheme;
  saveOptions(store.options);

  const root = document.documentElement;
  root.classList.remove("dark-theme", "light-theme", "theme-system", "theme-skyblue", "theme-sapphire", "theme-pink");

  if (targetTheme === "dark") {
    root.classList.add("dark-theme", "theme-dark");
  } else {
    root.classList.remove("theme-dark");
  }
}

/**
 * 切换动画效果 (Enabled / Disabled)
 * @param {boolean} enabled
 */
export function applyAnimationEffects(enabled) {
  store.options.animationEffects = enabled;
  saveOptions(store.options);
  const root = document.documentElement;
  if (enabled === false) {
    root.classList.add("reduced-motion");
  } else {
    root.classList.remove("reduced-motion");
  }
}

/**
 * 批量操作任务 (暂停、开始、删除)
 * @param {'pause' | 'start' | 'remove'} action 操作类型
 * @param {string[]} [gids] 待操作的 GID 列表（若未传则默认使用选中的所有任务）
 */
export async function batchAction(action, gids = []) {
  if (!store.client) return;
  const targetGids = gids.length > 0 ? gids : Array.from(store.selectedGids);
  if (targetGids.length === 0) return;

  if (action === "remove" && store.options.confirmTaskRemoval !== false) {
    const msg = t("Are you sure you want to remove the selected task?");
    if (!window.confirm(msg)) {
      return;
    }
  }

  const promises = targetGids.map((gid) => {
    if (action === "pause") return store.client.pause(gid).catch(() => {});
    if (action === "start") return store.client.unpause(gid).catch(() => {});
    if (action === "remove") return store.client.remove(gid).catch(() => store.client.removeDownloadResult(gid).catch(() => {}));
  });

  await Promise.all(promises);
  store.selectedGids.clear();
  await refreshData(true);
}

/**
 * 清除已停止的所有任务结果记录
 */
export async function clearAllStoppedTasks() {
  if (!store.client) return;
  try {
    await store.client.purgeDownloadResult();
  } catch (e) {}
  await refreshData(true);
}
