<template>
  <footer class="main-footer">
    <nav class="navbar" role="navigation">
      <div class="navbar-toolbar">
        <ul class="nav">
          <!-- 侧边栏折叠切换按钮 -->
          <li class="nav-item">
            <a
              class="nav-link pointer-cursor"
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
          class="popover chart-popover bs-popover-top show"
          style="position: absolute; bottom: 45px; right: 0; width: 340px; height: 210px; z-index: 1060; background: var(--bg-card, #2b3035); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); padding: 8px;"
        >
          <div class="d-flex justify-content-between align-items-center mb-1 px-2">
            <span class="small font-weight-bold">{{ $t("Realtime Speed Chart") || "Realtime Speed" }}</span>
            <button
              type="button"
              class="close text-muted"
              style="font-size: 16px; outline: none;"
              @click="isChartPopoverOpen = false"
            >
              &times;
            </button>
          </div>
          <canvas
            ref="chartCanvasRef"
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
import { ref, onMounted, watch, nextTick } from "vue";
import { store } from "../store";
import { formatSpeed } from "../utils/format";
import { SpeedCanvasChart } from "../utils/canvas-chart";

defineEmits(["toggleSidebar"]);

const isChartPopoverOpen = ref(false);
const isRateLimitModalOpen = ref(false);
const maxOverallDownloadLimit = ref("0");
const maxOverallUploadLimit = ref("0");

const chartCanvasRef = ref(null);
let chartInstance = null;

function initChart() {
  if (!chartCanvasRef.value) return;
  const isDark = document.documentElement.classList.contains("dark-theme");
  chartInstance = new SpeedCanvasChart(chartCanvasRef.value, { isDark });
  // 加载已有历史
  store.speedHistory.forEach((pt) => {
    chartInstance.addDataPoint(pt.down, pt.up);
  });
}

watch(
  () => store.globalStat,
  (stat) => {
    if (chartInstance && isChartPopoverOpen.value) {
      chartInstance.addDataPoint(stat.downloadSpeed, stat.uploadSpeed);
    }
  },
  { deep: true }
);

watch(isChartPopoverOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    initChart();
  } else {
    chartInstance = null;
  }
});

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
</script>
