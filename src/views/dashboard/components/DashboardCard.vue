<template>
  <el-card
    shadow="never"
    class="h-full flex flex-col dashboard-card"
    :class="clickable ? 'is-clickable' : ''"
    @click="handleClick"
  >
    <template #header>
      <div class="flex-x-between">
        <span class="text-gray">{{ title }}</span>
        <el-tag v-if="tagText" :type="tagType" size="small">{{ tagText }}</el-tag>
      </div>
    </template>

    <div class="flex-x-between mt-2 flex-1">
      <div class="flex-y-center">
        <span class="text-lg">{{ displayValue }}</span>
        <span v-if="unit" class="text-sm text-gray ml-1">{{ unit }}</span>
      </div>
      <slot name="icon" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatCurrency, formatWNumber } from "@/utils/format";

type DashboardCardValueType = "number" | "money";

const props = withDefaults(
  defineProps<{
    title: string;
    value: number | string;
    unit?: string;
    tagText?: string;
    tagType?: "primary" | "success" | "warning" | "danger" | "info";
    valueType?: DashboardCardValueType;
    clickable?: boolean;
    formatW?: boolean;
  }>(),
  {
    valueType: "number",
    clickable: false,
    formatW: false,
  }
);

const emit = defineEmits<{
  click: [];
}>();

const displayValue = computed(() => {
  if (typeof props.value === "string") return props.value;
  const n = Number(props.value ?? 0);
  if (props.valueType === "money") return formatCurrency(n);
  return props.formatW ? formatWNumber(n) : String(n);
});

function handleClick() {
  if (!props.clickable) return;
  emit("click");
}
</script>

<style scoped>
.dashboard-card.is-clickable {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.dashboard-card.is-clickable:hover {
  transform: translateY(-2px);
}
</style>
