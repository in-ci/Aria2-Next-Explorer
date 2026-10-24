<template>
  <section class="content no-padding">
    <div class="settings-table striped hoverable p-3">
      <!-- ===================================================================== -->
      <!-- 1. 核心引擎与连接信息 (Core Engine & Connection)                      -->
      <!-- ===================================================================== -->
      <div class="status-section-header">
        <i class="fa fa-server mr-2 text-primary"></i>
        <span>{{ $t("Core Engine & Connection") }}</span>
      </div>

      <!-- 核心产品名称 -->
      <div class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Product") }}</div>
        <div class="setting-value col-sm-8 d-flex align-items-center">
          <span v-if="isAria2Next" class="badge badge-success px-2 py-1 font-monospace">
            <i class="fa fa-bolt mr-1"></i>aria2-next ({{ $t("Enhanced Edition") }})
          </span>
          <span v-else class="badge badge-secondary px-2 py-1 font-monospace">
            {{ store.serverInfo.product || 'aria2' }}
          </span>
        </div>
      </div>

      <!-- 引擎核心版本 -->
      <div class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Engine Version") }}</div>
        <div class="setting-value col-sm-8">
          <span v-if="store.serverInfo.version" class="font-weight-bold text-success font-monospace">
            v{{ store.serverInfo.version }}
          </span>
          <span v-else class="text-muted">-</span>
        </div>
      </div>

      <!-- RPC 规范版本 -->
      <div class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("RPC Version") }}</div>
        <div class="setting-value col-sm-8 font-monospace">
          <span v-if="store.serverInfo.rpcVersion" class="badge badge-info px-2 py-1">
            v{{ store.serverInfo.rpcVersion }}
          </span>
          <span v-else class="text-muted">v1.0 (Standard)</span>
        </div>
      </div>

      <!-- RPC 通信地址与连接状态 -->
      <div class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Aria2 RPC Address") }}</div>
        <div class="setting-value col-sm-8 d-flex align-items-center flex-wrap">
          <span class="font-monospace mr-3">{{ currentRpcAddress }}</span>
          <span class="badge" :class="statusBadgeClass">{{ $t(store.rpcStatus) }}</span>
        </div>
      </div>

      <!-- 会话 Session ID -->
      <div class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Session ID") }}</div>
        <div class="setting-value col-sm-8 d-flex align-items-center">
          <span class="font-monospace text-muted">{{ store.serverInfo.sessionId || '-' }}</span>
          <button
            v-if="store.serverInfo.sessionId"
            class="btn btn-default btn-xs ml-2"
            :title="$t('Copy')"
            @click="copySessionId"
          >
            <i :class="copiedSessionId ? 'fa fa-check text-success' : 'fa fa-clipboard'"></i>
            <span class="ml-1">{{ copiedSessionId ? $t("Copied") : $t("Copy") }}</span>
          </button>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- 2. 已启用的协议与功能 (Enabled Protocols & Features)                  -->
      <!-- ===================================================================== -->
      <div class="status-section-header mt-4">
        <i class="fa fa-cubes mr-2 text-primary"></i>
        <span>{{ $t("Enabled Protocols & Features") }}</span>
        <small class="text-muted ml-2">({{ enabledFeatureList.length }} {{ $t("Active") || "已激活" }})</small>
      </div>

      <div class="row py-2 border-bottom">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Enabled Features") }}</div>
        <div class="setting-value col-sm-8">
          <div class="row">
            <div
              v-for="feat in enabledFeatureList"
              :key="feat.key"
              class="col-12 col-md-6 mb-2"
            >
              <div class="d-flex align-items-center p-2 rounded status-feature-card">
                <div class="feature-icon mr-3 text-center" style="width: 32px;">
                  <i :class="feat.icon + ' fa-lg ' + feat.colorClass"></i>
                </div>
                <div class="flex-grow-1 overflow-hidden">
                  <div class="d-flex align-items-center justify-content-between">
                    <span class="font-weight-bold text-truncate">{{ feat.title }}</span>
                    <span class="badge badge-success-subtle ml-2">
                      <i class="fa fa-check mr-1"></i>{{ $t("Enabled") || "已启用" }}
                    </span>
                  </div>
                  <small class="text-muted d-block text-truncate" :title="feat.desc">
                    {{ feat.desc }}
                  </small>
                </div>
              </div>
            </div>

            <!-- 若特性为空或尚未加载 -->
            <div v-if="enabledFeatureList.length === 0" class="col-12 text-muted py-2">
              {{ $t("No available options") || "暂无特性信息" }}
            </div>
          </div>
        </div>
      </div>

      <!-- aria2-next 专有流媒体嗅探与增强特性 (Media Features) -->
      <div v-if="mediaFeatureList.length > 0" class="row py-2 border-bottom">
        <div class="setting-key col-sm-4 font-weight-bold">
          <div>{{ $t("Media Streaming Capabilities") }}</div>
          <small class="text-muted">HLS / DASH 流媒体深度解析引擎</small>
        </div>
        <div class="setting-value col-sm-8">
          <div class="d-flex flex-wrap">
            <div
              v-for="mf in mediaFeatureList"
              :key="mf.key"
              class="badge badge-danger-subtle mr-2 mb-2 p-2 border"
              :title="mf.desc"
            >
              <i class="fa fa-play-circle mr-1"></i>
              <strong>{{ mf.key }}</strong>
              <span class="ml-1 text-muted">({{ mf.title }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- aria2-next 专有智能下载扩展特性 (Download Features) -->
      <div v-if="downloadFeatureList.length > 0" class="row py-2 border-bottom">
        <div class="setting-key col-sm-4 font-weight-bold">
          <div>{{ $t("Smart Download Capabilities") }}</div>
          <small class="text-muted">浏览器扩展协同感知与文件名解析</small>
        </div>
        <div class="setting-value col-sm-8">
          <div class="d-flex flex-wrap">
            <div
              v-for="df in downloadFeatureList"
              :key="df.key"
              class="badge badge-info-subtle mr-2 mb-2 p-2 border"
              :title="df.desc"
            >
              <i class="fa fa-tags mr-1"></i>
              <strong>{{ df.key }}</strong>
              <span class="ml-1 text-muted">({{ df.title }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- 3. 全局调度与运行参数 (Scheduling & Runtime Status)                   -->
      <!-- ===================================================================== -->
      <div class="status-section-header mt-4">
        <i class="fa fa-sliders mr-2 text-primary"></i>
        <span>{{ $t("Scheduling & Runtime Status") }}</span>
      </div>

      <!-- 默认下载目录 -->
      <div class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Default Download Directory") }}</div>
        <div class="setting-value col-sm-8">
          <span class="font-monospace text-primary font-weight-bold">
            {{ store.globalOptions.dir || '-' }}
          </span>
        </div>
      </div>

      <!-- 核心调度参数组合 -->
      <div class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">连接与并发</div>
        <div class="setting-value col-sm-8 d-flex flex-wrap">
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("Split Connections") }}:</span>
            <strong class="font-monospace">{{ store.globalOptions.split || '-' }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("Max Connection Per Server") }}:</span>
            <strong class="font-monospace">{{ store.globalOptions['max-connection-per-server'] || '-' }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("Max Concurrent Downloads") }}:</span>
            <strong class="font-monospace">{{ store.globalOptions['max-concurrent-downloads'] || '-' }}</strong>
          </span>
        </div>
      </div>

      <!-- 速度限制与缓存分配 -->
      <div class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">限速与存储分配</div>
        <div class="setting-value col-sm-8 d-flex flex-wrap">
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("Max Download Limit") }}:</span>
            <strong class="font-monospace">{{ formatLimit(store.globalOptions['max-overall-download-limit']) }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("Max Upload Limit") }}:</span>
            <strong class="font-monospace">{{ formatLimit(store.globalOptions['max-overall-upload-limit']) }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("Disk Cache") }}:</span>
            <strong class="font-monospace">{{ store.globalOptions['disk-cache'] || '16M' }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("File Allocation") }}:</span>
            <strong class="font-monospace">{{ store.globalOptions['file-allocation'] || 'falloc' }}</strong>
          </span>
        </div>
      </div>

      <!-- 实时传输速率与任务概况 -->
      <div class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">实时传输与任务统计</div>
        <div class="setting-value col-sm-8 d-flex flex-wrap align-items-center">
          <span class="mr-4 mb-1">
            <i class="fa fa-arrow-down text-success mr-1"></i>
            <span class="text-muted mr-1">{{ $t("Realtime Download Speed") }}:</span>
            <strong class="font-monospace text-success">{{ formatSpeed(store.globalStat.downloadSpeed) }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <i class="fa fa-arrow-up text-primary mr-1"></i>
            <span class="text-muted mr-1">{{ $t("Realtime Upload Speed") }}:</span>
            <strong class="font-monospace text-primary">{{ formatSpeed(store.globalStat.uploadSpeed) }}</strong>
          </span>
          <span class="mr-3 mb-1">
            <span class="badge badge-success mr-1">{{ store.globalStat.numActive }}</span>
            <small class="text-muted">{{ $t("Active Tasks") }}</small>
          </span>
          <span class="mr-3 mb-1">
            <span class="badge badge-warning mr-1">{{ store.globalStat.numWaiting }}</span>
            <small class="text-muted">{{ $t("Waiting Tasks") }}</small>
          </span>
          <span class="mr-3 mb-1">
            <span class="badge badge-secondary mr-1">{{ store.globalStat.numStopped }}</span>
            <small class="text-muted">{{ $t("Stopped Tasks") }}</small>
          </span>
          <span class="mb-1">
            <span class="badge badge-info mr-1">{{ store.globalStat.numStoppedTotal || store.globalStat.numTotal || 0 }}</span>
            <small class="text-muted">{{ $t("Total Stopped") }}</small>
          </span>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- 4. P2P 实时网络状态 (P2P Network Status)                              -->
      <!-- ===================================================================== -->
      <div v-if="btStatus || ed2kStatus" class="status-section-header mt-4">
        <i class="fa fa-globe mr-2 text-primary"></i>
        <span>{{ $t("P2P Network Status") }}</span>
      </div>

      <!-- BitTorrent 实时网络 -->
      <div v-if="btStatus" class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">
          <i class="fa fa-magnet text-primary mr-1"></i>BitTorrent P2P 运行状态
        </div>
        <div class="setting-value col-sm-8 d-flex flex-wrap align-items-center">
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("External IP") }}:</span>
            <strong class="font-monospace">{{ btStatus.externalIp || $t("Auto Detect") }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("Listen Port") }}:</span>
            <strong class="font-monospace">{{ btStatus.listenPort || '-' }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("DHT Nodes") }}:</span>
            <strong class="font-monospace text-primary">{{ btStatus.dhtNodes || '0' }}</strong>
          </span>
          <span class="mb-1">
            <span class="text-muted mr-1">{{ $t("DHT Status") }}:</span>
            <span
              class="badge"
              :class="btStatus.dhtStateHealthy === 'true' ? 'badge-success' : 'badge-warning'"
            >
              {{ btStatus.dhtStateHealthy === 'true' ? $t("Healthy") : $t("Synchronizing") }}
            </span>
          </span>
        </div>
      </div>

      <!-- ED2K 电驴网络实时状态 -->
      <div v-if="ed2kStatus" class="row py-2 border-bottom align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">
          <i class="fa fa-exchange text-info mr-1"></i>ED2K 电驴 / KAD 网络状态
        </div>
        <div class="setting-value col-sm-8 d-flex flex-wrap align-items-center">
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">TCP / UDP 端口:</span>
            <strong class="font-monospace">{{ ed2kStatus.tcpPort || '4662' }} / {{ ed2kStatus.udpPort || '4672' }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("ED2K KAD Nodes") }}:</span>
            <strong class="font-monospace text-info">{{ ed2kStatus.kadNodeCount || '0' }}</strong>
          </span>
          <span class="mr-4 mb-1">
            <span class="text-muted mr-1">{{ $t("Firewall Status") }}:</span>
            <span class="badge" :class="ed2kStatus.kadFirewalled ? 'badge-warning' : 'badge-success'">
              {{ ed2kStatus.kadFirewalled ? 'LowID (受限)' : 'HighID (公网)' }}
            </span>
          </span>
          <span v-if="ed2kStatus.userHash" class="mb-1 text-truncate" style="max-width: 260px;" :title="ed2kStatus.userHash">
            <span class="text-muted mr-1">{{ $t("User Hash") }}:</span>
            <small class="font-monospace">{{ ed2kStatus.userHash.slice(0, 12) }}...</small>
          </span>
        </div>
      </div>

      <!-- ===================================================================== -->
      <!-- 5. 运维控制操作 (Operations)                                          -->
      <!-- ===================================================================== -->
      <div class="status-section-header mt-4">
        <i class="fa fa-cogs mr-2 text-primary"></i>
        <span>{{ $t("Operations") }}</span>
      </div>

      <div class="row py-3 align-items-center">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Operations") }}</div>
        <div class="setting-value col-sm-8">
          <!-- 重新连接 -->
          <button
            class="btn btn-primary btn-sm mr-2 mb-2"
            :disabled="store.rpcStatus === 'Connected'"
            @click="handleReconnect"
          >
            <i class="fa fa-refresh mr-1"></i>{{ $t("Reconnect") }}
          </button>

          <!-- 刷新状态与元信息 -->
          <button
            class="btn btn-default btn-sm mr-2 mb-2"
            :disabled="refreshing"
            @click="refreshAll"
          >
            <i class="fa fa-refresh mr-1" :class="{ 'fa-spin': refreshing }"></i>{{ $t("Refresh Status") }}
          </button>

          <!-- 保存会话 -->
          <button
            class="btn btn-secondary btn-sm mr-2 mb-2"
            :disabled="store.rpcStatus !== 'Connected'"
            @click="handleSaveSession"
          >
            <i class="fa fa-save mr-1"></i>{{ $t("Save Session") }}
          </button>

          <!-- 关闭引擎 -->
          <button
            class="btn btn-danger btn-sm mb-2"
            :disabled="store.rpcStatus !== 'Connected'"
            @click="handleShutdown"
          >
            <i class="fa fa-power-off mr-1"></i>{{ $t("Shutdown Downloader") }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * ==============================================================================
 * 下载器状态与系统操作视图组件 (Status)
 * ==============================================================================
 * 深度适配 aria2-next-3.0.9+ 现代化增强引擎，全面展示：
 * 1. 核心产品 (aria2-next / aria2)、引擎版本、RPC 规范版本、连接地址与会话 ID
 * 2. 已启用的协议与功能卡片 (BitTorrent, ED2K, HLS/DASH, HTTPS, SFTP, Metalink, GZip, Message Digest)
 * 3. aria2-next 独家流媒体特性 (request-contexts, stable-track-ids 等) 与智能下载特性 (filename-hints 等)
 * 4. 实时调度参数 (默认下载目录 dir, 单任务连接数 split, 最大并发数, 磁盘缓存等)
 * 5. P2P 网络实时状态 (BT 外网IP, DHT 活跃节点数, ED2K KAD 节点与防火墙状态)
 * 6. 运维控制操作 (重新连接, 状态刷新, 会话持久化存盘, 安全关闭引擎)
 * ==============================================================================
 */

import { ref, computed, onMounted } from "vue";
import { store, currentRpc, refreshServerInfo } from "../store";
import { formatSpeed, formatBytes } from "../utils/format";
import { t } from "../i18n";

/** BT 会话状态响应对象 */
const btStatus = ref(null);
/** ED2K 会话状态响应对象 */
const ed2kStatus = ref(null);
/** 是否正在刷新数据 */
const refreshing = ref(false);
/** 会话 ID 已复制标志 */
const copiedSessionId = ref(false);

/** 计算属性：当前完整的 RPC 连接地址字符串 */
const currentRpcAddress = computed(() => {
  const r = currentRpc.value;
  return `${r.protocol}://${r.rpcHost}:${r.rpcPort}/${r.rpcInterface}`;
});

/** 计算属性：是否为 aria2-next 增强引擎 */
const isAria2Next = computed(() => {
  const p = store.serverInfo.product || "";
  return p.toLowerCase().includes("next") || (store.serverInfo.mediaFeatures || []).length > 0;
});

/** 计算属性：连接状态徽标样式类 */
const statusBadgeClass = computed(() => {
  if (store.rpcStatus === "Connected") return "badge-success";
  if (store.rpcStatus === "Connecting") return "badge-primary";
  return "badge-danger";
});

/**
 * 核心功能与协议元数据词典
 */
const FEATURE_DICTIONARY = {
  BitTorrent: {
    title: "BitTorrent",
    icon: "fa fa-magnet",
    colorClass: "text-primary",
    desc: "BT 种子解析、磁力链接下载、DHT 节点发现与本地做种",
  },
  ED2K: {
    title: "ED2K",
    icon: "fa fa-exchange",
    colorClass: "text-info",
    desc: "eMule / eDonkey2000 电驴网络及去中心化 KAD 节点下载",
  },
  "HLS/DASH": {
    title: "HLS / DASH",
    icon: "fa fa-film",
    colorClass: "text-danger",
    desc: "M3U8 / MPD 自动切片嗅探、动态音视频分流合并与解密",
  },
  HTTPS: {
    title: "HTTPS",
    icon: "fa fa-lock",
    colorClass: "text-success",
    desc: "基于 TLS 1.2 / 1.3 现代高强度加密的安全 HTTP 通信传输",
  },
  SFTP: {
    title: "SFTP",
    icon: "fa fa-key",
    colorClass: "text-warning",
    desc: "基于 SSH 隧道的文件安全传输协议，支持密钥认证与远程管理",
  },
  Metalink: {
    title: "Metalink",
    icon: "fa fa-link",
    colorClass: "text-secondary",
    desc: "Metalink 3 / 4 规范，多源并发多镜像智能汇聚与校验",
  },
  GZip: {
    title: "GZip",
    icon: "fa fa-file-archive-o",
    colorClass: "text-warning",
    desc: "HTTP 传输层 GZip / Deflate 压缩数据流的高性能硬件解包",
  },
  "Message Digest": {
    title: "Message Digest",
    icon: "fa fa-shield",
    colorClass: "text-info",
    desc: "MD5、SHA-1、SHA-224、SHA-256、SHA-384、SHA-512 数据即时校验",
  },
};

/**
 * 计算属性：已启用的核心协议特性列表
 */
const enabledFeatureList = computed(() => {
  const feats = store.serverInfo.enabledFeatures || [];
  return feats.map((feat) => {
    const meta = FEATURE_DICTIONARY[feat];
    if (meta) {
      return {
        key: feat,
        title: meta.title,
        icon: meta.icon,
        colorClass: meta.colorClass,
        desc: meta.desc,
      };
    }
    return {
      key: feat,
      title: feat,
      icon: "fa fa-check-circle-o",
      colorClass: "text-success",
      desc: "已启用的服务端协议扩展功能",
    };
  });
});

/**
 * 流媒体特性元数据映射
 */
const MEDIA_FEATURE_META = {
  "request-contexts": {
    title: "上下文智能恢复",
    desc: "流媒体切片请求上下文状态自动追踪与异常恢复",
  },
  "stable-track-ids": {
    title: "稳定音视频轨道",
    desc: "独立音轨、字幕与多分辨率视频流精准分离提取",
  },
  "structured-errors": {
    title: "结构化异常诊断",
    desc: "流媒体协议层多维度详细错误状态上报与自愈机制",
  },
  "captured-inputs": {
    title: "捕获流动态注入",
    desc: "浏览器拦截层捕获的音视频分片流直接注入引擎",
  },
};

/** 计算属性：流媒体增强特性列表 */
const mediaFeatureList = computed(() => {
  const feats = store.serverInfo.mediaFeatures || [];
  return feats.map((k) => ({
    key: k,
    title: MEDIA_FEATURE_META[k]?.title || k,
    desc: MEDIA_FEATURE_META[k]?.desc || "流媒体高级扩展能力",
  }));
});

/**
 * 下载扩展特性元数据映射
 */
const DOWNLOAD_FEATURE_META = {
  "filename-hints": {
    title: "智能文件名提示",
    desc: "浏览器拦截扩展下发建议文件名并自动纠正",
  },
  "filename-resolution": {
    title: "智能文件名解析",
    desc: "服务端自动探测 HTTP 重定向链路与 Content-Disposition 真实名称",
  },
};

/** 计算属性：下载增强特性列表 */
const downloadFeatureList = computed(() => {
  const feats = store.serverInfo.downloadFeatures || [];
  return feats.map((k) => ({
    key: k,
    title: DOWNLOAD_FEATURE_META[k]?.title || k,
    desc: DOWNLOAD_FEATURE_META[k]?.desc || "智能下载扩展能力",
  }));
});

/**
 * 格式化限速参数显示
 * @param {string|number} limit
 */
function formatLimit(limit) {
  if (!limit || limit === "0" || limit === 0) {
    return "0 (无限制)";
  }
  return formatSpeed(limit);
}

/**
 * 复制 Session ID 到剪贴板
 */
async function copySessionId() {
  if (!store.serverInfo.sessionId) return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(store.serverInfo.sessionId);
    } else {
      const input = document.createElement("input");
      input.value = store.serverInfo.sessionId;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    copiedSessionId.value = true;
    setTimeout(() => {
      copiedSessionId.value = false;
    }, 1500);
  } catch (e) {
    console.warn("Failed to copy sessionId:", e);
  }
}

