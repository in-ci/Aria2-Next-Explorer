<template>
  <section class="content no-padding">
    <form name="newTaskForm" @submit.prevent="submitTask(false)" novalidate>
      <div class="nav-tabs-custom">
        <!-- 顶部标签切换栏与操作工具栏 (完全还原原版 AriaNg: 工具栏紧随选项右侧竖线左对齐) -->
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

          <!-- 分隔竖线 (紧贴选项右侧) -->
          <li class="divider"></li>

          <!-- 操作工具栏 (左侧紧贴 divider 竖线，还原原版居左紧凑排布) -->
          <li class="nav-toolbar d-flex align-items-center ml-2">
            <!-- 1. 打开种子 / Metalink 文件下拉按钮 (紧靠竖线) -->
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
                class="dropdown-menu shadow-sm"
                :class="{ show: isFolderDropdownOpen }"
                v-if="isFolderDropdownOpen"
                style="display: block; position: absolute; left: 0; top: 100%; z-index: 1050;"
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

            <!-- 2. 立即下载 / 稍后下载 / 浏览器下载 组合按钮 -->
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
                class="dropdown-menu shadow-sm"
                :class="{ show: isDownloadDropdownOpen }"
                v-if="isDownloadDropdownOpen"
                style="display: block; position: absolute; left: 0; top: 100%; z-index: 1050;"
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

            <!-- 3. 重置表单按钮 -->
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

          <!-- 标签页 2: 详细任务下载选项 (依据协议类型差分展示，基础设置/高级设置过滤) -->
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

              <!-- 渲染当前激活的选项列表 (依协议差分过滤，HTTP/HTTPS 不展示 BT 参数，BT 任务不展示 HTTP 请求头) -->
              <SettingRow
                v-for="opt in visibleOptions"
                :key="opt.key"
                :option="opt"
                v-model="taskOptions[opt.key]"
                :default-value="getOptionDefault(opt)"
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
 * 2. 操作工具栏紧贴 Options 标签页右侧的竖线左对齐排列，还原原作者紧凑界面。
 * 3. 支持依据当前下载类型（HTTP/HTTPS/FTP、BT/磁力链接、ED2K、媒体流）差分过滤选项。
 *    对于 HTTPS/HTTP 链接，自动隐藏 bt-tracker、seed-ratio 等所有 BT 选项，界面极度清爽。
 * 4. 完整支持扩展拦截下载唤起，自动解码 Base64 URL 并回填文件名、保存路径、自定义请求头 (Cookie / User-Agent) 及 Referer。
 * 5. 支持立即下载、稍后下载 (添加后暂停) 以及通过浏览器原生接口下载。
 * ==============================================================================
 */

import { ref, computed, onMounted, watch } from "vue";
import { store, refreshData, fetchGlobalOptions } from "../store";
import { navigate } from "../router";
import { formatBytes } from "../utils/format";
import SettingRow from "../components/SettingRow.vue";
import { getAllSettingsOptions } from "../api/settings";
import { useEventListener } from "../composables/useEventListener";

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
/** 当前服务端全局生效选项缓存 (响应式绑定至 store.globalOptions) */
const globalOptions = computed(() => store.globalOptions || {});

