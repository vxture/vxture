'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import type { TenantContext } from '@/entities/console';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { createMockTenant, tenantRolePriority } from './mock';
import type { CreateTenantPayload, TenantContextState, TenantListItem, TenantProviderProps, TenantRole } from './types';

const TenantUiContext = createContext<TenantContextState | null>(null);

function slugify(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'tenant';
}

function inferRole(tenant: TenantContext): TenantRole {
  if (tenant.tenantType === 'individual') {
    return 'owner';
  }

  return tenant.status === 'active' ? 'admin' : 'member';
}

function mapTenantContextToItem(tenant: TenantContext, currentTenantId?: string | null): TenantListItem {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: slugify(tenant.tenantCode ?? tenant.workspace ?? tenant.name),
    type: tenant.tenantType === 'individual' ? 'personal' : 'organization',
    role: inferRole(tenant),
    isCurrent: tenant.id === currentTenantId,
    source: 'session',
  };
}

function sortTenants(items: TenantListItem[]) {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'personal' ? -1 : 1;
    }

    return tenantRolePriority[a.role] - tenantRolePriority[b.role] || a.name.localeCompare(b.name);
  });
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { session, switchTenant } = useConsoleSession();
  const router = useRouter();
  const pathname = usePathname();
  const [localTenants, setLocalTenants] = useState<TenantListItem[]>([]);
  const [localCurrentTenantId, setLocalCurrentTenantId] = useState<string | null>(null);

  const baseTenants = useMemo(() => {
    const tenantMap = new Map<string, TenantContext>();
    for (const tenant of session.tenantOptions ?? []) {
      tenantMap.set(tenant.id, tenant);
    }

    if (session.tenant) {
      tenantMap.set(session.tenant.id, session.tenant);
    }

    return Array.from(tenantMap.values());
  }, [session.tenant, session.tenantOptions]);

  const currentTenantId = localCurrentTenantId ?? session.tenant?.id ?? null;
  const tenantList = useMemo(() => {
    const sessionItems = baseTenants.map((tenant) => mapTenantContextToItem(tenant, currentTenantId));
    const localItems = localTenants.map((tenant) => ({
      ...tenant,
      isCurrent: tenant.id === currentTenantId,
    }));

    return sortTenants([...sessionItems, ...localItems]);
  }, [baseTenants, currentTenantId, localTenants]);

  const currentTenant = tenantList.find((tenant) => tenant.isCurrent) ?? tenantList[0] ?? null;
  const hasPersonalTenant = tenantList.some((tenant) => tenant.type === 'personal');

  async function switchTenantContext(tenantId: string) {
    const tenant = tenantList.find((item) => item.id === tenantId);
    if (!tenant || tenant.id === currentTenant?.id) {
      return;
    }

    if (tenant.source === 'mock') {
      setLocalCurrentTenantId(tenant.id);
      router.replace(pathname);
      router.refresh();
      return;
    }

    setLocalCurrentTenantId(null);
    await switchTenant(tenant.id);
    router.replace(pathname);
    router.refresh();
  }

  async function createTenant(payload: CreateTenantPayload) {
    if (payload.type === 'personal' && hasPersonalTenant) {
      throw new Error('Only one personal workspace is allowed.');
    }

    const tenant = createMockTenant({
      ...payload,
      slug: slugify(payload.slug || payload.name),
      ownerId: session.user?.id ?? 'local-user',
    });

    setLocalTenants((items) => [...items, tenant]);
    setLocalCurrentTenantId(tenant.id);
    router.replace(pathname);
    router.refresh();
  }

  return (
    <TenantUiContext.Provider
      value={{
        currentTenantId,
        currentTenant,
        tenantList,
        hasPersonalTenant,
        switchTenantContext,
        createTenant,
      }}
    >
      {children}
    </TenantUiContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantUiContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider.');
  }

  return context;
}
