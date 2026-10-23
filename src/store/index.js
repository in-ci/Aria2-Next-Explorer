/**
 * ==============================================================================
 * 全局状态管理中心 (Store)
 * ==============================================================================
 * 基于 Vue 3 核心 reactive / ref 原生响应式架构构建，
 * 彻底消除了 AngularJS 1.x 笨重的全树 $digest 脏检查与内存泄漏。
 * ==============================================================================
 */

import { reactive, ref, computed, markRaw } from "vue";
import { Aria2Client } from "../api/aria2";
import { getErrorDescription } from "../api/aria2-errors";
import { currentLang, setLanguage } from "../i18n";

const LOCAL_STORAGE_KEY = "AriaNg.Options";

/**
 * 读取本地持久化配置
 */
function loadSavedOptions() {
  const defaultOpts = {
    language: "zh_CN",
    theme: "system",
    compactMode: false,
    displayOrder: "default:asc",
    globalStatRefreshInterval: 1000,
    downloadTaskRefreshInterval: 1000,
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
    return { ...defaultOpts, ...parsed };
  } catch (e) {
    return defaultOpts;
  }
}

/**
 * 保存配置至本地
 */
function saveOptions(options) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(options));
  } catch (e) {
    console.warn("[Store] Failed to save options to localStorage:", e);
  }
}

const savedConfig = loadSavedOptions();

export const store = reactive({
  // 配置项
  options: savedConfig,
  theme: savedConfig.theme || "system",
  compactMode: savedConfig.compactMode || false,
  displayOrder: savedConfig.displayOrder || "default:asc",
  searchQuery: "",
  
  // 连接状态
  rpcStatus: "Disconnected",
  activeRpcIndex: 0,
  
  // 全局下载状态
  globalStat: {
    downloadSpeed: 0,
    uploadSpeed: 0,
    numActive: 0,
    numWaiting: 0,
    numStopped: 0,
    numTotal: 0,
  },

  // 任务集合
  tasks: {
    active: [],
    waiting: [],
    stopped: [],
  },

  // 选中的任务 GID 集合
  selectedGids: new Set(),

  // 实时速度历史（供 Canvas 图表使用）
  speedHistory: [],

  // Aria2 服务端信息
  serverInfo: {
    version: "",
    enabledFeatures: [],
    sessionId: "",
  },

  // 客户端实例
  client: null,
  pollTimer: null,
});

/**
 * 当前选中的 RPC 服务端配置
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
 * 所有配置的 RPC 列表（包含主 RPC 与扩展 RPC）
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

/**
 * 处理单项任务的数据加工
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

  // 计算剩余秒数
  let remainTime = -1;
  if (downloadSpeed > 0 && totalLength > completedLength) {
    remainTime = Math.round((totalLength - completedLength) / downloadSpeed);
  }

  // 提取文件名
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

  // 选中的文件数量统计
  let selectedFileCount = 0;
  if (raw.files) {
    selectedFileCount = raw.files.filter((f) => f.selected === "true").length;
  }

  return {
    ...raw,
    taskName,
    totalLength,
    completedLength,
    downloadSpeed,
    uploadSpeed,
    completePercent,
    remainTime,
    selectedFileCount,
    errorDescription: getErrorDescription(raw.errorCode),
  };
}

/**
 * 刷新拉取全局统计和任务数据
 */
export async function refreshData() {
  if (!store.client) return;

  try {
    const [stat, active, waiting, stopped] = await Promise.all([
      store.client.getGlobalStat().catch(() => null),
      store.client.tellActive().catch(() => []),
      store.client.tellWaiting(0, 1000).catch(() => []),
      store.client.tellStopped(0, 1000).catch(() => []),
    ]);

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

      // 记录速度历史
      store.speedHistory.push({
        down: downSpeed,
        up: upSpeed,
        time: Date.now(),
      });
      if (store.speedHistory.length > 60) {
        store.speedHistory.shift();
      }
    }

    store.tasks.active = (active || []).map(processTaskItem);
    store.tasks.waiting = (waiting || []).map(processTaskItem);
    store.tasks.stopped = (stopped || []).map(processTaskItem);

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
        store.serverInfo.version = v.version;
        store.serverInfo.enabledFeatures = v.enabledFeatures || [];
      }).catch(() => {});

      store.client.getSessionInfo().then((s) => {
        store.serverInfo.sessionId = s.sessionId;
      }).catch(() => {});
    }
  });

  // 监听任务状态变动推送
  ["onDownloadStart", "onDownloadPause", "onDownloadStop", "onDownloadComplete", "onDownloadError"].forEach((ev) => {
    store.client.on(ev, () => {
      refreshData();
    });
  });

  store.client.connect();

  // 定时心跳轮询 (1000ms)
  clearInterval(store.pollTimer);
  store.pollTimer = setInterval(() => {
    refreshData();
  }, store.options.downloadTaskRefreshInterval || 1000);

  // 初始化主题与多语言
  applyTheme(store.theme);
  setLanguage(store.options.language === "en" ? "en" : "zh_CN");
}

/**
 * 切换活跃 RPC 服务器
 */
export function switchRpcServer(index) {
  if (index < 0 || index >= rpcList.value.length) return;
  store.activeRpcIndex = index;
  store.selectedGids.clear();
  store.tasks = { active: [], waiting: [], stopped: [] };
  store.speedHistory = [];

  const target = currentRpc.value;
  store.client.updateConfig(target);
  refreshData();
}

/**
 * 切换主题外观 (system / dark / default)
 */
export function applyTheme(theme) {
  store.theme = theme;
  store.options.theme = theme;
  saveOptions(store.options);

  const root = document.documentElement;
  root.classList.remove("dark-theme", "light-theme", "theme-system");

  if (theme === "dark") {
    root.classList.add("dark-theme");
  } else if (theme === "system") {
    root.classList.add("theme-system");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) root.classList.add("dark-theme");
  }
}

/**
 * 批量操作任务
 */
export async function batchAction(action, gids = []) {
  if (!store.client) return;
  const targetGids = gids.length > 0 ? gids : Array.from(store.selectedGids);
  if (targetGids.length === 0) return;

  const promises = targetGids.map((gid) => {
    if (action === "pause") return store.client.pause(gid).catch(() => {});
    if (action === "start") return store.client.unpause(gid).catch(() => {});
    if (action === "remove") return store.client.remove(gid).catch(() => store.client.removeDownloadResult(gid).catch(() => {}));
  });

  await Promise.all(promises);
  store.selectedGids.clear();
  await refreshData();
}

/**
 * 清除已停止的所有任务
 */
export async function clearAllStoppedTasks() {
  if (!store.client) return;
  try {
    await store.client.purgeDownloadResult();
  } catch (e) {}
  await refreshData();
}
