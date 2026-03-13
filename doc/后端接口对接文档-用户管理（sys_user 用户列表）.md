# 后端接口对接文档-用户管理（sys_user 用户列表）

## 1. 页面与路由

- 路由：`http://localhost:3000/#/user/list`
- 功能：管理员对系统用户进行查询、查看详情、编辑、启用/禁用、重置密码、删除等管理操作。

## 2. 权限与安全约束

- 仅管理员（`role=0`）可访问页面与调用本模块接口。
- 接口返回数据中不得包含 `password` 字段（列表与详情均不返回）。
- `username` 不允许编辑。
- `balance` 不允许后台修改（只读展示）。

## 2.1 统一响应约定（建议）

为便于前端统一处理，建议后端接口返回统一结构：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {}
}
```

说明：

- `code=0` 表示成功；非 0 表示失败。
- `msg` 用于前端提示错误信息。
- `data` 为具体业务数据。

如果项目已存在统一响应格式，以项目现状为准。

## 3. 数据表（sys_user）说明（摘要）

- 主键：`id`
- 核心字段：
  - `username`：登录账号
  - `password`：密码（不返回）
  - `nickname`：昵称/姓名
  - `avatar`：头像 URL
  - `phone`：手机号
  - `email`：邮箱
  - `role`：角色（0 管理员 / 1 学生 / 2 店员 / 3 骑手）
  - `status`：状态（1 正常 / 0 禁用）
  - `balance`：余额（只读）
  - `gender`：性别（0 未知 / 1 男 / 2 女）
  - `create_time`：注册时间

## 4. 前端页面设计（不写代码）

### 4.1 查询条件区（Search Form）

仅保留 3 个条件：

- 姓名/昵称：`nickname`（模糊匹配）
- 角色：`role`
- 状态：`status`

按钮：查询、重置（重置后回到第一页）。

### 4.2 表格列表（Table）- 精简列

表格列仅保留管理必需信息，注册时间移入详情：

- 姓名/昵称：`nickname`
- 账号：`username`
- 角色：`role`
- 状态：`status`
- 操作：
  - 编辑（已合并“详情查看”能力）
  - 更多（下拉菜单）：启用/禁用、重置密码、删除

说明：

- `password` 不展示、不返回。
- `balance` 不在列表展示（可在详情中只读展示）。

### 4.3 编辑弹窗（Edit）

说明：本页面已将“详情查看”合并到“编辑弹窗”中。

- 新增用户：填写 `username` + 其他字段
- 编辑用户：弹窗顶部展示只读信息（原详情信息），下方为可编辑表单

编辑弹窗只读展示（用于替代原详情抽屉）：

- `id`
- `username`
- `balance`（只读）
- `create_time`（注册时间，已从表格移入详情展示区域）

编辑弹窗可编辑字段：

- `nickname/avatar/phone/email/gender/role/status`

不可编辑字段：

- `username`（编辑时不可改）
- `balance`（不可改）
- `password`（不在编辑中处理）

### 4.4 更多下拉菜单（More）

“更多”下拉菜单包含：

- 启用/禁用（修改 `status`）
- 重置密码（固定默认 `123456`）
- 删除（有订单不允许删除）

### 4.5 操作规则

- 启用/禁用：修改 `status`，二次确认。
- 重置密码：重置为默认固定密码 `123456`（由后端加密后写入）。
- 删除：支持删除，但需要关联校验（有订单不允许删除）。
  - 禁止删除自己。
  - 建议：禁止删除最后一个管理员（保留至少 1 个管理员）。

## 5. 接口契约（建议）

以下接口路径与前端实现保持一致（见：`src/api/user-manage.ts`）：

- `BASE_URL = /api/admin/user-manage`

### 5.1 用户分页查询

- 方法：`GET`
- 路径：`/api/admin/user-manage/page`
- 权限：管理员
- Query 参数：
  - `pageNo`：页码（从 1 开始）
  - `pageSize`：每页大小
  - `nickname`：模糊匹配
  - `role`：角色
  - `status`：状态
  - `sortBy`：默认 `create_time`
  - `sortOrder`：默认 `desc`

- Response：分页对象
  - `list`：用户数组（不含 `password`）
  - `total`：总数

字段说明（list 项）：

- `id`：string（bigint）
- `username`：string
- `nickname`：string | null
- `role`：number（0/1/2/3）
- `status`：number（1/0）

Response 示例：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "list": [
      {
        "id": "1",
        "username": "admin",
        "nickname": "管理员",
        "role": 0,
        "status": 1
      }
    ],
    "total": 1
  }
}
```

