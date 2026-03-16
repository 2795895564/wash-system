<template>
  <div class="app-container">
    <page-search ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" />

    <page-content
      ref="contentRef"
      :content-config="contentConfig"
      @add-click="handleAddClick()"
      @edit-click="handleOperateClick"
      @operate-click="handleOperateClick"
    >
      <!-- 字典项管理：放在主表的 expand 行里，避免再跳页面，交互更顺畅 -->
      <template #expand="{ row }">
        <dict-items-panel
          :dict-code="row.dictCode"
          @changed="handleDictItemsChanged(row.dictCode)"
        />
      </template>

      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'">
          {{ row.status === 1 ? "启用" : "禁用" }}
        </el-tag>
      </template>
    </page-content>

    <page-modal
      ref="addModalRef"
      :modal-config="addModalConfig"
      @submit-click="handleSubmitClick"
    />
    <page-modal
      ref="editModalRef"
      :modal-config="editModalConfig"
      @submit-click="handleSubmitClick"
    />
  </div>
</template>

<script setup lang="ts">
import PageSearch from "@/components/CURD/PageSearch.vue";
import PageContent from "@/components/CURD/PageContent.vue";
import PageModal from "@/components/CURD/PageModal.vue";
import usePage from "@/components/CURD/usePage";

import DictAPI from "@/api/system/dict";
import { useDictStoreHook } from "@/store/modules/dict";
import type { IObject } from "@/components/CURD/types";

import searchConfig from "./config/search";
import contentConfig from "./config/content";
import addModalConfig from "./config/add";
import editModalConfig from "./config/edit";
import DictItemsPanel from "./components/DictItemsPanel.vue";

defineOptions({
  name: "SystemDict",
  inheritAttrs: false,
});

const dictStore = useDictStoreHook();

const {
  searchRef,
  contentRef,
  addModalRef,
  editModalRef,
  handleQueryClick,
  handleAddClick,
  handleSubmitClick,
  handleEditClick,
} = usePage();

/**
 * 表格行操作：
 * - edit：编辑字典
 * - 其他操作可以在 contentConfig 里扩展
 */
const handleOperateClick = (data: IObject) => {
  if (data.name === "edit") {
    handleEditClick(data.row, async () => {
      return await DictAPI.getFormData(data.row.id);
    });
  }
};

/**
 * 字典项变更后：
 * - 清理 dictStore 缓存，保证 <dict> 组件和其他页面用到的 options 立即生效
 * - 该刷新是按 dictCode 精确刷，避免清空全部缓存
 */
const handleDictItemsChanged = (dictCode: string) => {
  dictStore.removeDictItem(dictCode);
};
</script>
