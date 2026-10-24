/**
 * ==============================================================================
 * Aria2-Next 高性能 JSON-RPC 通信客户端
 * ==============================================================================
 * 支持 WebSocket 长连接（全双工、服务端事件推送）与 HTTP POST 无缝降级重试。
 * 内置请求超时管理与断线重连机制。
 * 兼容 Vue 3 响应式代理环境，避免使用无法被 Proxy 访问的 #private 私有属性语法。
 * ==============================================================================
 */

/**
 * 解密可能经过 Base64 编码的 RPC 密码令牌
 * @param {string} secret 原始或 base64 字符串
 * @returns {string} 解码后的明文 token
 */
function decodeSecret(secret) {
  if (!secret) return "";
  try {
    const decoded = atob(secret);
    // 校验是否为合规的可打印 ASCII 字符，且再次 btoa 能够完全对齐
    if (btoa(decoded) === secret && /^[\x20-\x7E]*$/.test(decoded)) {
      return decoded;
    }
  } catch (e) {}
  return secret;
}

export class Aria2Client {
  constructor(config = {}) {
    this.name = config.rpcAlias || "Aria2-Next";
    this.host = config.rpcHost || "localhost";
    this.port = config.rpcPort || "6800";
    this.path = config.rpcInterface || "jsonrpc";
    this.protocol = config.protocol || "http";
    this.secret = config.secret || "";

    this.socket = null;
    this.connected = false;
    this.connecting = false;
    this.requestId = 1;
    this.pendingRequests = new Map();
    this.eventListeners = new Map();
    this.reconnectTimer = null;
  }

  get isSecure() {
    return this.protocol === "https" || this.protocol === "wss";
  }

  get httpUrl() {
    const proto = this.isSecure ? "https" : "http";
    return `${proto}://${this.host}:${this.port}/${this.path.replace(/^\//, "")}`;
  }

  get wsUrl() {
    const proto = this.isSecure ? "wss" : "ws";
    return `${proto}://${this.host}:${this.port}/${this.path.replace(/^\//, "")}`;
  }

