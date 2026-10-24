<template>
  <div class="piece-map-container" ref="containerRef">
    <!-- 顶部核心指标统计卡片 -->
    <div class="row piece-stats-row mb-3">
      <!-- 单块大小 -->
      <div class="col-6 col-sm-3 mb-2">
        <div class="piece-stat-card">
          <div class="piece-stat-label text-muted small">{{ $t("Piece Length") }}</div>
          <div class="piece-stat-val font-weight-bold">
            {{ pieceLength > 0 ? formatBytes(pieceLength) : "-" }}
          </div>
        </div>
      </div>

      <!-- 分块总数 -->
      <div class="col-6 col-sm-3 mb-2">
        <div class="piece-stat-card">
          <div class="piece-stat-label text-muted small">{{ $t("Total Pieces") }}</div>
          <div class="piece-stat-val font-weight-bold">
            {{ pieceCount.toLocaleString() }}
          </div>
        </div>
      </div>

      <!-- 已完成分块 -->
      <div class="col-6 col-sm-3 mb-2">
        <div class="piece-stat-card">
          <div class="piece-stat-label text-muted small">{{ $t("Completed Pieces") }}</div>
          <div class="piece-stat-val font-weight-bold text-success">
            {{ completedPieces.toLocaleString() }}
          </div>
        </div>
      </div>

      <!-- 分块完成率 -->
      <div class="col-6 col-sm-3 mb-2">
        <div class="piece-stat-card">
          <div class="piece-stat-label text-muted small">{{ $t("Completion Rate") }}</div>
          <div class="piece-stat-val font-weight-bold text-primary">
            {{ completionRate }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 图例栏与实时悬浮分块详细信息提示 -->
    <div class="piece-legends-bar d-flex flex-wrap align-items-center justify-content-between mb-2">
      <!-- 左侧：图例展示 -->
      <div class="piece-legends d-flex align-items-center">
        <div class="piece-legend d-flex align-items-center mr-3">
          <div class="piece piece-completed mr-1"></div>
          <span class="small">{{ $t("Completed") }} ({{ completedPieces.toLocaleString() }})</span>
        </div>
        <div class="piece-legend d-flex align-items-center">
          <div class="piece mr-1"></div>
          <span class="small">{{ $t("Uncompleted") }} ({{ (pieceCount - completedPieces).toLocaleString() }})</span>
        </div>
      </div>

      <!-- 右侧：分块悬浮提示信息（编号、状态与对应数据偏移区间） -->
      <div class="piece-hover-info small">
        <template v-if="hoverIndex >= 0">
          <span class="badge badge-secondary mr-1">#{{ hoverIndex }}</span>
          <span :class="isPieceCompleted(hoverIndex) ? 'text-success font-weight-bold' : 'text-muted'">
            {{ isPieceCompleted(hoverIndex) ? $t("Completed") : $t("Uncompleted") }}
          </span>
          <span v-if="hoverPieceRange" class="ml-2 font-monospace text-muted">
            [{{ hoverPieceRange }}]
          </span>
        </template>
        <span v-else class="text-muted">
          <i class="fa fa-info-circle mr-1"></i>{{ $t("Hover piece to view details") }}
        </span>
      </div>
    </div>

    <!-- 高性能 Canvas 分片渲染画布容器（超大文件自适应内嵌滚动） -->
    <div class="piece-canvas-wrapper" ref="wrapperRef">
      <canvas
        ref="canvasRef"
        class="piece-map-canvas"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      ></canvas>
    </div>
  </div>
</template>

<script setup>
/**
 * ==============================================================================
 * BT / 多分片下载分片地图组件 (PieceMap)
 * ==============================================================================
 * 1. 基于原生 HTML5 Canvas 2D 渲染海量分片区块（可支撑数万分片无需创建任何 DOM 元素）
 * 2. 结合 ResizeObserver 精确感知容器可见性与宽度变化，彻底消除切换 Tab 时因宽度为 0 导致的折行错位
 * 3. 支持分块大小、总数、完成率统计与鼠标悬停字节偏移区间查看
 * ==============================================================================
 */

import { ref, onMounted, onUnmounted, watch, computed, nextTick } from "vue";
import { parseBitfield, formatBytes } from "../utils/format";

const props = defineProps({
  /** Aria2 十六进制 bitfield 编码字符串 */
  bitfield: { type: String, default: "" },
  /** 分片总数量 */
  pieceCount: { type: Number, default: 0 },
  /** 单个分片大小（字节） */
  pieceLength: { type: Number, default: 0 },
  /** 任务总文件大小（字节） */
  totalLength: { type: Number, default: 0 },
  /** 任务当前状态 */
  taskStatus: { type: String, default: "" },
  /** 当前 Tab 是否处于激活显示状态 */
  active: { type: Boolean, default: false },
});

const containerRef = ref(null);
const wrapperRef = ref(null);
const canvasRef = ref(null);
const hoverIndex = ref(-1);

/** 将 bitfield 解析为布尔状态数组 */
const pieces = computed(() => {
  // 如果任务已彻底完成，全部区块标为完成
  if (props.taskStatus?.toLowerCase() === "complete") {
    return new Array(props.pieceCount).fill(true);
  }
  const parsed = parseBitfield(props.bitfield, props.pieceCount);
  if (parsed.length === 0 && props.pieceCount > 0 && props.bitfield) {
    return new Array(props.pieceCount).fill(false);
  }
  return parsed;
});

/** 已下载完成的分片总数 */
const completedPieces = computed(() => {
  if (props.taskStatus?.toLowerCase() === "complete") {
    return props.pieceCount;
  }
  return pieces.value.filter(Boolean).length;
});

/** 分片完成百分比 */
const completionRate = computed(() => {
  if (props.pieceCount <= 0) return "0.00";
  return ((completedPieces.value / props.pieceCount) * 100).toFixed(2);
});

/** 判断某个分片是否已完成 */
function isPieceCompleted(idx) {
  if (props.taskStatus?.toLowerCase() === "complete") return true;
  return !!pieces.value[idx];
}

/** 计算当前悬浮分块的数据偏移范围 */
const hoverPieceRange = computed(() => {
  if (hoverIndex.value < 0 || props.pieceLength <= 0) return "";
  const start = hoverIndex.value * props.pieceLength;
  let end = (hoverIndex.value + 1) * props.pieceLength - 1;
  if (props.totalLength > 0 && end >= props.totalLength) {
    end = props.totalLength - 1;
  }
  return `${formatBytes(start)} ~ ${formatBytes(end)}`;
});

const blockSize = 13;
const gap = 2;
let resizeObserver = null;

/** 实际网格排布尺寸与列数（供鼠标交互与高亮渲染严格保持一致） */
const currentCols = ref(1);
const currentRows = ref(1);
const currentGridWidth = ref(0);
const currentGridHeight = ref(0);

/**
 * 重新计算 Canvas 视口并绘制所有分片网格
 */
function renderCanvas() {
  const canvas = canvasRef.value;
  const container = wrapperRef.value || containerRef.value;
  if (!canvas || !container || props.pieceCount <= 0) return;

  // 严格扣除容器内边距（padding），获取画布实际可用内容区域宽度，杜绝最后一个分块溢出被裁切
  const computedStyle = window.getComputedStyle(container);
  const padLeft = parseFloat(computedStyle.paddingLeft) || 0;
  const padRight = parseFloat(computedStyle.paddingRight) || 0;
  const availWidth = Math.max(0, Math.floor(container.clientWidth - padLeft - padRight));

  // 若当前容器尚未完全渲染（例如切换 Tab 瞬间处于 display:none，clientWidth 为 0），跳过本次绘制，等待 ResizeObserver 唤醒
  if (availWidth <= 0) return;

  const cols = Math.max(1, Math.floor((availWidth + gap) / (blockSize + gap)));
  const rows = Math.ceil(props.pieceCount / cols);
  const gridWidth = cols * (blockSize + gap) - gap;
  const gridHeight = rows * (blockSize + gap) - gap;

  // 记录实际网格排布尺寸供鼠标交互精准对齐使用
  currentCols.value = cols;
  currentRows.value = rows;
  currentGridWidth.value = gridWidth;
  currentGridHeight.value = gridHeight;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = gridWidth * dpr;
  canvas.height = gridHeight * dpr;
  canvas.style.width = `${gridWidth}px`;
  canvas.style.height = `${gridHeight}px`;

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, gridWidth, gridHeight);

  const isDark = document.documentElement.classList.contains("dark-theme");
  const uncompletedColor = isDark ? "#2a2d35" : "#e9ecef";
  const completedColor = "#20c997"; // 经典翠绿

  for (let i = 0; i < props.pieceCount; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = c * (blockSize + gap);
    const y = r * (blockSize + gap);

    ctx.fillStyle = isPieceCompleted(i) ? completedColor : uncompletedColor;
    ctx.fillRect(x, y, blockSize, blockSize);
  }

  // 置顶绘制鼠标悬停黄色高亮边框，避免被后续分块边缘绘制遮挡
  if (hoverIndex.value >= 0 && hoverIndex.value < props.pieceCount) {
    const hr = Math.floor(hoverIndex.value / cols);
    const hc = hoverIndex.value % cols;
    const hx = hc * (blockSize + gap);
    const hy = hr * (blockSize + gap);
    ctx.strokeStyle = "#ffc107";
    ctx.lineWidth = 2;
    ctx.strokeRect(hx - 1, hy - 1, blockSize + 2, blockSize + 2);
  }

  ctx.restore();
}

