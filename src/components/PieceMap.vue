<template>
  <div class="piece-map-container" ref="containerRef">
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

    <canvas
      ref="canvasRef"
      class="piece-map-canvas"
      @mousemove="handleMouseMove"
      @mouseleave="hoverIndex = -1"
    ></canvas>

    <div v-if="hoverIndex >= 0" class="piece-hover-tip text-muted small mt-1">
      Piece #{{ hoverIndex }}: {{ isPieceCompleted(hoverIndex) ? $t("Completed") : $t("Uncompleted") }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { parseBitfield } from "../utils/format";

const props = defineProps({
  bitfield: { type: String, default: "" },
  pieceCount: { type: Number, default: 0 },
});

const containerRef = ref(null);
const canvasRef = ref(null);
const hoverIndex = ref(-1);

const pieces = computed(() => {
  return parseBitfield(props.bitfield, props.pieceCount);
});

const completedPieces = computed(() => {
  return pieces.value.filter(Boolean).length;
});

function isPieceCompleted(idx) {
  return !!pieces.value[idx];
}

const blockSize = 14;
const gap = 3;

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
  const completedColor = "#20c997"; // 浅绿 / 主题绿

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
