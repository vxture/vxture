export type TenantType = 'company' | 'individual';
export type TenantStatus = 'trial' | 'active' | 'suspended' | 'cancelled';
export type TenantMemberStatus = 'active' | 'inactive' | 'banned';
export type OrganizationVerifiedStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type TenantRoleStatus = 'active' | 'disabled';

export interface TenantContextView {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  displayName: string;
  tenantType: TenantType;
  status: TenantStatus;
  language: string;
  timeZone: string;
  companyName: string | null;
  primaryDomain: string | null;
  workspace: string;
}

export interface TenantMembershipView {
  tenantId: string;
  accountId: string;
  roleCode: string | null;
  roleName: string | null;
  isPrimaryOwner: boolean;
  status: TenantMemberStatus;
  joinedAt: Date;
}

export interface TenantMemberSummary {
  totalMembers: number;
  activeMembers: number;
  primaryOwners: number;
  activeRoles: number;
}

export interface TenantMemberView {
  id: string;
  tenantId: string;
  accountId: string;
  username: string;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  nickname: string | null;
  remark: string | null;
  roleCode: string | null;
  roleName: string | null;
  status: TenantMemberStatus;
  isPrimaryOwner: boolean;
  joinedAt: Date;
  lastActiveAt: Date | null;
}

export interface TenantRoleView {
  id: string;
  tenantId: string;
  roleCode: string;
  roleName: string;
  description: string | null;
  isSystem: boolean;
  status: TenantRoleStatus;
  sort: number;
  permissions: TenantPermissionView[];
}

export interface TenantPermissionView {
  id: string;
  permissionCode: string;
  permissionName: string;
  permissionType: string | null;
  description: string | null;
  sort: number;
}

export interface CreateTenantInput {
  accountId: string;
  email: string;
  displayName: string;
  type: TenantType;
}

export interface UpsertTenantMemberInput {
  email: string;
  nickname?: string | null;
  remark?: string | null;
  roleId?: string | null;
  roleCode?: string | null;
  status: TenantMemberStatus;
  joinedSource: 'created' | 'invited' | 'api';
}

export interface OrganizationProfileView {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  displayName: string;
  tenantType: TenantType;
  status: TenantStatus;
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
  verifiedStatus: OrganizationVerifiedStatus | null;
  verifiedAt: Date | null;
  rejectedReason: string | null;
  primaryDomain: string | null;
  updatedAt: Date | null;
}

export interface OrganizationReadRepository {
  createTenant(input: CreateTenantInput): Promise<TenantContextView>;
  getTenantMembershipsByAccountId(accountId: string): Promise<TenantMembershipView[]>;
  getTenantContextById(tenantId: string): Promise<TenantContextView | null>;
  getOrganizationProfileByTenantId(tenantId: string): Promise<OrganizationProfileView | null>;
  getTenantMemberById(tenantId: string, memberId: string): Promise<TenantMemberView | null>;
  listTenantPermissions(tenantId: string): Promise<TenantPermissionView[]>;
  listTenantRoles(tenantId: string): Promise<TenantRoleView[]>;
  createTenantRole(
    tenantId: string,
    operatorAccountId: string,
    input: {
      roleCode: string;
      roleName: string;
      description?: string | null;
      permissionIds?: string[];
    },
  ): Promise<TenantRoleView>;
  updateTenantRole(
    tenantId: string,
    roleId: string,
    operatorAccountId: string,
    input: {
      roleName?: string | null;
      description?: string | null;
      status?: TenantRoleStatus;
      permissionIds?: string[];
    },
  ): Promise<TenantRoleView | null>;
  removeTenantRole(tenantId: string, roleId: string, operatorAccountId: string): Promise<boolean>;
  upsertTenantMember(tenantId: string, operatorAccountId: string, input: UpsertTenantMemberInput): Promise<TenantMemberView>;
  updateTenantMember(
    tenantId: string,
    memberId: string,
    operatorAccountId: string,
    input: {
      nickname?: string | null;
      remark?: string | null;
      roleId?: string | null;
      status?: TenantMemberStatus;
    },
  ): Promise<TenantMemberView | null>;
  removeTenantMember(tenantId: string, memberId: string, operatorAccountId: string): Promise<boolean>;
  getTenantMemberSummary(tenantId: string): Promise<TenantMemberSummary>;
  listTenantMembers(tenantId: string): Promise<TenantMemberView[]>;
}
