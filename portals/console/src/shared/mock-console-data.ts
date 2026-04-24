import type {
  MemberRecord,
  ModuleCardStat,
  QuickAction,
  SessionSnapshot,
  SummaryMetric,
} from '@/entities/console';

export const mockAuthenticatedSession: SessionSnapshot = {
  isAuthenticated: true,
  user: {
    id: 'u_console_admin',
    name: 'Lin Chen',
    email: 'lin.chen@vxture.ai',
    roleLabel: 'Platform Operator',
    username: 'console.admin',
    phone: '13800000000',
  },
  tenant: {
    id: 'tenant_demo',
    name: 'Vxture Demo Tenant',
    mode: 'platform',
    workspace: 'DEMO',
  },
  capabilities: [
    'platform.tenant.manage',
    'platform.product.manage',
    'platform.pricing.manage',
    'platform.model.manage',
    'tenant.user.manage',
    'tenant.role.manage',
    'tenant.subscription.read',
    'tenant.billing.read',
    'tenant.quota.read',
  ],
};

export const anonymousSession: SessionSnapshot = {
  isAuthenticated: false,
  user: null,
  tenant: null,
  capabilities: [],
};

export const dashboardStats: ModuleCardStat[] = [
  {
    label: 'Current plan',
    value: 'Growth',
    hint: 'Renews on May 18, 2026 with pooled workspace billing.',
  },
  {
    label: 'Quota health',
    value: '78%',
    hint: 'Inference remains healthy, but GPU tuning is approaching alert range.',
  },
  {
    label: 'Open reminders',
    value: '3',
    hint: 'One invoice, one invite, and one quota threshold need review.',
  },
];

export const memberMetrics: SummaryMetric[] = [
  {
    label: 'Members',
    value: '128',
    trend: '+6 this month',
    tone: 'positive',
  },
  {
    label: 'Pending invites',
    value: '7',
    trend: '2 need follow-up',
    tone: 'warning',
  },
  {
    label: 'Admin coverage',
    value: '4',
    trend: '2 primary owners',
  },
];

export const subscriptionHighlights: ModuleCardStat[] = [
  {
    label: 'Plan',
    value: 'Growth',
    hint: '120 seats, shared inference pool, and enterprise support.',
  },
  {
    label: 'Renewal',
    value: 'May 18',
    hint: 'Annual renewal remains editable before invoice lock.',
  },
  {
    label: 'Projected overage',
    value: '¥1,280',
    hint: 'Driven by model access bursts in the current month.',
  },
];

export const billingMetrics: SummaryMetric[] = [
  {
    label: 'Outstanding',
    value: '¥8,420',
    trend: 'Due in 5 days',
    tone: 'warning',
  },
  {
    label: 'Paid this cycle',
    value: '¥26,900',
    trend: 'On track',
    tone: 'positive',
  },
  {
    label: 'Payment method',
    value: 'Corporate Visa',
    trend: 'Expires 09/2027',
  },
];

export const quotaMetrics: SummaryMetric[] = [
  {
    label: 'Inference credits',
    value: '64%',
    trend: 'Healthy',
    tone: 'positive',
  },
  {
    label: 'Fine-tune budget',
    value: '91%',
    trend: 'Approaching cap',
    tone: 'warning',
  },
  {
    label: 'Seat usage',
    value: '84 / 120',
    trend: '36 seats available',
  },
];

export const quickActions: QuickAction[] = [
  {
    label: 'Add member',
    description: 'Invite operators, workspace owners, and readonly reviewers.',
    href: '/members',
    icon: 'users',
  },
  {
    label: 'Review subscription',
    description: 'Inspect plan details, renewal timing, and quota pool pressure.',
    href: '/subscription',
    icon: 'chart-bar',
  },
  {
    label: 'Adjust quotas',
    description: 'Rebalance shared limits before overage costs increase.',
    href: '/quotas',
    icon: 'database',
  },
];

export const memberRecords: MemberRecord[] = [
  {
    id: 'm_01',
    accountId: 'a_01',
    name: 'Lin Chen',
    email: 'lin.chen@vxture.ai',
    phone: null,
    role: 'Owner',
    roleCode: 'owner',
    roleId: 'role_owner',
    status: 'Active',
    statusCode: 'active',
    lastActive: '5 minutes ago',
    team: 'Platform Operations',
    joinedAt: '2026-04-01T08:00:00.000Z',
    isPrimaryOwner: true,
  },
  {
    id: 'm_02',
    accountId: 'a_02',
    name: 'Mika Zhou',
    email: 'mika.zhou@vxture.ai',
    phone: null,
    role: 'Billing Admin',
    roleCode: 'admin',
    roleId: 'role_admin',
    status: 'Active',
    statusCode: 'active',
    lastActive: '1 hour ago',
    team: 'Finance',
    joinedAt: '2026-04-05T08:00:00.000Z',
    isPrimaryOwner: false,
  },
  {
    id: 'm_03',
    accountId: 'a_03',
    name: 'Jun Park',
    email: 'jun.park@vxture.ai',
    phone: null,
    role: 'Workspace Admin',
    roleCode: 'admin',
    roleId: 'role_admin',
    status: 'Invited',
    statusCode: 'inactive',
    lastActive: 'Invitation sent today',
    team: 'Delivery',
    joinedAt: '2026-04-18T08:00:00.000Z',
    isPrimaryOwner: false,
  },
  {
    id: 'm_04',
    accountId: 'a_04',
    name: 'Ava Song',
    email: 'ava.song@vxture.ai',
    phone: null,
    role: 'Analyst',
    roleCode: 'member',
    roleId: 'role_member',
    status: 'Suspended',
    statusCode: 'banned',
    lastActive: '12 days ago',
    team: 'Security Review',
    joinedAt: '2026-03-28T08:00:00.000Z',
    isPrimaryOwner: false,
  },
  {
    id: 'm_05',
    accountId: 'a_05',
    name: 'Noah Xu',
    email: 'noah.xu@vxture.ai',
    phone: null,
    role: 'Member',
    roleCode: 'member',
    roleId: 'role_member',
    status: 'Active',
    statusCode: 'active',
    lastActive: 'Yesterday',
    team: 'Applied AI',
    joinedAt: '2026-04-10T08:00:00.000Z',
    isPrimaryOwner: false,
  },
];

export const invoiceRows = [
  ['INV-2026-0418', 'Apr 18, 2026', 'Growth annual', 'Paid', '¥26,900'],
  ['INV-2026-0318', 'Mar 18, 2026', 'Model overage', 'Due', '¥8,420'],
  ['INV-2026-0218', 'Feb 18, 2026', 'Seat expansion', 'Paid', '¥4,600'],
];

export const quotaRows = [
  ['Inference requests', '9.2M / 12M', '76%', 'Healthy'],
  ['Fine-tune GPU hours', '182 / 200', '91%', 'Watch'],
  ['Knowledge indexing', '4.1TB / 6TB', '68%', 'Healthy'],
];
