<template>
  <div class="dict-items-panel">
    <div class="dict-items-panel__header">
      <div class="dict-items-panel__title">
        <span>字典项：{{ dictCode }}</span>
        <el-tag v-if="!dictCode" type="info" size="small" class="ml-2">未选择</el-tag>
      </div>

      <div class="dict-items-panel__actions">
        <el-button type="primary" size="small" :disabled="!dictCode" @click="handleOpenCreate">
          新增字典项
        </el-button>
        <el-button size="small" :disabled="!dictCode" @click="fetchList">刷新</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="tableData" border class="w-full">
      <el-table-column prop="itemValue" label="值" width="120" />
      <el-table-column prop="itemLabel" label="标签" min-width="160" />
      <el-table-column prop="tagType" label="标签样式" width="140">
        <template #default="{ row }">
          <el-tag :type="row.tagType || undefined">{{ row.tagType || "default" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? "启用" : "禁用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleOpenEdit(row.id)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-3 flex justify-end">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        small
      />
    </div>

    <el-dialog
      v-model="editDialogVisible"
      :title="form.id ? '编辑字典项' : '新增字典项'"
      width="680px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100">
        <el-form-item label="字典编码">
          <el-input :model-value="dictCode" disabled />
        </el-form-item>

        <el-form-item label="值" prop="itemValue">
          <el-input v-model="form.itemValue" placeholder="如：1" />
        </el-form-item>

        <el-form-item label="标签" prop="itemLabel">
          <el-input v-model="form.itemLabel" placeholder="如：男" />
        </el-form-item>

        <el-form-item label="标签样式" prop="tagType">
          <el-select v-model="form.tagType" placeholder="default" clearable style="width: 100%">
            <el-option label="default" value="" />
            <el-option label="primary" value="primary" />
            <el-option label="success" value="success" />
            <el-option label="warning" value="warning" />
            <el-option label="info" value="info" />
            <el-option label="danger" value="danger" />
          </el-select>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 100%" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import DictAPI from "@/api/system/dict";

defineOptions({
  name: "DictItemsPanel",
  inheritAttrs: false,
});

const props = defineProps<{ dictCode: string }>();
const emit = defineEmits<{ (_e: "changed"): void }>();

const loading = ref(false);
const tableData = ref<any[]>([]);

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

const editDialogVisible = ref(false);
const submitting = ref(false);
const formRef = ref();

const form = reactive<any>({
  id: "",
  itemValue: "",
  itemLabel: "",
  tagType: "",
  sort: 0,
  status: 1,
  remark: "",
});

const rules = {
  itemValue: [{ required: true, message: "请输入字典值", trigger: "blur" }],
  itemLabel: [{ required: true, message: "请输入字典标签", trigger: "blur" }],
};

const resetForm = () => {
  form.id = "";
  form.itemValue = "";
  form.itemLabel = "";
  form.tagType = "";
  form.sort = 0;
  form.status = 1;
  form.remark = "";
};

const fetchList = async () => {
  if (!props.dictCode) return;

  loading.value = true;
  try {
    const res = await DictAPI.getDictItemPage(props.dictCode, {
      pageNum: pagination.page,
      pageSize: pagination.size,
    } as any);

    tableData.value = res.list ?? [];
    pagination.total = res.total ?? 0;
  } catch (e: any) {
    tableData.value = [];
    pagination.total = 0;
    ElMessage.error(e?.message || "获取字典项失败");
  } finally {
    loading.value = false;
  }
};

const handleOpenCreate = () => {
  resetForm();
  editDialogVisible.value = true;
};

const handleOpenEdit = async (id: string) => {
  try {
    const data = await DictAPI.getDictItemFormData(props.dictCode, id);
    resetForm();
    Object.assign(form, data);
    editDialogVisible.value = true;
  } catch (_e: any) {
    ElMessage.error(_e?.message || "获取字典项详情失败");
  }
};

const handleSubmit = async () => {
  try {
    const valid = await formRef.value?.validate();
    if (!valid) return;

    submitting.value = true;

    if (form.id) {
      await DictAPI.updateDictItem(props.dictCode, form.id, form);
      ElMessage.success("修改成功");
    } else {
      await DictAPI.createDictItem(props.dictCode, form);
      ElMessage.success("新增成功");
    }

    editDialogVisible.value = false;
    emit("changed");
    await fetchList();
  } catch (_e: any) {
    ElMessage.error(_e?.message || "提交失败");
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm("确定删除该字典项吗？", "删除", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });

    await DictAPI.deleteDictItems(props.dictCode, String(id));
    ElMessage.success("删除成功");

    emit("changed");

    if (tableData.value.length === 1 && pagination.page > 1) {
      pagination.page -= 1;
    }

    await fetchList();
  } catch (_e: any) {
    if (_e !== "cancel") {
      ElMessage.error(_e?.message || "删除失败");
    }
  }
};

watch(
  () => [pagination.page, pagination.size],
  () => {
    fetchList();
  }
);

watch(
  () => props.dictCode,
  () => {
    pagination.page = 1;
    pagination.size = 10;
    pagination.total = 0;
    fetchList();
  },
  { immediate: true }
);
</script>

<style scoped>
.dict-items-panel {
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.dict-items-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.dict-items-panel__title {
  font-weight: 600;
}
</style>