/**
 * 手动重连当前 RPC 服务端
 */
function handleReconnect() {
  if (store.client) {
    store.client.connect();
  }
}

/**
 * 全量刷新服务端状态与 P2P 信息
 */
async function refreshAll() {
  refreshing.value = true;
  try {
    await refreshServerInfo();
    if (store.client && store.rpcStatus === "Connected") {
      const [bt, ed] = await Promise.all([
        store.client.getBtSessionStatus ? store.client.getBtSessionStatus().catch(() => null) : null,
        store.client.getEd2kStatus ? store.client.getEd2kStatus().catch(() => null) : null,
      ]);
      btStatus.value = bt;
      ed2kStatus.value = ed;
    }
  } catch (e) {
    console.warn("[Status] Failed to refresh details:", e);
  } finally {
    refreshing.value = false;
  }
}

/**
 * 保存当前 Aria2 会话至磁盘
 */
async function handleSaveSession() {
  if (!store.client) return;
  try {
    await store.client.saveSession();
    alert(t("Session has been saved successfully."));
  } catch (e) {
    alert(`Failed: ${e.message}`);
  }
}

/**
 * 安全关闭远程 Aria2 下载器进程
 */
async function handleShutdown() {
  if (!store.client) return;
  if (confirm(t("Are you sure you want to shutdown downloader?"))) {
    try {
      await store.client.shutdown();
      alert(t("Downloader has been shutdown successfully."));
    } catch (e) {
      alert(`Shutdown requested.`);
    }
  }
}

