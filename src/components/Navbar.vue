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
          <li class="nav-item" :class="{ disabled: !isTaskListPage || !hasSelectedTasks }">
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Start')"
              @click="handleAction('start')"
            >
              <i class="nav-icon fa fa-play"></i>
            </a>
          </li>

          <!-- 暂停任务 -->
          <li class="nav-item" :class="{ disabled: !isTaskListPage || !hasSelectedTasks }">
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Pause')"
              @click="handleAction('pause')"
            >
              <i class="nav-icon fa fa-pause"></i>
            </a>
          </li>

          <!-- 删除任务 -->
          <li class="nav-item" :class="{ disabled: !isTaskListPage || !hasSelectedTasks }">
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

          <!-- 全选 (非任务列表页面不可操作) -->
          <li class="nav-item" :class="{ disabled: !isTaskListPage || currentTabTasks.length === 0 }">
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Select All')"
              @click="handleSelectAll"
            >
              <i class="nav-icon fa fa-th-large"></i>
            </a>
          </li>

          <!-- 排序方式下拉菜单 (非任务列表页面不可操作) -->
          <li
            ref="orderDropdownRef"
            class="nav-item dropdown"
            :class="{ disabled: !isTaskListPage }"
          >
            <a
              class="nav-link toolbar pointer-cursor"
              :title="$t('Display Order')"
              @click="toggleOrderDropdown"
            >
              <i class="nav-icon fa fa-sort-amount-asc"></i>
              <i class="nav-icon fa fa-caret-down ml-1"></i>
            </a>
            <ul
              v-if="isOrderDropdownOpen && isTaskListPage"
              class="dropdown-menu show"
              role="menu"
              style="display: block;"
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
/**
 * ==============================================================================
 * 顶部导航与批量快捷操作栏组件 (Navbar)
 * ==============================================================================
 * 包含新建任务快捷入口、批量启动/暂停/删除、清理已停止任务、全选、
 * 排序规则切换、紧凑模式开关及实时模糊搜索过滤框。
 * ==============================================================================
 */

import { ref, computed, watch } from "vue";
import { store, batchAction, clearAllStoppedTasks } from "../store";
import { currentRoute } from "../router";
import { useEventListener } from "../composables/useEventListener";

/** 排序规则下拉菜单容器 DOM 引用 */
const orderDropdownRef = ref(null);

/** 排序规则下拉菜单展开状态 */
const isOrderDropdownOpen = ref(false);

/** 计算属性：当前是否处于任务列表相关页面 (downloading, waiting, stopped, all) */
const isTaskListPage = computed(() => {
  return currentRoute.value.name === "task-list";
});

/** 计算属性：当前激活分类下的任务集合 */
const currentTabTasks = computed(() => {
  if (!isTaskListPage.value) return [];
  const filter = currentRoute.value.filter;
  if (filter === "downloading") return store.tasks.active;
  if (filter === "waiting") return store.tasks.waiting;
  if (filter === "stopped") return store.tasks.stopped;
  return store.tasks.active.concat(store.tasks.waiting, store.tasks.stopped);
});

/** 计算属性：当前是否存在被用户勾选的任务 */
const hasSelectedTasks = computed(() => {
  return isTaskListPage.value && store.selectedGids.size > 0;
});

/** 预定义排序选项列表 */
const sortOrders = [
  { key: "default:asc", name: "Default", icon: "fa-list-ul" },
  { key: "name:asc", name: "By File Name", icon: "fa-sort-alpha-asc" },
  { key: "size:asc", name: "By File Size", icon: "fa-briefcase" },
  { key: "percent:desc", name: "By Progress", icon: "fa-hourglass-2" },
  { key: "remain:asc", name: "By Remaining", icon: "fa-history" },
  { key: "dspeed:desc", name: "By Download Speed", icon: "fa-arrow-circle-down" },
  { key: "uspeed:desc", name: "By Upload Speed", icon: "fa-arrow-circle-up" },
];

/**
 * 切换排序规则下拉菜单的展开与收起
 */
function toggleOrderDropdown() {
  if (!isTaskListPage.value) return;
  isOrderDropdownOpen.value = !isOrderDropdownOpen.value;
}

/**
 * 监听全局点击事件：点击下拉菜单以外区域时自动收起下拉列表
 * @param {MouseEvent} event
 */
function handleDocumentClick(event) {
  if (!isOrderDropdownOpen.value) return;
  if (orderDropdownRef.value && !orderDropdownRef.value.contains(event.target)) {
    isOrderDropdownOpen.value = false;
  }
}

/**
 * 监听键盘 Escape 快捷键关闭下拉菜单
 * @param {KeyboardEvent} event
 */
function handleKeyDown(event) {
  if (event.key === "Escape" && isOrderDropdownOpen.value) {
    isOrderDropdownOpen.value = false;
  }
}

// 页面路由发生变更时，自动收起展开的下拉菜单
watch(
  () => currentRoute.value.path,
  () => {
    isOrderDropdownOpen.value = false;
  }
);

// 全局事件统一托管并自动清理
useEventListener(document, "click", handleDocumentClick);
useEventListener(document, "keydown", handleKeyDown);

/**
 * 触发针对已勾选任务的批量动作
 * @param {'start' | 'pause' | 'remove'} action
 */
function handleAction(action) {
  if (hasSelectedTasks.value) {
    batchAction(action);
  }
}

/**
 * 清除所有已完成/已停止任务
 */
function handleClearStopped() {
  clearAllStoppedTasks();
}

/**
 * 切换当前列表全选与取消全选
 */
function handleSelectAll() {
  if (!isTaskListPage.value) return;
  const tasks = currentTabTasks.value;
  if (tasks.length === 0) return;

  const allSelected = tasks.every((t) => store.selectedGids.has(t.gid));
  if (allSelected) {
    tasks.forEach((t) => store.selectedGids.delete(t.gid));
  } else {
    tasks.forEach((t) => store.selectedGids.add(t.gid));
  }
}
</script>