  updateConfig(config) {
    this.disconnect();
    this.name = config.rpcAlias || this.name;
    this.host = config.rpcHost || this.host;
    this.port = config.rpcPort || this.port;
    this.path = config.rpcInterface || this.path;
    this.protocol = config.protocol || this.protocol;
    this.secret = config.secret !== undefined ? config.secret : this.secret;
    this.connect();
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.connecting = true;
    this._emit("statusChange", "Connecting");

    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        this.connected = true;
        this.connecting = false;
        this._emit("statusChange", "Connected");
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // 处理 RPC 请求回调响应
          if (data.id !== undefined && this.pendingRequests.has(data.id)) {
            const { resolve, reject } = this.pendingRequests.get(data.id);
            this.pendingRequests.delete(data.id);
            if (data.error) {
              reject(new Error(data.error.message || `RPC Error ${data.error.code}`));
            } else {
              resolve(data.result);
            }
          }
          // 处理 Aria2 服务端推送的异步事件通知
          if (data.method && data.method.startsWith("aria2.on")) {
            const eventName = data.method.replace("aria2.", "");
            this._emit(eventName, data.params ? data.params[0] : null);
          }
        } catch (e) {
          console.warn("[Aria2Client] JSON parse error:", e);
        }
      };

      this.socket.onerror = () => {
        // WebSocket 出现异常时静默处理，降级至 HTTP 并触发后续重试
      };

      this.socket.onclose = () => {
        const wasConnected = this.connected;
        this.connected = false;
        this.connecting = false;
        if (wasConnected) {
          this._emit("statusChange", "Disconnected");
        }
        this._rejectAllPending("WebSocket connection closed");

        // 定时尝试重新建立 WebSocket 长连接
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 5000);
      };
    } catch (e) {
      this.connecting = false;
      this.connected = false;
      this._emit("statusChange", "Disconnected");
    }
  }

  disconnect() {
    clearTimeout(this.reconnectTimer);
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
    this.connecting = false;
    this._rejectAllPending("Client disconnected");
    this._emit("statusChange", "Disconnected");
  }

  _rejectAllPending(reason) {
    this.pendingRequests.forEach(({ reject }) => {
      reject(new Error(reason));
    });
    this.pendingRequests.clear();
  }

  _emit(event, payload) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((fn) => fn(payload));
    }
  }

  on(event, fn) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(fn);
  }

  off(event, fn) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(fn);
    }
  }

  /**
   * 执行 JSON-RPC 调用 (优先使用 WebSocket，降级使用 fetch HTTP POST)
   * @param {string} method Aria2 方法名
   * @param {Array} params 参数列表
   * @returns {Promise<any>}
   */
  async invoke(method, params = []) {
    const id = this.requestId++;
    const actualSecret = decodeSecret(this.secret);
    const authParams = actualSecret ? [`token:${actualSecret}`, ...params] : params;
    const payload = {
      jsonrpc: "2.0",
      id,
      method,
      params: authParams,
    };

    // 1. WebSocket 长连接优先
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(new Error(`RPC Timeout: ${method}`));
          }
        }, 10000);

        this.pendingRequests.set(id, {
          resolve: (res) => {
            clearTimeout(timeout);
            resolve(res);
          },
          reject: (err) => {
            clearTimeout(timeout);
            reject(err);
          },
        });

        this.socket.send(JSON.stringify(payload));
      });
    }

    // 2. HTTP POST 降级通道
    try {
      const response = await fetch(this.httpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || `RPC Error ${data.error.code}`);
      }

      if (!this.connected) {
        this.connected = true;
        this._emit("statusChange", "Connected");
      }

      return data.result;
    } catch (err) {
      if (this.connected) {
        this.connected = false;
        this._emit("statusChange", "Disconnected");
      }
      throw err;
    }
  }

  // ==================== Aria2 常用方法封装 ====================

  /**
   * 获取指定任务的当前状态与详情数据
   * @param {string} gid 任务 GID
   * @param {string[]} [keys] 指定返回字段列表（精简报文）
   * @returns {Promise<object>}
   */
  tellStatus(gid, keys) {
    return this.invoke("aria2.tellStatus", [gid, ...(keys ? [keys] : [])]);
  }

  /**
   * 获取当前正在下载的活跃任务列表
   * @param {string[]} [keys] 指定返回字段列表
   * @returns {Promise<object[]>}
   */
  tellActive(keys) {
    return this.invoke("aria2.tellActive", keys ? [keys] : []);
  }

  /**
   * 获取等待队列中的任务列表
   * @param {number} offset 偏移量
   * @param {number} num 数量
   * @param {string[]} [keys] 指定返回字段列表
   * @returns {Promise<object[]>}
   */
  tellWaiting(offset, num, keys) {
    return this.invoke("aria2.tellWaiting", [offset, num, ...(keys ? [keys] : [])]);
  }

  /**
   * 获取已停止/完成/出错的任务列表
   * @param {number} offset 偏移量
   * @param {number} num 数量
   * @param {string[]} [keys] 指定返回字段列表
   * @returns {Promise<object[]>}
   */
  tellStopped(offset, num, keys) {
    return this.invoke("aria2.tellStopped", [offset, num, ...(keys ? [keys] : [])]);
  }

  /**
   * 获取全局速度与任务统计
   * @returns {Promise<object>}
   */
  getGlobalStat() {
    return this.invoke("aria2.getGlobalStat");
  }

  /**
   * 获取全局配置项
   * @returns {Promise<object>}
   */
  getGlobalOption() {
    return this.invoke("aria2.getGlobalOption");
  }

  /**
   * 修改全局配置项
   * @param {object} options
   * @returns {Promise<string>}
   */
  changeGlobalOption(options) {
    return this.invoke("aria2.changeGlobalOption", [options]);
  }

  getOption(gid) {
    return this.invoke("aria2.getOption", [gid]);
  }

  changeOption(gid, options) {
    return this.invoke("aria2.changeOption", [gid, options]);
  }

  getFiles(gid) {
    return this.invoke("aria2.getFiles", [gid]);
  }

  getPeers(gid) {
    return this.invoke("aria2.getPeers", [gid]);
  }

  pause(gid) {
    return this.invoke("aria2.pause", [gid]);
  }

  pauseAll() {
    return this.invoke("aria2.pauseAll");
  }

  unpause(gid) {
    return this.invoke("aria2.unpause", [gid]);
  }

  unpauseAll() {
    return this.invoke("aria2.unpauseAll");
  }

  remove(gid) {
    return this.invoke("aria2.remove", [gid]);
  }

  removeDownloadResult(gid) {
    return this.invoke("aria2.removeDownloadResult", [gid]);
  }

  purgeDownloadResult() {
    return this.invoke("aria2.purgeDownloadResult");
  }

  addUri(uris, options = {}, position = undefined) {
    const params = [uris, options];
    if (position !== undefined) params.push(position);
    return this.invoke("aria2.addUri", params);
  }

  addTorrent(torrentBase64, uris = [], options = {}, position = undefined) {
    const params = [torrentBase64, uris, options];
    if (position !== undefined) params.push(position);
    return this.invoke("aria2.addTorrent", params);
  }

  getVersion() {
    return this.invoke("aria2.getVersion");
  }

  getSessionInfo() {
    return this.invoke("aria2.getSessionInfo");
  }

  saveSession() {
    return this.invoke("aria2.saveSession");
  }

  shutdown() {
    return this.invoke("aria2.shutdown");
  }

  forceShutdown() {
    return this.invoke("aria2.forceShutdown");
  }

  /**
   * 获取 BitTorrent 运行时会话网络与 DHT 状态 (aria2-next 支持)
   * @returns {Promise<object>}
   */
  getBtSessionStatus() {
    return this.invoke("aria2.getBtSessionStatus");
  }

  /**
   * 获取 ED2K 电驴网络运行时状态 (aria2-next 支持)
   * @returns {Promise<object>}
   */
  getEd2kStatus() {
    return this.invoke("aria2.getEd2kStatus");
  }
}
