<template>
  <div class="app-container">
    <page-search ref="searchRef" :search-config="searchConfig" @query-click="handleQueryClick" />

    <page-content
      ref="contentRef"
      :content-config="contentConfig"
      @add-click="handleAddClick()"
      @operate-click="handleOperateClick"
    >
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'">
          {{ row.status === 1 ? "启用" : "禁用" }}
        </el-tag>
      </template>

      <template #valueType="{ row }">
        <el-tag type="info">{{ row.valueType || "-" }}</el-tag>
      </template>

      <template #toolbar-right>
        <el-button type="primary" plain @click="handleOpenGetValue">读取配置值</el-button>
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

    <!--
      快捷读取配置值：用于调试/验证。
      说明：后端提供 GET /api/admin/system/config/get?key=xxx
    -->
    <el-dialog
      v-model="getValueDialogVisible"
      title="读取配置值"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form label-width="90">
        <el-form-item label="配置键">
          <el-input v-model="getValueKey" placeholder="如：admin.order.maxQueryDays" clearable />
        </el-form-item>
        <el-form-item label="返回值">
          <el-input :model-value="getValueResult" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="getValueDialogVisible = false">关闭</el-button>
          <el-button type="primary" :loading="getValueLoading" @click="handleGetValue">
            查询
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import PageSearch from "@/components/CURD/PageSearch.vue";
import PageContent from "@/components/CURD/PageContent.vue";
import PageModal from "@/components/CURD/PageModal.vue";
import usePage from "@/components/CURD/usePage";

import ConfigAPI from "@/api/system/config";
import type { IObject } from "@/components/CURD/types";

import searchConfig from "./config/search";
import contentConfig from "./config/content";
import addModalConfig from "./config/add";
import editModalConfig from "./config/edit";

defineOptions({
  name: "SystemConfig",
  inheritAttrs: false,
});

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
 * 表格行操作：目前只处理 edit。
 * delete 在 contentConfig 里走默认 deleteAction 即可。
 */
const handleOperateClick = (data: IObject) => {
  if (data.name === "edit") {
    handleEditClick(data.row, async () => {
      return await ConfigAPI.getFormData(data.row.id);
    });
  }
};

// 读取配置值弹窗
const getValueDialogVisible = ref(false);
const getValueLoading = ref(false);
const getValueKey = ref("");
const getValueResult = ref("-");

const handleOpenGetValue = () => {
  getValueDialogVisible.value = true;
  getValueResult.value = "-";
};

const handleGetValue = async () => {
  if (!getValueKey.value) {
    ElMessage.warning("请输入配置键");
    return;
  }

  getValueLoading.value = true;
  try {
    const val = await ConfigAPI.getValue(getValueKey.value);
    getValueResult.value = val === null ? "null" : String(val);
  } catch (e: any) {
    ElMessage.error(e?.message || "读取失败");
  } finally {
    getValueLoading.value = false;
  }
};
</script>
