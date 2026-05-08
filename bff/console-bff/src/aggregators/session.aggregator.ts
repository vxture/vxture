import { Inject, Injectable } from '@nestjs/common';
import { AccountAuthService } from '@vxture/service-iam';
import { OrganizationReadService } from '@vxture/service-organization';
import type {
  ConsoleOrganizationProfile,
  ConsoleTenantPermission,
  ConsoleTenantRole,
  ConsoleUserProfile,
  MemberRecord,
  TenantContext,
} from '../types/console.types';

const TENANT_CAPABILITIES = [
  'tenant.user.manage',
  'tenant.role.manage',
  'tenant.subscription.read',
  'tenant.billing.read',
  'tenant.quota.read',
] as const;

const PLATFORM_CAPABILITIES = [
  'platform.tenant.manage',
  'platform.product.manage',
  'platform.pricing.manage',
  'platform.model.manage',
  ...TENANT_CAPABILITIES,
] as const;

@Injectable()
export class SessionAggregator {
  constructor(
    @Inject(OrganizationReadService)
    private readonly organizationReadService: OrganizationReadService,
    @Inject(AccountAuthService)
    private readonly accountAuthService: AccountAuthService,
  ) {}

  async getCurrentUser(accountId: string) {
    const [account, profile] = await Promise.all([
      this.accountAuthService.getAccountById(accountId),
      this.accountAuthService.getAccountProfile(accountId),
    ]);

    if (!account) {
      return null;
    }

    return {
      id: account.id,
      name: account.username,
      displayName: profile?.displayName ?? null,
      email: account.email ?? `${account.username}@local.vxture`,
      roleLabel: 'Authenticated User',
      username: account.username,
      phone: account.phone,
    };
  }