/**
 * 响应鼠标移动精确定位分片索引
 */
function handleMouseMove(e) {
  const canvas = canvasRef.value;
  if (!canvas || props.pieceCount <= 0 || currentCols.value <= 0) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width > 0 ? currentGridWidth.value / rect.width : 1;
  const scaleY = rect.height > 0 ? currentGridHeight.value / rect.height : 1;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  const cols = currentCols.value;
  const c = Math.floor(x / (blockSize + gap));
  const r = Math.floor(y / (blockSize + gap));

  // 边界保护：若鼠标在网格列数/行数之外，或在右侧尾部留白处，清除高亮
  if (c < 0 || c >= cols || r < 0 || r >= currentRows.value) {
    if (hoverIndex.value !== -1) {
      hoverIndex.value = -1;
      renderCanvas();
    }
    return;
  }

  const idx = r * cols + c;
  if (idx >= 0 && idx < props.pieceCount) {
    if (hoverIndex.value !== idx) {
      hoverIndex.value = idx;
      renderCanvas();
    }
  } else {
    if (hoverIndex.value !== -1) {
      hoverIndex.value = -1;
      renderCanvas();
    }
  }
}

/**
 * 鼠标离开画布时清除高亮
 */
function handleMouseLeave() {
  if (hoverIndex.value !== -1) {
    hoverIndex.value = -1;
    renderCanvas();
  }
}

