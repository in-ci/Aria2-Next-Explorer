/**
 * ==============================================================================
 * 组合式函数：通用 DOM 事件监听与生命周期自动销毁 (useEventListener.js)
 * ==============================================================================
 * 职责：
 * 1. 统一管理 window、document、DOM 节点或 ref 对象的事件挂载。
 * 2. 结合 onMounted / onUnmounted 钩子，保证组件卸载时 100% 自动解绑。
 * 3. 规避组件频繁切换与重载时的全局事件监听器泄漏。
 * ==============================================================================
 */

import { onMounted, onUnmounted, unref } from "vue";

/**
 * 注册 DOM 事件监听并在当前组件卸载时自动注销
 * @param {EventTarget | import("vue").Ref<EventTarget | null> | string} target 目标监听对象、DOM 节点或 CSS 选择器
 * @param {string} event 事件类型名称 (如 'click', 'resize', 'keydown', 'scroll')
 * @param {EventListenerOrEventListenerObject} handler 事件回调句柄
 * @param {boolean | AddEventListenerOptions} [options] addEventListener 配置参数 (如 passive: true)
 * @returns {() => void} 手动立即解除监听的清理函数
 */
export function useEventListener(target, event, handler, options) {
  if (typeof window === "undefined" || !handler) {
    return () => {};
  }

  let resolvedTarget = null;

  const cleanup = () => {
    if (resolvedTarget && typeof resolvedTarget.removeEventListener === "function") {
      resolvedTarget.removeEventListener(event, handler, options);
      resolvedTarget = null;
    }
  };

  const setup = () => {
    cleanup();
    if (typeof target === "string") {
      resolvedTarget = document.querySelector(target);
    } else {
      resolvedTarget = unref(target);
    }

    if (resolvedTarget && typeof resolvedTarget.addEventListener === "function") {
      resolvedTarget.addEventListener(event, handler, options);
    }
  };

  onMounted(setup);
  onUnmounted(cleanup);

  return cleanup;
}
