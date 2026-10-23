# Aria2-Next Explorer

<div align="center">

![Logo](images/logo128.png)

**基于现代化 Aria2-Next 核心构建的浏览器全能下载扩展**

[![许可证](https://img.shields.io/badge/license-BSD--3--Clause-green.svg)](LICENSE)
[![版本](https://img.shields.io/badge/version-3.0.0-gold.svg)](manifest.json)
[![Aria2-Next](https://img.shields.io/badge/Engine-aria2--next-blue.svg)](https://github.com/AnInsomniacy/aria2-next)

[English](./README.md) | [简体中文](#简体中文)

</div>

---

## 📖 简介

**Aria2-Next Explorer** 是一款专为现代化下载核心 [Aria2-Next](https://github.com/AnInsomniacy/aria2-next) 定制深度集成的浏览器扩展（Manifest V3）。

Aria2-Next 重新定义了新一代 aria2 引擎：全面重构了现代化网络底层（基于 Boost.Asio 与 libcurl / libtorrent / SQLite），原生支持 **ED2K（电驴）** 协议、现代化 **BitTorrent (v1/v2)**、以及 **HLS / DASH** 流媒体，并提供了智能的浏览器文件名提示（`filename-hint`）。

本插件可无缝接管浏览器下载，智能拦截 HTTP/HTTPS、SFTP、Magnet 磁力、ED2K 电驴链接，并内置美观的 Web 前端进行可视化任务管理。

---

## ✨ 核心特性

### 🎯 智能下载拦截与协议支持
- **全协议覆盖**：完整支持常规 HTTP/HTTPS、SFTP 下载，并原生拦截 **Magnet 磁力链接** 和 **ED2K 电驴链接**。
- **智能文件名提示**：深度适配 Aria2-Next 的 `filename-hint` 与 `filename-hint-source=browser` 特性，确保截获任务保留浏览器解析出的精确文件名。
- **文件与大小过滤**：根据文件体积阈值（≥ N MB）及文件扩展名白名单/黑名单精准决定是否拦截。
- **Alt 键快捷绕过**：按住 `Alt` 键点击链接直接走浏览器原生下载，无需临时关闭扩展。
- **协议选项智能适配**：针对 HTTP、BT、ED2K 等不同任务类型自动下发匹配的任务参数，杜绝因跨协议参数导致的 RPC 报错。

### 📊 实时状态监控与托盘指示
- **动态状态轮询**：实时监控活动、等待、已停止的任务数量及传输速率。
- **图标角标指示**：浏览器工具栏图标实时展示当前任务数量与下载速率。
- **多服务器聚合**：支持配置多个本地或远程 RPC 服务端，并聚合监控健康状态。

### 🎨 精美内置管理界面 (Web UI)
- **内置 AriaNg 界面**：开箱即用，无需额外搭建前端面板。
- **多种呈现形态**：支持作为弹窗（Popup）、独立新窗口（Window）、新标签页（Tab）或 Chrome 侧边栏（Side Panel）打开。
- **自适应深色模式**：支持跟随系统主题自动切换暗色/亮色外观。

### 🌐 右键菜单与批量导出
- **右键极速导出**：右键点击网页链接或选中的 Magnet/ED2K 文本，一键推送至 Aria2-Next。
- **一键提取页面所有链接**：自动扫描并批量导出当前网页中的全部资源（包括图片、音视频、文件链接、Magnet 与 ED2K）。
- **站点一键过滤**：右键快捷菜单快速将当前站点加入黑名单或白名单。

---

## 📦 一键打包支持 Microsoft Edge 浏览器

本项目内置针对 **Microsoft Edge**（以及所有主流 Chromium 内核浏览器）的一键打包脚本：

1. **一键双击打包 (Windows)**：
   - 直接双击运行项目根目录下 `scripts/package-edge.bat`。
2. **命令行打包**：
   ```bash
   node scripts/package-edge.js
   ```
3. **打包产物**（输出于 `dist/` 目录）：
   - `dist/Aria2-Next-Explorer-Edge/`：解压后的完整扩展目录，可直接加载开发测试。
   - `dist/Aria2-Next-Explorer-Edge-v3.0.0.zip`：打包压缩包，可直接用于分发或提交 Edge 外接程序中心。

### 💡 在 Edge 浏览器中安装测试

1. 打开 Edge 浏览器，地址栏访问：`edge://extensions/`；
2. 打开左侧边栏底部的 **【开发人员模式】** 开关；
3. 点击顶部的 **【加载解压缩的扩展】** 按钮；
4. 选择打包生成的 `dist/Aria2-Next-Explorer-Edge` 目录（或本项目根目录）；
5. 开启右上角扩展图标，即可立即享受全新的 Aria2-Next 下载体验！

---

## 🚀 配合本地 Aria2-Next 运行

本地 Aria2-Next 默认 RPC 服务监听在 `http://localhost:6800/jsonrpc`。

1. **启动本地核心**：
   - 运行本地 `aria2-next.exe --conf-path=aria2.conf` 或执行启动脚本（例如 `Aria2_Start_No_Delay.vbs`）。
2. **注册一键唤醒协议（可选，Windows）**：
   - 双击运行本项目的 `scripts/register-aria2-next-protocol.bat` 脚本，可为当前用户关联 `aria2-next://` 与 `aria2://` 协议。
   - 关联后，在扩展内点击“启动 Aria2-Next”或按下快捷键 `Alt + X` 即可在后台静默唤醒核心！
3. **加载扩展**：
   - 打开 Chrome / Edge 浏览器，访问 `chrome://extensions/`；
   - 开启右上角的“开发者模式”；
   - 点击“加载已解压的扩展程序”，选择本项目根目录即可完成安装。

---

## 🔑 常用快捷键

| 快捷键 | 功能说明 |
| :--- | :--- |
| **Alt + A** | 全局切换下载自动拦截开关（开/关） |
| **Alt + X** | 唤醒/启动本地 Aria2-Next 核心（Windows） |
| **S** / **Alt + S** | 在扩展配置选项页面中保存设置 |
| **R** / **Alt + R** | 在扩展配置选项页面中重置设置 |
| **?** | 在扩展选项页面中唤起帮助与快捷键弹窗 |

*注：可在浏览器 `chrome://extensions/shortcuts` 中自定义扩展快捷键。*

---

## 🧩 扩展间调用接口 (External Messaging)

其他浏览器扩展可以将本扩展作为中间件，直接投递下载任务至 Aria2-Next：

```js
const downloadItem = {
    url: "ed2k://|file|sample.iso|1073741824|ABCDEF0123456789ABCDEF0123456789|/",
    filename: "sample.iso",
    referrer: "https://example.com",
    options: { 
        split: "16",
        dir: "D:\\Downloads"
    }
};

chrome.runtime.sendMessage("Aria2-Next-Explorer-扩展ID", downloadItem);
```

---

## 📜 许可证与致谢

- 遵循 **BSD-3-Clause** 开源许可证。
- 感谢 [AnInsomniacy/aria2-next](https://github.com/AnInsomniacy/aria2-next) 提供的现代化下一代 Aria2 下载引擎。
- 感谢 [aria2/aria2](https://github.com/aria2/aria2) 经典下载项目。
- 感谢 [AriaNg](https://github.com/mayswind/AriaNg) 前端项目。
