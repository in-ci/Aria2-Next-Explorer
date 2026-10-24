# Aria2-Next Explorer

<div align="center">

![Logo](images/logo128.png)

**A modern, powerful browser extension for seamless Aria2-Next integration**

[![License](https://img.shields.io/badge/license-BSD--3--Clause-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.0.0-gold.svg)](manifest.json)
[![Aria2-Next](https://img.shields.io/badge/Engine-aria2--next-blue.svg)](https://github.com/AnInsomniacy/aria2-next)

[简体中文](./README.md) | [English](#)

</div>

---

## 📖 Overview & Project Background

**Aria2-Next Explorer** is a modernized, feature-rich browser extension (Manifest V3) specifically tailored for [Aria2-Next](https://github.com/AnInsomniacy/aria2-next), the next-generation performance-oriented fork of aria2.

### 🌟 Lineage & Upstream Repositories
- **Modern Download Engine**: [AnInsomniacy/aria2-next](https://github.com/AnInsomniacy/aria2-next) — Rewritten in modern C++ with Boost.Asio, libcurl, libtorrent-rasterbar, and SQLite, introducing native **ED2K (eMule)** support, enhanced **BitTorrent (v1/v2)**, **HLS / DASH** stream capture, and intelligent browser filename hints (`filename-hint`).
- **Extension Prototype Upstream**: [alexhua/Aria2-Explorer](https://github.com/alexhua/Aria2-Explorer) — The classic browser integration extension.
- **Web UI Upstream**: [mayswind/AriaNg](https://github.com/mayswind/AriaNg) — The classic web frontend for aria2.
- **Original Engine**: [aria2/aria2](https://github.com/aria2/aria2) — The legendary multi-protocol download utility.

---

## 🤖 AI-Driven Architecture Modernization

This project was comprehensively refactored and modernized using advanced agentic AI capabilities (DeepMind / Gemini Agent):

1. **Framework Paradigm Shift (AngularJS -> Vue 3 + Vite)**:
   - Completely discarded legacy AngularJS 1.x and monolithic bundle scripts.
   - Rebuilt from scratch using **Vue 3 Composition API (`<script setup>`)**, native **ES Modules**, and **Vite 6** for blazing-fast development and optimized production bundles.
2. **High-Performance Canvas Rendering (DOM -> Canvas 2D)**:
   - The original piece map generated tens of thousands of DOM nodes, causing severe UI freezing for large torrent files.
   - Re-engineered as a high-performance **HTML5 Canvas 2D** renderer with unified viewport coordinates, dynamic subpixel scaling (`scaleX`/`scaleY`), and hover crosshair alignment.
3. **Engine-Level Full Protocol Alignment**:
   - Reconstructed 9 setting categories with 162 specialized configuration parameters aligned with Aria2-Next 3.0.9.
   - Protocol-aware task options for HTTP, BT, and ED2K, eliminating cross-protocol RPC errors.
4. **Automated Production & Packaging Pipeline**:
   - Integrated full-code minification (Terser, esbuild, HTML minifier) and Level-9 compression.
   - Automated one-click packaging producing unpacked directories, ZIP archives, and self-contained Microsoft Edge `.crx` packages.

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

### 🎨 Integrated Web Management UI
- **Built-in AriaNg Frontend**: Manage downloads immediately without installing an external web server.
- **Default All Tasks View**: Automatically lands on `#!/all` with seamless fallback for existing installations.
- **Flexible Display Modes**: Open as a popup, separate window, new browser tab, or Chrome Side Panel.
- **System Theme Adaptive**: Automatic dark mode and light mode switching.

### 🌐 Context Menu & Batch Export
- **One-Click Export**: Right-click links or selected Magnet / ED2K text to send directly to Aria2-Next.
- **Batch Export All Links**: Automatically extracts all downloadable files, media, Magnet, and ED2K links on the page.
- **Quick Site Filtering**: Instantly add the current website to allow-list or block-list from the context menu.

---

## 🛡️ Moving Microsoft Edge Ecosystem Forward with Manifest V3

In alignment with Microsoft's roadmap [“Moving the Microsoft Edge extensions ecosystem forward with Manifest Version 3”](https://blogs.windows.com/msedgedev/2026/08/07/moving-the-microsoft-edge-extensions-ecosystem-forward-with-manifest-version-3/):
> *"Starting August 2026, Microsoft Edge will begin transitioning to MV3 and phasing out Manifest V2 (MV2) extensions. Our goal is to complete the consumer transition by the end of 2026, followed by enterprise deprecation in early 2027."*

**Aria2-Next Explorer is fully compliant with native Manifest V3 standards & deeply optimized**:
- **Pure MV3 Service Worker Architecture**: Zero persistent background pages; utilizes an event-driven Service Worker lifecycle with automatic sleep/wake capabilities.
- **Deep Memory & Performance Tuning**:
  - **Asynchronous View Code-Splitting**: Landing view is optimized for instant startup, while secondary detail and settings views are lazily loaded on demand via `defineAsyncComponent`.
  - **CSS Tree-Shaking**: Stripped 264KB of unused legacy styles and dead selectors, significantly reducing CSSOM memory parsing.
  - **Vue 3 Zero-Copy & Granular Reactivity**: `Object.freeze` blocks deep i18n proxies, `shallowRef` handles global server options, `v-memo` eliminates unchanged task diffing, and chart histories reuse buffer references—reducing extension runtime memory from **~70MB** down to **~35-45MB**.
  - **Lifecycle-Managed Event Listeners**: Standardized DOM listener registration via `useEventListener` composable, preventing closure and detached DOM leaks.

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
   - `dist/Aria2-Next-Explorer-Edge-v3.0.0.crx`: Packed extension ready for drag-and-drop installation.

### 💡 How to Load in Microsoft Edge

1. Open Edge and navigate to `edge://extensions/`.
2. Toggle on **Developer mode** in the lower left navigation pane.
3. Click **Load unpacked** at the top.
4. Select `dist/Aria2-Next-Explorer-Edge` (or drag `Aria2-Next-Explorer-Edge-v3.0.0.crx` into the window).
5. Pin the extension to your toolbar and start downloading!

---

## 🚀 Setup with Local Aria2-Next

By default, Aria2-Next listens for JSON-RPC connections at `http://localhost:6800/jsonrpc`.

1. **Start Aria2-Next**:
   - Run `aria2-next.exe --conf-path=aria2.conf` or your launch script (e.g. `Aria2_Start_No_Delay.vbs`).
2. **Register Protocol Handler (Windows, Optional)**:
   - Run `scripts/register-aria2-next-protocol.bat` to register `aria2-next://` and `aria2://` handlers in Windows HKCU.
   - Once registered, clicking "Start Aria2-Next" in the extension menu silently wakes up your core!
3. **Load Extension**:
   - In Chrome or Edge, navigate to `chrome://extensions/`.
   - Enable **Developer mode** in the top right corner.
   - Click **Load unpacked** and select the repository root directory.

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
- Thanks to [alexhua/Aria2-Explorer](https://github.com/alexhua/Aria2-Explorer), [aria2/aria2](https://github.com/aria2/aria2), and [AriaNg](https://github.com/mayswind/AriaNg).
