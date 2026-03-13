<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span>服务卡片管理</span>
          <div class="flex items-center gap-2">
            <el-button type="success" @click="handleAdd">新增</el-button>
            <el-button @click="fetchList">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" class="w-full">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="name" label="服务名称" min-width="160" />
        <el-table-column prop="enName" label="英文名" min-width="160" />
        <el-table-column prop="iconUrl" label="图标" min-width="180">
          <template #default="{ row }">
            <el-link
              v-if="row.iconUrl"
              type="primary"
              :href="toAbsoluteUrl(row.iconUrl)"
              target="_blank"
            >
              {{ toAbsoluteUrl(row.iconUrl) }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="categoryId" label="分类ID" width="110" />
        <el-table-column prop="sortOrder" label="排序" width="90" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="170" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row.id)">编辑</el-button>
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
      width="860px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" label-width="110px">
        <el-divider content-position="left">服务卡片（home_service_card）</el-divider>
        <el-form-item label="服务名称" prop="card.name" required>
          <el-input v-model="form.card.name" placeholder="如：洗衣" />
        </el-form-item>
        <el-form-item label="英文名" prop="card.enName">
          <el-input v-model="form.card.enName" placeholder="如：LAUNDRY" />
        </el-form-item>
        <el-form-item label="图标URL" prop="card.iconUrl" required>
          <single-image-upload
            v-model:modelValue="form.card.iconUrl"
            :data="{ folder: 'uploads/home' }"
          />
        </el-form-item>
        <el-form-item label="排序" prop="card.sortOrder">
          <el-input-number v-model="form.card.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="card.status">
          <el-radio-group v-model="form.card.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="left">分类（laundry_category）</el-divider>
        <el-form-item label="分类名称" prop="category.name" required>
          <el-input v-model="categoryModel.name" placeholder="如：上装/家纺/鞋履" />
        </el-form-item>
        <el-form-item label="分类排序" prop="category.sort">
          <el-input-number v-model="categoryModel.sort" :min="0" />
        </el-form-item>

        <el-divider content-position="left">服务项（laundry_service）</el-divider>
        <div class="w-full">
          <div class="mb-2 flex justify-end">
            <el-button type="primary" plain @click="handleAddService">添加服务项</el-button>
          </div>

          <el-table :data="form.services" border class="w-full">
            <el-table-column prop="serviceName" label="服务名称" min-width="160">
              <template #default="{ row }">
                <el-input v-model="row.serviceName" placeholder="如：羽绒服洗" />
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价(元)" width="130">
              <template #default="{ row }">
                <el-input-number v-model="row.price" :min="0" :step="1" />
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="单位" width="110">
              <template #default="{ row }">
                <el-input v-model="row.unit" placeholder="件" />
              </template>
            </el-table-column>
            <el-table-column prop="washMethod" label="清洗方式" width="160">
              <template #default="{ row }">
                <el-input v-model="row.washMethod" placeholder="普通洗/精洗/干洗" />
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="110">
              <template #default="{ row }">
                <el-select v-model="row.status" style="width: 100%">
                  <el-option label="上架" :value="1" />
                  <el-option label="下架" :value="0" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" @click="handleRemoveService($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
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
import ServiceCardAPI from "@/api/service-card";
import type {
  HomeServiceCardItem,
  HomeServiceCardUpsertRequest,
  LaundryServiceItem,
} from "@/api/service-card";
import type { FormInstance } from "element-plus";
import SingleImageUpload from "@/components/Upload/SingleImageUpload.vue";

defineOptions({
  name: "ServiceCategory",
  inheritAttrs: false,
});

const loading = ref(false);
const tableData = ref<HomeServiceCardItem[]>([]);

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

const dialogVisible = ref(false);
const submitting = ref(false);
const editingId = ref<number | null>(null);
const formRef = ref<FormInstance>();

const dialogTitle = computed(() => (editingId.value ? "编辑服务卡片" : "新增服务卡片"));

const categoryModel = computed(() => {
  if (!form.category) {
    form.category = { name: "", sort: 0 };
  }
  return form.category;
});

const form = reactive<HomeServiceCardUpsertRequest>({
  card: {
    name: "",
    enName: "",
    iconUrl: "",
    sortOrder: 0,
    status: 1,
  },
  category: {
    name: "",
    sort: 0,
  },
  services: [],
});

function resetForm() {
  editingId.value = null;
  form.card = { name: "", enName: "", iconUrl: "", sortOrder: 0, status: 1 };
  form.category = { name: "", sort: 0 };
  form.services = [];
}

function normalizeServices(list: LaundryServiceItem[]) {
  return (list ?? []).map((i) => ({
    id: i.id,
    serviceName: i.serviceName,
    price: i.price,
    unit: i.unit ?? "件",
    image: i.image,
    description: i.description,
    washMethod: i.washMethod,
    status: i.status ?? 1,
  }));
}

function toAbsoluteUrl(url: string) {
  if (!url) return url;
  if (/^https?:\/\//.test(url)) return url;
  const base = (import.meta.env.VITE_APP_BASE_API ?? "").toString().replace(/\/$/, "");
  if (!base) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await ServiceCardAPI.getHomeServiceCardList({
      page: pagination.page,
      size: pagination.size,
    });
    tableData.value = res.records ?? [];
    pagination.total = res.total ?? 0;
  } catch (e: any) {
    tableData.value = [];
    pagination.total = 0;
    ElMessage.error(e?.message || "获取服务卡片列表失败");
  } finally {
    loading.value = false;
  }
}

function handleAdd() {
  resetForm();
  dialogVisible.value = true;
}

async function handleEdit(id: number) {
  resetForm();
  editingId.value = id;
  dialogVisible.value = true;

  submitting.value = true;
  try {
    const detail = await ServiceCardAPI.getHomeServiceCardDetail(id);
    form.card = {
      id: detail.card.id,
      name: detail.card.name,
      enName: detail.card.enName ?? "",
      iconUrl: toAbsoluteUrl(detail.card.iconUrl),
      sortOrder: detail.card.sortOrder ?? 0,
      status: detail.card.status ?? 1,
    };
    form.category = {
      id: detail.card.categoryId ?? undefined,
      name: detail.card.name,
      sort: detail.card.sortOrder ?? 0,
    };
    form.services = normalizeServices(detail.services);
  } catch (e: any) {
    ElMessage.error(e?.message || "获取详情失败");
  } finally {
    submitting.value = false;
  }
}

function handleAddService() {
  form.services = [
    ...(form.services ?? []),
    {
      serviceName: "",
      price: 0,
      unit: "件",
      washMethod: "",
      status: 1,
    },
  ];
}

function handleRemoveService(index: number) {
  const next = [...(form.services ?? [])];
  next.splice(index, 1);
  form.services = next;
}

function validateBeforeSubmit() {
  if (!form.card?.name?.trim()) return "请输入服务名称";
  if (!form.card?.iconUrl?.trim()) return "请输入图标URL";
  if (!form.category?.name?.trim()) return "请输入分类名称";
  for (const [idx, svc] of (form.services ?? []).entries()) {
    if (!svc.serviceName?.trim()) return `第 ${idx + 1} 个服务项：请输入服务名称`;
    if (!Number.isFinite(Number(svc.price))) return `第 ${idx + 1} 个服务项：单价不合法`;
  }
  return "";
}

async function handleSubmit() {
  const msg = validateBeforeSubmit();
  if (msg) {
    ElMessage.warning(msg);
    return;
  }
  if (submitting.value) return;

  try {
    submitting.value = true;

    const payload: HomeServiceCardUpsertRequest = {
      card: {
        id: form.card.id,
        name: form.card.name,
        enName: form.card.enName ?? null,
        iconUrl: form.card.iconUrl,
        sortOrder: form.card.sortOrder ?? 0,
        status: form.card.status ?? 1,
      },
      category: {
        id: form.category?.id,
        name: form.category?.name ?? form.card.name,
        sort: form.category?.sort ?? form.card.sortOrder ?? 0,
      },
      services: (form.services ?? []).map((s: any) => ({
        id: s.id,
        serviceName: s.serviceName,
        price: Number(s.price),
        unit: s.unit,
        image: s.image,
        description: s.description,
        washMethod: s.washMethod,
        status: s.status ?? 1,
      })),
    };

    if (editingId.value) {
      await ServiceCardAPI.updateHomeServiceCard(editingId.value, payload);
      ElMessage.success("保存成功");
    } else {
      await ServiceCardAPI.createHomeServiceCard(payload);
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
    await ElMessageBox.confirm(
      "删除服务卡片后，将同时删除对应的分类(laundry_category)及其服务项(laundry_service)，且不可恢复。确定删除？",
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await ServiceCardAPI.deleteHomeServiceCard(id);
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
</script>
