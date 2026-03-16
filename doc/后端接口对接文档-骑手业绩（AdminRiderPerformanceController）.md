# 后端接口对接文档-骑手业绩（AdminRiderPerformanceController）

## 0. 文档目的
本文档用于后台管理系统的“骑手业绩”页面对接，面向：
- 前端开发（直接对接接口）
- AI/自动化工具（用于生成页面/联调脚本）

接口实现位置：
- `src/main/java/com/xiaos/washstorebackend/admin/controller/AdminRiderPerformanceController.java`

## 1. 通用约定

### 1.1 Base URL
- `/api/admin/rider-performance`

### 1.2 鉴权
- 请求头必须携带 JWT：
  - `Authorization: Bearer <token>`

### 1.3 通用响应结构（AdminResult）
所有接口返回结构：
```json
{
  "code": "00000",
  "data": {},
  "msg": "操作成功"
}
```
- `code="00000"` 表示成功
- `code!="00000"` 表示失败（本控制器主要使用：参数错误 `A0300`）

### 1.4 通用时间口径（非常重要）
- 入参 `startDate/endDate` 采用日期字符串：`YYYY-MM-DD`
- 后端会转换为时间区间：
  - `startTime = startDate 00:00:00`（包含）
  - `endTime = (endDate + 1 day) 00:00:00`（不包含）
- 即：**左闭右开区间** `[startTime, endTime)`

### 1.5 关键枚举
- `taskType`
  - `1`：取件
  - `2`：送件
- `delivery_task.status`
  - `0`：进行中
  - `1`：已完成

### 1.6 “仅看完成”开关（onlyFinished）
- `onlyFinished=1`（默认）：只看已完成任务（相当于强制 `status=1`）
- `onlyFinished=0`：看全部任务；若同时传了 `status` 则只看指定状态

---

## 2. 接口列表总览
- `GET /summary`：顶部 KPI 卡片
- `GET /trend`：趋势图（按日/周聚合）
- `GET /riders`：骑手排行榜/列表（分页 + 排序）
- `GET /tasks`：任务明细列表（分页 + 关键字）

---

## 3. 数据结构（VO）

### 3.1 分页结构（AdminPageResult）
```json
{
  "total": 123,
  "records": []
}
```

### 3.2 汇总卡片（AdminRiderPerformanceSummaryVO）
```json
{
  "totalTasks": 120,
  "finishedTasks": 98,
  "unfinishedTasks": 22,
  "finishRate": 0.8167,
  "pickupTasks": 50,
  "deliveryTasks": 70
}
```

### 3.3 趋势点（AdminRiderPerformanceTrendPointVO）
```json
{
  "date": "2026-03-16",
  "value": 12
}
```
- `granularity=day`：date 为 `YYYY-MM-DD`
- `granularity=week`：date 为“周一日期”的 `YYYY-MM-DD`

### 3.4 骑手业绩行（AdminRiderPerformanceRiderVO）
```json
{
  "riderId": 5,
  "riderName": "骑手张三",
  "riderPhone": "13800138000",
  "totalTasks": 30,
  "finishedTasks": 28,
  "finishRate": 0.9333,
  "pickupTasks": 12,
  "deliveryTasks": 18
}
```

### 3.5 任务明细行（AdminRiderPerformanceTaskVO）
```json
{
  "taskId": 30001,
  "taskType": 2,
  "status": 1,
  "createTime": "2026-03-16 10:12:00",
  "orderId": 90001,
  "orderSn": "202603160001",
  "building": "1号楼",
  "address": "xx大学xx宿舍xx栋xxx",
  "appointmentTime": "2026-03-16 14:00:00",
  "orderStatus": 40,
  "totalPrice": 29.90
}
```
- `totalPrice`：来自 `laundry_order.total_price`，仅用于展示/核对，不参与统计口径。

---

# 4. 接口详情

## 4.1 顶部 KPI 卡片
### GET `/api/admin/rider-performance/summary`

#### Query
- `startDate`：必填，`YYYY-MM-DD`
- `endDate`：必填，`YYYY-MM-DD`
- `riderId`：可选，骑手ID
- `taskType`：可选，`1|2`
- `onlyFinished`：可选，`0|1`，默认 `1`

#### 示例
`/api/admin/rider-performance/summary?startDate=2026-03-01&endDate=2026-03-16&onlyFinished=1`

