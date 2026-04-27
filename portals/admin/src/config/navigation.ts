import type { IconName } from '@vxture/design-system';

export interface AdminNavigationItem {
  href: string;
  label: string;
  description: string;
  icon: IconName;
  disabled?: boolean;
}

export interface AdminNavigationSection {
  title: string;
  items: AdminNavigationItem[];
}

export const adminNavigationSections: AdminNavigationSection[] = [
  {
    title: '运营总览',
    items: [
      {
        href: '/',
        label: '平台概览',
        description: '核心运营指标、各业务域关键趋势和平台健康快照。',
        icon: 'squares-four',
      },
      {
        href: '/ops-todos',
        label: '运营待办',
        description: '聚合待审核、异常告警和需要人工介入的运营任务。',
        icon: 'table',
      },
      {
        href: '/service-health',
        label: '服务健康',
        description: '展示服务运行状态摘要，异常时快速定位到服务监控。',
        icon: 'server',
      },
    ],
  },
  {
    title: '租户与账号',
    items: [
      {
        href: '/tenants',
        label: '租户管理',
        description: '管理平台租户资料、状态、生命周期和运营备注。',
        icon: 'buildings',
      },
      {
        href: '/accounts',
        label: '账号管理',
        description: '跨租户查询平台账号，管理账号状态、登录安全和联系方式。',
        icon: 'users',
      },
      {
        href: '/verifications',
        label: '组织认证',
        description: '审核租户企业资质材料，处理通过、驳回和复核状态。',
        icon: 'medal',
      },
      {
        href: '/admin-roles',
        label: '运营角色',
        description: '维护运营平台内部角色和权限配置，与租户侧权限隔离。',
        icon: 'shield-check',
      },
    ],
  },
  {
    title: '产品与套餐',
    items: [
      {
        href: '/products',
        label: '产品能力管理',
        description: '管理可组合、可授权、可计量的基础产品能力，包括平台、智能体、大模型和三方接入能力。',
        icon: 'database',
      },
      {
        href: '/product-solutions',
        label: '业务产品方案',
        description: '按行业业务场景组合产品能力，定义方案边界、包含产品和适用客户。',
        icon: 'workflow',
      },
      {
        href: '/service-plans',
        label: '服务套餐管理',
        description: '管理业务产品方案下的 Free、Pro、企业版等服务套餐，配置配额、价格和售卖范围。',
        icon: 'star',
      },
      {
        href: '/promotions',
        label: '推广优惠',
        description: '配置优惠码和折扣活动，限定适用产品、套餐和核销规则。',
        icon: 'sparkles',
      },
    ],
  },
  {
    title: '商业与财务',
    items: [
      {
        href: '/subscriptions',
        label: '订阅管理',
        description: '管理租户与套餐的订阅关系，处理试用、生效、到期和取消。',
        icon: 'star',
      },
      {
        href: '/orders',
        label: '订单管理',
        description: '查询订单列表和详情，追踪支付状态并处理异常订单。',
        icon: 'table',
      },
      {
        href: '/billing',
        label: '账单发票',
        description: '管理账单生成、发票申请审核、对账和应收确认。',
        icon: 'key',
      },
      {
        href: '/usage-metering',
        label: '用量计量',
        description: '查询租户、产品和套餐维度的用量明细，维护计量规则和异常告警。',
        icon: 'graph',
      },
      {
        href: '/promotion-redemptions',
        label: '优惠核销',
        description: '查看优惠码使用记录、折扣核销统计和订单关联数据。',
        icon: 'check',
      },
    ],
  },
  {
    title: '能力与服务',
    items: [
      {
        href: '/service-monitor',
        label: '服务监控',
        description: '查看服务运行详情、响应时间、错误率、可用性指标和告警规则。',
        icon: 'server',
      },
      {
        href: '/model-gateway',
        label: '模型接入',
        description: '维护 LLM Provider、API Key、限流、超时和调用端点。',
        icon: 'cloud',
      },
      {
        href: '/model-grants',
        label: '模型策略',
        description: '按产品、租户和套餐配置模型访问权限、配额和路由优先级。',
        icon: 'shield-check',
      },
      {
        href: '/skills',
        label: '技能接入',
        description: '注册和管理智能体可调用技能，配置上下线、端点和运行状态。',
        icon: 'cube',
      },
    ],
  },
  {
    title: '风控与合规',
    items: [
      {
        href: '/tickets',
        label: '工单反馈',
        description: '处理用户工单、人工分派、状态流转和反馈闭环。',
        icon: 'chat-circle',
      },
      {
        href: '/announcements',
        label: '通知公告',
        description: '发布平台公告和定向通知，查询通知触达与历史记录。',
        icon: 'bell',
      },
      {
        href: '/audit-logs',
        label: '审计日志',
        description: '追溯运营后台关键操作，按操作人、时间和对象筛选审计记录。',
        icon: 'info',
      },
    ],
  },
];
