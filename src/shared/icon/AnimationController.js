/**
 * ==============================================================================
 * 浏览器图标动态渲染控制器 (AnimationController)
 * ==============================================================================
 * 单例模式设计，负责统一协调各类扩展图标动效（下载、完成、暂停、出错、进度）
 * 内置过渡插值、优先级锁屏机制与自动回收定时器，杜绝后台服务泄露
 * ==============================================================================
 */

import {
  DownloadAnimation,
  CompleteAnimation,
  ErrorAnimation,
  ProgressAnimation,
  PauseAnimation,
} from "./Animation.js";
import { FRAME_INTERVAL, FADE_INTERVAL } from "./Constants.js";
import { IconManager } from "./IconManager.js";
import { TransitionManager } from "./TransitionManager.js";

export class AnimationController {
  static #instance = null;

  constructor() {
    // 强制单例模式
    if (AnimationController.#instance) {
      return AnimationController.#instance;
    }

    /** 动画过渡管理器 */
    this.transitionManager = new TransitionManager();
    /** 渲染循环定时器 ID */
    this.intervalId = null;
    /** 自动超时停止定时器 ID */
    this.timeoutId = null;
    /** 淡出过渡定时器 ID */
    this.fadeIntervalId = null;
    /** 进度条动画实例缓存 */
    this.progressAnimation = null;
    /** 互斥锁状态：是否处于锁定不可打断状态 */
    this.isBlocked = false;
    /** 锁定结束时间戳 */
    this.blockEndTime = 0;
    /** 具有高优先级、不可被普通状态打断的动效集合 */
    this.priorityAnimations = new Set(["Complete", "Error"]);

    AnimationController.#instance = this;
  }

  /**
   * 获取全局单例控制器实例
   * @returns {AnimationController}
   */
  static getInstance() {
    if (!AnimationController.#instance) {
      AnimationController.#instance = new AnimationController();
    }
    return AnimationController.#instance;
  }

  /**
   * 启动指定类型的图标动画
   * @param {'Download' | 'Pause' | 'Complete' | 'Error' | 'Progress'} type 动画类型
   * @param {number} [progress] 进度比例 (0.0 - 1.0)
   */
  start(type, progress) {
    const currentTime = performance.now();
    const isPriorityAnimation = this.priorityAnimations.has(type);

    // 如果处于互斥锁定中且当前请求非高优先级动画，则直接忽略
    if (
      this.isBlocked &&
      currentTime < this.blockEndTime &&
      !isPriorityAnimation
    ) {
      return;
    }

    let newAnimation = null;
    switch (type) {
      case "Download":
        newAnimation = new DownloadAnimation();
        break;
      case "Pause":
        newAnimation = new PauseAnimation();
        break;
      case "Complete":
        newAnimation = new CompleteAnimation();
        // 关键完成动效锁定半周期，防止被下一次心跳瞬间打断
        this.#setBlocked(newAnimation.duration * 0.5);
        break;
      case "Error":
        newAnimation = new ErrorAnimation();
        this.#setBlocked(newAnimation.duration * 0.5);
        break;
      case "Progress":
        if (progress < 0 || progress > 1) {
          return;
        }
        if (!this.progressAnimation) {
          this.progressAnimation = new ProgressAnimation();
        }
        newAnimation = this.progressAnimation;
        this.progressAnimation.setProgress(progress);
        break;
      default:
        throw new Error(`AnimationController: Invalid animation type: ${type}`);
    }

    const currentAnimation = this.transitionManager.isTransitioning
      ? this.transitionManager.nextAnimation
      : this.transitionManager.currentAnimation;

    // 不同动画类型之间平滑淡入过渡
    if (currentAnimation?.constructor !== newAnimation.constructor) {
      this.transitionManager.startTransition(currentAnimation, newAnimation);
    } else if (!this.transitionManager.isTransitioning) {
      this.transitionManager.currentAnimation = newAnimation;
    }

    // 清理可能正在执行的淡出循环
    if (this.fadeIntervalId) {
      clearInterval(this.fadeIntervalId);
      this.fadeIntervalId = null;
    }

    // 启动动画主渲染循环
    if (!this.intervalId) {
      this.#startAnimationLoop();
    }

    // 刷新自动停止计时器
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.timeoutId = setTimeout(() => {
      this.#stop();
    }, newAnimation.duration);
  }

  /**
   * 启动基于 FRAME_INTERVAL 的渲染循环
   */
  #startAnimationLoop() {
    this.intervalId = setInterval(async () => {
      const currentTime = performance.now();
      const imageData = this.transitionManager.requestFrame(currentTime);
      if (imageData) {
        await IconManager.setIconImage(imageData);
      }
    }, FRAME_INTERVAL);
  }

  /**
   * 设置互斥状态持续时间
   * @param {number} duration 锁定毫秒数
   */
  #setBlocked(duration) {
    this.isBlocked = true;
    this.blockEndTime = performance.now() + duration;

    setTimeout(() => {
      this.isBlocked = false;
    }, duration);
  }

  /**
   * 停止当前动画并淡出恢复默认扩展图标
   */
  async #stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.transitionManager.currentAnimation) {
      let progress = 0;
      this.fadeIntervalId = setInterval(async () => {
        progress += 0.1;
        const imageData = this.transitionManager.currentAnimation.draw(
          1 - progress,
        );
        await IconManager.setIconImage(imageData);

        if (progress >= 1) {
          clearInterval(this.fadeIntervalId);
          this.fadeIntervalId = null;
          this.transitionManager.currentAnimation = null;
          await IconManager.restore();
        }
      }, FADE_INTERVAL);
    } else {
      await IconManager.restore();
    }
  }
}
