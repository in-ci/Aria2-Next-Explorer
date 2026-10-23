<template>
  <section class="content no-padding">
    <div id="task-table" class="task-table">
      <!-- 表头标题栏 -->
      <div class="task-table-title">
        <div class="row align-items-center">
          <!-- 文件名与大小 -->
          <div class="task-col-name col-lg-8 col-sm-7 col-12">
            <div class="title-group d-flex align-items-center">
              <a class="pointer-cursor mr-2" @click="toggleSort('name')">
                <span>{{ $t("File Name") }}</span>
                <i :class="getSortIcon('name')"></i>
              </a>
              <span class="separator text-muted mr-2">/</span>
              <a class="pointer-cursor" @click="toggleSort('size')">
                <span>{{ $t("File Size") }}</span>
                <i :class="getSortIcon('size')"></i>
              </a>
            </div>
          </div>

          <!-- 进度与剩余时间 -->
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

          <!-- 速度与状态 -->
          <div class="task-col-speed col-lg-2 col-sm-2 text-center d-none d-sm-block">
            <a class="pointer-cursor" @click="toggleSort('dspeed')">
              <span>{{ $t("Speed / Status") }}</span>
              <i :class="getSortIcon('dspeed')"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- 任务列表主体 -->
      <div class="task-table-body">
        <div
          v-for="task in displayedTasks"
          :key="task.gid"
          class="row pointer-cursor task-item-animate align-items-center"
          :class="{
            selected: isTaskSelected(task.gid),
            'compact-list': store.compactMode,
          }"
          @click="toggleTaskSelect(task.gid, $event)"
        >
          <!-- 任务名与控制动作 -->
          <div class="task-col-name col-lg-8 col-sm-7 col-12">
            <div class="checkbox checkbox-primary mr-2" @click.stop>
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

            <!-- 文件大小与文件数 -->
            <div class="task-files">
              <span class="task-size text-muted mr-2">{{ formatBytes(task.totalLength) }}</span>
              <a
                v-if="task.files && task.files.length > 1"
                class="file-count badge badge-secondary mr-2"
                :href="`#!/task/detail/${task.gid}?tab=filelist`"
                :title="$t('Click to view task detail')"
                @click.stop
              >
                {{ task.files.length }} {{ $t("Files") }}
              </a>

              <!-- 悬停快捷控制按钮 -->
              <span class="task-hover-actions ml-2" @click.stop>
                <a
                  v-if="task.status === 'active' || task.status === 'waiting'"
                  class="task-action-btn fa fa-pause text-warning mr-2 pointer-cursor"
                  :title="$t('Pause')"
                  @click="singleAction('pause', task.gid)"
                ></a>
                <a
                  v-if="task.status === 'paused'"
                  class="task-action-btn fa fa-play text-success mr-2 pointer-cursor"
                  :title="$t('Start')"
                  @click="singleAction('start', task.gid)"
                ></a>
                <a
                  v-if="task.status === 'complete' || task.status === 'error' || task.status === 'removed'"
                  class="task-action-btn fa fa-refresh text-primary mr-2 pointer-cursor"
                  :title="$t('Retry')"
                  @click="retryTask(task)"
                ></a>
                <a
                  class="task-action-btn fa fa-trash-o text-danger pointer-cursor"
                  :title="$t('Delete')"
                  @click="singleAction('remove', task.gid)"
                ></a>
              </span>
            </div>
          </div>

          <!-- 进度条与用时 -->
          <div class="task-col-progress col-lg-2 col-sm-3 col-12">
            <div class="progress" style="height: 14px;">
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
                <span style="font-size: 10px; line-height: 14px;">
                  {{ formatPercent(task.completePercent, 1) }}
                </span>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-1 text-muted small">
              <span class="task-last-time">
                {{ task.status === 'active' ? formatDuration(task.remainTime) : '' }}
              </span>
              <span v-if="task.status === 'active'" class="task-seeders">
                <i class="fa fa-users mr-1"></i>{{ task.connections }}
              </span>
            </div>
          </div>

          <!-- 速度展示与进入详情 -->
          <div class="task-col-speed col-lg-2 col-sm-2 text-center d-none d-sm-block">
            <div v-if="task.status === 'active'" class="text-success font-weight-bold">
              <i class="fa fa-arrow-down mr-1"></i>{{ formatSpeed(task.downloadSpeed) }}
              <div v-if="task.uploadSpeed > 0" class="text-primary small">
                <i class="fa fa-arrow-up mr-1"></i>{{ formatSpeed(task.uploadSpeed) }}
              </div>
            </div>
            <div v-else-if="task.status === 'complete'" class="text-success">
              <i class="fa fa-check mr-1"></i>{{ $t("Complete") }}
            </div>
            <div v-else-if="task.status === 'error'" class="text-danger">
              <i class="fa fa-exclamation-triangle mr-1"></i>{{ $t(task.errorDescription || "Error") }}
            </div>
            <div v-else class="text-muted">
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

        <!-- 空列表占位 -->
        <div v-if="displayedTasks.length === 0" class="text-center py-5 text-muted">
          <i class="fa fa-inbox fa-3x mb-2 d-block text-secondary"></i>
          <span>{{ $t("No tasks") || "No tasks" }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { store, batchAction, refreshData } from "../store";
import { formatBytes, formatSpeed, formatDuration, formatPercent } from "../utils/format";

const props = defineProps({
  filterType: { type: String, default: "downloading" },
});

const rawTasks = computed(() => {
  if (props.filterType === "downloading") return store.tasks.active;
  if (props.filterType === "waiting") return store.tasks.waiting;
  if (props.filterType === "stopped") return store.tasks.stopped;
  return [...store.tasks.active, ...store.tasks.waiting, ...store.tasks.stopped];
});

const displayedTasks = computed(() => {
  let list = [...rawTasks.value];

  // 搜索过滤
  if (store.searchQuery.trim()) {
    const q = store.searchQuery.trim().toLowerCase();
    list = list.filter((t) => (t.taskName || "").toLowerCase().includes(q));
  }

  // 排序
  const [field, direction] = (store.displayOrder || "default:asc").split(":");
  const isAsc = direction === "asc";

  list.sort((a, b) => {
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

function isTaskSelected(gid) {
  return store.selectedGids.has(gid);
}

function toggleTaskSelect(gid, event) {
  if (store.selectedGids.has(gid)) {
    store.selectedGids.delete(gid);
  } else {
    store.selectedGids.add(gid);
  }
}

function singleAction(action, gid) {
  batchAction(action, [gid]);
}

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
      await refreshData();
    }
  } catch (err) {
    console.warn("Failed to retry task:", err);
  }
}

function toggleSort(field) {
  const current = store.displayOrder || "default:asc";
  const [curField, curDir] = current.split(":");
  if (curField === field) {
    store.displayOrder = `${field}:${curDir === "asc" ? "desc" : "asc"}`;
  } else {
    store.displayOrder = `${field}:asc`;
  }
}

function getSortIcon(field) {
  const current = store.displayOrder || "default:asc";
  const [curField, curDir] = current.split(":");
  if (curField !== field) return "fa fa-display-order fa-sort text-muted ml-1";
  return curDir === "asc"
    ? "fa fa-display-order fa-sort-asc text-primary ml-1"
    : "fa fa-display-order fa-sort-desc text-primary ml-1";
}
</script>
