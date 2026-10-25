<template>
  <div
    class="wrapper"
    :class="{
      'compact-mode': store.compactMode,
      'sidebar-collapse': isSidebarCollapsed,
    }"
  >
    <!-- 顶部导航栏 -->
    <Navbar />

    <!-- 侧边菜单栏 -->
    <Sidebar />

    <!-- 主体内容承载区 (与原版 AriaNg 结构完全对齐) -->
    <div id="content-wrapper" class="content-wrapper">
      <div id="content-body" class="content-body" ref="contentBodyRef">
        <component
          :is="currentViewComponent"
          v-bind="currentViewProps"
        />
      </div>
    </div>

    <!-- 底部状态与速度栏 -->
    <FooterBar @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />
  </div>
</template>

<script setup>
/**
 * App.vue - 根布局组件
 * 处理视口高度自适应计算、紧凑模式切换与页面滚动流控制
 */
import { ref, computed, defineAsyncComponent, onMounted, onUnmounted, watch, watchEffect } from "vue";
import { store, initStore, stopStore, saveOptions, refreshData } from "./store";
import { currentRoute } from "./router";
import { useEventListener } from "./composables/useEventListener";
import Navbar from "./components/Navbar.vue";
import Sidebar from "./components/Sidebar.vue";
import FooterBar from "./components/FooterBar.vue";

// 关键优化：首屏保留核心 TaskList 同步加载保证秒开，次级视图按需异步懒加载 (Code-Splitting)
import TaskList from "./views/TaskList.vue";
const TaskDetail = defineAsyncComponent(() => import("./views/TaskDetail.vue"));
const NewTaskModal = defineAsyncComponent(() => import("./views/NewTaskModal.vue"));
const Status = defineAsyncComponent(() => import("./views/Status.vue"));
const Aria2Settings = defineAsyncComponent(() => import("./views/Aria2Settings.vue"));
const AriaNgSettings = defineAsyncComponent(() => import("./views/AriaNgSettings.vue"));

const isSidebarCollapsed = ref(false);
const contentBodyRef = ref(null);

// 在组件挂载前立即完成 Store 与 RPC 客户端初始化，确保子视图挂载时通信实例已就绪
initStore();

const currentViewComponent = computed(() => {
  const name = currentRoute.value.name;
  if (name === "task-list") return TaskList;
  if (name === "new-task") return NewTaskModal;
  if (name === "task-detail") return TaskDetail;
  if (name === "status") return Status;
  if (name === "settings-aria2") return Aria2Settings;
  if (name === "settings-ariang") return AriaNgSettings;
  return TaskList;
});

const currentViewProps = computed(() => {
  const r = currentRoute.value;
  if (r.name === "task-list") return { filterType: r.filter };
  if (r.name === "task-detail") return { gid: r.params.gid };
  if (r.name === "settings-aria2") return { category: r.params.category };
  if (r.name === "new-task") return { query: r.query };
  return {};
});

/**
 * 视口高度自适应计算（与原版 AriaNg 机制完全一致）
 * content-body 获得精确高度后，内部溢出选项与任务列表方可正常触发滚轮平滑滚动
 */
function updateContentHeight() {
  const windowHeight = window.innerHeight;
  const header = document.querySelector(".main-header");
  const footer = document.querySelector(".main-footer");
  const hHeight = header ? header.offsetHeight : 41;
  const fHeight = footer ? footer.offsetHeight : 41;
  const exactHeight = `${windowHeight - hHeight - fHeight}px`;
  const contentWrapper = document.getElementById("content-wrapper");
  if (contentWrapper) {
    contentWrapper.style.height = exactHeight;
  }
  if (contentBodyRef.value) {
    contentBodyRef.value.style.height = exactHeight;
  }
}

useEventListener(window, "resize", updateContentHeight);

onMounted(() => {
  updateContentHeight();

  // 挂载后移除 hold-transition，恢复 AdminLTE 平滑的 CSS 动效
  setTimeout(() => {
    document.body.classList.remove("hold-transition");
  }, 50);

  // 同步紧凑模式至 <html> 根节点，保证字体及排版尺寸完全还原
  watchEffect(() => {
    document.documentElement.classList.toggle("compact-mode", Boolean(store.compactMode));
  });

  // 紧凑模式双向响应式持久化监听：无论是从顶部导航栏开关切换还是从设置页面调整，均自动持久化保存
  watch(
    () => store.compactMode,
    (val) => {
      const isCompact = Boolean(val);
      if (store.options.compactMode !== isCompact) {
        store.options.compactMode = isCompact;
        saveOptions(store.options);
      }
    }
  );

  // 排序规则双向响应式持久化监听：无论是从顶部导航栏下拉菜单切换还是点击表头排序，均自动持久化保存
  watch(
    () => store.displayOrder,
    (val) => {
      if (val && store.options.displayOrder !== val) {
        store.options.displayOrder = val;
        saveOptions(store.options);
      }
    }
  );

  // 路由页面切换时，主动触发即时刷新，保证新页面数据与排序规则立即同步呈现
  watch(
    () => currentRoute.value.path,
    () => {
      refreshData(true);
    }
  );

  // 同步侧边栏折叠状态至 <body> 根节点，使 AdminLTE 的侧边栏动画与 content-wrapper 完美向左联动收起
  watchEffect(() => {
    document.body.classList.toggle("sidebar-collapse", Boolean(isSidebarCollapsed.value));
  });
});

onUnmounted(() => {
  stopStore();
});
</script>

<style>
/* 保证全屏撑开且不出现外层双滚动条 */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-size: 14px;
}

.wrapper {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.content-wrapper {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-top: 0 !important;
  height: calc(100vh - 82px);
  overflow: hidden;
}

.content-wrapper > .content-body {
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch;
}
</style>
