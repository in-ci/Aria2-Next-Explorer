/**
 * ==============================================================================
 * 后台 Aria2 状态监控管理器 (MonitorManager)
 * ==============================================================================
 * 负责定时探测 Aria2 状态、动态计算全局速度与任务计数、
 * 触发浏览器工具栏图标动效、更新 Badge 提示、维护系统防休眠策略。
 * 深度优化：缓存 Badge 与标题状态，避免高频触发 Chrome IPC 调用。
 * ==============================================================================
 */

import Utils from "../shared/utils.js";
import Logger from "../shared/logger.js";
import Aria2 from "../shared/aria2.js";
import { ConfigService } from "../shared/services/ConfigService.js";

/** 高速活动状态下的轮询心跳间隔 (1秒) */
const INTERVAL_SHORT = 1000;
/** 空闲/休眠状态下的长轮询心跳间隔 (3秒) */
const INTERVAL_LONG = 3000;

export class MonitorManager {
  /**
   * @param {import("./NotificationManager.js").NotificationManager} notificationManager
   */
  constructor(notificationManager) {
    this.configService = ConfigService.getInstance();
    this.notificationManager = notificationManager;
    /** 监控轮询定时器 ID */
    this.monitorId = null;
    /** 当前动态心跳间隔 (毫秒) */
    this.monitorInterval = INTERVAL_LONG;
    /** 远程 Aria2 客户端连接实例数组 */
    this.remoteAria2List = [new Aria2()];
    /** 与通知管理器共享的浏览器图标动画控制器 */
    this.iconAnimController = notificationManager.getAnimationController();
    /** 缓存绑定的状态消息回调函数句柄 */
    this.boundMessageHandler = this.notificationManager.notifyTaskStatus.bind(
      this.notificationManager,
    );
    /** 缓存上一次的 Badge 状态，避免每秒向 Chrome 发送无变动的 IPC 消息 */
    this.lastBadgeState = {
      text: null,
      bgColor: null,
      textColor: null,
      title: null,
    };
    /** 上一次的活跃任务进度百分比 */
    this.lastPercentActive = -1;
  }

  /**
   * 初始化并同步远程 RPC 服务器连接列表
   */
  initRemoteAria2List() {
    const config = this.configService.get();
    const uniqueRpcList = Utils.compactRpcList(config.rpcList || []);

    const newRemoteList = [];
    for (let i = 0; i < uniqueRpcList.length; i++) {
      const rpcItem = uniqueRpcList[i];
      try {
        const remote = Utils.parseUrl(rpcItem.url);
        remote.name = rpcItem.name;
        newRemoteList.push(new Aria2(remote));
      } catch (error) {
        Logger.error("初始化 Aria2-Next RPC 服务器失败:", error.message);
      }
    }

    // 若无有效配置，保底添加默认本地 Aria2 实例，防止空指针异常
    if (newRemoteList.length === 0) {
      newRemoteList.push(new Aria2());
    }

    this.remoteAria2List = newRemoteList;
    this.processMessageHandlers(config.allowNotification);
  }

  /**
   * 绑定或解绑任务完成通知监听器
   * @param {boolean} allowNotification 是否允许发送通知
   */
  processMessageHandlers(allowNotification) {
    for (const remote of this.remoteAria2List) {
      if (allowNotification) {
        Logger.log(
          "[MonitorManager] Registering message handler for",
          remote.name,
        );
        remote.regMessageHandler(this.boundMessageHandler);
      } else {
        Logger.log(
          "[MonitorManager] Unregistering message handler for",
          remote.name,
        );
        remote.unRegMessageHandler(this.boundMessageHandler);
      }
    }
  }

