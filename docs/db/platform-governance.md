# Admin 平台治理数据库设计草案

> 状态：待确认。当前变更不创建数据库、不初始化数据，只定义正式持久化方案。

## 范围

覆盖自治域中当前共用治理清单的数据来源：

- `admins`：平台用户治理视图。
- `secrets`：密钥管理。
- `jobs`：任务调度。
- `approvals`：审批中心。

平台用户已有专门的用户、角色、权限数据库接口时，应优先使用专门接口；治理表只承载统一治理视图，不替代核心身份表。

## 统一治理记录表

建议新增：`ops.governance_record`

| 字段           | 类型           | 说明                                   |
| -------------- | -------------- | -------------------------------------- |
| `id`           | `varchar(64)`  | 业务主键                               |
| `kind`         | `varchar(32)`  | `admins / secrets / jobs / approvals`  |
| `name`         | `varchar(160)` | 显示名称                               |
| `status`       | `varchar(32)`  | `normal / warning / blocked / pending` |
| `scope`        | `varchar(160)` | 作用域、对象或队列                     |
| `owner`        | `varchar(120)` | 负责人、角色或发起人                   |
| `policy`       | `varchar(200)` | 策略摘要                               |
| `description`  | `text`         | 生产环境说明                           |
| `tags`         | `text[]`       | 标签                                   |
| `source_table` | `varchar(128)` | 可选，来源表                           |
| `source_id`    | `varchar(128)` | 可选，来源记录                         |
| `created_at`   | `timestamptz`  | 创建时间                               |
| `updated_at`   | `timestamptz`  | 更新时间                               |
| `deleted_at`   | `timestamptz`  | 软删除时间                             |

建议索引：

- `(kind, status)`
- `(kind, updated_at desc)`
- `gin(tags)`
- `unique(kind, id)`

## 接口约束

- `/api/platform-governance/:kind` 只读 `ops.governance_record`。
- 如果表未建设，接口返回 502，并提示先确认数据库设计。
- 前端不使用配置样本或接口 fallback。
