<template>
  <aside class="main-sidebar sidebar-dark-primary sidebar-no-expand elevation-1">
    <!-- 头部品牌与 RPC 服务端切换 -->
    <div class="brand-link">
      <img :src="'favicon.png'" alt="Aria2" class="brand-image" />
      <div class="logo-lg" :title="$t('Switch Download Engine')">
        <div class="dropdown">
          <span
            class="rpc-selector pointer-cursor d-flex align-items-center justify-content-between"
            @click="isRpcDropdownOpen = !isRpcDropdownOpen"
          >
            <span class="brand-text text-truncate">{{ currentRpc.rpcAlias || currentRpc.rpcHost }}</span>
            <i class="fa fa-angle-down rpc-caret ml-1"></i>
          </span>

          <ul
            class="dropdown-menu rpcselect-dropdown"
            :class="{ show: isRpcDropdownOpen }"
            style="display: block;"
            v-if="isRpcDropdownOpen"
            @click="isRpcDropdownOpen = false"
          >
            <li
              v-for="(server, idx) in rpcList"
              :key="idx"
              :class="{ active: server.isDefault }"
            >
              <a
                class="dropdown-item pointer-cursor d-flex justify-content-between align-items-center"
                @click="switchRpcServer(idx)"
              >
                <span>
                  <i class="fa fa-server mr-2"></i>
                  {{ server.rpcAlias || `${server.rpcHost}:${server.rpcPort}` }}
                </span>
                <i v-if="server.isDefault" class="fa fa-check text-success"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 侧边导航项 -->
    <section class="sidebar">
      <ul id="sidebar-menu" class="nav nav-sidebar flex-column">
        <!-- 任务分类 -->
        <li class="nav-header bg-gray-dark-blur">{{ $t("Download") }}</li>

        <!-- 下载中 -->
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: currentRoute.path === '/downloading' }"
            href="#!/downloading"
          >
            <i class="nav-icon fa fa-arrow-circle-o-down"></i>
            <p>
              {{ $t("Downloading") }}
              <span v-if="store.globalStat.numActive > 0" class="badge badge-info right">
                {{ store.globalStat.numActive }}
              </span>
            </p>
          </a>
        </li>

        <!-- 等待中 -->
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: currentRoute.path === '/waiting' }"
            href="#!/waiting"
          >
            <i class="nav-icon fa fa-clock-o"></i>
            <p>
              {{ $t("Waiting") }}
              <span v-if="store.globalStat.numWaiting > 0" class="badge badge-warning right">
                {{ store.globalStat.numWaiting }}
              </span>
            </p>
          </a>
        </li>

        <!-- 已完成 / 已停止 -->
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: currentRoute.path === '/stopped' }"
            href="#!/stopped"
          >
            <i class="nav-icon fa fa-check-circle-o"></i>
            <p>
              {{ $t("Finished / Stopped") }}
              <span v-if="store.globalStat.numStopped > 0" class="badge badge-secondary right">
                {{ store.globalStat.numStopped }}
              </span>
            </p>
          </a>
        </li>

        <!-- 全部任务 -->
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: currentRoute.path === '/all' }"
            href="#!/all"
          >
            <i class="nav-icon fa fa-dot-circle-o"></i>
            <p>
              {{ $t("All Tasks") }}
              <span v-if="store.globalStat.numTotal > 0" class="badge badge-primary right">
                {{ store.globalStat.numTotal }}
              </span>
            </p>
          </a>
        </li>

        <!-- 系统设置 -->
        <li class="nav-header bg-gray-dark-blur">{{ $t("Settings") }}</li>

        <!-- AriaNg 设置 -->
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: currentRoute.path === '/settings/ariang' }"
            href="#!/settings/ariang"
          >
            <i class="nav-icon fa fa-cog"></i>
            <p>{{ $t("General Settings") }}</p>
          </a>
        </li>

        <!-- Aria2 设置树形菜单 -->
        <li class="nav-item has-treeview" :class="{ 'menu-open': isAria2MenuOpen }">
          <a
            class="nav-link pointer-cursor d-flex justify-content-between align-items-center"
            @click="isAria2MenuOpen = !isAria2MenuOpen"
          >
            <p class="mb-0">
              <i class="nav-icon fa fa-cogs"></i>
              {{ $t("Download Settings") }}
            </p>
            <i class="fa right" :class="isAria2MenuOpen ? 'fa-angle-down' : 'fa-angle-left'"></i>
          </a>
          <ul class="nav nav-treeview pl-3" v-show="isAria2MenuOpen">
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentRoute.path === '/settings/aria2/basic' }"
                href="#!/settings/aria2/basic"
              >
                <i class="fa fa-angle-right nav-icon"></i>
                <p>{{ $t("Basic Settings") }}</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentRoute.path === '/settings/aria2/http' }"
                href="#!/settings/aria2/http"
              >
                <i class="fa fa-angle-right nav-icon"></i>
                <p>{{ $t("HTTP Settings") }}</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentRoute.path === '/settings/aria2/sftp' }"
                href="#!/settings/aria2/sftp"
              >
                <i class="fa fa-angle-right nav-icon"></i>
                <p>{{ $t("SFTP Settings") }}</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentRoute.path === '/settings/aria2/bt' }"
                href="#!/settings/aria2/bt"
              >
                <i class="fa fa-angle-right nav-icon"></i>
                <p>{{ $t("BitTorrent Settings") }}</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentRoute.path === '/settings/aria2/ed2k' }"
                href="#!/settings/aria2/ed2k"
              >
                <i class="fa fa-angle-right nav-icon"></i>
                <p>{{ $t("ED2K Settings") || "ED2K 设置" }}</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentRoute.path === '/settings/aria2/media' }"
                href="#!/settings/aria2/media"
              >
                <i class="fa fa-angle-right nav-icon"></i>
                <p>{{ $t("Media Stream Settings") || "媒体流设置" }}</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentRoute.path === '/settings/aria2/metalink' }"
                href="#!/settings/aria2/metalink"
              >
                <i class="fa fa-angle-right nav-icon"></i>
                <p>{{ $t("Metalink Settings") || "Metalink 设置" }}</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentRoute.path === '/settings/aria2/rpc' }"
                href="#!/settings/aria2/rpc"
              >
                <i class="fa fa-angle-right nav-icon"></i>
                <p>{{ $t("RPC Settings") }}</p>
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ active: currentRoute.path === '/settings/aria2/advanced' }"
                href="#!/settings/aria2/advanced"
              >
                <i class="fa fa-angle-right nav-icon"></i>
                <p>{{ $t("Advanced Settings") }}</p>
              </a>
            </li>
          </ul>
        </li>

        <!-- Aria2 状态信息 -->
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: currentRoute.path === '/status' }"
            href="#!/status"
          >
            <i class="nav-icon fa fa-server"></i>
            <p>
              {{ $t("Downloader Information") }}
              <span
                class="badge status-badge right"
                :class="{
                  'badge-success': store.rpcStatus === 'Connected',
                  'badge-primary': store.rpcStatus === 'Connecting',
                  'badge-danger': store.rpcStatus === 'Disconnected'
                }"
              >
                {{ $t(store.rpcStatus) }}
              </span>
            </p>
          </a>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup>
import { ref } from "vue";
import { store, currentRpc, rpcList, switchRpcServer } from "../store";
import { currentRoute } from "../router";

const isRpcDropdownOpen = ref(false);
const isAria2MenuOpen = ref(true);
</script>
