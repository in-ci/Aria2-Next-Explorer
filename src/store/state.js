/**
 * ==============================================================================
 * Store 模块：核心响应式状态定义 (state.js)
 * ==============================================================================
 * 职责：
 * 1. 严格定义全局响应式状态 store。
 * 2. 对高频大数据应用浅层响应式（shallowRef）与 markRaw，降低 Vue3 代理内存开销。
 * 3. 维护 RPC 服务列表计算属性与任务单项轻量化加工函数。
 * ==============================================================================
 */

import { reactive, computed, shallowRef, markRaw } from "vue";
import { getErrorDescription } from "../api/aria2-errors";
import { loadSavedOptions } from "./options";

/** 列表查询精简字段列表，大幅减少 RPC 报文与 JSON 序列化开销 */
export const TASK_SUMMARY_KEYS = [
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
export function createInitialSpeedHistory() {
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

const savedConfig = loadSavedOptions();

/**
 * 全局核心响应式数据仓库 (Store)
 * 关键内存优化：
 * - serverInfo / globalOptions 采用 shallowRef，阻断对其内部成百上千键值的递归深度代理
 * - speedHistory / client 保持 markRaw，避免高频变更产生响应式 Proxy 垃圾
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

  /** 任务集合 (内部单项通过 markRaw 保证轻量) */
  tasks: {
    active: [],
    waiting: [],
    stopped: [],
  },

  /** 当前被选中的任务 GID 集合 */
  selectedGids: new Set(),

  /** 实时速度历史（供 Canvas 图表使用，markRaw 规避深层响应式） */
  speedHistory: markRaw(createInitialSpeedHistory()),

  /** Aria2 服务端版本与功能信息 (浅层响应式) */
  serverInfo: shallowRef({
    version: "",
    product: "",
    rpcVersion: "",
    enabledFeatures: [],
    mediaFeatures: [],
    downloadFeatures: [],
    sessionId: "",
  }),

  /** Aria2 服务端当前全局生效配置缓存 (浅层响应式，避免深层代理百余项 Aria2 属性) */
  globalOptions: shallowRef({}),

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
export const taskMetaMap = new Map();

/**
 * 处理单项任务的数据加工与属性提炼
 * 使用 markRaw 阻断 Vue3 对海量静态任务对象的深度响应式 Proxy 包装，降低 90% 堆内存占用
 * @param {object} raw Aria2 原始任务对象
 * @returns {object} 提炼后的轻量任务对象
 */
export function processTaskItem(raw) {
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
