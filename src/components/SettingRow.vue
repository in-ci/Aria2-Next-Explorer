<template>
  <div class="row" :data-option-key="option.key">
    <div class="setting-key setting-key-without-desc col-sm-4">
      <span>{{ $t(option.nameKey || option.key) }}</span>
      <em>({{ option.key }})</em>
      <i
        v-if="option.descriptionKey"
        class="icon-primary fa fa-question-circle ml-1 pointer-cursor"
        :title="$t(option.descriptionKey)"
      ></i>
    </div>

    <div class="setting-value col-sm-8">
      <div class="form-group mb-0">
        <!-- Boolean 开关 -->
        <select
          v-if="option.type === 'boolean'"
          class="form-control"
          :value="booleanValue"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option value="true">{{ $t("Enabled") || "true" }}</option>
          <option value="false">{{ $t("Disabled") || "false" }}</option>
        </select>

        <!-- 单选 Option 列表 -->
        <select
          v-else-if="option.type === 'option' && option.options"
          class="form-control"
          :value="modelValue"
          @change="$emit('update:modelValue', $event.target.value)"
        >
          <option
            v-for="item in option.options"
            :key="getOptionValue(item)"
            :value="getOptionValue(item)"
          >
            {{ getOptionLabel(item) }}
          </option>
        </select>

        <!-- 多行 Textarea -->
        <textarea
          v-else-if="option.type === 'text'"
          class="form-control"
          rows="3"
          :placeholder="defaultValue"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        ></textarea>

        <!-- 单行文本 / 整数 / 浮点数带后缀 -->
        <div v-else-if="option.suffix" class="input-group">
          <input
            class="form-control"
            :type="option.type === 'integer' || option.type === 'float' ? 'number' : 'text'"
            :placeholder="defaultValue"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
          />
          <div class="input-group-append">
            <span class="input-group-text">{{ option.suffix }}</span>
          </div>
        </div>

        <!-- 普通单行文本输入 -->
        <input
          v-else
          class="form-control"
          :type="option.type === 'integer' || option.type === 'float' ? 'number' : 'text'"
          :placeholder="defaultValue"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * SettingRow - 下载设置行组件
 * 严格按照 AdminLTE / AriaNg 规范输出 .row > .setting-key + .setting-value 结构
 */
import { computed } from "vue";
import { t } from "../i18n";

const props = defineProps({
  option: { type: Object, required: true },
  modelValue: { type: [String, Number, Boolean], default: "" },
  defaultValue: { type: [String, Number, Boolean], default: "" },
});

defineEmits(["update:modelValue"]);

const booleanValue = computed(() => {
  const val = props.modelValue !== undefined && props.modelValue !== "" ? props.modelValue : props.defaultValue;
  return val === true || val === "true" ? "true" : "false";
});

function getOptionValue(item) {
  if (item === null || item === undefined) return "";
  if (typeof item === "object") return item.value ?? "";
  return String(item);
}

function getOptionLabel(item) {
  if (item === null || item === undefined) return "";
  if (typeof item === "object") {
    const raw = item.name || item.value || "";
    return t(raw) || raw;
  }
  const str = String(item);
  return t(str) || str;
}
</script>
