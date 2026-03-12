<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span>轮播图管理</span>
          <div class="flex items-center gap-2">
            <el-button type="success" @click="handleAdd">新增</el-button>
            <el-button @click="fetchList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" class="w-full">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="title" label="标题" min-width="160">
          <template #default="{ row }">
            <span>{{ row.title || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tag" label="标签" min-width="140">
          <template #default="{ row }">
            <span>{{ row.tag || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="image_url" label="图片" min-width="220">
          <template #default="{ row }">
            <el-link v-if="row.image_url" type="primary" :href="row.image_url" target="_blank">
              {{ row.image_url }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="link_type" label="链接类型" width="120">
          <template #default="{ row }">
            <span>{{ getLinkTypeLabel(row.link_type) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="link_value" label="链接参数" min-width="220">
          <template #default="{ row }">
            <el-link
              v-if="row.link_type === 2 && row.link_value"
              type="primary"
              :href="row.link_value"
              target="_blank"
            >
              {{ row.link_value }}
            </el-link>
            <span v-else-if="row.link_value">{{ row.link_value }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="90" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="update_time" label="更新时间" min-width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无数据" class="py-8" />

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          layout="total, prev, pager, next, jumper"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="680px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" label-width="110px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="可选" />
        </el-form-item>
        <el-form-item label="标签" prop="tag">
          <el-input v-model="form.tag" placeholder="可选" />
        </el-form-item>
        <el-form-item label="图片URL" prop="image_url">
          <single-image-upload v-model:modelValue="form.image_url" :data="{ folder: 'banner' }" />
        </el-form-item>
        <el-form-item label="链接类型" prop="link_type">
          <el-select v-model="form.link_type" style="width: 100%">
            <el-option label="无" :value="0" />
            <el-option label="服务详情" :value="1" />
            <el-option label="H5" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="链接参数" prop="link_value">
          <el-input v-model="form.link_value" placeholder="可选：服务ID或H5链接" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import BannerAPI, { type BannerItem, type BannerUpsertRequest } from "@/api/banner";
import type { FormInstance } from "element-plus";
import SingleImageUpload from "@/components/Upload/SingleImageUpload.vue";

defineOptions({
  name: "ServiceBanner",
  inheritAttrs: false,
});

const loading = ref(false);
const tableData = ref<BannerItem[]>([]);

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

const dialogVisible = ref(false);
const submitting = ref(false);
const editingId = ref<number | null>(null);
const formRef = ref<FormInstance>();

const originalForm = ref<BannerUpsertRequest | null>(null);

const dialogTitle = computed(() => (editingId.value ? "编辑轮播图" : "新增轮播图"));

const form = reactive<BannerUpsertRequest>({
  title: null,
  tag: null,
  image_url: "",
  link_type: 0,
  link_value: null,
  sort_order: 0,
  status: 1,
});

function resetForm() {
  editingId.value = null;
  form.title = null;
  form.tag = null;
  form.image_url = "";
  form.link_type = 0;
  form.link_value = null;
  form.sort_order = 0;
  form.status = 1;

  originalForm.value = null;
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await BannerAPI.getBannerList({
      page: pagination.page,
      size: pagination.size,
    });
    tableData.value = res.records ?? res.list ?? res.data ?? [];
    pagination.total = res.total ?? 0;
  } catch (e: any) {
    tableData.value = [];
    pagination.total = 0;
    ElMessage.error(e?.message || "获取轮播图列表失败");
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  resetForm();
  dialogVisible.value = true;
}

function handleEdit(row: BannerItem) {
  resetForm();
  editingId.value = row.id;
  form.title = row.title ?? null;
  form.tag = row.tag ?? null;
  form.image_url = row.image_url;
  form.link_type = row.link_type ?? 0;
  form.link_value = row.link_value ?? null;
  form.sort_order = row.sort_order ?? 0;
  form.status = row.status ?? 1;

  originalForm.value = {
    title: form.title,
    tag: form.tag,
    image_url: form.image_url,
    link_type: form.link_type,
    link_value: form.link_value,
    sort_order: form.sort_order,
    status: form.status,
  };
  dialogVisible.value = true;
}

function normalizePayload(p: BannerUpsertRequest) {
  return {
    title: p.title ?? null,
    tag: p.tag ?? null,
    image_url: (p.image_url ?? "").trim(),
    link_type: p.link_type ?? 0,
    link_value: p.link_value ?? null,
    sort_order: p.sort_order ?? 0,
    status: p.status ?? 1,
  } as BannerUpsertRequest;
}

function buildPatchPayload() {
  const current = normalizePayload(form);
  const origin = originalForm.value ? normalizePayload(originalForm.value) : null;
  if (!editingId.value || !origin) {
    return current;
  }

  const patch: Partial<BannerUpsertRequest> = {};
  if (current.title !== origin.title) patch.title = current.title;
  if (current.tag !== origin.tag) patch.tag = current.tag;
  if (current.image_url !== origin.image_url) patch.image_url = current.image_url;
  if (current.link_type !== origin.link_type) patch.link_type = current.link_type;
  if (current.link_value !== origin.link_value) patch.link_value = current.link_value;
  if (current.sort_order !== origin.sort_order) patch.sort_order = current.sort_order;
  if (current.status !== origin.status) patch.status = current.status;

  return patch as BannerUpsertRequest;
}

function validateBeforeSubmit(payload: BannerUpsertRequest) {
  const isCreate = !editingId.value;
  const origin = originalForm.value ? normalizePayload(originalForm.value) : null;

  const finalImageUrl = isCreate
    ? (payload.image_url ?? "").trim()
    : ((payload.image_url ?? origin?.image_url ?? "").trim() as string);
  const finalLinkType = isCreate
    ? (payload.link_type ?? 0)
    : (payload.link_type ?? origin?.link_type ?? 0);
  const finalLinkValue = isCreate
    ? payload.link_value
    : (payload.link_value ?? origin?.link_value ?? null);

  if (isCreate && !finalImageUrl) return "请输入图片URL";
  if ((finalLinkType ?? 0) !== 0 && !finalLinkValue?.toString().trim()) return "请输入链接参数";
  return "";
}

async function handleSubmit() {
  if (submitting.value) return;

  try {
    submitting.value = true;

    const payload = buildPatchPayload();
    const msg = validateBeforeSubmit(payload);
    if (msg) {
      ElMessage.warning(msg);
      return;
    }

    if (editingId.value) {
      await BannerAPI.updateBanner(editingId.value, payload);
      ElMessage.success("保存成功");
    } else {
      await BannerAPI.createBanner(payload);
      ElMessage.success("新增成功");
    }

    dialogVisible.value = false;
    await fetchList();
  } catch (e: any) {
    ElMessage.error(e?.message || "保存失败");
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm("确定删除该轮播图？", "删除确认", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await BannerAPI.deleteBanner(id);
    ElMessage.success("删除成功");
    if (tableData.value.length === 1 && pagination.page > 1) {
      pagination.page -= 1;
    }
    await fetchList();
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error(e?.message || "删除失败");
    }
  }
}

onMounted(() => {
  fetchList();
});

function getLinkTypeLabel(t?: number) {
  if (t === 1) return "服务详情";
  if (t === 2) return "H5";
  return "无";
}
</script>
