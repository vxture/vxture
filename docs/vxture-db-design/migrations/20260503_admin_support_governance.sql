create schema if not exists support;
create schema if not exists platform;

create table if not exists support.ticket (
  id uuid primary key,
  ticket_no varchar(64) not null,
  tenant_id uuid not null,
  title varchar(200) not null,
  description text not null default '',
  status varchar(32) not null default 'open',
  priority varchar(16) not null default 'p2',
  category varchar(64) not null default 'general',
  source varchar(64) not null default 'admin',
  reporter_name varchar(100),
  assignee_name varchar(100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  due_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  deleted_at timestamptz,
  constraint uq_support_ticket_no unique (ticket_no),
  constraint fk_support_ticket_tenant foreign key (tenant_id) references tenancy.tenant(id),
  constraint chk_support_ticket_status check (status in ('open', 'processing', 'blocked', 'closed')),
  constraint chk_support_ticket_priority check (priority in ('p0', 'p1', 'p2', 'p3'))
);

create index if not exists idx_support_ticket_tenant_status
  on support.ticket(tenant_id, status);

create index if not exists idx_support_ticket_priority_updated
  on support.ticket(priority, updated_at desc);

create index if not exists idx_support_ticket_deleted_at
  on support.ticket(deleted_at);

create table if not exists support.ticket_event (
  id uuid primary key,
  ticket_id uuid not null,
  event_type varchar(64) not null,
  actor_id uuid,
  actor_name varchar(100) not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint fk_support_ticket_event_ticket foreign key (ticket_id) references support.ticket(id) on delete cascade
);

create index if not exists idx_support_ticket_event_ticket_created
  on support.ticket_event(ticket_id, created_at desc);

create table if not exists platform.governance_record (
  id varchar(64) not null,
  kind varchar(32) not null,
  name varchar(160) not null,
  status varchar(32) not null default 'normal',
  scope varchar(160) not null,
  owner varchar(120) not null,
  policy varchar(200) not null,
  description text not null default '',
  tags text[] not null default array[]::text[],
  source_table varchar(128),
  source_id varchar(128),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint pk_platform_governance_record primary key (kind, id),
  constraint chk_platform_governance_kind check (kind in ('admins', 'secrets', 'jobs', 'approvals')),
  constraint chk_platform_governance_status check (status in ('normal', 'warning', 'blocked', 'pending'))
);

create index if not exists idx_platform_governance_kind_status
  on platform.governance_record(kind, status);

create index if not exists idx_platform_governance_kind_updated
  on platform.governance_record(kind, updated_at desc);

create index if not exists idx_platform_governance_tags
  on platform.governance_record using gin(tags);

with tenant_seed as (
  select
    id,
    row_number() over (order by created_at asc, id asc) as rn
  from tenancy.tenant
  where deleted_at is null
  order by created_at asc, id asc
  limit 3
)
insert into support.ticket (
  id,
  ticket_no,
  tenant_id,
  title,
  description,
  status,
  priority,
  category,
  source,
  reporter_name,
  assignee_name,
  created_at,
  updated_at,
  due_at
)
select
  case rn
    when 1 then '00000000-0000-4000-9000-000000000001'::uuid
    when 2 then '00000000-0000-4000-9000-000000000002'::uuid
    else '00000000-0000-4000-9000-000000000003'::uuid
  end,
  case rn
    when 1 then 'TKT-OPS-0001'
    when 2 then 'TKT-OPS-0002'
    else 'TKT-OPS-0003'
  end,
  id,
  case rn
    when 1 then '生产调用凭据轮换确认'
    when 2 then '租户订阅用量告警复核'
    else '模型接入策略执行确认'
  end,
  case rn
    when 1 then '确认生产密钥轮换窗口、影响范围和审计留痕。'
    when 2 then '复核租户用量阈值、订阅状态和业务负责人处理进度。'
    else '确认模型接入策略调整后的租户可用性和回退预案。'
  end,
  case rn
    when 1 then 'open'
    when 2 then 'processing'
    else 'blocked'
  end,
  case rn
    when 1 then 'p1'
    when 2 then 'p2'
    else 'p0'
  end,
  case rn
    when 1 then 'security'
    when 2 then 'usage'
    else 'ai_gateway'
  end,
  'admin',
  '平台运营',
  case rn
    when 1 then '安全治理'
    when 2 then '运营支持'
    else '平台架构'
  end,
  now() - ((4 - rn) || ' hours')::interval,
  now() - ((3 - rn) || ' hours')::interval,
  now() + (rn || ' days')::interval
from tenant_seed
on conflict (ticket_no) do nothing;

insert into support.ticket_event (
  id,
  ticket_id,
  event_type,
  actor_name,
  payload,
  created_at
)
select
  case ticket.ticket_no
    when 'TKT-OPS-0001' then '00000000-0000-4001-9000-000000000001'::uuid
    when 'TKT-OPS-0002' then '00000000-0000-4001-9000-000000000002'::uuid
    else '00000000-0000-4001-9000-000000000003'::uuid
  end,
  ticket.id,
  case ticket.ticket_no
    when 'TKT-OPS-0001' then 'created'
    when 'TKT-OPS-0002' then 'assigned'
    else 'blocked'
  end,
  coalesce(ticket.assignee_name, ticket.reporter_name, '平台运营'),
  jsonb_build_object('status', ticket.status, 'priority', ticket.priority),
  ticket.updated_at
from support.ticket ticket
where ticket.ticket_no in ('TKT-OPS-0001', 'TKT-OPS-0002', 'TKT-OPS-0003')
on conflict (id) do nothing;

insert into platform.governance_record (
  id,
  kind,
  name,
  status,
  scope,
  owner,
  policy,
  description,
  tags,
  source_table,
  source_id,
  created_at,
  updated_at
)
select
  case ticket.ticket_no
    when 'TKT-OPS-0001' then 'secret-provider-key'
    when 'TKT-OPS-0002' then 'job-usage-metering'
    else 'approval-model-route'
  end,
  case ticket.ticket_no
    when 'TKT-OPS-0001' then 'secrets'
    when 'TKT-OPS-0002' then 'jobs'
    else 'approvals'
  end,
  case ticket.ticket_no
    when 'TKT-OPS-0001' then 'Provider Key 轮换'
    when 'TKT-OPS-0002' then '用量聚合作业'
    else '模型路由策略审批'
  end,
  case ticket.ticket_no
    when 'TKT-OPS-0001' then 'warning'
    when 'TKT-OPS-0002' then 'normal'
    else 'pending'
  end,
  case ticket.ticket_no
    when 'TKT-OPS-0001' then '模型网关'
    when 'TKT-OPS-0002' then 'usage-metering'
    else '模型网关'
  end,
  coalesce(ticket.assignee_name, '平台运营'),
  case ticket.ticket_no
    when 'TKT-OPS-0001' then '30 天轮换'
    when 'TKT-OPS-0002' then '每 15 分钟'
    else '双人审批'
  end,
  case ticket.ticket_no
    when 'TKT-OPS-0001' then '跟踪平台级模型 Provider 凭据的轮换周期、可见范围和审计状态。'
    when 'TKT-OPS-0002' then '跟踪租户、产品和模型维度的用量聚合任务执行状态。'
    else '承接平台级模型路由策略变更的审批、执行凭证和审计闭环。'
  end,
  case ticket.ticket_no
    when 'TKT-OPS-0001' then array['平台级', '轮换']
    when 'TKT-OPS-0002' then array['定时任务', '可重试']
    else array['高风险', '待审批']
  end,
  'support.ticket',
  ticket.ticket_no,
  ticket.created_at,
  ticket.updated_at
from support.ticket ticket
where ticket.ticket_no in ('TKT-OPS-0001', 'TKT-OPS-0002', 'TKT-OPS-0003')
on conflict (kind, id) do nothing;
