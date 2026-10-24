<template>
  <section class="content no-padding">
    <div class="nav-tabs-custom">
      <!-- 标签页头部 -->
      <ul class="nav nav-tabs">
        <li class="nav-item" :class="{ active: currentTab === 'global' }">
          <a class="nav-link pointer-cursor" @click="currentTab = 'global'">
            {{ $t("Global") }}
          </a>
        </li>
        <li
          v-for="(server, sIdx) in rpcList"
          :key="sIdx"
          class="nav-item"
          :class="{ active: currentTab === `rpc_${sIdx}` }"
        >
          <a class="nav-link pointer-cursor" @click="currentTab = `rpc_${sIdx}`">
            <span>{{ server.rpcAlias || server.rpcHost }}</span>
            <i
              v-if="sIdx > 0"
              class="fa fa-times text-danger ml-2"
              :title="$t('Delete RPC Setting')"
              @click.stop="removeRpcServer(sIdx)"
            ></i>
          </a>
        </li>
        <li class="nav-item slim ml-auto">
          <a class="nav-link pointer-cursor" :title="$t('Add New RPC Setting')" @click="addNewRpcServer">
            <i class="fa fa-plus mr-1"></i>{{ $t("Add New RPC Setting") }}
          </a>
        </li>
      </ul>

      <div class="tab-content no-padding">
        <!-- 1. 全局偏好设置 (Global) -->
        <div v-show="currentTab === 'global'" class="tab-pane active">
          <div class="settings-table striped hoverable">
            <!-- 语言设置 (Language: 仅保留简体中文和英文) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Language") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="selectedLanguage" @change="onLanguageChange">
                    <option value="zh_CN">简体中文 (Simplified Chinese)</option>
                    <option value="en">English (English)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 主题设置 (Theme: 仅保留经典与深色) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Theme") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="selectedTheme" @change="onThemeChange">
                    <option value="default">{{ $t("Classic") }}</option>
                    <option value="dark">{{ $t("Dark") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 动画效果 (Animation Effects) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Animation Effects") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="animationEffects" @change="onAnimationEffectsChange">
                    <option :value="true">{{ $t("Enabled") }}</option>
                    <option :value="false">{{ $t("Disabled") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 页面标题 (Page Title) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Page Title") }}</span>
                <!-- 蓝色圆圈小问号及悬停显示支持的占位符帮助浮层 -->
                <div
                  class="page-title-help-wrapper position-relative d-inline-block ml-1"
                  @mouseenter="isHelpPopoverOpen = true"
                  @mouseleave="isHelpPopoverOpen = false"
                >
                  <i
                    class="icon-primary fa fa-question-circle pointer-cursor"
                    @click.stop="isHelpPopoverOpen = !isHelpPopoverOpen"
                  ></i>

                  <div
                    v-if="isHelpPopoverOpen"
                    class="popover bs-popover-right right page-title-popover shadow-sm show"
                    role="tooltip"
                    @click.stop
                  >
                    <div class="popover-arrow"></div>
                    <div class="popover-body p-2">
                      <div class="font-weight-bold mb-1 border-bottom pb-1">
                        {{ $t("Supported Placeholder") }}:
                      </div>
                      <div class="popover-item-line">
                        <span>{{ $t("AriaNg Title") }}:</span>
                        <code class="popover-code">${title}</code>
                      </div>
                      <div class="popover-item-line">
                        <span>{{ $t("Current RPC Alias") }}:</span>
                        <code class="popover-code">${rpcprofile}</code>
                      </div>
                      <div class="popover-item-line">
                        <span>{{ $t("Downloading Count") }}:</span>
                        <code class="popover-code">${downloading}</code>
                      </div>
                      <div class="popover-item-line">
                        <span>{{ $t("Waiting Count") }}:</span>
                        <code class="popover-code">${waiting}</code>
                      </div>
                      <div class="popover-item-line">
                        <span>{{ $t("Stopped Count") }}:</span>
                        <code class="popover-code">${stopped}</code>
                      </div>
                      <div class="popover-item-line">
                        <span>{{ $t("Download Speed") }}:</span>
                        <code class="popover-code">${downspeed}</code>
                      </div>
                      <div class="popover-item-line mb-2">
                        <span>{{ $t("Upload Speed") }}:</span>
                        <code class="popover-code">${upspeed}</code>
                      </div>
                      <div class="popover-tips-text small text-muted mb-2">
                        {{ $t('Tips: You can use the "noprefix" tag to ignore the prefix, "nosuffix" tag to ignore the suffix, and "scale=n" tag to set the decimal precision.') }}
                      </div>
                      <div class="small font-weight-bold mb-1">{{ $t("Example") }}:</div>
                      <div class="popover-example-box font-monospace small">
                        ${downspeed:noprefix:nosuffix:scale=1}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-1">
                  <input
                    class="form-control"
                    type="text"
                    v-model="pageTitle"
                    @input="onPageTitleChange"
                  />
                </div>
                <div class="small text-muted">
                  <em>[{{ $t("Preview") }}] {{ titlePreview }}</em>
                </div>
              </div>
            </div>

            <!-- 刷新间隔 (Updating Task Information Interval) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Updating Task Information Interval") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="refreshInterval" @change="onIntervalChange">
                    <option :value="1000">1000 ms (1s)</option>
                    <option :value="2000">2000 ms (2s)</option>
                    <option :value="3000">3000 ms (3s)</option>
                    <option :value="5000">5000 ms (5s)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 默认任务列表页面 (Default Tasks Page) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Default Tasks Page") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="defaultTaskPage" @change="onDefaultTaskPageChange">
                    <option value="downloading">{{ $t("Downloading") }}</option>
                    <option value="waiting">{{ $t("Waiting") }}</option>
                    <option value="stopped">{{ $t("Finished / Stopped") }}</option>
                    <option value="all">{{ $t("All Tasks") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 创建新任务后执行操作 (Action After Creating New Tasks) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Action After Creating New Tasks") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="afterCreatingNewTask" @change="onAfterCreatingChange">
                    <option value="task-list">{{ $t("Navigate to Task List Page") }}</option>
                    <option value="task-detail">{{ $t("Navigate to Task Detail Page") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 重试任务后删除原任务 (Remove Old Tasks After Retrying) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Remove Old Tasks After Retrying") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="removeOldTaskAfterRetrying" @change="onRemoveOldTaskChange">
                    <option :value="true">{{ $t("Enabled") }}</option>
                    <option :value="false">{{ $t("Disabled") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 任务删除前确认 (Confirm Task Removal) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Confirm Task Removal") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="confirmTaskRemoval" @change="onConfirmTaskRemovalChange">
                    <option :value="true">{{ $t("Enabled") }}</option>
                    <option :value="false">{{ $t("Disabled") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 紧凑模式 (Compact Mode) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Compact Mode") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="store.compactMode" @change="onCompactModeChange">
                    <option :value="true">{{ $t("Enabled") }}</option>
                    <option :value="false">{{ $t("Disabled") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 重置设置提示与操作行 -->
            <div class="row tip no-background no-hover">
              <div class="col-sm-12 d-flex align-items-center">
                <span class="asterisk text-danger mr-1">*</span>
                <span class="text-muted mr-3">{{ $t("Changes to the settings take effect after refreshing page.") }}</span>
                <button class="btn btn-xs btn-default btn-outline-secondary" @click="resetAllSettings">
                  <span>{{ $t("Reset Settings") }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. RPC 服务端配置项 (RPC Server Settings) -->
        <div
          v-for="(server, sIdx) in rpcList"
          :key="sIdx"
          v-show="currentTab === `rpc_${sIdx}`"
          class="tab-pane active"
        >
          <div class="settings-table striped hoverable">
            <!-- 别名 -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Aria2 RPC Alias") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <input class="form-control" type="text" v-model="server.rpcAlias" @change="saveRpcSettings" />
                </div>
              </div>
            </div>

            <!-- 地址信息 -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Aria2 RPC Address") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <div class="input-group">
                    <select class="custom-select" style="max-width: 110px;" v-model="server.protocol" @change="saveRpcSettings">
                      <option value="http">http://</option>
                      <option value="https">https://</option>
                      <option value="ws">ws://</option>
                      <option value="wss">wss://</option>
                    </select>
                    <input class="form-control" type="text" placeholder="localhost" v-model="server.rpcHost" @change="saveRpcSettings" />
                    <div class="input-group-append">
                      <span class="input-group-text">:</span>
                    </div>
                    <input class="form-control" style="max-width: 90px;" type="text" placeholder="6800" v-model="server.rpcPort" @change="saveRpcSettings" />
                    <div class="input-group-append">
                      <span class="input-group-text">/</span>
                    </div>
                    <input class="form-control" style="max-width: 120px;" type="text" placeholder="jsonrpc" v-model="server.rpcInterface" @change="saveRpcSettings" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 密钥令牌 (Secret) -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Aria2 RPC Secret Token") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <div class="input-group">
                    <input
                      class="form-control"
                      :type="showSecret ? 'text' : 'password'"
                      placeholder="rpc-secret"
                      v-model="server.secret"
                      @change="saveRpcSettings"
                    />
                    <div class="input-group-append">
                      <button class="btn btn-outline-secondary" type="button" @click="showSecret = !showSecret">
                        <i :class="['fa', showSecret ? 'fa-eye-slash' : 'fa-eye']"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 激活按钮 -->
            <div class="row">
              <div class="col-sm-12 text-right py-2">
                <button
                  class="btn btn-success btn-sm"
                  :disabled="store.activeRpcIndex === sIdx"
                  @click="activateRpc(sIdx)"
                >
                  <i class="fa fa-check mr-1"></i>{{ store.activeRpcIndex === sIdx ? $t("Activated") || "Activated" : $t("Activate") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * ==============================================================================
 * WebUI 常规全局偏好与 RPC 服务端设置组件 (AriaNgSettings)
 * ==============================================================================
 * 支持语言切换（简中/英文）、主题切换（经典/深色）、开启动画效果、
 * 网页标题实时模板配置与动态预览、轮询心跳间隔调节、默认任务页面切换、
 * 重试后删除原任务、删除前确认、紧凑模式以及多 RPC 服务端的新增/删除/修改。
 * ==============================================================================
 */

import { ref, computed, onMounted, onUnmounted } from "vue";
import { store, rpcList, currentRpc, applyTheme, applyAnimationEffects, switchRpcServer } from "../store";
import { setLanguage, currentLang, t } from "../i18n";
import { formatPageTitle } from "../utils/title";

/** 当前选项卡 ('global' 或 'rpc_0', 'rpc_1' 等) */
const currentTab = ref("global");
/** 页面标题帮助 Popover 展开状态 */
const isHelpPopoverOpen = ref(false);
/** 是否明文显示 RPC 密钥输入框 */
const showSecret = ref(false);
/** 当前选中的界面语言 */
const selectedLanguage = ref(currentLang.value);
/** 当前选中的外观主题 */
const selectedTheme = ref(store.options.theme || "default");
/** 是否开启动画动效 */
const animationEffects = ref(store.options.animationEffects !== false);
/** 页面标题模板输入内容 */
const pageTitle = ref(store.options.title || "${downspeed}, ${upspeed} - ${title}");
/** 任务信息轮询刷新间隔 (毫秒) */
const refreshInterval = ref(store.options.downloadTaskRefreshInterval || 1000);
/** 默认进入的任务列表分类页面 */
const defaultTaskPage = ref(store.options.defaultTaskPage || "downloading");
/** 创建新任务后的跳转动作 */
const afterCreatingNewTask = ref(store.options.afterCreatingNewTask || "task-list");
/** 重试任务后是否删除原任务 */
const removeOldTaskAfterRetrying = ref(store.options.removeOldTaskAfterRetrying !== false);
/** 删除任务前是否弹出二次确认框 */
const confirmTaskRemoval = ref(store.options.confirmTaskRemoval !== false);

/** 计算属性：页面标题模板动态实时预览字符串 */
const titlePreview = computed(() => {
  return formatPageTitle(pageTitle.value, store.globalStat, currentRpc.value.rpcAlias);
});

/** 响应语言切换 */
function onLanguageChange() {
  setLanguage(selectedLanguage.value);
  store.options.language = selectedLanguage.value;
  saveSettings();
}

/** 响应主题切换 */
function onThemeChange() {
  applyTheme(selectedTheme.value);
}

/** 响应动画动效开关切换 */
function onAnimationEffectsChange() {
  applyAnimationEffects(animationEffects.value);
}

/** 响应页面标题模板修改 */
function onPageTitleChange() {
  store.options.title = pageTitle.value;
  saveSettings();
  if (typeof document !== "undefined") {
    document.title = titlePreview.value;
  }
}

/** 响应刷新心跳间隔变更 */
function onIntervalChange() {
  store.options.downloadTaskRefreshInterval = refreshInterval.value;
  saveSettings();
}

/** 响应默认任务分类页变更 */
function onDefaultTaskPageChange() {
  store.options.defaultTaskPage = defaultTaskPage.value;
  saveSettings();
}

/** 响应创建任务后跳转动作变更 */
function onAfterCreatingChange() {
  store.options.afterCreatingNewTask = afterCreatingNewTask.value;
  saveSettings();
}

/** 响应重试后删除原任务配置变更 */
function onRemoveOldTaskChange() {
  store.options.removeOldTaskAfterRetrying = removeOldTaskAfterRetrying.value;
  saveSettings();
}

/** 响应删除确认开关变更 */
function onConfirmTaskRemovalChange() {
  store.options.confirmTaskRemoval = confirmTaskRemoval.value;
  saveSettings();
}

/** 响应紧凑模式变更 */
function onCompactModeChange() {
  store.options.compactMode = store.compactMode;
  saveSettings();
}

/**
 * 重置所有选项为初始出厂设置
 */
function resetAllSettings() {
  if (window.confirm(t("Are you sure you want to reset all settings?"))) {
    try {
      localStorage.removeItem("AriaNg.Options");
    } catch (e) {}

    const defaultOpts = {
      language: "zh_CN",
      theme: "default",
      title: "${downspeed}, ${upspeed} - ${title}",
      animationEffects: true,
      compactMode: false,
      displayOrder: "default:asc",
      globalStatRefreshInterval: 1000,
      downloadTaskRefreshInterval: 1000,
      defaultTaskPage: "downloading",
      afterCreatingNewTask: "task-list",
      removeOldTaskAfterRetrying: true,
      confirmTaskRemoval: true,
      rpcAlias: "Aria2-Next",
      rpcHost: "localhost",
      rpcPort: "6800",
      rpcInterface: "jsonrpc",
      protocol: "http",
      secret: "",
      extendRpcServers: [],
    };
    store.options = defaultOpts;
    selectedLanguage.value = "zh_CN";
    selectedTheme.value = "default";
    animationEffects.value = true;
    pageTitle.value = "${downspeed}, ${upspeed} - ${title}";
    refreshInterval.value = 1000;
    defaultTaskPage.value = "downloading";
    afterCreatingNewTask.value = "task-list";
    removeOldTaskAfterRetrying.value = true;
    confirmTaskRemoval.value = true;
    store.compactMode = false;

    setLanguage("zh_CN");
    applyTheme("default");
    applyAnimationEffects(true);
    saveSettings();
    if (typeof document !== "undefined") {
      document.title = titlePreview.value;
    }
  }
}

/**
 * 持久化配置至本地存储
 */
function saveSettings() {
  try {
    localStorage.setItem("AriaNg.Options", JSON.stringify(store.options));
  } catch (e) {}
}

/**
 * 同步并持久化所有 RPC 引擎服务器配置
 */
function saveRpcSettings() {
  const primary = rpcList.value[0];
  store.options.rpcAlias = primary.rpcAlias;
  store.options.rpcHost = primary.rpcHost;
  store.options.rpcPort = primary.rpcPort;
  store.options.rpcInterface = primary.rpcInterface;
  store.options.protocol = primary.protocol;
  store.options.secret = primary.secret;

  store.options.extendRpcServers = rpcList.value.slice(1).map((s) => ({
    rpcAlias: s.rpcAlias,
    rpcHost: s.rpcHost,
    rpcPort: s.rpcPort,
    rpcInterface: s.rpcInterface,
    protocol: s.protocol,
    secret: s.secret,
  }));

  saveSettings();
}

/**
 * 新增一个扩展 RPC 引擎服务
 */
function addNewRpcServer() {
  const newServer = {
    rpcAlias: `RPC ${rpcList.value.length + 1}`,
    rpcHost: "localhost",
    rpcPort: "6800",
    rpcInterface: "jsonrpc",
    protocol: "http",
    secret: "",
  };
  if (!Array.isArray(store.options.extendRpcServers)) {
    store.options.extendRpcServers = [];
  }
  store.options.extendRpcServers.push(newServer);
  saveSettings();
  currentTab.value = `rpc_${rpcList.value.length - 1}`;
}

/**
 * 删除指定的扩展 RPC 引擎服务
 * @param {number} index
 */
function removeRpcServer(index) {
  if (index <= 0) return; // 不可删除主 RPC
  store.options.extendRpcServers.splice(index - 1, 1);
  saveSettings();
  if (store.activeRpcIndex === index) {
    switchRpcServer(0);
  }
  currentTab.value = "global";
}

/**
 * 激活指定索引的 RPC 服务器
 * @param {number} index
 */
function activateRpc(index) {
  switchRpcServer(index);
}

function closeHelpPopover() {
  isHelpPopoverOpen.value = false;
}

onMounted(() => {
  window.addEventListener("click", closeHelpPopover);
});

onUnmounted(() => {
  window.removeEventListener("click", closeHelpPopover);
});
</script>

<style scoped>
.page-title-help-wrapper {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  line-height: 1;
}

.page-title-popover {
  position: absolute;
  top: 50%;
  left: 22px;
  transform: translateY(-50%);
  width: 320px;
  max-width: 90vw;
  background-color: #ffffff;
  color: #333333;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  z-index: 1070;
  display: block;
  font-size: 12px;
  text-align: left;
  line-height: 1.5;
  user-select: text;
}

:root.dark-theme .page-title-popover,
:root.theme-dark .page-title-popover,
.theme-dark .page-title-popover {
  background-color: #24282d;
  color: #e2e8f0;
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
}

.page-title-popover .popover-arrow {
  position: absolute;
  left: -7px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-right: 7px solid #ffffff;
}

:root.dark-theme .page-title-popover .popover-arrow,
:root.theme-dark .page-title-popover .popover-arrow,
.theme-dark .page-title-popover .popover-arrow {
  border-right-color: #24282d;
}

.popover-item-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.popover-code {
  font-size: 11px;
  background-color: rgba(0, 0, 0, 0.06);
  color: #0366d6;
  padding: 1px 5px;
  border-radius: 3px;
}

:root.dark-theme .popover-code,
:root.theme-dark .popover-code,
.theme-dark .popover-code {
  background-color: rgba(255, 255, 255, 0.1);
  color: #79c0ff;
}

.popover-tips-text {
  line-height: 1.45;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  padding-top: 6px;
}

:root.dark-theme .popover-tips-text,
:root.theme-dark .popover-tips-text,
.theme-dark .popover-tips-text {
  border-top-color: rgba(255, 255, 255, 0.12);
}

.popover-example-box {
  background-color: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 4px 8px;
  border-radius: 4px;
  color: #28a745;
  user-select: all;
}

:root.dark-theme .popover-example-box,
:root.theme-dark .popover-example-box,
.theme-dark .popover-example-box {
  background-color: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #7ee787;
}
</style>
