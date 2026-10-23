/**
 * ==============================================================================
 * 高性能格式化工具集 (Format Utils)
 * ==============================================================================
 * 全面淘汰 Moment.js，基于现代 Chromium/Edge 原生原生能力实现，零内存泄漏与高帧率。
 * ==============================================================================
 */

import { t } from "../i18n";

/**
 * 将字节数格式化为易读的容量单位 (B, KB, MB, GB, TB)
 * @param {number|string} bytes 字节数值
 * @param {number} decimals 保留小数位数
 * @returns {string} 格式化后的字符串
 */
export function formatBytes(bytes, decimals = 2) {
  const num = Number(bytes);
  if (!num || isNaN(num) || num <= 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(num) / Math.log(k));

  if (i >= sizes.length) {
    return (num / Math.pow(k, sizes.length - 1)).toFixed(dm) + " " + sizes[sizes.length - 1];
  }

  return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * 格式化传输速度
 * @param {number|string} speedBytesPerSec 每秒字节数
 * @returns {string} 例如 "12.5 MB/s"
 */
export function formatSpeed(speedBytesPerSec) {
  return `${formatBytes(speedBytesPerSec)}/s`;
}

/**
 * 格式化剩余秒数为时间显示 (HH:mm:ss 或 DD天 HH:mm:ss)
 * @param {number|string} totalSeconds 剩余秒数
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  const sec = parseInt(totalSeconds, 10);
  if (isNaN(sec) || sec < 0) return "--:--:--";
  if (sec >= 86400 * 30) return t("More Than One Day");

  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const pad = (n) => String(n).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * 格式化百分比
 * @param {number|string} percent 百分比数值 (0 - 100)
 * @param {number} decimals 小数位数
 * @returns {string} 例如 "85.42%"
 */
export function formatPercent(percent, decimals = 2) {
  const p = parseFloat(percent);
  if (isNaN(p) || p <= 0) return "0%";
  if (p >= 100) return "100%";
  return p.toFixed(decimals) + "%";
}

/**
 * 格式化时间戳（毫秒或秒）
 * @param {number|string} timestamp 时间戳
 * @returns {string} 格式化日期时间
 */
export function formatDate(timestamp) {
  if (!timestamp) return "-";
  let ms = Number(timestamp);
  if (ms < 1e11) ms *= 1000; // 秒转毫秒
  const d = new Date(ms);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("default", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}

/**
 * 解析 Aria2 的十六进制 bitfield 字符串为 boolean 数组
 * @param {string} bitfieldHex 十六进制 bitfield
 * @param {number} totalPieces 分片总数
 * @returns {boolean[]} 每个分片的完成状态
 */
export function parseBitfield(bitfieldHex, totalPieces) {
  if (!bitfieldHex || totalPieces <= 0) return [];
  const pieces = new Array(totalPieces);
  let pieceIndex = 0;

  for (let i = 0; i < bitfieldHex.length && pieceIndex < totalPieces; i++) {
    const val = parseInt(bitfieldHex[i], 16);
    for (let b = 3; b >= 0 && pieceIndex < totalPieces; b--) {
      pieces[pieceIndex++] = (val & (1 << b)) !== 0;
    }
  }

  return pieces;
}
