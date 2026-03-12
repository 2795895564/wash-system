<template>
  <div class="dashboard-container">
    <!-- github 角标 -->
    <github-corner class="github-corner" />

    <el-card shadow="never" class="mt-2">
      <div class="flex flex-wrap">
        <!-- 左侧问候语区域 -->
        <div class="flex-1 flex items-start">
          <div style="width: 80px; height: 80px; overflow: hidden; border-radius: 50%">
            <img
              :src="userStore.userInfo.avatar + '?imageView2/1/w/80/h/80'"
              class="w80px h80px rounded-full"
              style="width: 100%; height: 100%; object-fit: cover; object-position: center"
            />
          </div>
          <div class="ml-5">
            <p>{{ greetings }}</p>
            <p class="text-sm text-gray">今日天气晴朗，气温在15℃至25℃之间，东南风。</p>
          </div>
        </div>

        <!-- 右侧图标区域 - PC端-->
        <div class="hidden sm:block">
          <div class="flex items-end space-x-6">
            <!-- 仓库 -->
            <div>
              <div class="font-bold color-#ff9a2e text-sm flex items-center">
                <el-icon class="mr-2px"><Folder /></el-icon>
                仓库
              </div>
              <div class="mt-3 whitespace-nowrap">
                <el-link href="https://gitee.com/youlaiorg/vue3-element-admin" target="_blank">
                  <div class="i-svg:gitee text-lg color-#F76560" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://github.com/youlaitech/vue3-element-admin" target="_blank">
                  <div class="i-svg:github text-lg color-#4080FF" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://gitcode.com/youlai/vue3-element-admin" target="_blank">
                  <div class="i-svg:gitcode text-lg color-#FF9A2E" />
                </el-link>
              </div>
            </div>

            <!-- 文档 -->
            <div>
              <div class="font-bold color-#4080ff text-sm flex items-center">
                <el-icon class="mr-2px"><Document /></el-icon>
                文档
              </div>
              <div class="mt-3 whitespace-nowrap">
                <el-link href="https://juejin.cn/post/7228990409909108793" target="_blank">
                  <div class="i-svg:juejin text-lg" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link
                  href="https://youlai.blog.csdn.net/article/details/130191394"
                  target="_blank"
                >
                  <div class="i-svg:csdn text-lg" />
                </el-link>
                <el-divider direction="vertical" />
                <el-link href="https://www.cnblogs.com/haoxianrui/p/17331952.html" target="_blank">
                  <div class="i-svg:cnblogs text-lg" />
                </el-link>
              </div>
            </div>

            <!-- 视频 -->
            <div>
              <div class="font-bold color-#f76560 text-sm flex items-center">
                <el-icon class="mr-2px"><VideoCamera /></el-icon>
                视频
              </div>
              <div class="mt-3 whitespace-nowrap">
                <el-link href="https://www.bilibili.com/video/BV1eFUuYyEFj" target="_blank">
                  <div class="i-svg:bilibili text-lg" />
                </el-link>
              </div>
            </div>
          </div>
        </div>

        <!-- 移动端图标区域-->
        <div class="w-full sm:hidden mt-3">
          <div class="flex justify-end space-x-4 overflow-x-auto">
            <!-- 仓库图标 -->
            <el-link href="https://gitee.com/youlaiorg/vue3-element-admin" target="_blank">
              <div class="i-svg:gitee text-lg color-#F76560" />
            </el-link>
            <el-link href="https://github.com/youlaitech/vue3-element-admin" target="_blank">
              <div class="i-svg:github text-lg color-#4080FF" />
            </el-link>
            <el-link href="https://gitcode.com/youlai/vue3-element-admin" target="_blank">
              <div class="i-svg:gitcode text-lg color-#FF9A2E" />
            </el-link>

            <!-- 文档图标 -->
            <el-link href="https://juejin.cn/post/7228990409909108793" target="_blank">
              <div class="i-svg:juejin text-lg" />
            </el-link>
            <el-link href="https://youlai.blog.csdn.net/article/details/130191394" target="_blank">
              <div class="i-svg:csdn text-lg" />
            </el-link>
            <el-link href="https://www.cnblogs.com/haoxianrui/p/17331952.html" target="_blank">
              <div class="i-svg:cnblogs text-lg" />
            </el-link>

            <!-- 视频图标 -->
            <el-link href="https://www.bilibili.com/video/BV1eFUuYyEFj" target="_blank">
              <div class="i-svg:bilibili text-lg" />
            </el-link>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 数据统计 -->
    <el-row :gutter="10" class="mt-5">
      <el-col :span="6" :xs="24" class="mb-xs-3">
        <DashboardCard
          title="今日订单数"
          :value="todayOrderCount"
          tag-text="今日"
          tag-type="primary"
          clickable
          format-w
          @click="handleGotoTodayOrders"
        />
      </el-col>

      <el-col :span="6" :xs="24" class="mb-xs-3">
        <DashboardCard
          title="今日收入"
          :value="todayIncome"
          value-type="money"
          tag-text="完成"
          tag-type="success"
          clickable
          @click="handleGotoTodayIncomeOrders"
        />
      </el-col>

      <el-col :span="6" :xs="24" class="mb-xs-3">
        <DashboardCard
          title="待处理订单数"
          :value="pendingOrderCount"
          tag-text="待处理"
          tag-type="warning"
          clickable
          format-w
          @click="handleGotoPendingOrders"
        />
      </el-col>

      <el-col :span="6" :xs="24">
        <DashboardCard
          title="骑手今日完成单数"
          :value="riderTodayFinishCount"
          tag-text="今日"
          tag-type="info"
          clickable
          format-w
          @click="handleGotoRiderRanking"
        />
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mt-5">
      <!-- 访问趋势统计图-->
      <el-col :xs="24" :span="16">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span>近7天订单趋势</span>
              <el-radio-group v-model="orderTrendDateRange" size="small">
                <el-radio-button label="按日" :value="'day'" />
                <el-radio-button label="按周" :value="'week'" disabled />
                <el-radio-button label="按月" :value="'month'" disabled />
              </el-radio-group>
            </div>
          </template>
          <div v-if="!orderTrendChartOptions" class="py-12">
            <el-empty description="暂无趋势数据" />
          </div>
          <ECharts v-else :options="orderTrendChartOptions" height="400px" />
        </el-card>
      </el-col>
      <!-- 最新动态-->
      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span class="header-title">收入构成</span>
            </div>
          </template>

          <div v-if="!incomeCompositionChartOptions" class="py-12">
            <el-empty description="暂无收入构成数据" />
          </div>
          <ECharts v-else :options="incomeCompositionChartOptions" height="400px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="10" class="mt-5">
      <el-col :xs="24" :span="16">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span>骑手业绩排行</span>
            </div>
          </template>
          <div v-if="!riderRankingChartOptions" class="py-12">
            <el-empty description="暂无排行数据" />
          </div>
          <ECharts v-else :options="riderRankingChartOptions" height="400px" />
        </el-card>
      </el-col>

      <el-col :xs="24" :span="8">
        <el-card>
          <template #header>
            <div class="flex-x-between">
              <span>快捷操作</span>
            </div>
          </template>

          <div class="flex flex-col gap-3">
            <el-button type="primary" size="large" @click="handleCreateOrder">新建订单</el-button>
            <el-button type="warning" size="large" @click="handleAssignRider">指派骑手</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
