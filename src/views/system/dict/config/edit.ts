import DictAPI from "@/api/system/dict";
import type { DictTypeForm } from "@/types/api";
import type { IModalConfig } from "@/components/CURD/types";

const modalConfig: IModalConfig<DictTypeForm> = {
  component: "drawer",
  drawer: {
    title: "编辑字典",
    size: 520,
  },
  pk: "id",
  formAction(data) {
    return DictAPI.update(String(data.id), {
      dictName: data.dictName,
      status: data.status,
      remark: data.remark,
    } as any);
  },
  formItems: [
    {
      label: "字典编码",
      prop: "dictCode",
      type: "input",
      attrs: {
        readonly: true,
      },
    },
    {
      label: "字典名称",
      prop: "dictName",
      rules: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
      type: "input",
      attrs: {
        placeholder: "请输入",
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
        placeholder: "选填",
        maxlength: 200,
        showWordLimit: true,
        rows: 3,
      },
    },
  ],
};

export default reactive(modalConfig);
