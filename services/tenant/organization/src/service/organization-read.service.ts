import { Inject, Injectable } from '@nestjs/common';
import { ORGANIZATION_REPOSITORY } from '../tokens';
import type {
  OrganizationProfileView,
  OrganizationReadRepository,
  TenantContextView,
  TenantMemberStatus,
  TenantMemberSummary,
  TenantRoleStatus,
  UpsertTenantMemberInput,
} from '../types/organization.types';

@Injectable()
export class OrganizationReadService {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly repository: OrganizationReadRepository,
  ) {}

  async resolveTenantContextForAccount(accountId: string): Promise<TenantContextView | null> {
    const memberships = await this.repository.getTenantMembershipsByAccountId(accountId);
    const primaryMembership = memberships[0];

    if (!primaryMembership) {
      return null;
    }

    return this.repository.getTenantContextById(primaryMembership.tenantId);
  }

  async resolveTenantContextForAccountById(accountId: string, tenantId: string): Promise<TenantContextView | null> {
    const memberships = await this.repository.getTenantMembershipsByAccountId(accountId);
    const membership = memberships.find((item) => item.tenantId === tenantId);

    if (!membership) {
      return null;
    }

    return this.repository.getTenantContextById(membership.tenantId);
  }

  async listTenantContextsForAccount(accountId: string): Promise<TenantContextView[]> {
    const memberships = await this.repository.getTenantMembershipsByAccountId(accountId);
    const contexts = await Promise.all(
      memberships.map((membership) => this.repository.getTenantContextById(membership.tenantId)),
    );

    return contexts.filter((context): context is TenantContextView => Boolean(context));
  }

  async getOrganizationProfile(tenantId: string): Promise<OrganizationProfileView | null> {
    return this.repository.getOrganizationProfileByTenantId(tenantId);
  }

  async getTenantMember(tenantId: string, memberId: string) {
    return this.repository.getTenantMemberById(tenantId, memberId);
  }

  async listTenantRoles(tenantId: string) {
    return this.repository.listTenantRoles(tenantId);
  }

  async listTenantPermissions(tenantId: string) {
    return this.repository.listTenantPermissions(tenantId);
  }

  async createTenantRole(
    tenantId: string,
    operatorAccountId: string,
    input: {
      roleCode: string;
      roleName: string;
      description?: string | null;
      permissionIds?: string[];
    },
  ) {
    return this.repository.createTenantRole(tenantId, operatorAccountId, input);
  }

  async updateTenantRole(
    tenantId: string,
    roleId: string,
    operatorAccountId: string,
    input: {
      roleName?: string | null;
      description?: string | null;
      status?: TenantRoleStatus;
      permissionIds?: string[];
    },
  ) {
    return this.repository.updateTenantRole(tenantId, roleId, operatorAccountId, input);
  }

  async removeTenantRole(tenantId: string, roleId: string, operatorAccountId: string) {
    return this.repository.removeTenantRole(tenantId, roleId, operatorAccountId);
  }

  async createTenantMember(tenantId: string, operatorAccountId: string, input: Omit<UpsertTenantMemberInput, 'status' | 'joinedSource'>) {
    return this.repository.upsertTenantMember(tenantId, operatorAccountId, {
      ...input,
      status: 'active',
      joinedSource: 'created',
    });
  }

  async inviteTenantMember(tenantId: string, operatorAccountId: string, input: Omit<UpsertTenantMemberInput, 'status' | 'joinedSource'>) {
    return this.repository.upsertTenantMember(tenantId, operatorAccountId, {
      ...input,
      status: 'inactive',
      joinedSource: 'invited',
    });
  }

  async updateTenantMember(
    tenantId: string,
    memberId: string,
    operatorAccountId: string,
    input: {
      nickname?: string | null;
      remark?: string | null;
      roleId?: string | null;
      status?: TenantMemberStatus;
    },
  ) {
    return this.repository.updateTenantMember(tenantId, memberId, operatorAccountId, input);
  }

  async removeTenantMember(tenantId: string, memberId: string, operatorAccountId: string) {
    return this.repository.removeTenantMember(tenantId, memberId, operatorAccountId);
  }

  async getTenantMemberSummary(tenantId: string): Promise<TenantMemberSummary> {
    return this.repository.getTenantMemberSummary(tenantId);
  }

  async listTenantMembers(tenantId: string) {
    return this.repository.listTenantMembers(tenantId);
  }
}