defineOptions({
  name: "Dashboard",
  inheritAttrs: false,
});

import { computed, onMounted, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { useRouter } from "vue-router";
import DashboardAPI from "@/api/dashboard";
import OrderAPI from "@/api/order";
import type { CreateOrderRequest } from "@/api/order";
import type {
  IncomeCompositionResponse,
  OrderTrendResponse,
  RiderRankingResponse,
} from "@/api/dashboard";
import DashboardCard from "./components/DashboardCard.vue";
import type { EChartsCoreOption } from "echarts/core";
import { formatCurrency } from "@/utils/format";
import { ElMessage } from "element-plus";

const router = useRouter();

const userStore = useUserStore();

// 当前时间（用于计算问候语）
const currentDate = new Date();

// 问候语：根据当前小时返回不同问候语
const greetings = computed(() => {
  const hours = currentDate.getHours();
  const nickname = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) {
    return "晨起披衣出草堂，轩窗已自喜微凉🌅！";
  } else if (hours >= 8 && hours < 12) {
    return `上午好，${nickname}！`;
  } else if (hours >= 12 && hours < 18) {
    return `下午好，${nickname}！`;
  } else if (hours >= 18 && hours < 24) {
    return `晚上好，${nickname}！`;
  } else {
    return "偷偷向银河要了一把碎星，只等你闭上眼睛撒入你的梦中，晚安🌛！";
  }
});

const todayOrderCount = ref(0);
const todayIncome = ref(0);
const pendingOrderCount = ref(0);
const riderTodayFinishCount = ref(0);

const orderTrendDateRange = ref<"day" | "week" | "month">("day");
const orderTrendChartOptions = ref<EChartsCoreOption>();
const incomeCompositionChartOptions = ref<EChartsCoreOption>();
const riderRankingChartOptions = ref<EChartsCoreOption>();

const createOrderVisible = ref(false);
const createOrderSubmitting = ref(false);
const createOrderFormRef = ref<FormInstance>();

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

function buildOrderTrendOptions(list: OrderTrendResponse) {
  const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
  const xAxisData = sorted.map((i) => i.date.slice(5));
  const orderCountData = sorted.map((i) => i.orderCount);
  const orderAmountData = sorted.map((i) => i.orderAmount);

  return {
    tooltip: {
      trigger: "axis",
      formatter: (params: any[]) => {
        const map = new Map(params.map((p) => [p.seriesName, p.value]));
        const orderCount = Number(map.get("订单量") ?? 0);
        const orderAmount = Number(map.get("交易额") ?? 0);
        const date = params?.[0]?.axisValue ?? "";
        return `${date}<br/>订单量：${orderCount}<br/>交易额：${formatCurrency(orderAmount)}`;
      },
    },
    legend: {
      data: ["订单量", "交易额"],
    },
    grid: {
      left: 40,
      right: 40,
      top: 40,
      bottom: 40,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
    },
    yAxis: [
      {
        type: "value",
        name: "订单量",
      },
      {
        type: "value",
        name: "交易额",
      },
    ],
    series: [
      {
        name: "订单量",
        type: "line",
        smooth: true,
        data: orderCountData,
      },
      {
        name: "交易额",
        type: "line",
        smooth: true,
        yAxisIndex: 1,
        data: orderAmountData,
      },
    ],
  };
}