/** 原版 AriaNg 新建任务 46 项配置及其分类 (category) 与基础/高级优先级 (priority) 映射表 */
const TASK_OPTIONS_CONFIG = [
  // 1. 用户期望优先呈现的核心基础选项 (严格按期望顺序排列)
  { key: "dir", category: "global", priority: "basic" }, // 下载路径
  { key: "out", category: "http", priority: "basic" }, // 文件名
  { key: "max-download-limit", category: "global", priority: "basic" }, // 最大下载速度
  { key: "split", category: "http", priority: "basic" }, // 单任务连接数
  { key: "continue", category: "http", priority: "basic" }, // 断点续传
  { key: "referer", category: "http", priority: "basic" }, // 请求来源
  { key: "all-proxy", category: "http", priority: "basic" }, // 代理服务器
  { key: "header", category: "http", priority: "basic" }, // 自定义请求头
  { key: "filename-hint", category: "http", priority: "basic" }, // 文件名提示

  // 2. 其余全局基础选项
  { key: "force-save", category: "global", priority: "basic" }, // 强制保存

  // 3. BitTorrent / Magnet 专属基础选项 (仅在 BT/磁力链接任务时展示，HTTP/HTTPS 下载彻底隐藏)
  { key: "max-upload-limit", category: "bittorrent", priority: "basic" },
  { key: "bt-tracker", category: "bittorrent", priority: "basic" },
  { key: "seed-ratio", category: "bittorrent", priority: "basic" },
  { key: "seed-time", category: "bittorrent", priority: "basic" },

  // 4. 高级设置选项 (勾选“高级设置”过滤器时显示)
  { key: "auto-file-renaming-style", category: "global", priority: "advanced" },
  { key: "allow-overwrite", category: "global", priority: "advanced" },
  { key: "check-integrity", category: "global", priority: "advanced" },
  { key: "file-allocation", category: "global", priority: "advanced" },
  { key: "filename-hint-source", category: "http", priority: "advanced" },
  { key: "incomplete-suffix", category: "http", priority: "advanced" },
  { key: "min-split-size", category: "http", priority: "advanced" },
  { key: "max-connection-per-server", category: "http", priority: "advanced" },
  { key: "lowest-speed-limit", category: "http", priority: "advanced" },
  { key: "all-proxy-user", category: "http", priority: "advanced" },
  { key: "all-proxy-passwd", category: "http", priority: "advanced" },
  { key: "http-user", category: "http", priority: "advanced" },
  { key: "http-passwd", category: "http", priority: "advanced" },
  { key: "checksum", category: "http", priority: "advanced" },
  { key: "bt-max-peers", category: "bittorrent", priority: "advanced" },
  { key: "bt-max-connections", category: "bittorrent", priority: "advanced" },
  { key: "bt-max-uploads", category: "bittorrent", priority: "advanced" },
  { key: "bt-max-uploads-per-torrent", category: "bittorrent", priority: "advanced" },
  { key: "bt-encryption", category: "bittorrent", priority: "advanced" },
  { key: "bt-transport", category: "bittorrent", priority: "advanced" },
  { key: "bt-super-seeding", category: "bittorrent", priority: "advanced" },
  { key: "bt-first-last-piece-first", category: "bittorrent", priority: "advanced" },
  { key: "bt-file-priority", category: "bittorrent", priority: "advanced" },
  { key: "force-sequential", category: "bittorrent", priority: "advanced" },
  { key: "detach-share-only", category: "bittorrent", priority: "advanced" },
  { key: "bt-exclude-tracker", category: "bittorrent", priority: "advanced" },
  { key: "pause-metadata", category: "bittorrent", priority: "advanced" },

  // 5. ED2K 电驴专有高级选项
  { key: "ed2k-preview-priority", category: "ed2k", priority: "advanced" },

  // 6. 媒体流专有高级选项
  { key: "media", category: "media", priority: "advanced" },
  { key: "media-format", category: "media", priority: "advanced" },
  { key: "media-video", category: "media", priority: "advanced" },
  { key: "media-audio", category: "media", priority: "advanced" },
];

