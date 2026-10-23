<template>
  <section class="content no-padding">
    <div class="nav-tabs-custom">
      <!-- 顶部标签页切换 -->
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
        <li class="nav-item" :class="{ active: currentTab === 'settings' }">
          <a class="nav-link pointer-cursor" @click="currentTab = 'settings'">
            <i class="fa fa-gear"></i>
          </a>
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
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Task Name") }}</div>
              <div class="setting-value col-sm-8 text-break">{{ task.taskName }}</div>
            </div>
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Task Size") }}</div>
              <div class="setting-value col-sm-8">{{ formatBytes(task.totalLength) }}</div>
            </div>
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Task Status") }}</div>
              <div class="setting-value col-sm-8">
                <span class="badge" :class="statusBadgeClass">{{ $t(task.status) }}</span>
                <span v-if="task.errorCode && task.errorCode !== '0'" class="text-danger ml-2">
                  ({{ task.errorCode }}: {{ $t(task.errorDescription) }})
                </span>
              </div>
            </div>
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Progress") }}</div>
              <div class="setting-value col-sm-8">{{ formatPercent(task.completePercent) }}</div>
            </div>
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Download") }}</div>
              <div class="setting-value col-sm-8">
                {{ formatBytes(task.completedLength) }}
                <span v-if="task.status === 'active'" class="text-success ml-2">
                  @ {{ formatSpeed(task.downloadSpeed) }}
                </span>
              </div>
            </div>
            <div v-if="task.bittorrent" class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Upload") }}</div>
              <div class="setting-value col-sm-8">
                {{ formatBytes(task.uploadLength) }}
                <span v-if="task.status === 'active'" class="text-primary ml-2">
                  @ {{ formatSpeed(task.uploadSpeed) }}
                </span>
              </div>
            </div>
            <div v-if="task.bittorrent" class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Share Ratio") }}</div>
              <div class="setting-value col-sm-8">
                {{ (Number(task.shareRatio) / 1000).toFixed(2) }}
              </div>
            </div>
            <div v-if="task.status === 'active'" class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Remaining") }}</div>
              <div class="setting-value col-sm-8">{{ formatDuration(task.remainTime) }}</div>
            </div>
            <div class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Download Dir") }}</div>
              <div class="setting-value col-sm-8 text-break">{{ task.dir }}</div>
            </div>
            <div v-if="task.infoHash" class="row py-2 border-bottom">
              <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Info Hash") }}</div>
              <div class="setting-value col-sm-8 font-monospace">{{ task.infoHash }}</div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted">
            {{ $t("Loading") }}...
          </div>
        </div>

        <!-- 2. 分片地图 (Pieces) -->
        <div v-show="currentTab === 'pieces'" class="tab-pane active">
          <PieceMap
            v-if="task && task.numPieces"
            :bitfield="task.bitfield || ''"
            :piece-count="Number(task.numPieces) || 0"
          />
        </div>

        <!-- 3. 文件列表 (Files) -->
        <div v-show="currentTab === 'files'" class="tab-pane active">
          <div class="table-responsive">
            <table class="table table-hover table-striped">
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>{{ $t("File Name") }}</th>
                  <th style="width: 120px;">{{ $t("File Size") }}</th>
                  <th style="width: 140px;">{{ $t("Progress") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in taskFiles" :key="file.index">
                  <td>
                    <input
                      type="checkbox"
                      :checked="file.selected === 'true'"
                      :disabled="task.status !== 'waiting' && task.status !== 'paused'"
                      @change="toggleFileSelect(file.index, $event.target.checked)"
                    />
                  </td>
                  <td class="text-break">{{ getFileName(file.path) }}</td>
                  <td>{{ formatBytes(file.length) }}</td>
                  <td>
                    <div class="progress" style="height: 12px;">
                      <div
                        class="progress-bar bg-success"
                        :style="{ width: `${getFilePercent(file)}%` }"
                      ></div>
                    </div>
                    <small class="text-muted">{{ getFilePercent(file) }}%</small>
                  </td>
                </tr>
              </tbody>
            </table>
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

        <!-- 5. 任务设置 (Settings) -->
        <div v-show="currentTab === 'settings'" class="tab-pane active">
          <div class="form-group mb-3">
            <label>{{ $t("Max Download Limit") }} (B/s, 0 = {{ $t("Unlimited") }})</label>
            <input
              type="text"
              class="form-control"
              v-model="taskOptions['max-download-limit']"
            />
          </div>
          <div class="form-group mb-3">
            <label>{{ $t("Max Upload Limit") }} (B/s, 0 = {{ $t("Unlimited") }})</label>
            <input
              type="text"
              class="form-control"
              v-model="taskOptions['max-upload-limit']"
            />
          </div>
          <button class="btn btn-primary btn-sm" @click="saveTaskOptions">
            {{ $t("Save") }}
          </button>
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
 * 具备独立精准轮询与销毁自清理机制，避免全局 Store 轮询膨胀。
 * ==============================================================================
 */

import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { store } from "../store";
import { navigate } from "../router";
import PieceMap from "../components/PieceMap.vue";
import { formatBytes, formatSpeed, formatDuration, formatPercent } from "../utils/format";

const props = defineProps({
  /** 任务唯一标识 GID */
  gid: { type: String, required: true },
});

/** 当前激活的选项卡 ('overview' | 'pieces' | 'files' | 'peers' | 'settings') */
const currentTab = ref("overview");
/** 任务文件列表 */
const taskFiles = ref([]);
/** BT 节点连接列表 */
const peersList = ref([]);
/** 任务局部上下行限速设置 */
const taskOptions = ref({
  "max-download-limit": "0",
  "max-upload-limit": "0",
});
/** 完整的 Aria2 原始状态详情缓存 */
const rawDetail = ref(null);
/** 详情专用心跳定时器 */
let detailTimer = null;

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
    errorDescription: storeTask?.errorDescription || "",
    numPieces: raw?.numPieces || storeTask?.numPieces || 0,
    bitfield: raw?.bitfield || "",
    pieceLength: raw?.pieceLength || 0,
    infoHash: raw?.infoHash || "",
    bittorrent: raw?.bittorrent || storeTask?.bittorrent || null,
    uploadLength,
    shareRatio,
    files: taskFiles.value.length > 0 ? taskFiles.value : (raw?.files || storeTask?.files || []),
  };
});

