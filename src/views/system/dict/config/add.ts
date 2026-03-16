import DictAPI from "@/api/system/dict";
import type { DictTypeForm } from "@/types/api";
import type { IModalConfig } from "@/components/CURD/types";

const modalConfig: IModalConfig<DictTypeForm> = {
  dialog: {
    title: "新增字典",
    width: 720,
    draggable: true,
  },
  form: {
    labelWidth: 90,
  },
  formAction: DictAPI.create,
  formItems: [
    {
      label: "字典编码",
      prop: "dictCode",
      rules: [{ required: true, message: "请输入字典编码", trigger: "blur" }],
      type: "input",
      attrs: {
        placeholder: "如：gender",
        clearable: true,
      },
    },
    {
      label: "字典名称",
      prop: "name",
      rules: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
      type: "input",
      attrs: {
        placeholder: "如：性别",
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
        placeholder: "选填",
        maxlength: 200,
        showWordLimit: true,
        rows: 3,
      },
    },
  ],
};

export default reactive(modalConfig);
