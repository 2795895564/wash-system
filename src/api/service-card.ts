import request from "@/utils/request";

export interface LaundryServiceItem {
  id?: number;
  categoryId?: number;
  serviceName: string;
  price: number;
  unit?: string;
  image?: string;
  description?: string;
  washMethod?: string;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

export interface HomeServiceCardItem {
  id: number;
  name: string;
  enName?: string | null;
  iconUrl: string;
  categoryId?: number | null;
  serviceId?: number | null;
  sortOrder?: number;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

export interface HomeServiceCardListParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: number | string;
}

export interface HomeServiceCardListResponse {
  records: HomeServiceCardItem[];
  total: number;
  pages: number;
}

export interface HomeServiceCardDetailResponse {
  card: HomeServiceCardItem;
  services: LaundryServiceItem[];
}

export interface HomeServiceCardUpsertRequest {
  card: {
    id?: number;
    name: string;
    enName?: string | null;
    iconUrl: string;
    sortOrder?: number;
    status?: number;
  };
  category?: {
    id?: number;
    name: string;
    sort?: number;
  };
  services?: Array<{
    id?: number;
    serviceName: string;
    price: number;
    unit?: string;
    image?: string;
    description?: string;
    washMethod?: string;
    status?: number;
  }>;
}

const ServiceCardAPI = {
  /** 管理端：服务卡片（home_service_card）列表 */
  getHomeServiceCardList(params?: HomeServiceCardListParams) {
    return request<HomeServiceCardListResponse, HomeServiceCardListResponse>({
      url: "/api/admin/home-service-card",
      method: "get",
      params,
    });
  },

  /** 管理端：服务卡片详情（包含所属分类下的 laundry_service 列表） */
  getHomeServiceCardDetail(id: number) {
    return request<HomeServiceCardDetailResponse, HomeServiceCardDetailResponse>({
      url: `/api/admin/home-service-card/${id}`,
      method: "get",
    });
  },

  /** 管理端：新增服务卡片（后端事务：同时创建 laundry_category + laundry_service） */
  createHomeServiceCard(data: HomeServiceCardUpsertRequest) {
    return request<{ id: number }, { id: number }, HomeServiceCardUpsertRequest>({
      url: "/api/admin/home-service-card",
      method: "post",
      data,
    });
  },

  /** 管理端：编辑服务卡片（后端事务：同时更新 laundry_category + laundry_service） */
  updateHomeServiceCard(id: number, data: HomeServiceCardUpsertRequest) {
    return request<null, null, HomeServiceCardUpsertRequest>({
      url: `/api/admin/home-service-card/${id}`,
      method: "put",
      data,
    });
  },

  /** 管理端：删除服务卡片（后端事务：删除 home_service_card + 对应 laundry_category + 对应 laundry_service） */
  deleteHomeServiceCard(id: number) {
    return request<null, null>({
      url: `/api/admin/home-service-card/${id}`,
      method: "delete",
    });
  },
};

export default ServiceCardAPI;
