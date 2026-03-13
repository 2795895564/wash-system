<template>
  <div class="app-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span>用户列表</span>
          <div class="flex items-center gap-2">
            <!-- 新增用户：仅管理员可用；账号(username)仅在新增时填写，编辑不允许改 -->
            <el-button type="primary" @click="handleOpenCreate">新增用户</el-button>
          </div>
        </div>
      </template>

      <!--
        查询条件区（按设计文档精简）：仅保留
        - 姓名/昵称 nickname（模糊查询）
        - 角色 role
        - 状态 status

        说明：账号 username 不作为查询条件，但表格会展示用于定位用户。
      -->
      <el-form :inline="true" class="mb-3">
        <el-form-item label="姓名">
          <el-input
            v-model="query.nickname"
            placeholder="请输入姓名/昵称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="query.role" placeholder="全部" clearable style="width: 160px">
            <el-option label="管理员" :value="0" />
            <el-option label="学生" :value="1" />
            <el-option label="店员" :value="2" />
            <el-option label="骑手" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <!-- 查询：固定回到第一页再拉取列表 -->
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <!-- 重置：清空查询项并回到第一页 -->
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!--
        表格列（按设计文档精简）：
        - 姓名/昵称
        - 账号
        - 角色
        - 状态
        - 操作

        注意：注册时间(create_time)不在表格显示，放到“详情抽屉”。
      -->
      <el-table v-loading="loading" :data="tableData" class="w-full">
        <el-table-column prop="nickname" label="姓名" min-width="140">
          <template #default="{ row }">
            {{ row.nickname || "-" }}
          </template>
        </el-table-column>

        <el-table-column prop="username" label="账号" min-width="140" />

        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">{{ getRoleText(row.role) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <!-- 主操作（常用、低风险） -->
              <!-- 编辑：同时承担查看详情能力；不允许编辑 username；余额 balance 只读不允许修改 -->
              <el-button link type="primary" @click="handleOpenEdit(row.id)">编辑</el-button>

              <!-- 更多操作：收纳低频/高风险操作，减少按钮拥挤 -->
              <el-dropdown trigger="click">
                <el-button link type="primary">更多</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleToggleStatus(row)">
                      {{ row.status === 1 ? "禁用" : "启用" }}
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleResetPassword(row.id)">
                      重置密码
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleDelete(row.id)">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && tableData.length === 0" description="暂无数据" class="py-8" />

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="editDialogVisible"
      :title="editForm.id ? '编辑用户' : '新增用户'"
      width="680px"
      :close-on-click-modal="false"
      class="user-edit-dialog"
    >
      <!--
        编辑弹窗兼容“详情查看”：
        - 原“详情抽屉”中重要的只读信息（ID/账号/余额/注册时间）在此展示
        - 可编辑字段仍保持设计约束（username 不可编辑，balance 不可编辑）
      -->
      <el-descriptions v-if="editForm.id" :column="1" border class="mb-4">
        <el-descriptions-item label="ID">{{ editForm.id || "-" }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ editForm.username || "-" }}</el-descriptions-item>
        <el-descriptions-item label="余额">
          {{ formatBalance(editForm.balance) }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">
          {{ editForm.create_time || "-" }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="user-edit-dialog__body">
        <el-form ref="editFormRef" :model="editForm" :rules="editRules" :label-width="100">
          <el-form-item v-if="!editForm.id" label="账号" prop="username">
            <el-input v-model="editForm.username" />
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="editForm.nickname" />
          </el-form-item>

          <el-form-item label="角色" prop="role">
            <el-select v-model="editForm.role" style="width: 100%">
              <el-option label="管理员" :value="0" />
              <el-option label="学生" :value="1" />
              <el-option label="店员" :value="2" />
              <el-option label="骑手" :value="3" />
            </el-select>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select v-model="editForm.status" style="width: 100%">
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input v-model="editForm.phone" />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" />
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-select v-model="editForm.gender" style="width: 100%">
              <el-option label="未知" :value="0" />
              <el-option label="男" :value="1" />
              <el-option label="女" :value="2" />
            </el-select>
          </el-form-item>

          <el-form-item label="头像" prop="avatar">
            <SingleImageUpload
              v-model:modelValue="editForm.avatar"
              :data="{ folder: 'uploads/user' }"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="editSubmitting" @click="handleSubmitEdit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

import UserManageAPI from "@/api/user-manage";
import SingleImageUpload from "@/components/Upload/SingleImageUpload.vue";

/**
 * 用户列表（sys_user）页面
 *
 * 说明：
 * - 本页面为管理员使用的用户管理页面，对接 `/api/sys/user` 相关接口。
 * - 个人中心（profile）使用的是 `src/api/system/user.ts`，接口前缀为 `/api/admin/users`。
 * - 为避免影响个人中心功能，本页面使用独立的 `@/api/user-manage`。
 */

defineOptions({
  name: "UserList",
  inheritAttrs: false,
});

/** 表格 loading 状态 */
const loading = ref(false);
/** 表格数据源（精简字段） */
const tableData = ref<any[]>([]);

/**
 * 查询条件（Search Form 精简版）：nickname/role/status
 * - nickname：模糊查询
 * - role/status：精确筛选
 */
const query = reactive({
  nickname: "",
  role: undefined as number | undefined,
  status: undefined as number | undefined,
});

/** 分页信息：与后端分页接口对接 */
const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
});

