import type { JwtAccessPayload } from "@vxture/core-auth";

export type Capability =
  | "platform.tenant.manage"
  | "platform.product.manage"
  | "platform.pricing.manage"
  | "platform.model.manage"
  | "tenant.user.manage"
  | "tenant.role.manage"
  | "tenant.subscription.read"
  | "tenant.billing.read"
  | "tenant.invoice.manage"
  | "tenant.payment.manage"
  | "tenant.quota.read";

export interface ConsoleUser {
  id: string;
  name: string;
  displayName?: string | null;
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
  tenantType: "company" | "individual";
  status: "trial" | "active" | "suspended" | "cancelled";
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
  verifiedStatus: "unverified" | "pending" | "verified" | "rejected" | null;
  verifiedAt: string | null;
  rejectedReason: string | null;
  primaryDomain: string | null;
  updatedAt: string | null;
}

export interface ConsoleTenantRole {
  id: string;
  roleCode: string;
  roleName: string;
  description: string | null;
  status: "active" | "disabled";
  isSystem: boolean;
  permissions: ConsoleTenantPermission[];
}

export interface ConsoleTenantPermission {
  id: string;
  permissionCode: string;
  permissionName: string;
  permissionType: string | null;
  description: string | null;
}

export interface MemberRecord {
  id: string;
  accountId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  email: string;
  phone: string | null;
  role: string;
  roleCode: string | null;
  roleId: string | null;
  status: "Active" | "Invited" | "Suspended";
  statusCode: "active" | "inactive" | "banned";
  lastActive: string;
  team: string;
  joinedAt: string;
  isPrimaryOwner: boolean;
}

export interface TenantContext {
  id: string;
  name: string;
  mode: "platform" | "tenant";
  workspace: string;
  tenantType?: "individual" | "company";
  tenantCode?: string;
  status?: string;
}

export interface RequestContext {
  auth?: JwtAccessPayload;
  user?: ConsoleUser;
  tenant?: TenantContext;
  capabilities?: Capability[];
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