  async getCurrentUserProfile(accountId: string): Promise<ConsoleUserProfile | null> {
    const profile = await this.accountAuthService.getAccountProfile(accountId);
    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      headline: profile.headline,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      timezone: profile.timezone,
      language: profile.language,
      profileUpdatedAt: profile.profileUpdatedAt ? profile.profileUpdatedAt.toISOString() : null,
    };
  }

  async updateCurrentUserProfile(
    accountId: string,
    input: {
      displayName?: string | null;
      avatarUrl?: string | null;
      headline?: string | null;
      bio?: string | null;
      email?: string | null;
      phone?: string | null;
      timezone?: string | null;
      language?: string | null;
    },
  ): Promise<ConsoleUserProfile | null> {
    const profile = await this.accountAuthService.updateAccountProfile(accountId, input);
    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      headline: profile.headline,
      bio: profile.bio,
      email: profile.email,
      phone: profile.phone,
      timezone: profile.timezone,
      language: profile.language,
      profileUpdatedAt: profile.profileUpdatedAt ? profile.profileUpdatedAt.toISOString() : null,
    };
  }

  async getCurrentOrganizationProfile(accountId: string, tenantId?: string): Promise<ConsoleOrganizationProfile | null> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return null;
    }

    const profile = await this.organizationReadService.getOrganizationProfile(tenantContext.id);
    if (!profile) {
      return null;
    }

    return {
      tenantId: profile.tenantId,
      tenantCode: profile.tenantCode,
      tenantName: profile.tenantName,
      displayName: profile.displayName,
      tenantType: profile.tenantType,
      status: profile.status,
      logoUrl: profile.logoUrl,
      description: profile.description,
      language: profile.language,
      timeZone: profile.timeZone,
      companyName: profile.companyName,
      unifiedSocialCreditCode: profile.unifiedSocialCreditCode,
      businessLicenseUrl: profile.businessLicenseUrl,
      industry: profile.industry,
      scale: profile.scale,
      contactName: profile.contactName,
      contactPhone: profile.contactPhone,
      contactEmail: profile.contactEmail,
      countryCode: profile.countryCode,
      province: profile.province,
      city: profile.city,
      district: profile.district,
      address: profile.address,
      postalCode: profile.postalCode,
      verifiedStatus: profile.verifiedStatus,
      verifiedAt: profile.verifiedAt ? profile.verifiedAt.toISOString() : null,
      rejectedReason: profile.rejectedReason,
      primaryDomain: profile.primaryDomain,
      updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : null,
    };
  }

  async changeCurrentUserPassword(accountId: string, currentPassword: string, nextPassword: string) {
    await this.accountAuthService.changePassword(accountId, currentPassword, nextPassword);
  }

  async getTenantContext(accountId: string, tenantId?: string): Promise<TenantContext> {
    const tenantContext = tenantId
      ? await this.organizationReadService.resolveTenantContextForAccountById(accountId, tenantId)
      : await this.organizationReadService.resolveTenantContextForAccount(accountId);

    if (!tenantContext) {
      return {
        id: `platform:${accountId}`,
        name: 'Vxture Platform',
        mode: 'platform',
        workspace: 'PLATFORM',
      };
    }

    return {
      id: tenantContext.tenantId,
      name: tenantContext.displayName,
      mode: 'tenant',
      workspace: tenantContext.workspace,
      tenantType: tenantContext.tenantType,
      tenantCode: tenantContext.tenantCode,
      status: tenantContext.status,
    };
  }

  async getTenantContexts(accountId: string): Promise<TenantContext[]> {
    const contexts = await this.organizationReadService.listTenantContextsForAccount(accountId);
    return contexts.map((tenantContext) => ({
      id: tenantContext.tenantId,
      name: tenantContext.displayName,
      mode: 'tenant',
      workspace: tenantContext.workspace,
      tenantType: tenantContext.tenantType,
      tenantCode: tenantContext.tenantCode,
      status: tenantContext.status,
    }));
  }

  async getCapabilities(accountId: string, tenantId?: string) {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    return tenantContext.mode === 'tenant' ? [...TENANT_CAPABILITIES] : [...PLATFORM_CAPABILITIES];
  }

  async getIamSummary(accountId: string, tenantId?: string) {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return {
        totalMembers: 0,
        activeMembers: 0,
        primaryOwners: 0,
        activeRoles: 0,
      };
    }

    return this.organizationReadService.getTenantMemberSummary(tenantContext.id);
  }

  async listMembers(accountId: string, tenantId?: string): Promise<MemberRecord[]> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return [];
    }

    const members = await this.organizationReadService.listTenantMembers(tenantContext.id);
    return members.map(mapMemberRecord);
  }

  async getMember(accountId: string, tenantId: string | undefined, memberId: string): Promise<MemberRecord | null> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return null;
    }

    const member = await this.organizationReadService.getTenantMember(tenantContext.id, memberId);
    return member ? mapMemberRecord(member) : null;
  }

  async listTenantRoles(accountId: string, tenantId?: string): Promise<ConsoleTenantRole[]> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return [];
    }

    const roles = await this.organizationReadService.listTenantRoles(tenantContext.id);
    return roles.map((role) => ({
      id: role.id,
      roleCode: role.roleCode,
      roleName: role.roleName,
      description: role.description,
      status: role.status,
      isSystem: role.isSystem,
      permissions: role.permissions.map(mapTenantPermission),
    }));
  }

  async listTenantPermissions(accountId: string, tenantId?: string): Promise<ConsoleTenantPermission[]> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return [];
    }

    const permissions = await this.organizationReadService.listTenantPermissions(tenantContext.id);
    return permissions.map(mapTenantPermission);
  }

  async createRole(
    accountId: string,
    tenantId: string | undefined,
    input: { roleCode: string; roleName: string; description?: string | null; permissionIds?: string[] },
  ): Promise<ConsoleTenantRole | null> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return null;
    }

    const role = await this.organizationReadService.createTenantRole(tenantContext.id, accountId, input);
    return {
      id: role.id,
      roleCode: role.roleCode,
      roleName: role.roleName,
      description: role.description,
      status: role.status,
      isSystem: role.isSystem,
      permissions: role.permissions.map(mapTenantPermission),
    };
  }

  async updateRole(
    accountId: string,
    tenantId: string | undefined,
    roleId: string,
    input: { roleName?: string | null; description?: string | null; status?: 'active' | 'disabled'; permissionIds?: string[] },
  ): Promise<ConsoleTenantRole | null> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return null;
    }

    const role = await this.organizationReadService.updateTenantRole(tenantContext.id, roleId, accountId, input);
    return role
      ? {
          id: role.id,
          roleCode: role.roleCode,
          roleName: role.roleName,
          description: role.description,
          status: role.status,
          isSystem: role.isSystem,
          permissions: role.permissions.map(mapTenantPermission),
        }
      : null;
  }

  async deleteRole(accountId: string, tenantId: string | undefined, roleId: string): Promise<boolean> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return false;
    }

    return this.organizationReadService.removeTenantRole(tenantContext.id, roleId, accountId);
  }

  async createMember(
    accountId: string,
    tenantId: string | undefined,
    input: { email: string; nickname?: string | null; remark?: string | null; roleId?: string | null; roleCode?: string | null },
  ): Promise<MemberRecord | null> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return null;
    }

    const member = await this.organizationReadService.createTenantMember(tenantContext.id, accountId, input);
    return mapMemberRecord(member);
  }

  async inviteMember(
    accountId: string,
    tenantId: string | undefined,
    input: { email: string; nickname?: string | null; remark?: string | null; roleId?: string | null; roleCode?: string | null },
  ): Promise<MemberRecord | null> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return null;
    }

    const member = await this.organizationReadService.inviteTenantMember(tenantContext.id, accountId, input);
    return mapMemberRecord(member);
  }

  async updateMember(
    accountId: string,
    tenantId: string | undefined,
    memberId: string,
    input: { nickname?: string | null; remark?: string | null; roleId?: string | null; status?: 'active' | 'inactive' | 'banned' },
  ): Promise<MemberRecord | null> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return null;
    }

    const member = await this.organizationReadService.updateTenantMember(tenantContext.id, memberId, accountId, input);
    return member ? mapMemberRecord(member) : null;
  }

  async disableMember(accountId: string, tenantId: string | undefined, memberId: string): Promise<MemberRecord | null> {
    return this.updateMember(accountId, tenantId, memberId, { status: 'banned' });
  }

  async resetMemberPassword(
    accountId: string,
    tenantId: string | undefined,
    memberId: string,
    nextPassword: string,
  ): Promise<boolean> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return false;
    }

    const member = await this.organizationReadService.getTenantMember(tenantContext.id, memberId);
    if (!member) {
      return false;
    }

    await this.accountAuthService.resetPassword(member.accountId, nextPassword);
    return true;
  }

  async removeMember(accountId: string, tenantId: string | undefined, memberId: string): Promise<boolean> {
    const tenantContext = await this.getTenantContext(accountId, tenantId);
    if (tenantContext.mode === 'platform') {
      return false;
    }

    return this.organizationReadService.removeTenantMember(tenantContext.id, memberId, accountId);
  }
}