### 5.2 用户详情

- 方法：`GET`
- 路径：`/api/admin/user-manage/{id}`
- 权限：管理员
- Response：用户对象（不含 `password`）。

字段说明：

- `id`：string（bigint）
- `username`：string
- `nickname`：string | null
- `avatar`：string | null
- `phone`：string | null
- `email`：string | null
- `gender`：number（0/1/2）
- `role`：number（0/1/2/3）
- `status`：number（1/0）
- `balance`：string（decimal，建议以字符串返回避免精度问题）
- `create_time`：string（datetime，建议格式：`YYYY-MM-DD HH:mm:ss`）

Response 示例：

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "id": "1",
    "username": "admin",
    "nickname": "管理员",
    "avatar": null,
    "phone": null,
    "email": null,
    "gender": 0,
    "role": 0,
    "status": 1,
    "balance": "0.00",
    "create_time": "2026-03-12 23:59:59"
  }
}
```

### 5.3 新增用户

- 方法：`POST`
- 路径：`/api/admin/user-manage`
- 权限：管理员
- Body：
  - `username`（必填，唯一，不可重复）
  - `role`（必填）
  - `status`（可选，默认 1）
  - `nickname/avatar/phone/email/gender`（可选）
  - `password`（可选：若不传则后端初始化为默认密码 `123456`）

说明：如允许前端传密码，后端仍需统一加密存储；不建议回显明文。

Body 示例：

```json
{
  "username": "zhangsan",
  "nickname": "张三",
  "role": 1,
  "status": 1,
  "gender": 1,
  "phone": "13800000000",
  "email": "zhangsan@example.com",
  "avatar": "https://example.com/avatar.png"
}
```

Response 建议：

- 成功：返回新用户 `id`

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "id": "100"
  }
}
```

### 5.4 编辑用户

- 方法：`PUT`
- 路径：`/api/admin/user-manage/{id}`
- 权限：管理员
- Body 允许字段：`nickname/avatar/phone/email/gender/role/status`

约束：

- 不允许修改 `username`。
- 不允许修改 `balance`。

Body 示例：

```json
{
  "nickname": "张三（更新）",
  "role": 1,
  "status": 1,
  "gender": 1,
  "phone": "13800000000",
  "email": "zhangsan@example.com",
  "avatar": "https://example.com/avatar.png"
}
```

Response 示例：

```json
{ "code": 0, "msg": "ok", "data": true }
```

### 5.5 启用/禁用

- 方法：`PATCH`
- 路径：`/api/admin/user-manage/{id}/status`
- 权限：管理员
- Body：`{ "status": 0 | 1 }`

Body 示例：

```json
{ "status": 0 }
```

Response 示例：

```json
{ "code": 0, "msg": "ok", "data": true }
```

### 5.6 重置密码（固定默认）

- 方法：`POST`
- 路径：`/api/admin/user-manage/{id}/reset-password`
- 权限：管理员
- Body：无

行为：

- 服务端将密码重置为默认 `123456`（加密后落库）。
- 响应不返回密码明文。

Response 示例：

```json
{ "code": 0, "msg": "ok", "data": true }
```

### 5.7 删除用户（带订单关联校验）

- 方法：`DELETE`
- 路径：`/api/admin/user-manage/{id}`
- 权限：管理员

服务端删除前校验：

- 不能删除自己。
- 建议：不能删除最后一个管理员。
- 订单关联校验：若用户存在订单记录，则拒绝删除并返回明确错误信息。

Response 示例：

```json
{ "code": 0, "msg": "ok", "data": true }
```

失败示例（有订单不允许删除）：

```json
{
  "code": 40001,
  "msg": "该用户存在订单记录，无法删除",
  "data": null
}
```

## 6. 错误码/错误信息（建议）

- `USER_HAS_ORDERS_CANNOT_DELETE`：该用户存在订单记录，无法删除
- `CANNOT_DELETE_SELF`：不能删除当前登录用户
- `CANNOT_DELETE_LAST_ADMIN`：不能删除最后一个管理员
- `USERNAME_NOT_EDITABLE`：用户名不允许修改

建议后端在 `code` / `msg` 的基础上增加更稳定的业务错误标识（可选）：

```json
{
  "code": 40001,
  "msg": "该用户存在订单记录，无法删除",
  "errorKey": "USER_HAS_ORDERS_CANNOT_DELETE",
  "data": null
}
```

