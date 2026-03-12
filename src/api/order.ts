import request from "@/utils/request";

export interface ServiceCategoryItem {
  id: number;
  name: string;
}

export type ServiceCategoryListResponse = ServiceCategoryItem[];

export interface ServiceItem {
  id: number;
  serviceName: string;
  price: number;
  unit: string;
  image?: string;
}

export interface CategoryServicesResponse {
  id: number;
  name: string;
  services: ServiceItem[];
}

export interface DefaultAddressResponse {
  id: number;
  fullAddress: string;
  building: string;
  isDefault: number;
}

export interface CreateOrderRequest {
  studentId: number;
  address: string;
  building?: string;
  appointmentTime: string;
  remark?: string;
  items: Array<{ serviceId: number; quantity: number }>;
}

export interface CreateOrderResponse {
  orderSn: string;
}

export interface AdminPendingAssignOrderItem {
  id: number;
  orderSn: string;
  studentId: number;
  address: string;
  building: string;
  status: number;
  appointmentTime: string;
  createTime: string;
  totalPrice: number;
}

export interface AdminPendingAssignOrderListParams {
  status?: string;
  page?: number;
  size?: number;
}

export interface AdminPendingAssignOrderListResponse {
  records: AdminPendingAssignOrderItem[];
  total: number;
  pages: number;
}

export interface AdminOrderListItem {
  orderId: number;
  orderSn: string;
  studentId?: number;
  studentName?: string;
  phone?: string;
  address: string;
  building?: string;
  status: number;
  paid?: number;
  totalAmount?: number;
  payAmount?: number;
  appointmentTime?: string;
  createTime: string;
}

export interface AdminOrderListParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  statusList?: string;
  paid?: number | string;
  keyword?: string;
  orderSn?: string;
}

export interface AdminOrderListResponse {
  records: AdminOrderListItem[];
  total: number;
  pages: number;
}

export interface AdminOrderDetailResponse {
  orderId: number;
  orderSn: string;
  status: number;
  paid?: number;
  studentId?: number;
  studentName?: string;
  phone?: string;
  address: string;
  building?: string;
  totalAmount?: number;
  payAmount?: number;
  appointmentTime?: string;
  createTime: string;
  items?: Array<{
    serviceId: number;
    serviceName?: string;
    unitPrice?: number;
    quantity: number;
    amount?: number;
  }>;
  riderId?: number;
  riderName?: string;
  deliveryFee?: number;
}

export interface AdminAssignOrderRequest {
  orderId: number;
  riderId: number;
  taskType: 1 | 2;
}

export interface AdminCancelOrderRequest {
  orderId: number;
  reason?: string;
}

const OrderAPI = {
  /** 获取服务分类列表 */
  async getCategoryList() {
    return request<ServiceCategoryListResponse, ServiceCategoryListResponse>({
      url: "/api/home/category/list",
      method: "get",
    });
  },

  /** 获取指定分类下的服务项目 */
  async getCategoryDetail(categoryId: number) {
    return request<CategoryServicesResponse, CategoryServicesResponse>({
      url: `/api/home/category/${categoryId}`,
      method: "get",
    });
  },

  /** 获取用户默认地址 */
  async getDefaultAddress(studentId: number) {
    return request<DefaultAddressResponse | null, DefaultAddressResponse | null>({
      url: "/api/address/default",
      method: "get",
      params: { studentId },
    });
  },

  /** 提交订单 */
  async createOrder(data: CreateOrderRequest) {
    return request<CreateOrderResponse, CreateOrderResponse, CreateOrderRequest>({
      url: "/api/order/create",
      method: "post",
      data,
    });
  },

  /** 管理端：获取待指派订单列表 */
  getAdminPendingAssignOrders(params?: AdminPendingAssignOrderListParams) {
    return request<AdminPendingAssignOrderListResponse, AdminPendingAssignOrderListResponse>({
      url: "/api/admin/order/pending-assign",
      method: "get",
      params,
    });
  },

  /** 管理端：订单管理列表（仪表盘卡片跳转落地页） */
  getAdminOrderList(params?: AdminOrderListParams) {
    return request<AdminOrderListResponse, AdminOrderListResponse>({
      url: "/api/admin/order",
      method: "get",
      params,
    });
  },

  /** 管理端：订单详情 */
  getAdminOrderDetail(orderId: number) {
    return request<AdminOrderDetailResponse, AdminOrderDetailResponse>({
      url: `/api/admin/order/${orderId}`,
      method: "get",
    });
  },

  /** 管理端：取消订单 */
  cancelAdminOrder(data: AdminCancelOrderRequest) {
    return request<null, null, AdminCancelOrderRequest>({
      url: "/api/admin/order/cancel",
      method: "post",
      data,
    });
  },

  /** 管理端：删除订单 */
  deleteAdminOrder(orderId: number) {
    return request<null, null>({
      url: `/api/admin/order/${orderId}`,
      method: "delete",
    });
  },

  /** 管理端：手动指派骑手 */
  assignAdminOrder(data: AdminAssignOrderRequest) {
    return request<null, null, AdminAssignOrderRequest>({
      url: "/api/admin/order/assign",
      method: "post",
      data,
    });
  },
};

export default OrderAPI;
