/**
 * ==============================================================================
 * Vite 现代化构建配置 - Aria2-Next WebUI
 * ==============================================================================
 * 1. 源码工程位于 src/webui 模块
 * 2. 编译产物规范输出至 dist/webui 目录，不在根目录生成多余冗余文件夹
 * ==============================================================================
 */

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  root: path.resolve(__dirname, "src/webui"),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist/webui"),
    emptyOutDir: true,
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