  /**
   * 开启后台监控定时心跳
   */
  enable() {
    if (this.monitorId) {
      Logger.warn("Warn: Monitor has already started.");
      return;
    }

    this.#monitor();
    this.monitorId = setInterval(() => this.#monitor(), this.monitorInterval);
  }

  /**
   * 停止后台监控并清理所有连接与 Badge 状态
   */
  disable() {
    if (this.monitorId) {
      clearInterval(this.monitorId);
      this.monitorId = null;
    }

    this.remoteAria2List.forEach((aria2) => aria2.closeSocket());
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setTitle({ title: "" });
    chrome.power.releaseKeepAwake();

    this.lastBadgeState = {
      text: "",
      bgColor: "",
      textColor: "",
      title: "",
    };
    this.lastPercentActive = -1;
  }

  /**
   * 获取远程 Aria2 客户端实例列表
   * @returns {Aria2[]}
   */
  getRemoteAria2List() {
    return this.remoteAria2List;
  }

  /**
   * 核心监控探测执行函数
   */
  async #monitor() {
    const config = this.configService.get();
    const stats = {
      connected: 0,
      disconnected: 0,
      localConnected: 0,
      active: 0,
      stopped: 0,
      waiting: 0,
      uploadSpeed: 0,
      downloadSpeed: 0,
      errorMessage: "",
    };

    for (const i in this.remoteAria2List) {
      const remoteAria2 = this.remoteAria2List[i];

      try {
        remoteAria2.openSocket();
        const response = await remoteAria2.getGlobalStat();

        if (response?.error) {
          throw response.error;
        }

        stats.connected++;
        if (remoteAria2.isLocalhost) stats.localConnected++;

        stats.active += Number(response.result.numActive);
        stats.stopped += Number(response.result.numStopped);
        stats.waiting += Number(response.result.numWaiting);
        stats.uploadSpeed += Number(response.result.uploadSpeed);
        stats.downloadSpeed += Number(response.result.downloadSpeed);

        // 处理图标进度条动效（默认主 Aria2 服务且存在活动下载时触发）
        if (i == 0 && response.result.percentActive) {
          const numActive = Number(response.result.numActive);
          const percent = Number(response.result.percentActive);

          if (numActive > 0 && !isNaN(percent)) {
            if (Math.abs(percent - this.lastPercentActive) >= 0.5) {
              this.lastPercentActive = percent;
              this.iconAnimController.start("Progress", percent / 100);
            }
          }
        }
      } catch (error) {
        stats.disconnected++;
        if (i == 0) {
          stats.errorMessage = this.#parseMonitorError(error);
        }
      } finally {
        if (!config.monitorAria2) {
          remoteAria2.closeSocket();
        }
        if (!config.monitorAll) break;
      }
    }

    this.#updateMonitorInterval(stats.active);
    this.#updatePowerState(stats.active, stats.waiting, stats.localConnected);
    this.#updateIconAnimation(stats.active, stats.waiting);
    this.#updateBadgeAndTitle(stats);
  }

