/**
 * Aria2-Next Options Manager
 * Extracted from AriaNg options and aligned with aria2-next option specifications.
 * @see https://github.com/AnInsomniacy/aria2-next
 */
const globalExclusiveOptions = [
    "download-result",
    "keep-unfinished-download-result",
    "log",
    "log-level",
    "console-log-level",
    "log-max-size",
    "log-max-files",
    "max-concurrent-downloads",
    "max-download-result",
    "max-overall-download-limit",
    "max-overall-upload-limit",
    "save-cookies",
    "save-session",
    "save-session-interval",
    "state-dir",
    "state-save-interval",
    "stop",
    "stop-with-process",
    "summary-interval"
];

class Aria2Options {

    /**
     * Extract Aria2-Next global options from ariaNG options
     * 
     * Caution: The Aria2 options is extracted from ariaNG settings by its RPC URL, so an Aria2 server
     *          with same RPC URL but different options will be treated as the same one. 
     * 
     * @param {string} rpcUrl the whole Aria2 RPC url
     * 
     * @return {Promise<Object>} Aria2 global options promise
     */
    static async getGlobalOptions(rpcUrl) {
        const localStorage = await chrome.storage.local.get('ariaNgOptions');
        const ariaNgOptions = localStorage.ariaNgOptions;
        let aria2SettingsMap = {};

        if (!ariaNgOptions) return {};
        try {
            /* Build [{rpcHost: rpcOptions}] maps array */
            ariaNgOptions.rpcHost = ariaNgOptions.rpcHost.replace(/localhost|127\.0\.0\.1|\[::1\]/i, "localhost");
            let key = ariaNgOptions.rpcHost + ':' + ariaNgOptions.rpcPort + '/' + ariaNgOptions.rpcInterface;
            aria2SettingsMap[key] = ariaNgOptions.rpcOptions || {};
            for (const rpcServer of ariaNgOptions.extendRpcServers) {
                key = rpcServer.rpcHost + ':' + rpcServer.rpcPort + '/' + rpcServer.rpcInterface;
                aria2SettingsMap[key] = rpcServer.rpcOptions || {};
            }
            /* Build map key */
            let url = new URL(rpcUrl);
            url.host = url.host.replace(/localhost|127\.0\.0\.1|\[::1\]/i, "localhost");
            rpcUrl = url.host + url.pathname;
        } catch (e) {
            return {};
        }
        return aria2SettingsMap[rpcUrl] || {};
    }

    /**
     * Extract Aria2-Next global only options from ariaNG options
     *  
     * @param {string} rpcUrl the whole Aria2 RPC url
     * 
     * @return {Promise<Object>} Aria2 global only options
     */
    static async getGlobalOnlyOptions(rpcUrl) {
        let globalOnlyOptions = await Aria2Options.getGlobalOptions(rpcUrl);

        for (const key of Object.keys(globalOnlyOptions)) {
            if (!globalExclusiveOptions.includes(key)) {
                delete globalOnlyOptions[key];
            }
        }
        return globalOnlyOptions;
    }

    /**
     * Extract Aria2-Next task options from ariaNG options
     *  
     * @param {string} rpcUrl the whole Aria2 RPC url
     * 
     * @return {Promise<Object>} Aria2 task options
     */
    static async getTaskOptions(rpcUrl) {
        let taskOptions = await Aria2Options.getGlobalOptions(rpcUrl);

        for (const key of Object.keys(taskOptions)) {
            if (globalExclusiveOptions.includes(key)) {
                delete taskOptions[key];
            }
        }
        return taskOptions;
    }

    /**
     * Extract Aria2-Next URI type task options from ariaNG options
     * Protocol-aware filtering for BitTorrent, ED2K, Metalink, and HTTP/HTTPS/SFTP tasks.
     *  
     * @param {string} rpcUrl the whole Aria2 RPC url
     * @param {string} [uri] the download URI (optional, for protocol-specific filtering)
     * 
     * @return {Promise<Object>} Aria2 task options
     */
    static async getUriTaskOptions(rpcUrl, uri = "") {
        let taskOptions = await Aria2Options.getGlobalOptions(rpcUrl);

        const isMagnetOrBt = /^(magnet:|\.torrent(\?.*)?$)/i.test(uri);
        const isEd2k = /^ed2k:/i.test(uri);

        for (const key of Object.keys(taskOptions)) {
            if (globalExclusiveOptions.includes(key)) {
                delete taskOptions[key];
                continue;
            }

            if (isMagnetOrBt) {
                // Keep bt-* options, strip ed2k-*
                if (/^ed2k-.+/i.test(key)) {
                    delete taskOptions[key];
                }
            } else if (isEd2k) {
                // Keep ed2k-* options, strip bt-* and metalink-*
                if (/^(bt|metalink)-.+/i.test(key)) {
                    delete taskOptions[key];
                }
            } else {
                // Standard HTTP/HTTPS/SFTP/Media: strip bt-*, metalink-*, and ed2k-*
                if (/^(bt|metalink|ed2k)-.+/i.test(key)) {
                    delete taskOptions[key];
                }
            }
        }
        return taskOptions;
    }
}

export default Aria2Options;
