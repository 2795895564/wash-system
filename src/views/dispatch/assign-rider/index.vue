<template>
  <div class="app-container">
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span>指派骑手</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

      <el-form :inline="true">
        <el-form-item label="订单状态">
          <el-select v-model="filterStatus" style="width: 200px">
            <el-option label="全部待指派" value="0,30" />
            <el-option label="仅待接单" value="0" />
            <el-option label="仅待送回" value="30" />
          </el-select>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="orders" class="w-full">
        <el-table-column prop="id" label="订单ID" width="90" />
        <el-table-column prop="orderSn" label="订单编号" min-width="160" />
        <el-table-column prop="address" label="地址" min-width="220" />
        <el-table-column prop="building" label="楼栋" width="120" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="appointmentTime" label="预约时间" min-width="180" />
        <el-table-column prop="totalPrice" label="金额" width="110" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openAssignDialog(row)">指派</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          layout="total, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <el-dialog v-model="assignDialogVisible" title="指派骑手" width="520px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="订单编号">
          <span>{{ currentOrder?.orderSn }}</span>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-tag :type="getStatusTagType(currentOrder?.status || -1)">
            {{ getStatusText(currentOrder?.status || -1) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="任务类型">
          <span>{{ getTaskTypeText(currentOrder?.status) }}</span>
        </el-form-item>

        <el-form-item label="选择骑手" required>
          <el-select
            v-model="assignForm.riderId"
            placeholder="请选择骑手"
            filterable
            style="width: 100%"
            :loading="ridersLoading"
          >
            <el-option
              v-for="rider in riders"
              :key="rider.id"
              :label="getRiderLabel(rider)"
              :value="rider.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assigning" @click="confirmAssign">确认指派</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

import OrderAPI from "@/api/order";
import RiderAPI from "@/api/rider";

import type { AdminPendingAssignOrderItem } from "@/api/order";
import type { AdminRiderListItem } from "@/api/rider";

defineOptions({
  name: "AssignRider",
  inheritAttrs: false,
});

type OrderRow = AdminPendingAssignOrderItem;

const orders = ref<OrderRow[]>([]);
const loading = ref(false);

const riders = ref<AdminRiderListItem[]>([]);
const ridersLoading = ref(false);

const assigning = ref(false);

const assignDialogVisible = ref(false);
const currentOrder = ref<OrderRow | null>(null);
const assignForm = reactive<{ riderId: number | null }>({ riderId: null });

const filterStatus = ref("0,30");

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

async function fetchOrders() {
  loading.value = true;
  try {
    const data = await OrderAPI.getAdminPendingAssignOrders({
      status: filterStatus.value,
      page: pagination.page,
      size: pagination.size,
    });
    orders.value = data.records ?? [];
    pagination.total = data.total ?? 0;
  } catch (e: any) {
    orders.value = [];
    pagination.total = 0;
    ElMessage.error(e?.message || "获取订单列表失败");
  } finally {
    loading.value = false;
  }
}

async function fetchRiders() {
  ridersLoading.value = true;
  try {
    const data = await RiderAPI.getAdminRiderList({ page: 1, size: 100 });
    riders.value = data.records ?? [];
  } catch (e: any) {
    riders.value = [];
    ElMessage.error(e?.message || "获取骑手列表失败");
  } finally {
    ridersLoading.value = false;
  }
}

function getStatusText(status: number) {
  if (status === 0) return "待接单";
  if (status === 30) return "待送回";
  return "未知";
}

function getStatusTagType(status: number) {
  if (status === 0) return "warning";
  if (status === 30) return "info";
  return "info";
}

function getTaskTypeText(status?: number) {
  if (status === 0) return "取件任务";
  if (status === 30) return "送回任务";
  return "未知";
}

function getRiderLabel(rider: AdminRiderListItem) {
  const name = rider.nickname || rider.username;
  return rider.phone ? `${name} (${rider.phone})` : name;
}

function openAssignDialog(order: OrderRow) {
  currentOrder.value = order;
  assignForm.riderId = null;
  assignDialogVisible.value = true;
  if (riders.value.length === 0) {
    fetchRiders();
  }
}

async function confirmAssign() {
  if (!currentOrder.value) {
    ElMessage.error("未选择订单");
    return;
  }
  if (!assignForm.riderId) {
    ElMessage.warning("请选择骑手");
    return;
  }

  const status = currentOrder.value.status;
  const taskType = status === 0 ? 1 : status === 30 ? 2 : null;
  if (!taskType) {
    ElMessage.error("订单状态不支持指派");
    return;
  }

  assigning.value = true;
  try {
    await OrderAPI.assignAdminOrder({
      orderId: currentOrder.value.id,
      riderId: assignForm.riderId,
      taskType,
    });
    ElMessage.success("指派成功");
    assignDialogVisible.value = false;
    await fetchOrders();
  } catch (e: any) {
    const msg = e?.message || "指派失败";
    ElMessage.error(msg);

    // 发生状态冲突/并发冲突/数据不存在时，刷新列表以保证一致性
    await fetchOrders();
    if (msg.includes("骑手") || msg.includes("rider") || msg.includes("Rider")) {
      fetchRiders();
    }
  } finally {
    assigning.value = false;
  }
}

function handleRefresh() {
  fetchOrders();
}

watch(
  () => filterStatus.value,
  () => {
    pagination.page = 1;
    fetchOrders();
  }
);

watch(
  () => [pagination.page, pagination.size],
  () => {
    fetchOrders();
  }
);

onMounted(() => {
  fetchOrders();
  fetchRiders();
});
</script>
