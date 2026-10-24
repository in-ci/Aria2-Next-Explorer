<template>
  <section class="content no-padding">
    <div class="nav-tabs-custom">
      <!-- 顶部标签页切换（已移除无用的齿轮选项，与原作者风格保持一致） -->
      <ul class="nav nav-tabs">
        <li class="nav-item" :class="{ active: currentTab === 'overview' }">
          <a class="nav-link pointer-cursor" @click="currentTab = 'overview'">{{ $t("Overview") }}</a>
        </li>
        <li v-if="task && task.numPieces" class="nav-item" :class="{ active: currentTab === 'pieces' }">
          <a class="nav-link pointer-cursor" @click="currentTab = 'pieces'">{{ $t("Pieces") }}</a>
        </li>
        <li v-if="task && task.files && task.files.length > 0" class="nav-item" :class="{ active: currentTab === 'files' }">
          <a class="nav-link pointer-cursor" @click="currentTab = 'files'">{{ $t("Files") }}</a>
        </li>
        <li v-if="task && task.bittorrent && task.status === 'active'" class="nav-item" :class="{ active: currentTab === 'peers' }">
          <a class="nav-link pointer-cursor" @click="currentTab = 'peers'">{{ $t("Peers") }}</a>
        </li>
        <li class="nav-item slim ml-auto">
          <a class="nav-link pointer-cursor" @click="goBack" :title="$t('Back')">
            <i class="fa fa-reply mr-1"></i>{{ $t("Back") || "Back" }}
          </a>
        </li>
      </ul>

      <!-- 标签页内容区域 -->
      <div class="tab-content no-padding p-3">
        <!-- 1. 概览 (Overview) -->
        <div v-show="currentTab === 'overview'" class="tab-pane active">
          <div v-if="task" class="settings-table striped hoverable">
            <!-- 任务名称 -->
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Task Name") }}</div>
              <div class="setting-value col-sm-8 text-break">{{ task.taskName }}</div>
            </div>

            <!-- 任务大小 -->
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Task Size") }}</div>
              <div class="setting-value col-sm-8">{{ formatBytes(task.totalLength) }}</div>
            </div>

            <!-- 任务状态 (以简体中文正确显示，如：已完成、正在下载) -->
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Task Status") }}</div>
              <div class="setting-value col-sm-8">
                <span class="badge" :class="statusBadgeClass">{{ formatTaskStatus(task.status) }}</span>
                <span v-if="task.status === 'error' && task.errorCode && task.errorCode !== '0'" class="text-danger ml-2">
                  ({{ task.errorCode }}: {{ $t(task.errorDescription) || $t("unknown") }})
                </span>
              </div>
            </div>

            <!-- 下载进度 -->
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Progress") }}</div>
              <div class="setting-value col-sm-8">{{ formatPercent(task.completePercent) }}</div>
            </div>

            <!-- 已下载大小与实时下载速度 -->
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Download") }}</div>
              <div class="setting-value col-sm-8">
                {{ formatBytes(task.completedLength) }}
                <span v-if="task.status === 'active'" class="text-success ml-2">
                  @ {{ formatSpeed(task.downloadSpeed) }}
                </span>
              </div>
            </div>

            <!-- 下载地址 (Download URL: 在下载下面独立展示该任务的实际 URL 与一键复制) -->
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Download Url") }}</div>
              <div class="setting-value col-sm-8 text-break">
                <div v-if="task.downloadUrls && task.downloadUrls.length > 0">
                  <div
                    v-for="(url, uidx) in task.downloadUrls"
                    :key="uidx"
                    class="d-flex align-items-center mb-1 flex-wrap"
                  >
                    <a
                      :href="url"
                      target="_blank"
                      class="text-primary font-monospace flex-grow-1 text-break mr-2"
                      rel="noopener noreferrer"
                    >
                      {{ url }}
                    </a>
                    <button
                      class="btn btn-default btn-xs flex-shrink-0"
                      :title="$t('Copy')"
                      @click="copyUrl(url, uidx)"
                    >
                      <i :class="copiedUrlIndex === uidx ? 'fa fa-check text-success' : 'fa fa-clipboard'"></i>
                      <span class="ml-1">{{ copiedUrlIndex === uidx ? $t("Copied") : $t("Copy") }}</span>
                    </button>
                  </div>
                </div>
                <span v-else class="text-muted">-</span>
              </div>
            </div>

            <!-- 上传量 (BT 任务) -->
            <div v-if="task.bittorrent" class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Upload") }}</div>
              <div class="setting-value col-sm-8">
                {{ formatBytes(task.uploadLength) }}
                <span v-if="task.status === 'active'" class="text-primary ml-2">
                  @ {{ formatSpeed(task.uploadSpeed) }}
                </span>
              </div>
            </div>

            <!-- 分享率 (BT 任务) -->
            <div v-if="task.bittorrent" class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Share Ratio") }}</div>
              <div class="setting-value col-sm-8">
                {{ (Number(task.shareRatio) / 1000).toFixed(2) }}
              </div>
            </div>

            <!-- 剩余预估时间 -->
            <div v-if="task.status === 'active'" class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Remaining") }}</div>
              <div class="setting-value col-sm-8">{{ formatDuration(task.remainTime) }}</div>
            </div>

            <!-- 下载保存目录 -->
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Download Dir") }}</div>
              <div class="setting-value col-sm-8 text-break">{{ task.dir }}</div>
            </div>

            <!-- Info Hash (BT 任务) -->
            <div v-if="task.infoHash" class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Info Hash") }}</div>
              <div class="setting-value col-sm-8 font-monospace">{{ task.infoHash }}</div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted">
            {{ $t("Loading") }}...
          </div>
        </div>

        <!-- 2. 分片分布地图 (Pieces) -->
        <div v-show="currentTab === 'pieces'" class="tab-pane active">
          <PieceMap
            v-if="task && task.numPieces"
            :bitfield="task.bitfield || ''"
            :piece-count="Number(task.numPieces) || 0"
            :piece-length="Number(task.pieceLength) || 0"
            :total-length="Number(task.totalLength) || 0"
            :task-status="task.status || ''"
            :active="currentTab === 'pieces'"
          />
        </div>

        <!-- 3. 文件列表 (Files: 采用原作者精简紧凑布局，杜绝臃肿与大行高) -->
        <div v-show="currentTab === 'files'" class="tab-pane active">
          <div class="task-table">
            <!-- 紧凑表头标题行 -->
            <div class="task-table-title px-2 py-1">
              <div class="row align-items-center">
                <div class="col-sm-8 col-7">
                  <a class="pointer-cursor" @click="toggleFileSort('name')">
                    <span>{{ $t("File Name") }}</span>
                    <i :class="getFileSortIcon('name')"></i>
                  </a>
                </div>
                <div class="col-sm-2 col-2">
                  <a class="pointer-cursor" @click="toggleFileSort('percent')">
                    <span>{{ $t("Progress") }}</span>
                    <i :class="getFileSortIcon('percent')"></i>
                  </a>
                </div>
                <div class="col-sm-2 col-3 text-right pr-3">
                  <a class="pointer-cursor" @click="toggleFileSort('size')">
                    <span>{{ $t("File Size") }}</span>
                    <i :class="getFileSortIcon('size')"></i>
                  </a>
                </div>
              </div>
            </div>

            <!-- 紧凑精炼文件行列表 -->
            <div class="task-table-body">
              <div
                v-for="file in sortedTaskFiles"
                :key="file.index"
                class="row align-items-center file-item-row px-2 py-1 border-bottom"
              >
                <!-- 文件名与勾选选择框 -->
                <div class="col-sm-8 col-7 d-flex align-items-center overflow-hidden">
                  <div class="checkbox checkbox-primary mr-2 mb-0" @click.stop>
                    <input
                      :id="'file_' + file.index"
                      type="checkbox"
                      :checked="file.selected === 'true'"
                      :disabled="!task || !task.files || task.files.length <= 1 || (task.status !== 'waiting' && task.status !== 'paused')"
                      @change="toggleFileSelect(file.index, $event.target.checked)"
                    />
                    <label :for="'file_' + file.index" class="mb-0">
                      <span class="d-block auto-ellipsis font-weight-normal text-body" :title="file.path">
                        {{ getFileName(file.path) }}
                      </span>
                    </label>
                  </div>
                </div>

                <!-- 进度条（百分比内嵌，紧凑低行高） -->
                <div class="col-sm-2 col-2 p-0">
                  <div class="progress file-progress" style="height: 14px;">
                    <div
                      class="progress-bar bg-success"
                      role="progressbar"
                      :style="{ width: `${getFilePercent(file)}%` }"
                    >
                      <span class="progress-text">{{ getFilePercent(file) }}%</span>
                    </div>
                  </div>
                </div>

                <!-- 文件大小 -->
                <div class="col-sm-2 col-3 text-right pr-3">
                  <span class="task-size text-muted font-monospace">{{ formatBytes(file.length) }}</span>
                </div>
              </div>

              <div v-if="!taskFiles || taskFiles.length === 0" class="text-center py-4 text-muted">
                {{ $t("No files") || "暂无文件信息" }}
              </div>
            </div>
          </div>
        </div>

        <!-- 4. BT 节点信息 (Peers) -->
        <div v-show="currentTab === 'peers'" class="tab-pane active">
          <div v-if="peersList.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>{{ $t("Address") }}</th>
                  <th>{{ $t("Client") }}</th>
                  <th>{{ $t("Download") }}</th>
                  <th>{{ $t("Upload") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(peer, pidx) in peersList" :key="pidx">
                  <td>{{ peer.ip }}:{{ peer.port }}</td>
                  <td>{{ peer.peerId || '-' }}</td>
                  <td class="text-success">{{ formatSpeed(peer.downloadSpeed) }}</td>
                  <td class="text-primary">{{ formatSpeed(peer.uploadSpeed) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-4 text-muted">
            {{ $t("No connected peers") }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * ==============================================================================
 * 任务详情视图组件 (TaskDetail)
 * ==============================================================================
 * 展示单项下载任务的概览指标、分片分布地图 (PieceMap)、文件列表及节点 Peers 列表。
 * 具备独立精准轮询与销毁自清理机制，文件列表采用原作者精炼紧凑布局。
 * ==============================================================================
 */

import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { store } from "../store";
import { navigate } from "../router";
import { t } from "../i18n";
import { getErrorDescription } from "../api/aria2-errors";
import PieceMap from "../components/PieceMap.vue";
import { formatBytes, formatSpeed, formatDuration, formatPercent } from "../utils/format";

const props = defineProps({
  /** 任务唯一标识 GID */
  gid: { type: String, required: true },
});

/** 当前激活的选项卡 ('overview' | 'pieces' | 'files' | 'peers') */
const currentTab = ref("overview");
/** 任务文件列表 */
const taskFiles = ref([]);
/** BT 节点连接列表 */
const peersList = ref([]);
/** 复制 URL 成功的索引标记 */
const copiedUrlIndex = ref(-1);
/** 文件列表排序字段与方向 */
const fileSortField = ref("name");
const fileSortDir = ref("asc");

/** 完整的 Aria2 原始状态详情缓存 */
const rawDetail = ref(null);
/** 详情专用心跳定时器 */
let detailTimer = null;

/**
 * 任务状态与中文映射字典
 */
const STATUS_TEXT_MAP = {
  complete: "已完成",
  active: "正在下载",
  waiting: "正在等待",
  paused: "已暂停",
  error: "错误",
  removed: "已删除",
};

/**
 * 格式化任务状态文本为简体中文
 * @param {string} status 状态码
 * @returns {string} 本地化后的状态字符串
 */
function formatTaskStatus(status) {
  if (!status) return "-";
  const lower = status.toLowerCase();
  return STATUS_TEXT_MAP[lower] || t(status) || status;
}

/**
 * 计算属性：整合局部 full RPC 查询与 Store 基础信息
 */
const task = computed(() => {
  const storeTask = [
    ...store.tasks.active,
    ...store.tasks.waiting,
    ...store.tasks.stopped,
  ].find((t) => t.gid === props.gid);

  const raw = rawDetail.value;
  if (!raw && !storeTask) return null;

  const totalLength = Number(raw?.totalLength || storeTask?.totalLength) || 0;
  const completedLength = Number(raw?.completedLength || storeTask?.completedLength) || 0;
  const downloadSpeed = Number(raw?.downloadSpeed || storeTask?.downloadSpeed) || 0;
  const uploadSpeed = Number(raw?.uploadSpeed || storeTask?.uploadSpeed) || 0;

  let completePercent = 0;
  if (totalLength > 0) {
    completePercent = Math.min(100, (completedLength / totalLength) * 100);
  }

  let remainTime = -1;
  if (downloadSpeed > 0 && totalLength > completedLength) {
    remainTime = Math.round((totalLength - completedLength) / downloadSpeed);
  }

  let taskName = storeTask?.taskName || raw?.gid;
  if (raw?.bittorrent?.info?.name) {
    taskName = raw.bittorrent.info.name;
  } else if (raw?.files?.[0]?.path) {
    const parts = raw.files[0].path.replace(/\\/g, "/").split("/");
    taskName = parts[parts.length - 1] || parts[parts.length - 2] || taskName;
  }

  const uploadLength = Number(raw?.uploadLength || storeTask?.uploadLength) || 0;
  let shareRatio = 0;
  if (completedLength > 0 && uploadLength > 0) {
    shareRatio = Math.round((uploadLength / completedLength) * 1000);
  }

  // 提取当前任务的真实下载地址集合 (支持多 URI 与磁力链接)
  const downloadUrls = [];
  const filesList = taskFiles.value.length > 0 ? taskFiles.value : (raw?.files || storeTask?.files || []);
  if (filesList && filesList.length > 0) {
    filesList.forEach((f) => {
      if (f.uris && f.uris.length > 0) {
        f.uris.forEach((u) => {
          const uriStr = typeof u === "string" ? u : u.uri;
          if (uriStr && !downloadUrls.includes(uriStr)) {
            downloadUrls.push(uriStr);
          }
        });
      }
    });
  }
  if (downloadUrls.length === 0 && (raw?.infoHash || storeTask?.infoHash)) {
    const hash = raw?.infoHash || storeTask?.infoHash;
    downloadUrls.push(`magnet:?xt=urn:btih:${hash}`);
  }

  return {
    gid: props.gid,
    status: raw?.status || storeTask?.status || "active",
    taskName,
    totalLength,
    completedLength,
    downloadSpeed,
    uploadSpeed,
    completePercent,
    remainTime,
    dir: raw?.dir || storeTask?.dir || "",
    errorCode: raw?.errorCode || storeTask?.errorCode || "",
    errorDescription: storeTask?.errorDescription || (raw?.errorCode ? getErrorDescription(raw.errorCode) : ""),
    numPieces: raw?.numPieces || storeTask?.numPieces || 0,
    bitfield: raw?.bitfield || "",
    pieceLength: raw?.pieceLength || 0,
    infoHash: raw?.infoHash || "",
    bittorrent: raw?.bittorrent || storeTask?.bittorrent || null,
    uploadLength,
    shareRatio,
    downloadUrls,
    files: filesList,
  };
});

/** 任务状态徽标样式类 */
const statusBadgeClass = computed(() => {
  if (!task.value) return "badge-secondary";
  const st = task.value.status.toLowerCase();
  if (st === "active") return "badge-primary";
  if (st === "complete") return "badge-success";
  if (st === "error") return "badge-danger";
  return "badge-secondary";
});

/**
 * 提取文件相对路径的文件名
 * @param {string} filePath
 * @returns {string}
 */
function getFileName(filePath) {
  if (!filePath) return "-";
  const parts = filePath.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || filePath;
}

/**
 * 计算单个文件的完成百分比
 * @param {object} file
 * @returns {number}
 */
function getFilePercent(file) {
  const total = Number(file.length) || 0;
  const completed = Number(file.completedLength) || 0;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

/**
 * 复制指定下载地址到剪贴板
 * @param {string} url 下载链接
 * @param {number} index 链接索引
 */
async function copyUrl(url, index) {
  if (!url) return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    copiedUrlIndex.value = index;
    setTimeout(() => {
      copiedUrlIndex.value = -1;
    }, 1500);
  } catch (err) {
    console.warn("Failed to copy URL:", err);
  }
}

/**
 * 切换文件列表排序列与方向
 * @param {'name' | 'size' | 'percent'} field
 */
function toggleFileSort(field) {
  if (fileSortField.value === field) {
    fileSortDir.value = fileSortDir.value === "asc" ? "desc" : "asc";
  } else {
    fileSortField.value = field;
    fileSortDir.value = "asc";
  }
}

/**
 * 获取文件列表排序指示图标
 * @param {'name' | 'size' | 'percent'} field
 */
function getFileSortIcon(field) {
  if (fileSortField.value !== field) return "fa fa-display-order fa-sort text-muted ml-1";
  return fileSortDir.value === "asc"
    ? "fa fa-display-order fa-sort-asc text-primary ml-1"
    : "fa fa-display-order fa-sort-desc text-primary ml-1";
}

/**
 * 计算属性：根据当前排序规则计算出排好序的文件数组
 */
const sortedTaskFiles = computed(() => {
  const files = [...taskFiles.value];
  const field = fileSortField.value;
  const dir = fileSortDir.value === "asc" ? 1 : -1;

  return files.sort((a, b) => {
    if (field === "name") {
      const nameA = getFileName(a.path || "").toLowerCase();
      const nameB = getFileName(b.path || "").toLowerCase();
      return nameA.localeCompare(nameB) * dir;
    }
    if (field === "size") {
      return ((Number(a.length) || 0) - (Number(b.length) || 0)) * dir;
    }
    if (field === "percent") {
      return (getFilePercent(a) - getFilePercent(b)) * dir;
    }
    return 0;
  });
});

/**
 * 异步拉取任务详情、分片、文件与 Peers 节点数据
 */
async function loadDetailData() {
  if (!store.client || !props.gid) return;

  try {
    const [statusData, files, peers] = await Promise.all([
      store.client.tellStatus(props.gid).catch(() => null),
      store.client.getFiles(props.gid).catch(() => []),
      store.client.getPeers(props.gid).catch(() => []),
    ]);

    if (statusData) {
      rawDetail.value = statusData;
    }
    taskFiles.value = files || [];
    peersList.value = peers || [];
  } catch (e) {}
}

/**
 * 勾选/取消勾选多文件下载项
 * @param {number} index 文件索引
 * @param {boolean} isChecked 是否选中
 */
async function toggleFileSelect(index, isChecked) {
  if (!store.client || !props.gid) return;
  const selectedIndices = [];
  taskFiles.value.forEach((f) => {
    if (f.index === index) {
      if (isChecked) selectedIndices.push(f.index);
    } else if (f.selected === "true") {
      selectedIndices.push(f.index);
    }
  });

  try {
    await store.client.changeOption(props.gid, {
      "select-file": selectedIndices.join(","),
    });
    await loadDetailData();
  } catch (e) {
    console.warn("Failed to select file:", e);
  }
}

/**
 * 返回上一页任务列表
 */
function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigate(`/${store.options.defaultTaskPage || "all"}`);
  }
}

onMounted(() => {
  loadDetailData();
  // 建立详情页面专属低频轮询（1.5s），离开时自动销毁
  clearInterval(detailTimer);
  detailTimer = setInterval(() => {
    if (typeof document !== "undefined" && document.hidden) return;
    loadDetailData();
  }, 1500);
});

onUnmounted(() => {
  if (detailTimer) {
    clearInterval(detailTimer);
    detailTimer = null;
  }
});

watch(() => props.gid, () => {
  loadDetailData();
});
</script>

<style scoped>
/* ========================================================================== */
/* 文件列表精炼紧凑排版样式（彻底消除原有表格臃肿感，还原原作者清爽风格）          */
/* ========================================================================== */

.file-item-row {
  min-height: 32px;
  line-height: 20px;
  font-size: 0.85rem;
  transition: background-color 0.15s ease;
}

.file-item-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

:root.dark-theme .file-item-row:hover,
.theme-dark .file-item-row:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.file-progress {
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

:root.dark-theme .file-progress,
.theme-dark .file-progress {
  background-color: rgba(255, 255, 255, 0.1);
}

.progress-text {
  font-size: 10px;
  line-height: 14px;
  font-weight: 600;
}
</style>