/** 编辑弹窗状态与表单 */
const editDialogVisible = ref(false);
const editSubmitting = ref(false);
const editFormRef = ref();

const editForm = reactive<any>({
  id: "",
  username: "",
  nickname: "",
  avatar: "",
  phone: "",
  email: "",
  gender: 0,
  role: 1,
  status: 1,
  // 只读信息：用于在编辑弹窗中展示“详情”信息
  balance: "",
  create_time: "",
});

const editRules = {
  username: [{ required: true, message: "请输入账号", trigger: "blur" }],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

function getRoleText(role?: number) {
  if (role === 0) return "管理员";
  if (role === 1) return "学生";
  if (role === 2) return "店员";
  if (role === 3) return "骑手";
  return "-";
}

function getRoleTagType(role?: number) {
  if (role === 0) return "danger";
  if (role === 1) return "success";
  if (role === 2) return "warning";
  if (role === 3) return "info";
  return "info";
}

function formatBalance(val: any) {
  if (val === null || val === undefined || val === "") return "0.00";
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num.toFixed(2);
}

async function fetchList() {
  // 拉取分页列表：只使用查询区的 3 个条件
  loading.value = true;
  try {
    const res = await UserManageAPI.getPage({
      pageNo: pagination.value.page,
      pageSize: pagination.value.size,
      nickname: query.nickname || undefined,
      role: query.role,
      status: query.status,
    });
    tableData.value = res.list ?? [];
    pagination.value.total = res.total ?? 0;
  } catch (e: any) {
    tableData.value = [];
    pagination.value.total = 0;
    ElMessage.error(e?.message || "获取用户列表失败");
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  // 触发查询：回到第一页
  pagination.value.page = 1;
  fetchList();
}

function handleReset() {
  // 重置查询条件：回到第一页
  query.nickname = "";
  query.role = undefined;
  query.status = undefined;
  pagination.value.page = 1;
  fetchList();
}

function resetEditForm() {
  // 重置编辑表单：用于新增/编辑打开前的初始化
  editForm.id = "";
  editForm.username = "";
  editForm.nickname = "";
  editForm.avatar = "";
  editForm.phone = "";
  editForm.email = "";
  editForm.gender = 0;
  editForm.role = 1;
  editForm.status = 1;
  editForm.balance = "";
  editForm.create_time = "";
}

function handleOpenCreate() {
  // 新增用户：允许填写 username
  resetEditForm();
  editDialogVisible.value = true;
}

async function handleOpenEdit(id: string) {
  // 编辑用户：不允许改 username，因此模板里编辑态不展示账号输入框
  try {
    const data = await UserManageAPI.getDetail(id);
    resetEditForm();
    editForm.id = data.id;
    editForm.username = data.username;
    editForm.nickname = data.nickname;
    editForm.avatar = data.avatar;
    editForm.phone = data.phone;
    editForm.email = data.email;
    editForm.gender = data.gender;
    editForm.role = data.role;
    editForm.status = data.status;
    editForm.balance = data.balance;
    editForm.create_time = data.create_time;

    editDialogVisible.value = true;
  } catch (e: any) {
    ElMessage.error(e?.message || "获取用户信息失败");
  }
}

async function handleSubmitEdit() {
  // 提交新增/编辑表单
  try {
    const valid = await editFormRef.value?.validate();
    if (!valid) return;

    editSubmitting.value = true;

    if (editForm.id) {
      // 编辑：只提交允许编辑字段（不包含 username、balance）
      await UserManageAPI.update(editForm.id, {
        nickname: editForm.nickname || undefined,
        avatar: editForm.avatar || undefined,
        phone: editForm.phone || undefined,
        email: editForm.email || undefined,
        gender: editForm.gender,
        role: editForm.role,
        status: editForm.status,
      });
      ElMessage.success("修改成功");
    } else {
      // 新增：包含 username；密码由后端初始化为默认 123456（或按后端规则）
      await UserManageAPI.create({
        username: editForm.username,
        nickname: editForm.nickname || undefined,
        avatar: editForm.avatar || undefined,
        phone: editForm.phone || undefined,
        email: editForm.email || undefined,
        gender: editForm.gender,
        role: editForm.role,
        status: editForm.status,
      });
      ElMessage.success("新增成功");
    }

    editDialogVisible.value = false;
    await fetchList();
  } catch (e: any) {
    ElMessage.error(e?.message || "提交失败");
  } finally {
    editSubmitting.value = false;
  }
}

async function handleToggleStatus(row: any) {
  // 启用/禁用：切换 status
  const nextStatus = row.status === 1 ? 0 : 1;
  try {
    await ElMessageBox.confirm(`确定${nextStatus === 1 ? "启用" : "禁用"}该用户吗？`, "确认", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });

    await UserManageAPI.updateStatus(row.id, nextStatus);
    ElMessage.success("操作成功");
    await fetchList();
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error(e?.message || "操作失败");
    }
  }
}

