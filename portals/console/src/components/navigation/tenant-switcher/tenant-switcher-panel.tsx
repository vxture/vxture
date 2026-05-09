'use client';

import { Link } from '@/lib/i18n/navigation';
import { Icon } from '@vxture/design-system';
import { Button } from '@vxture/design-system';
import { useTenant, type TenantType } from '@/features/tenant';
import { TenantSwitcherItem } from './tenant-switcher-item';

export function TenantSwitcherPanel({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (type: TenantType) => void;
}) {
  const { currentTenant, tenantList, hasPersonalTenant, switchTenantContext } = useTenant();
  const canManage = currentTenant?.role === 'owner' || currentTenant?.role === 'admin';

  async function handleSelect(tenantId: string) {
    await switchTenantContext(tenantId);
    onClose();
  }

  return (
    <div className="vx-tenant-switcher__panel" role="menu" aria-label="Switch workspace">
      <div className="vx-tenant-switcher__panel-header">
        <strong>Switch workspace</strong>
        <Button variant="ghost" size="icon" className="vx-tenant-switcher__close" aria-label="Close workspace switcher" onClick={onClose}>
          x
        </Button>
      </div>

      {currentTenant ? (
        <section className="vx-tenant-switcher__current" aria-label="Current workspace">
          <p>Current workspace</p>
          <TenantSwitcherItem tenant={currentTenant} compact />
          <span className="vx-tenant-switcher__status">
            <Icon name="check" size="xs" fallback="check" />
            Currently active
          </span>
        </section>
      ) : null}

      <section className="vx-tenant-switcher__list" aria-label="Available workspaces">
        {tenantList.map((tenant) => (
          <TenantSwitcherItem
            key={tenant.id}
            tenant={tenant}
            onSelect={tenant.isCurrent ? undefined : (tenantId) => void handleSelect(tenantId)}
          />
        ))}
      </section>

      <section className="vx-tenant-switcher__actions" aria-label="Workspace actions">
        <Button variant="ghost" size="sm" onClick={() => onCreate('organization')}>
          <Icon name="plus" size="xs" fallback="plus" />
          Create workspace
        </Button>

        {!hasPersonalTenant ? (
          <Button variant="ghost" size="sm" onClick={() => onCreate('personal')}>
            <Icon name="user" size="xs" fallback="user" />
            Create personal workspace
          </Button>
        ) : null}

        <Button variant="ghost" size="sm" disabled>
          <Icon name="users" size="xs" fallback="users" />
          Join workspace
        </Button>

        <Link
          href="/tenant-settings"
          className={canManage ? 'vx-tenant-switcher__action-link' : 'vx-tenant-switcher__action-link vx-tenant-switcher__action-link--muted'}
          aria-disabled={!canManage}
          onClick={onClose}
        >
          <Icon name="settings" size="xs" fallback="settings" />
          Manage workspace
        </Link>
      </section>
    </div>
  );
}
