<template>
  <section class="content no-padding">
    <div class="settings-table striped hoverable p-3">
      <!-- RPC 地址 -->
      <div class="row py-2 border-bottom">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Aria2 RPC Address") }}</div>
        <div class="setting-value col-sm-8 font-monospace">{{ currentRpcAddress }}</div>
      </div>

      <!-- 连接状态 -->
      <div class="row py-2 border-bottom">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Status") }}</div>
        <div class="setting-value col-sm-8">
          <span class="badge" :class="statusBadgeClass">{{ $t(store.rpcStatus) }}</span>
        </div>
      </div>

      <!-- 版本号 -->
      <div class="row py-2 border-bottom">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Version") }}</div>
        <div class="setting-value col-sm-8">
          <span v-if="store.serverInfo.version" class="font-weight-bold text-success">
            {{ store.serverInfo.version }}
          </span>
          <span v-else class="text-muted">-</span>
        </div>
      </div>

      <!-- 会话 ID -->
      <div class="row py-2 border-bottom">
        <div class="setting-key col-sm-4 font-weight-bold">Session ID</div>
        <div class="setting-value col-sm-8 font-monospace">
          {{ store.serverInfo.sessionId || '-' }}
        </div>
      </div>

      <!-- 支持的特性 -->
      <div class="row py-2 border-bottom">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Enabled Features") }}</div>
        <div class="setting-value col-sm-8 d-flex flex-wrap">
          <div
            v-for="feat in store.serverInfo.enabledFeatures"
            :key="feat"
            class="badge badge-light border mr-2 mb-2 p-2"
          >
            <i class="fa fa-check text-success mr-1"></i>{{ feat }}
          </div>
        </div>
      </div>

      <!-- 控制操作 -->
      <div class="row py-3">
        <div class="setting-key col-sm-4 font-weight-bold">{{ $t("Operations") }}</div>
        <div class="setting-value col-sm-8">
          <button
            class="btn btn-primary btn-sm mr-2"
            :disabled="store.rpcStatus === 'Connected'"
            @click="handleReconnect"
          >
            <i class="fa fa-refresh mr-1"></i>{{ $t("Reconnect") }}
          </button>
          <button
            class="btn btn-secondary btn-sm mr-2"
            :disabled="store.rpcStatus !== 'Connected'"
            @click="handleSaveSession"
          >
            <i class="fa fa-save mr-1"></i>{{ $t("Save Session") }}
          </button>
          <button
            class="btn btn-danger btn-sm"
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
 * 展示当前 Aria2 服务端的版本号、会话 Session ID、支持的特性列表，
 * 并提供重连、保存当前下载会话以及关闭服务端进程等运维操作。
 * ==============================================================================
 */

import { computed } from "vue";
import { store, currentRpc } from "../store";

/** 计算属性：当前完整的 RPC 连接地址字符串 */
const currentRpcAddress = computed(() => {
  const r = currentRpc.value;
  return `${r.protocol}://${r.rpcHost}:${r.rpcPort}/${r.rpcInterface}`;
});

/** 计算属性：连接状态徽标样式类 */
const statusBadgeClass = computed(() => {
  if (store.rpcStatus === "Connected") return "badge-success";
  if (store.rpcStatus === "Connecting") return "badge-primary";
  return "badge-danger";
});

/**
 * 手动重连当前 RPC 服务端
 */
function handleReconnect() {
  if (store.client) {
    store.client.connect();
  }
}

/**
 * 保存当前 Aria2 会话至磁盘
 */
async function handleSaveSession() {
  if (!store.client) return;
  try {
    await store.client.saveSession();
    alert("Session saved successfully!");
  } catch (e) {
    alert(`Failed: ${e.message}`);
  }
}

/**
 * 安全关闭远程 Aria2 下载器进程
 */
async function handleShutdown() {
  if (!store.client) return;
  if (confirm("Are you sure you want to shutdown Aria2?")) {
    try {
      await store.client.shutdown();
    } catch (e) {
      alert(`Shutdown requested.`);
    }
  }
}
</script>
