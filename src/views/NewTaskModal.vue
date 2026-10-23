<template>
  <section class="content no-padding">
    <div class="nav-tabs-custom">
      <ul class="nav nav-tabs">
        <li class="nav-item" :class="{ active: currentTab === 'links' }">
          <a class="nav-link pointer-cursor" @click="currentTab = 'links'">
            {{ $t("Links") }}
          </a>
        </li>
        <li class="nav-item" :class="{ active: currentTab === 'torrent' }">
          <a class="nav-link pointer-cursor" @click="currentTab = 'torrent'">
            {{ $t("Torrent File") }}
          </a>
        </li>
        <li class="nav-item slim ml-auto">
          <a class="nav-link pointer-cursor" @click="cancel">
            <i class="fa fa-reply mr-1"></i>{{ $t("Cancel") }}
          </a>
        </li>
      </ul>

      <div class="tab-content no-padding p-3">
        <!-- 1. 链接输入 (URLs / Magnet) -->
        <div v-show="currentTab === 'links'" class="tab-pane active">
          <div class="form-group mb-3">
            <label class="font-weight-bold">
              {{ $t("Download Links:") }} ({{ validUrls.length }} {{ $t("Links") }})
            </label>
            <textarea
              class="form-control font-monospace"
              rows="8"
              :placeholder="$t('One link per line (HTTP, HTTPS, FTP, SFTP, Magnet, etc.)')"
              v-model="urlsText"
            ></textarea>
          </div>
        </div>

        <!-- 2. 种子文件 (Torrent) -->
        <div v-show="currentTab === 'torrent'" class="tab-pane active">
          <div class="form-group mb-3 text-center py-4 border rounded bg-light">
            <i class="fa fa-folder-open-o fa-3x text-muted mb-2 d-block"></i>
            <p v-if="!torrentFile">{{ $t("Select or drop a .torrent file here") }}</p>
            <p v-else class="text-success font-weight-bold">
              <i class="fa fa-file-archive-o mr-1"></i>{{ torrentFile.name }} ({{ formatBytes(torrentFile.size) }})
            </p>
            <input
              type="file"
              ref="fileInputRef"
              accept=".torrent"
              style="display: none;"
              @change="onFileChange"
            />
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              @click="$refs.fileInputRef.click()"
            >
              {{ $t("Choose Torrent File") }}
            </button>
          </div>
        </div>

        <!-- 高级下载选项 -->
        <div class="border-top pt-3 mt-3">
          <div class="row">
            <div class="col-sm-6 form-group mb-2">
              <label>{{ $t("Download Dir") }}</label>
              <input
                type="text"
                class="form-control"
                :placeholder="$t('Default')"
                v-model="options.dir"
              />
            </div>
            <div v-if="currentTab === 'links' && validUrls.length === 1" class="col-sm-6 form-group mb-2">
              <label>{{ $t("Rename File") }}</label>
              <input
                type="text"
                class="form-control"
                :placeholder="$t('Default')"
                v-model="options.out"
              />
            </div>
          </div>

          <div class="form-check mt-2 mb-3">
            <input
              type="checkbox"
              class="form-check-input"
              id="pauseCheck"
              v-model="startPaused"
            />
            <label class="form-check-label" for="pauseCheck">
              {{ $t("Start task paused") || "Start task paused" }}
            </label>
          </div>

          <!-- 底部操作按钮 -->
          <div class="d-flex justify-content-end">
            <button
              type="button"
              class="btn btn-secondary mr-2"
              @click="cancel"
            >
              {{ $t("Cancel") }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!isValid"
              @click="submitTask"
            >
              <i class="fa fa-download mr-1"></i>{{ $t("Download Now") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { store, refreshData } from "../store";
import { navigate } from "../router";
import { formatBytes } from "../utils/format";

const currentTab = ref("links");
const urlsText = ref("");
const torrentFile = ref(null);
const fileInputRef = ref(null);
const startPaused = ref(false);

const options = ref({
  dir: "",
  out: "",
});

const validUrls = computed(() => {
  return urlsText.value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("#"));
});

const isValid = computed(() => {
  if (currentTab.value === "links") {
    return validUrls.value.length > 0;
  }
  return torrentFile.value !== null;
});

function onFileChange(e) {
  const file = e.target.files && e.target.files[0];
  if (file) {
    torrentFile.value = file;
  }
}

function cancel() {
  navigate("/downloading");
}

async function submitTask() {
  if (!store.client || !isValid.value) return;

  const taskOpts = {};
  if (options.value.dir.trim()) taskOpts.dir = options.value.dir.trim();
  if (options.value.out.trim()) taskOpts.out = options.value.out.trim();
  if (startPaused.value) taskOpts.pause = "true";

  try {
    if (currentTab.value === "links") {
      for (const url of validUrls.value) {
        await store.client.addUri([url], taskOpts);
      }
    } else if (currentTab.value === "torrent" && torrentFile.value) {
      const base64 = await fileToBase64(torrentFile.value);
      await store.client.addTorrent(base64, [], taskOpts);
    }

    await refreshData();
    navigate("/downloading");
  } catch (err) {
    alert(`Failed to add task: ${err.message}`);
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
</script>
