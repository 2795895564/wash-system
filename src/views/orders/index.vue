<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span>{{ pageTitle }}</span>
          <div class="flex items-center gap-2">
            <el-button v-if="showFilterToggle" @click="filtersVisible = !filtersVisible">
              {{ filtersVisible ? "收起筛选" : "展开筛选" }}
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </template>

      <el-form v-show="filtersVisible" :inline="true" class="mb-3">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleSearch"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="statusList"
            multiple
            collapse-tags
            collapse-tags-tooltip
            style="width: 260px"
            @change="handleSearch"
          >
            <el-option label="待接单" value="0" />
            <el-option label="待送回" value="30" />
            <el-option label="已完成" value="60" />
          </el-select>
        </el-form-item>

        <el-form-item label="已支付">
          <el-select v-model="paid" style="width: 120px" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>
      </el-form>

      <el-alert v-if="notice" :title="notice" type="info" show-icon class="mb-3" />

      <el-table v-loading="loading" :data="tableData" class="w-full">
        <el-table-column prop="orderId" label="订单ID" width="90" />
        <el-table-column prop="orderSn" label="订单编号" min-width="160" />
        <el-table-column prop="studentName" label="学生" min-width="120" />
        <el-table-column prop="phone" label="电话" min-width="130" />
        <el-table-column prop="address" label="地址" min-width="220" />
        <el-table-column prop="building" label="楼栋" width="120" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="已支付" width="90">
          <template #default="{ row }">
            <el-tag :type="row.paid === 1 ? 'success' : 'info'">
              {{ row.paid === 1 ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payAmount" label="实付(元)" width="110" />
        <el-table-column prop="createTime" label="创建时间" min-width="170" />

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleOpenDetail(row.orderId)">详情</el-button>
            <el-button
              link
              type="warning"
              :disabled="!canCancel(row.status)"
              @click="handleCancel(row.orderId)"
            >
              取消
            </el-button>
            <el-button
              link
              type="danger"
              :disabled="!canDelete(row.status)"
              @click="handleDelete(row.orderId)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty
        v-if="!loading && tableData.length === 0"
        :description="emptyDescription"
        class="py-8"
      />

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          layout="total, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <el-drawer
      v-model="detailDrawerVisible"
      title="订单详情"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDetail"
    >
      <el-descriptions v-loading="detailLoading" :column="1" border>
        <el-descriptions-item label="订单ID">
          {{ orderDetail?.orderId ?? "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="订单编号">
          {{ orderDetail?.orderSn ?? "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="orderDetail" :type="getStatusTagType(orderDetail.status)">
            {{ getStatusText(orderDetail.status) }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="学生">
          {{ orderDetail?.studentName ?? "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="电话">{{ orderDetail?.phone ?? "-" }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ orderDetail?.address ?? "-" }}</el-descriptions-item>
        <el-descriptions-item label="楼栋">{{ orderDetail?.building ?? "-" }}</el-descriptions-item>
        <el-descriptions-item label="预约时间">
          {{ orderDetail?.appointmentTime ?? "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="应付">
          {{ orderDetail?.totalAmount ?? "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="实付">
          {{ orderDetail?.payAmount ?? "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ orderDetail?.createTime ?? "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="骑手">
          {{ orderDetail?.riderName ?? "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="配送费">
          {{ orderDetail?.deliveryFee ?? "-" }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-table v-loading="detailLoading" :data="orderDetail?.items ?? []" class="w-full">
        <el-table-column prop="serviceId" label="服务ID" width="90" />
        <el-table-column prop="serviceName" label="服务名称" min-width="160" />
        <el-table-column prop="unitPrice" label="单价" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="amount" label="小计" width="100" />
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDrawerVisible = false">关 闭</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAppStore } from "@/store/modules/app";
import { DeviceEnum } from "@/enums";

import OrderAPI from "@/api/order";
import type { AdminOrderDetailResponse, AdminOrderListItem } from "@/api/order";

defineOptions({
  name: "Orders",
  inheritAttrs: false,
});

const loading = ref(false);
const tableData = ref<AdminOrderListItem[]>([]);

const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
});

const route = useRoute();
const router = useRouter();

const appStore = useAppStore();

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const detailDrawerVisible = ref(false);
const detailLoading = ref(false);
const orderDetail = ref<AdminOrderDetailResponse | null>(null);

const dateRange = ref<[string, string] | null>(null);
const statusList = ref<string[]>([]);
const paid = ref<string>("");

const filtersVisible = ref(true);

const showFilterToggle = computed(() => true);

const pageTitle = computed(() => {
  const q = route.query;
  const range = typeof q.range === "string" ? q.range : "";
  const paidQ = typeof q.paid === "string" ? q.paid : "";
  const statusQ = typeof q.status === "string" ? q.status : "";

  if (range === "today" && paidQ === "1") return "今日收入订单";
  if (range === "today") return "今日订单";
  if (statusQ === "pending") return "待处理订单";
  return "订单管理";
});

const notice = computed(() => {
  const from = route.query.from;
  return from === "dashboard" ? "已从仪表盘跳转，已为你自动带入筛选条件。" : "";
});

const emptyDescription = computed(() => {
  const q = route.query;
  const range = typeof q.range === "string" ? q.range : "";
  const paidQ = typeof q.paid === "string" ? q.paid : "";
  const statusQ = typeof q.status === "string" ? q.status : "";

  if (range === "today" && paidQ === "1") {
    return "已进入【今日收入订单】视图（默认今天 + 已支付）。后续对接订单列表接口即可。";
  }
  if (range === "today") {
    return "已进入【今日订单】视图（默认今天）。后续对接订单列表接口即可。";
  }
  if (statusQ === "pending") {
    return "已进入【待处理订单】视图（默认待处理状态集合）。后续对接订单列表接口即可。";
  }
  return "订单管理页面已就绪，后续对接真实订单列表接口即可。";
});

function getTodayYYYYMMDD() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getStatusText(status: number) {
  if (status === 0) return "等待骑手接单";
  if (status === 10) return "骑手已接单";
  if (status === 15) return "骑手已取件，送往洗衣店";
  if (status === 20) return "已送达洗衣店";
  if (status === 25) return "衣物清洗中";
  if (status === 30) return "清洗完成，待送回";
  if (status === 40) return "骑手送回中";
  if (status === 50) return "订单已送达完成";
  return String(status);
}

function getStatusTagType(status: number) {
  if (status === 0) return "warning";
  if (status === 10) return "warning";
  if (status === 15) return "warning";
  if (status === 20) return "info";
  if (status === 25) return "info";
  if (status === 30) return "info";
  if (status === 40) return "info";
  if (status === 50) return "success";
  return "info";
}

function canCancel(status: number) {
  return status === 0;
}

function canDelete(status: number) {
  return status === 50;
}

async function handleOpenDetail(orderId: number) {
  detailDrawerVisible.value = true;
  detailLoading.value = true;
  orderDetail.value = null;
  try {
    const data = await OrderAPI.getAdminOrderDetail(orderId);
    orderDetail.value = data;
  } catch (e: any) {
    ElMessage.error(e?.message || "获取订单详情失败");
  } finally {
    detailLoading.value = false;
  }
}

function handleCloseDetail() {
  orderDetail.value = null;
}

async function handleCancel(orderId: number) {
  try {
    const result: any = await ElMessageBox.prompt("请输入取消原因（可选）", "取消订单", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPlaceholder: "例如：用户取消/无法联系/超时等",
      inputType: "textarea",
      inputValidator: () => true,
    });

    await OrderAPI.cancelAdminOrder({ orderId, reason: result?.value || undefined });
    ElMessage.success("订单已取消");
    await fetchList();
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error(e?.message || "取消订单失败");
    }
  }
}

async function handleDelete(orderId: number) {
  try {
    await ElMessageBox.confirm("删除后不可恢复，确定删除该订单吗？", "删除订单", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    await OrderAPI.deleteAdminOrder(orderId);
    ElMessage.success("订单已删除");
    if (tableData.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page -= 1;
    }
    await fetchList();
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error(e?.message || "删除订单失败");
    }
  }
}

function buildApiParams() {
  const q = route.query;
  const range = typeof q.range === "string" ? q.range : "";
  const statusListQ = typeof q.statusList === "string" ? q.statusList : "";
  const paidQ = typeof q.paid === "string" ? q.paid : "";
  const keyword = typeof q.keyword === "string" ? q.keyword : "";
  const orderSn = typeof q.orderSn === "string" ? q.orderSn : "";

  const [startDateRaw, endDateRaw] = dateRange.value ?? ["", ""];
  let startDate = startDateRaw;
  let endDate = endDateRaw;
  if (range === "today") {
    const d = getTodayYYYYMMDD();
    startDate = d;
    endDate = d;
  }

  return {
    page: pagination.value.page,
    size: pagination.value.size,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    statusList: statusListQ || (statusList.value.length ? statusList.value.join(",") : undefined),
    paid: paidQ ? Number(paidQ) : paid.value ? Number(paid.value) : undefined,
    keyword: keyword || undefined,
    orderSn: orderSn || undefined,
  };
}

async function fetchList() {
  loading.value = true;
  try {
    const res = await OrderAPI.getAdminOrderList(buildApiParams());
    tableData.value = res.records ?? [];
    pagination.value.total = res.total ?? 0;
  } catch (e: any) {
    tableData.value = [];
    pagination.value.total = 0;
    ElMessage.error(e?.message || "获取订单列表失败");
  } finally {
    loading.value = false;
  }
}

function setQuery(next: Record<string, any>) {
  router.replace({
    path: "/order/list",
    query: {
      ...route.query,
      ...next,
    },
  });
}

function applyQueryToForm() {
  const q = route.query;

  const range = typeof q.range === "string" ? q.range : "";
  const startDate = typeof q.startDate === "string" ? q.startDate : "";
  const endDate = typeof q.endDate === "string" ? q.endDate : "";

  if (range === "today") {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const d = `${yyyy}-${mm}-${dd}`;
    dateRange.value = [d, d];
  } else if (startDate && endDate) {
    dateRange.value = [startDate, endDate];
  } else {
    dateRange.value = null;
  }

  if (typeof q.statusList === "string" && q.statusList.trim()) {
    statusList.value = q.statusList.split(",").filter(Boolean);
  } else if (typeof q.status === "string" && q.status.trim()) {
    statusList.value = [q.status];
  } else {
    statusList.value = [];
  }

  paid.value = typeof q.paid === "string" ? q.paid : "";

  // 从仪表盘跳转后：默认不让用户“必须筛选”，直接看结果。
  // 因此筛选区默认收起，但可展开。
  const from = typeof q.from === "string" ? q.from : "";
  if (from === "dashboard") {
    filtersVisible.value = false;
  }
}

function handleSearch() {
  const [startDate, endDate] = dateRange.value ?? ["", ""];
  setQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    statusList: statusList.value.length ? statusList.value.join(",") : undefined,
    paid: paid.value || undefined,
    range: undefined,
    from: "dashboard",
  });
}

function handleReset() {
  dateRange.value = null;
  statusList.value = [];
  paid.value = "";
  router.replace({ path: "/order/list", query: {} });
}

watch(
  () => route.query,
  () => {
    applyQueryToForm();
    pagination.value.page = 1;
    fetchList();
  },
  { immediate: true }
);

watch(
  () => [pagination.value.page, pagination.value.size],
  () => {
    fetchList();
  }
);

onMounted(() => {
  fetchList();
});
</script>
