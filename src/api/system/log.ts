import request from "@/utils/request";
import type { PageResult } from "@/types/api";

export interface OperLogQueryParams {
  pageNum: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  userId?: number;
  success?: 0 | 1;
  keyword?: string;
}

export interface OperLogItem {
  id: number;
  userId: number;
  username: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  requestParams: string;
  responseCode: string;
  success: 0 | 1;
  costMs: number;
  createTime: string;
}

const LOG_BASE_URL = "/api/admin/system/log";

const LogAPI = {
  /** 操作日志分页查询 */
  getPage(params: OperLogQueryParams) {
    const { pageNum, pageSize, ...rest } = params;
    return request<any, { total: number; records: OperLogItem[]; pages: number }>({
      url: `${LOG_BASE_URL}/page`,
      method: "get",
      params: {
        page: pageNum,
        size: pageSize,
        ...rest,
      },
    }).then(
      (res) =>
        ({
          list: res.records ?? [],
          total: res.total ?? 0,
        }) as PageResult<OperLogItem>
    );
  },
};

export default LogAPI;
