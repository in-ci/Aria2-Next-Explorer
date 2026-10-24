/**
 * ==============================================================================
 * 页面标题格式化工具
 * ==============================================================================
 * 全面兼容原版 AriaNg 标题通配符与扩展修饰标签：
 * ${title} - 应用名称 (DownHub)
 * ${rpcprofile} - 当前 RPC 服务端别名
 * ${downloading} - 正在下载任务数 (支持 :noprefix)
 * ${waiting} - 正在等待任务数 (支持 :noprefix)
 * ${stopped} - 已停止/已完成任务数 (支持 :noprefix)
 * ${downspeed} - 下载速度 (支持 :noprefix, :nosuffix, :scale=n)
 * ${upspeed} - 上传速度 (支持 :noprefix, :nosuffix, :scale=n)
 *
 * 修饰标签说明：
 * - noprefix: 忽略前缀（如 "下载: "、"正在下载: "）
 * - nosuffix: 忽略后缀（如 "/s"）
 * - scale=n: 指定保留小数位数（例如 scale=1 保留一位小数）
 * 示例：${downspeed:noprefix:nosuffix:scale=1} -> 0.0 B 或 1.2 MB
 * ==============================================================================
 */

import { currentLang } from "../i18n";
import { formatBytes } from "./format";

/**
 * 解析占位符标签（例如 ${downspeed:noprefix:nosuffix:scale=1}）
 * @param {string} rawTag 完整占位符字符串
 * @returns {object} 解析后的标签映射
 */
function parsePlaceholderTags(rawTag) {
  if (!rawTag) return {};
  const content = rawTag.substring(2, rawTag.length - 1);
  const parts = content.split(":");
  const result = { oldValue: rawTag };

  for (let i = 1; i < parts.length; i++) {
    const kv = parts[i].split("=");
    if (kv.length === 1) {
      result[kv[0]] = true;
    } else if (kv.length === 2) {
      result[kv[0]] = kv[1];
    }
  }
  return result;
}

/**
 * 替换单个占位符
 * @param {string} text 模板文本
 * @param {object} item 占位符配置与解析参数
 * @returns {string} 替换后的文本
 */
function replacePlaceholder(text, item) {
  let val = item.value;
  if (item.type === "volume") {
    const scale = item.scale !== undefined ? Number(item.scale) : undefined;
    val = formatBytes(val, scale !== undefined ? scale : 2, scale !== undefined);
  }
  if (item.prefix && !item.noprefix) {
    val = item.prefix + val;
  }
  if (item.suffix && !item.nosuffix) {
    val = val + item.suffix;
  }
  return text.replaceAll(item.oldValue, val);
}

/**
 * 匹配并替换指定名称的所有通配符实例 (包含支持标签)
 * @param {string} text 模板文本
 * @param {string} name 占位符名称 (例如 'downspeed')
 * @param {object} config 默认配置 (prefix, value, type, suffix 等)
 * @returns {string}
 */
function processPlaceholder(text, name, config) {
  const regex = new RegExp(`\\$\\{${name}(:[a-zA-Z0-9]+(=[a-zA-Z0-9]+)?)*\\}`, "g");
  const matches = text.match(regex);
  if (matches && matches.length > 0) {
    for (let k = 0; k < matches.length; k++) {
      const parsed = parsePlaceholderTags(matches[k]);
      Object.assign(parsed, config);
      text = replacePlaceholder(text, parsed);
    }
  }
  return text;
}

export function formatPageTitle(pattern, stat = {}, rpcAlias = "") {
  let title = pattern || "${downspeed}, ${upspeed} - ${title}";
  const isZh = currentLang.value === "zh_CN";

  const downPrefix = isZh ? "下载: " : "Download: ";
  const upPrefix = isZh ? "上传: " : "Upload: ";
  const downCountPrefix = isZh ? "正在下载: " : "Downloading: ";
  const waitCountPrefix = isZh ? "正在等待: " : "Waiting: ";
  const stopCountPrefix = isZh ? "已完成 / 已停止: " : "Finished / Stopped: ";

  title = processPlaceholder(title, "title", { value: "DownHub" });
  title = processPlaceholder(title, "rpcprofile", { value: rpcAlias || "Aria2-Next" });
  title = processPlaceholder(title, "downloading", { prefix: downCountPrefix, value: stat.numActive || 0 });
  title = processPlaceholder(title, "waiting", { prefix: waitCountPrefix, value: stat.numWaiting || 0 });
  title = processPlaceholder(title, "stopped", { prefix: stopCountPrefix, value: stat.numStopped || 0 });
  title = processPlaceholder(title, "downspeed", { prefix: downPrefix, value: stat.downloadSpeed || 0, type: "volume", suffix: "/s" });
  title = processPlaceholder(title, "upspeed", { prefix: upPrefix, value: stat.uploadSpeed || 0, type: "volume", suffix: "/s" });

  return title;
}
