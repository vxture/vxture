import type { TenantListItem, TenantRole } from './types';

export const tenantRolePriority: Record<TenantRole, number> = {
  owner: 0,
  admin: 1,
  member: 2,
};

export function createMockTenant(payload: {
  name: string;
  slug: string;
  type: 'personal' | 'organization';
  ownerId: string;
}): TenantListItem {
  return {
    id: `tenant_local_${payload.slug}_${Date.now()}`,
    name: payload.name,
    slug: payload.slug,
    type: payload.type,
    role: 'owner',
    isCurrent: true,
    source: 'mock',
  };
}
