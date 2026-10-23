/**
 * ==============================================================================
 * Aria2-Next WebUI 现代化应用入口
 * ==============================================================================
 * 全新 Vue 3 + Vite 架构，零 AngularJS，零 ECharts，零 Moment.js。
 * ==============================================================================
 */

import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";

const app = createApp(App);
app.use(i18n);
app.mount("#app");
