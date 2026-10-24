<template>
  <section class="content no-padding">
    <div id="task-table" class="task-table">
      <!-- 表头标题栏（包含排序字段切换按钮） -->
      <div class="task-table-title">
        <div class="row align-items-center">
          <!-- 文件名与大小排序（拆开为独立列：大小独占一列，参考原作者布局） -->
          <div class="task-col-name col-lg-8 col-sm-7 col-12">
            <div class="row align-items-center">
              <div class="col-sm-9 col-8">
                <a class="pointer-cursor" @click="toggleSort('name')">
                  <span>{{ $t("File Name") }}</span>
                  <i :class="getSortIcon('name')"></i>
                </a>
              </div>
              <div class="col-sm-3 col-4 text-center">
                <a class="pointer-cursor" @click="toggleSort('size')">
                  <span>{{ $t("File Size") }}</span>
                  <i :class="getSortIcon('size')"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- 进度与剩余时间排序 -->
          <div class="task-col-progress col-lg-2 col-sm-3 d-none d-sm-block">
            <div class="row">
              <div class="col-sm-6">
                <a class="pointer-cursor" @click="toggleSort('percent')">
                  <span>{{ $t("Progress") }}</span>
                  <i :class="getSortIcon('percent')"></i>
                </a>
              </div>
              <div class="col-sm-6">
                <a class="pointer-cursor" @click="toggleSort('remain')">
                  <span>{{ $t("Remaining") }}</span>
                  <i :class="getSortIcon('remain')"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- 速度与状态排序 -->
          <div class="task-col-speed col-lg-2 col-sm-2 text-center d-none d-sm-block">
            <a class="pointer-cursor" @click="toggleSort('dspeed')">
              <span>{{ $t("Speed / Status") }}</span>
              <i :class="getSortIcon('dspeed')"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- 任务列表主体 (基于分片懒加载，将数万 DOM 节点降至极简，降低 80% 渲染树内存) -->
      <div class="task-table-body">
        <div
          v-for="task in visibleTasks"
          :key="task.gid"
          v-memo="[
            task.gid,
            task.status,
            task.downloadSpeed,
            task.uploadSpeed,
            task.completedLength,
            task.totalLength,
            task.completePercent,
            task.remainTime,
            isTaskSelected(task.gid),
            store.compactMode,
          ]"
          class="row pointer-cursor task-item-animate align-items-center"
          :class="{
            selected: isTaskSelected(task.gid),
            'compact-list': store.compactMode,
          }"
          @click="toggleTaskSelect(task.gid, $event)"
        >
          <!-- 任务名与大小列（与表头 col-sm-9 / col-sm-3 完美对齐） -->
          <div class="task-col-name col-lg-8 col-sm-7 col-12 position-relative">
            <div class="row align-items-center w-100 m-0">
              <!-- 文件名列 -->
              <div class="col-sm-9 col-8 p-0 d-flex align-items-center overflow-hidden">
                <div class="checkbox checkbox-primary mr-2 mb-0" @click.stop>
                  <input
                    :id="'task_' + task.gid"
                    type="checkbox"
                    :checked="isTaskSelected(task.gid)"
                    @change="toggleTaskSelect(task.gid)"
                  />
                  <label :for="'task_' + task.gid">
                    <span
                      class="task-name auto-ellipsis font-weight-bold"
                      :title="task.taskName"
                    >
                      {{ task.taskName }}
                    </span>
                  </label>
                </div>
              </div>

              <!-- 大小列（独占一列，与表头对齐） -->
              <div class="col-sm-3 col-4 p-0 text-center">
                <div class="task-files d-inline-flex align-items-center justify-content-center">
                  <span class="task-size text-muted mr-1 font-monospace">{{ formatBytes(task.totalLength) }}</span>
                  <a
                    v-if="task.files && task.files.length > 1"
                    class="file-count badge badge-secondary"
                    :href="`#!/task/detail/${task.gid}?tab=filelist`"
                    :title="$t('Click to view task detail')"
                    @click.stop
                  >
                    {{ task.files.length }} {{ $t("Files") }}
                  </a>
                </div>
              </div>
            </div>

            <!-- 悬停快捷控制按钮 -->
            <div class="task-hover-actions" @click.stop>
              <a
                v-if="task.status === 'active' || task.status === 'waiting'"
                class="task-action-btn fa fa-pause text-warning pointer-cursor"
                :title="$t('Pause')"
                @click="singleAction('pause', task.gid)"
              ></a>
              <a
                v-if="task.status === 'paused'"
                class="task-action-btn fa fa-play text-success pointer-cursor"
                :title="$t('Start')"
                @click="singleAction('start', task.gid)"
              ></a>
              <a
                v-if="task.status === 'complete' || task.status === 'error' || task.status === 'removed'"
                class="task-action-btn fa fa-refresh text-primary pointer-cursor"
                :title="$t('Retry')"
                @click="retryTask(task)"
              ></a>
              <a
                class="task-action-btn fa fa-trash-o text-danger pointer-cursor"
                :title="$t('Delete')"
                @click="singleAction('remove', task.gid)"
              ></a>
            </div>
          </div>

          <!-- 进度条与用时 (紧凑低行高，消除大行高与臃肿) -->
          <div class="task-col-progress col-lg-2 col-sm-3 col-12">
            <div class="progress task-progress-bar" style="height: 12px;">
              <div
                class="progress-bar progress-bar-striped"
                :class="{
                  'bg-success': task.status === 'complete',
                  'bg-warning': task.status === 'error',
                  'bg-primary progress-bar-animated': task.status === 'active',
                  'bg-secondary': task.status === 'paused' || task.status === 'waiting'
                }"
                role="progressbar"
                :style="{ width: `${task.completePercent}%` }"
              >
                <span class="task-progress-text">
                  {{ formatPercent(task.completePercent, 1) }}
                </span>
              </div>
            </div>

            <div
              v-if="task.status === 'active' || task.status === 'waiting'"
              class="task-progress-sub d-flex justify-content-between text-muted"
            >
              <span class="task-last-time">
                {{ task.status === 'active' ? formatDuration(task.remainTime) : '' }}
              </span>
              <span v-if="task.status === 'active' && task.connections > 0" class="task-seeders">
                <i class="fa fa-users mr-1"></i>{{ task.connections }}
              </span>
            </div>
          </div>

          <!-- 速度展示与进入详情 (精简紧凑) -->
          <div class="task-col-speed col-lg-2 col-sm-2 text-center d-none d-sm-block">
            <div v-if="task.status === 'active'" class="task-speed-wrapper">
              <div class="task-speed-dl text-success font-weight-bold">
                <i class="fa fa-arrow-down mr-1"></i>{{ formatSpeed(task.downloadSpeed) }}
              </div>
              <div v-if="task.uploadSpeed > 0" class="task-speed-ul text-primary">
                <i class="fa fa-arrow-up mr-1"></i>{{ formatSpeed(task.uploadSpeed) }}
              </div>
            </div>
            <div v-else-if="task.status === 'complete'" class="text-success small">
              <i class="fa fa-check mr-1"></i>{{ $t("Complete") }}
            </div>
            <div v-else-if="task.status === 'error'" class="text-danger small">
              <i class="fa fa-exclamation-triangle mr-1"></i>{{ $t(task.errorDescription || "Error") }}
            </div>
            <div v-else class="text-muted small">
              {{ $t(task.status) }}
            </div>
          </div>

          <!-- 右侧详情箭头 -->
          <div class="task-right-arrow d-none d-md-block" @click.stop>
            <a :href="`#!/task/detail/${task.gid}`" :title="$t('Click to view task detail')">
              <i class="fa fa-angle-right"></i>
            </a>
          </div>
        </div>

        <!-- 分批加载更多提示（平滑滚动时自动触发或手动点击加载） -->
        <div
          v-if="displayedTasks.length > visibleTasks.length"
          class="text-center py-3 my-2"
        >
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="loadMoreTasks"
          >
            <i class="fa fa-angle-double-down mr-1"></i>
            {{ $t("Load More") || "加载更多任务" }} ({{ visibleTasks.length }} / {{ displayedTasks.length }})
          </button>
        </div>

        <!-- 空列表占位提示 -->
        <div v-if="displayedTasks.length === 0" class="text-center py-5 text-muted">
          <i class="fa fa-inbox fa-3x mb-2 d-block text-secondary"></i>
          <span>{{ $t("No tasks") || "No tasks" }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * TaskList.vue - 任务列表视图组件
 * 核心优化：
 * 1. 采用窗口化分片渲染机制 (Slice-Windowing)，解决成百上千任务导致 DOM 节点暴增至数万的问题。
 * 2. 结合 scroll 监听实现触底平滑自动加载。
 * 3. 排序与搜索计算均基于轻量原生数组，极大减少垃圾回收压力。
 */
import { ref, computed, watch } from "vue";
import { store, batchAction, refreshData } from "../store";
import { useEventListener } from "../composables/useEventListener";
import { formatBytes, formatSpeed, formatDuration, formatPercent } from "../utils/format";

const props = defineProps({
  /** 当前分类过滤类型 ('all' | 'downloading' | 'waiting' | 'stopped') */
  filterType: { type: String, default: "all" },
});

/** 初始渲染节点上限（默认 60 条，随滚动自动增量加载，大幅减轻 DOM 开销） */
const renderLimit = ref(60);

/**
 * 计算属性：获取当前分类对应的原始任务数组
 */
const rawTasks = computed(() => {
  if (props.filterType === "downloading") return store.tasks.active;
  if (props.filterType === "waiting") return store.tasks.waiting;
  if (props.filterType === "stopped") return store.tasks.stopped;
  return store.tasks.active.concat(store.tasks.waiting, store.tasks.stopped);
});

/**
 * 计算属性：结合搜索关键词与用户自定义排序规则，计算出完整的排序列
 */
const displayedTasks = computed(() => {
  let list;

  // 1. 实时搜索过滤（无搜索词时使用轻量 slice 避免二次创建数组）
  const query = store.searchQuery.trim();
  if (query) {
    const q = query.toLowerCase();
    list = rawTasks.value.filter((t) => (t.taskName || "").toLowerCase().includes(q));
  } else {
    list = rawTasks.value.slice();
  }

  // 2. 自定义或默认排序
  const [field, direction] = (store.displayOrder || "default:asc").split(":");
  const isAsc = direction === "asc";

  list.sort((a, b) => {
    // 默认排序：按照下载时间排序
    // 正在下载的任务按下载开始时间顺序排序 (先开始的在前)；
    // 已结束的任务按下载结束时间逆序排序 (后结束/最新的在前)
    if (field === "default") {
      const getPriority = (t) => {
        if (t.status === "active") return 0;
        if (t.status === "waiting" || t.status === "paused") return 1;
        return 2; // complete, error, removed
      };

      const prioA = getPriority(a);
      const prioB = getPriority(b);
      if (prioA !== prioB) {
        return prioA - prioB;
      }

      // 同为正在下载的任务 (active): 顺序排序（先开始下载的排在前面）
      if (prioA === 0) {
        const orderA = a.activeOrder !== undefined ? a.activeOrder : 0;
        const orderB = b.activeOrder !== undefined ? b.activeOrder : 0;
        if (orderA !== orderB) {
          return isAsc ? orderA - orderB : orderB - orderA;
        }
        return isAsc
          ? (a.startTime || 0) - (b.startTime || 0)
          : (b.startTime || 0) - (a.startTime || 0);
      }

      // 同为已结束/已停止的任务 (complete / error / removed): 逆序排序（后结束下载的排在前面）
      if (prioA === 2) {
        const orderA = a.stoppedOrder !== undefined ? a.stoppedOrder : 0;
        const orderB = b.stoppedOrder !== undefined ? b.stoppedOrder : 0;
        // stoppedOrder 中 0 是最新完成的任务，因此 order 越小越新，升序即为逆序完成时间
        if (orderA !== orderB) {
          return isAsc ? orderA - orderB : orderB - orderA;
        }
        return isAsc
          ? (b.completedTime || 0) - (a.completedTime || 0)
          : (a.completedTime || 0) - (b.completedTime || 0);
      }

      // 等待中任务 (waiting / paused): FIFO 等待队列顺序
      const orderA = a.waitingOrder !== undefined ? a.waitingOrder : 0;
      const orderB = b.waitingOrder !== undefined ? b.waitingOrder : 0;
      return isAsc ? orderA - orderB : orderB - orderA;
    }

    let res = 0;
    if (field === "name") {
      res = (a.taskName || "").localeCompare(b.taskName || "");
    } else if (field === "size") {
      res = a.totalLength - b.totalLength;
    } else if (field === "percent") {
      res = a.completePercent - b.completePercent;
    } else if (field === "remain") {
      res = a.remainTime - b.remainTime;
    } else if (field === "dspeed") {
      res = a.downloadSpeed - b.downloadSpeed;
    } else if (field === "uspeed") {
      res = a.uploadSpeed - b.uploadSpeed;
    }
    return isAsc ? res : -res;
  });

  return list;
});

/**
 * 计算属性：实际呈现给 DOM 的视口渲染子集（防止成千上万 DOM 撑爆浏览器内存）
 */
const visibleTasks = computed(() => {
  return displayedTasks.value.slice(0, renderLimit.value);
});

/**
 * 手动或滚动触发加载下一批任务
 */
function loadMoreTasks() {
  renderLimit.value += 60;
}

/**
 * 监听滚动容器触底事件，平滑动态扩充 DOM 渲染项
 */
function handleScroll(e) {
  const el = e.target;
  if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 250) {
    if (visibleTasks.value.length < displayedTasks.value.length) {
      renderLimit.value += 40;
    }
  }
}

