import type { ISearchConfig } from "@/components/CURD/types";

const successOptions = [
  { label: "成功", value: 1 },
  { label: "失败", value: 0 },
];

const searchConfig: ISearchConfig = {
  // 操作日志通常不做按钮权限控制（只读），这里不加 permPrefix
  formItems: [
    {
      type: "input",
      label: "关键字",
      prop: "keyword",
      tips: "匹配 path / username",
      attrs: {
        placeholder: "接口路径 / 用户名",
        clearable: true,
        style: { width: "240px" },
      },
    },
    {
      type: "input-number",
      label: "用户ID",
      prop: "userId",
      attrs: {
        placeholder: "请输入",
        clearable: true,
        style: { width: "180px" },
        controlsPosition: "right",
        min: 1,
      },
    },
    {
      type: "select",
      label: "结果",
      prop: "success",
      options: successOptions,
      attrs: {
        placeholder: "全部",
        clearable: true,
        style: { width: "160px" },
      },
    },
    {
      type: "date-picker",
      label: "日期",
      prop: "dateRange",
      attrs: {
        type: "daterange",
        "range-separator": "~",
        "start-placeholder": "开始日期",
        "end-placeholder": "结束日期",
        "value-format": "YYYY-MM-DD",
        style: { width: "240px" },
      },
    },
  ],
};

export default searchConfig;
