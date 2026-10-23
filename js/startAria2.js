/**
 * 唤起本地 Aria2-Next 核心服务
 * 通过自定义 URI 协议（aria2-next:// 或 aria2://）调用系统已注册的本地启动脚本或可执行文件
 */
import Logger from "./logger.js";

// 自定义协议方案：优先尝试 aria2-next://，兼容回退 aria2://
const SCHEME_ARIA2_NEXT_START = "aria2-next://start/";
const SCHEME_ARIA2_START = "aria2://start/";
const PROMOTION_DES = "Aria2ManagerPromotionDes";
const PROMOTION_PAGE = chrome.runtime.getURL('ui/ariang/index.html');
const TIMEOUT = 1000; // 等待外部协议唤起及焦点切换的超时时间（毫秒）

let focused = true;
let confirmed = false;

// 监听窗口失焦事件：当操作系统弹出协议确认对话框或唤起外部程序时，浏览器页面会失焦，此时自动关闭本过渡页
window.addEventListener('blur', function () {
    focused = false;
    Logger.log('页面已失焦，正在检查当前窗口状态...');
    chrome.runtime.sendMessage({ type: 'QUERY_WINDOW_STATE', data: chrome.windows.WINDOW_ID_CURRENT }).then(
        (response) => {
            if (response && response.data) {
                const currentWindow = response.data;
                Logger.log('当前窗口 ID = %d, focused =', currentWindow.id, currentWindow.focused);
                if (!currentWindow.focused) {
                    Logger.log('浏览器已失焦，过渡页面即将自动关闭。');
                    window.close();
                }
            }
        }
    );
});

// 监听窗口重新获取焦点事件
window.addEventListener('focus', function () {
    focused = true;
    Logger.log('页面重新获得焦点，confirmed =', confirmed);
    !confirmed && window.close();
});

// 尝试唤起本地 Aria2-Next 协议
try {
    window.location.href = SCHEME_ARIA2_NEXT_START;
    // 如果系统注册的是传统 aria2:// 协议，做轻微延时容错回退
    setTimeout(() => {
        if (focused && !confirmed) {
            window.location.href = SCHEME_ARIA2_START;
        }
    }, 200);
} catch (e) {
    window.location.href = SCHEME_ARIA2_START;
}

// 超时检查：若页面依然保持焦点，说明本地未注册该协议或未响应，提示用户
setTimeout(() => {
    if (focused) {
        const des = chrome.i18n.getMessage(PROMOTION_DES) || PROMOTION_DES;
        if (confirm(des)) {
            confirmed = true;
            window.location.href = PROMOTION_PAGE;
        } else {
            Logger.log('用户取消提示，页面即将关闭。');
            window.close();
        }
    }
}, TIMEOUT);
