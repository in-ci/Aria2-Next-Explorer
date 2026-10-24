/**
 * ==============================================================================
 * 下载设置选项汇总导出入口
 * ==============================================================================
 * 严格依据 aria2-next-3.0.9 支持的 9 大 Tags 重构：
 * #basic #http #file #bittorrent #metalink #ed2k #media #rpc #advanced
 * ==============================================================================
 */

import { basicOptions } from "./basic.js";
import { httpOptions } from "./http.js";
import { fileOptions } from "./file.js";
import { bittorrentOptions } from "./bittorrent.js";
import { metalinkOptions } from "./metalink.js";
import { ed2kOptions } from "./ed2k.js";
import { mediaOptions } from "./media.js";
import { rpcOptions } from "./rpc.js";
import { advancedOptions } from "./advanced.js";

export {
  basicOptions,
  httpOptions,
  fileOptions,
  bittorrentOptions,
  metalinkOptions,
  ed2kOptions,
  mediaOptions,
  rpcOptions,
  advancedOptions,
};

export const categoriesMap = {
  basic: { id: "basic", titleKey: "Basic Settings", options: basicOptions },
  http: { id: "http", titleKey: "HTTP Settings", options: httpOptions },
  file: { id: "file", titleKey: "File Settings", options: fileOptions },
  bt: { id: "bt", titleKey: "BitTorrent Settings", options: bittorrentOptions },
  bittorrent: { id: "bt", titleKey: "BitTorrent Settings", options: bittorrentOptions },
  metalink: { id: "metalink", titleKey: "Metalink Settings", options: metalinkOptions },
  ed2k: { id: "ed2k", titleKey: "ED2K Settings", options: ed2kOptions },
  media: { id: "media", titleKey: "Media Stream Settings", options: mediaOptions },
  rpc: { id: "rpc", titleKey: "RPC Settings", options: rpcOptions },
  advanced: { id: "advanced", titleKey: "Advanced Settings", options: advancedOptions },
  // 兼容旧版 sftp 别名路径，自动映射至 http 分类
  sftp: { id: "http", titleKey: "HTTP Settings", options: httpOptions },
};

/**
 * 根据分类 ID 获取该分类下的选项列表
 * @param {string} category 分类标识 (basic, http, file, bt, metalink, ed2k, media, rpc, advanced)
 * @returns {Array} 选项数组
 */
export function getCategoryOptions(category) {
  const cat = categoriesMap[category];
  return cat ? cat.options : [];
}

/**
 * 获取所有设置项汇总扁平数组 (共 162 项)
 */
export function getAllSettingsOptions() {
  return [
    ...basicOptions,
    ...httpOptions,
    ...fileOptions,
    ...bittorrentOptions,
    ...metalinkOptions,
    ...ed2kOptions,
    ...mediaOptions,
    ...rpcOptions,
    ...advancedOptions,
  ];
}
