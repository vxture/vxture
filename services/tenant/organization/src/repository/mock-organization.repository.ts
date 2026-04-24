import { Injectable } from '@nestjs/common';
import type {
  OrganizationProfileView,
  OrganizationReadRepository,
  TenantContextView,
  TenantMemberView,
  TenantPermissionView,
  TenantMemberSummary,
  TenantMembershipView,
  TenantRoleView,
} from '../types/organization.types';

const mockTenantContext: TenantContextView = {
  tenantId: 'tenant_demo',
  tenantCode: 'demo',
  tenantName: 'Vxture Demo Tenant',
  displayName: 'Vxture Demo Tenant',
  tenantType: 'company',
  status: 'active',
  language: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  companyName: 'Vxture Demo Tenant',
  primaryDomain: 'demo.vxture.local',
  workspace: 'DEMO',
};

const mockMemberships: TenantMembershipView[] = [
  {
    tenantId: 'tenant_demo',
    accountId: 'u_console_admin',
    roleCode: 'owner',
    roleName: 'Owner',
    isPrimaryOwner: true,
    status: 'active',
    joinedAt: new Date('2026-04-01T08:00:00.000Z'),
  },
];

const mockSummary: TenantMemberSummary = {
  totalMembers: 12,
  activeMembers: 10,
  primaryOwners: 1,
  activeRoles: 4,
};

const mockRoles: TenantRoleView[] = [
  {
    id: 'role_owner',
    tenantId: 'tenant_demo',
    roleCode: 'owner',
    roleName: 'Owner',
    description: 'Workspace owner',
    isSystem: true,
    status: 'active',
    sort: 1,
    permissions: [],
  },
  {
    id: 'role_admin',
    tenantId: 'tenant_demo',
    roleCode: 'admin',
    roleName: 'Admin',
    description: 'Workspace admin',
    isSystem: true,
    status: 'active',
    sort: 2,
    permissions: [],
  },
  {
    id: 'role_member',
    tenantId: 'tenant_demo',
    roleCode: 'member',
    roleName: 'Member',
    description: 'Workspace member',
    isSystem: true,
    status: 'active',
    sort: 3,
    permissions: [],
  },
];

const mockPermissions: TenantPermissionView[] = [
  {
    id: 'perm_member_manage',
    permissionCode: 'tenant.user.manage',
    permissionName: '成员管理',
    permissionType: 'API',
    description: '管理租户成员',
    sort: 1,
  },
  {
    id: 'perm_role_manage',
    permissionCode: 'tenant.role.manage',
    permissionName: '角色管理',
    permissionType: 'API',
    description: '管理租户角色',
    sort: 2,
  },
];

const mockMembers: TenantMemberView[] = [
  {
    id: 'tm_demo_owner',
    tenantId: 'tenant_demo',
    accountId: 'u_console_admin',
    username: 'console.admin',
    email: 'admin@demo.vxture.local',
    phone: '13800000000',
    nickname: 'Console Admin',
    remark: 'Workspace',
    roleCode: 'owner',
    roleName: 'Owner',
    status: 'active',
    isPrimaryOwner: true,
    joinedAt: new Date('2026-04-01T08:00:00.000Z'),
    lastActiveAt: new Date('2026-04-24T02:00:00.000Z'),
  },
];

const mockOrganizationProfile: OrganizationProfileView = {
  tenantId: 'tenant_demo',
  tenantCode: 'demo',
  tenantName: 'Vxture Demo Tenant',
  displayName: 'Vxture Demo Tenant',
  tenantType: 'company',
  status: 'active',
  logoUrl: null,
  description: 'Demo organization profile',
  language: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  companyName: 'Vxture Demo Tenant',
  unifiedSocialCreditCode: '91310000DEMO000001',
  businessLicenseUrl: null,
  industry: 'AI Software',
  scale: '11-50',
  contactName: 'Console Admin',
  contactPhone: '13800000000',
  contactEmail: 'admin@demo.vxture.local',
  countryCode: 'CN',
  province: 'Shanghai',
  city: 'Shanghai',
  district: 'Pudong',
  address: 'Demo Road 1',
  postalCode: '200120',
  verifiedStatus: 'verified',
  verifiedAt: new Date('2026-04-01T08:00:00.000Z'),
  rejectedReason: null,
  primaryDomain: 'demo.vxture.local',
  updatedAt: new Date('2026-04-18T10:00:00.000Z'),
};

@Injectable()
export class MockOrganizationRepository implements OrganizationReadRepository {
  async getTenantMembershipsByAccountId(accountId: string): Promise<TenantMembershipView[]> {
    return mockMemberships.filter((membership) => membership.accountId === accountId);
  }

  async getTenantContextById(tenantId: string): Promise<TenantContextView | null> {
    return tenantId === mockTenantContext.tenantId ? mockTenantContext : null;
  }

  async getOrganizationProfileByTenantId(tenantId: string): Promise<OrganizationProfileView | null> {
    return tenantId === mockOrganizationProfile.tenantId ? mockOrganizationProfile : null;
  }

  async getTenantMemberById(tenantId: string, memberId: string): Promise<TenantMemberView | null> {
    return mockMembers.find((member) => member.tenantId === tenantId && member.id === memberId) ?? null;
  }

  async listTenantRoles(tenantId: string): Promise<TenantRoleView[]> {
    return mockRoles.filter((role) => role.tenantId === tenantId);
  }

  async listTenantPermissions(): Promise<TenantPermissionView[]> {
    return mockPermissions;
  }

  async createTenantRole(_tenantId: string): Promise<TenantRoleView> {
    return mockRoles[0]!;
  }

  async updateTenantRole(tenantId: string, roleId: string): Promise<TenantRoleView | null> {
    return mockRoles.find((role) => role.tenantId === tenantId && role.id === roleId) ?? null;
  }

  async removeTenantRole(): Promise<boolean> {
    return true;
  }

  async upsertTenantMember(): Promise<TenantMemberView> {
    return mockMembers[0] ?? {
      id: 'tm_demo_owner',
      tenantId: 'tenant_demo',
      accountId: 'u_console_admin',
      username: 'console.admin',
      email: 'admin@demo.vxture.local',
      phone: '13800000000',
      nickname: 'Console Admin',
      remark: 'Workspace',
      roleCode: 'owner',
      roleName: 'Owner',
      status: 'active',
      isPrimaryOwner: true,
      joinedAt: new Date('2026-04-01T08:00:00.000Z'),
      lastActiveAt: new Date('2026-04-24T02:00:00.000Z'),
    };
  }

  async updateTenantMember(tenantId: string, memberId: string): Promise<TenantMemberView | null> {
    return mockMembers.find((member) => member.tenantId === tenantId && member.id === memberId) ?? null;
  }

  async removeTenantMember(): Promise<boolean> {
    return true;
  }

  async getTenantMemberSummary(_tenantId: string): Promise<TenantMemberSummary> {
    return mockSummary;
  }

  async listTenantMembers(tenantId: string) {
    return mockMembers.filter((member) => member.tenantId === tenantId);
  }
}
