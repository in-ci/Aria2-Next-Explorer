<template>
  <div class="row align-items-center mb-3">
    <div class="setting-key col-sm-4">
      <span class="font-weight-bold">{{ $t(option.nameKey || option.key) }}</span>
      <small class="text-muted ml-1">({{ option.key }})</small>
      <i
        v-if="option.descriptionKey"
        class="fa fa-question-circle text-info ml-1 pointer-cursor"
        :title="$t(option.descriptionKey)"
      ></i>
    </div>

    <div class="setting-value col-sm-8">
      <!-- Boolean 开关 -->
      <select
        v-if="option.type === 'boolean'"
        class="form-control"
        :value="modelValue === true || modelValue === 'true' ? 'true' : 'false'"
        @change="$emit('update:modelValue', $event.target.value === 'true')"
      >
        <option value="true">{{ $t("True") }}</option>
        <option value="false">{{ $t("False") }}</option>
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
          :key="item.value"
          :value="item.value"
        >
          {{ $t(item.name || item.value) }}
        </option>
      </select>

      <!-- 多行 Textarea -->
      <textarea
        v-else-if="option.type === 'text'"
        class="form-control"
        rows="4"
        :placeholder="defaultValue"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      ></textarea>

      <!-- 单行文本 / 整数 / 浮点数 -->
      <div v-else class="input-group">
        <input
          class="form-control"
          :type="option.type === 'integer' || option.type === 'float' ? 'number' : 'text'"
          :placeholder="defaultValue"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <div v-if="option.suffix" class="input-group-append">
          <span class="input-group-text">{{ $t(option.suffix) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  option: { type: Object, required: true },
  modelValue: { type: [String, Number, Boolean], default: "" },
  defaultValue: { type: [String, Number, Boolean], default: "" },
});

defineEmits(["update:modelValue"]);
</script>