async function handleResetPassword(id: string) {
  // 重置密码：固定重置为 123456，由后端加密落库
  try {
    await ElMessageBox.confirm("将密码重置为默认密码 123456，确定继续吗？", "重置密码", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });

    await UserManageAPI.resetPasswordDefault(id);
    ElMessage.success("密码已重置");
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error(e?.message || "重置密码失败");
    }
  }
}

async function handleDelete(id: string) {
  // 删除用户：后端需校验“有订单不允许删除”并返回明确错误信息
  try {
    await ElMessageBox.confirm("删除后不可恢复，确定删除该用户吗？", "删除用户", {
      type: "warning",
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    });

    await UserManageAPI.deleteById(id);
    ElMessage.success("删除成功");

    if (tableData.value.length === 1 && pagination.value.page > 1) {
      pagination.value.page -= 1;
    }

    await fetchList();
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error(e?.message || "删除失败");
    }
  }
}

watch(
  () => [pagination.value.page, pagination.value.size],
  () => {
    fetchList();
  }
);

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.action-cell {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 编辑弹窗：避免出现滚动条（内容尽量在可视区域内铺开） */
.user-edit-dialog :deep(.el-dialog__body) {
  padding-top: 12px;
  padding-bottom: 12px;
  overflow: hidden;
}

.user-edit-dialog__body {
  overflow: hidden;
}
</style>
