import DictAPI from "@/api/system/dict";
import type { DictTypeQueryParams } from "@/types/api";
import type { IContentConfig } from "@/components/CURD/types";

// 说明：后端返回字段为 dictCode/dictName/remark/createTime...
// 项目内的 DictTypeItem 类型仍保留旧字段 name（历史原因），这里以 any 作为展示类型，避免字段不匹配导致表格取值为空。
const contentConfig: IContentConfig<DictTypeQueryParams, any> = {
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
    return DictAPI.getPage(params);
  },
  deleteAction: DictAPI.deleteByIds,
  pk: "id",
  toolbar: ["add", "delete"],
  defaultToolbar: ["refresh", "search"],
  cols: [
    // 字典管理需要支持展开行展示字典项，因此这里使用 expand 列
    { type: "expand", width: 50 },
    { type: "selection", width: 50, align: "center" },
    { label: "ID", prop: "id", align: "center", width: 80, show: false },
    { label: "字典编码", prop: "dictCode", minWidth: 160 },
    { label: "字典名称", prop: "dictName", minWidth: 160 },
    {
      label: "状态",
      prop: "status",
      align: "center",
      width: 120,
      templet: "custom",
      slotName: "status",
    },
    { label: "备注", prop: "remark", minWidth: 180, showOverflowTooltip: true },
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
