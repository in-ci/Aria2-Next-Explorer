/**
 * DownloadManager - 下载管理器，处理所有与下载核心相关的调度与转发逻辑
 */
import Utils from "../utils.js";
import Logger from "../logger.js";
import Aria2 from "../aria2.js";
import Aria2Options from "../aria2Options.js";
import { ConfigService } from "../services/ConfigService.js";

export class DownloadManager {
    constructor(uiManager, notificationManager) {
        this.configService = ConfigService.getInstance();
        this.uiManager = uiManager;
        this.notificationManager = notificationManager;
    }

    /**
     * 执行下载任务
     * @param {Object} downloadItem - 下载项（包含 url, filename, referrer, dir 等）
     * @param {Object} [rpcItem] - RPC 服务器配置项（可选，若未指定则自动通过规则匹配）
     * @returns {Promise<boolean>} 是否处理成功
     */
    async download(downloadItem, rpcItem) {
        if (!downloadItem?.url) {
            Logger.warn("Download: 无效的下载项，已忽略下载请求！");
            return false;
        }

        // 判断是否为包含多链接的批量下载
        downloadItem.multiTask = downloadItem.multiTask ?? downloadItem.url.includes('\n');

        // 如果明确指定通过浏览器原生下载
        if (downloadItem.type === "DOWNLOAD_VIA_BROWSER") {
            return await this.#downloadViaBrowser(downloadItem);
        }

        // 匹配目标 RPC 服务器配置
        rpcItem = rpcItem || this.getRpcServer(downloadItem.url + downloadItem.filename);
        downloadItem.dir = rpcItem.location;
        downloadItem.filename = downloadItem.filename || '';

        const config = this.configService.get();
        // 如果开启了“自动下载前询问参数”或属于批量多链接任务，弹出前端界面供用户确认
        if (config.askBeforeDownload || downloadItem.multiTask) {
            try {
                await this.uiManager.launchUI(downloadItem);
                return true;
            } catch (error) {
                Logger.warn("Download: 唤起用户界面失败。");
                return false;
            }
        }

        // 直接转发至 Aria2-Next 下载核心
        return await this.send2Aria(downloadItem, rpcItem);
    }

    /**
     * 通过浏览器原生下载接口下载
     */
    async #downloadViaBrowser(downloadItem) {
        try {
            if (downloadItem.multiTask) {
                const urls = downloadItem.url.split('\n');
                for (const url of urls) {
                    await chrome.downloads.download({ url });
                }
            } else {
                await chrome.downloads.download({
                    url: downloadItem.url,
                    filename: downloadItem.filename
                });
            }
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 发送下载任务至 Aria2-Next 核心
     * @param {Object} downloadItem - 下载数据对象
     * @param {Object} rpcItem - 目标 RPC 服务器配置
     * @returns {Promise<boolean>}
     */
    async send2Aria(downloadItem, rpcItem) {
        let cookieItems = [];
        // 仅针对标准 HTTP/HTTPS 链接采集当前站点 Cookie，避免非网页协议（如 ed2k/magnet）报错
        const isStandardWebUri = /^https?:/i.test(downloadItem.url);
        if (isStandardWebUri && (rpcItem.ignoreInsecure || Utils.isLocalhost(rpcItem.url) || /^(https|wss)/i.test(rpcItem.url))) {
            cookieItems = await Utils.getCookies(downloadItem);
        }

        // 构造请求头（包含 Cookie、User-Agent 等）
        const headers = this.#buildHeaders(cookieItems);
        // 构造 Aria2-Next 任务选项
        const options = await this.#buildAria2Options(downloadItem, rpcItem, headers);

        // 解析 RPC 服务器地址与密钥
        const remote = Utils.parseUrl(rpcItem.url);
        remote.name = rpcItem.name;
        const aria2 = new Aria2(remote);

        try {
            // 调用 aria2.addUri 接口添加任务
            const response = await aria2.addUri(downloadItem.url, options);

            if (response?.error) {
                throw response.error;
            }

            // 同步全局选项（如果配置中存在）
            await this.#setGlobalOptions(aria2, rpcItem.url);

            // 构造任务完成通知信息并展示成功弹窗
            const contextMessage = this.#buildContextMessage(downloadItem, options);
            this.notificationManager.notifyTaskStatus({
                method: "aria2.onExportSuccess",
                source: aria2,
                gid: response.result,
                contextMessage
            });

            return true;
        } catch (error) {
            const contextMessage = this.#parseErrorMessage(error);
            this.notificationManager.notifyTaskStatus({
                method: "aria2.onExportError",
                source: aria2,
                contextMessage
            });
            return false;
        }
    }

    /**
     * 构造请求头数组
     * @param {Array<string>} cookieItems - Cookie 项列表
     * @returns {Array<string>}
     */
    #buildHeaders(cookieItems) {
        const headers = [];
        if (cookieItems.length > 0) {
            headers.push("Cookie: " + cookieItems.join("; "));
        }
        headers.push("User-Agent: " + navigator.userAgent);
        return headers;
    }

