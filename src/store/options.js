/**
 * ==============================================================================
 * Store 模块：配置与持久化存储 (options.js)
 * ==============================================================================
 * 职责：
 * 1. 负责 AriaNg 本地偏好设置在 localStorage 中的读取、迁移与安全保存。
 * 2. 负责主题模式（经典与深色）和动效开关的 DOM 类名响应与持久化同步。
 * ==============================================================================
 */

/** 本地持久化配置的 Storage Key */
export const LOCAL_STORAGE_KEY = "AriaNg.Options";

/**
 * 从 localStorage 读取本地持久化配置，若不存在或损坏则返回标准默认配置
 * @returns {object} 解析并合并后的配置项
 */
export function loadSavedOptions() {
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

    // 一次性平滑升级：将历史默认值 downloading 自动迁移为 all
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

    // 主题合法性收敛：仅支持 default (经典) 与 dark (深色)
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
 * @param {object} options 待保存的配置对象
 */
export function saveOptions(options) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(options));
  } catch (e) {
    console.warn("[Store] Failed to save options to localStorage:", e);
  }
}

/**
 * 切换主题外观 (仅支持 经典 default 与 深色 dark)
 * @param {'default' | 'dark'} theme 目标主题
 * @param {object} storeRef 全局 Store 引用，用于更新响应式状态
 */
export function applyTheme(theme, storeRef) {
  const targetTheme = theme === "dark" ? "dark" : "default";
  if (storeRef) {
    storeRef.theme = targetTheme;
    storeRef.options.theme = targetTheme;
    saveOptions(storeRef.options);
  }

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.classList.remove("dark-theme", "light-theme", "theme-system", "theme-skyblue", "theme-sapphire", "theme-pink");

    if (targetTheme === "dark") {
      root.classList.add("dark-theme", "theme-dark");
    } else {
      root.classList.remove("theme-dark");
    }
  }
}

/**
 * 切换动效模式 (启用 / 禁用平滑过渡)
 * @param {boolean} enabled 是否开启过渡动效
 * @param {object} storeRef 全局 Store 引用
 */
export function applyAnimationEffects(enabled, storeRef) {
  if (storeRef) {
    storeRef.options.animationEffects = enabled;
    saveOptions(storeRef.options);
  }
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (enabled === false) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }
  }
}
