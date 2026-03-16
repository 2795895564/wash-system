<template>
  <div class="app-container rider-performance-page">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span>骑手业绩</span>
          <div class="flex items-center gap-2">
            <el-button @click="handleRefresh">刷新</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </template>

      <!--
        查询条件区（统一驱动 summary / trend / riders / tasks 4个接口）：
        - 日期：按文档为 YYYY-MM-DD，后端会用左闭右开区间 [startTime, endTime)
        - onlyFinished：默认=1（仅看完成），它会影响统计口径与 tasks.status 的可用性
        - granularity/metric：趋势图维度（按日/按周）和指标（完成数/总数）
      -->
      <el-form :inline="true" class="mb-3">
        <el-form-item label="开始日期" required>
          <el-date-picker
            v-model="query.startDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="YYYY-MM-DD"
            @change="handleSearch"
          />
        </el-form-item>

        <el-form-item label="结束日期" required>
          <el-date-picker
            v-model="query.endDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="YYYY-MM-DD"
            @change="handleSearch"
          />
        </el-form-item>

        <el-form-item label="仅看完成">
          <el-switch
            v-model="query.onlyFinished"
            :active-value="1"
            :inactive-value="0"
            @change="handleSearch"
          />
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
            <el-option label="送件" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="骑手">
          <el-select
            v-model="query.riderId"
            clearable
            filterable
            placeholder="全部"
            style="width: 220px"
            :loading="ridersOptionsLoading"
            @change="handleSearch"
          >
            <el-option
              v-for="r in ridersOptions"
              :key="r.id"
              :label="getRiderLabel(r)"
              :value="r.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="趋势粒度">
          <el-select v-model="query.granularity" style="width: 120px" @change="handleSearch">
            <el-option label="按日" value="day" />
            <el-option label="按周" value="week" />
          </el-select>
        </el-form-item>

        <el-form-item label="趋势指标">
          <el-select v-model="query.metric" style="width: 150px" @change="handleSearch">
            <el-option label="完成任务数" value="finishedTasks" />
            <el-option label="总任务数" value="totalTasks" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <!-- 顶部KPI（summary） -->
      <div class="mb-3 kpi-row-wrap">
        <el-row :gutter="12" class="kpi-row">
          <el-col :xs="24" :sm="8" :md="4">
            <el-card shadow="never" class="kpi-card">
              <div class="kpi-title">总任务</div>
              <div class="kpi-value">{{ summary.totalTasks }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8" :md="4">
            <el-card shadow="never" class="kpi-card">
              <div class="kpi-title">已完成</div>
              <div class="kpi-value">{{ summary.finishedTasks }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8" :md="4">
            <el-card shadow="never" class="kpi-card">
              <div class="kpi-title">进行中</div>
              <div class="kpi-value">{{ summary.unfinishedTasks }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8" :md="4">
            <el-card shadow="never" class="kpi-card">
              <div class="kpi-title">完成率</div>
              <div class="kpi-value">{{ formatRate(summary.finishRate) }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8" :md="4">
            <el-card shadow="never" class="kpi-card">
              <div class="kpi-title">取件</div>
              <div class="kpi-value">{{ summary.pickupTasks }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8" :md="4">
            <el-card shadow="never" class="kpi-card">
              <div class="kpi-title">送件</div>
              <div class="kpi-value">{{ summary.deliveryTasks }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 趋势图（trend）
        这里先用表格形式展示趋势点，避免强依赖 ECharts。
        如果你希望做成折线图，我可以基于你项目现有 ECharts 组件快速替换。
      -->
      <el-card shadow="never" class="mb-3">
        <template #header>
          <div class="flex items-center justify-between">
            <span>趋势</span>
            <el-tag type="info">{{ query.granularity === "day" ? "按日" : "按周" }}</el-tag>
          </div>
        </template>

        <el-table v-loading="trendLoading" :data="trend" class="w-full" size="small">
          <el-table-column prop="date" label="日期" width="140" />
          <el-table-column prop="value" label="数量" />
        </el-table>
        <el-empty
          v-if="!trendLoading && trend.length === 0"
          description="暂无趋势数据"
          class="py-6"
        />
      </el-card>

      <el-row :gutter="12">
        <!-- 骑手排行榜（riders） -->
        <el-col :xs="24" :sm="12">
          <el-card shadow="never">
            <template #header>
              <div class="flex items-center justify-between">
                <span>骑手排行</span>
                <div class="flex items-center gap-2">
                  <el-select
                    v-model="ridersTable.sortBy"
                    style="width: 150px"
                    @change="handleRidersSearch"
                  >
                    <el-option label="完成任务数" value="finishedTasks" />
                    <el-option label="完成率" value="finishRate" />
                    <el-option label="总任务数" value="totalTasks" />
                  </el-select>
                  <el-select
                    v-model="ridersTable.sortOrder"
                    style="width: 120px"
                    @change="handleRidersSearch"
                  >
                    <el-option label="降序" value="desc" />
                    <el-option label="升序" value="asc" />
                  </el-select>
                </div>
              </div>
            </template>

            <el-table
              v-loading="ridersLoading"
              :data="ridersTable.data"
              class="w-full"
              @row-click="handleClickRiderRow"
            >
              <el-table-column prop="riderId" label="ID" width="80" />
              <el-table-column prop="riderName" label="骑手" min-width="140" />
              <el-table-column prop="finishedTasks" label="完成" width="90" />
              <el-table-column prop="totalTasks" label="总数" width="90" />
              <el-table-column label="完成率" width="110">
                <template #default="{ row }">{{ formatRate(row.finishRate) }}</template>
              </el-table-column>
            </el-table>

            <el-empty
              v-if="!ridersLoading && ridersTable.data.length === 0"
              description="暂无排行数据"
              class="py-6"
            />

            <div class="mt-4 flex justify-end">
              <el-pagination
                v-model:current-page="ridersTable.page"
                v-model:page-size="ridersTable.pageSize"
                :total="ridersTable.total"
                layout="total, prev, pager, next"
              />
            </div>
          </el-card>
        </el-col>

        <!-- 任务明细（tasks） -->
        <el-col :xs="24" :sm="12">
          <el-card shadow="never">
            <template #header>
              <div class="flex items-center justify-between">
                <span>任务明细</span>
                <div class="flex items-center gap-2">
                  <el-input
                    v-model="tasksTable.keyword"
                    clearable
                    placeholder="订单号/楼栋/地址/骑手"
                    style="width: 220px"
                    @keyup.enter="handleTasksSearch"
                  />
                  <el-select
                    v-model="tasksTable.status"
                    clearable
                    placeholder="状态"
                    style="width: 140px"
                    :disabled="query.onlyFinished === 1"
                    @change="handleTasksSearch"
                  >
                    <el-option label="进行中" :value="0" />
                    <el-option label="已完成" :value="1" />
                  </el-select>
                </div>
              </div>
            </template>

            <el-table v-loading="tasksLoading" :data="tasksTable.data" class="w-full">
              <el-table-column prop="taskId" label="任务ID" width="90" />
              <el-table-column prop="orderSn" label="订单号" min-width="150" />
              <el-table-column label="类型" width="90">
                <template #default="{ row }">
                  <el-tag :type="row.taskType === 1 ? 'warning' : 'info'">
                    {{ row.taskType === 1 ? "取件" : "送件" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'">
                    {{ row.status === 1 ? "已完成" : "进行中" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="building" label="楼栋" width="110" />
              <el-table-column prop="createTime" label="创建时间" min-width="160" />
            </el-table>

            <el-empty
              v-if="!tasksLoading && tasksTable.data.length === 0"
              description="暂无任务明细"
              class="py-6"
            />

            <div class="mt-4 flex justify-end">
              <el-pagination
                v-model:current-page="tasksTable.page"
                v-model:page-size="tasksTable.pageSize"
                :total="tasksTable.total"
                layout="total, prev, pager, next"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

import RiderAPI from "@/api/rider";

import type {
  AdminRiderListItem,
  AdminRiderPerformanceRiderVO,
  AdminRiderPerformanceSummaryVO,
  AdminRiderPerformanceTaskVO,
  AdminRiderPerformanceTrendPointVO,
  RiderPerformanceGranularity,
  RiderPerformanceMetric,
} from "@/api/rider";

defineOptions({
  name: "RiderPerformance",
  inheritAttrs: false,
});

// 类型定义已沉淀到 src/api/rider.ts，页面侧只做引用，减少重复维护。

// ============================================
// 状态
// ============================================

const query = reactive({
  // 按文档：startDate/endDate 必填
  startDate: "" as string,
  endDate: "" as string,

  riderId: undefined as number | undefined,
  taskType: undefined as 1 | 2 | undefined,

  // onlyFinished=1 为默认口径：全页统计都只看完成
  onlyFinished: 1 as 0 | 1,

  granularity: "day" as RiderPerformanceGranularity,
  metric: "finishedTasks" as RiderPerformanceMetric,
});

const summary = reactive<AdminRiderPerformanceSummaryVO>({
  totalTasks: 0,
  finishedTasks: 0,
  unfinishedTasks: 0,
  finishRate: 0,
  pickupTasks: 0,
  deliveryTasks: 0,
});

const trend = ref<AdminRiderPerformanceTrendPointVO[]>([]);
const trendLoading = ref(false);

const ridersOptions = ref<AdminRiderListItem[]>([]);
const ridersOptionsLoading = ref(false);

const ridersLoading = ref(false);
const ridersTable = reactive({
  data: [] as AdminRiderPerformanceRiderVO[],
  page: 1,
  pageSize: 10,
  total: 0,
  sortBy: "finishedTasks" as "finishedTasks" | "finishRate" | "totalTasks",
  sortOrder: "desc" as "asc" | "desc",
});

const tasksLoading = ref(false);
const tasksTable = reactive({
  data: [] as AdminRiderPerformanceTaskVO[],
  page: 1,
  pageSize: 10,
  total: 0,
  keyword: "",
  status: undefined as 0 | 1 | undefined,
});

function getTodayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getMonthStartYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}

function formatRate(val: number) {
  const n = Number(val ?? 0);
  if (!Number.isFinite(n)) return "-";
  return `${(n * 100).toFixed(2)}%`;
}

function getRiderLabel(rider: AdminRiderListItem) {
  const name = rider.nickname || rider.username;
  return rider.phone ? `${name} (${rider.phone})` : name;
}

function assertQueryReady() {
  if (!query.startDate || !query.endDate) {
    ElMessage.warning("请选择开始日期和结束日期");
    return false;
  }
  return true;
}

// ============================================
// API 请求
// ============================================

async function fetchRiderOptions() {
  ridersOptionsLoading.value = true;
  try {
    // 复用已有“骑手列表”接口作为下拉选项来源；避免为下拉再开新接口。
    const data = await RiderAPI.getAdminRiderList({ page: 1, size: 200 });
    ridersOptions.value = data.records ?? [];
  } catch (e: any) {
    ridersOptions.value = [];
    ElMessage.error(e?.message || "获取骑手列表失败");
  } finally {
    ridersOptionsLoading.value = false;
  }
}

async function fetchSummary() {
  if (!assertQueryReady()) return;
  try {
    const data = await RiderAPI.getAdminRiderPerformanceSummary({
      startDate: query.startDate,
      endDate: query.endDate,
      riderId: query.riderId,
      taskType: query.taskType,
      onlyFinished: query.onlyFinished,
    });

    summary.totalTasks = data.totalTasks ?? 0;
    summary.finishedTasks = data.finishedTasks ?? 0;
    summary.unfinishedTasks = data.unfinishedTasks ?? 0;
    summary.finishRate = data.finishRate ?? 0;
    summary.pickupTasks = data.pickupTasks ?? 0;
    summary.deliveryTasks = data.deliveryTasks ?? 0;
  } catch (e: any) {
    ElMessage.error(e?.message || "获取汇总数据失败");
  }
}

async function fetchTrend() {
  if (!assertQueryReady()) return;
  trendLoading.value = true;
  try {
    const data = await RiderAPI.getAdminRiderPerformanceTrend({
      startDate: query.startDate,
      endDate: query.endDate,
      riderId: query.riderId,
      taskType: query.taskType,
      onlyFinished: query.onlyFinished,
      granularity: query.granularity,
      metric: query.metric,
    });

    trend.value = data ?? [];
  } catch (e: any) {
    trend.value = [];
    ElMessage.error(e?.message || "获取趋势数据失败");
  } finally {
    trendLoading.value = false;
  }
}

async function fetchRiders() {
  if (!assertQueryReady()) return;
  ridersLoading.value = true;
  try {
    const data = await RiderAPI.getAdminRiderPerformanceRiders({
      startDate: query.startDate,
      endDate: query.endDate,
      taskType: query.taskType,
      onlyFinished: query.onlyFinished,
      page: ridersTable.page,
      pageSize: ridersTable.pageSize,
      sortBy: ridersTable.sortBy,
      sortOrder: ridersTable.sortOrder,
    });

    ridersTable.data = data.records ?? [];
    ridersTable.total = data.total ?? 0;
  } catch (e: any) {
    ridersTable.data = [];
    ridersTable.total = 0;
    ElMessage.error(e?.message || "获取骑手排行失败");
  } finally {
    ridersLoading.value = false;
  }
}

async function fetchTasks() {
  if (!assertQueryReady()) return;
  tasksLoading.value = true;
  try {
    const data = await RiderAPI.getAdminRiderPerformanceTasks({
      startDate: query.startDate,
      endDate: query.endDate,
      riderId: query.riderId,
      taskType: query.taskType,
      onlyFinished: query.onlyFinished,
      status: query.onlyFinished === 1 ? undefined : tasksTable.status,
      keyword: tasksTable.keyword || undefined,
      page: tasksTable.page,
      pageSize: tasksTable.pageSize,
    });

    tasksTable.data = data.records ?? [];
    tasksTable.total = data.total ?? 0;
  } catch (e: any) {
    tasksTable.data = [];
    tasksTable.total = 0;
    ElMessage.error(e?.message || "获取任务明细失败");
  } finally {
    tasksLoading.value = false;
  }
}

async function fetchAll() {
  if (!assertQueryReady()) return;

  // 按文档建议：并行拉取 4 个接口，提高首屏速度
  await Promise.all([fetchSummary(), fetchTrend(), fetchRiders(), fetchTasks()]);
}

// ============================================
// 交互
// ============================================

function handleSearch() {
  ridersTable.page = 1;
  tasksTable.page = 1;
  void fetchAll();
}

function handleRidersSearch() {
  ridersTable.page = 1;
  fetchRiders();
}

function handleTasksSearch() {
  tasksTable.page = 1;
  fetchTasks();
}

function handleRefresh() {
  fetchAll();
}

function handleReset() {
  query.startDate = getMonthStartYYYYMMDD();
  query.endDate = getTodayYYYYMMDD();
  query.onlyFinished = 1;
  query.taskType = undefined;
  query.riderId = undefined;
  query.granularity = "day";
  query.metric = "finishedTasks";

  ridersTable.page = 1;
  ridersTable.pageSize = 10;
  ridersTable.sortBy = "finishedTasks";
  ridersTable.sortOrder = "desc";

  tasksTable.page = 1;
  tasksTable.pageSize = 10;
  tasksTable.keyword = "";
  tasksTable.status = undefined;

  fetchAll();
}

function handleClickRiderRow(row: AdminRiderPerformanceRiderVO) {
  // 文档推荐交互：点击骑手行 -> 带 riderId 重新请求 4 个接口，实现联动。
  query.riderId = row.riderId;
  handleSearch();
}

watch(
  () => [ridersTable.page, ridersTable.pageSize],
  () => {
    fetchRiders();
  }
);

watch(
  () => [tasksTable.page, tasksTable.pageSize],
  () => {
    fetchTasks();
  }
);

onMounted(() => {
  // 默认展示“本月到今天”，并保持 onlyFinished=1 与后端默认一致。
  query.startDate = getMonthStartYYYYMMDD();
  query.endDate = getTodayYYYYMMDD();

  fetchRiderOptions();
  fetchAll();
});
</script>

<style scoped>
.rider-performance-page {
  /*
    部分浏览器在“非整数缩放(如125%) + el-row gutter 负 margin”的组合下
    会出现 1-2px 的横向溢出，表现为页面出现滚动条。
    此处只对本页面做兜底裁剪，避免影响全局布局。
  */
  overflow-x: hidden;
}

.rider-performance-page :deep(.el-card__body) {
  /*
    你反馈滚动条出现在“卡片内部”。
    Element Plus 的 el-card / el-table 在特定列宽/缩放下可能产生 1px 横向溢出，导致卡片 body 出现滚动条。
    这里对本页面的所有卡片 body 统一禁止横向滚动，只保留纵向滚动能力。
  */
  overflow-x: hidden;
}

.kpi-row-wrap {
  /*
    Element Plus 的 el-row 为实现 gutter 会使用负 margin。
    在某些布局/缩放下，这会导致父容器产生横向溢出滚动条。
    这里对 KPI 行做一次“局部裁剪”，只影响这一段，不影响整页。
  */
  overflow-x: hidden;
}

.kpi-row {
  margin-right: 0 !important;
  margin-left: 0 !important;
}

.kpi-card {
  height: 86px;
}

.kpi-card :deep(.el-card__body) {
  overflow-x: hidden;
}

.kpi-title {
  font-size: 13px;
  color: #606266;
}

.kpi-value {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 600;
}
</style>
