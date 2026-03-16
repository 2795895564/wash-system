/**
 * Log 日志类型定义
 */

import type { BaseQueryParams } from "./common";

/** 日志分页查询参数 */
export interface LogQueryParams extends BaseQueryParams {
  /** 开始日期（YYYY-MM-DD） */
  startDate?: string;
  /** 结束日期（YYYY-MM-DD） */
  endDate?: string;
  /** 操作人用户ID */
  userId?: number;
  /** 是否成功（1成功/0失败） */
  success?: 0 | 1;
  /** 关键字（匹配 path/username） */
  keyword?: string;
}

/** 日志分页对象 */
export interface LogItem {
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
