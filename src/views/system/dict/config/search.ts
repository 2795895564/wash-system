import type { ISearchConfig } from "@/components/CURD/types";

const statusOptions = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
];

const searchConfig: ISearchConfig = {
  // 未提供后端 perms 约定时，先不加 permPrefix，避免按钮被误拦截
  formItems: [
    {
      type: "input",
      label: "关键字",
      prop: "keywords",
      tips: "匹配 字典编码/字典名称",
      attrs: {
        placeholder: "dictCode / dictName",
        clearable: true,
        style: { width: "220px" },
      },
    },
    {
      type: "select",
      label: "状态",
      prop: "status",
      options: statusOptions,
      attrs: {
        placeholder: "全部",
        clearable: true,
        style: { width: "160px" },
      },
    },
  ],
};

export default searchConfig;
