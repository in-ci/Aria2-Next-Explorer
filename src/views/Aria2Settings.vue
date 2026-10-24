<template>
  <SettingsCategoryView :category="category" />
</template>

<script setup>
import SettingsCategoryView from "./settings/SettingsCategoryView.vue";

defineProps({
  category: { type: String, default: "basic" },
});
</script>
