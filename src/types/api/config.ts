/**
 * Config 配置类型定义
 */

import type { BaseQueryParams } from "./common";

/** 配置分页查询参数 */
export interface ConfigQueryParams extends BaseQueryParams {
  /** 搜索关键字 */
  keywords?: string;
  /** 启用状态（1启用/0禁用） */
  status?: 0 | 1;
}

/** 配置表单对象 */
export interface ConfigForm {
  /** 配置ID */
  id?: string;
  /** 配置键 */
  configKey?: string;
  /** 配置值 */
  configValue?: string;
  /** 值类型（int/string/bool 等，后端存字符串） */
  valueType?: string;
  /** 启用状态（1启用/0禁用） */
  status?: 0 | 1;
  /** 备注 */
  remark?: string;

  /**
   * 兼容字段：旧页面使用 configName。
   * 若你希望严格按文档，可在页面中逐步移除该字段。
   */
  configName?: string;
}

/** 配置分页对象 */
export interface ConfigItem {
  /** 配置ID */
  id?: string;
  /** 配置键 */
  configKey?: string;
  /** 配置值 */
  configValue?: string;

  /** 值类型 */
  valueType?: string;
  /** 启用状态 */
  status?: 0 | 1;
  /** 备注 */
  remark?: string;

  /** 兼容字段 */
  configName?: string;
}