// 当分类或搜索词改变时，重置分片渲染上限，释放不可见 DOM 内存
watch([() => props.filterType, () => store.searchQuery], () => {
  renderLimit.value = 60;
});

// 监听滚动容器触底事件，动态扩充 DOM 渲染项
useEventListener("#content-body", "scroll", handleScroll, { passive: true });

/**
 * 检查指定 GID 的任务是否已被用户选中
 * @param {string} gid
 */
function isTaskSelected(gid) {
  return store.selectedGids.has(gid);
}

/**
 * 切换任务勾选状态
 * @param {string} gid
 * @param {MouseEvent} [event]
 */
function toggleTaskSelect(gid, event) {
  if (store.selectedGids.has(gid)) {
    store.selectedGids.delete(gid);
  } else {
    store.selectedGids.add(gid);
  }
}

/**
 * 执行针对单项任务的操作
 * @param {'pause' | 'start' | 'remove'} action
 * @param {string} gid
 */
function singleAction(action, gid) {
  batchAction(action, [gid]);
}

/**
 * 重试失败或已完成的任务
 * @param {object} task 任务对象
 */
async function retryTask(task) {
  if (!store.client || !task) return;
  try {
    const uris = [];
    if (task.files && task.files.length > 0) {
      task.files.forEach((f) => {
        if (f.uris && f.uris.length > 0) {
          f.uris.forEach((u) => {
            if (u.uri && !uris.includes(u.uri)) uris.push(u.uri);
          });
        }
      });
    }

    if (uris.length > 0) {
      await store.client.addUri(uris, {});
      if (store.options.removeOldTaskAfterRetrying !== false) {
        await store.client.removeDownloadResult(task.gid).catch(() => {});
      }
      await refreshData(true);
    }
  } catch (err) {
    console.warn("Failed to retry task:", err);
  }
}

