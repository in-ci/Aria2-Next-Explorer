<template>
  <section class="content no-padding">
    <form name="newTaskForm" @submit.prevent="submitTask(false)" novalidate>
      <div class="nav-tabs-custom">
        <!-- 顶部标签切换栏与右侧操作按钮栏 (与原作者 AriaNg 布局完全对齐) -->
        <ul class="nav nav-tabs">
          <!-- 标签 1: 链接 / 种子文件 -->
          <li class="nav-item" :class="{ active: currentTab === 'links' }">
            <a class="nav-link pointer-cursor" @click="currentTab = 'links'">
              {{
                taskType === 'torrent'
                  ? $t('Torrent File')
                  : taskType === 'metalink'
                  ? $t('Metalink File')
                  : $t('Links')
              }}
            </a>
          </li>

          <!-- 标签 2: 下载参数选项 -->
          <li class="nav-item" :class="{ active: currentTab === 'options' }">
            <a class="nav-link pointer-cursor" @click="currentTab = 'options'">
              {{ $t('Options') }}
            </a>
          </li>

          <li class="divider"></li>

          <!-- 右侧操作工具栏 -->
          <li class="nav-toolbar ml-auto d-flex align-items-center pr-2">
            <!-- 打开种子 / Metalink 文件下拉按钮 -->
            <div class="btn-group mr-2" style="position: relative;">
              <button
                type="button"
                class="btn btn-sm btn-default dropdown-toggle"
                :title="$t('Open Torrent File')"
                @click.stop="toggleFolderDropdown"
              >
                <i class="fa fa-folder-open-o fa-1_1x"></i>
              </button>
              <ul
                class="dropdown-menu dropdown-menu-right shadow-sm"
                :class="{ show: isFolderDropdownOpen }"
                v-if="isFolderDropdownOpen"
                style="display: block; position: absolute; right: 0; top: 100%; z-index: 1050;"
                @click.stop
              >
                <li>
                  <a class="dropdown-item pointer-cursor" @click="triggerOpenTorrent">
                    <i class="fa fa-file-archive-o mr-2"></i>{{ $t("Open Torrent File") }}
                  </a>
                </li>
                <li>
                  <a class="dropdown-item pointer-cursor" @click="triggerOpenMetalink">
                    <i class="fa fa-link mr-2"></i>{{ $t("Open Metalink File") }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- 立即下载 / 稍后下载 / 浏览器下载 组合按钮 -->
            <div class="btn-group mr-2" style="position: relative;">
              <button
                type="submit"
                class="btn btn-sm"
                :class="{
                  'btn-default': !isValid,
                  'btn-success': isValid,
                  'disabled': !isValid
                }"
                :disabled="!isValid"
              >
                {{ $t("Download Now") }}
              </button>
              <button
                type="button"
                class="btn btn-sm dropdown-toggle dropdown-toggle-split"
                :class="{
                  'btn-default': !isValid,
                  'btn-success': isValid,
                  'disabled': !isValid
                }"
                :disabled="!isValid"
                @click.stop="toggleDownloadDropdown"
              >
                <span class="sr-only">Toggle Dropdown</span>
              </button>
              <ul
                class="dropdown-menu dropdown-menu-right shadow-sm"
                :class="{ show: isDownloadDropdownOpen }"
                v-if="isDownloadDropdownOpen"
                style="display: block; position: absolute; right: 0; top: 100%; z-index: 1050;"
                @click.stop
              >
                <li>
                  <a class="dropdown-item pointer-cursor" @click="submitTask(true)">
                    <i class="fa fa-clock-o mr-2"></i>{{ $t("Download Later") }}
                  </a>
                </li>
                <li v-if="taskType === 'urls'" class="dropdown-divider"></li>
                <li v-if="taskType === 'urls'">
                  <a class="dropdown-item pointer-cursor" @click="downloadViaBrowser">
                    <i class="fa fa-globe mr-2"></i>{{ $t("Download via Browser") }}
                  </a>
                </li>
              </ul>
            </div>

            <!-- 重置表单按钮 -->
            <button
              type="button"
              class="btn btn-sm"
              :class="{
                'btn-default': !isValid,
                'btn-secondary': isValid
              }"
              :disabled="!isValid"
              @click="resetForm"
            >
              {{ $t("Reset") }}
            </button>
          </li>
        </ul>

        <!-- 标签页内容承载区 -->
        <div class="tab-content no-padding">
          <!-- 标签页 1: 链接列表 / 种子文件 -->
          <div class="tab-pane" :class="{ active: currentTab === 'links' }">
            <!-- 1.1 普通下载链接输入区 -->
            <div class="new-task-table p-3" v-if="taskType === 'urls'">
              <div class="row">
                <div class="col-sm-12">
                  <p class="mb-2">
                    <span class="font-weight-bold">{{ $t("Download Links:") }}</span>
                    <span class="badge badge-info ml-2" v-if="validUrls.length > 0">
                      {{ validUrls.length }} {{ $t("Links") }}
                    </span>
                  </p>
                  <div
                    class="form-group no-margin new-task-drop-container"
                    :class="{ 'is-drag-over': isDragOver }"
                    @dragover.prevent="isDragOver = true"
                    @dragleave.prevent="isDragOver = false"
                    @drop.prevent="handleDrop"
                  >
                    <textarea
                      name="urls"
                      class="form-control font-monospace"
                      rows="12"
                      autofocus
                      v-model="urlsText"
                      :placeholder="$t('One link per line (HTTP, HTTPS, FTP, SFTP, Magnet, etc.)')"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- 1.2 种子文件上传状态区 -->
            <div class="new-task-table task-table p-3" v-else-if="taskType === 'torrent' || taskType === 'metalink'">
              <div class="row border-bottom py-2">
                <div class="col-sm-12">
                  <div class="input-group mb-2">
                    <div class="input-group-prepend">
                      <span class="input-group-text">{{ $t("File Name") }}</span>
                    </div>
                    <input class="form-control" :value="uploadedFile?.name || ''" readonly />
                    <div class="input-group-append">
                      <button
                        class="btn btn-outline-danger"
                        type="button"
                        :title="$t('Cancel')"
                        @click="clearUploadedFile"
                      >
                        <i class="fa fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <div class="text-success font-weight-bold mt-2" v-if="uploadedFile">
                    <i class="fa fa-file-archive-o mr-1"></i>
                    <span>{{ formatBytes(uploadedFile.size) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 标签页 2: 详细任务下载选项 (基础设置 / 高级设置过滤器) -->
          <div class="tab-pane" :class="{ active: currentTab === 'options' }">
            <div class="settings-table striped hoverable">
              <!-- 选项过滤器切换栏 -->
              <div class="settings-table-title new-task-filter-title px-3 py-2 border-bottom">
                <div class="row">
                  <div class="col-sm-12 d-flex align-items-center">
                    <span class="font-weight-bold mr-2">{{ $t("Filters") }}:</span>
                    <div class="checkbox checkbox-inline checkbox-primary checkbox-compact mr-3">
                      <input
                        id="optionFilterBasic"
                        type="checkbox"
                        v-model="optionFilter.basic"
                        :disabled="optionFilter.basic && !optionFilter.advanced"
                      />
                      <label for="optionFilterBasic" class="form-check-label pointer-cursor ml-1">
                        {{ $t("Basic Settings") }}
                      </label>
                    </div>
                    <div class="checkbox checkbox-inline checkbox-primary checkbox-compact">
                      <input
                        id="optionFilterAdvanced"
                        type="checkbox"
                        v-model="optionFilter.advanced"
                        :disabled="!optionFilter.basic && optionFilter.advanced"
                      />
                      <label for="optionFilterAdvanced" class="form-check-label pointer-cursor ml-1">
                        {{ $t("Advanced Settings") }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 渲染当前激活的选项列表 (与原版一致，支持单任务文件名、下载目录、请求头等) -->
              <SettingRow
                v-for="opt in visibleOptions"
                :key="opt.key"
                :option="opt"
                v-model="taskOptions[opt.key]"
                :default-value="globalOptions[opt.key] !== undefined ? globalOptions[opt.key] : opt.defaultValue"
              />
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- 隐藏的种子/Metalink文件选择输入元素 -->
    <input
      ref="torrentInputRef"
      type="file"
      accept=".torrent"
      style="display: none;"
      @change="onTorrentFileSelected"
    />
    <input
      ref="metalinkInputRef"
      type="file"
      accept=".metalink,.meta4"
      style="display: none;"
      @change="onMetalinkFileSelected"
    />
  </section>
</template>

<script setup>
/**
 * ==============================================================================
 * 新增任务完整视图组件 (NewTaskModal)
 * ==============================================================================
 * 100% 对齐原版 AriaNg / DownHub 的新增任务架构与交互逻辑：
 * 1. 包含 Links 链接与 Options 详细参数两大核心标签页。
 * 2. 具备完整的“基本设置”与“高级设置”过滤器切换机制。
 * 3. 完整支持扩展拦截下载唤起，自动解码 Base64 URL 并回填文件名、保存路径、自定义请求头 (Cookie / User-Agent) 及 Referer。
 * 4. 支持立即下载、稍后下载 (添加后暂停) 以及通过浏览器原生接口下载。
 * ==============================================================================
 */

import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { store, refreshData } from "../store";
import { navigate } from "../router";
import { formatBytes } from "../utils/format";
import SettingRow from "../components/SettingRow.vue";
import { getAllSettingsOptions } from "../api/settings";

const props = defineProps({
  /** 外部路由传递的查询参数字典对象 */
  query: {
    type: Object,
    default: () => ({}),
  },
});

/** 当前激活的标签页 ('links' | 'options') */
const currentTab = ref("links");
/** 任务类型 ('urls' | 'torrent' | 'metalink') */
const taskType = ref("urls");
/** 下载链接多行文本 */
const urlsText = ref("");
/** 上传的本地文件对象 (.torrent 或 .metalink) */
const uploadedFile = ref(null);
/** 拖拽悬停视觉指示标记 */
const isDragOver = ref(false);

/** 顶部工具栏下拉菜单展开状态 */
const isFolderDropdownOpen = ref(false);
const isDownloadDropdownOpen = ref(false);

/** 文件输入 DOM 节点引用 */
const torrentInputRef = ref(null);
const metalinkInputRef = ref(null);

/** 下载选项过滤器开关 (默认展示基本设置) */
const optionFilter = ref({
  basic: true,
  advanced: false,
});

/** 用户输入的任务局部个性化选项参数字典 */
const taskOptions = ref({});
/** 当前服务端全局默认选项缓存 */
const globalOptions = ref({});

/** 原版 AriaNg 新建任务支持的 46 项配置及其基础/高级分类优先级映射表 */
const TASK_OPTIONS_PRIORITY_MAP = {
  "dir": "basic",
  "out": "basic",
  "filename-hint": "basic",
  "filename-hint-source": "advanced",
  "incomplete-suffix": "advanced",
  "auto-file-renaming-style": "advanced",
  "allow-overwrite": "advanced",
  "max-download-limit": "basic",
  "max-upload-limit": "basic",
  "split": "basic",
  "min-split-size": "advanced",
  "max-connection-per-server": "advanced",
  "lowest-speed-limit": "advanced",
  "all-proxy": "basic",
  "all-proxy-user": "advanced",
  "all-proxy-passwd": "advanced",
  "http-user": "advanced",
  "http-passwd": "advanced",
  "checksum": "advanced",
  "continue": "basic",
  "referer": "basic",
  "force-save": "basic",
  "header": "basic",
  "bt-max-peers": "advanced",
  "bt-max-connections": "advanced",
  "bt-max-uploads": "advanced",
  "bt-max-uploads-per-torrent": "advanced",
  "bt-encryption": "advanced",
  "bt-transport": "advanced",
  "bt-super-seeding": "advanced",
  "bt-first-last-piece-first": "advanced",
  "bt-file-priority": "advanced",
  "force-sequential": "advanced",
  "detach-share-only": "advanced",
  "bt-tracker": "basic",
  "bt-exclude-tracker": "advanced",
  "seed-ratio": "basic",
  "seed-time": "basic",
  "pause-metadata": "advanced",
  "check-integrity": "advanced",
  "file-allocation": "advanced",
  "ed2k-preview-priority": "advanced",
  "media": "advanced",
  "media-format": "advanced",
  "media-video": "advanced",
  "media-audio": "advanced",
};

/** 计算属性：按配置过滤排序后的可用选项列表 */
const availableOptions = computed(() => {
  const all = getAllSettingsOptions();
  const optionMap = new Map(all.map((opt) => [opt.key, opt]));
  const result = [];

  for (const [key, priority] of Object.entries(TASK_OPTIONS_PRIORITY_MAP)) {
    if (optionMap.has(key)) {
      result.push({
        ...optionMap.get(key),
        priority,
      });
    }
  }

  // 基础设置排在前面，高级设置排在后面
  return result.sort((a, b) => {
    if (a.priority === "basic" && b.priority !== "basic") return -1;
    if (a.priority !== "basic" && b.priority === "basic") return 1;
    return 0;
  });
});

/** 计算属性：根据过滤器当前勾选状态最终渲染的选项集合 */
const visibleOptions = computed(() => {
  return availableOptions.value.filter((opt) => {
    if (opt.priority === "basic") {
      return optionFilter.value.basic;
    }
    return optionFilter.value.advanced;
  });
});

/** 计算属性：按行解析出的合规链接列表 */
const validUrls = computed(() => {
  return urlsText.value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("#"));
});

/** 计算属性：当前任务输入是否满足提交条件 */
const isValid = computed(() => {
  if (taskType.value === "urls") {
    return validUrls.value.length > 0;
  }
  return uploadedFile.value !== null;
});

/**
 * 切换文件夹选择下拉菜单
 */
function toggleFolderDropdown() {
  isFolderDropdownOpen.value = !isFolderDropdownOpen.value;
  isDownloadDropdownOpen.value = false;
}

/**
 * 切换下载动作下拉菜单
 */
function toggleDownloadDropdown() {
  isDownloadDropdownOpen.value = !isDownloadDropdownOpen.value;
  isFolderDropdownOpen.value = false;
}

/**
 * 关闭所有下拉菜单
 */
function closeAllDropdowns() {
  isFolderDropdownOpen.value = false;
  isDownloadDropdownOpen.value = false;
}

/**
 * 触发本地种子文件选择框
 */
function triggerOpenTorrent() {
  closeAllDropdowns();
  if (torrentInputRef.value) {
    torrentInputRef.value.value = "";
    torrentInputRef.value.click();
  }
}

/**
 * 触发本地 Metalink 文件选择框
 */
function triggerOpenMetalink() {
  closeAllDropdowns();
  if (metalinkInputRef.value) {
    metalinkInputRef.value.value = "";
    metalinkInputRef.value.click();
  }
}

/**
 * 监听用户选中的种子文件
 */
function onTorrentFileSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (file) {
    uploadedFile.value = file;
    taskType.value = "torrent";
    currentTab.value = "links";
  }
}

/**
 * 监听用户选中的 Metalink 文件
 */
function onMetalinkFileSelected(e) {
  const file = e.target.files && e.target.files[0];
  if (file) {
    uploadedFile.value = file;
    taskType.value = "metalink";
    currentTab.value = "links";
  }
}

/**
 * 清除已上传的文件并切回普通链接模式
 */
function clearUploadedFile() {
  uploadedFile.value = null;
  taskType.value = "urls";
}

/**
 * 处理文件拖放导入 (.torrent / .metalink 或链接文本)
 */
function handleDrop(e) {
  isDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    if (file.name.endsWith(".torrent")) {
      uploadedFile.value = file;
      taskType.value = "torrent";
      currentTab.value = "links";
      return;
    }
    if (file.name.endsWith(".meta4") || file.name.endsWith(".metalink")) {
      uploadedFile.value = file;
      taskType.value = "metalink";
      currentTab.value = "links";
      return;
    }
  }

  const text = e.dataTransfer?.getData("text");
  if (text) {
    urlsText.value = urlsText.value ? `${urlsText.value}\n${text.trim()}` : text.trim();
  }
}

