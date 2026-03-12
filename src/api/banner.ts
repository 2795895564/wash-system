import request from "@/utils/request";

export interface BannerItem {
  id: number;
  title?: string | null;
  tag?: string | null;
  image_url: string;
  link_type?: number;
  link_value?: string | null;
  sort_order?: number;
  status?: number;
  create_time?: string;
  update_time?: string;
}

export interface BannerListParams {
  page?: number;
  size?: number;
}

export interface BannerListResponse {
  records?: BannerItem[];
  list?: BannerItem[];
  data?: BannerItem[];
  total?: number;
  pages?: number;
}

export interface BannerUpsertRequest {
  title?: string | null;
  tag?: string | null;
  image_url: string;
  link_type?: number;
  link_value?: string | null;
  sort_order?: number;
  status?: number;
}

function mapBannerItemFromBackend(row: any): BannerItem {
  return {
    id: row.id,
    title: row.title ?? null,
    tag: row.tag ?? null,
    image_url: row.image_url ?? row.imageUrl ?? "",
    link_type: row.link_type ?? row.linkType ?? 0,
    link_value: row.link_value ?? row.linkValue ?? null,
    sort_order: row.sort_order ?? row.sortOrder ?? 0,
    status: row.status ?? 1,
    create_time: row.create_time ?? row.createTime,
    update_time: row.update_time ?? row.updateTime,
  };
}

function mapBannerUpsertToBackend(data: BannerUpsertRequest) {
  return {
    title: data.title ?? null,
    tag: data.tag ?? null,
    imageUrl: data.image_url,
    linkType: data.link_type ?? 0,
    linkValue: data.link_value ?? null,
    sortOrder: data.sort_order ?? 0,
    status: data.status ?? 1,
  };
}

const BANNER_BASE_URL = "/api/admin/home-banner";

const BannerAPI = {
  getBannerList(params?: BannerListParams) {
    return request<any, BannerListResponse>({
      url: BANNER_BASE_URL,
      method: "get",
      params,
    }).then((res) => {
      const records = (res.records ?? res.list ?? res.data ?? []) as any[];
      return {
        ...res,
        records: records.map(mapBannerItemFromBackend),
      } as BannerListResponse;
    });
  },
  createBanner(data: BannerUpsertRequest) {
    return request({
      url: BANNER_BASE_URL,
      method: "post",
      data: mapBannerUpsertToBackend(data),
    });
  },
  updateBanner(id: number, data: BannerUpsertRequest) {
    return request({
      url: `${BANNER_BASE_URL}/${id}`,
      method: "put",
      data: mapBannerUpsertToBackend(data),
    });
  },
  deleteBanner(id: number) {
    return request({
      url: `${BANNER_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default BannerAPI;
