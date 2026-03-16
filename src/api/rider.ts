import request from "@/utils/request";

export type RiderHallListType = "TASK" | "WAIT_ASSIGN";

export interface AdminRiderHallMetricsResponse {
  waitAssignCount: number;
  inProgressCount: number;
  doneCount: number;
}

export interface AdminRiderHallTaskListParams {
  /** TASK：delivery_task 列表；WAIT_ASSIGN：订单推导的待指派列表 */
  listType?: RiderHallListType;
  page?: number;
  size?: number;
  /** 1-取件 2-送回 */
  taskType?: 1 | 2;

  /** TASK 模式：任务状态集合，逗号分隔（0,1） */
  taskStatusList?: string;
  /** TASK 模式：关键词（订单号/楼栋/地址/骑手昵称/手机号）；WAIT_ASSIGN 模式：订单号/楼栋/地址 */
  keyword?: string;
  /** 创建日期起止：YYYY-MM-DD */
  startDate?: string;
  endDate?: string;

  /** TASK 模式：骑手ID */
  riderId?: number;
  /** TASK 模式：订单ID */
  orderId?: number;
}

export interface AdminRiderHallTaskListItem {
  /** WAIT_ASSIGN 时 taskId 为 null */
  taskId: number | null;
  taskStatus: number | "WAIT_ASSIGN";
  orderId: number;
  orderSn: string;
  /** 1-取件 2-送回 */
  taskType: 1 | 2;
  /** TASK：delivery_task.status (0/1)；WAIT_ASSIGN：固定 WAIT_ASSIGN */
  taskStatusRaw?: number | "WAIT_ASSIGN";

  deliveryFee?: number;
  createTime: string;
  finishTime?: string | null;
  building?: string;
  address?: string;
  appointmentTime?: string;
  orderStatus?: number;

  riderId?: number;
  riderName?: string;
  riderPhone?: string;

  totalPrice?: number;
  fromAddress?: string;
  toAddress?: string;
}

export interface AdminRiderHallTaskListResponse {
  records: AdminRiderHallTaskListItem[];
  total: number;
  pages: number;
}

export interface AdminRiderHallTaskDetailEvent {
  eventId: number;
  eventName: string;
  nodeStatus: number;
  operatorId?: number;
  remark?: string | null;
  eventTime: string;
}

export interface AdminRiderHallTaskDetailResponse {
  task: {
    id: number;
    orderId: number;
    riderId: number;
    taskType: 1 | 2;
    fee: number;
    status: 0 | 1;
    photoUrl?: string | null;
    finishTime?: string | null;
    createTime: string;
  };
  detail: {
    id: number;
    taskType: 1 | 2;
    fee: number;
    photoUrl?: string | null;
    finishTime?: string | null;
    orderId: number;
    orderSn: string;
    building?: string;
    address?: string;
    appointmentTime?: string;
    orderStatus?: number;
    createTime: string;
    remark?: string;
    totalPrice?: number;
  };
  rider?: {
    riderId: number;
    riderName: string;
    riderPhone?: string;
  };
  events?: AdminRiderHallTaskDetailEvent[];
}

export interface AdminRiderHallAssignRequest {
  orderId: number;
  riderId: number;
  taskType: 1 | 2;
}

export type RiderPerformanceGranularity = "day" | "week";
export type RiderPerformanceMetric = "finishedTasks" | "totalTasks";

export interface AdminRiderPerformanceSummaryVO {
  totalTasks: number;
  finishedTasks: number;
  unfinishedTasks: number;
  finishRate: number;
  pickupTasks: number;
  deliveryTasks: number;
}

export interface AdminRiderPerformanceTrendPointVO {
  date: string;
  value: number;
}

export interface AdminRiderPerformanceRiderVO {
  riderId: number;
  riderName: string;
  riderPhone?: string;
  totalTasks: number;
  finishedTasks: number;
  finishRate: number;
  pickupTasks: number;
  deliveryTasks: number;
}

export interface AdminRiderPerformanceTaskVO {
  taskId: number;
  taskType: 1 | 2;
  status: 0 | 1;
  createTime: string;
  orderId: number;
  orderSn: string;
  building?: string;
  address?: string;
  appointmentTime?: string;
  orderStatus?: number;
  totalPrice?: number;
}

export interface AdminPageResult<T> {
  total: number;
  records: T[];
}

export interface AdminRiderPerformanceBaseParams {
  startDate: string;
  endDate: string;
  riderId?: number;
  taskType?: 1 | 2;
  /** 仅看完成：1(默认) / 0 */
  onlyFinished?: 0 | 1;
}

