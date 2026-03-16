# 洗衣店后台管理系统 - 后端接口对接文档（骑手大厅 / 任务大厅手动指派模式）

> 面向：前端开发 + AI（用于自动生成前端调用代码/联调脚本）
>
> 功能来源：`AdminRiderHallController`
>
> 重要说明：
> - **取件 / 送回任务分开**：`taskType=1(取件)`，`taskType=2(送回)`。
> - 系统现有表结构 `delivery_task.status` 只有：`0-进行中`、`1-已完成`。
> - 因此本系统中的 **“待指派”** 不是 `delivery_task.status` 的一种，而是由订单推导：
>   - 取件待指派：`order.status=0` 且不存在 `delivery_task(order_id, task_type=1)`
>   - 送回待指派：`order.status=30` 且不存在 `delivery_task(order_id, task_type=2)`

---

## 1. 基本约定

### 1.1 Base URL
- 管理端接口前缀：`/api/admin`

### 1.2 鉴权
- Header：`Authorization: Bearer <token>`
- 仅管理员允许访问（由拦截器控制）

### 1.3 统一响应结构（以当前后端实现为准）

```json
{
  "code": "00000",
  "data": {},
  "msg": "操作成功"
}
```

- `code == "00000"` 表示成功
- 失败时 `code` 为业务码，例如：`A0300` `A0400` `A0404` `A0500`

### 1.4 分页约定
- 请求：`page`（从 1 开始）、`size`
- 响应：`data.records`、`data.total`、`data.pages`

### 1.5 日期格式
- `startDate` / `endDate`：`YYYY-MM-DD`
- 后端会将 `endDate` 转换为右开区间（`endDate + 1 day 00:00:00`）

---

## 2. 枚举约定

### 2.1 taskType
| 值 | 含义 |
|---:|---|
| 1 | 取件任务 |
| 2 | 送回任务 |

### 2.2 delivery_task.status（真实数据库字段）
| 值 | 含义 |
|---:|---|
| 0 | 进行中 |
| 1 | 已完成 |

### 2.3 listType（任务列表的查询口径）
| 值 | 含义 |
|---|---|
| `TASK` | 查询配送任务列表（来自 `delivery_task`） |
| `WAIT_ASSIGN` | 查询待指派列表（来自订单推导） |

---

## 3. 接口清单

- `GET  /api/admin/rider-hall/task` 任务列表（支持 TASK / WAIT_ASSIGN 两种口径）
- `GET  /api/admin/rider-hall/task/{taskId}` 任务详情（任务 + 订单摘要 + 骑手 + events）
- `GET  /api/admin/rider-hall/metrics` 顶部统计卡片
- `GET  /api/admin/rider-hall/rider/list` 骑手列表（指派弹窗）
- `POST /api/admin/rider-hall/task/assign` 指派骑手

---

## 4. 任务列表

### 4.1 查询 TASK（delivery_task）列表

**接口地址：** `GET /api/admin/rider-hall/task`

#### 请求参数（query）
| 参数名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| listType | string | 否 | 固定传 `TASK`（默认就是 TASK） |
| page | number | 否 | 默认 1 |
| size | number | 否 | 默认 10 |
| taskType | number | 否 | 1-取件 2-送回 |
| taskStatusList | string | 否 | 任务状态集合，逗号分隔，例如：`0,1` |
| keyword | string | 否 | 关键词：订单号/楼栋/地址/骑手昵称/手机号 |
| startDate | string | 否 | 创建日期起 `YYYY-MM-DD` |
| endDate | string | 否 | 创建日期止 `YYYY-MM-DD` |
| riderId | number | 否 | 骑手ID |
| orderId | number | 否 | 订单ID |

#### 响应（data）

```json
{
  "records": [
    {
      "taskId": 10001,
      "orderId": 90001,
      "orderSn": "202603160001",
      "taskType": 1,
      "taskStatus": 0,
      "deliveryFee": 5.00,
      "createTime": "2026-03-16 10:12:00",
      "finishTime": null,
      "building": "1号楼",
      "address": "xx大学xx宿舍xx栋xxx",
      "appointmentTime": "2026-03-16 14:00:00",
      "orderStatus": 10,
      "riderId": 5,
      "riderName": "骑手张三",
      "riderPhone": "13800138000",
      "fromAddress": "xx大学xx宿舍xx栋xxx",
      "toAddress": "洗衣店"
    }
  ],
  "total": 1,
  "pages": 1
}
```

> `fromAddress/toAddress` 由后端按 taskType 补齐（洗衣店地址当前为固定文案）。

---

### 4.2 查询 WAIT_ASSIGN（待指派）列表

**接口地址：** `GET /api/admin/rider-hall/task`

