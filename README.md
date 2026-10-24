# Aria2-Next Explorer

<div align="center">

![Logo](images/logo128.png)

**基于现代化 Aria2-Next 核心构建的浏览器全能下载扩展**

[![许可证](https://img.shields.io/badge/license-BSD--3--Clause-green.svg)](LICENSE)
[![版本](https://img.shields.io/badge/version-3.0.0-gold.svg)](manifest.json)
[![Aria2-Next](https://img.shields.io/badge/Engine-aria2--next-blue.svg)](https://github.com/AnInsomniacy/aria2-next)

[简体中文](#) | [English](./README_EN.md)

</div>

---

## 📖 项目背景与愿景

随着多协议下载工具 [Aria2-Next](https://github.com/AnInsomniacy/aria2-next) 3.0+ 版本的重大演进，底层核心已使用现代 C++ 库（Boost.Asio、libcurl、libtorrent-rasterbar、SQLite）彻底重写，不仅修复了原版 aria2 遗留多年的历史问题，更引入了 **ED2K（电驴）** 协议原生下载、现代 **BitTorrent (v1/v2)** 混合支持、**HLS / DASH** 流媒体嗅探、以及智能浏览器文件名透传提示（`filename-hint`）。

然而，原有的经典浏览器扩展及老版 AriaNg 面板因受制于十多年前的 AngularJS 1.x 架构与传统 DOM 渲染，在面对当今复杂的 Web 生态、Manifest V3 扩展规范及数万分块的大型下载任务时，存在着界面卡顿、设置项无法对齐新内核、协议跨界报错等局限。

**Aria2-Next Explorer** 应运而生。本项目旨在为 [Aria2-Next](https://github.com/AnInsomniacy/aria2-next) 提供一款**极致性能、现代工程化、全协议无缝接管**的专属浏览器扩展。

---

## 🌟 上游仓库与血统致谢

本项目站在开源巨人的肩膀上，在此对所有上游项目及先驱作者致以最崇高的敬意：

1. **核心下载引擎**：[AnInsomniacy/aria2-next](https://github.com/AnInsomniacy/aria2-next) — 重新定义现代化下一代 aria2 引擎。
2. **原型扩展上游**：[alexhua/Aria2-Explorer](https://github.com/alexhua/Aria2-Explorer) — 提供经典易用的 Chrome/Edge 扩展交互范式。
3. **WebUI 界面灵感**：[mayswind/AriaNg](https://github.com/mayswind/AriaNg) — 经典美观的 Aria2 前端交互设计基石。
4. **经典原版内核**：[aria2/aria2](https://github.com/aria2/aria2) — 传奇的跨平台命令行多源下载神器。

---

## 🤖 AI 赋能：全流程代码重构与架构蜕变

本项目全面依托 **Google DeepMind 先进 AI 智能体（Agentic AI）** 实现了端到端的高质量工程重构与架构换代，彻底告别了传统人工重构周期长、回归难的痛点：

### 1. 架构彻底换代（AngularJS 1.x ➔ Vue 3 + Vite 6）
- **全面现代化**：彻底剔除十余年前的 AngularJS 1.x 与庞大无序的 IIFE 闭包，采用 **Vue 3 Composition API (`<script setup>`)** 与原生 **ES Module** 架构全新编码。
- **极速工程化**：接入 **Vite 6** 构建体系，实现毫秒级热重载与模块化按需编译，杜绝单体打包膨胀。
- **状态仓库解耦**：自研高性能响应式 Store 与极简 Hash 路由解析器，完美兼容原有路由参数，并支持启动默认直达「全部任务」（`#!/all`）与历史配置平滑自动升级。

### 2. 突破性能瓶颈：DOM 渲染 ➔ HTML5 Canvas 2D
- **万级分块毫秒响应**：传统 AriaNg 在渲染含数万个区块的 BT 种子时，直接生成几万个 DOM `<div>` 节点，极易引发浏览器主线程严重卡死甚至标签页崩溃。
- **视口自适应 Canvas 架构**：AI 重新设计了 Canvas 2D 视口渲染层，仅通过单一画布完成海量区块绘制，内存消耗骤降 90% 以上。
- **数学级几何严密推导**：基于单一数据源严格锁定网格排布尺寸，结合亚像素缩放补偿（`scaleX` / `scaleY`），彻底解决换行后鼠标十字与高亮框逐行累加漂移的错位难题，高亮框置顶渲染不被裁切。

### 3. Aria2-Next 全特性深度对齐
- **162 项专属配置重构**：依据 Aria2-Next 3.0.9 完整重构 9 大分类设置项，支持 ED2K、BitTorrent v2、流媒体及高级 RPC 调优参数。
- **协议智能差分过滤**：在新建任务面板中依据输入链接协议（HTTP/BT/ED2K）智能动态下发匹配参数，杜绝因协议不符导致的 RPC 拒绝。
- **智能时间排布机制**：正在下载任务按开始时间顺序排列，已完成/停止任务按完成时间逆序排列，全部任务分层归拢。
- **严格错误前置校验**：增加任务状态校验，彻底根除手动删除任务时误显 `(31: error.unknown)` 退出码的缺陷，补齐 32 项错误码简体中文翻译。

### 4. 自动化构建与极致压缩管线
- 自研打包流水线，集成 **Terser**、**esbuild** 与 **html-minifier** 实现代码深度混淆单行化压缩。
- 借助 Deflate Level-9 算法，产物体积精简逾 50%，一键自动输出 Microsoft Edge 专用的 `.crx` 拖拽安装包与 `.zip` 归档。

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
- **智能任务排序**：下载中任务按开始时间顺序排列，已完成任务按结束时间逆序排列。
- **图标角标指示**：浏览器工具栏图标实时展示当前任务数量与下载速率。
- **多服务器聚合**：支持配置多个本地或远程 RPC 服务端，并聚合监控健康状态。

### 🎨 精美内置管理界面 (Web UI)
- **开箱即用**：内置现代化 Vue 3 Web 前端，点击扩展图标默认打开「全部任务」，无需自建 Web 服务器。
- **文件名与大小独立成列**：清晰对比，4px 舒适呼吸感悬浮操作栏。
- **多种呈现形态**：支持作为弹窗（Popup）、独立新窗口（Window）、新标签页（Tab）或 Edge/Chrome 侧边栏（Side Panel）打开。
- **自适应深色模式**：支持跟随系统主题自动切换暗色/经典外观。

### 🌐 右键菜单与批量导出
- **右键极速导出**：右键点击网页链接或选中的 Magnet/ED2K 文本，一键推送至 Aria2-Next。
- **一键提取页面所有链接**：自动扫描并批量导出当前网页中的全部资源（包括图片、音视频、文件链接、Magnet 与 ED2K）。
- **站点一键过滤**：右键快捷菜单快速将当前站点加入黑名单或白名单。

---

## 📦 一键打包支持 Microsoft Edge 浏览器

本项目内置针对 **Microsoft Edge**（以及所有主流 Chromium 内核浏览器）的自动化签名打包脚本：

1. **一键双击打包 (Windows)**：
   - 直接双击运行项目根目录下 `scripts/package-edge.bat`。
2. **命令行打包**：
   ```bash
   node scripts/package-edge.js
   ```
3. **打包产物**（输出于 `dist/` 目录）：
   - `dist/Aria2-Next-Explorer-Edge/`：解压后的完整扩展目录，可直接加载开发测试。
   - `dist/Aria2-Next-Explorer-Edge-v3.0.0.zip`：发布压缩包，可直接用于归档或提交扩展商店。
   - `dist/Aria2-Next-Explorer-Edge-v3.0.0.crx`：离线安装包，可直接拖拽至 Edge 浏览器安装。

### 💡 在 Edge 浏览器中安装测试

- **方法 A（推荐，CRX 拖拽一键安装）**：
  1. 打开 Edge 浏览器，访问 `edge://extensions/`；
  2. 开启页面左侧底部的 **【开发人员模式】** 开关；
  3. 将生成的 `dist/Aria2-Next-Explorer-Edge-v3.0.0.crx` 直接拖拽进该网页即可完成安装！
- **方法 B（解压目录直接加载）**：
  1. 打开 Edge 浏览器，访问 `edge://extensions/`；
  2. 开启左侧 **【开发人员模式】** 开关；
  3. 点击 **【加载解压缩的扩展】** 按钮，选中 `dist/Aria2-Next-Explorer-Edge` 目录即可！

---

## 🚀 配合本地 Aria2-Next 运行

本地 Aria2-Next 默认 RPC 服务监听在 `http://localhost:6800/jsonrpc`。

1. **启动本地核心**：
   - 运行本地 `aria2-next.exe --conf-path=aria2.conf` 或执行启动脚本（例如 `Aria2_Start_No_Delay.vbs`）。
2. **注册一键唤醒协议（可选，Windows）**：
   - 双击运行本项目的 `scripts/register-aria2-next-protocol.bat` 脚本，可为当前用户关联 `aria2-next://` 与 `aria2://` 协议。
   - 关联后，在扩展内点击“启动 Aria2-Next”即可在后台静默唤醒核心！
3. **加载扩展**：
   - 打开 Chrome / Edge 浏览器，访问 `chrome://extensions/` 或 `edge://extensions/`；
   - 开启右上角的“开发者模式”；
   - 点击“加载已解压的扩展程序”，选择本项目根目录即可完成安装。

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

## 📜 许可证

本项目遵循 **BSD-3-Clause** 开源许可证。
详细内容请参阅 [LICENSE](LICENSE) 文件。