    /**
     * 构造 Aria2-Next 任务选项
     * 结合用户全局选项与当前下载任务参数，并利用 aria2-next 的新特性（如 filename-hint）
     */
    async #buildAria2Options(downloadItem, rpcItem, headers) {
        // 基于目标协议类型（HTTP/BT/ED2K）过滤专有选项
        let options = await Aria2Options.getUriTaskOptions(rpcItem.url, downloadItem.url);

        // 合并用户自定义请求头
        if (options.header) {
            const existingHeaders = options.header.split('\n')
                .filter(item => !/^(cookie|user-agent|connection)/i.test(item));
            options.header = [...headers, ...existingHeaders];
        } else if (headers.length > 0) {
            options.header = headers;
        }

        // 设置 Referer 来源
        if (downloadItem.referrer && !/^about:blank$/i.test(downloadItem.referrer)) {
            options.referer = downloadItem.referrer;
        }

        // Aria2-Next 新特性支持：设置输出文件名及浏览器文件名提示（filename-hint）
        if (downloadItem.filename) {
            options.out = downloadItem.filename;
            // aria2-next 原生支持 filename-hint，配合 filename-hint-source=browser 智能选择最佳文件名
            options["filename-hint"] = downloadItem.filename;
            options["filename-hint-source"] = "browser";
        }

        // 设置保存目录
        if (downloadItem.dir) {
            options.dir = downloadItem.dir;
        }

        // 合并传入的额外选项
        if (downloadItem.options) {
            Object.assign(options, downloadItem.options);
        }

        return options;
    }

    /**
     * 同步全局选项至下载核心
     */
    async #setGlobalOptions(aria2, rpcUrl) {
        const globalOptions = await Aria2Options.getGlobalOptions(rpcUrl);
        if (Object.keys(globalOptions).length > 0) {
            aria2.setGlobalOptions(globalOptions);
        }
    }

    /**
     * 构造提示通知中的文件路径信息
     */
    #buildContextMessage(downloadItem, options) {
        const filename = downloadItem.filename || Utils.getFileNameFromUrl(downloadItem.url);
        const dir = options.dir ? Utils.formatFilepath(options.dir) : '';
        return dir + (filename || downloadItem.url);
    }

    /**
     * 解析并汉化 RPC 错误信息
     */
    #parseErrorMessage(error) {
        if (!error?.message) return '';

        const msg = error.message.toLowerCase();
        if (msg.includes('unauthorized')) {
            return "RPC 密钥（Secret Key）错误，未通过身份验证。";
        } else if (msg.includes("failed to fetch")) {
            return "Aria2-Next 服务器无法连接，请确认核心已在后台运行。";
        }
        return "错误: " + error.message;
    }

    /**
     * 根据 URL 匹配对应的 RPC 服务器配置（根据通配符路由）
     * @param {string} url - 待匹配的下载 URL 或文件名
     * @returns {Object} 匹配到的 RPC 配置对象
     */
    getRpcServer(url) {
        const config = this.configService.get();
        const rpcList = config.rpcList;

        let defaultIndex = 0;
        for (let i = 1; i < rpcList.length; i++) {
            const patternStr = rpcList[i].pattern;
            if (patternStr === '*') {
                defaultIndex = i;
                continue;
            }

            const patterns = patternStr.split(',');
            for (let pattern of patterns) {
                pattern = pattern.trim();
                if (this.#matchRule(url, pattern)) {
                    return rpcList[i];
                }
            }
        }

        return rpcList[defaultIndex];
    }

    /**
     * 匹配通配符规则（支持 * 任意匹配）
     */
    #matchRule(str, rule) {
        return new RegExp("^" + rule.replaceAll('*', '.*') + "$").test(str);
    }
}