// 监听 bitfield / pieceCount / taskStatus 更新
watch(
  [() => props.bitfield, () => props.pieceCount, () => props.taskStatus],
  () => {
    nextTick(() => renderCanvas());
  }
);

// 监听 Tab 激活状态：由隐藏变为显示时立即刷新画布
watch(
  () => props.active,
  (isActive) => {
    if (isActive) {
      nextTick(() => renderCanvas());
    }
  }
);

onMounted(() => {
  nextTick(() => renderCanvas());

  // 绑定 ResizeObserver 实时监听滚动包裹容器尺寸及 display 显隐状态切换
  if (window.ResizeObserver) {
    const observeTarget = wrapperRef.value || containerRef.value;
    if (observeTarget) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            renderCanvas();
          }
        }
      });
      resizeObserver.observe(observeTarget);
    }
  }

  window.addEventListener("resize", renderCanvas);
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  window.removeEventListener("resize", renderCanvas);
});
</script>

<style scoped>
.piece-map-container {
  width: 100%;
}

/* 顶部统计卡片样式 */
.piece-stat-card {
  background-color: var(--card-bg, #f8f9fa);
  border: 1px solid var(--border-color, #e9ecef);
  border-radius: 4px;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.piece-stat-label {
  font-size: 12px;
  margin-bottom: 2px;
}

.piece-stat-val {
  font-size: 15px;
  line-height: 1.2;
}

/* 图例栏 */
.piece-legends-bar {
  min-height: 28px;
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
  width: 11px;
  height: 11px;
  background-color: #e9ecef;
  display: inline-block;
  border-radius: 2px;
}

.piece.piece-completed {
  background-color: #20c997;
}

/* 画布滚动容器：防止超多区块导致高度溢出页面 */
.piece-canvas-wrapper {
  width: 100%;
  max-height: 480px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid var(--border-color, #e9ecef);
  border-radius: 4px;
  background-color: var(--canvas-bg, #fafbfc);
  padding: 8px;
}

.piece-map-canvas {
  display: block;
  cursor: crosshair;
}

/* 暗色主题深度适配 */
:global(.dark-theme) .piece-stat-card {
  --card-bg: #242424;
  --border-color: #3c3d3e;
}

:global(.dark-theme) .piece-canvas-wrapper {
  --canvas-bg: #1e1e1e;
  --border-color: #333333;
}

:global(.dark-theme) .piece:not(.piece-completed) {
  background-color: #2a2d35;
}
</style>