/**
 * 重置所有输入框与参数选项
 */
function resetForm() {
  urlsText.value = "";
  uploadedFile.value = null;
  taskType.value = "urls";
  taskOptions.value = {};
  currentTab.value = "links";
  closeAllDropdowns();
}

/**
 * 解码由扩展后台拦截传递的 URL 参数（支持标准 Base64、URL-Safe Base64 与 URL 编码）
 * @param {string} val 原始 URL 参数
 * @returns {string} 解码后的明文字符串
 */
function decodeUrlParam(val) {
  if (!val) return "";
  try {
    let b64 = val.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const decoded = atob(b64);
    try {
      return decodeURI(decoded);
    } catch {
      return decoded;
    }
  } catch (e) {
    try {
      return decodeURIComponent(val);
    } catch {
      return val;
    }
  }
}

/**
 * 核心：解析并回填扩展下载拦截参数至当前界面
 * @param {object} q 路由参数字典
 */
function applyQueryParams(q) {
  if (!q || Object.keys(q).length === 0) return;

  let hasInterceptedParams = false;

  // 1. 回填下载链接
  if (q.url) {
    const decodedUrl = decodeUrlParam(q.url);
    if (decodedUrl) {
      urlsText.value = decodedUrl;
      hasInterceptedParams = true;
    }
  }

  // 2. 回填目标文件名 (out)
  if (q.filename) {
    try {
      taskOptions.value.out = decodeURIComponent(q.filename);
      hasInterceptedParams = true;
    } catch {
      taskOptions.value.out = q.filename;
    }
  }

  // 3. 回填保存目录 (dir)
  if (q.dir) {
    try {
      taskOptions.value.dir = decodeURIComponent(q.dir);
      hasInterceptedParams = true;
    } catch {
      taskOptions.value.dir = q.dir;
    }
  }

  // 4. 回填引用来源网址 (referer)
  if (q.referer) {
    try {
      taskOptions.value.referer = decodeURIComponent(q.referer);
      hasInterceptedParams = true;
    } catch {
      taskOptions.value.referer = q.referer;
    }
  }

  // 5. 回填自定义请求头 (header - 如 Cookie, User-Agent)
  if (q.header) {
    try {
      taskOptions.value.header = decodeURIComponent(q.header);
      hasInterceptedParams = true;
    } catch {
      taskOptions.value.header = q.header;
    }
  }

  // 拦截下载唤起且包含参数时，默认展示 Options 选项卡，让用户一览文件名与保存目录
  if (hasInterceptedParams) {
    currentTab.value = "options";
  }
}