function mapMemberStatus(status: 'active' | 'inactive' | 'banned') {
  if (status === 'active') {
    return 'Active';
  }
  if (status === 'inactive') {
    return 'Invited';
  }
  return 'Suspended';
}

function mapMemberRecord(member: {
  id: string;
  accountId: string;
  username: string;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  nickname: string | null;
  remark: string | null;
  roleCode: string | null;
  roleName: string | null;
  status: 'active' | 'inactive' | 'banned';
  isPrimaryOwner: boolean;
  joinedAt: Date;
  lastActiveAt: Date | null;
}): MemberRecord {
  return {
    id: member.id,
    accountId: member.accountId,
    name: member.nickname ?? member.username,
    username: member.username,
    avatarUrl: member.avatarUrl,
    email: member.email ?? `${member.username}@local.vxture`,
    phone: member.phone,
    role: member.roleName ?? member.roleCode ?? 'Member',
    roleCode: member.roleCode,
    roleId: null,
    status: mapMemberStatus(member.status),
    statusCode: member.status,
    lastActive: formatLastActive(member.lastActiveAt),
    team: member.remark ?? 'Workspace',
    joinedAt: member.joinedAt.toISOString(),
    isPrimaryOwner: member.isPrimaryOwner,
  };
}

function formatLastActive(value: Date | null) {
  if (!value) {
    return 'Invitation sent';
  }

  const diffMs = Date.now() - value.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    return `${Math.max(1, Math.round(diffMs / minute))} minutes ago`;
  }
  if (diffMs < day) {
    return `${Math.round(diffMs / hour)} hours ago`;
  }
  return `${Math.round(diffMs / day)} days ago`;
}

function mapTenantPermission(permission: {
  id: string;
  permissionCode: string;
  permissionName: string;
  permissionType: string | null;
  description: string | null;
}): ConsoleTenantPermission {
  return {
    id: permission.id,
    permissionCode: permission.permissionCode,
    permissionName: permission.permissionName,
    permissionType: permission.permissionType,
    description: permission.description,
  };
}
