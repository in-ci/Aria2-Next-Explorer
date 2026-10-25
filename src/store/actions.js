/**
 * ==============================================================================
 * Store 模块：任务操作与交互行为 (actions.js)
 * ==============================================================================
 * 职责：
 * 1. 负责针对单个或多个下载任务的启动、暂停、删除等批量操作。
 * 2. 负责已停止任务记录的批量清理。
 * 3. 负责 RPC 服务端节点的切换与上下文清理重置。
 * ==============================================================================
 */

import { markRaw } from "vue";
import { t } from "../i18n";
import { store, currentRpc, rpcList, createInitialSpeedHistory } from "./state";
import { refreshData } from "./polling";
import { clearSavedCompletedTimes } from "./options";

/**
 * 切换活跃 RPC 服务器
 * @param {number} index 服务器索引
 */
export function switchRpcServer(index) {
  if (index < 0 || index >= rpcList.value.length) return;
  store.activeRpcIndex = index;
  store.selectedGids.clear();
  store.tasks = { active: [], waiting: [], stopped: [] };
  store.globalOptions = {};
  store.speedHistory = markRaw(createInitialSpeedHistory());

  if (store.client) {
    const target = currentRpc.value;
    store.client.updateConfig(target);
    refreshData(true);
  }
}

/**
 * 批量操作任务 (暂停、开始、删除)
 * @param {'pause' | 'start' | 'remove'} action 操作类型
 * @param {string[]} [gids] 待操作的 GID 列表（若未传则默认使用选中的所有任务）
 */
export async function batchAction(action, gids = []) {
  if (!store.client) return;
  const targetGids = gids.length > 0 ? gids : Array.from(store.selectedGids);
  if (targetGids.length === 0) return;

  if (action === "remove" && store.options.confirmTaskRemoval !== false) {
    const msg = t("Are you sure you want to remove the selected task?");
    if (!window.confirm(msg)) {
      return;
    }
  }

  const promises = targetGids.map((gid) => {
    if (action === "pause") return store.client.pause(gid).catch(() => {});
    if (action === "start") return store.client.unpause(gid).catch(() => {});
    if (action === "remove") return store.client.remove(gid).catch(() => store.client.removeDownloadResult(gid).catch(() => {}));
  });

  await Promise.all(promises);
  store.selectedGids.clear();
  await refreshData(true);
}

/**
 * 清除已停止的所有任务结果记录
 */
export async function clearAllStoppedTasks() {
  if (!store.client) return;
  try {
    await store.client.purgeDownloadResult();
    clearSavedCompletedTimes();
  } catch (e) {}
  await refreshData(true);
}