/**
 * 从 Aria2 服务端拉取全局基础默认设置（如全局默认下载目录）
 */
async function loadGlobalOptions() {
  if (!store.client) return;
  try {
    const remote = await store.client.getGlobalOption();
    if (remote) {
      globalOptions.value = remote;
    }
  } catch (e) {
    console.warn("Failed to load global options:", e);
  }
}

/**
 * 提交创建任务至 Aria2-Next 核心
 * @param {boolean} isPaused 是否初始以暂停/稍后开始状态添加
 */
async function submitTask(isPaused = false) {
  if (!store.client || !isValid.value) return;

  // 提取有效配置项（过滤掉空白未填项）
  const optionsToPass = {};
  for (const [k, v] of Object.entries(taskOptions.value)) {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      optionsToPass[k] = String(v).trim();
    }
  }

  if (isPaused) {
    optionsToPass.pause = "true";
  }

  try {
    let lastGid = null;
    if (taskType.value === "urls") {
      const urls = validUrls.value;
      if (urls.length === 1) {
        lastGid = await store.client.addUri(urls, optionsToPass);
      } else {
        // 多链接批量任务：单任务专属重命名 out 不适用于批量下载
        const { out, ...batchOpts } = optionsToPass;
        for (const u of urls) {
          const res = await store.client.addUri([u], batchOpts);
          if (res) lastGid = res;
        }
      }
    } else if (taskType.value === "torrent" && uploadedFile.value) {
      const base64 = await fileToBase64(uploadedFile.value);
      lastGid = await store.client.addTorrent(base64, [], optionsToPass);
    }

    await refreshData(true);

    // 根据用户设置决定创建后跳转目标页面
    if (store.options.afterCreatingNewTask === "task-detail" && lastGid) {
      navigate(`/task/detail/${lastGid}`);
    } else if (isPaused) {
      navigate("/waiting");
    } else {
      navigate(`/${store.options.defaultTaskPage || "downloading"}`);
    }
  } catch (err) {
    alert(`Failed to add task: ${err.message}`);
  }
}

