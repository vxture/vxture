import type { Capability } from "@/entities/console";
import type { IconName } from "@vxture/design-system";

export interface NavigationItem {
  href: string;
  labelKey: string;
  icon: IconName;
  descriptionKey: string;
  capability?: Capability;
  tenantTypes?: Array<"individual" | "company">;
}

export interface NavigationSection {
  titleKey: string;
  items: NavigationItem[];
}

export const navigationSections: NavigationSection[] = [
  {
    titleKey: "workspace",
    items: [
      {
        href: "/",
        labelKey: "overview.label",
        icon: "home",
        descriptionKey: "overview.description",
      },
      {
        href: "/todos",
        labelKey: "todos.label",
        icon: "calendar",
        descriptionKey: "todos.description",
      },
    ],
  },
  {
    titleKey: "accountTenant",
    items: [
      {
        href: "/profile",
        labelKey: "profile.label",
        icon: "user",
        descriptionKey: "profile.description",
      },
      {
        href: "/personal-tenant",
        labelKey: "personalTenant.label",
        icon: "user",
        descriptionKey: "personalTenant.description",
        tenantTypes: ["individual"],
      },
      {
        href: "/organization",
        labelKey: "organization.label",
        icon: "building-library",
        descriptionKey: "organization.description",
        tenantTypes: ["company"],
      },
    ],
  },
  {
    titleKey: "membersPermissions",
    items: [
      {
        href: "/members",
        labelKey: "members.label",
        icon: "users",
        descriptionKey: "members.description",
        capability: "tenant.user.manage",
        tenantTypes: ["company"],
      },
      {
        href: "/roles",
        labelKey: "roles.label",
        icon: "shield-check",
        descriptionKey: "roles.description",
        capability: "tenant.role.manage",
        tenantTypes: ["company"],
      },
      {
        href: "/invitations",
        labelKey: "invitations.label",
        icon: "mail",
        descriptionKey: "invitations.description",
        tenantTypes: ["company"],
      },
    ],
  },
  {
    titleKey: "subscriptionBilling",
    items: [
      {
        href: "/subscription",
        labelKey: "subscription.label",
        icon: "chart-bar",
        descriptionKey: "subscription.description",
        capability: "tenant.subscription.read",
      },
      {
        href: "/billing",
        labelKey: "billing.label",
        icon: "calendar",
        descriptionKey: "billing.description",
        capability: "tenant.billing.read",
      },
      {
        href: "/quotas",
        labelKey: "quotas.label",
        icon: "database",
        descriptionKey: "quotas.description",
        capability: "tenant.quota.read",
      },
    ],
  },
  {
    titleKey: "advancedSettings",
    items: [
      {
        href: "/notifications",
        labelKey: "notifications.label",
        icon: "mail",
        descriptionKey: "notifications.description",
      },
      {
        href: "/security",
        labelKey: "security.label",
        icon: "shield-check",
        descriptionKey: "security.description",
      },
      {
        href: "/tenant-settings",
        labelKey: "tenantSettings.label",
        icon: "settings",
        descriptionKey: "tenantSettings.description",
      },
    ],
  },
];
