/**
 * ==============================================================================
 * 多语言国际化模块 (i18n)
 * ==============================================================================
 * 仅保留 简体中文 (zh_CN) 与 英文 (en) 双语支持。
 * 支持文本占位符动态插值（例如 {count}、{version}、{errorcode} 等）。
 * ==============================================================================
 */

import { ref, computed } from "vue";
import zhCN from "./zh_CN.json";

// 当前选中的语言（默认从 localStorage 读取，若无则跟随浏览器语言，默认 zh_CN）
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
 * @param {'zh_CN' | 'en'} lang 
 */
export function setLanguage(lang) {
  currentLang.value = lang === "zh_CN" ? "zh_CN" : "en";
}

/**
 * 国际化翻译函数
 * @param {string} key 翻译词条键（英文原始文本）
 * @param {Record<string, any>} [params] 动态插值参数对象
 * @returns {string} 翻译后的文本
 */
export function t(key, params = {}) {
  if (!key) return "";

  let result = key;
  if (currentLang.value === "zh_CN" && zhCN[key] !== undefined) {
    result = zhCN[key];
  }

  // 动态参数替换: 例如 {count: 5} 替换字符串中的 {count}
  if (params && typeof params === "object") {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), paramVal);
    }
  }

  return result;
}

export default {
  install(app) {
    app.config.globalProperties.$t = t;
  }
};
