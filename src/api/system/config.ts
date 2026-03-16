import request from "@/utils/request";
import type { ConfigForm, ConfigItem, ConfigQueryParams } from "@/types/api";

const CONFIG_BASE_URL = "/api/admin/system/config";

const ConfigAPI = {
  /** 参数配置分页列表 */
  getPage(params: ConfigQueryParams & { status?: 0 | 1 }) {
    // 说明：后端分页参数为 page/size；前端统一使用 pageNum/pageSize，这里做一次映射。
    const { pageNum, pageSize, keywords, ...rest } = params as any;
    return request<any, { total: number; records: ConfigItem[]; pages: number }>({
      url: `${CONFIG_BASE_URL}/page`,
      method: "get",
      params: {
        page: pageNum,
        size: pageSize,
        keyword: keywords,
        ...rest,
      },
    }).then((res) => ({
      list: res.records ?? [],
      total: res.total ?? 0,
    }));
  },

  /** 获取参数配置表单数据（用于编辑回显） */
  getFormData(id: string) {
    // 文档未单独定义该接口；此处按项目既有习惯提供 /{id}/form。
    return request<any, ConfigForm>({
      url: `${CONFIG_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /** 新增参数配置 */
  create(data: ConfigForm & { status?: 0 | 1; valueType?: string }) {
    return request({
      url: `${CONFIG_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /** 更新参数配置 */
  update(id: string, data: Partial<ConfigForm> & { status?: 0 | 1; valueType?: string }) {
    return request({
      url: `${CONFIG_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /** 删除参数配置（逻辑删除） */
  deleteById(id: string) {
    return request({
      url: `${CONFIG_BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /** 获取启用的配置值（调试/读取） */
  getValue(key: string) {
    return request<any, string | null>({
      url: `${CONFIG_BASE_URL}/get`,
      method: "get",
      params: { key },
    });
  },

  /** 刷新缓存（此项目页面已有按钮，若后端未实现可暂时不调用/后续补接口） */
  refreshCache() {
    return request({
      url: `${CONFIG_BASE_URL}/refresh-cache`,
      method: "post",
    });
  },
};

export default ConfigAPI;
