import type { IconName } from '@vxture/design-system';

export type AdminWorkspaceId = 'tenant-ops' | 'platform-autonomy';

export interface AdminNavigationItem {
  id: string;
  href: string;
  label: string;
  description: string;
  icon: IconName;
  disabled?: boolean;
}

export interface AdminNavigationSection {
  id: string;
  title: string;
  items: AdminNavigationItem[];
}

export interface AdminNavigationWorkspace {
  id: AdminWorkspaceId;
  label: string;
  shortLabel: string;
  description: string;
  homeHref: string;
  icon: IconName;
  sections: AdminNavigationSection[];
}

const tenantOpsSections: AdminNavigationSection[] = [
  {
    id: 'overview',
    title: '运营总览',
    items: [
      {
        id: 'platformOverview',
        href: '/',
        label: '平台概览',
        description: '核心运营指标、各业务域关键趋势和平台健康快照。',
        icon: 'squares-four',
      },
      {
        id: 'opsTodos',
        href: '/ops-todos',
        label: '运营待办',
        description: '聚合待审核、异常告警和需要人工介入的运营任务。',
        icon: 'table',
      },
    ],
  },
  {
    id: 'tenantsAccounts',
    title: '租户与账号',
    items: [
      {
        id: 'tenants',
        href: '/tenants',
        label: '租户管理',
        description: '管理平台租户资料、状态、生命周期和运营备注。',
        icon: 'buildings',
      },
      {
        id: 'accounts',
        href: '/accounts',
        label: '账号管理',
        description: '跨租户查询平台账号，管理账号状态、登录安全和联系方式。',
        icon: 'user',
      },
      {
        id: 'verifications',
        href: '/verifications',
        label: '组织认证',
        description: '审核租户企业资质材料，处理通过、驳回和复核状态。',
        icon: 'medal',
      },
    ],
  },
  {
    id: 'productsPlans',
    title: '产品与套餐',
    items: [
      {
        id: 'servicePlans',
        href: '/service-plans',
        label: '服务套餐',
        description: '管理业务产品方案下的 Free、Pro、企业版等服务套餐，配置配额、价格和售卖范围。',
        icon: 'star',
      },
      {
        id: 'productSolutions',
        href: '/product-solutions',
        label: '产品方案',
        description: '按行业业务场景组合产品能力，定义方案边界、包含产品和适用客户。',
        icon: 'workflow',
      },
      {
        id: 'products',
        href: '/products',
        label: '产品能力',
        description: '管理可组合、可授权、可计量的基础产品能力，包括平台、智能体、大模型和三方接入能力。',
        icon: 'database',
      },
      {
        id: 'promotions',
        href: '/promotions',
        label: '推广优惠',
        description: '配置优惠码和折扣活动，限定适用产品、套餐和核销规则。',
        icon: 'sparkles',
      },
    ],
  },
  {
    id: 'subscriptionsTransactions',
    title: '订阅与交易',
    items: [
      {
        id: 'commerceOverview',
        href: '/commerce-overview',
        label: '商业概览',
        description: '聚合订阅、订单、收款、账单、发票、用量和优惠的运营指标与风险快照。',
        icon: 'chart-bar',
      },
      {
        id: 'subscriptions',
        href: '/subscriptions',
        label: '订阅权益',
        description: '运营侧管理租户服务权益实例，处理试用转正、续期、暂停、取消和配额风险。',
        icon: 'star',
      },
      {
        id: 'orders',
        href: '/orders',
        label: '交易订单',
        description: '查询订单列表和详情，追踪支付状态并处理异常订单。',
        icon: 'table',
      },
      {
        id: 'usageMetering',
        href: '/usage-metering',
        label: '用量计量',
        description: '查询租户、产品和套餐维度的用量明细，维护计量规则和异常告警。',
        icon: 'graph',
      },
      {
        id: 'promotionRedemptions',
        href: '/promotion-redemptions',
        label: '优惠核销',
        description: '查看优惠码使用记录、折扣核销统计和订单关联数据。',
        icon: 'check',
      },
    ],
  },
  {
    id: 'capabilitiesServices',
    title: '模型与技能',
    items: [
      {
        id: 'modelGrants',
        href: '/model-grants',
        label: '模型策略',
        description: '按产品、租户和套餐配置模型访问权限、配额和路由优先级。',
        icon: 'shield-check',
      },
      {
        id: 'skills',
        href: '/skills',
        label: '技能接入',
        description: '注册和管理智能体可调用技能，配置上下线、端点和运行状态。',
        icon: 'cube',
      },
    ],
  },
  {
    id: 'financeSettlement',
    title: '财务与结算',
    items: [
      {
        id: 'billing',
        href: '/billing',
        label: '账单管理',
        description: '管理账单生成、应收确认、异常处理和线下发票登记入口。',
        icon: 'key',
      },
      {
        id: 'payments',
        href: '/payments',
        label: '收款管理',
        description: '收款台账与对账视角，查看线下/线上收款、账单关联和需关注流水。',
        icon: 'check',
      },
      {
        id: 'invoices',
        href: '/invoices',
        label: '发票管理',
        description: '线下发票台账，跟踪开票登记、寄送交付、红冲作废和账单关联。',
        icon: 'table',
      },
    ],
  },
  {
    id: 'supportCompliance',
    title: '服务与支持',
    items: [
      {
        id: 'tickets',
        href: '/tickets',
        label: '工单反馈',
        description: '处理用户工单、人工分派、状态流转和反馈闭环。',
        icon: 'chat-circle',
      },
      {
        id: 'announcements',
        href: '/announcements',
        label: '通知公告',
        description: '发布平台公告和定向通知，查询通知触达与历史记录。',
        icon: 'bell',
      },
    ],
  },
];

