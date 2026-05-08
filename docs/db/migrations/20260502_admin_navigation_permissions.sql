do $$
declare
  actor_id uuid;
begin
  select id
  into actor_id
  from platform.platform_admin
  where deleted_at is null
  order by is_system desc, created_at asc
  limit 1;

  if actor_id is null then
    actor_id := '00000000-0000-0000-0000-000000000000'::uuid;
  end if;

  create or replace function platform.sync_platform_architect_perm()
  returns trigger as $fn$
  declare
      platform_architect_id uuid;
      permission_actor_id uuid;
  begin
      select id
      into platform_architect_id
      from platform.platform_role
      where role_code = 'PLATFORM_ARCHITECT'
      limit 1;

      if platform_architect_id is null then
          return coalesce(new, old);
      end if;

      select id
      into permission_actor_id
      from platform.platform_admin
      where deleted_at is null
      order by is_system desc, created_at asc
      limit 1;

      permission_actor_id := coalesce(permission_actor_id, '00000000-0000-0000-0000-000000000000'::uuid);

      if tg_op = 'INSERT' then
          insert into platform.platform_role_permission (role_id, permission_id, created_by)
          values (platform_architect_id, new.id, permission_actor_id)
          on conflict (role_id, permission_id) do nothing;
      elsif tg_op = 'DELETE' then
          delete from platform.platform_role_permission
          where permission_id = old.id;
      end if;

      return coalesce(new, old);
  end;
  $fn$ language plpgsql;

  create temporary table if not exists tmp_admin_permission_seed (
    perm_code varchar(64) primary key,
    parent_code varchar(64),
    perm_name varchar(64) not null,
    perm_type varchar(20) not null,
    description varchar(255) not null default '',
    icon varchar(64),
    sort int not null,
    route_path varchar(255),
    component varchar(255)
  ) on commit drop;

  truncate table tmp_admin_permission_seed;

  insert into tmp_admin_permission_seed
    (perm_code, parent_code, perm_name, perm_type, description, icon, sort, route_path, component)
  values
    ('admin.workspace.tenant_ops', null, '运营业务域', 'MENU', '面向租户、用户、产品、订阅、交易和服务支持的运营管理。', 'buildings', 1000, '/', 'workspace:tenant-ops'),
    ('admin.workspace.platform', null, '平台自治域', 'MENU', '面向内部用户、平台资源、运行可靠性、安全审计和治理能力。', 'shield-check', 2000, '/platform', 'workspace:platform-autonomy'),

    ('admin.section.ops_overview', 'admin.workspace.tenant_ops', '运营总览', 'MENU', '运营业务域的总览、待办和核心指标。', 'squares-four', 1100, null, 'section:overview'),
    ('admin.menu.platform_overview', 'admin.section.ops_overview', '平台概览', 'MENU', '核心运营指标、各业务域关键趋势和平台健康快照。', 'squares-four', 1110, '/', 'page:platformOverview'),
    ('admin.menu.ops_todos', 'admin.section.ops_overview', '运营待办', 'MENU', '聚合待审核、异常告警和需要人工介入的运营任务。', 'table', 1120, '/ops-todos', 'page:opsTodos'),

    ('admin.section.tenants', 'admin.workspace.tenant_ops', '租户与账号', 'MENU', '租户、账号和组织认证管理。', 'buildings', 1200, null, 'section:tenantsAccounts'),
    ('admin.menu.tenants', 'admin.section.tenants', '租户管理', 'MENU', '管理平台租户资料、状态、生命周期和运营备注。', 'buildings', 1210, '/tenants', 'page:tenants'),
    ('admin.menu.accounts', 'admin.section.tenants', '账号管理', 'MENU', '跨租户查询平台账号，管理账号状态、登录安全和联系方式。', 'user', 1220, '/accounts', 'page:accounts'),
    ('admin.menu.verifications', 'admin.section.tenants', '组织认证', 'MENU', '审核租户企业资质材料，处理通过、驳回和复核状态。', 'medal', 1230, '/verifications', 'page:verifications'),

    ('admin.section.products', 'admin.workspace.tenant_ops', '产品与套餐', 'MENU', '产品方案、服务套餐、产品能力和推广优惠管理。', 'database', 1300, null, 'section:productsPlans'),
    ('admin.menu.service_plans', 'admin.section.products', '服务套餐', 'MENU', '管理 Free、Pro、企业版等服务套餐，配置配额、价格和售卖范围。', 'star', 1310, '/service-plans', 'page:servicePlans'),
    ('admin.menu.product_solutions', 'admin.section.products', '产品方案', 'MENU', '按行业业务场景组合产品能力，定义方案边界、包含产品和适用客户。', 'workflow', 1320, '/product-solutions', 'page:productSolutions'),
    ('admin.menu.products', 'admin.section.products', '产品能力', 'MENU', '管理可组合、可授权、可计量的基础产品能力。', 'database', 1330, '/products', 'page:products'),
    ('admin.menu.promotions', 'admin.section.products', '推广优惠', 'MENU', '配置优惠码和折扣活动，限定适用产品、套餐和核销规则。', 'sparkles', 1340, '/promotions', 'page:promotions'),

    ('admin.section.commerce', 'admin.workspace.tenant_ops', '订阅与交易', 'MENU', '订阅权益、订单、用量、优惠核销和商业指标。', 'chart-bar', 1400, null, 'section:subscriptionsTransactions'),
    ('admin.menu.commerce_overview', 'admin.section.commerce', '商业概览', 'MENU', '聚合订阅、订单、收款、账单、发票、用量和优惠的运营指标与风险快照。', 'chart-bar', 1410, '/commerce-overview', 'page:commerceOverview'),
    ('admin.menu.subscriptions', 'admin.section.commerce', '订阅权益', 'MENU', '运营侧管理租户服务权益实例，处理试用转正、续期、暂停、取消和配额风险。', 'star', 1420, '/subscriptions', 'page:subscriptions'),
    ('admin.menu.orders', 'admin.section.commerce', '交易订单', 'MENU', '查询订单列表和详情，追踪支付状态并处理异常订单。', 'table', 1430, '/orders', 'page:orders'),
    ('admin.menu.usage_metering', 'admin.section.commerce', '用量计量', 'MENU', '查询租户、产品和套餐维度的用量明细，维护计量规则和异常告警。', 'graph', 1440, '/usage-metering', 'page:usageMetering'),
    ('admin.menu.promotion_redemptions', 'admin.section.commerce', '优惠核销', 'MENU', '查看优惠码使用记录、折扣核销统计和订单关联数据。', 'check', 1450, '/promotion-redemptions', 'page:promotionRedemptions'),

    ('admin.section.models_skills', 'admin.workspace.tenant_ops', '模型与技能', 'MENU', '模型策略和智能体技能接入管理。', 'shield-check', 1500, null, 'section:capabilitiesServices'),
    ('admin.menu.model_grants', 'admin.section.models_skills', '模型策略', 'MENU', '按产品、租户和套餐配置模型访问权限、配额和路由优先级。', 'shield-check', 1510, '/model-grants', 'page:modelGrants'),
    ('admin.menu.skills', 'admin.section.models_skills', '技能接入', 'MENU', '注册和管理智能体可调用技能，配置上下线、端点和运行状态。', 'cube', 1520, '/skills', 'page:skills'),

    ('admin.section.finance', 'admin.workspace.tenant_ops', '财务与结算', 'MENU', '账单、收款和发票管理。', 'key', 1600, null, 'section:financeSettlement'),
    ('admin.menu.billing', 'admin.section.finance', '账单管理', 'MENU', '管理账单生成、应收确认、异常处理和线下发票登记入口。', 'key', 1610, '/billing', 'page:billing'),
    ('admin.menu.payments', 'admin.section.finance', '收款管理', 'MENU', '收款台账与对账视角，查看收款、账单关联和需关注流水。', 'check', 1620, '/payments', 'page:payments'),
    ('admin.menu.invoices', 'admin.section.finance', '发票管理', 'MENU', '线下发票台账，跟踪开票登记、寄送交付、红冲作废和账单关联。', 'table', 1630, '/invoices', 'page:invoices'),

    ('admin.section.support', 'admin.workspace.tenant_ops', '服务与支持', 'MENU', '工单反馈、通知公告和服务支持能力。', 'chat-circle', 1700, null, 'section:supportCompliance'),
    ('admin.menu.tickets', 'admin.section.support', '工单反馈', 'MENU', '处理用户工单、人工分派、状态流转和反馈闭环。', 'chat-circle', 1710, '/tickets', 'page:tickets'),
    ('admin.menu.announcements', 'admin.section.support', '通知公告', 'MENU', '发布平台公告和定向通知，查询通知触达与历史记录。', 'bell', 1720, '/announcements', 'page:announcements'),

    ('admin.section.autonomy', 'admin.workspace.platform', '自治总览', 'MENU', '平台自治域的运行总览。', 'squares-four', 2100, null, 'section:autonomyOverview'),
    ('admin.menu.platform', 'admin.section.autonomy', '平台自治', 'MENU', '观察平台内部身份、权限、供给资源、运行状态和安全审计。', 'squares-four', 2110, '/platform', 'page:platformAutonomy'),

    ('admin.section.identity', 'admin.workspace.platform', '身份与权限', 'MENU', '平台内部用户、角色和权限管理。', 'user', 2200, null, 'section:identityAccess'),
    ('admin.menu.platform_admins', 'admin.section.identity', '用户管理', 'MENU', '管理平台内部管理员、运营人员和运维人员账号。', 'user', 2210, '/platform-admins', 'page:platformAdmins'),
    ('admin.menu.admin_roles', 'admin.section.identity', '角色权限', 'MENU', '维护运营平台内部角色和权限配置，与租户侧权限隔离。', 'role', 2220, '/admin-roles', 'page:adminRoles'),
    ('admin.menu.admin_permissions', 'admin.section.identity', '权限管理', 'MENU', '展示和治理 admin 平台全部菜单、按钮和接口权限。', 'shield-check', 2230, '/admin-permissions', 'page:adminPermissions'),

    ('admin.section.resources', 'admin.workspace.platform', '平台资源', 'MENU', '模型接入、密钥配置和平台供给资源。', 'cloud', 2300, null, 'section:platformResources'),
    ('admin.menu.model_gateway', 'admin.section.resources', '模型接入', 'MENU', '维护 LLM Provider、API Key、限流、超时和调用端点。', 'cloud', 2310, '/model-gateway', 'page:modelGateway'),
    ('admin.menu.platform_secrets', 'admin.section.resources', '密钥配置', 'MENU', '集中管理平台级密钥、凭据、轮换策略和最小可见范围。', 'key', 2320, '/platform-secrets', 'page:platformSecrets'),

    ('admin.section.reliability', 'admin.workspace.platform', '运行与可靠性', 'MENU', '服务监控、任务队列和关键运行状态。', 'server', 2400, null, 'section:operationsReliability'),
    ('admin.menu.service_monitor', 'admin.section.reliability', '服务监控', 'MENU', '查看服务运行详情、响应时间、错误率、可用性指标和告警规则。', 'server', 2410, '/service-monitor', 'page:serviceMonitor'),
    ('admin.menu.platform_jobs', 'admin.section.reliability', '任务队列', 'MENU', '观察平台异步任务、重试、死信和关键调度状态。', 'workflow', 2420, '/platform-jobs', 'page:platformJobs'),

    ('admin.section.security', 'admin.workspace.platform', '安全与审计', 'MENU', '审计日志、审批中心和高风险操作治理。', 'info', 2500, null, 'section:securityAudit'),
    ('admin.menu.audit_logs', 'admin.section.security', '审计日志', 'MENU', '追溯运营后台关键操作，按操作人、时间和对象筛选审计记录。', 'info', 2510, '/audit-logs', 'page:auditLogs'),
    ('admin.menu.approval_center', 'admin.section.security', '审批中心', 'MENU', '承接高风险操作的二次确认、审批流和执行凭证。', 'check', 2520, '/approval-center', 'page:approvalCenter'),

    ('platform.admin.manage', 'admin.section.identity', '平台管理员管理', 'API', '管理平台内部用户、角色、权限和平台自治配置。', 'shield-check', 9000, null, 'capability:platform.admin.manage'),
    ('platform.tenant.manage', 'admin.section.tenants', '租户运营管理', 'API', '管理租户、账号、认证和租户生命周期运营能力。', 'buildings', 9010, null, 'capability:platform.tenant.manage'),
    ('platform.product.manage', 'admin.section.products', '产品能力管理', 'API', '管理产品、套餐、产品方案和权益供给配置。', 'database', 9020, null, 'capability:platform.product.manage'),
    ('platform.pricing.manage', 'admin.section.commerce', '商业计费管理', 'API', '管理订阅、订单、账单、收款、发票和优惠。', 'key', 9030, null, 'capability:platform.pricing.manage'),
    ('platform.model.manage', 'admin.section.resources', '模型供给管理', 'API', '管理平台模型接入、模型策略和模型资源配置。', 'cloud', 9040, null, 'capability:platform.model.manage');

  insert into platform.platform_permission (
    perm_code, parent_id, perm_name, perm_type, status, description, icon, sort, route_path, component, created_by, updated_by
  )
  select
    seed.perm_code,
    null,
    seed.perm_name,
    seed.perm_type,
    true,
    seed.description,
    seed.icon,
    seed.sort,
    seed.route_path,
    seed.component,
    actor_id,
    actor_id
  from tmp_admin_permission_seed seed
  on conflict (perm_code) do update
    set perm_name = excluded.perm_name,
        perm_type = excluded.perm_type,
        status = excluded.status,
        description = excluded.description,
        icon = excluded.icon,
        sort = excluded.sort,
        route_path = excluded.route_path,
        component = excluded.component,
        updated_by = excluded.updated_by,
        updated_at = now();

  update platform.platform_permission permission
  set parent_id = parent.id,
      updated_by = actor_id,
      updated_at = now()
  from tmp_admin_permission_seed seed
  left join platform.platform_permission parent
    on parent.perm_code = seed.parent_code
  where permission.perm_code = seed.perm_code
    and permission.parent_id is distinct from parent.id;

  insert into platform.platform_role_permission (role_id, permission_id, created_by)
  select role.id, permission.id, actor_id
  from platform.platform_role role
  cross join platform.platform_permission permission
  where role.role_code = 'PLATFORM_ARCHITECT'
  on conflict (role_id, permission_id) do nothing;

  insert into platform.platform_role_permission (role_id, permission_id, created_by)
  select role.id, permission.id, actor_id
  from platform.platform_role role
  join platform.platform_permission permission
    on permission.perm_code in (
      'admin.workspace.tenant_ops',
      'admin.section.ops_overview',
      'admin.menu.platform_overview',
      'admin.section.tenants',
      'admin.menu.tenants',
      'admin.menu.accounts',
      'admin.menu.verifications',
      'admin.section.products',
      'admin.menu.service_plans',
      'admin.menu.product_solutions',
      'admin.menu.products',
      'admin.menu.promotions',
      'admin.section.commerce',
      'admin.menu.commerce_overview',
      'admin.menu.subscriptions',
      'admin.menu.orders',
      'admin.menu.usage_metering',
      'admin.menu.promotion_redemptions',
      'admin.section.models_skills',
      'admin.menu.model_grants',
      'admin.menu.skills',
      'admin.section.finance',
      'admin.menu.billing',
      'admin.menu.payments',
      'admin.menu.invoices',
      'admin.section.support',
      'admin.menu.tickets',
      'admin.menu.announcements',
      'platform.tenant.manage',
      'platform.product.manage',
      'platform.pricing.manage'
    )
  where role.role_code = 'TENANT_OPERATIONS_MANAGER'
  on conflict (role_id, permission_id) do nothing;

  insert into platform.platform_role_permission (role_id, permission_id, created_by)
  select role.id, permission.id, actor_id
  from platform.platform_role role
  join platform.platform_permission permission
    on permission.perm_code in (
      'admin.workspace.platform',
      'admin.section.autonomy',
      'admin.menu.platform',
      'admin.section.resources',
      'admin.menu.model_gateway',
      'admin.menu.platform_secrets',
      'admin.section.reliability',
      'admin.menu.service_monitor',
      'admin.menu.platform_jobs',
      'platform.model.manage'
    )
  where role.role_code = 'SYSTEM_OPERATIONS_CONTROLLER'
  on conflict (role_id, permission_id) do nothing;

  insert into platform.platform_role_permission (role_id, permission_id, created_by)
  select role.id, permission.id, actor_id
  from platform.platform_role role
  join platform.platform_permission permission
    on permission.perm_code in (
      'admin.workspace.platform',
      'admin.section.security',
      'admin.menu.audit_logs',
      'admin.menu.approval_center',
      'admin.section.identity',
      'admin.menu.admin_roles',
      'admin.menu.admin_permissions'
    )
  where role.role_code = 'SECURITY_GOVERNANCE_OFFICER'
  on conflict (role_id, permission_id) do nothing;

  insert into platform.platform_role_permission (role_id, permission_id, created_by)
  select role.id, permission.id, actor_id
  from platform.platform_role role
  join platform.platform_permission permission
    on permission.perm_code in (
      'admin.workspace.tenant_ops',
      'admin.section.support',
      'admin.menu.tickets',
      'admin.menu.announcements',
      'admin.section.ops_overview',
      'admin.menu.platform_overview'
    )
  where role.role_code = 'SUPPORT_RESPONSE_OFFICER'
  on conflict (role_id, permission_id) do nothing;

  insert into platform.platform_role_permission (role_id, permission_id, created_by)
  select role.id, permission.id, actor_id
  from platform.platform_role role
  join platform.platform_permission permission
    on permission.perm_type = 'MENU'
  where role.role_code = 'OBSERVER'
  on conflict (role_id, permission_id) do nothing;
end $$;
