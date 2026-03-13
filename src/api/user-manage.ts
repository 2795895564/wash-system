import request from "@/utils/request";

/**
 * 用户管理（sys_user）接口：专供管理员在「用户列表」页面使用。
 *
 * 重要：不要复用或改动 `src/api/system/user.ts`。
 * - `src/api/system/user.ts` 当前用于个人中心（profile）等功能，接口前缀是 `/api/admin/users`
 * - 本次用户列表按设计文档对接的是 `/api/sys/user`（后端 sys_user 表）
 *
 * 为避免影响个人中心的既有功能，这里单独新增一个 API 文件。
 */

export interface SysUserQueryParams {
  /** 页码，从 1 开始 */
  pageNo: number;
  /** 每页条数 */
  pageSize: number;
  /** 姓名/昵称，模糊查询（Search Form 精简后仅保留该搜索项） */
  nickname?: string;
  /** 角色：0-管理员, 1-学生, 2-店员, 3-骑手 */
  role?: number;
  /** 状态：1-正常, 0-禁用 */
  status?: number;
}

export interface SysUserListItem {
  /** 主键 ID */
  id: string;
  /** 登录账号（不可编辑，但表格需要展示用于定位用户） */
  username: string;
  /** 昵称/姓名（可为空） */
  nickname?: string;
  /** 角色：0-管理员, 1-学生, 2-店员, 3-骑手 */
  role: number;
  /** 状态：1-正常, 0-禁用 */
  status: number;
}

export interface SysUserDetail {
  /** 主键 ID */
  id: string;
  /** 登录账号 */
  username: string;
  /** 昵称/姓名 */
  nickname?: string;
  /** 头像 URL */
  avatar?: string;
  /** 手机号 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 性别：0-未知,1-男,2-女 */
  gender?: number;
  /** 角色 */
  role: number;
  /** 状态 */
  status: number;
  /** 余额（只读展示，不允许后台修改） */
  balance?: string | number;
  /** 注册时间（详情里展示，列表不展示） */
  create_time?: string;
}

export interface PageResult<T> {
  /** 当前页数据 */
  list: T[];
  /** 总条数 */
  total: number;
}

export interface SysUserCreateForm {
  /** 登录账号（新增必填；编辑不允许改） */
  username: string;
  /** 昵称/姓名 */
  nickname?: string;
  /** 头像 URL */
  avatar?: string;
  /** 手机号 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 性别 */
  gender?: number;
  /** 角色 */
  role: number;
  /** 状态 */
  status: number;
}

export interface SysUserUpdateForm {
  /** 昵称/姓名 */
  nickname?: string;
  /** 头像 URL */
  avatar?: string;
  /** 手机号 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 性别 */
  gender?: number;
  /** 角色 */
  role: number;
  /** 状态 */
  status: number;
}

/**
 * 本模块接口前缀（按最新对接文档约定）。
 * 如后端实际前缀不同，只需要改这里即可。
 */
const BASE_URL = "/api/admin/user-manage";

const UserManageAPI = {
  /**
   * 用户分页查询
   * - 对应页面：用户列表
   * - 查询项：nickname/role/status
   */
  getPage(params: SysUserQueryParams) {
    return request<any, PageResult<SysUserListItem>>({
      url: `${BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /** 获取用户详情（用于详情抽屉、编辑回显） */
  getDetail(id: string) {
    return request<any, SysUserDetail>({
      url: `${BASE_URL}/${id}`,
      method: "get",
    });
  },

  /** 新增用户（管理员操作） */
  create(data: SysUserCreateForm) {
    return request({
      url: `${BASE_URL}`,
      method: "post",
      data,
    });
  },

  /** 编辑用户（管理员操作；后端需拒绝 username/balance 等敏感字段修改） */
  update(id: string, data: SysUserUpdateForm) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /** 启用/禁用用户 */
  updateStatus(id: string, status: number) {
    return request({
      url: `${BASE_URL}/${id}/status`,
      method: "patch",
      data: { status },
    });
  },

  /**
   * 重置密码为默认密码（固定 123456）。
   * - 前端不传密码，避免明文在网络中传输/暴露；由后端统一加密落库。
   */
  resetPasswordDefault(id: string) {
    return request({
      url: `${BASE_URL}/${id}/reset-password`,
      method: "post",
    });
  },

  /**
   * 删除用户（物理删除）。
   * - 后端需要做关联校验：有订单则不允许删除。
   */
  deleteById(id: string) {
    return request({
      url: `${BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default UserManageAPI;
