/**
 * ==============================================================================
 * 页面标题格式化工具
 * ==============================================================================
 * 兼容原版 AriaNg 标题通配符：
 * ${title} - 应用名称 (DownHub)
 * ${downspeed} - 下载速度 (带单位)
 * ${upspeed} - 上传速度 (带单位)
 * ${downloading} - 正在下载任务数
 * ${waiting} - 正在等待任务数
 * ${stopped} - 已停止/已完成任务数
 * ${rpcprofile} - 当前 RPC 服务端别名
 * ==============================================================================
 */

import { currentLang } from "../i18n";
import { formatSpeed } from "./format";

export function formatPageTitle(pattern, stat = {}, rpcAlias = "") {
  const tpl = pattern || "${downspeed}, ${upspeed} - ${title}";
  const isZh = currentLang.value === "zh_CN";

  const downPrefix = isZh ? "下载: " : "Download: ";
  const upPrefix = isZh ? "上传: " : "Upload: ";
  const downCountPrefix = isZh ? "正在下载: " : "Downloading: ";
  const waitCountPrefix = isZh ? "正在等待: " : "Waiting: ";
  const stopCountPrefix = isZh ? "已完成 / 已停止: " : "Finished / Stopped: ";

  let title = tpl;
  title = title.replace(/\$\{title\}/g, "DownHub");
  title = title.replace(/\$\{downspeed\}/g, `${downPrefix}${formatSpeed(stat.downloadSpeed || 0)}`);
  title = title.replace(/\$\{upspeed\}/g, `${upPrefix}${formatSpeed(stat.uploadSpeed || 0)}`);
  title = title.replace(/\$\{downloading\}/g, `${downCountPrefix}${stat.numActive || 0}`);
  title = title.replace(/\$\{waiting\}/g, `${waitCountPrefix}${stat.numWaiting || 0}`);
  title = title.replace(/\$\{stopped\}/g, `${stopCountPrefix}${stat.numStopped || 0}`);
  title = title.replace(/\$\{rpcprofile\}/g, rpcAlias || "Aria2-Next");

  return title;
}
