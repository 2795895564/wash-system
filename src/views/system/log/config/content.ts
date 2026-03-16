import LogAPI from "@/api/system/log";
import type { OperLogQueryParams, OperLogItem } from "@/api/system/log";
import type { IContentConfig } from "@/components/CURD/types";

/**
 * 说明：操作日志是只读数据。
 * - 不提供 add/delete
 * - 通过 view 抽屉查看详情
 */
const contentConfig: IContentConfig<OperLogQueryParams & { dateRange?: string[] }, OperLogItem> = {
  table: {
    border: true,
    highlightCurrentRow: true,
  },
  pagination: {
    background: true,
    layout: "prev,pager,next,jumper,total,sizes",
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  indexAction(params) {
    // searchConfig 用 dateRange 承载 startDate/endDate，这里做一次映射，保证表单字段简单
    const { dateRange, ...rest } = params as any;
    const startDate = Array.isArray(dateRange) ? dateRange[0] : undefined;
    const endDate = Array.isArray(dateRange) ? dateRange[1] : undefined;

    return LogAPI.getPage({
      ...(rest as OperLogQueryParams),
      startDate,
      endDate,
    });
  },
  pk: "id",
  toolbar: [],
  defaultToolbar: ["refresh", "search"],
  cols: [
    { label: "ID", prop: "id", width: 90, align: "center", show: false },
    { label: "用户名", prop: "username", width: 140 },
    { label: "方法", prop: "method", width: 90, align: "center" },
    {
      label: "路径",
      prop: "path",
      minWidth: 220,
      templet: "custom",
      slotName: "path",
    },
    { label: "IP", prop: "ip", width: 140 },
    {
      label: "结果",
      prop: "success",
      width: 110,
      align: "center",
      templet: "custom",
      slotName: "success",
    },
    { label: "耗时(ms)", prop: "costMs", width: 110, align: "center" },
    {
      label: "请求参数",
      prop: "requestParams",
      minWidth: 220,
      templet: "custom",
      slotName: "requestParams",
    },
    { label: "时间", prop: "createTime", width: 180 },
    {
      label: "操作",
      align: "center",
      fixed: "right",
      width: 120,
      templet: "tool",
      operat: [
        {
          name: "view",
          text: "查看",
          attrs: { icon: "Document", type: "primary" },
        },
      ],
    },
  ],
};

export default contentConfig;
