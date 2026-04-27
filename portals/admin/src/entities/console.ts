export type Capability = string;

export interface ConsoleUser {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  roleLabel: string;
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

export interface AdminAssistantChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AdminAssistantChatResponse {
  id: string;
  modelCode: string;
  agentCode: string;
  agentId: string;
  productCode: string;
  tenantId: string;
  policyId: string;
  message: AdminAssistantChatMessage;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
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

export interface PlatformRoleRecord {
  id: string;
  roleCode: string;
  roleName: string;
  description: string;
  isSystem: boolean;
  status: boolean;
  sort: number;
  adminCount: number;
  activeAdminCount: number;
  permissionCount: number;
  menuPermissionCount: number;
  buttonPermissionCount: number;
  apiPermissionCount: number;
  createdAt: string;
  updatedAt: string;
  permissions: PlatformRolePermissionRecord[];
}
