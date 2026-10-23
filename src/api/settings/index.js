/**
 * ==============================================================================
 * 下载设置选项汇总导出入口
 * ==============================================================================
 */

import { basicOptions } from "./basic.js";
import { httpOptions } from "./http.js";
import { sftpOptions } from "./sftp.js";
import { bittorrentOptions } from "./bittorrent.js";
import { ed2kOptions } from "./ed2k.js";
import { mediaOptions } from "./media.js";
import { metalinkOptions } from "./metalink.js";
import { rpcOptions } from "./rpc.js";
import { advancedOptions } from "./advanced.js";

export {
  basicOptions,
  httpOptions,
  sftpOptions,
  bittorrentOptions,
  ed2kOptions,
  mediaOptions,
  metalinkOptions,
  rpcOptions,
  advancedOptions
};

export const categoriesMap = {
  basic: { id: "basic", titleKey: "Basic Settings", options: basicOptions },
  http: { id: "http", titleKey: "HTTP Settings", options: httpOptions },
  sftp: { id: "sftp", titleKey: "SFTP Settings", options: sftpOptions },
  bt: { id: "bt", titleKey: "BitTorrent Settings", options: bittorrentOptions },
  ed2k: { id: "ed2k", titleKey: "ED2K Settings", options: ed2kOptions },
  media: { id: "media", titleKey: "Media Stream Settings", options: mediaOptions },
  metalink: { id: "metalink", titleKey: "Metalink Settings", options: metalinkOptions },
  rpc: { id: "rpc", titleKey: "RPC Settings", options: rpcOptions },
  advanced: { id: "advanced", titleKey: "Advanced Settings", options: advancedOptions }
};

/**
 * 根据分类 ID 获取该分类下的选项列表
 * @param {string} category 分类标识 (basic, http, sftp, bt, ed2k, media, metalink, rpc, advanced)
 * @returns {Array} 选项数组
 */
export function getCategoryOptions(category) {
  const cat = categoriesMap[category];
  return cat ? cat.options : [];
}

/**
 * 获取所有设置项汇总扁平数组
 */
export function getAllSettingsOptions() {
  return [
    ...basicOptions,
    ...httpOptions,
    ...sftpOptions,
    ...bittorrentOptions,
    ...ed2kOptions,
    ...mediaOptions,
    ...metalinkOptions,
    ...rpcOptions,
    ...advancedOptions
  ];
}
