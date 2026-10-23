<template>
  <div class="piece-map-container" ref="containerRef">
    <!-- 图例展示 -->
    <div class="piece-legends mb-2">
      <div class="piece-legend">
        <div class="piece piece-completed"></div>
        <span>{{ $t("Completed") }} ({{ completedPieces }} / {{ pieceCount }})</span>
      </div>
      <div class="piece-legend ml-3">
        <div class="piece"></div>
        <span>{{ $t("Uncompleted") }} ({{ pieceCount - completedPieces }} / {{ pieceCount }})</span>
      </div>
    </div>

    <!-- 高性能 Canvas 分片渲染画布 -->
    <canvas
      ref="canvasRef"
      class="piece-map-canvas"
      @mousemove="handleMouseMove"
      @mouseleave="hoverIndex = -1"
    ></canvas>

    <!-- 鼠标悬停分片编号指示 -->
    <div v-if="hoverIndex >= 0" class="piece-hover-tip text-muted small mt-1">
      Piece #{{ hoverIndex }}: {{ isPieceCompleted(hoverIndex) ? $t("Completed") : $t("Uncompleted") }}
    </div>
  </div>
</template>

<script setup>
/**
 * ==============================================================================
 * BT / 多分片下载分片地图组件 (PieceMap)
 * ==============================================================================
 * 基于原生 HTML5 Canvas 2D 渲染海量分片区块（可支撑数万分片无需创建任何 DOM 元素）
 * 彻底消除分片 DOM 爆炸导致的浏览器几十兆内存消耗与页面掉帧
 * ==============================================================================
 */

import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { parseBitfield } from "../utils/format";

const props = defineProps({
  /** Aria2 十六进制 bitfield 编码字符串 */
  bitfield: { type: String, default: "" },
  /** 分片总数量 */
  pieceCount: { type: Number, default: 0 },
});

const containerRef = ref(null);
const canvasRef = ref(null);
const hoverIndex = ref(-1);

/** 将 bitfield 解析为布尔状态数组 */
const pieces = computed(() => {
  return parseBitfield(props.bitfield, props.pieceCount);
});

/** 已下载完成的分片总数 */
const completedPieces = computed(() => {
  return pieces.value.filter(Boolean).length;
});

/** 判断某个分片是否已完成 */
function isPieceCompleted(idx) {
  return !!pieces.value[idx];
}

const blockSize = 14;
const gap = 3;

/**
 * 重新计算 Canvas 视口并绘制所有分片网格
 */
function renderCanvas() {
  const canvas = canvasRef.value;
  const container = containerRef.value;
  if (!canvas || !container || props.pieceCount <= 0) return;

  const width = container.clientWidth || 600;
  const cols = Math.max(1, Math.floor((width + gap) / (blockSize + gap)));
  const rows = Math.ceil(props.pieceCount / cols);
  const height = rows * (blockSize + gap) - gap;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const isDark = document.documentElement.classList.contains("dark-theme");
  const uncompletedColor = isDark ? "rgba(255, 255, 255, 0.12)" : "#e9ecef";
  const completedColor = "#20c997"; // 经典绿 / 翠绿

  for (let i = 0; i < props.pieceCount; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = c * (blockSize + gap);
    const y = r * (blockSize + gap);

    ctx.fillStyle = pieces.value[i] ? completedColor : uncompletedColor;
    ctx.fillRect(x, y, blockSize, blockSize);

    if (i === hoverIndex.value) {
      ctx.strokeStyle = "#ffc107";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 1, y - 1, blockSize + 2, blockSize + 2);
    }
  }

  ctx.restore();
}

/**
 * 响应鼠标移动定位分片索引
 */
function handleMouseMove(e) {
  const canvas = canvasRef.value;
  if (!canvas || props.pieceCount <= 0) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const cols = Math.max(1, Math.floor((rect.width + gap) / (blockSize + gap)));
  const c = Math.floor(x / (blockSize + gap));
  const r = Math.floor(y / (blockSize + gap));

  const idx = r * cols + c;
  if (idx >= 0 && idx < props.pieceCount) {
    hoverIndex.value = idx;
    renderCanvas();
  } else {
    hoverIndex.value = -1;
  }
}

watch([() => props.bitfield, () => props.pieceCount], () => {
  renderCanvas();
});

onMounted(() => {
  renderCanvas();
  window.addEventListener("resize", renderCanvas);
});

// 卸载时彻底移除全局 resize 监听，杜绝内存泄漏
onUnmounted(() => {
  window.removeEventListener("resize", renderCanvas);
});
</script>

<style scoped>
.piece-map-container {
  width: 100%;
}
.piece-map-canvas {
  display: block;
  cursor: crosshair;
}
.piece-legends {
  display: flex;
  align-items: center;
}
.piece-legend {
  display: flex;
  align-items: center;
}
.piece {
  width: 12px;
  height: 12px;
  background-color: #e9ecef;
  margin-right: 6px;
  display: inline-block;
  border-radius: 2px;
}
.piece.piece-completed {
  background-color: #20c997;
}
</style>
