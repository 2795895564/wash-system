import ConfigAPI from "@/api/system/config";
import type { ConfigItem, ConfigQueryParams } from "@/types/api";
import type { IContentConfig } from "@/components/CURD/types";

const contentConfig: IContentConfig<ConfigQueryParams, ConfigItem> = {
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
    return ConfigAPI.getPage(params);
  },
  deleteAction(ids: string) {
    // CURD 组件的 deleteAction 约定是 ids: string，这里按单选/多选兼容逐个删除
    const list = String(ids)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return Promise.all(list.map((id) => ConfigAPI.deleteById(id))).then(() => undefined);
  },
  pk: "id",
  toolbar: ["add", "delete"],
  defaultToolbar: ["refresh", "search"],
  cols: [
    { type: "selection", width: 50, align: "center" },
    { label: "ID", prop: "id", align: "center", width: 90, show: false },
    { label: "配置键", prop: "configKey", minWidth: 220 },
    { label: "配置值", prop: "configValue", minWidth: 180 },
    {
      label: "值类型",
      prop: "valueType",
      width: 140,
      align: "center",
      templet: "custom",
      slotName: "valueType",
    },
    {
      label: "状态",
      prop: "status",
      width: 120,
      align: "center",
      templet: "custom",
      slotName: "status",
    },
    { label: "备注", prop: "remark", minWidth: 220, showOverflowTooltip: true },
    { label: "创建时间", prop: "createTime", width: 180 },
    {
      label: "操作",
      align: "center",
      fixed: "right",
      width: 180,
      templet: "tool",
      operat: ["edit", "delete"],
    },
  ],
};

export default contentConfig;
