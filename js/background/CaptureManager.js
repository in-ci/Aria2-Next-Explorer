/**
 * CaptureManager - 下载拦截管理器
 * 负责监听浏览器下载事件，并根据过滤规则决定是否拦截并转发给 Aria2-Next
 */
import Utils from "../utils.js";
import Logger from "../logger.js";
import { IconManager } from "../IconUtils/IconManager.js";
import { ConfigService } from "../services/ConfigService.js";

export class CaptureManager {
    constructor(downloadManager) {
        this.configService = ConfigService.getInstance();
        this.downloadManager = downloadManager;
        this.altKeyPressed = false;
        this.currentTabUrl = "about:blank";

        // 绑定 this 上下文
        this.captureDownload = this.captureDownload.bind(this);
    }

    /**
     * 启用下载拦截监听
     */
    enable() {
        if (!this.isListening()) {
            chrome.downloads.onDeterminingFilename.addListener(this.captureDownload);
        }
        IconManager.turnOn();
    }

    /**
     * 关闭下载拦截监听
     */
    disable() {
        if (this.isListening()) {
            chrome.downloads.onDeterminingFilename.removeListener(this.captureDownload);
        }
        const iconOffStyle = this.configService.get('iconOffStyle');
        IconManager.turnOff(iconOffStyle);
    }

    /**
     * 检查当前是否已注册下载拦截监听器
     */
    isListening() {
        return chrome.downloads.onDeterminingFilename.hasListener(this.captureDownload);
    }

    /**
     * 设置 Alt 键按下状态
     */
    setAltKeyPressed(pressed) {
        this.altKeyPressed = pressed;
    }

    /**
     * 设置当前活动标签页 URL
     */
    setCurrentTabUrl(url) {
        this.currentTabUrl = url;
    }

    /**
     * 下载拦截核心监听器（同步返回以保证 Chrome 事件回调规范）
     */
    captureDownload(downloadItem, suggest) {
        const config = this.configService.get();

        // 默认保留原建议文件名
        suggest({ filename: downloadItem.filename });

        // 如果存在最终重定向后的 URL，优先使用 finalUrl
        if (downloadItem.finalUrl && downloadItem.finalUrl !== "about:blank") {
            downloadItem.url = downloadItem.finalUrl;
        }

        // 如果未开启集成或未达到拦截判定条件，则放行（使用浏览器自带下载）
        if (!config.integration || !this.#shouldCapture(downloadItem)) {
            return;
        }

        // 处理来自其他扩展的下载提醒
        if (downloadItem.byExtensionId) {
            this.#showCaptureReminder(downloadItem);
        }

        // 异步取消浏览器原生下载并转交给 Aria2-Next
        this.#handleCaptureAsync(downloadItem);
    }

    /**
     * 异步取消浏览器原生下载，并推送至 Aria2-Next
     */
    async #handleCaptureAsync(downloadItem) {
        // 取消 Chrome 原生下载任务
        chrome.downloads.cancel(downloadItem.id).then(() => {
            if (chrome.runtime.lastError) {
                chrome.runtime.lastError = null;
            }
        });

        if (downloadItem.referrer === "about:blank") {
            downloadItem.referrer = "";
        }

        const rpcItem = this.downloadManager.getRpcServer(downloadItem.url + downloadItem.filename);
        const successful = await this.downloadManager.download(downloadItem, rpcItem);

        // 如果向本地核心发送失败，临时暂停拦截并使用浏览器下载作为兜底保障
        if (!successful && Utils.isLocalhost(rpcItem.url)) {
            this.disable();
            chrome.downloads.download({ url: downloadItem.url }).then(() => this.enable());
        }
    }

    /**
     * 显示来自其他扩展下载任务的提示
     */
    #showCaptureReminder(downloadItem) {
        const config = this.configService.get();

        if (!config.remindCaptureTip || downloadItem.byExtensionId === chrome.runtime.id) {
            return;
        }

        const title = chrome.i18n.getMessage("RemindCaptureTip");
        const message = chrome.i18n.getMessage("RemindCaptureTipDes");
        const btnTitle1 = chrome.i18n.getMessage("Dismiss");
        const btnTitle2 = chrome.i18n.getMessage("NeverRemind");
        const buttons = [{ title: btnTitle1 }, { title: btnTitle2 }];

        Utils.showNotification(
            { title, message, buttons, requireInteraction: true },
            "NID_CAPTURED_OTHERS"
        );
    }

    /**
     * 判断当前下载项是否应当被拦截
     * 检查包括：Alt 键状态、协议类型、站点黑白名单、文件扩展名黑白名单、文件体积大小
     */
    #shouldCapture(downloadItem) {
        const config = this.configService.get();

        // 1. 如果用户按住了 Alt 键，则不拦截
        if (this.altKeyPressed) {
            this.altKeyPressed = false;
            return false;
        }

        // 2. 检查下载状态与协议类型（HTTP/HTTPS/SFTP）
        if (downloadItem.error ||
            downloadItem.state !== "in_progress" ||
            !/^(https?|s?ftp):/i.test(downloadItem.url)) {
            return false;
        }

        // 3. 避免拦截自身触发的下载
        if (downloadItem.byExtensionId === chrome.runtime.id) {
            return false;
        }

        // 4. 检查扩展黑白名单
        if (downloadItem.byExtensionId &&
            !config.allowedSites.includes(downloadItem.byExtensionId) &&
            (config.blockedSites.includes("*") ||
                config.blockedSites.includes(downloadItem.byExtensionId))) {
            return false;
        }

        const currentTabUrl = new URL(this.currentTabUrl);
        const url = new URL(downloadItem.referrer || downloadItem.url);

        // 5. 检查网站白名单（命中则直接拦截）
        for (const pattern of config.allowedSites) {
            if (this.#matchRule(currentTabUrl.hostname, pattern) ||
                this.#matchRule(url.hostname, pattern)) {
                return true;
            }
        }

        // 6. 检查网站黑名单（命中则不拦截）
        for (const pattern of config.blockedSites) {
            if (this.#matchRule(currentTabUrl.hostname, pattern) ||
                this.#matchRule(url.hostname, pattern)) {
                return false;
            }
        }

        // 7. 检查扩展名白名单（命中则直接拦截）
        for (const ext of config.allowedExts) {
            if (downloadItem.filename.endsWith(ext) || ext === "*") {
                return true;
            }
        }

        // 8. 检查扩展名黑名单（命中则不拦截）
        for (const ext of config.blockedExts) {
            if (downloadItem.filename.endsWith(ext) || ext === "*") {
                return false;
            }
        }

        // 9. 检查文件体积门限阈值（≥ N MB）
        return downloadItem.fileSize >= config.fileSize * 1024 * 1024;
    }

    /**
     * 通配符规则匹配方法
     */
    #matchRule(str, rule) {
        return new RegExp("^" + rule.replaceAll('*', '.*') + "$").test(str);
    }
}