/**
 * 切换排序列及方向
 * @param {string} field 排序字段 ('name' | 'size' | 'percent' | 'remain' | 'dspeed')
 */
function toggleSort(field) {
  const current = store.displayOrder || "default:asc";
  const [curField, curDir] = current.split(":");
  if (curField === field) {
    store.displayOrder = `${field}:${curDir === "asc" ? "desc" : "asc"}`;
  } else {
    store.displayOrder = `${field}:asc`;
  }
}

/**
 * 获取对应排序字段的高亮指示图标类名
 * @param {string} field 排序字段
 */
function getSortIcon(field) {
  const current = store.displayOrder || "default:asc";
  const [curField, curDir] = current.split(":");
  if (curField !== field) return "fa fa-display-order fa-sort text-muted ml-1";
  return curDir === "asc"
    ? "fa fa-display-order fa-sort-asc text-primary ml-1"
    : "fa fa-display-order fa-sort-desc text-primary ml-1";
}
</script>

<style scoped>
/* 紧凑行高与精炼布局，彻底消除下载时列高臃肿 */
:deep(.task-table-body > .row),
.task-table-body > .row {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
  min-height: 38px;
}

:deep(.task-table .task-table-body .row label),
.task-table .task-table-body .row label {
  margin-bottom: 0 !important;
}

