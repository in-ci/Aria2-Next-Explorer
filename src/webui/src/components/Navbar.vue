<template>
  <div class="main-header">
    <nav class="navbar" role="navigation">
      <div class="navbar-toolbar navbar-expand">
        <ul class="nav navbar-nav">
          <!-- 新建任务 -->
          <li class="nav-item">
            <a class="nav-link toolbar" :title="$t('New')" href="#!/new">
              <i class="nav-icon fa fa-plus"></i>
              <span>{{ $t("New") }}</span>
            </a>
          </li>

          <li class="nav-item divider"></li>

          <!-- 开始任务 -->
          <li class="nav-item" :class="{ disabled: !hasSelectedTasks }">
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Start')"
              @click="handleAction('start')"
            >
              <i class="nav-icon fa fa-play"></i>
            </a>
          </li>

          <!-- 暂停任务 -->
          <li class="nav-item" :class="{ disabled: !hasSelectedTasks }">
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Pause')"
              @click="handleAction('pause')"
            >
              <i class="nav-icon fa fa-pause"></i>
            </a>
          </li>

          <!-- 删除任务 -->
          <li class="nav-item" :class="{ disabled: !hasSelectedTasks }">
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Delete')"
              @click="handleAction('remove')"
            >
              <i class="nav-icon fa fa-trash-o"></i>
            </a>
          </li>

          <!-- 清理已停止任务 -->
          <li class="nav-item" :class="{ disabled: store.globalStat.numStopped === 0 }">
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Clear Stopped Tasks')"
              @click="handleClearStopped"
            >
              <i class="nav-icon fa fa-recycle"></i>
            </a>
          </li>

          <li class="nav-item divider"></li>

          <!-- 全选 -->
          <li class="nav-item">
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Select All')"
              @click="handleSelectAll"
            >
              <i class="nav-icon fa fa-th-large"></i>
            </a>
          </li>

          <!-- 排序方式下拉菜单 -->
          <li class="nav-item dropdown">
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Display Order')"
              @click="isOrderDropdownOpen = !isOrderDropdownOpen"
            >
              <i class="nav-icon fa fa-sort-amount-asc"></i>
              <i class="nav-icon fa fa-caret-down ml-1"></i>
            </a>
            <ul
              class="dropdown-menu"
              :class="{ show: isOrderDropdownOpen }"
              role="menu"
              style="display: block;"
              v-if="isOrderDropdownOpen"
              @click="isOrderDropdownOpen = false"
            >
              <li
                v-for="order in sortOrders"
                :key="order.key"
              >
                <a
                  class="dropdown-item pointer-cursor d-flex justify-content-between align-items-center"
                  @click="store.displayOrder = order.key"
                >
                  <div>
                    <i :class="['fa fa-fw mr-2', order.icon]"></i>
                    <span>{{ $t(order.name) }}</span>
                  </div>
                  <i v-if="store.displayOrder === order.key" class="fa fa-check text-primary"></i>
                </a>
              </li>
            </ul>
          </li>

          <!-- 紧凑模式开关 -->
          <li class="nav-item nav-link">
            <div class="custom-switch">
              <input
                type="checkbox"
                class="custom-control-input"
                id="compact-mode"
                v-model="store.compactMode"
              />
              <label
                class="custom-control-label form-check-label pointer-cursor"
                for="compact-mode"
                :title="$t('Compact Mode')"
              >
                <span class="d-none d-xl-inline">{{ $t("Compact Mode") }}</span>
              </label>
            </div>
          </li>
        </ul>
      </div>

      <!-- 搜索栏 -->
      <div class="navbar-searchbar d-none d-md-block">
        <ul class="nav navbar-nav">
          <li class="nav-item" style="position: relative;">
            <input
              class="form-control"
              type="text"
              size="20"
              :placeholder="$t('Search')"
              v-model="store.searchQuery"
            />
            <div v-if="!store.searchQuery" class="form-control-icon">
              <span class="fa fa-search form-control-feedback"></span>
            </div>
            <div v-else class="form-control-icon pointer-cursor" @click="store.searchQuery = ''">
              <span class="fa fa-times form-control-feedback"></span>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { store, batchAction, clearAllStoppedTasks } from "../store";

const isOrderDropdownOpen = ref(false);

const hasSelectedTasks = computed(() => {
  return store.selectedGids.size > 0;
});

const sortOrders = [
  { key: "default:asc", name: "Default", icon: "fa-list-ul" },
  { key: "name:asc", name: "By File Name", icon: "fa-sort-alpha-asc" },
  { key: "size:asc", name: "By File Size", icon: "fa-briefcase" },
  { key: "percent:desc", name: "By Progress", icon: "fa-hourglass-2" },
  { key: "remain:asc", name: "By Remaining", icon: "fa-history" },
  { key: "dspeed:desc", name: "By Download Speed", icon: "fa-arrow-circle-down" },
  { key: "uspeed:desc", name: "By Upload Speed", icon: "fa-arrow-circle-up" },
];

function handleAction(action) {
  if (hasSelectedTasks.value) {
    batchAction(action);
  }
}

function handleClearStopped() {
  clearAllStoppedTasks();
}

function handleSelectAll() {
  const currentTasks = [
    ...store.tasks.active,
    ...store.tasks.waiting,
    ...store.tasks.stopped,
  ];

  if (store.selectedGids.size === currentTasks.length && currentTasks.length > 0) {
    store.selectedGids.clear();
  } else {
    currentTasks.forEach((t) => store.selectedGids.add(t.gid));
  }
}
</script>
