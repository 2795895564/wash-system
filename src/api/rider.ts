import request from "@/utils/request";

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
};

export default RiderAPI;
