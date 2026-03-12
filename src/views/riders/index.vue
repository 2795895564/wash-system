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
        <el-form-item label="日期">
          <el-date-picker
            v-model="date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            @change="handleSearch"
          />
        </el-form-item>

        <el-form-item label="Top">
          <el-input-number v-model="top" :min="1" :max="100" @change="handleSearch" />
        </el-form-item>
      </el-form>

      <el-alert v-if="notice" :title="notice" type="info" show-icon class="mb-3" />

      <el-table v-loading="loading" :data="tableData" class="w-full">
        <el-table-column prop="riderId" label="骑手ID" width="90" />
        <el-table-column prop="riderName" label="骑手" min-width="140" />
        <el-table-column prop="finishCount" label="完成单数" width="110" />
        <el-table-column prop="deliveryFee" label="配送费(元)" width="120" />
      </el-table>

      <el-empty
        v-if="!loading && tableData.length === 0"
        :description="emptyDescription"
        class="py-8"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import DashboardAPI from "@/api/dashboard";
import type { RiderRankingItem } from "@/types/api";

defineOptions({
  name: "Riders",
  inheritAttrs: false,
});

const route = useRoute();
const router = useRouter();

const date = ref<string>("");
const top = ref<number>(5);

const filtersVisible = ref(true);
const showFilterToggle = computed(() => true);

const pageTitle = computed(() => {
  const q = route.query;
  const range = typeof q.range === "string" ? q.range : "";
  if (range === "today") return "今日骑手业绩";
  return "骑手管理";
});

const notice = computed(() => {
  const from = route.query.from;
  return from === "dashboard" ? "已从仪表盘跳转，已为你自动带入筛选条件。" : "";
});

const emptyDescription = computed(() => {
  const q = route.query;
  const range = typeof q.range === "string" ? q.range : "";
  if (range === "today") {
    return "今日暂无骑手业绩数据";
  }
  return "暂无骑手业绩数据";
});

const loading = ref(false);
const tableData = ref<RiderRankingItem[]>([]);

function getTodayYYYYMMDD() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildApiParams() {
  const q = route.query;
  const range = typeof q.range === "string" ? q.range : "";
  const qDate = typeof q.date === "string" ? q.date : "";
  const qTop = typeof q.top === "string" ? Number(q.top) : typeof q.top === "number" ? q.top : NaN;
  const topVal = Number.isFinite(qTop) && qTop > 0 ? qTop : top.value;

  const dateVal = qDate || (range === "today" ? getTodayYYYYMMDD() : date.value);

  return {
    top: topVal,
    date: dateVal || undefined,
  };
}

async function fetchRanking() {
  loading.value = true;
  try {
    const res = await DashboardAPI.getRiderRanking(buildApiParams());
    tableData.value = res ?? [];
  } catch (e: any) {
    tableData.value = [];
    ElMessage.error(e?.message || "获取骑手业绩排行失败");
  } finally {
    loading.value = false;
  }
}

function setQuery(next: Record<string, any>) {
  router.replace({
    path: "/riders",
    query: {
      ...route.query,
      ...next,
    },
  });
}

function applyQueryToForm() {
  const q = route.query;

  const qDate = typeof q.date === "string" ? q.date : "";
  const range = typeof q.range === "string" ? q.range : "";

  if (qDate) {
    date.value = qDate;
  } else if (range === "today") {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    date.value = `${yyyy}-${mm}-${dd}`;
  } else {
    date.value = "";
  }

  const qTop = typeof q.top === "string" ? Number(q.top) : typeof q.top === "number" ? q.top : NaN;
  top.value = Number.isFinite(qTop) && qTop > 0 ? qTop : 5;

  // 从仪表盘跳转后：默认直接展示“今日”视图，筛选区收起但可展开。
  const from = typeof q.from === "string" ? q.from : "";
  if (from === "dashboard") {
    filtersVisible.value = false;
  }
}

function handleSearch() {
  setQuery({
    date: date.value || undefined,
    top: top.value || undefined,
    range: undefined,
    from: "dashboard",
  });
}

function handleReset() {
  date.value = "";
  top.value = 5;
  router.replace({ path: "/riders", query: {} });
}

watch(
  () => route.query,
  () => {
    applyQueryToForm();
    fetchRanking();
  },
  { immediate: true }
);

onMounted(() => {
  fetchRanking();
});
</script>
