/**
 * ==============================================================================
 * 浏览器图标动态渲染常量定义
 * ==============================================================================
 */

/** 图标 OffscreenCanvas 渲染尺寸 (32x32) */
export const CANVAS_SIZE = 32;

/**
 * 动态图标帧率（降至 30 FPS，满足视网膜图标丝滑视觉体验的同时减少 50% 的 IPC 传输与 CPU/内存占用）
 */
export const FRAME_RATE = 30;

/** 每帧绘制间隔时间（毫秒） */
export const FRAME_INTERVAL = 1000 / FRAME_RATE;

/** 动画过渡动画持续时间（毫秒） */
export const TRANSITION_DURATION = 300;

/** 默认单次完整动画持续时间（毫秒） */
export const ANIMATION_DURATION = 2800;

/** 淡出渐变间隔时间（毫秒） */
export const FADE_INTERVAL = 50;