#### 成功响应示例
```json
{
  "code": "00000",
  "msg": "操作成功",
  "data": {
    "totalTasks": 120,
    "finishedTasks": 98,
    "unfinishedTasks": 22,
    "finishRate": 0.8167,
    "pickupTasks": 50,
    "deliveryTasks": 70
  }
}
```

#### 失败响应（参数）
- 日期格式不对 / 缺少 startDate/endDate / startDate > endDate：
```json
{
  "code": "A0300",
  "msg": "日期格式错误，需为 YYYY-MM-DD",
  "data": null
}
```

---

## 4.2 趋势图
### GET `/api/admin/rider-performance/trend`

#### Query
- `startDate`：必填
- `endDate`：必填
- `riderId`：可选
- `taskType`：可选
- `onlyFinished`：可选，默认 `1`
- `granularity`：可选，`day|week`，默认 `day`
- `metric`：可选，`finishedTasks|totalTasks`，默认 `finishedTasks`

#### 说明
- `metric=finishedTasks`：统计完成任务趋势（强制 status=1）
- `metric=totalTasks`：
  - 若 `onlyFinished=1`：仍仅统计完成任务（与页面“仅看完成”语义一致）
  - 若 `onlyFinished=0`：统计全部任务（status 不过滤）

#### 成功响应示例
```json
{
  "code": "00000",
  "msg": "操作成功",
  "data": [
    { "date": "2026-03-10", "value": 8 },
    { "date": "2026-03-11", "value": 12 }
  ]
}
```

---

## 4.3 骑手排行榜/列表
### GET `/api/admin/rider-performance/riders`

#### Query
- `startDate`：必填
- `endDate`：必填
- `taskType`：可选
- `onlyFinished`：可选，默认 `1`
- `page`：可选，默认 `1`
- `pageSize`：可选，默认 `10`
- `sortBy`：可选
  - `finishedTasks`（默认）
  - `finishRate`
  - `totalTasks`
- `sortOrder`：可选 `asc|desc`，默认 `desc`

#### 成功响应示例
```json
{
  "code": "00000",
  "msg": "操作成功",
  "data": {
    "total": 23,
    "records": [
      {
        "riderId": 5,
        "riderName": "骑手张三",
        "riderPhone": "13800138000",
        "totalTasks": 30,
        "finishedTasks": 28,
        "finishRate": 0.9333,
        "pickupTasks": 12,
        "deliveryTasks": 18
      }
    ]
  }
}
```

---

## 4.4 任务明细列表
### GET `/api/admin/rider-performance/tasks`

#### Query
- `startDate`：必填
- `endDate`：必填
- `riderId`：可选（不传=全体）
- `taskType`：可选
- `onlyFinished`：可选，默认 `1`
- `status`：可选 `0|1`
  - 当 `onlyFinished=1` 时该参数会被忽略（强制完成）
- `keyword`：可选（模糊匹配订单号/楼栋/地址/骑手昵称/手机号）
- `page`：默认 `1`
- `pageSize`：默认 `10`

#### 成功响应示例
```json
{
  "code": "00000",
  "msg": "操作成功",
  "data": {
    "total": 100,
    "records": [
      {
        "taskId": 30001,
        "taskType": 2,
        "status": 1,
        "createTime": "2026-03-16 10:12:00",
        "orderId": 90001,
        "orderSn": "202603160001",
        "building": "1号楼",
        "address": "xx大学xx宿舍xx栋xxx",
        "appointmentTime": "2026-03-16 14:00:00",
        "orderStatus": 40,
        "totalPrice": 29.90
      }
    ]
  }
}
```

---

## 5. 前端对接建议
- 页面初始化：并行请求
  - `summary`（卡片）
  - `trend`（趋势）
  - `riders`（排行表）
  - `tasks`（明细表，可默认 onlyFinished=1）
- 点击骑手行：带 `riderId` 重新请求上述 4 个接口，实现页面联动。

---

## 6. 常见问题（FAQ）
- **为什么 totalTasks 在 onlyFinished=1 时也等于完成数？**
  - 这是与页面“仅看完成”开关保持一致：开关打开时整页都只看完成任务。
- **totalPrice 是否参与统计？**
  - 不参与。本期业绩统计以 `delivery_task` 为准，金额仅展示用于核对。