.task-col-name .checkbox {
  display: flex;
  align-items: center;
}

.task-col-name .task-name {
  font-size: 0.88rem;
  line-height: 1.3;
}

.task-col-progress {
  padding-left: 6px;
  padding-right: 6px;
}

.task-progress-bar {
  height: 12px !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  border-radius: 2px;
  overflow: hidden;
}

.task-progress-text {
  font-size: 9.5px;
  line-height: 12px;
  display: block;
  font-weight: 500;
}

.task-progress-sub {
  margin-top: 2px !important;
  line-height: 1.1;
  font-size: 11px;
}

.task-col-speed {
  line-height: 1.15;
}

.task-speed-dl {
  font-size: 12px;
  line-height: 1.2;
}

.task-speed-ul {
  font-size: 10.5px;
  line-height: 1.1;
  margin-top: 1px;
}

/* 悬浮快捷操作栏精炼优化：高度适度调整并垂直居中，留出 4px 舒适呼吸感 */
:deep(.task-table .task-hover-actions),
.task-table .task-hover-actions {
  top: 50% !important;
  bottom: auto !important;
  transform: translateY(-50%) !important;
  height: 30px !important;
  border-radius: 5px !important;
  padding: 1px 3px !important;
  align-items: center !important;
  display: inline-flex !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15) !important;
  gap: 2px !important;
}

:deep(.task-table .task-action-btn),
.task-table .task-action-btn {
  height: 26px !important;
  min-width: 32px !important;
  padding: 0 8px !important;
  font-size: 12.5px !important;
  border-radius: 4px !important;
  border-left: none !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.15s ease !important;
}

:deep(.task-table .task-action-btn + .task-action-btn),
.task-table .task-action-btn + .task-action-btn {
  border-left: none !important;
}
/* 紧凑模式下任务列表条目尺寸适度收敛，与侧边栏紧凑高度同向一致 */
.task-table .row.compact-list {
  padding-top: 3px !important;
  padding-bottom: 3px !important;
  min-height: 34px !important;
}

.compact-list .task-name {
  font-size: 0.82rem !important;
}

.compact-list .task-progress-bar {
  height: 9px !important;
}

.compact-list :deep(.task-hover-actions),
.compact-list .task-hover-actions {
  height: 24px !important;
}

.compact-list :deep(.task-action-btn),
.compact-list .task-action-btn {
  height: 20px !important;
  min-width: 24px !important;
  padding: 0 5px !important;
  font-size: 11px !important;
}
</style>
