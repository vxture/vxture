"use client";

import { Avatar, AvatarFallback, Button, Icon } from "@vxture/design-system";
import type { TenantListItem } from "@/features/tenant";

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function TenantSwitcherItem({
  tenant,
  compact = false,
  onSelect,
}: {
  tenant: TenantListItem;
  compact?: boolean;
  onSelect?: (tenantId: string) => void;
}) {
  const typeLabel = tenant.type === "personal" ? "Personal" : "Organization";

  return (
    <Button
      variant="ghost"
      className={
        tenant.isCurrent
          ? "vx-tenant-switcher__item vx-tenant-switcher__item--current"
          : "vx-tenant-switcher__item"
      }
      disabled={!onSelect}
      onClick={() => onSelect?.(tenant.id)}
    >
      <Avatar className="vx-tenant-switcher__avatar">
        <AvatarFallback>{getInitials(tenant.name)}</AvatarFallback>
      </Avatar>

      <span className="vx-tenant-switcher__item-copy">
        <strong>{tenant.name}</strong>
        <span>
          {typeLabel}
          {!compact ? <small>{tenant.role}</small> : null}
        </span>
      </span>

      {tenant.isCurrent ? (
        <span
          className="vx-tenant-switcher__check"
          aria-label="Current workspace"
        >
          <Icon name="check" size="xs" fallback="check" />
        </span>
      ) : null}
    </Button>
  );
}
