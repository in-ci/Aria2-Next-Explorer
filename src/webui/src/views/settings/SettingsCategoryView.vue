<template>
  <section class="content no-padding">
    <!-- 顶部操作栏 -->
    <div class="settings-table-title px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <h5 class="mb-0 font-weight-bold mr-2">{{ $t(categoryInfo?.titleKey || "Download Settings") }}</h5>
        <small class="text-muted">{{ (categoryInfo?.options || []).length }} {{ $t("Options") || "项设置" }}</small>
      </div>
      <div>
        <button
          class="btn btn-default btn-sm mr-2"
          :disabled="loading"
          @click="loadGlobalOptions"
        >
          <i class="fa fa-refresh mr-1"></i>{{ $t("Reset") }}
        </button>
        <button
          class="btn btn-primary btn-sm"
          :disabled="loading || !isDirty"
          @click="saveOptions"
        >
          <i class="fa fa-check mr-1"></i>{{ $t("Save") }}
        </button>
      </div>
    </div>

    <!-- 加载指示器 -->
    <div v-if="loading" class="text-center py-5 text-muted">
      <i class="fa fa-spinner fa-spin fa-2x mb-2 d-block"></i>
      <span>{{ $t("Loading") }}...</span>
    </div>

    <!-- 选项表格（direct children of .settings-table 使 AdminLTE striped/hoverable 样式对齐） -->
    <div v-else class="settings-table striped hoverable">
      <SettingRow
        v-for="opt in (categoryInfo?.options || [])"
        :key="opt.key"
        :option="opt"
        v-model="formValues[opt.key]"
        :default-value="opt.defaultValue"
        @update:model-value="isDirty = true"
      />

      <div v-if="(categoryInfo?.options || []).length === 0" class="text-center py-4 text-muted">
        {{ $t("No available options") || "该分类下暂无选项" }}
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * SettingsCategoryView - 基础分类设置渲染视图
 * 统一处理全局选项获取、脏值检测与保存
 */
import { ref, computed, onMounted, watch } from "vue";
import { store } from "../../store";
import { t } from "../../i18n";
import SettingRow from "../../components/SettingRow.vue";
import { categoriesMap } from "../../api/settings";

const props = defineProps({
  category: { type: String, default: "basic" },
});

const loading = ref(false);
const isDirty = ref(false);
const formValues = ref({});

const categoryInfo = computed(() => {
  return categoriesMap[props.category] || categoriesMap.basic || { id: "basic", titleKey: "Basic Settings", options: [] };
});

async function loadGlobalOptions() {
  if (!store.client) return;
  loading.value = true;
  isDirty.value = false;

  try {
    const remote = await store.client.getGlobalOption();
    const values = {};
    const opts = categoryInfo.value?.options || [];
    opts.forEach((opt) => {
      values[opt.key] = remote && remote[opt.key] !== undefined ? remote[opt.key] : opt.defaultValue || "";
    });
    formValues.value = values;
  } catch (e) {
    console.warn("Failed to load global options:", e);
  } finally {
    loading.value = false;
  }
}

async function saveOptions() {
  if (!store.client) return;
  loading.value = true;

  try {
    const toSave = {};
    const opts = categoryInfo.value?.options || [];
    opts.forEach((opt) => {
      if (formValues.value[opt.key] !== undefined) {
        toSave[opt.key] = String(formValues.value[opt.key]);
      }
    });

    if (Object.keys(toSave).length > 0) {
      await store.client.changeGlobalOption(toSave);
      isDirty.value = false;
      alert(t("settings have taken effect") || "设置已成功保存并生效！");
    }
  } catch (err) {
    alert(`保存失败: ${err.message}`);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadGlobalOptions();
});

watch(() => props.category, () => {
  loadGlobalOptions();
});
</script>