/**
 * 降级使用浏览器原生下载通道执行下载
 */
function downloadViaBrowser() {
  closeAllDropdowns();
  if (typeof chrome !== "undefined" && chrome.downloads) {
    validUrls.value.forEach((url) => {
      const downloadOptions = { url };
      if (taskOptions.value.out && validUrls.value.length === 1) {
        downloadOptions.filename = taskOptions.value.out;
      }
      chrome.downloads.download(downloadOptions).catch((err) => {
        console.warn("Failed to download via browser:", err);
      });
    });
    navigate(`/${store.options.defaultTaskPage || "downloading"}`);
  }
}

/**
 * 将 File 对象转为 Base64 编码字符串
 * @param {File} file
 * @returns {Promise<string>}
 */
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

onMounted(() => {
  loadGlobalOptions();
  window.addEventListener("click", closeAllDropdowns);
});

onUnmounted(() => {
  window.removeEventListener("click", closeAllDropdowns);
});

// 监听路由参数变更，保证无论窗口首次打开还是后续二次拦截唤起，均能即时回填下载参数
watch(
  () => props.query,
  (newQuery) => {
    applyQueryParams(newQuery);
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.new-task-drop-container {
  border: 2px dashed transparent;
  border-radius: 4px;
  transition: border-color 0.2s ease;
}
.new-task-drop-container.is-drag-over {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.05);
}
.nav-tabs-custom > .nav-tabs > li.nav-toolbar {
  margin-left: auto;
}
.dropdown-menu {
  min-width: 160px;
}
</style>
