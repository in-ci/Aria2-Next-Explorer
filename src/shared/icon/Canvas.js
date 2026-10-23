/**
 * ==============================================================================
 * 动态图标 OffscreenCanvas 离屏渲染封装
 * ==============================================================================
 */

import { CANVAS_SIZE } from "./Constants.js";

export class Canvas {
  constructor() {
    /** 离屏 Canvas 画布 */
    this.canvas = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE);

    /**
     * 启用 willReadFrequently: true 优化频繁 getImageData 读取操作
     * 避免频繁发生 CPU-GPU 间的显存纹理回读，大幅降低内存与能耗
     */
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
  }

  /**
   * 清理当前离屏画布
   */
  clear() {
    this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  /**
   * 获取当前画布图像原始像素数据 (ImageData)
   * @returns {ImageData}
   */
  getImageData() {
    return this.ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  /**
   * 获取 2D 绘图上下文
   * @returns {OffscreenCanvasRenderingContext2D}
   */
  getContext() {
    return this.ctx;
  }

  /**
   * 获取底层 OffscreenCanvas 对象
   * @returns {OffscreenCanvas}
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * 获取画布尺寸
   * @returns {number}
   */
  getSize() {
    return CANVAS_SIZE;
  }
}
