/**
 * ==============================================================================
 * Vite 现代化构建配置 - Aria2-Next WebUI
 * ==============================================================================
 * 1. Vue 3 源码工程直接位于 src/ 根目录下
 * 2. 静态公共资产位于 src/public/
 * 3. 编译产物规范输出至 dist/webui 目录
 * ==============================================================================
 */

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  root: path.resolve(__dirname, "src"),
  base: "./",
  publicDir: path.resolve(__dirname, "src/public"),
  build: {
    outDir: path.resolve(__dirname, "dist/webui"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "src/index.html"),
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
