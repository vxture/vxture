export type Capability = string;

export interface ConsoleUser {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  roleLabel: string;
  roleI18nKey?: string;
  roleNameEn?: string;
  username?: string;
  phone?: string | null;
}

export interface ConsoleUserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  timezone: string | null;
  language: string | null;
  profileUpdatedAt: string | null;
}

export interface ConsoleOrganizationProfile {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  displayName: string;
  tenantType: 'company' | 'individual';
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  logoUrl: string | null;
  description: string | null;
  language: string;
  timeZone: string;
  companyName: string | null;
  unifiedSocialCreditCode: string | null;
  businessLicenseUrl: string | null;
  industry: string | null;
  scale: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  countryCode: string | null;
  province: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  postalCode: string | null;
  verifiedStatus: 'unverified' | 'pending' | 'verified' | 'rejected' | null;
  verifiedAt: string | null;
  rejectedReason: string | null;
  primaryDomain: string | null;
  updatedAt: string | null;
}

export interface BreadcrumbItem {
  href: string;
  label: string;
}

export interface SessionSnapshot {
  isAuthenticated: boolean;
  user: ConsoleUser | null;
  capabilities: Capability[];
}

export type PlatformGovernanceKind = 'admins' | 'secrets' | 'jobs' | 'approvals';
export type PlatformGovernanceStatus = 'normal' | 'warning' | 'blocked' | 'pending';

export interface PlatformGovernanceRecord {
  id: string;
  name: string;
  status: PlatformGovernanceStatus;
  scope: string;
  owner: string;
  policy: string;
  updatedAt: string;
  description: string;
  tags: string[];
}

export interface ModuleCardStat {
  label: string;
  value: string;
  hint: string;
}

export interface SummaryMetric {
  label: string;
  value: string;
  trend?: string;
  tone?: 'default' | 'positive' | 'warning';
}

export interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: string;
}

export interface MemberRecord {
  id: string;
  accountId: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  email: string;
  phone: string | null;
  role: string;
  roleCode: string | null;
  roleId: string | null;
  status: 'Active' | 'Invited' | 'Suspended';
  statusCode: 'active' | 'inactive' | 'banned';
  lastActive: string;
  team: string;
  joinedAt: string;
  isPrimaryOwner: boolean;
}

export interface TenantRoleRecord {
  id: string;
  roleCode: string;
  roleName: string;
  description: string | null;
  status: 'active' | 'disabled';
  isSystem: boolean;
  permissions: TenantPermissionRecord[];
}

export interface TenantPermissionRecord {
  id: string;
  permissionCode: string;
  permissionName: string;
  permissionType: string | null;
  description: string | null;
}

