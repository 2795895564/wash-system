<template>
  <div class="app-container">
    <page-search ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" />

    <page-content
      ref="contentRef"
      :content-config="contentConfig"
      @operate-click="handleOperateClick"
    >
      <template #success="{ row }">
        <el-tag :type="row.success === 1 ? 'success' : 'danger'">
          {{ row.success === 1 ? "成功" : "失败" }}
        </el-tag>
      </template>

      <template #path="{ row }">
        <el-tooltip :content="row.path" placement="top" :show-after="300">
          <span class="line-clamp-1">{{ row.path }}</span>
        </el-tooltip>
      </template>

      <template #requestParams="{ row }">
        <el-tooltip :content="row.requestParams" placement="top" :show-after="300">
          <span class="line-clamp-1">{{ row.requestParams || "-" }}</span>
        </el-tooltip>
      </template>
    </page-content>

    <!-- 日志详情：只读抽屉，避免表格里信息过载 -->
    <el-drawer v-model="drawerVisible" title="操作日志详情" size="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">
          {{ currentRow?.username || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentRow?.userId ?? "-" }}</el-descriptions-item>
        <el-descriptions-item label="方法">{{ currentRow?.method || "-" }}</el-descriptions-item>
        <el-descriptions-item label="路径">{{ currentRow?.path || "-" }}</el-descriptions-item>
        <el-descriptions-item label="IP">{{ currentRow?.ip || "-" }}</el-descriptions-item>
        <el-descriptions-item label="耗时(ms)">
          {{ currentRow?.costMs ?? "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="响应码">
          {{ currentRow?.responseCode || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="是否成功">
          <el-tag :type="currentRow?.success === 1 ? 'success' : 'danger'">
            {{ currentRow?.success === 1 ? "成功" : "失败" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="UA">{{ currentRow?.userAgent || "-" }}</el-descriptions-item>
        <el-descriptions-item label="请求参数">
          <pre class="log-pre">{{ currentRow?.requestParams || "" }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="时间">
          {{ currentRow?.createTime || "-" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import PageSearch from "@/components/CURD/PageSearch.vue";
import PageContent from "@/components/CURD/PageContent.vue";
import usePage from "@/components/CURD/usePage";

import type { IObject } from "@/components/CURD/types";
import type { OperLogItem } from "@/api/system/log";

import searchConfig from "./config/search";
import contentConfig from "./config/content";

defineOptions({
  name: "SystemOperLog",
  inheritAttrs: false,
});

const { searchRef, contentRef, handleQueryClick } = usePage();

const drawerVisible = ref(false);
const currentRow = ref<OperLogItem | null>(null);

const handleOperateClick = (data: IObject) => {
  if (data.name === "view") {
    currentRow.value = data.row as OperLogItem;
    drawerVisible.value = true;
  }
};
</script>

<style scoped>
.line-clamp-1 {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-pre {
  padding: 8px;
  margin: 0;
  word-break: break-all;
  white-space: pre-wrap;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}
</style>
