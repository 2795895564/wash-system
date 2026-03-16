import ConfigAPI from "@/api/system/config";
import type { ConfigForm } from "@/types/api";
import type { IModalConfig } from "@/components/CURD/types";

const modalConfig: IModalConfig<ConfigForm> = {
  dialog: {
    title: "新增参数配置",
    width: 760,
    draggable: true,
  },
  form: {
    labelWidth: 100,
  },
  formAction: ConfigAPI.create,
  formItems: [
    {
      label: "配置键",
      prop: "configKey",
      rules: [{ required: true, message: "请输入配置键", trigger: "blur" }],
      type: "input",
      attrs: {
        placeholder: "如：admin.order.maxQueryDays",
        clearable: true,
      },
    },
    {
      label: "配置值",
      prop: "configValue",
      rules: [{ required: true, message: "请输入配置值", trigger: "blur" }],
      type: "input",
      attrs: {
        placeholder: "如：90",
        clearable: true,
      },
    },
    {
      label: "值类型",
      prop: "valueType",
      type: "select",
      initialValue: "string",
      options: [
        { label: "string", value: "string" },
        { label: "int", value: "int" },
        { label: "bool", value: "bool" },
      ],
      attrs: {
        placeholder: "请选择",
        clearable: true,
      },
    },
    {
      label: "状态",
      prop: "status",
      type: "radio",
      initialValue: 1,
      options: [
        { label: "启用", value: 1 },
        { label: "禁用", value: 0 },
      ],
    },
    {
      label: "备注",
      prop: "remark",
      type: "input",
      attrs: {
        type: "textarea",
        rows: 3,
        placeholder: "选填",
        maxlength: 200,
        showWordLimit: true,
      },
    },
  ],
};

export default reactive(modalConfig);
