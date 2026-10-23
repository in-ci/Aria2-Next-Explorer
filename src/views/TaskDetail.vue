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
import { ref, computed, onMounted, watch } from "vue";
import { store } from "../store";
import { navigate } from "../router";
import PieceMap from "../components/PieceMap.vue";
import { formatBytes, formatSpeed, formatDuration, formatPercent } from "../utils/format";

const props = defineProps({
  gid: { type: String, required: true },
});

const currentTab = ref("overview");
const taskFiles = ref([]);
const peersList = ref([]);
const taskOptions = ref({
  "max-download-limit": "0",
  "max-upload-limit": "0",
});

const task = computed(() => {
  const all = [
    ...store.tasks.active,
    ...store.tasks.waiting,
    ...store.tasks.stopped,
  ];
  return all.find((t) => t.gid === props.gid) || null;
});

const statusBadgeClass = computed(() => {
  if (!task.value) return "badge-secondary";
  if (task.value.status === "active") return "badge-primary";
  if (task.value.status === "complete") return "badge-success";
  if (task.value.status === "error") return "badge-danger";
  return "badge-secondary";
});

function getFileName(filePath) {
  if (!filePath) return "-";
  const parts = filePath.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || filePath;
}

function getFilePercent(file) {
  const total = Number(file.length) || 0;
  const completed = Number(file.completedLength) || 0;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}

async function loadDetailData() {
  if (!store.client || !props.gid) return;

  try {
    const [files, peers, options] = await Promise.all([
      store.client.getFiles(props.gid).catch(() => []),
      store.client.getPeers(props.gid).catch(() => []),
      store.client.getOption(props.gid).catch(() => ({})),
    ]);
    taskFiles.value = files || [];
    peersList.value = peers || [];
    taskOptions.value = {
      "max-download-limit": options["max-download-limit"] || "0",
      "max-upload-limit": options["max-upload-limit"] || "0",
    };
  } catch (e) {}
}

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

async function saveTaskOptions() {
  if (!store.client || !props.gid) return;
  try {
    await store.client.changeOption(props.gid, taskOptions.value);
    alert("Saved successfully!");
  } catch (e) {
    alert(`Failed: ${e.message}`);
  }
}

function goBack() {
  navigate("/downloading");
}

onMounted(() => {
  loadDetailData();
});

watch(() => props.gid, () => {
  loadDetailData();
});
</script>