const platformAutonomySections: AdminNavigationSection[] = [
  {
    id: 'autonomyOverview',
    title: '自治总览',
    items: [
      {
        id: 'platformAutonomy',
        href: '/platform',
        label: '平台自治',
        description: '观察平台内部身份、权限、供给资源、运行状态和安全审计。',
        icon: 'squares-four',
      },
    ],
  },
  {
    id: 'identityAccess',
    title: '身份与权限',
    items: [
      {
        id: 'platformAdmins',
        href: '/platform-admins',
        label: '用户管理',
        description: '管理平台内部管理员、运营人员和运维人员的账号、岗位、状态和准入边界。',
        icon: 'user',
      },
      {
        id: 'adminRoles',
        href: '/admin-roles',
        label: '角色权限',
        description: '维护运营平台内部角色和权限配置，与租户侧权限隔离。',
        icon: 'role',
      },
      {
        id: 'adminPermissions',
        href: '/admin-permissions',
        label: '权限管理',
        description: '展示和治理 admin 平台全部菜单、按钮和接口权限。',
        icon: 'shield-check',
      },
    ],
  },
  {
    id: 'platformResources',
    title: '平台资源',
    items: [
      {
        id: 'modelGateway',
        href: '/model-gateway',
        label: '模型接入',
        description: '维护 LLM Provider、API Key、限流、超时和调用端点。',
        icon: 'cloud',
      },
      {
        id: 'platformSecrets',
        href: '/platform-secrets',
        label: '密钥配置',
        description: '集中管理平台级密钥、凭据、轮换策略和最小可见范围。',
        icon: 'key',
      },
    ],
  },
  {
    id: 'operationsReliability',
    title: '运行与可靠性',
    items: [
      {
        id: 'serviceMonitor',
        href: '/service-monitor',
        label: '服务监控',
        description: '查看服务运行详情、响应时间、错误率、可用性指标和告警规则。',
        icon: 'server',
      },
      {
        id: 'platformJobs',
        href: '/platform-jobs',
        label: '任务队列',
        description: '观察平台异步任务、重试、死信和关键调度状态。',
        icon: 'workflow',
      },
    ],
  },
  {
    id: 'securityAudit',
    title: '安全与审计',
    items: [
      {
        id: 'auditLogs',
        href: '/audit-logs',
        label: '审计日志',
        description: '追溯运营后台关键操作，按操作人、时间和对象筛选审计记录。',
        icon: 'info',
      },
      {
        id: 'approvalCenter',
        href: '/approval-center',
        label: '审批中心',
        description: '承接高风险操作的二次确认、审批流和执行凭证。',
        icon: 'check',
      },
    ],
  },
];

export const adminWorkspaces: AdminNavigationWorkspace[] = [
  {
    id: 'tenant-ops',
    label: '运营业务域',
    shortLabel: '运营域',
    description: '面向租户、用户、产品、订阅、交易和服务支持的运营管理。',
    homeHref: '/',
    icon: 'buildings',
    sections: tenantOpsSections,
  },
  {
    id: 'platform-autonomy',
    label: '平台自治域',
    shortLabel: '自治域',
    description: '面向内部用户、平台资源、运行可靠性、安全审计和治理能力。',
    homeHref: '/platform',
    icon: 'shield-check',
    sections: platformAutonomySections,
  },
];

export const defaultAdminWorkspace: AdminNavigationWorkspace = adminWorkspaces[0] as AdminNavigationWorkspace;
export const adminNavigationSections: AdminNavigationSection[] = tenantOpsSections;

export function flattenAdminNavigationSections(workspaces: AdminNavigationWorkspace[] = adminWorkspaces) {
  return workspaces.flatMap((workspace) =>
    workspace.sections.map((section) => ({
      workspace,
      section,
    })),
  );
}

export function flattenAdminNavigationItems(workspaces: AdminNavigationWorkspace[] = adminWorkspaces) {
  return flattenAdminNavigationSections(workspaces).flatMap(({ workspace, section }) =>
    section.items.map((item) => ({
      workspace,
      section,
      item,
    })),
  );
}

function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminNavigationItemByPath(pathname: string) {
  return flattenAdminNavigationItems().find(({ item }) => isActivePath(pathname, item.href));
}

export function getAdminWorkspaceByPath(pathname: string): AdminNavigationWorkspace {
  const itemMatch = getAdminNavigationItemByPath(pathname);

  if (itemMatch) {
    return itemMatch.workspace;
  }

  return adminWorkspaces.find((workspace) => isActivePath(pathname, workspace.homeHref)) ?? defaultAdminWorkspace;
}
