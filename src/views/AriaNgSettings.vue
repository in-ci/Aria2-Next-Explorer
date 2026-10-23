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
            <!-- 语言设置 (仅保留简体中文和英文) -->
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

            <!-- 主题设置 -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Theme") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="selectedTheme" @change="onThemeChange">
                    <option value="system">{{ $t("Follow system settings") }}</option>
                    <option value="dark">{{ $t("Dark") }}</option>
                    <option value="default">{{ $t("Classic") }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 刷新间隔 -->
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

            <!-- 紧凑模式 -->
            <div class="row">
              <div class="setting-key setting-key-without-desc col-sm-4">
                <span>{{ $t("Compact Mode") }}</span>
              </div>
              <div class="setting-value col-sm-8">
                <div class="form-group mb-0">
                  <select class="form-control" v-model="store.compactMode" @change="saveSettings">
                    <option :value="true">{{ $t("Enabled") }}</option>
                    <option :value="false">{{ $t("Disabled") }}</option>
                  </select>
                </div>
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
import { ref } from "vue";
import { store, rpcList, applyTheme, switchRpcServer } from "../store";
import { setLanguage, currentLang } from "../i18n";

const currentTab = ref("global");
const showSecret = ref(false);
const selectedLanguage = ref(currentLang.value);
const selectedTheme = ref(store.theme);
const refreshInterval = ref(store.options.downloadTaskRefreshInterval || 1000);

function onLanguageChange() {
  setLanguage(selectedLanguage.value);
  store.options.language = selectedLanguage.value;
  saveSettings();
}

function onThemeChange() {
  applyTheme(selectedTheme.value);
}

function onIntervalChange() {
  store.options.downloadTaskRefreshInterval = refreshInterval.value;
  saveSettings();
}

function saveSettings() {
  try {
    localStorage.setItem("AriaNg.Options", JSON.stringify(store.options));
  } catch (e) {}
}

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

function removeRpcServer(index) {
  if (index <= 0) return; // 不可删除主 RPC
  store.options.extendRpcServers.splice(index - 1, 1);
  saveSettings();
  if (store.activeRpcIndex === index) {
    switchRpcServer(0);
  }
  currentTab.value = "global";
}

function activateRpc(index) {
  switchRpcServer(index);
}
</script>
