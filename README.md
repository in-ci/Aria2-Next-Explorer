# Aria2-Next Explorer

<div align="center">

![Logo](images/logo128.png)

**A modern, powerful browser extension for seamless Aria2-Next integration**

[![License](https://img.shields.io/badge/license-BSD--3--Clause-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.0.0-gold.svg)](manifest.json)
[![Aria2-Next](https://img.shields.io/badge/Engine-aria2--next-blue.svg)](https://github.com/AnInsomniacy/aria2-next)

[English](#english) | [简体中文](./README.cn.md)

</div>

---

## 📖 Overview

**Aria2-Next Explorer** is a feature-rich browser extension (Manifest V3) specifically tailored for [Aria2-Next](https://github.com/AnInsomniacy/aria2-next), the modernized next-generation fork of aria2.

Aria2-Next rebuilds the core engine using modern C++ libraries (Boost.Asio, libcurl, libtorrent-rasterbar, SQLite), introducing native **ED2K (eMule)** protocol support, enhanced **BitTorrent (v1/v2)**, **HLS / DASH** stream capture, and intelligent browser filename hints (`filename-hint`).

This extension automatically intercepts browser downloads, captures HTTP/HTTPS, SFTP, Magnet, and ED2K links, monitors task status in real time, and provides an integrated AriaNg Web UI.

---

## ✨ Key Features

### 🎯 Smart Download Capture & Protocols
- **Expanded Protocols**: Native support for HTTP, HTTPS, SFTP, BitTorrent Magnet links, and **ED2K links**.
- **Browser Filename Hints**: Deep integration with Aria2-Next's `filename-hint` and `filename-hint-source=browser` options.
- **Flexible Filters**: Configure file size thresholds (≥ N MB) and domain/extension allow-lists or block-lists.
- **Alt-Key Override**: Hold `Alt` while clicking any link to bypass capture and download through browser directly.
- **Protocol-Aware Task Options**: Automatically provides protocol-compatible options for HTTP, BT, and ED2K tasks.

### 📊 Real-Time Monitoring
- **Live Status Polling**: Track active, waiting, and completed download tasks.
- **Speed & Task Badges**: Real-time badge display for current speeds and task count.
- **Multi-Server Aggregation**: Manage and monitor multiple local or remote RPC instances.

### 🎨 Integrated Web Management UI
- **Built-in AriaNg Frontend**: Manage downloads immediately without installing an external web server.
- **Flexible Display Modes**: Open as a popup, separate window, new browser tab, or Chrome Side Panel.
- **System Theme Adaptive**: Automatic dark mode and light mode switching.

### 🌐 Context Menu & Batch Export
- **One-Click Export**: Right-click links or selected Magnet / ED2K text to send directly to Aria2-Next.
- **Batch Export All Links**: Automatically extracts all downloadable files, media, Magnet, and ED2K links on the page.
- **Quick Site Filtering**: Instantly add the current website to allow-list or block-list from the context menu.

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
   - `dist/Aria2-Next-Explorer-Edge-v3.0.0.zip`: Production-ready ZIP archive for store submission or distribution.

### 💡 How to Load in Microsoft Edge

1. Open Edge and navigate to `edge://extensions/`.
2. Toggle on **Developer mode** in the lower left navigation pane.
3. Click **Load unpacked** at the top.
4. Select `dist/Aria2-Next-Explorer-Edge` (or the repository root).
5. Pin the extension to your toolbar and start downloading!

---

## 🚀 Setup with Local Aria2-Next

By default, Aria2-Next listens for JSON-RPC connections at `http://localhost:6800/jsonrpc`.

1. **Start Aria2-Next**:
   - Run `aria2-next.exe --conf-path=aria2.conf` or your launch script (e.g. `Aria2_Start_No_Delay.vbs`).
2. **Register Protocol Handler (Windows, Optional)**:
   - Run `scripts/register-aria2-next-protocol.bat` to register `aria2-next://` and `aria2://` handlers in Windows HKCU.
   - Once registered, pressing `Alt + X` or clicking "Start Aria2-Next" in the extension menu silently wakes up your core!
3. **Load Extension**:
   - In Chrome or Edge, navigate to `chrome://extensions/`.
   - Enable **Developer mode** in the top right corner.
   - Click **Load unpacked** and select the repository root directory.

---

## 🔑 Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| **Alt + A** | Toggle download capture (On / Off) |
| **Alt + X** | Launch local Aria2-Next core (Windows) |
| **S** / **Alt + S** | Save settings in Extension Options page |
| **R** / **Alt + R** | Reset settings in Extension Options page |
| **?** | Open help and shortcuts dialog in Options page |

*Customize shortcuts anytime at `chrome://extensions/shortcuts`.*

---

## 🧩 External Integration

Other browser extensions can use this extension as middleware to dispatch downloads directly:

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

chrome.runtime.sendMessage("Aria2-Next-Explorer-Extension-ID", downloadItem);
```

---

## 📜 Acknowledgments & License

- Licensed under **BSD-3-Clause**.
- Special thanks to [AnInsomniacy/aria2-next](https://github.com/AnInsomniacy/aria2-next) for redefining the next generation of aria2.
- Thanks to [aria2/aria2](https://github.com/aria2/aria2) and [AriaNg](https://github.com/mayswind/AriaNg).