function buildIncomeCompositionOptions(list: IncomeCompositionResponse) {
  const seriesData = list.map((i: { categoryName: string; amount: number }) => ({
    name: i.categoryName,
    value: i.amount,
  }));

  return {
    tooltip: {
      trigger: "item",
      formatter: (params: any) => {
        const value = Number(params?.value ?? 0);
        const percent = params?.percent ?? 0;
        return `${params?.name}<br/>${formatCurrency(value)} (${percent}%)`;
      },
    },
    legend: {
      show: true,
      type: "scroll",
      bottom: 0,
      selectedMode: true,
    },
    series: [
      {
        name: "收入构成",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: true,
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
          },
        },
        data: seriesData,
      },
    ],
  };
}

function buildRiderRankingOptions(list: RiderRankingResponse) {
  const sorted = [...list].sort((a, b) => b.finishCount - a.finishCount);
  const yAxisData = sorted.map((i) => i.riderName);
  const finishCountData = sorted.map((i) => i.finishCount);
  const deliveryFeeData = sorted.map((i) => i.deliveryFee);

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any[]) => {
        const map = new Map(params.map((p) => [p.seriesName, p.value]));
        const finishCount = Number(map.get("完成单数") ?? 0);
        const deliveryFee = Number(map.get("配送费收入") ?? 0);
        return `${params?.[0]?.name}<br/>完成单数：${finishCount}<br/>配送费收入：${formatCurrency(deliveryFee)}`;
      },
    },
    legend: {
      data: ["完成单数", "配送费收入"],
    },
    grid: {
      left: 40,
      right: 40,
      top: 40,
      bottom: 40,
      containLabel: true,
    },
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      data: yAxisData,
    },
    series: [
      {
        name: "完成单数",
        type: "bar",
        data: finishCountData,
      },
      {
        name: "配送费收入",
        type: "bar",
        data: deliveryFeeData,
      },
    ],
  };
}

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
    router.push({ path: "/orders", query: { orderSn: resp.orderSn } });
  } finally {
    createOrderSubmitting.value = false;
  }
}

function handleGotoTodayOrders() {
  router.push({ path: "/orders", query: { range: "today", from: "dashboard" } });
}

function handleGotoTodayIncomeOrders() {
  router.push({ path: "/orders", query: { range: "today", paid: "1", from: "dashboard" } });
}

function handleGotoPendingOrders() {
  router.push({
    path: "/orders",
    query: { status: "pending", statusList: "0,30", from: "dashboard" },
  });
}

function handleGotoRiderRanking() {
  router.push({ path: "/riders", query: { range: "today", from: "dashboard" } });
}

function handleAssignRider() {
  router.push({ name: "AssignRider", query: { mode: "manual" } });
}

// 组件挂载后加载访客统计数据和通知公告数据
onMounted(async () => {
  const [statsRes, trendRes, compositionRes, rankingRes] = await Promise.allSettled([
    DashboardAPI.getStatistics(),
    DashboardAPI.getOrderTrend(7),
    DashboardAPI.getIncomeComposition(),
    DashboardAPI.getRiderRanking({ top: 5 }),
  ]);

  if (statsRes.status === "fulfilled") {
    todayOrderCount.value = statsRes.value.todayOrderCount;
    todayIncome.value = statsRes.value.todayIncome;
    pendingOrderCount.value = statsRes.value.pendingOrderCount;
    riderTodayFinishCount.value = statsRes.value.riderTodayFinishCount;
  } else {
    ElMessage.error("获取仪表盘统计数据失败");
  }

  if (trendRes.status === "fulfilled") {
    const trend = trendRes.value;
    orderTrendChartOptions.value = trend.length ? buildOrderTrendOptions(trend) : undefined;
  } else {
    orderTrendChartOptions.value = undefined;
  }

  if (compositionRes.status === "fulfilled") {
    const composition = compositionRes.value;
    incomeCompositionChartOptions.value = composition.length
      ? buildIncomeCompositionOptions(composition)
      : undefined;
  } else {
    incomeCompositionChartOptions.value = undefined;
  }

  if (rankingRes.status === "fulfilled") {
    const ranking = rankingRes.value;
    riderRankingChartOptions.value = ranking.length ? buildRiderRankingOptions(ranking) : undefined;
  } else {
    riderRankingChartOptions.value = undefined;
  }
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  position: relative;
  padding: 24px;

  .github-corner {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    border: 0;
  }

  .version-item {
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    transition: all 0.2s;

    &.latest-item {
      background: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-5);
    }
    &:hover {
      transform: translateX(5px);
    }
    .version-content {
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