export interface AiModelRecord {
  id: string;
  providerId: string | null;
  modelCode: string;
  modelName: string;
  provider: string;
  endpointUrl: string;
  protocol: string;
  capabilities: string[];
  apiKeyEnvVar: string;
  isActive: boolean;
  config: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type DevServiceSource = 'dev-tools' | 'dev-panel';

export interface DevServiceHealthCheck {
  label: string;
  url: string;
  status: number | string | null;
  okStatuses: number[] | null;
  durationMs: number;
  ok: boolean;
}

export interface DevServiceSnapshot {
  id: string;
  name: string;
  port: number;
  priority: number;
  url: string;
  command: string;
  running: boolean;
  listening: boolean;
  healthy: boolean;
  health: DevServiceHealthCheck[];
  pid: number | null;
  startedAt: string | null;
  uptimeMs: number | null;
  uptime: string;
  stopping: boolean;
  logs: string[];
  source?: DevServiceSource;
}

export interface AiModelGrantRecord {
  id: string;
  modelId: string;
  tenantId: string;
  agentId: string | null;
  priority: number;
  reason: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAgentRecord {
  id: string;
  agentCode: string;
  agentName: string;
  description: string;
  agentType: 'chat' | 'business';
  status: 'active' | 'inactive';
  visibility: 'public' | 'private' | 'internal';
  defaultModelCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductModelPolicyRecord {
  id: string;
  subjectType: 'tenant' | 'platform';
  subjectId: string;
  subjectName: string;
  scopeType: 'product' | 'new_product_default' | 'tenant_default';
  scopeCode: string;
  scopeName: string;
  isDefined: boolean;
  productCode: string;
  productName: string;
  productRegion: 'domestic' | 'international' | null;
  agentId: string | null;
  agentCode: string | null;
  agentName: string;
  modelCode: string | null;
  quotaTokens: number;
  isUnlimited: boolean;
  priority: number;
  isActive: boolean;
  cycle: 'monthly';
  note: string | null;
}

export interface ProductReleasePrice {
  id: string;
  currency: string;
  price: number;
  originalPrice: number;
  periodType: 'monthly' | 'yearly';
  periodValue: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface ProductReleaseFeature {
  code: string;
  name: string;
  type: 'quota' | 'function';
  quotaValue: number | null;
  isUnlimited: boolean;
  config: Record<string, unknown> | null;
}

export interface ProductReleaseRecord {
  id: string;
  productCode: string;
  productName: string;
  productRegion: 'domestic' | 'international';
  productStatus: 'active' | 'draft' | 'archived';
  releaseCode: string;
  releaseName: string;
  description: string;
  releaseType: 'standard' | 'custom';
  versionLabels: string[];
  isFree: boolean;
  isPublic: boolean;
  isActive: boolean;
  prices: ProductReleasePrice[];
  features: ProductReleaseFeature[];
  allowedAgents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPlanPrice {
  id: string;
  currency: string;
  price: number;
  originalPrice: number;
  periodType: 'monthly' | 'yearly';
  periodValue: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface ProductPlanFeature {
  code: string;
  name: string;
  type: 'quota' | 'function';
  quotaValue: number | null;
  isUnlimited: boolean;
  config: Record<string, unknown> | null;
}

export interface ProductPlanAgent {
  id: string;
  agentCode: string;
  agentName: string;
  agentType: 'chat' | 'business';
  status: 'active' | 'inactive' | 'draft';
}

export interface ProductPlanRecord {
  id: string;
  planCode: string;
  planName: string;
  description: string;
  planType: string;
  level: number;
  isFree: boolean;
  isPublic: boolean;
  isActive: boolean;
  subscriptionCount: number;
  prices: ProductPlanPrice[];
  features: ProductPlanFeature[];
  agents: ProductPlanAgent[];
  createdAt: string;
  updatedAt: string;
}

export type ProductCapabilityStatus = 'active' | 'draft' | 'archived';
export type ProductCapabilityVisibility = 'public' | 'internal';
export type ProductCapabilityType = 'platform' | 'agent' | 'model' | 'data' | 'service';
export type ProductCapabilitySource = 'self' | 'partner';
export type ProductCapabilityRegion = 'domestic' | 'international' | 'global';
export type ProductCapabilityIntegrationStatus = 'connected' | 'config_required' | 'testing' | 'not_required';
export type ProductCapabilityHealthStatus = 'normal' | 'warning' | 'disabled';

export interface ProductCapabilityRelatedSolution {
  solutionCode: string;
  solutionName: string;
  role: string;
  status: ProductCapabilityStatus;
  tierNames: string[];
}

export interface ProductCapabilityRelease {
  releaseCode: string;
  releaseName: string;
  status: ProductCapabilityStatus;
  isActive: boolean;
  versionLabels: string[];
}

export interface ProductCapabilityIntegration {
  providerName: string;
  providerType: ProductCapabilitySource;
  status: ProductCapabilityIntegrationStatus;
  endpoint: string | null;
  protocol: string;
  authMode: string;
  settlementMode: string | null;
  lastCheckedAt: string | null;
}

export interface ProductCapabilityMetricRule {
  metricCode: string;
  metricName: string;
  unit: string;
  cycle: string;
  quotaBase: string;
  billingMode: string;
}

export interface ProductCapabilityRecord {
  id: string;
  productCode: string;
  productName: string;
  description: string;
  productType: ProductCapabilityType;
  source: ProductCapabilitySource;
  status: ProductCapabilityStatus;
  visibility: ProductCapabilityVisibility;
  region: ProductCapabilityRegion;
  ownerTeam: string;
  capabilitySummary: string;
  accessModes: string[];
  tags: string[];
  meteringUnit: string;
  billingMode: string;
  healthStatus: ProductCapabilityHealthStatus;
  integration: ProductCapabilityIntegration;
  metrics: ProductCapabilityMetricRule[];
  relatedSolutions: ProductCapabilityRelatedSolution[];
  releases: ProductCapabilityRelease[];
  solutionCount: number;
  planCount: number;
  releaseCount: number;
  modelPolicyCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductSolutionStatus = ProductCapabilityStatus;
export type ProductSolutionVisibility = ProductCapabilityVisibility;
export type ProductSolutionCapabilityType = ProductCapabilityType;
export type ProductSolutionCapabilitySource = ProductCapabilitySource;
export type ProductSolutionTierCode = 'free' | 'pro' | 'enterprise' | 'custom';

export interface ProductSolutionCapability {
  id: string;
  productCode: string;
  productName: string;
  productType: ProductSolutionCapabilityType;
  source: ProductSolutionCapabilitySource;
  role: string;
  status: ProductSolutionStatus;
}

export interface ProductSolutionTier {
  tierCode: ProductSolutionTierCode;
  tierName: string;
  summary: string;
  status: ProductSolutionStatus;
  isPublic: boolean;
}

export interface ProductSolutionRecord {
  id: string;
  solutionCode: string;
  solutionName: string;
  description: string;
  industry: string;
  scenario: string;
  customerSegment: string;
  status: ProductSolutionStatus;
  visibility: ProductSolutionVisibility;
  ownerTeam: string;
  subscriptionCount: number;
  activeTenantCount: number;
  monthlyRevenue: number;
  tags: string[];
  products: ProductSolutionCapability[];
  tiers: ProductSolutionTier[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductSolutionServicePlanSummary {
  tierCode: ProductSolutionTierCode;
  tierName: string;
  summary: string;
  status: ProductSolutionStatus;
  isPublic: boolean;
  priceLabel: string;
}

export interface ProductSolutionDetailRecord extends ProductSolutionRecord {
  deliveryMode: string;
  deliveryBoundaries: string[];
  relatedServicePlans: ProductSolutionServicePlanSummary[];
}

export interface ProductServicePlanPrice {
  priceLabel: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  periodType: 'monthly' | 'yearly' | 'contract';
  periodValue: number;
}

export interface ProductServicePlanEntitlement {
  productCode: string;
  productName: string;
  productType: ProductSolutionCapabilityType;
  source: ProductSolutionCapabilitySource;
  role: string;
  included: boolean;
  quotaSummary: string;
  note: string;
}

export interface ProductServicePlanDetailRecord {
  id: string;
  solutionCode: string;
  solutionName: string;
  industry: string;
  scenario: string;
  customerSegment: string;
  ownerTeam: string;
  tierCode: ProductSolutionTierCode;
  tierName: string;
  summary: string;
  status: ProductSolutionStatus;
  isPublic: boolean;
  price: ProductServicePlanPrice;
  subscriptionCount: number;
  activeTenantCount: number;
  deliveryMode: string;
  applicableScope: string[];
  salesNotes: string[];
  entitlements: ProductServicePlanEntitlement[];
  includedProductCount: number;
  excludedProductCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TenantOperationStatus = 'trial' | 'active' | 'suspended' | 'cancelled';
export type TenantOperationType = 'company' | 'individual';
export type TenantVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type TenantRiskLevel = 'normal' | 'follow_up' | 'high';

export interface TenantOperationMember {
  id: string;
  accountCode?: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'suspended';
  registeredAt?: string;
  activatedAt?: string | null;
  lastActiveAt: string;
  lastActiveIp?: string | null;
}

export interface TenantOperationSubscription {
  id: string;
  productName: string;
  releaseName: string;
  planName: string;
  status: 'trial' | 'active' | 'past_due' | 'cancelled';
  seats: number;
  monthlyRevenue: number;
  startedAt: string;
  renewsAt: string | null;
}

export interface TenantOperationUsageMetric {
  code: string;
  label: string;
  used: number;
  quota: number | null;
  unit: string;
  trend: string;
  status: 'normal' | 'warning' | 'danger';
}

export interface TenantOperationModelPolicy {
  id: string;
  agentName: string;
  productName: string;
  modelCode: string;
  quotaTokens: number;
  usedTokens: number;
  state: 'effective' | 'limited' | 'undefined' | 'disabled';
  source: 'product' | 'tenant' | 'default';
}

export interface TenantOperationAuditEvent {
  id: string;
  action: string;
  actor: string;
  at: string;
  result: 'success' | 'warning' | 'danger';
}

export interface TenantOperationTicket {
  id: string;
  title: string;
  status: 'open' | 'processing' | 'blocked' | 'closed';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  updatedAt: string;
}

export interface TenantOperationRecord {
  id: string;
  tenantCode: string;
  tenantName: string;
  displayName: string;
  tenantType: TenantOperationType;
  status: TenantOperationStatus;
  verifiedStatus: TenantVerificationStatus;
  verificationSubmittedAt?: string | null;
  verifiedAt?: string | null;
  riskLevel: TenantRiskLevel;
  region: string;
  industry: string;
  scale: string;
  ownerName: string;
  ownerEmail: string;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  lastActiveAt: string;
  memberCount: number;
  activeMemberCount: number;
  adminCount: number;
  subscriptionCount: number;
  productCount: number;
  monthlyRevenue: number;
  monthlyCost: number;
  grossMarginRate: number;
  tokenUsed: number;
  tokenQuota: number;
  ticketOpenCount: number;
  satisfaction: number;
  sla: string;
  tags: string[];
  notes: string;
  members: TenantOperationMember[];
  subscriptions: TenantOperationSubscription[];
  usage: TenantOperationUsageMetric[];
  modelPolicies: TenantOperationModelPolicy[];
  auditEvents: TenantOperationAuditEvent[];
  tickets: TenantOperationTicket[];
}

export type SubscriptionOperationStatus = 'trial' | 'active' | 'expiring' | 'overdue' | 'suspended' | 'cancelled';
export type SubscriptionOperationCycle = 'monthly' | 'yearly' | 'once';
export type SubscriptionOperationQuotaRisk = 'normal' | 'warning' | 'danger';
export type SubscriptionOperationAction = 'renew' | 'suspend' | 'resume' | 'cancel';
export type SubscriptionSolutionAssociationSource = 'industry_rule' | 'legacy_plan';

export interface SubscriptionOperationQuotaSnapshot {
  maxUsers: number;
  periodTokens: number;
  usedTokens: number;
  usageRate: number;
  quotaCycle: SubscriptionOperationCycle;
  allowedModelCount: number;
  allowCustomModel: boolean;
  risk: SubscriptionOperationQuotaRisk;
}

export interface SubscriptionSolutionAssociation {
  solutionCode: string | null;
  solutionName: string;
  tierCode: ProductSolutionTierCode;
  tierName: string;
  source: SubscriptionSolutionAssociationSource;
  note: string;
}

export interface SubscriptionEntitlementSnapshot {
  productCode: string;
  productName: string;
  productType: ProductSolutionCapabilityType;
  source: ProductSolutionCapabilitySource;
  included: boolean;
  quotaSummary: string;
  note: string;
}

export interface SubscriptionOperationEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  at: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}

export interface SubscriptionOperationRecord {
  id: string;
  subscriptionCode: string;
  orderNo: string | null;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantType: TenantOperationType;
  tenantStatus: TenantOperationStatus;
  region: string;
  industry: string;
  solutionCode: string | null;
  solutionName: string;
  servicePlanCode: string;
  servicePlanName: string;
  tierName: string;
  status: SubscriptionOperationStatus;
  rawStatus: string;
  cycleType: SubscriptionOperationCycle;
  autoRenew: boolean;
  currency: string;
  payAmount: number;
  monthlyRevenue: number;
  quota: SubscriptionOperationQuotaSnapshot;
  operatorName: string;
  operationHint: string;
  startAt: string;
  endAt: string | null;
  trialEndAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionOperationDetailRecord extends SubscriptionOperationRecord {
  solutionAssociation: SubscriptionSolutionAssociation;
  entitlementSnapshot: SubscriptionEntitlementSnapshot[];
  operationTimeline: SubscriptionOperationEvent[];
}

export type OrderOperationStatus = 'pending' | 'pending_verify' | 'confirmed' | 'overdue' | 'closed' | 'abnormal';
export type OrderPaymentStatus =
  | 'not_required'
  | 'unpaid'
  | 'pending'
  | 'pending_verify'
  | 'paid'
  | 'partial'
  | 'failed'
  | 'closed'
  | 'refunding';
export type OrderPaySource = 'online' | 'offline' | 'none';
export type OrderOfflinePaymentType = 'bank_transfer' | 'cash' | 'other';

export interface OrderInvoiceItemRecord {
  id: string;
  itemName: string;
  itemType: string;
  itemUnit: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  remark: string | null;
}

export interface OrderPaymentRecord {
  id: string;
  paymentNo: string;
  paySource: OrderPaySource;
  payMethod: string | null;
  offlinePayType: OrderOfflinePaymentType | null;
  offlinePayerName: string | null;
  paidAmount: number;
  currency: string;
  paymentStatus: OrderPaymentStatus;
  paidAt: string | null;
  operatorName: string;
  remark: string | null;
}

export interface OrderOperationEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  at: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}

export interface OrderOperationRecord {
  id: string;
  orderNo: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantType: TenantOperationType;
  region: string;
  industry: string;
  solutionCode: string | null;
  solutionName: string;
  servicePlanCode: string;
  servicePlanName: string;
  tierName: string;
  subscriptionId: string;
  subscriptionStatus: SubscriptionOperationStatus;
  cycleType: SubscriptionOperationCycle;
  orderStatus: OrderOperationStatus;
  paymentStatus: OrderPaymentStatus;
  paySource: OrderPaySource;
  payMethod: string | null;
  billId: string | null;
  billNo: string | null;
  billStatus: string | null;
  paymentId: string | null;
  paymentNo: string | null;
  amount: number;
  paidAmount: number;
  currency: string;
  operatorName: string;
  operationHint: string;
  createdAt: string;
  confirmedAt: string | null;
  updatedAt: string;
}

export interface OrderOperationDetailRecord extends OrderOperationRecord {
  invoiceItems: OrderInvoiceItemRecord[];
  paymentRecords: OrderPaymentRecord[];
  operationTimeline: OrderOperationEvent[];
}

export type PaymentReconciliationStatus = 'normal' | 'pending_verify' | 'partial' | 'overpaid' | 'bill_cancelled' | 'failed' | 'unlinked';

export interface PaymentOperationRecord {
  id: string;
  paymentNo: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantType: TenantOperationType;
  region: string;
  industry: string;
  billId: string | null;
  billNo: string | null;
  billStatus: BillingBillStatus | null;
  billType: BillingBillType | null;
  billPayableAmount: number;
  billPaidAmount: number;
  subscriptionId: string | null;
  orderNo: string | null;
  servicePlanName: string | null;
  tierName: string | null;
  paySource: OrderPaySource;
  payChannel: string | null;
  payMethod: string | null;
  offlinePayType: OrderOfflinePaymentType | null;
  offlinePayerName: string | null;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  paymentStatus: OrderPaymentStatus;
  reconciliationStatus: PaymentReconciliationStatus;
  transactionId: string | null;
  channelOrderNo: string | null;
  channelTransactionNo: string | null;
  offlineEvidenceUrl: string | null;
  statusMessage: string | null;
  remark: string | null;
  operatorName: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UsageMeteringRisk = 'normal' | 'warning' | 'danger' | 'anomaly';

export interface UsageMeteringRecord {
  id: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantType: TenantOperationType;
  region: string;
  industry: string;
  subscriptionId: string | null;
  orderNo: string | null;
  servicePlanName: string | null;
  tierName: string | null;
  productCode: string;
  productName: string;
  productType: string;
  metricCode: string;
  metricName: string;
  metricUnit: string;
  cycleMonth: string;
  usedValue: number;
  quotaValue: number;
  usageRate: number;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  risk: UsageMeteringRisk;
  lastSyncedAt: string;
  updatedAt: string;
}

export type PromotionOperationStatus = 'active' | 'scheduled' | 'expired' | 'paused';
export type PromotionOperationType = 'discount' | 'coupon' | 'campaign';

export interface PromotionOperationRecord {
  id: string;
  promotionCode: string;
  promotionName: string;
  promotionType: PromotionOperationType;
  status: PromotionOperationStatus;
  scopeLabel: string;
  planCode: string | null;
  planName: string | null;
  tierName: string | null;
  discountLabel: string;
  currency: string;
  originalPrice: number;
  salePrice: number;
  discountAmount: number;
  redemptionCount: number;
  usedAmount: number;
  tenantCount: number;
  startsAt: string;
  endsAt: string | null;
  ownerName: string;
  description: string;
  updatedAt: string;
}

export type PromotionRedemptionStatus = 'applied' | 'redeemed' | 'reversed';

export interface PromotionRedemptionRecord {
  id: string;
  redemptionNo: string;
  promotionCode: string;
  promotionName: string;
  status: PromotionRedemptionStatus;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantType: TenantOperationType;
  orderNo: string | null;
  billId: string;
  billNo: string;
  billStatus: BillingBillStatus;
  servicePlanName: string | null;
  tierName: string | null;
  currency: string;
  orderAmount: number;
  discountAmount: number;
  payableAmount: number;
  operatorName: string;
  redeemedAt: string;
  remark: string | null;
}

export interface CommerceOverviewMetric {
  key: string;
  label: string;
  value: number;
  amount?: number;
  currency?: string;
  tone: 'blue' | 'green' | 'amber' | 'rose';
  hint: string;
}

export interface CommerceOverviewRiskItem {
  id: string;
  title: string;
  detail: string;
  tone: 'green' | 'amber' | 'rose';
  href: string;
}

export interface CommerceOverviewPlanRevenue {
  planName: string;
  tierName: string;
  subscriptionCount: number;
  revenueAmount: number;
  paidAmount: number;
  discountAmount: number;
  currency: string;
}

export interface CommerceOverviewSnapshot {
  generatedAt: string;
  metrics: CommerceOverviewMetric[];
  risks: CommerceOverviewRiskItem[];
  planRevenue: CommerceOverviewPlanRevenue[];
}

export type BillingBillStatus = 'unpaid' | 'paying' | 'paid' | 'partial' | 'cancelled' | 'overdue';
export type BillingBillType = 'normal' | 'adjust' | 'supplement' | 'prepaid';
export type BillingBillAction = 'cancel' | 'discount' | 'mark_overdue' | 'create_adjustment' | 'create_supplement';
export type BillingInvoiceStatus = 'none' | 'applying' | 'auditing' | 'issued' | 'sending' | 'finished' | 'rejected' | 'red';
export type BillingInvoiceType = 'special_vat' | 'normal_vat' | 'electronic' | 'paper' | 'other';
export type BillingInvoiceTaxType = 'enterprise' | 'individual' | 'government' | 'other';
export type BillingInvoiceReceiptAction = 'update_shipping' | 'finish' | 'red';

export interface BillingInvoiceReceiptRecord {
  id: string;
  billId?: string;
  invoiceNo: string;
  invoiceType: BillingInvoiceType;
  invoiceTaxType: BillingInvoiceTaxType;
  invoiceTitle: string;
  taxNo: string | null;
  invoiceAmount: number;
  taxAmount: number;
  currency: string;
  invoiceStatus: BillingInvoiceStatus;
  statusRemark: string | null;
  invoiceCode: string | null;
  invoiceElectronicNo: string | null;
  invoiceFileUrl: string | null;
  issuedAt: string | null;
  expressCompany: string | null;
  expressNo: string | null;
  sendAt: string | null;
  auditorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingInvoiceLedgerRecord extends BillingInvoiceReceiptRecord {
  billId: string;
  billNo: string;
  billStatus: BillingBillStatus;
  billType: BillingBillType;
  billPayableAmount: number;
  billPaidAmount: number;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantType: TenantOperationType;
  region: string;
  industry: string;
  subscriptionId: string | null;
  orderNo: string | null;
  servicePlanName: string | null;
  tierName: string | null;
  sourceLabel: 'offline';
}

export interface BillingOperationEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  at: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}

export interface BillingRecord {
  id: string;
  billNo: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantType: TenantOperationType;
  region: string;
  industry: string;
  subscriptionId: string | null;
  orderNo: string | null;
  servicePlanName: string | null;
  tierName: string | null;
  billCycle: string;
  cycleStartDate: string;
  cycleEndDate: string;
  billStatus: BillingBillStatus;
  billType: BillingBillType;
  invoiceStatus: BillingInvoiceStatus;
  invoiceNo: string | null;
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  paidAmount: number;
  invoicedAmount: number;
  currency: string;
  paymentMethod: string | null;
  transactionNo: string | null;
  operationRemark: string | null;
  operatorName: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingDetailRecord extends BillingRecord {
  invoiceItems: OrderInvoiceItemRecord[];
  paymentRecords: OrderPaymentRecord[];
  invoiceReceipts: BillingInvoiceReceiptRecord[];
  operationTimeline: BillingOperationEvent[];
}

export type AccountOperationStatus = 'active' | 'invited' | 'locked' | 'disabled';

export interface AccountTenantBinding {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantType: TenantOperationType;
  role: string;
  isPrimaryOwner: boolean;
}

export interface AccountOperationRecord {
  id: string;
  accountCode: string;
  displayName: string;
  email: string;
  phone: string | null;
  status: AccountOperationStatus;
  primaryTenantId: string;
  primaryTenantCode: string;
  primaryTenantName: string;
  primaryTenantType: TenantOperationType;
  role: string;
  tenantCount: number;
  registeredAt: string;
  activatedAt: string | null;
  lastActiveAt: string;
  lastActiveIp: string | null;
  lastActiveLocation: string;
  loginCount30d: number;
  tenantBindings: AccountTenantBinding[];
}

export type PlatformPermissionType = 'MENU' | 'BUTTON' | 'API';

export interface PlatformRolePermissionRecord {
  id: string;
  parentId: string | null;
  permCode: string;
  permName: string;
  permType: PlatformPermissionType;
  status: boolean;
  description: string;
  routePath: string | null;
}

export interface PlatformAdminPermissionRecord extends PlatformRolePermissionRecord {
  icon: string | null;
  sort: number;
  component: string | null;
  roleCount: number;
  activeRoleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformRoleRecord {
  id: string;
  roleCode: string;
  nameI18nKey: string;
  nameEn: string;
  descriptionI18nKey: string | null;
  description: string;
  isSystem: boolean;
  statusCode: 'active' | 'disabled' | 'archived';
  status: boolean;
  sort: number;
  adminCount: number;
  activeAdminCount: number;
  permissionCount: number;
  menuPermissionCount: number;
  buttonPermissionCount: number;
  apiPermissionCount: number;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: PlatformRolePermissionRecord[];
}

export interface PlatformAdminRecord {
  id: string;
  sort: number;
  username: string;
  displayName: string;
  phone: string | null;
  email: string | null;
  roleId: string;
  roleCode: string;
  roleNameI18nKey: string;
  roleNameEn: string;
  statusCode: 'active' | 'disabled' | 'locked' | 'pending' | 'suspended';
  status: boolean;
  isSystem: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
}
