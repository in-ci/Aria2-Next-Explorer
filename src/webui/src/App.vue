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

    <!-- 主体内容承载区 -->
    <div id="content-wrapper" class="content-wrapper">
      <div id="content-body" class="content-body">
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
import { ref, computed, onMounted } from "vue";
import { store, initStore } from "./store";
import { currentRoute } from "./router";
import Navbar from "./components/Navbar.vue";
import Sidebar from "./components/Sidebar.vue";
import FooterBar from "./components/FooterBar.vue";

import TaskList from "./views/TaskList.vue";
import TaskDetail from "./views/TaskDetail.vue";
import NewTaskModal from "./views/NewTaskModal.vue";
import Status from "./views/Status.vue";
import Aria2Settings from "./views/Aria2Settings.vue";
import AriaNgSettings from "./views/AriaNgSettings.vue";

const isSidebarCollapsed = ref(false);

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
  return {};
});

onMounted(() => {
  initStore();
});
</script>

<style>
/* 保证全屏撑开 */
html,
body,
#app,
.wrapper {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
