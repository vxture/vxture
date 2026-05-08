# Admin 工单与运营待办数据库设计草案

> 状态：待确认。当前变更不创建数据库、不初始化数据，只定义正式持久化方案。

## 目标

工单中心和运营待办必须读取正式数据库，不使用前端样本数据，也不在接口层做假数据 fallback。

运营待办优先作为聚合视图生成：

- 租户认证待审：来自 `tenancy.tenant`。
- 风险复核：来自 `tenancy.tenant` 与 `tenancy.tenant_config`。
- 用量异常：来自订阅额度和用量汇总表。
- 订阅跟进：来自订阅表。
- 工单处理：来自 `support.ticket`。

## 工单表

建议新增 schema：`support`。

核心表：`support.ticket`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 主键 |
| `ticket_no` | `varchar(64)` | 业务编号，唯一 |
| `tenant_id` | `uuid` | 关联 `tenancy.tenant.id` |
| `title` | `varchar(200)` | 工单标题 |
| `description` | `text` | 工单说明 |
| `status` | `varchar(32)` | `open / processing / blocked / closed` |
| `priority` | `varchar(16)` | `p0 / p1 / p2 / p3` |
| `category` | `varchar(64)` | 工单分类 |
| `source` | `varchar(64)` | 来源渠道 |
| `reporter_name` | `varchar(100)` | 提交人快照 |
| `assignee_name` | `varchar(100)` | 处理人快照 |
| `created_at` | `timestamptz` | 创建时间 |
| `updated_at` | `timestamptz` | 更新时间 |
| `due_at` | `timestamptz` | SLA 截止时间 |
| `resolved_at` | `timestamptz` | 解决时间 |
| `closed_at` | `timestamptz` | 关闭时间 |
| `deleted_at` | `timestamptz` | 软删除时间 |

建议索引：

- `unique(ticket_no)`
- `(tenant_id, status)`
- `(priority, updated_at desc)`
- `(deleted_at)` 或局部索引 `where deleted_at is null`

## 工单事件表

建议新增：`support.ticket_event`

用于记录状态流转、评论、指派、优先级变更。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 主键 |
| `ticket_id` | `uuid` | 关联 `support.ticket.id` |
| `event_type` | `varchar(64)` | 事件类型 |
| `actor_id` | `uuid` | 操作人 |
| `actor_name` | `varchar(100)` | 操作人快照 |
| `payload` | `jsonb` | 事件内容 |
| `created_at` | `timestamptz` | 创建时间 |

## 运营待办

第一阶段不建议落实体待办表，避免待办与源业务状态不一致。页面按正式数据库实时聚合：

- `support.ticket.status != 'closed'` 生成工单待办。
- `tenancy.tenant.verified_status = 'pending'` 生成认证待审。
- `tenancy.tenant_config.risk_level != 'normal'` 或租户停用生成风险复核。
- 用量达到阈值生成用量异常。
- 订阅试用、逾期生成订阅跟进。

如后续需要人工分派、认领、忽略、延期，再新增 `operation.todo`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 主键 |
| `source_type` | `varchar(64)` | 来源类型 |
| `source_id` | `uuid` | 来源记录 |
| `tenant_id` | `uuid` | 关联租户 |
| `status` | `varchar(32)` | `open / claimed / done / ignored` |
| `assignee_id` | `uuid` | 处理人 |
| `due_at` | `timestamptz` | 截止时间 |
| `created_at` | `timestamptz` | 创建时间 |
| `updated_at` | `timestamptz` | 更新时间 |

## 接口约束

- `/api/tickets` 只读 `support.ticket`。
- 如果 `support.ticket` 未建设，接口返回 502，并明确提示需要确认数据库设计。
- 前端不使用样本数据兜底，不把接口失败伪装为空数据。
