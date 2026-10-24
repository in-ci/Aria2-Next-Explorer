# Aria2-Next Explorer

<div align="center">

![Logo](images/logo128.png)

**A modern, powerful browser extension for seamless Aria2-Next integration**

[![License](https://img.shields.io/badge/license-BSD--3--Clause-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.0.9-gold.svg)](manifest.json)
[![Aria2-Next](https://img.shields.io/badge/Engine-aria2--next-blue.svg)](https://github.com/AnInsomniacy/aria2-next)

[简体中文](./README.md) | [English](#)

</div>

---

### 🌟 Lineage & Upstream Repositories
- **Modern Download Engine**: [AnInsomniacy/aria2-next](https://github.com/AnInsomniacy/aria2-next)
- **Extension Prototype Upstream**: [alexhua/Aria2-Explorer](https://github.com/alexhua/Aria2-Explorer)
- **Web UI Upstream**: [mayswind/AriaNg](https://github.com/mayswind/AriaNg)
- **Original Engine**: [aria2/aria2](https://github.com/aria2/aria2) 

---

## 🤖 AI-Driven Architecture Modernization

This project was comprehensively refactored and modernized using advanced agentic AI capabilities (DeepMind / Gemini Agent):

1. **Framework Paradigm Shift (AngularJS -> Vue 3 + Vite)**
2. **Engine-Level Full Protocol Alignment**:
   - Reconstructed 9 setting categories with 162 specialized configuration parameters aligned with Aria2-Next 3.0.9.
   - Protocol-aware task options for HTTP, BT, and ED2K, eliminating cross-protocol RPC errors.
---

## ✨ Key Features

### 🎯 Smart Download Capture & Protocols
- **Expanded Protocols**: Native support for HTTP, HTTPS, SFTP, BitTorrent Magnet links, and **ED2K links**.
- **Browser Filename Hints**: Deep integration with Aria2-Next's `filename-hint` and `filename-hint-source=browser` options.
- **Flexible Filters**: Configure file size thresholds (≥ N MB) and domain/extension allow-lists or block-lists.
- **Alt-Key Override**: Hold `Alt` while clicking any link to bypass capture and download through browser directly.
- **Protocol-Aware Task Options**: Automatically provides protocol-compatible options for HTTP, BT, and ED2K tasks.

### 📊 Real-Time Monitoring & Task Ordering
- **Live Status Polling**: Track active, waiting, and completed download tasks.
- **Intelligent Sorting**: Active tasks sorted by start time ascending; finished/stopped tasks sorted by completion time descending; all tasks grouped intelligently.
- **Speed & Task Badges**: Real-time badge display for current speeds and task count.
- **Multi-Server Aggregation**: Manage and monitor multiple local or remote RPC instances.

---

## 📦 One-Click Packaging for Microsoft Edge

The repository includes a ready-to-use packaging script for **Microsoft Edge** (and Chromium-based browsers):

1. **One-Click Batch Script (Windows)**:
   - Double-click `scripts/package-edge.bat`.
2. **Via Command Line**:
   ```bash
   node scripts/package-edge.js
   ```
3. **Build Artifacts** (created inside `dist/`):
   - `dist/Aria2-Next-Explorer-Edge/`: Unpacked extension directory for immediate developer testing.
   - `dist/Aria2-Next-Explorer-Edge-v3.0.9.zip`: Production-ready ZIP archive for store submission or distribution.
   - `dist/Aria2-Next-Explorer-Edge-v3.0.9.crx`: Packed extension ready for drag-and-drop installation.

### 💡 How to Load in Microsoft Edge

1. Open Edge and navigate to `edge://extensions/`.
2. Toggle on **Developer mode** in the lower left navigation pane.
3. Click **Load unpacked** at the top.
4. Select `dist/Aria2-Next-Explorer-Edge` (or drag `Aria2-Next-Explorer-Edge-v3.0.9.crx` into the window).
5. Pin the extension to your toolbar and start downloading!

---

## 🚀 Setup with Local Aria2-Next

By default, Aria2-Next listens for JSON-RPC connections at `http://localhost:6800/jsonrpc`.

1. **Start Aria2-Next**:
   - Run `aria2-next.exe --conf-path=aria2.conf` 
---

## 📜 Acknowledgments & License

- Licensed under **BSD-3-Clause**.
- Special thanks to [AnInsomniacy/aria2-next](https://github.com/AnInsomniacy/aria2-next) for redefining the next generation of aria2.
- Thanks to [alexhua/Aria2-Explorer](https://github.com/alexhua/Aria2-Explorer), [aria2/aria2](https://github.com/aria2/aria2), and [AriaNg](https://github.com/mayswind/AriaNg).
