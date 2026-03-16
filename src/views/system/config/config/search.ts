import type { ISearchConfig } from "@/components/CURD/types";

const statusOptions = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
];

const searchConfig: ISearchConfig = {
  formItems: [
    {
      type: "input",
      label: "关键字",
      prop: "keywords",
      tips: "匹配 configKey / remark",
      attrs: {
        placeholder: "配置键 / 备注",
        clearable: true,
        style: { width: "240px" },
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