onMounted(() => {
  refreshAll();
});
</script>

<style scoped>
/* ========================================================================== */
/* 状态模块专属样式定义                                                       */
/* ========================================================================== */

.status-section-header {
  font-size: 0.95rem;
  font-weight: 600;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.03);
  border-left: 4px solid #3c8dbc;
  border-radius: 2px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

:root.dark-theme .status-section-header,
.theme-dark .status-section-header {
  background: rgba(255, 255, 255, 0.05);
  border-left-color: #3c8dbc;
  color: #e0e0e0;
}

.status-feature-card {
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  min-height: 58px;
}

.status-feature-card:hover {
  background: rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

:root.dark-theme .status-feature-card,
.theme-dark .status-feature-card {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

:root.dark-theme .status-feature-card:hover,
.theme-dark .status-feature-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.badge-success-subtle {
  background-color: rgba(40, 167, 69, 0.15);
  color: #28a745;
  font-weight: 500;
}

.badge-info-subtle {
  background-color: rgba(23, 162, 184, 0.15);
  color: #17a2b8;
  font-weight: 500;
}

.badge-danger-subtle {
  background-color: rgba(220, 53, 69, 0.15);
  color: #dc3545;
  font-weight: 500;
}

:root.dark-theme .badge-success-subtle,
.theme-dark .badge-success-subtle {
  background-color: rgba(40, 167, 69, 0.25);
  color: #5cd07a;
}

:root.dark-theme .badge-info-subtle,
.theme-dark .badge-info-subtle {
  background-color: rgba(23, 162, 184, 0.25);
  color: #4dd0e1;
}

:root.dark-theme .badge-danger-subtle,
.theme-dark .badge-danger-subtle {
  background-color: rgba(220, 53, 69, 0.25);
  color: #f2727d;
}
</style>
