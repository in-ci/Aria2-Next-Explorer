/**
 * Click Checker — 内容脚本（运行在隔离环境 ISOLATED world）
 * 功能：
 * 1. 拦截页面中的 Magnet 磁力链接与 ED2K 电驴链接点击，并直接转发给 Aria2-Next 下载。
 * 2. 监测 Alt 键点击状态，配合实现“按住 Alt 键跳过下载拦截”的功能。
 */
(() => {
  "use strict";

  // 状态标记
  let captureMagnet = false;
  let checkClick = false;

  /**
   * 更新当前配置状态
   */
  function updateConfig(config) {
    captureMagnet = Boolean(config?.captureMagnet);
    checkClick = Boolean(config?.integration !== false && config?.checkClick);
  }

  // 从扩展本地存储中读取初始配置
  chrome.storage.local.get(
    ["captureMagnet", "checkClick", "integration"],
    (config) => {
      updateConfig(config);
    },
  );

  // 监听实时配置变动，动态响应开关
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (
      "captureMagnet" in changes ||
      "checkClick" in changes ||
      "integration" in changes
    ) {
      chrome.storage.local.get(
        ["captureMagnet", "checkClick", "integration"],
        (config) => {
          updateConfig(config);
        },
      );
    }
  });

  // 在捕获阶段（Capture Phase）监听页面全局点击事件，先于宿主页面内部逻辑触发
  document.addEventListener(
    "click",
    (event) => {
      // 如果开启了磁力/电驴链接拦截
      if (captureMagnet) {
        const anchor = event.target.closest?.("a[href]");
        if (anchor) {
          const href = (
            anchor.getAttribute("href") ||
            anchor.href ||
            ""
          ).trim();

          // 匹配磁力链接 (magnet:) 或电驴链接 (ed2k:)
          if (/^(magnet|ed2k):/i.test(href)) {
            // 阻止网页默认行为与事件冒泡
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            let filename = "";

            // 解析 ED2K 链接中的文件名: ed2k://|file|filename|size|hash|/
            if (/^ed2k:/i.test(href)) {
              const match = href.match(/\|file\|([^|]+)\|/i);
              if (match) {
                try {
                  filename = decodeURIComponent(match[1]);
                } catch {
                  filename = match[1];
                }
              }
            }
            // 解析 Magnet 链接中的文件名参数 dn
            else if (/^magnet:/i.test(href)) {
              try {
                const params = new URLSearchParams(
                  href.replace(/^magnet:\?/i, ""),
                );
                filename = params.get("dn") || "";
              } catch {}
            }

            // 发送下载请求至后台服务
            chrome.runtime.sendMessage({
              type: "DOWNLOAD",
              data: {
                filename,
                url: anchor.href || href,
                referrer: window.location.href,
              },
            });
            return;
          }
        }
      }

      // 监测 Alt+Click 组合键点击事件
      if (checkClick) {
        chrome.runtime.sendMessage({
          type: "CLICK_EVENT",
          data: { altKeyPressed: event.altKey },
        });
      }
    },
    true,
  );
})();
