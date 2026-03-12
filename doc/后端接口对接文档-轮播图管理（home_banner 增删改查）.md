# 洗衣店后台管理系统 - 后端接口对接文档（轮播图管理 home_banner：增删改查）

> 本文档用于前后端联调对齐。
>
> 业务背景：
> - 前端页面：`/#/service/banner`
> - 管理对象：`home_banner`
> - 支持：新增、删除、编辑（title、tag、image_url、link_type、link_value、sort_order、status）

---

## 1. 基本约定

### 1.1 Base URL
- 管理端接口前缀：`/api/admin`

### 1.2 鉴权
- `Authorization: Bearer <token>`

### 1.3 统一响应结构（与前端 axios 封装一致）

前端 `src/utils/request.ts` 按如下结构解析：

```json
{
  "code": 0,
  "data": {},
  "msg": "ok"
}
```

- `code == 0`：成功，前端返回 `data`
- `code != 0`：失败，前端弹出 `msg`

### 1.4 时间格式
- `YYYY-MM-DD HH:mm:ss`

---

## 2. 数据模型

### 2.1 表：home_banner（轮播图）

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---:|---|---|
| id | int | 是 | - | 主键 |
| title | varchar(100) | 否 | NULL | 标题 |
| tag | varchar(50) | 否 | NULL | 标签 |
| image_url | varchar(255) | 是 | - | 图片 URL |
| link_type | tinyint | 否 | 0 | 链接类型：0-无，1-服务详情，2-H5 |
| link_value | varchar(255) | 否 | NULL | 链接参数（随 link_type 不同而不同） |
| bg_color | varchar(50) | 否 | linear-gradient(135deg, #E0F2FF, #FFFFFF) | 背景色（当前前端未提供编辑，可后续扩展） |
| sort_order | int | 否 | 0 | 排序（数字越小越靠前，或按约定） |
| status | tinyint | 否 | 1 | 状态：1-启用，0-禁用 |
| create_time | datetime | 否 | CURRENT_TIMESTAMP | 创建时间 |
| update_time | datetime | 否 | CURRENT_TIMESTAMP | 更新时间（自动更新） |

---

## 3. 字段与业务规则

### 3.1 link_type 枚举

| link_type | 含义 | link_value 说明 |
|---:|---|---|
| 0 | 无 | 必须为空或忽略 |
| 1 | 服务详情 | `link_value` 建议为服务 ID（数字字符串）或后端约定的唯一标识 |
| 2 | H5 | `link_value` 为 H5 链接（URL） |

### 3.2 前端校验规则（建议后端同步校验）

- `image_url` 必填
- 当 `link_type != 0` 时：`link_value` 必填

---

## 4. 接口清单（与前端对接一致）

> 前端当前对接路径为：`/api/admin/home-banner`

- `GET    /api/admin/home-banner` 轮播图分页列表
- `POST   /api/admin/home-banner` 新增轮播图
- `PUT    /api/admin/home-banner/{id}` 修改轮播图
- `DELETE /api/admin/home-banner/{id}` 删除轮播图

---

## 5. 获取轮播图分页列表

**接口地址：** `GET /api/admin/home-banner`

### 5.1 请求参数（query）

| 参数名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| page | number | 否 | 页码，从 1 开始，默认 1 |
| size | number | 否 | 每页数量，默认 10 |

> 当前前端页面未做筛选条件（如按 tag/status 搜索）；后端可先不实现筛选。

### 5.2 响应 data（推荐结构：分页）

```json
{
  "records": [
    {
      "id": 1,
      "title": "春季洗护活动",
      "tag": "活动",
      "image_url": "/uploads/banner/1.jpg",
      "link_type": 2,
      "link_value": "https://example.com/h5",
      "bg_color": "linear-gradient(135deg, #E0F2FF, #FFFFFF)",
      "sort_order": 0,
      "status": 1,
      "create_time": "2026-03-11 10:00:00",
      "update_time": "2026-03-11 10:00:00"
    }
  ],
  "total": 1,
  "pages": 1
}
```

### 5.3 响应 data（兼容结构）

为兼容后端已有分页返回，也可使用：

- `data: { list: [], total: 0 }`
- 或 `data: { data: [], total: 0 }`

> 前端已做兼容：优先取 `records`，其次 `list`，再其次 `data`。

---

## 6. 新增轮播图

**接口地址：** `POST /api/admin/home-banner`

### 6.1 请求体（JSON）

> 仅传可编辑字段。未传字段后端按表默认值处理。

```json
{
  "title": "春季洗护活动",
  "tag": "活动",
  "image_url": "/uploads/banner/1.jpg",
  "link_type": 2,
  "link_value": "https://example.com/h5",
  "sort_order": 0,
  "status": 1
}
```

### 6.2 响应 data

推荐返回：

```json
{
  "id": 1
}
```

也可 `data: null`，但建议返回新建 ID 便于定位。

---

## 7. 修改轮播图

**接口地址：** `PUT /api/admin/home-banner/{id}`

### 7.1 Path 参数

| 参数名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | number | 是 | home_banner.id |

### 7.2 请求体（JSON）

```json
{
  "title": "春季洗护活动(更新)",
  "tag": "活动",
  "image_url": "/uploads/banner/1.jpg",
  "link_type": 1,
  "link_value": "10086",
  "sort_order": 1,
  "status": 1
}
```

### 7.3 响应
- `data: null` 即可

---

## 8. 删除轮播图

**接口地址：** `DELETE /api/admin/home-banner/{id}`

### 8.1 Path 参数

| 参数名 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | number | 是 | home_banner.id |

### 8.2 响应
- `data: null` 即可

---

## 9. 错误码与异常处理建议

- `code != 0` 时：返回 `msg` 说明失败原因
- 建议对以下情况返回明确 msg：
  - `image_url` 为空
  - `link_type != 0` 且 `link_value` 为空
  - 删除不存在的 ID

---

## 10. 前端对接位置

- 前端 API：`src/api/banner.ts`
- 前端页面：`src/views/service/banner/index.vue`
- 路由：`/#/service/banner`
