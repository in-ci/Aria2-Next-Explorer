<template>
  <footer class="main-footer">
    <nav class="navbar" role="navigation">
      <div class="navbar-toolbar">
        <ul class="nav">
          <!-- 侧边栏折叠切换按钮 -->
          <li class="nav-item">
            <a
              class="nav-link pointer-cursor"
              data-widget="pushmenu"
              role="button"
              :title="$t('Toggle Navigation')"
              @click="$emit('toggleSidebar')"
            >
              <i class="nav-icon fa fa-bars"></i>
            </a>
          </li>
          <li class="nav-item divider"></li>
          <!-- 全局限速设置 -->
          <li>
            <a
              class="dropdown-item pointer-cursor"
              @click="isRateLimitModalOpen = true"
            >
              <i class="fa fa-sliders fa-fw mr-1"></i>
              <span>{{ $t("Global Rate Limit") }}</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- 右侧实时速度与图表触发器 -->
      <div
        class="global-status-wrapper pull-right"
        style="position: relative;"
      >
        <a
          class="global-status pointer-cursor"
          :title="$t('Click to pin')"
          @click="isChartPopoverOpen = !isChartPopoverOpen"
        >
          <!-- 下载速度 -->
          <span class="realtime-speed mr-3 text-success">
            <i class="icon-download fa fa-arrow-down mr-1"></i>
            <span>{{ formatSpeed(store.globalStat.downloadSpeed) }}</span>
          </span>
          <!-- 上传速度 -->
          <span class="realtime-speed text-primary">
            <i class="icon-upload fa fa-arrow-up mr-1"></i>
            <span>{{ formatSpeed(store.globalStat.uploadSpeed) }}</span>
          </span>
        </a>

        <!-- 实时速度曲线微图表浮层 (原生 Canvas 替代 ECharts) -->
        <div
          v-if="isChartPopoverOpen"
          class="speed-chart-popover shadow"
          :class="{ 'dark-mode': isDarkTheme }"
        >
          <div class="speed-chart-header d-flex justify-content-between align-items-center mb-1">
            <span class="small font-weight-bold">
              <i class="fa fa-line-chart text-primary mr-1"></i>{{ $t("Realtime Speed Chart") || "实时速度折线图" }}
            </span>
            <div class="d-flex align-items-center">
              <span class="badge badge-success mr-2" style="font-size: 11px; font-weight: normal;">
                <i class="fa fa-arrow-down mr-1"></i>{{ formatSpeed(store.globalStat.downloadSpeed) }}
              </span>
              <span class="badge badge-primary mr-2" style="font-size: 11px; font-weight: normal;">
                <i class="fa fa-arrow-up mr-1"></i>{{ formatSpeed(store.globalStat.uploadSpeed) }}
              </span>
              <button
                type="button"
                class="close text-muted"
                style="font-size: 16px; outline: none; line-height: 1;"
                @click="isChartPopoverOpen = false"
              >
                &times;
              </button>
            </div>
          </div>
          <canvas
            ref="chartCanvasRef"
            width="320"
            height="165"
            style="width: 100%; height: 165px; display: block;"
          ></canvas>
        </div>
      </div>
    </nav>

    <!-- 全局限速模态弹窗 -->
    <div
      v-if="isRateLimitModalOpen"
      class="modal fade show"
      style="display: block; background: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ $t("Global Rate Limit") }}</h5>
            <button type="button" class="close" @click="isRateLimitModalOpen = false">
              &times;
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-3">
              <label>{{ $t("Overall Download Limit") }} (B/s, 0 = {{ $t("Unlimited") }})</label>
              <input
                type="text"
                class="form-control"
                placeholder="0"
                v-model="maxOverallDownloadLimit"
              />
            </div>
            <div class="form-group">
              <label>{{ $t("Overall Upload Limit") }} (B/s, 0 = {{ $t("Unlimited") }})</label>
              <input
                type="text"
                class="form-control"
                placeholder="0"
                v-model="maxOverallUploadLimit"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isRateLimitModalOpen = false">
              {{ $t("Cancel") }}
            </button>
            <button type="button" class="btn btn-primary" @click="saveRateLimit">
              {{ $t("Save") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
/**
 * ==============================================================================
 * 底部状态与全局速度栏组件 (FooterBar)
 * ==============================================================================
 * 提供侧边栏收起/展开切换、全局限速模态弹窗、实时速度展示以及
 * 基于原生 HTML5 Canvas 的速度折线图微图表浮层。
 * ==============================================================================
 */

import { ref, computed, watch, nextTick, onUnmounted } from "vue";
import { store } from "../store";
import { formatSpeed } from "../utils/format";
import { SpeedCanvasChart } from "../utils/canvas-chart";

defineEmits(["toggleSidebar"]);

/** 实时速度曲线图表弹窗显隐状态 */
const isChartPopoverOpen = ref(false);
/** 全局限速模态弹窗显隐状态 */
const isRateLimitModalOpen = ref(false);
/** 最大全局下载限速输入框绑定值 */
const maxOverallDownloadLimit = ref("0");
/** 最大全局上传限速输入框绑定值 */
const maxOverallUploadLimit = ref("0");

/** 速度图表 Canvas 节点引用 */
const chartCanvasRef = ref(null);
/** 图表绘制引擎实例句柄 */
let chartInstance = null;

/** 是否为暗色主题 */
const isDarkTheme = computed(() => {
  return store.theme === "dark" || document.documentElement.classList.contains("dark-theme");
});

/**
 * 初始化原生速度 Canvas 微图表
 */
function initChart() {
  if (!chartCanvasRef.value) return;
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new SpeedCanvasChart(chartCanvasRef.value, { isDark: isDarkTheme.value });
  chartInstance.setHistory(store.speedHistory);
}

// 监听全局统计心跳更新：当浮层打开时同步刷新图表数据
watch(
  () => store.globalStat,
  () => {
    if (chartInstance && isChartPopoverOpen.value) {
      chartInstance.setHistory(store.speedHistory);
    }
  },
  { deep: true }
);

// 监听主题变化，动态调整图表配色
watch(isDarkTheme, (isDark) => {
  if (chartInstance) {
    chartInstance.setTheme(isDark);
  }
});

// 监听图表浮层开闭状态
watch(isChartPopoverOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    setTimeout(() => {
      initChart();
    }, 20);
  } else if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});

/**
 * 保存全局上下行限速配置项
 */
async function saveRateLimit() {
  if (!store.client) return;
  try {
    await store.client.changeGlobalOption({
      "max-overall-download-limit": String(maxOverallDownloadLimit.value || 0),
      "max-overall-upload-limit": String(maxOverallUploadLimit.value || 0),
    });
  } catch (e) {
    console.warn("Failed to set rate limit:", e);
  }
  isRateLimitModalOpen.value = false;
}

// 组件卸载时释放图表资源
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.speed-chart-popover {
  position: absolute;
  top: auto;
  bottom: 42px;
  right: 0;
  left: auto;
  width: 340px;
  height: 205px;
  z-index: 1060;
  background: #ffffff;
  color: #212529;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px 10px;
}
.speed-chart-popover.dark-mode {
  background: #25282c;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.speed-chart-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding-bottom: 4px;
}
.speed-chart-popover.dark-mode .speed-chart-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
