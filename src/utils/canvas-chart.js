/**
 * ==============================================================================
 * 高性能原生 HTML5 Canvas 实时速度曲线微图表
 * ==============================================================================
 * 彻底替换 1MB 的 Apache ECharts 运行时！
 * 纯原生 Canvas 2D 渲染，零外部依赖，常驻内存极小，支持暗色/亮色自适应与视网膜高分屏。
 * 具备完整的 destroy 资源销毁能力，杜绝内存泄漏。
 * ==============================================================================
 */

import { formatBytes } from "./format";

export class SpeedCanvasChart {
  /**
   * @param {HTMLCanvasElement} canvas 画布 DOM 元素
   * @param {object} options 配置选项
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    /** 速度历史数据队列 [{ down: number, up: number, time: number }] */
    this.history = [];
    /** 最多保留的数据点数 (默认 60 点，对应 60 秒) */
    this.maxPoints = options.maxPoints || 60;
    /** 是否为暗色主题模式 */
    this.isDark = options.isDark ?? false;
    /** 当前鼠标悬停的数据点索引 (-1 表示未悬停) */
    this.hoverIndex = -1;

    // 绑定事件处理器句柄，便于后续精准移除
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseLeave = this._handleMouseLeave.bind(this);

    this._initEvents();
  }

  /**
   * 动态切换亮色 / 暗色图表配色主题
   * @param {boolean} isDark
   */
  setTheme(isDark) {
    this.isDark = isDark;
    this.render();
  }

  /**
   * 全量替换速度历史队列并重绘
   * @param {Array<{down: number, up: number, time: number}>} historyData
   */
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

  /**
   * 绑定 Canvas 鼠标交互监听
   */
  _initEvents() {
    if (!this.canvas) return;
    this.canvas.addEventListener("mousemove", this._onMouseMove);
    this.canvas.addEventListener("mouseleave", this._onMouseLeave);
  }

  /**
   * 处理鼠标移动悬停指示
   */
  _handleMouseMove(e) {
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
  }

  /**
   * 处理鼠标移出图表画布
   */
  _handleMouseLeave() {
    this.hoverIndex = -1;
    this.render();
  }

  /**
   * 核心重绘函数
   */
  render() {
    const canvas = this.canvas;
    const ctx = this.ctx;
    if (!canvas || !ctx) return;

    // 高分屏视网膜缩放适配
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

    // 计算当前历史的最大峰值速度，用于动态 Y 轴标尺归一化
    let maxSpeed = 1024 * 50; // 最低 50 KB/s 尺度下限
    for (const p of this.history) {
      if (p.down > maxSpeed) maxSpeed = p.down;
      if (p.up > maxSpeed) maxSpeed = p.up;
    }
    maxSpeed *= 1.15; // 预留 15% 顶部缓冲区

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

    // 绘制曲线与半透明渐变区域通用函数
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

      // 绘制平滑线条
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

    // 下载折线: 经典绿 / 荧光翠绿
    const downColor = this.isDark ? "#20c997" : "#28a745";
    const downFill = this.isDark ? "rgba(32, 201, 151, 0.22)" : "rgba(40, 167, 69, 0.15)";
    const downPts = drawSeries("down", downColor, downFill);

    // 上传折线: 经典蓝 / 天空蓝
    const upColor = this.isDark ? "#38bdf8" : "#007bff";
    const upFill = this.isDark ? "rgba(56, 189, 248, 0.2)" : "rgba(0, 123, 255, 0.15)";
    const upPts = drawSeries("up", upColor, upFill);

    // 绘制鼠标悬停指示标尺与 Tooltip 数据浮层
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

      // 绘制数据交叉圆点
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

      // 浮层提示信息框
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

  /**
   * 销毁图表实例并解除全部 DOM 事件监听，彻底释放内存
   */
  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener("mousemove", this._onMouseMove);
      this.canvas.removeEventListener("mouseleave", this._onMouseLeave);
      this.canvas = null;
    }
    this.ctx = null;
    this.history = [];
  }
}
