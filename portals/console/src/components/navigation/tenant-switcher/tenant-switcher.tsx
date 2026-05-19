"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, Button, Icon } from "@vxture/design-system";
import { useTenant, type TenantType } from "@/features/tenant";
import { CreateTenantDialog } from "./create-tenant-dialog";
import { TenantSwitcherPanel } from "./tenant-switcher-panel";

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function TenantSwitcher() {
  const { currentTenant } = useTenant();
  const [panelOpen, setPanelOpen] = useState(false);
  const [createType, setCreateType] = useState<TenantType | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const tenantName = currentTenant?.name ?? "Workspace";
  const tenantType =
    currentTenant?.type === "personal" ? "Personal" : "Organization";

  useEffect(() => {
    if (!panelOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPanelOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [panelOpen]);

  return (
    <div className="vx-tenant-switcher" ref={rootRef}>
      <Button
        variant="ghost"
        className={
          panelOpen
            ? "vx-tenant-switcher__trigger vx-tenant-switcher__trigger--open"
            : "vx-tenant-switcher__trigger"
        }
        aria-haspopup="menu"
        aria-expanded={panelOpen}
        onClick={() => setPanelOpen((open) => !open)}
      >
        <Avatar className="vx-tenant-switcher__trigger-avatar">
          <AvatarFallback>{getInitials(tenantName)}</AvatarFallback>
        </Avatar>
        <span className="vx-tenant-switcher__trigger-copy">
          <strong title={tenantName}>{tenantName}</strong>
          <small>{tenantType}</small>
        </span>
        <Icon
          name="chevron-down"
          size="xs"
          fallback="arrow-down"
          className="vx-tenant-switcher__trigger-caret"
        />
      </Button>

      {panelOpen ? (
        <TenantSwitcherPanel
          onClose={() => setPanelOpen(false)}
          onCreate={(type) => {
            setCreateType(type);
          }}
        />
      ) : null}

      <CreateTenantDialog
        open={Boolean(createType)}
        type={createType ?? "organization"}
        onClose={() => setCreateType(null)}
        onCreated={() => setPanelOpen(false)}
      />
    </div>
  );
}
