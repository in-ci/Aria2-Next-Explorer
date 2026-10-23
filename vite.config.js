/**
 * ==============================================================================
 * Vite 现代化构建配置 - Aria2-Next WebUI
 * ==============================================================================
 * 1. 根目录对齐至 src/webui 模块
 * 2. 编译产物输出至 webui/ 供 Edge 扩展直接加载
 * 3. 自动清理旧 Hash 资源避免磁盘冗余
 * ==============================================================================
 */

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import fs from "fs";

/**
 * 资产清理插件：在构建启动时自动清理上一次生成的 assets 目录
 */
function cleanAssetsPlugin() {
  return {
    name: "clean-assets",
    buildStart() {
      const assetsDir = path.resolve(__dirname, "webui/assets");
      if (fs.existsSync(assetsDir)) {
        fs.rmSync(assetsDir, { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [vue(), cleanAssetsPlugin()],
  root: path.resolve(__dirname, "src/webui"),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "webui"),
    emptyOutDir: false,
    rollupOptions: {
      input: path.resolve(__dirname, "src/webui/index.html"),
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
