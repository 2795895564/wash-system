import request from "@/utils/request";
import type { CreateOrderRequest, CreateOrderResponse } from "@/api/order";

export interface DashboardStatistics {
  todayOrderCount: number;
  todayIncome: number;
  pendingOrderCount: number;
  riderTodayFinishCount: number;
}

export interface OrderTrendItem {
  date: string;
  orderCount: number;
  orderAmount: number;
}

export type OrderTrendResponse = OrderTrendItem[];

export interface IncomeCompositionItem {
  categoryName: string;
  amount: number;
}

export type IncomeCompositionResponse = IncomeCompositionItem[];

export interface RiderRankingItem {
  riderId?: number;
  riderName: string;
  finishCount: number;
  deliveryFee: number;
}

export type RiderRankingResponse = RiderRankingItem[];

const DASHBOARD_BASE_URL = "/api/admin/dashboard";

const DashboardAPI = {
  /** 获取仪表盘统计数据 */
  getStatistics() {
    return request<DashboardStatistics, DashboardStatistics>({
      url: `${DASHBOARD_BASE_URL}/statistics`,
      method: "get",
    });
  },

  /** 获取近N天订单趋势 */
  getOrderTrend(days?: number) {
    return request<OrderTrendResponse, OrderTrendResponse>({
      url: `${DASHBOARD_BASE_URL}/order-trend`,
      method: "get",
      params: days ? { days } : undefined,
    });
  },

  /** 获取收入构成（按服务分类） */
  getIncomeComposition() {
    return request<IncomeCompositionResponse, IncomeCompositionResponse>({
      url: `${DASHBOARD_BASE_URL}/income-composition`,
      method: "get",
    });
  },

  /** 获取骑手业绩排行 */
  getRiderRanking(params?: { top?: number; date?: string }) {
    return request<RiderRankingResponse, RiderRankingResponse>({
      url: `${DASHBOARD_BASE_URL}/rider-ranking`,
      method: "get",
      params,
    });
  },

  /** 新建订单（模拟下单） */
  createOrder(data: CreateOrderRequest) {
    return request<CreateOrderResponse, CreateOrderResponse, CreateOrderRequest>({
      url: "/api/admin/orders",
      method: "post",
      data,
    });
  },
};

export default DashboardAPI;
