import request from "@/utils/request";

export interface ServiceCategory {
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

export interface ServiceCategoryListParams {
  keyword?: string;
}

export type ServiceCategoryListResponse = ServiceCategory[];

export interface CreateServiceCategoryRequest {
  name: string;
  enName?: string | null;
  iconUrl: string;
}

export interface UpdateServiceCategoryRequest {
  id: number;
  name: string;
  enName?: string | null;
  iconUrl: string;
}

const ServiceCategoryAPI = {
  /** 管理端：服务分类列表 */
  getList(params?: ServiceCategoryListParams) {
    return request<ServiceCategoryListResponse, ServiceCategoryListResponse>({
      url: "/api/admin/service-category",
      method: "get",
      params,
    });
  },

  /** 管理端：新增服务分类 */
  create(data: CreateServiceCategoryRequest) {
    return request<null, null, CreateServiceCategoryRequest>({
      url: "/api/admin/service-category",
      method: "post",
      data,
    });
  },

  /** 管理端：更新服务分类 */
  update(data: UpdateServiceCategoryRequest) {
    return request<null, null, UpdateServiceCategoryRequest>({
      url: "/api/admin/service-category",
      method: "put",
      data,
    });
  },

  /** 管理端：删除服务分类 */
  remove(id: number) {
    return request<null, null>({
      url: `/api/admin/service-category/${id}`,
      method: "delete",
    });
  },
};

export default ServiceCategoryAPI;
