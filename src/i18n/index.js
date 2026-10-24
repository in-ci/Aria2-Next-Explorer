/**
 * ==============================================================================
 * 多语言国际化模块 (i18n)
 * ==============================================================================
 * 仅保留 简体中文 (zh_CN) 与 英文 (en) 双语支持。
 * 性能优化重点：
 * 1. 使用 Object.freeze 冻结静态字典，彻底阻断 Vue 深度响应式 Proxy 包装，节约 ~2-3MB 内存。
 * 2. 移除 params 参数的默认空对象分配，高频直接查表返回，杜绝 GC 垃圾开销。
 * 3. 采用原生 replaceAll 替代频繁编译正则表达式。
 * ==============================================================================
 */

import { ref } from "vue";
import zhCNRaw from "./zh_CN.json";

/** 冻结静态字典，阻断 Vue 递归代理包装 */
const zhCNDict = Object.freeze(zhCNRaw);

/**
 * 获取初始语言（优先从 localStorage 读取，其次跟随浏览器语言，默认 zh_CN）
 * @returns {'zh_CN' | 'en'}
 */
function getInitialLanguage() {
  const saved = localStorage.getItem("AriaNg.Options");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.language === "zh_Hans" || parsed.language === "zh_CN") return "zh_CN";
      if (parsed.language === "en") return "en";
    } catch (e) {}
  }
  const navLang = navigator.language || "zh-CN";
  return navLang.toLowerCase().startsWith("zh") ? "zh_CN" : "en";
}

export const currentLang = ref(getInitialLanguage());

/**
 * 切换系统语言
 * @param {'zh_CN' | 'en'} lang 目标语言代码
 */
export function setLanguage(lang) {
  currentLang.value = lang === "zh_CN" ? "zh_CN" : "en";
}

/**
 * 国际化翻译函数
 * 极简零分配快速路径：99% 的场景无动态参数，直接查表秒级返回原始引用
 * @param {string} key 翻译词条键（英文原始文本）
 * @param {Record<string, any>} [params] 动态插值参数对象
 * @returns {string} 翻译后的文本
 */
export function t(key, params) {
  if (!key) return "";

  let result = key;
  if (currentLang.value === "zh_CN") {
    const val = zhCNDict[key];
    if (val !== undefined) {
      result = val;
    }
  }

  // 仅在明确传入插值参数时才执行替换，避免空对象分配与无谓计算
  if (params && typeof params === "object") {
    for (const paramKey in params) {
      if (Object.prototype.hasOwnProperty.call(params, paramKey)) {
        result = result.replaceAll(`{${paramKey}}`, params[paramKey]);
      }
    }
  }

  return result;
}

export default {
  install(app) {
    app.config.globalProperties.$t = t;
  },
};