#### 请求参数（query）
| 参数名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| listType | string | 是 | 固定传 `WAIT_ASSIGN` |
| page | number | 否 | 默认 1 |
| size | number | 否 | 默认 10 |
| taskType | number | 否 | 1-仅取件待指派；2-仅送回待指派；不传返回两类 |
| keyword | string | 否 | 关键词：订单号/楼栋/地址 |
| startDate | string | 否 | 订单创建日期起 |
| endDate | string | 否 | 订单创建日期止 |

#### 响应（data）

```json
{
  "records": [
    {
      "taskId": null,
      "taskStatus": "WAIT_ASSIGN",
      "orderId": 90001,
      "orderSn": "202603160001",
      "orderStatus": 0,
      "taskType": 1,
      "building": "1号楼",
      "address": "xx大学xx宿舍xx栋xxx",
      "appointmentTime": "2026-03-16 14:00:00",
      "createTime": "2026-03-16 10:12:00",
      "totalPrice": 29.90,
      "fromAddress": "xx大学xx宿舍xx栋xxx",
      "toAddress": "洗衣店"
    }
  ],
  "total": 1,
  "pages": 1
}
```

> 说明：待指派记录没有 `delivery_task.id`，因此 `taskId=null`。
> 前端指派时使用 `orderId + taskType` 发起指派即可。

---

## 5. 任务详情

**接口地址：** `GET /api/admin/rider-hall/task/{taskId}`

#### Path 参数
| 参数名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| taskId | number | 是 | delivery_task.id |

#### 响应（data）

```json
{
  "task": {
    "id": 10001,
    "orderId": 90001,
    "riderId": 5,
    "taskType": 1,
    "fee": 5.00,
    "status": 0,
    "photoUrl": null,
    "finishTime": null,
    "createTime": "2026-03-16 10:12:00"
  },
  "detail": {
    "id": 10001,
    "taskType": 1,
    "fee": 5.00,
    "photoUrl": null,
    "finishTime": null,
    "orderId": 90001,
    "orderSn": "202603160001",
    "building": "1号楼",
    "address": "xx大学xx宿舍xx栋xxx",
    "appointmentTime": "2026-03-16 14:00:00",
    "orderStatus": 10,
    "createTime": "2026-03-16 10:12:00",
    "remark": "",
    "totalPrice": 29.90
  },
  "rider": {
    "riderId": 5,
    "riderName": "骑手张三",
    "riderPhone": "13800138000"
  },
  "events": [
    {
      "eventId": 1,
      "eventName": "管理员指派骑手（取件任务）",
      "nodeStatus": 10,
      "operatorId": 4,
      "remark": null,
      "eventTime": "2026-03-16 10:15:00"
    }
  ]
}
```

---

## 6. 统计卡片

**接口地址：** `GET /api/admin/rider-hall/metrics`

#### 响应（data）

```json
{
  "waitAssignCount": 12,
  "inProgressCount": 8,
  "doneCount": 20
}
```

---

## 7. 骑手列表（指派弹窗）

**接口地址：** `GET /api/admin/rider-hall/rider/list`

#### 请求参数（query）
| 参数名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| page | number | 否 | 默认 1 |
| size | number | 否 | 默认 20 |

#### 响应（data）

```json
{
  "records": [
    {
      "id": 5,
      "username": "rider1",
      "nickname": "骑手张三",
      "phone": "13800138000",
      "avatar": "/uploads/avatar1.jpg",
      "status": 1
    }
  ],
  "total": 1,
  "pages": 1
}
```

---

## 8. 指派骑手（核心）

**接口地址：** `POST /api/admin/rider-hall/task/assign`

#### 请求头
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

#### 请求体（JSON）

```json
{
  "orderId": 13,
  "riderId": 5,
  "taskType": 1
}
```

#### 业务规则（后端已实现）
- 参数必填：`orderId/riderId/taskType`
- `taskType` 仅允许 `1/2`
- 幂等校验：已存在 `delivery_task(orderId, taskType)` 则拒绝
- 状态校验：
  - `taskType=1` 仅允许 `order.status=0`，成功后 `order.status=10`
  - `taskType=2` 仅允许 `order.status=30`，成功后 `order.status=40`
- 并发控制：更新订单时使用条件更新（where id and status），失败提示刷新重试
- 事务：订单更新 + task 生成 + trace 写入 要么全成功要么全回滚

#### 成功响应
```json
{
  "code": "00000",
  "data": null,
  "msg": "操作成功"
}
```

#### 常见失败响应
- 参数缺失：`code=A0300 msg=参数缺失`
- taskType 非法：`code=A0300 msg=任务类型参数错误`
- 订单不存在：`code=A0404 msg=订单不存在`
- 骑手不存在：`code=A0404 msg=骑手不存在`
- 状态不允许：`code=A0400 msg=订单当前状态不允许指派该类型任务`
- 并发更新失败：`code=A0500 msg=订单状态已变更或更新失败，请刷新后重试`
- 重复指派：`code=A0400 msg=该订单该阶段已存在派单任务，请勿重复指派`