/** 计算属性：按配置过滤并注入元数据的全量选项列表 */
const availableOptions = computed(() => {
  const all = getAllSettingsOptions();
  const optionMap = new Map(all.map((opt) => [opt.key, opt]));
  const result = [];

  for (const item of TASK_OPTIONS_CONFIG) {
    if (optionMap.has(item.key)) {
      result.push({
        ...optionMap.get(item.key),
        category: item.category,
        priority: item.priority,
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

/** 计算属性：按行解析出的合规链接列表 */
const validUrls = computed(() => {
  return urlsText.value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("#"));
});

/**
 * 计算属性：智能侦测当前下载任务的协议类型
 * 依据链接前缀动态判断是 HTTP/HTTPS、BitTorrent 还是 ED2K，用于实现选项差分显示
 */
const detectedProtocols = computed(() => {
  if (taskType.value === "torrent") {
    return { isBt: true, isHttp: false, isEd2k: false, isMedia: false };
  }
  if (taskType.value === "metalink") {
    return { isBt: false, isHttp: false, isEd2k: false, isMedia: false, isMetalink: true };
  }

  const urls = validUrls.value;
  if (urls.length === 0) {
    // 尚未输入任何链接时，默认作为通用普通下载显示
    return { isBt: false, isHttp: true, isEd2k: false, isMedia: false };
  }

  let isBt = false;
  let isHttp = false;
  let isEd2k = false;
  let isMedia = false;

  for (const u of urls) {
    const lower = u.toLowerCase();
    if (lower.startsWith("magnet:")) {
      isBt = true;
    } else if (lower.startsWith("ed2k://")) {
      isEd2k = true;
    } else if (lower.includes(".m3u8") || lower.startsWith("media://")) {
      isMedia = true;
      isHttp = true;
    } else {
      isHttp = true;
    }
  }

  return { isBt, isHttp, isEd2k, isMedia };
});

/**
 * 校验当前选项是否与当前任务的下载协议相匹配 (差分过滤)
 * 例如：普通 HTTP/HTTPS 链接不会显示任何 BT 选项
 * @param {object} opt 选项定义对象
 * @returns {boolean}
 */
function isOptionCategoryMatch(opt) {
  if (opt.category === "global") return true;
  const p = detectedProtocols.value;
  if (opt.category === "http") return p.isHttp;
  if (opt.category === "bittorrent") return p.isBt;
  if (opt.category === "ed2k") return p.isEd2k;
  if (opt.category === "media") return p.isMedia;
  return true;
}

/** 计算属性：根据协议类型匹配与基础/高级过滤器最终渲染的选项集合 */
const visibleOptions = computed(() => {
  return availableOptions.value
    .filter(isOptionCategoryMatch)
    .filter((opt) => {
      if (opt.priority === "basic") {
        return optionFilter.value.basic;
      }
      return optionFilter.value.advanced;
    });
});

/**
 * 获取某个设置项的当前生效默认值（优先使用服务端 Aria2 返回的全局配置，如 dir、split 等）
 * @param {object} opt 选项配置对象
 * @returns {string | number | boolean}
 */
function getOptionDefault(opt) {
  const g = globalOptions.value;
  if (g && g[opt.key] !== undefined && g[opt.key] !== null && g[opt.key] !== "") {
    return g[opt.key];
  }
  return opt.defaultValue !== undefined ? opt.defaultValue : "";
}

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
 * 从 Aria2 服务端拉取全局基础生效配置（如全局默认下载目录 dir、并发连接数 split 等）
 */
async function loadGlobalOptions() {
  if (store.client && store.rpcStatus === "Connected") {
    await fetchGlobalOptions();
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
      navigate(`/${store.options.defaultTaskPage || "all"}`);
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
    navigate(`/${store.options.defaultTaskPage || "all"}`);
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

useEventListener(window, "click", closeAllDropdowns);

onMounted(() => {
  if (store.rpcStatus === "Connected") {
    loadGlobalOptions();
  }
});

// 监听 RPC 连接状态：当连接建立或网络重连成功时，立即同步获取服务端的真实全局配置
watch(
  () => store.rpcStatus,
  (status) => {
    if (status === "Connected") {
      loadGlobalOptions();
    }
  },
  { immediate: true }
);

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
.nav-tabs-custom > .nav-tabs > li.divider {
  padding: 10px 0;
  margin-left: 6px;
  margin-right: 6px;
  margin-top: 10px;
  border-right: 1px solid #ccc;
  height: 20px;
}
.nav-tabs-custom > .nav-tabs > li.nav-toolbar {
  margin-left: 6px;
}
.dropdown-menu {
  min-width: 160px;
}
</style>
