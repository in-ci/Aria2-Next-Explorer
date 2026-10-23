/**
 * ==============================================================================
 * 高性能原生 HTML5 Canvas 实时速度曲线微图表
 * ==============================================================================
 * 彻底替换 1MB 的 Apache ECharts 运行时！
 * 纯原生 Canvas 2D 渲染，零外部依赖，常驻内存极小，支持暗色/亮色自适应与视网膜高分屏。
 * ==============================================================================
 */

import { formatBytes } from "./format";

export class SpeedCanvasChart {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} options
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.history = []; // [{ down: number, up: number, time: number }]
    this.maxPoints = options.maxPoints || 60; // 默认保留 60 秒历史
    this.isDark = options.isDark ?? false;
    this.hoverIndex = -1;

    this._initEvents();
  }

  setTheme(isDark) {
    this.isDark = isDark;
    this.render();
  }

  setHistory(historyData) {
    this.history = Array.isArray(historyData) ? [...historyData] : [];
    this.render();
  }

  /**
   * 追加新数据点
   * @param {number} downSpeed 当前下载速度 (B/s)
   * @param {number} upSpeed 当前上传速度 (B/s)
   */
  addDataPoint(downSpeed, upSpeed) {
    const now = Date.now();
    this.history.push({
      down: Number(downSpeed) || 0,
      up: Number(upSpeed) || 0,
      time: now,
    });

    if (this.history.length > this.maxPoints) {
      this.history.shift();
    }

    this.render();
  }

  _initEvents() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const count = this.history.length;
      if (count < 2) return;

      const paddingLeft = 60;
      const paddingRight = 15;
      const chartWidth = rect.width - paddingLeft - paddingRight;

      if (x >= paddingLeft && x <= rect.width - paddingRight) {
        const ratio = (x - paddingLeft) / chartWidth;
        this.hoverIndex = Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1))));
        this.render();
      }
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.hoverIndex = -1;
      this.render();
    });
  }

  render() {
    const canvas = this.canvas;
    const ctx = this.ctx;
    if (!canvas || !ctx) return;

    // 高分屏缩放适配
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : (canvas.clientWidth || 320);
    const height = rect.height > 0 ? rect.height : (canvas.clientHeight || 165);

    const displayW = Math.round(width * dpr);
    const displayH = Math.round(height * dpr);

    if (canvas.width !== displayW || canvas.height !== displayH) {
      canvas.width = displayW;
      canvas.height = displayH;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 15, right: 15, bottom: 25, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    if (this.history.length === 0) {
      ctx.fillStyle = this.isDark ? "#888" : "#999";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Waiting for speed data...", width / 2, height / 2);
      ctx.restore();
      return;
    }

    // 计算最大峰值速度用于 Y 轴归一化
    let maxSpeed = 1024 * 50; // 最低 50 KB/s 保底尺度
    for (const p of this.history) {
      if (p.down > maxSpeed) maxSpeed = p.down;
      if (p.up > maxSpeed) maxSpeed = p.up;
    }
    maxSpeed *= 1.15; // 增加 15% 顶部空间

    // 绘制横向网格参考线
    ctx.strokeStyle = this.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;
    const gridLines = 4;
    ctx.fillStyle = this.isDark ? "#9aa0a6" : "#6c757d";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const speedVal = maxSpeed * (1 - i / gridLines);
      ctx.fillText(`${formatBytes(speedVal)}/s`, padding.left - 6, y + 3);
    }

    // 绘制曲线与渐变区域函数
    const drawSeries = (key, strokeColor, fillColor) => {
      const pts = [];
      const count = this.history.length;
      for (let i = 0; i < count; i++) {
        const x = count > 1
          ? padding.left + (chartW / (count - 1)) * i
          : padding.left;
        const val = this.history[i][key];
        const y = padding.top + chartH - (val / maxSpeed) * chartH;
        pts.push({ x, y });
      }

      if (pts.length === 0) return [];

      // 渐变填充背景
      ctx.beginPath();
      ctx.moveTo(pts[0].x, padding.top + chartH);
      for (let i = 0; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.lineTo(pts[pts.length - 1].x, padding.top + chartH);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      grad.addColorStop(0, fillColor);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fill();

      // 绘制光滑线条
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      return pts;
    };

    // 下载: 绿色 (#28a745 / #20c997)
    const downColor = this.isDark ? "#20c997" : "#28a745";
    const downFill = this.isDark ? "rgba(32, 201, 151, 0.22)" : "rgba(40, 167, 69, 0.15)";
    const downPts = drawSeries("down", downColor, downFill);

    // 上传: 蓝色 (#007bff / #38bdf8)
    const upColor = this.isDark ? "#38bdf8" : "#007bff";
    const upFill = this.isDark ? "rgba(56, 189, 248, 0.2)" : "rgba(0, 123, 255, 0.15)";
    const upPts = drawSeries("up", upColor, upFill);

    // 绘制悬停指示标尺与 Tooltip
    if (this.hoverIndex >= 0 && this.hoverIndex < this.history.length && downPts.length > this.hoverIndex) {
      const idx = this.hoverIndex;
      const ptDown = downPts[idx];
      const ptUp = upPts[idx];
      const x = ptDown.x;

      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartH);
      ctx.strokeStyle = this.isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)";
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 绘制数据圆点
      const drawDot = (pt, color) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      };

      drawDot(ptDown, downColor);
      drawDot(ptUp, upColor);

      // 浮层信息框
      const curData = this.history[idx];
      const tooltipDown = `↓ ${formatBytes(curData.down)}/s`;
      const tooltipUp = `↑ ${formatBytes(curData.up)}/s`;

      const tipW = 110;
      const tipH = 46;
      let tipX = x + 10;
      if (tipX + tipW > width - padding.right) tipX = x - tipW - 10;
      const tipY = padding.top + 8;

      ctx.fillStyle = this.isDark ? "rgba(30, 30, 30, 0.92)" : "rgba(255, 255, 255, 0.95)";
      ctx.strokeStyle = this.isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(tipX, tipY, tipW, tipH, 4);
      } else {
        ctx.rect(tipX, tipY, tipW, tipH);
      }
      ctx.fill();
      ctx.stroke();

      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = downColor;
      ctx.fillText(tooltipDown, tipX + 8, tipY + 18);
      ctx.fillStyle = upColor;
      ctx.fillText(tooltipUp, tipX + 8, tipY + 36);
    }

    ctx.restore();
  }
}
