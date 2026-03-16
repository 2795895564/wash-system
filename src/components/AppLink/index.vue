<template>
  <component :is="linkType" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script setup lang="ts">
defineOptions({
  name: "AppLink",
  inheritAttrs: false,
});

import { isExternal } from "@/utils/index";

const props = defineProps({
  to: {
    type: Object,
    required: true,
  },
});

const isExternalLink = computed(() => {
  // 说明：侧边栏传入的 to 可能是 vue-router 的 Location 对象，path 未必始终存在。
  // 仅当 path 是字符串且符合外链协议时，才按外链处理。
  const path = typeof (props.to as any)?.path === "string" ? (props.to as any).path : "";
  return isExternal(path);
});

const linkType = computed(() => (isExternalLink.value ? "a" : "router-link"));

const linkProps = (to: any) => {
  if (isExternalLink.value) {
    return {
      href: to.path,
      target: "_blank",
      rel: "noopener noreferrer",
    };
  }
  return { to };
};
</script>