  /**
   * 解析监控连接错误信息
   * @param {Error} error
   * @returns {string}
   */
  #parseMonitorError(error) {
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("unauthorized")) {
      return "Secret key 密钥错误";
    } else if (msg.includes("failed to fetch")) {
      return "Aria2-Next 服务器无法连接";
    }
    return "";
  }

  /**
   * 根据当前活动下载任务数，自适应动态调节轮询心跳频率
   * @param {number} active 活跃任务数量
   */
  #updateMonitorInterval(active) {
    const newInterval = active > 0 ? INTERVAL_SHORT : INTERVAL_LONG;

    if (this.monitorInterval !== newInterval) {
      this.monitorInterval = newInterval;
      clearInterval(this.monitorId);
      this.monitorId = setInterval(() => this.#monitor(), this.monitorInterval);
    }
  }

  /**
   * 更新系统防休眠保持锁
   * @param {number} active 活跃任务数
   * @param {number} waiting 等待任务数
   * @param {number} localConnected 本地连接数
   */
  #updatePowerState(active, waiting, localConnected) {
    const config = this.configService.get();

    if (active > 0 && config.keepAwake && localConnected > 0) {
      chrome.power.requestKeepAwake("system");
    } else {
      chrome.power.releaseKeepAwake();
    }
  }

  /**
   * 触发图标暂停等静态指示状态
   * @param {number} active 活跃数
   * @param {number} waiting 等待数
   */
  #updateIconAnimation(active, waiting) {
    if (active === 0 && waiting > 0) {
      this.iconAnimController.start("Pause");
    }
  }

  /**
   * 高性能更新 Badge 文本、背景色与 Tooltip 标题（仅当内容变化时调用 Chrome IPC）
   * @param {object} stats
   */
  #updateBadgeAndTitle(stats) {
    const config = this.configService.get();

    if (!config.monitorAria2) return;

    const {
      connected,
      disconnected,
      active,
      waiting,
      stopped,
      uploadSpeed,
      downloadSpeed,
      errorMessage,
      localConnected,
    } = stats;

    let bgColor = "green";
    let textColor = "white";
    let text = "";
    let title = "";

    const connectedStr = chrome.i18n.getMessage("connected");
    const disconnectedStr = chrome.i18n.getMessage("disconnected");

    if (config.monitorAll) {
      title = `${connectedStr}: ${connected} ${disconnectedStr}: ${disconnected}\n`;
    }

    if (connected > 0) {
      text = this.#getBadgeText(active, waiting, connected);
      bgColor = this.#getBadgeColor(active, waiting, connected);
      textColor = active === 0 && waiting === 0 ? "#666" : "white";

      const uploadStr = chrome.i18n.getMessage("upload");
      const downloadStr = chrome.i18n.getMessage("download");
      const waitStr = chrome.i18n.getMessage("wait");
      const finishStr = chrome.i18n.getMessage("finish");

      const upSpeed = Utils.getReadableSpeed(uploadSpeed);
      const downSpeed = Utils.getReadableSpeed(downloadSpeed);

      title += `${downloadStr}: ${active}  ${waitStr}: ${waiting}  ${finishStr}: ${stopped}\n`;
      title += `${uploadStr}: ${upSpeed}  ${downloadStr}: ${downSpeed}`;
    } else {
      if (localConnected === 0) chrome.power.releaseKeepAwake();
      bgColor = "#A83030";
      text = "E";
      const serverName = this.remoteAria2List?.[0]?.name || "Aria2-Next";
      title += config.monitorAll
        ? "所有 Aria2-Next 服务器均无法连接。"
        : `连接 ${serverName} 失败: ${errorMessage || "网络超时或服务未启动"}。`;
    }

    // 状态脏检查：仅当发生实质变化时触发 Chrome 扩展 API IPC 通信
    if (this.lastBadgeState.textColor !== textColor) {
      chrome.action.setBadgeTextColor({ color: textColor });
      this.lastBadgeState.textColor = textColor;
    }
    if (this.lastBadgeState.bgColor !== bgColor) {
      chrome.action.setBadgeBackgroundColor({ color: bgColor });
      this.lastBadgeState.bgColor = bgColor;
    }
    if (this.lastBadgeState.text !== text) {
      chrome.action.setBadgeText({ text });
      this.lastBadgeState.text = text;
    }
    if (this.lastBadgeState.title !== title) {
      chrome.action.setTitle({ title });
      this.lastBadgeState.title = title;
    }
  }

  /**
   * 计算 Badge 提示文字
   * @param {number} active 活跃数
   * @param {number} waiting 等待数
   * @param {number} connected 已连接服务器数
   * @returns {string}
   */
  #getBadgeText(active, waiting, connected) {
    const config = this.configService.get();

    if (!config.badgeText) return "";
    if (active > 0) return active.toString();
    if (waiting > 0) return waiting.toString();
    return "0";
  }

  /**
   * 计算 Badge 徽标背景色
   * @param {number} active 活跃数
   * @param {number} waiting 等待数
   * @param {number} connected 已连接服务器数
   * @returns {string}
   */
  #getBadgeColor(active, waiting, connected) {
    const config = this.configService.get();

    if (active > 0) {
      return config.monitorAll && connected < this.remoteAria2List.length
        ? "#0077cc"
        : "green";
    }
    if (waiting > 0) return "#AAA";
    return "#E1EEF5";
  }
}
