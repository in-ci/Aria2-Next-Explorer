/**
 * Export all downloaded resource links
 * 提取并导出页面上的所有资源下载链接（支持 HTTP/HTTPS/SFTP、Magnet 磁力、ED2K 电驴链接等）
 *
 * @param {Array} allowedExts - 允许的文件扩展名白名单列表
 * @param {Array} blockedExts - 禁止的文件扩展名黑名单列表
 * @returns {void}
 */
export function exportAllLinks(allowedExts, blockedExts) {
  if (!Array.isArray(allowedExts)) allowedExts = [];
  if (!Array.isArray(blockedExts)) blockedExts = [];

  const links = [];
  // 扫描页面所有链接、媒体和嵌入标签
  const elements = document.querySelectorAll(
    "a,img,audio,video,source,enclosure",
  );

  for (const element of elements) {
    let link = "";
    const tagName = element.tagName.toUpperCase();
    let srcProp = "";

    try {
      switch (tagName) {
        case "A":
          srcProp = "href";
          break;
        case "ENCLOSURE":
          srcProp = "url";
          break;
        default:
          srcProp = "src";
      }

      if (element[srcProp]) {
        link = element[srcProp];
      } else if (element.attributes[srcProp]) {
        link = element.attributes[srcProp].value;
      } else {
        continue;
      }

      link = (link || "").trim();
      if (!link) continue;

      // 优先检查 ED2K 链接（避免 new URL() 因管道符 '|' 抛出 Invalid URL 异常）
      if (/^ed2k:\/\//i.test(link)) {
        if (!links.includes(link)) {
          links.push(link);
        }
        continue;
      }

      // 优先检查 Magnet 磁力链接
      if (/^magnet:\?/i.test(link)) {
        if (!links.includes(link)) {
          links.push(link);
        }
        continue;
      }

      // 解析常规网络 URL
      const url = new URL(link);
      const filename = url.pathname.split("/").pop();
      const ext = filename.includes(".") ? filename.split(".").pop() : "";
      let valid = false;

      // 媒体流或媒体标签链接
      if (
        /VIDEO|AUDIO|SOURCE/.test(tagName) &&
        url.protocol.startsWith("http")
      ) {
        valid = true;
      } else if (/^(http|ftp|sftp)/.test(url.protocol)) {
        // 判断文件扩展名白名单/黑名单
        if (allowedExts.includes(ext) || allowedExts.includes("*")) {
          valid = true;
        } else if (blockedExts.includes(ext) || blockedExts.includes("*")) {
          valid = false;
        } else if (tagName === "IMG") {
          // 图片按分辨率过滤较大尺寸
          if (element.naturalWidth >= 400 && element.naturalHeight >= 300) {
            valid = true;
          }
        } else if (ext) {
          // 过滤普通网页文件
          if (
            /^[\da-z]{1,8}$/i.test(ext) &&
            !/^(htm|asp|php|cgi|xml|js|css|do|\d+$)/i.test(ext)
          ) {
            valid = true;
          }
        }
      }

      if (valid && !links.includes(link)) {
        links.push(link);
      }
    } catch (e) {
      console.warn("DownloadAllLinks: 发现无效 URL，已跳过。URL =", link);
    }
  }

  // 发现有效链接则发送批量下载请求，否则给出提示
  if (links.length > 0) {
    const downloadItem = {
      filename: "",
      url: links.join("\n"),
      referrer: window.location.href,
      askBeforeDownload: true,
      multiTask: true,
    };
    chrome.runtime.sendMessage({ type: "EXPORT_ALL", data: downloadItem });
  } else {
    setTimeout(() => {
      if (document.hasFocus()) {
        alert(
          "\nAria2-Next Explorer: " +
            chrome.i18n.getMessage("exportAllFailedDes"),
        );
      }
    }, 300);
  }
}

export default exportAllLinks;
