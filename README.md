# Aria2-Next Explorer

<div align="center">

![Logo](src/public/images/logo128.png)

**基于现代化 Aria2-Next 核心构建的浏览器全能下载扩展**

[![许可证](https://img.shields.io/badge/license-BSD--3--Clause-green.svg)](LICENSE)
[![版本](https://img.shields.io/badge/version-3.0.9-gold.svg)](manifest.json)
[![Aria2-Next](https://img.shields.io/badge/Engine-aria2--next-blue.svg)](https://github.com/AnInsomniacy/aria2-next)

[简体中文](#) | [English](./README_EN.md)

</div>

---

## 🌟 上游仓库

本项目站在开源巨人的肩膀上，在此对所有上游项目及先驱作者致以最崇高的敬意：

1. **核心下载引擎**：[AnInsomniacy/aria2-next](https://github.com/AnInsomniacy/aria2-next)
2. **原型扩展上游**：[alexhua/Aria2-Explorer](https://github.com/alexhua/Aria2-Explorer) 
3. **WebUI 界面灵感**：[mayswind/AriaNg](https://github.com/mayswind/AriaNg)
4. **经典原版内核**：[aria2/aria2](https://github.com/aria2/aria2)

---

## 🤖 AI 赋能：全流程代码重构与架构蜕变

本项目全面依托 **Google DeepMind 先进 AI 智能体（Agentic AI）** 实现了端到端的高质量工程重构与架构换代

#### 1. 架构彻底换代（AngularJS 1.x ➔ Vue 3 + Vite 6）
#### 2. Aria2-Next 全特性深度对齐
- 依据 Aria2-Next 3.0.9 完整重构 9 大分类设置项，支持 ED2K、BitTorrent v2、流媒体及高级 RPC 调优参数。
- **协议智能差分过滤**：在新建任务面板中依据输入链接协议（HTTP/BT/ED2K）智能动态下发匹配参数，杜绝因协议不符导致的 RPC 拒绝。

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
   - `dist/Aria2-Next-Explorer-Edge-v3.0.9.zip`：发布压缩包，可直接用于归档或提交扩展商店。
   - `dist/Aria2-Next-Explorer-Edge-v3.0.9.crx`：离线安装包，可直接拖拽至 Edge 浏览器安装。

### 💡 在 Edge 浏览器中安装测试

- **方法 A（推荐，CRX 拖拽一键安装）**：
  1. 打开 Edge 浏览器，访问 `edge://extensions/`；
  2. 开启页面左侧底部的 **【开发人员模式】** 开关；
  3. 将生成的 `dist/Aria2-Next-Explorer-Edge-v3.0.9.crx` 直接拖拽进该网页即可完成安装！
- **方法 B（解压目录直接加载）**：
  1. 打开 Edge 浏览器，访问 `edge://extensions/`；
  2. 开启左侧 **【开发人员模式】** 开关；
  3. 点击 **【加载解压缩的扩展】** 按钮，选中 `dist/Aria2-Next-Explorer-Edge` 目录即可！

---

## 🚀 配合本地 Aria2-Next 运行

本地 Aria2-Next 默认 RPC 服务监听在 `http://localhost:6800/jsonrpc`。

1. **启动本地核心**：运行本地 aria2-next.exe
---

## 📜 许可证

本项目遵循 **BSD-3-Clause** 开源许可证。
详细内容请参阅 [LICENSE](LICENSE) 文件。
