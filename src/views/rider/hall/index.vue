<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span>任务大厅</span>
          <div class="flex items-center gap-2">
            <el-button type="primary" @click="handleCreateOrder">新建订单</el-button>
            <el-button @click="handleRefresh">刷新</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </template>

      <!-- 顶部统计：用于快速感知“待指派/进行中/已完成”任务量，减少盲目翻页查找 -->
      <div class="mb-3">
        <el-row :gutter="12">
          <el-col :xs="24" :sm="8">
            <el-card shadow="never" class="metric-card" @click="quickFilterToWaitAssign">
              <div class="metric-title">待指派</div>
              <div class="metric-value">{{ metrics.waitAssignCount }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-card shadow="never" class="metric-card" @click="quickFilterToInProgress">
              <div class="metric-title">进行中</div>
              <div class="metric-value">{{ metrics.inProgressCount }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-card shadow="never" class="metric-card" @click="quickFilterToDone">
              <div class="metric-title">已完成</div>
              <div class="metric-value">{{ metrics.doneCount }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!--
        查询条件区：
        - listType：区分“真实配送任务(TASK)”与“订单推导的待指派(WAIT_ASSIGN)”
        - taskType：取件/送回
        - taskStatusList：仅 TASK 有意义（delivery_task.status = 0/1）
        - keyword：按文档支持订单号/楼栋/地址/（TASK 时还支持骑手信息）
        - startDate/endDate：后端按 YYYY-MM-DD 解析，并将 endDate 处理为右开区间
      -->
      <el-form :inline="true" class="mb-3">
        <el-form-item label="列表口径">
          <el-select v-model="query.listType" style="width: 160px" @change="handleSearch">
            <el-option label="配送任务" value="TASK" />
            <el-option label="待指派" value="WAIT_ASSIGN" />
          </el-select>
        </el-form-item>

        <el-form-item label="任务类型">
          <el-select
            v-model="query.taskType"
            clearable
            placeholder="全部"
            style="width: 140px"
            @change="handleSearch"
          >
            <el-option label="取件" :value="1" />
            <el-option label="送回" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="query.listType === 'TASK'" label="任务状态">
          <!-- 多选更符合“状态集合(0,1)”的接口定义，最终会拼接为逗号分隔字符串 -->
          <el-select
            v-model="query.taskStatusSelected"
            multiple
            collapse-tags
            collapse-tags-tooltip
            clearable
            placeholder="全部"
            style="width: 200px"
            @change="handleSearch"
          >
            <el-option label="进行中" :value="0" />
            <el-option label="已完成" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            clearable
            placeholder="订单号/楼栋/地址"
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="开始日期">
          <el-date-picker
            v-model="query.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="YYYY-MM-DD"
            @change="handleSearch"
          />
        </el-form-item>

        <el-form-item label="结束日期">
          <el-date-picker
            v-model="query.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="YYYY-MM-DD"
            @change="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" class="w-full">
        <el-table-column prop="orderId" label="订单ID" width="90" />
        <el-table-column prop="orderSn" label="订单编号" min-width="160" />

        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.taskType === 1 ? 'warning' : 'info'">
              {{ row.taskType === 1 ? "取件" : "送回" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getTaskStatusTagType(row)">{{ getTaskStatusText(row) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="building" label="楼栋" width="120">
          <template #default="{ row }">{{ row.building || "-" }}</template>
        </el-table-column>

        <el-table-column prop="address" label="地址" min-width="220">
          <template #default="{ row }">{{ row.address || "-" }}</template>
        </el-table-column>

        <el-table-column prop="appointmentTime" label="预约时间" min-width="180">
          <template #default="{ row }">{{ row.appointmentTime || "-" }}</template>
        </el-table-column>

        <el-table-column v-if="query.listType === 'TASK'" label="骑手" min-width="160">
          <template #default="{ row }">
            {{ row.riderName || "-" }}
            <span v-if="row.riderPhone" class="text-gray-500">({{ row.riderPhone }})</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">{{ row.createTime || "-" }}</template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <!-- WAIT_ASSIGN 没有 taskId：只能执行“指派”；TASK 则可查看详情 -->
              <el-button v-if="row.taskId" link type="primary" @click="openDetail(row.taskId)">
                详情
              </el-button>
              <el-button link type="primary" @click="openAssignDialog(row)">指派</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无数据" class="py-8" />

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>

    <!-- 任务详情：只对 TASK 生效，避免对 WAIT_ASSIGN 误调用 /task/{taskId} -->
    <el-drawer v-model="detailVisible" title="任务详情" size="520px">
      <div v-loading="detailLoading">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务ID">
            {{ taskDetail?.task?.id ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="订单ID">
            {{ taskDetail?.detail?.orderId ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="订单编号">
            {{ taskDetail?.detail?.orderSn ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="任务类型">
            {{
              taskDetail?.detail?.taskType === 1
                ? "取件"
                : taskDetail?.detail?.taskType === 2
                  ? "送回"
                  : "-"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="任务状态">
            {{
              taskDetail?.task?.status === 0
                ? "进行中"
                : taskDetail?.task?.status === 1
                  ? "已完成"
                  : "-"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="骑手">
            {{ taskDetail?.rider?.riderName || "-" }}
            <span v-if="taskDetail?.rider?.riderPhone" class="text-gray-500">
              ({{ taskDetail?.rider?.riderPhone }})
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="地址">
            {{ taskDetail?.detail?.address || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="预约时间">
            {{ taskDetail?.detail?.appointmentTime || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ taskDetail?.detail?.createTime || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ taskDetail?.task?.finishTime || "-" }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="(taskDetail?.events?.length ?? 0) > 0" class="mt-3">
          <div class="mb-2 text-sm font-medium">流转记录</div>
          <el-timeline>
            <el-timeline-item
              v-for="ev in taskDetail?.events"
              :key="ev.eventId"
              :timestamp="ev.eventTime"
            >
              {{ ev.eventName }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-drawer>

    <!-- 指派弹窗：对 WAIT_ASSIGN / TASK 都可用（后端幂等校验保证不会重复创建同阶段 task） -->
    <el-dialog
      v-model="assignDialogVisible"
      title="指派骑手"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form :model="assignForm" label-width="90px">
        <el-form-item label="订单编号">
          <span>{{ currentRow?.orderSn || "-" }}</span>
        </el-form-item>
        <el-form-item label="任务类型">
          <span>
            {{
              currentRow?.taskType === 1
                ? "取件任务"
                : currentRow?.taskType === 2
                  ? "送回任务"
                  : "-"
            }}
          </span>
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

    <!--
      新建订单弹窗：迁移自仪表盘的“快捷操作”。
      说明：
      - 这个弹窗是“管理端手动创建订单”的入口，创建成功后会跳转到订单管理，并按 orderSn 自动定位。
      - 目前 studentOptions 为示例数据（与仪表盘一致）；如你们已有“学生列表”接口，可在此替换。
    -->
    <el-dialog
      v-model="createOrderVisible"
      title="新建订单"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createOrderFormRef"
        :model="createOrderForm"
        :rules="createOrderRules"
        label-width="100px"
      >
        <el-form-item label="学生" prop="studentId">
          <el-select
            v-model="createOrderForm.studentId"
            filterable
            placeholder="请输入关键词搜索"
            style="width: 100%"
          >
            <el-option
              v-for="s in studentOptions"
              :key="s.id"
              :label="`${s.name}（ID:${s.id}）`"
              :value="s.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="服务分类">
          <el-select
            v-model="selectedServiceCategoryId"
            placeholder="请选择服务分类"
            style="width: 100%"
            @change="handleChangeServiceCategory"
          >
            <el-option
              v-for="c in serviceCategoryOptions"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input v-model="createOrderForm.address" placeholder="如：郑科南苑 4号楼 104室" />
        </el-form-item>

        <el-form-item label="楼栋" prop="building">
          <el-input v-model="createOrderForm.building" placeholder="如：4号楼" />
        </el-form-item>

        <el-form-item label="预约时间" prop="appointmentTime">
          <el-date-picker
            v-model="createOrderForm.appointmentTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择预约时间"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="createOrderForm.remark" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>

        <el-form-item label="服务项" prop="items">
          <div class="w-full">
            <div
              v-for="(it, idx) in createOrderForm.items"
              :key="idx"
              class="flex gap-2 items-center mb-2"
            >
              <el-select v-model="it.serviceId" placeholder="服务项" style="flex: 1">
                <el-option
                  v-for="svc in serviceOptions"
                  :key="svc.id"
                  :label="svc.name"
                  :value="svc.id"
                />
              </el-select>
              <el-input-number v-model="it.quantity" :min="1" :step="1" />
              <el-button type="danger" plain @click="handleRemoveServiceItem(idx)">删除</el-button>
            </div>
            <el-button type="primary" plain @click="handleAddServiceItem">添加服务项</el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button :disabled="createOrderSubmitting" @click="createOrderVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="createOrderSubmitting" @click="handleSubmitCreateOrder">
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useRouter } from "vue-router";

import RiderAPI from "@/api/rider";
import OrderAPI from "@/api/order";

import type { CreateOrderRequest } from "@/api/order";

import type {
  AdminRiderHallMetricsResponse,
  AdminRiderHallTaskListItem,
  AdminRiderHallTaskDetailResponse,
  RiderHallListType,
  AdminRiderListItem,
} from "@/api/rider";

defineOptions({
  name: "RiderHall",
  inheritAttrs: false,
});

const router = useRouter();

// ============================================
// 顶部统计卡片
// ============================================

const metrics = reactive<AdminRiderHallMetricsResponse>({
  waitAssignCount: 0,
  inProgressCount: 0,
  doneCount: 0,
});

// ============================================
// 查询条件 / 分页
// ============================================

const query = reactive({
  listType: "WAIT_ASSIGN" as RiderHallListType,
  taskType: undefined as 1 | 2 | undefined,
  // TASK 模式：多选数组；真正请求时转换为 "0,1" 这种字符串
  taskStatusSelected: [] as Array<0 | 1>,
  keyword: "",
  startDate: "" as string,
  endDate: "" as string,
});

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
});

const loading = ref(false);
const tableData = ref<AdminRiderHallTaskListItem[]>([]);

// ============================================
// 新建订单（快捷操作迁移）
// ============================================

const createOrderVisible = ref(false);
const createOrderSubmitting = ref(false);
const createOrderFormRef = ref<FormInstance>();

// 与仪表盘保持一致：当前示例项目没有学生下拉接口，这里先用 mock 数据。
const studentOptions = ref<Array<{ id: number; name: string }>>([{ id: 5, name: "测试学生" }]);

const serviceOptions = ref<Array<{ id: number; name: string }>>([]);
const serviceCategoryOptions = ref<Array<{ id: number; name: string }>>([]);
const selectedServiceCategoryId = ref<number>();

const createOrderForm = ref<CreateOrderRequest>({
  studentId: 5,
  address: "郑科南苑 8号楼 411室",
  building: "8号楼",
  appointmentTime: "",
  remark: "",
  items: [{ serviceId: 101, quantity: 1 }],
});

const createOrderRules: FormRules = {
  studentId: [{ required: true, message: "请选择学生", trigger: "change" }],
  address: [{ required: true, message: "请输入地址", trigger: "blur" }],
  appointmentTime: [{ required: true, message: "请选择预约时间", trigger: "change" }],
  items: [
    {
      validator: (_rule, value, callback) => {
        if (!Array.isArray(value) || value.length === 0) {
          callback(new Error("请至少添加 1 个服务项"));
          return;
        }
        for (const it of value) {
          if (!it?.serviceId) {
            callback(new Error("请选择服务项"));
            return;
          }
          const qty = Number(it?.quantity ?? 0);
          if (!Number.isFinite(qty) || qty <= 0) {
            callback(new Error("服务项数量必须大于 0"));
            return;
          }
        }
        callback();
      },
      trigger: "change",
    },
  ],
};

function handleCreateOrder() {
  createOrderVisible.value = true;
  void preloadCreateOrderData();
}

async function preloadCreateOrderData() {
  const categories = await OrderAPI.getCategoryList().catch(() => []);
  serviceCategoryOptions.value = categories;

  if (!selectedServiceCategoryId.value && categories.length) {
    selectedServiceCategoryId.value = categories[0].id;
  }

  if (selectedServiceCategoryId.value) {
    await handleChangeServiceCategory(selectedServiceCategoryId.value);
  }
}

async function handleChangeServiceCategory(categoryId: number) {
  selectedServiceCategoryId.value = categoryId;
  const detail = await OrderAPI.getCategoryDetail(categoryId);
  serviceOptions.value = (detail?.services ?? []).map((s) => ({ id: s.id, name: s.serviceName }));

  const serviceIdSet = new Set(serviceOptions.value.map((s) => s.id));
  const defaultServiceId = serviceOptions.value[0]?.id;
  if (!defaultServiceId) return;

  // 当切换分类后，可能出现“已选服务项不在当前分类中”的情况，这里做自动纠正。
  for (const it of createOrderForm.value.items) {
    const sid = Number(it.serviceId);
    if (!serviceIdSet.has(sid)) {
      it.serviceId = defaultServiceId;
    }
  }
}

function handleAddServiceItem() {
  createOrderForm.value.items.push({ serviceId: serviceOptions.value[0]?.id ?? 0, quantity: 1 });
}

function handleRemoveServiceItem(index: number) {
  createOrderForm.value.items.splice(index, 1);
}

async function handleSubmitCreateOrder() {
  if (!createOrderFormRef.value) return;
  if (createOrderSubmitting.value) return;

  const valid = await createOrderFormRef.value.validate().catch(() => false);
  if (!valid) return;

  try {
    createOrderSubmitting.value = true;
    const resp = await OrderAPI.createOrder({
      studentId: Number(createOrderForm.value.studentId),
      address: createOrderForm.value.address,
      building: createOrderForm.value.building,
      appointmentTime: createOrderForm.value.appointmentTime,
      remark: createOrderForm.value.remark,
      items: createOrderForm.value.items.map((i) => ({
        serviceId: Number(i.serviceId),
        quantity: Number(i.quantity),
      })),
    });

    createOrderVisible.value = false;
    ElMessage.success(`创建成功，订单号：${resp.orderSn}`);

    // 迁移后仍保持一致体验：创建完成直接跳转到订单管理并带上 orderSn 进行定位。
    router.push({ path: "/orders", query: { orderSn: resp.orderSn } });
  } finally {
    createOrderSubmitting.value = false;
  }
}

function buildTaskStatusListParam() {
  if (query.listType !== "TASK") return undefined;
  if (!query.taskStatusSelected || query.taskStatusSelected.length === 0) return undefined;
  // 去重 + 排序，保证请求参数稳定（方便抓包/复现）
  const set = Array.from(new Set(query.taskStatusSelected)).sort();
  return set.join(",");
}

async function fetchMetrics() {
  try {
    const data = await RiderAPI.getAdminRiderHallMetrics();
    metrics.waitAssignCount = data.waitAssignCount ?? 0;
    metrics.inProgressCount = data.inProgressCount ?? 0;
    metrics.doneCount = data.doneCount ?? 0;
  } catch (e: any) {
    // 统计失败不应阻塞主列表，只提示即可
    ElMessage.error(e?.message || "获取统计数据失败");
  }
}

async function fetchList() {
  loading.value = true;
  try {
    const data = await RiderAPI.getAdminRiderHallTaskList({
      listType: query.listType,
      page: pagination.page,
      size: pagination.size,
      taskType: query.taskType,
      taskStatusList: buildTaskStatusListParam(),
      keyword: query.keyword || undefined,
      startDate: query.startDate || undefined,
      endDate: query.endDate || undefined,
    });

    tableData.value = data.records ?? [];
    pagination.total = data.total ?? 0;
  } catch (e: any) {
    tableData.value = [];
    pagination.total = 0;
    ElMessage.error(e?.message || "获取任务列表失败");
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  // 更改筛选条件时回到第一页，避免出现“当前页超出总页数”的空白页
  pagination.page = 1;
  fetchList();
  fetchMetrics();
}

function handleReset() {
  query.listType = "WAIT_ASSIGN";
  query.taskType = undefined;
  query.taskStatusSelected = [];
  query.keyword = "";
  query.startDate = "";
  query.endDate = "";

  pagination.page = 1;
  pagination.size = 10;

  fetchList();
  fetchMetrics();
}

function handleRefresh() {
  fetchList();
  fetchMetrics();
}

// ============================================
// 状态文案与样式
// ============================================

function getTaskStatusText(row: AdminRiderHallTaskListItem) {
  // WAIT_ASSIGN：并不是 delivery_task.status 的一种，而是由订单推导的“待指派”列表
  if (row.taskId === null || row.taskStatus === "WAIT_ASSIGN") return "待指派";

  if (row.taskStatus === 0) return "进行中";
  if (row.taskStatus === 1) return "已完成";
  return "未知";
}

function getTaskStatusTagType(row: AdminRiderHallTaskListItem) {
  if (row.taskId === null || row.taskStatus === "WAIT_ASSIGN") return "warning";
  if (row.taskStatus === 0) return "info";
  if (row.taskStatus === 1) return "success";
  return "info";
}

// ============================================
// 详情抽屉
// ============================================

const detailVisible = ref(false);
const detailLoading = ref(false);
const taskDetail = ref<AdminRiderHallTaskDetailResponse | null>(null);

async function openDetail(taskId: number) {
  detailVisible.value = true;
  detailLoading.value = true;
  taskDetail.value = null;
  try {
    const data = await RiderAPI.getAdminRiderHallTaskDetail(taskId);
    taskDetail.value = data;
  } catch (e: any) {
    ElMessage.error(e?.message || "获取任务详情失败");
  } finally {
    detailLoading.value = false;
  }
}

// ============================================
// 指派弹窗
// ============================================

const riders = ref<AdminRiderListItem[]>([]);
const ridersLoading = ref(false);

const assigning = ref(false);
const assignDialogVisible = ref(false);
const currentRow = ref<AdminRiderHallTaskListItem | null>(null);
const assignForm = reactive<{ riderId: number | null }>({ riderId: null });

function getRiderLabel(rider: AdminRiderListItem) {
  const name = rider.nickname || rider.username;
  return rider.phone ? `${name} (${rider.phone})` : name;
}

async function fetchRiders() {
  ridersLoading.value = true;
  try {
    const data = await RiderAPI.getAdminRiderHallRiderList({ page: 1, size: 200 });
    riders.value = data.records ?? [];
  } catch (e: any) {
    riders.value = [];
    ElMessage.error(e?.message || "获取骑手列表失败");
  } finally {
    ridersLoading.value = false;
  }
}

function openAssignDialog(row: AdminRiderHallTaskListItem) {
  currentRow.value = row;
  assignForm.riderId = null;
  assignDialogVisible.value = true;

  // 懒加载：第一次打开时再拉骑手列表，减少页面首次加载耗时
  if (riders.value.length === 0) {
    fetchRiders();
  }
}

async function confirmAssign() {
  if (!currentRow.value) {
    ElMessage.error("未选择任务");
    return;
  }
  if (!assignForm.riderId) {
    ElMessage.warning("请选择骑手");
    return;
  }

  assigning.value = true;
  try {
    // 文档约定：无论当前行来自 WAIT_ASSIGN 还是 TASK，指派都用 orderId + taskType
    await RiderAPI.assignAdminRiderHallTask({
      orderId: currentRow.value.orderId,
      riderId: assignForm.riderId,
      taskType: currentRow.value.taskType,
    });

    ElMessage.success("指派成功");
    assignDialogVisible.value = false;

    // 指派后：
    // - WAIT_ASSIGN 列表会减少
    // - TASK 列表会增加
    // 所以同时刷新“统计卡片 + 当前列表”
    await fetchList();
    await fetchMetrics();
  } catch (e: any) {
    const msg = e?.message || "指派失败";
    ElMessage.error(msg);

    // 常见失败来自“并发状态变更/重复指派/数据不存在”，刷新以快速恢复一致性
    await fetchList();
    await fetchMetrics();

    if (msg.includes("骑手") || msg.includes("rider") || msg.includes("Rider")) {
      fetchRiders();
    }
  } finally {
    assigning.value = false;
  }
}

// ============================================
// 统计卡片快捷筛选
// ============================================

function quickFilterToWaitAssign() {
  query.listType = "WAIT_ASSIGN";
  query.taskStatusSelected = [];
  handleSearch();
}

function quickFilterToInProgress() {
  query.listType = "TASK";
  query.taskStatusSelected = [0];
  handleSearch();
}

function quickFilterToDone() {
  query.listType = "TASK";
  query.taskStatusSelected = [1];
  handleSearch();
}

watch(
  () => [pagination.page, pagination.size],
  () => {
    fetchList();
  }
);

onMounted(() => {
  fetchMetrics();
  fetchList();
});
</script>

<style scoped>
.metric-card {
  cursor: pointer;
}

.metric-title {
  font-size: 13px;
  color: #606266;
}

.metric-value {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 600;
}

.action-cell {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