/** 任务状态徽标样式类 */
const statusBadgeClass = computed(() => {
  if (!task.value) return "badge-secondary";
  if (task.value.status === "active") return "badge-primary";
  if (task.value.status === "complete") return "badge-success";
  if (task.value.status === "error") return "badge-danger";
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
 * 异步拉取任务详情、分片、文件与 Peers 节点数据
 */
async function loadDetailData() {
  if (!store.client || !props.gid) return;

  try {
    const [statusData, files, peers, options] = await Promise.all([
      store.client.tellStatus(props.gid).catch(() => null),
      store.client.getFiles(props.gid).catch(() => []),
      store.client.getPeers(props.gid).catch(() => []),
      store.client.getOption(props.gid).catch(() => ({})),
    ]);

    if (statusData) {
      rawDetail.value = statusData;
    }
    taskFiles.value = files || [];
    peersList.value = peers || [];
    taskOptions.value = {
      "max-download-limit": options["max-download-limit"] || "0",
      "max-upload-limit": options["max-upload-limit"] || "0",
    };
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
 * 保存任务独立限速设置
 */
async function saveTaskOptions() {
  if (!store.client || !props.gid) return;
  try {
    await store.client.changeOption(props.gid, taskOptions.value);
    alert("Saved successfully!");
  } catch (e) {
    alert(`Failed: ${e.message}`);
  }
}

/**
 * 返回任务列表
 */
function goBack() {
  navigate("/downloading");
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