export interface AdminRiderPerformanceTrendParams extends AdminRiderPerformanceBaseParams {
  granularity?: RiderPerformanceGranularity;
  metric?: RiderPerformanceMetric;
}

export interface AdminRiderPerformanceRidersParams {
  startDate: string;
  endDate: string;
  taskType?: 1 | 2;
  onlyFinished?: 0 | 1;
  page?: number;
  pageSize?: number;
  sortBy?: "finishedTasks" | "finishRate" | "totalTasks";
  sortOrder?: "asc" | "desc";
}

export interface AdminRiderPerformanceTasksParams extends AdminRiderPerformanceBaseParams {
  /** onlyFinished=1 时会被后端忽略 */
  status?: 0 | 1;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminRiderListItem {
  id: number;
  username: string;
  nickname?: string;
  phone?: string;
  avatar?: string | null;
  status: number;
}

export interface AdminRiderListParams {
  page?: number;
  size?: number;
}

export interface AdminRiderListResponse {
  records: AdminRiderListItem[];
  total: number;
  pages: number;
}

const RiderAPI = {
  /** 管理端：获取骑手列表 */
  getAdminRiderList(params?: AdminRiderListParams) {
    return request<AdminRiderListResponse, AdminRiderListResponse>({
      url: "/api/admin/rider/list",
      method: "get",
      params,
    });
  },

  /** 管理端：任务大厅 - 顶部统计卡片 */
  getAdminRiderHallMetrics() {
    return request<AdminRiderHallMetricsResponse, AdminRiderHallMetricsResponse>({
      url: "/api/admin/rider-hall/metrics",
      method: "get",
    });
  },

  /** 管理端：任务大厅 - 任务列表（TASK / WAIT_ASSIGN） */
  getAdminRiderHallTaskList(params?: AdminRiderHallTaskListParams) {
    return request<AdminRiderHallTaskListResponse, AdminRiderHallTaskListResponse>({
      url: "/api/admin/rider-hall/task",
      method: "get",
      params,
    });
  },

  /** 管理端：任务大厅 - 任务详情（仅 TASK 有 taskId；待指派没有详情接口） */
  getAdminRiderHallTaskDetail(taskId: number) {
    return request<AdminRiderHallTaskDetailResponse, AdminRiderHallTaskDetailResponse>({
      url: `/api/admin/rider-hall/task/${taskId}`,
      method: "get",
    });
  },

  /** 管理端：任务大厅 - 指派弹窗骑手列表 */
  getAdminRiderHallRiderList(params?: AdminRiderListParams) {
    return request<AdminRiderListResponse, AdminRiderListResponse>({
      url: "/api/admin/rider-hall/rider/list",
      method: "get",
      params,
    });
  },

  /** 管理端：任务大厅 - 指派骑手（基于 orderId + taskType 创建 delivery_task） */
  assignAdminRiderHallTask(data: AdminRiderHallAssignRequest) {
    return request<null, null, AdminRiderHallAssignRequest>({
      url: "/api/admin/rider-hall/task/assign",
      method: "post",
      data,
    });
  },

  // ============================================
  // 管理端：骑手业绩（AdminRiderPerformanceController）
  // Base URL: /api/admin/rider-performance
  // ============================================

  /** 顶部 KPI 卡片 */
  getAdminRiderPerformanceSummary(params: AdminRiderPerformanceBaseParams) {
    return request<AdminRiderPerformanceSummaryVO, AdminRiderPerformanceSummaryVO>({
      url: "/api/admin/rider-performance/summary",
      method: "get",
      params,
    });
  },

  /** 趋势图 */
  getAdminRiderPerformanceTrend(params: AdminRiderPerformanceTrendParams) {
    return request<AdminRiderPerformanceTrendPointVO[], AdminRiderPerformanceTrendPointVO[]>({
      url: "/api/admin/rider-performance/trend",
      method: "get",
      params,
    });
  },

  /** 骑手排行榜/列表 */
  getAdminRiderPerformanceRiders(params: AdminRiderPerformanceRidersParams) {
    return request<
      AdminPageResult<AdminRiderPerformanceRiderVO>,
      AdminPageResult<AdminRiderPerformanceRiderVO>
    >({
      url: "/api/admin/rider-performance/riders",
      method: "get",
      params,
    });
  },

  /** 任务明细列表 */
  getAdminRiderPerformanceTasks(params: AdminRiderPerformanceTasksParams) {
    return request<
      AdminPageResult<AdminRiderPerformanceTaskVO>,
      AdminPageResult<AdminRiderPerformanceTaskVO>
    >({
      url: "/api/admin/rider-performance/tasks",
      method: "get",
      params,
    });
  },
};

export default RiderAPI;
