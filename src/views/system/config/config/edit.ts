import ConfigAPI from "@/api/system/config";
import type { ConfigForm } from "@/types/api";
import type { IModalConfig } from "@/components/CURD/types";

const modalConfig: IModalConfig<ConfigForm> = {
  component: "drawer",
  drawer: {
    title: "编辑参数配置",
    size: 560,
  },
  pk: "id",
  formAction(data) {
    return ConfigAPI.update(String(data.id), {
      configValue: data.configValue,
      valueType: data.valueType,
      status: data.status,
      remark: data.remark,
    });
  },
  formItems: [
    {
      label: "配置键",
      prop: "configKey",
      type: "input",
      attrs: {
        readonly: true,
      },
    },
    {
      label: "配置值",
      prop: "configValue",
      rules: [{ required: true, message: "请输入配置值", trigger: "blur" }],
      type: "input",
      attrs: {
        placeholder: "请输入",
        clearable: true,
      },
    },
    {
      label: "值类型",
      prop: "valueType",
      type: "select",
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
      type: "switch",
      attrs: {
        inlinePrompt: true,
        activeText: "启用",
        inactiveText: "禁用",
        activeValue: 1,
        inactiveValue: 0,
      },
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
