/**
 * ==============================================================================
 * Aria2-Next WebUI 现代化应用入口
 * ==============================================================================
 * 全新 Vue 3 + Vite 架构，零 AngularJS，零 ECharts，零 Moment.js。
 * 直接导入 src/css 下的基础插件与核心皮肤样式，由 Vite 统一编译打包与哈希化。
 * ==============================================================================
 */

import "./css/plugins-156783225a.min.css";
import "./css/aria-ng-a896d84fcf.min.css";

import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";

const app = createApp(App);
app.use(i18n);
app.mount("#app");
