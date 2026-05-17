"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@vxture/design-system";
import type { IconName } from "@vxture/design-system";
import {
  ActionMenu,
  Badge,
  Button,
  Checkbox,
  Input,
  NativeSelect,
  Pagination,
} from "@vxture/design-system";
import { fetchAccountOperations } from "@/api/admin-bff";
import type { AccountOperationRecord } from "@/entities/console";
import { ActionButton } from "@/modules/shared/ActionButton";
import { EmptyState } from "@/modules/shared/EmptyState";
import { PageHeader } from "@/modules/shared/PageHeader";
import {
  PageSizePicker as AdminPageSizePicker,
  type PageSize,
} from "@/modules/shared/PageSizePicker";
import { ViewModeSwitch } from "@/modules/shared/ViewModeSwitch";
import {
  formatDate,
  formatNumber,
  joinClasses,
} from "@/modules/tenants/tenant-utils";

type ViewMode = "list" | "cards";
type StatusFilter = "all" | AccountOperationRecord["status"];
type TenantTypeFilter = "all" | "company" | "individual" | "mixed";
type RoleFilter = "all" | "owner" | "admin" | "member";
type AccountsPageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  summaryAriaLabel: string;
  toolbarAriaLabel: string;
  directoryAriaLabel: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  statusAriaLabel: string;
  tenantTypeAriaLabel: string;
  roleAriaLabel: string;
  createActionLabel: string;
  loadingTitle: string;
  loadingDescription: string;
  emptyTitle: string;
  emptyDescription: string;
};

type AccountStatusIndicatorTone =
  | "normal"
  | "progress"
  | "attention"
  | "closed";

const defaultAccountsPageCopy: AccountsPageCopy = {
  eyebrow: "租户账号",
  title: "账号体系",
  description:
    "平台运营侧跨租户检索账号、识别安全状态、处理账号启停与登录问题。",
  summaryAriaLabel: "账号运营统计",
  toolbarAriaLabel: "账号筛选",
  directoryAriaLabel: "账号清单",
  searchPlaceholder: "搜索账号、邮箱、租户、权限",
  searchAriaLabel: "搜索账号",
  statusAriaLabel: "账号状态",
  tenantTypeAriaLabel: "租户类型",
  roleAriaLabel: "权限类型",
  createActionLabel: "新建账号",
  loadingTitle: "正在加载账号",
  loadingDescription: "正在读取平台账号运营数据。",
  emptyTitle: "没有匹配的账号",
  emptyDescription: "清空筛选条件后可查看全部账号。",
};

function roleGroup(role: string): Exclude<RoleFilter, "all"> {
  const normalized = role.toLowerCase();
  if (normalized.includes("owner")) return "owner";
  if (normalized.includes("admin")) return "admin";
  return "member";
}

function accountRoleGroup(
  account: AccountOperationRecord,
): Exclude<RoleFilter, "all"> {
  const groups = account.tenantBindings.map((tenant) => roleGroup(tenant.role));
  if (groups.includes("owner")) return "owner";
  if (groups.includes("admin")) return "admin";
  return roleGroup(account.role);
}

function accountHighestRole(account: AccountOperationRecord) {
  const owner = account.tenantBindings.find(
    (tenant) => roleGroup(tenant.role) === "owner",
  );
  if (owner) return owner.role;

  const admin = account.tenantBindings.find(
    (tenant) => roleGroup(tenant.role) === "admin",
  );
  if (admin) return admin.role;

  return account.role;
}

function accountHighestRoleLabel(account: AccountOperationRecord) {
  const role = accountHighestRole(account);
  const normalized = role.toLowerCase();
  if (normalized.includes("owner")) return "owner";
  if (normalized.includes("admin")) return "admin";
  return role;
}

function accountTenantSummary(account: AccountOperationRecord) {
  const personalCount = account.tenantBindings.filter(
    (tenant) => tenant.tenantType === "individual",
  ).length;
  const companyCount = account.tenantBindings.filter(
    (tenant) => tenant.tenantType === "company",
  ).length;
  const tags = [
    personalCount > 0 ? "个人" : null,
    companyCount === 1
      ? "组织"
      : companyCount > 1
        ? `组织 ${formatNumber(companyCount)}`
        : null,
  ].filter(Boolean) as string[];
  const primary =
    account.tenantBindings.find((tenant) => tenant.isPrimaryOwner) ??
    account.tenantBindings[0];

  return {
    tags: tags.length ? tags : ["未归属"],
    primaryName: primary?.tenantName ?? account.primaryTenantName,
    personalCount,
    companyCount,
  };
}

function accountMatchesTenantType(
  account: AccountOperationRecord,
  filter: TenantTypeFilter,
) {
  if (filter === "all") return true;
  const summary = accountTenantSummary(account);
  if (filter === "mixed")
    return summary.personalCount > 0 && summary.companyCount > 0;
  return account.tenantBindings.some((tenant) => tenant.tenantType === filter);
}

function accountStatusLabel(status: AccountOperationRecord["status"]) {
  if (status === "active") return "正常";
  if (status === "invited") return "待激活";
  if (status === "locked") return "已锁定";
  return "已停用";
}

function accountStatusPillClass(status: AccountOperationRecord["status"]) {
  return `vx-tenant-pill vx-tenant-pill--${status} vx-account-status-pill--${status}`;
}

function accountStatusIndicator(account: AccountOperationRecord): {
  tone: AccountStatusIndicatorTone;
  label: string;
  icon: IconName;
} {
  if (account.status === "disabled") {
    return { tone: "closed", label: "已停用", icon: "x" };
  }

  if (account.status === "locked") {
    return { tone: "attention", label: "已锁定", icon: "warning" };
  }

  if (account.status === "invited") {
    return { tone: "progress", label: "待激活", icon: "clock" };
  }

  return { tone: "normal", label: "正常", icon: "check" };
}

function accountSearchText(account: AccountOperationRecord) {
  return [
    account.id,
    account.accountCode,
    account.displayName,
    account.email,
    account.phone,
    account.status,
    account.role,
    account.primaryTenantCode,
    account.primaryTenantName,
    account.lastActiveLocation,
    ...account.tenantBindings.map(
      (tenant) => `${tenant.tenantCode} ${tenant.tenantName} ${tenant.role}`,
    ),
  ]
    .join(" ")
    .toLowerCase();
}

function AccountSummaryItem({
  icon,
  label,
  value,
  tags,
  tone = "blue",
}: {
  icon: IconName;
  label: string;
  value: string;
  tags?: string[];
  tone?: "blue" | "green" | "amber" | "rose";
}) {
  return (
    <article
      className={joinClasses(
        `vx-tenant-summary__item vx-tenant-tone--${tone}`,
        icon === "user" || icon === "role"
          ? "vx-tenant-summary__item--identity-icon"
          : "",
      )}
    >
      <Icon name={icon} size="lg" fallback="placeholder" />
      <div>
        <span>{label}</span>
        <p>
          <strong>{value}</strong>
          {tags?.map((tag) => (
            <em key={tag}>{tag}</em>
          ))}
        </p>
      </div>
    </article>
  );
}

function AccountActionsMenu({ account }: { account: AccountOperationRecord }) {
  return (
    <div
      className="vx-tenant-actions"
      onClick={(event) => event.stopPropagation()}
    >
      <ActionMenu
        label={`${account.displayName} 操作`}
        triggerClassName="vx-tenant-actions__trigger"
        triggerProps={{ title: "操作" }}
        items={[
          {
            id: "details",
            label: "查看详情",
            icon: <Icon name="arrow-right" size="xs" fallback="placeholder" />,
            disabled: true,
          },
          {
            id: "reset-password",
            label: "重置密码",
            icon: <Icon name="key" size="xs" fallback="placeholder" />,
            disabled: true,
          },
          {
            id: "toggle-status",
            label:
              account.status === "disabled"
                ? "恢复账号"
                : account.status === "locked"
                  ? "解除锁定"
                  : "停用账号",
            icon: (
              <Icon
                name={
                  account.status === "disabled"
                    ? "success"
                    : account.status === "locked"
                      ? "check"
                      : "warning"
                }
                size="xs"
                fallback="placeholder"
              />
            ),
            disabled: true,
          },
        ]}
      />
    </div>
  );
}

function AccountListRows({
  accounts,
  startIndex,
  selectedAccountIds,
  isPageSelected,
  showTenantContext,
  onToggleAccount,
  onTogglePage,
}: {
  accounts: AccountOperationRecord[];
  startIndex: number;
  selectedAccountIds: Set<string>;
  isPageSelected: boolean;
  showTenantContext: boolean;
  onToggleAccount: (accountId: string, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
}) {
  const selectedOnPage = accounts.filter((account) =>
    selectedAccountIds.has(account.id),
  ).length;
  const isPagePartiallySelected =
    selectedOnPage > 0 && selectedOnPage < accounts.length;

  return (
    <div
      className={joinClasses(
        "vx-tenant-directory-list vx-account-directory-list",
        !showTenantContext ? "vx-account-directory-list--platform" : "",
      )}
      role="region"
      aria-label="账号清单"
    >
      <div className="vx-tenant-directory-list__header">
        <span>
          <Checkbox
            className="vx-model-select-checkbox"
            checked={
              isPageSelected
                ? true
                : isPagePartiallySelected
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) => onTogglePage(value === true)}
            aria-label="选择当前页账号"
          />
        </span>
        <span>序号</span>
        <span>账号</span>
        {showTenantContext ? <span>租户</span> : null}
        <span>状态</span>
        <span>权限</span>
        <span>登录</span>
        <span>操作</span>
      </div>
      {accounts.map((account, index) => {
        const indicator = accountStatusIndicator(account);
        const tenantSummary = accountTenantSummary(account);

        return (
          <div
            key={account.id}
            className={joinClasses(
              "vx-tenant-directory-row",
              "vx-account-operation-row",
              selectedAccountIds.has(account.id)
                ? "vx-account-operation-row--selected"
                : "",
            )}
            onClick={(event) => {
              if (
                event.target instanceof HTMLElement &&
                event.target.closest(
                  'button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]',
                )
              )
                return;
              onToggleAccount(account.id, !selectedAccountIds.has(account.id));
            }}
          >
            <span className="vx-account-operation-row__select">
              <Checkbox
                className="vx-model-select-checkbox"
                checked={selectedAccountIds.has(account.id)}
                onClick={(event) => event.stopPropagation()}
                onCheckedChange={(value) =>
                  onToggleAccount(account.id, value === true)
                }
                aria-label={`选择 ${account.displayName}`}
              />
            </span>
            <span className="vx-tenant-directory-row__index">
              {formatNumber(startIndex + index + 1)}
            </span>
            <span className="vx-tenant-directory-row__tenant">
              <Icon name="user" size="sm" fallback="placeholder" />
              <span>
                <span className="vx-tenant-directory-row__title-line">
                  <Button
                    variant="link"
                    className="vx-model-name-button"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {account.displayName}
                  </Button>
                </span>
                <small>
                  {account.accountCode} · {account.email}
                </small>
              </span>
            </span>
            {showTenantContext ? (
              <span className="vx-tenant-directory-row__subscription">
                <span className="vx-tenant-directory-row__tag-line">
                  {tenantSummary.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="vx-tenant-pill vx-account-muted-pill"
                    >
                      {tag}
                    </Badge>
                  ))}
                </span>
                <small>{tenantSummary.primaryName}</small>
              </span>
            ) : null}
            <span className="vx-tenant-directory-row__status">
              <span className="vx-tenant-directory-row__status-line">
                <span
                  className={`vx-tenant-status-dot vx-tenant-status-dot--${indicator.tone}`}
                  role="img"
                  aria-label={indicator.label}
                  title={indicator.label}
                >
                  <Icon
                    name={indicator.icon}
                    size="xs"
                    fallback="placeholder"
                  />
                </span>
                <span className="vx-tenant-directory-row__badges">
                  <Badge className={accountStatusPillClass(account.status)}>
                    {accountStatusLabel(account.status)}
                  </Badge>
                </span>
              </span>
            </span>
            <span className="vx-tenant-directory-row__subscription">
              <span className="vx-tenant-directory-row__tag-line">
                <Badge className="vx-tenant-pill vx-account-muted-pill vx-tenant-pill--permission">
                  {accountHighestRoleLabel(account)}
                </Badge>
              </span>
              <small>
                {showTenantContext
                  ? `${formatNumber(account.tenantCount)} 个租户`
                  : "平台角色"}
              </small>
            </span>
            <span className="vx-tenant-directory-row__service">
              <span className="vx-tenant-directory-row__tag-line">
                <Badge className="vx-tenant-pill vx-account-muted-pill vx-tenant-pill--product">
                  {account.lastActiveLocation}
                </Badge>
              </span>
              <small>
                {formatDate(account.lastActiveAt)} ·{" "}
                {formatNumber(account.loginCount30d)} 次
              </small>
            </span>
            <AccountActionsMenu account={account} />
          </div>
        );
      })}
    </div>
  );
}

function AccountCards({
  accounts,
  showTenantContext,
}: {
  accounts: AccountOperationRecord[];
  showTenantContext: boolean;
}) {
  return (
    <div className="vx-tenant-directory-cards" aria-label="账号卡片">
      {accounts.map((account) => (
        <article key={account.id} className="vx-tenant-directory-card">
          <header>
            <Icon name="user" size="lg" fallback="placeholder" />
            <div>
              <strong>{account.displayName}</strong>
              <span>
                {account.accountCode} · {account.email}
              </span>
            </div>
            <AccountActionsMenu account={account} />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Badge className={accountStatusPillClass(account.status)}>
              {accountStatusLabel(account.status)}
            </Badge>
            {showTenantContext
              ? accountTenantSummary(account).tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="vx-tenant-pill vx-account-muted-pill"
                  >
                    {tag}
                  </Badge>
                ))
              : null}
            <Badge className="vx-tenant-pill vx-account-muted-pill vx-tenant-pill--permission">
              {accountHighestRoleLabel(account)}
            </Badge>
          </div>
          <div className="vx-tenant-directory-card__metrics">
            {showTenantContext ? (
              <span>
                <b>{formatNumber(account.tenantCount)}</b>
                <small>租户</small>
              </span>
            ) : (
              <span>
                <b>{accountHighestRoleLabel(account)}</b>
                <small>平台角色</small>
              </span>
            )}
            <span>
              <b>{formatNumber(account.loginCount30d)}</b>
              <small>30日登录</small>
            </span>
            <span>
              <b>{account.lastActiveLocation}</b>
              <small>地址</small>
            </span>
          </div>
          <footer>
            <span>
              {showTenantContext
                ? accountTenantSummary(account).primaryName
                : "平台用户"}
            </span>
            <strong>{formatDate(account.lastActiveAt)}</strong>
          </footer>
        </article>
      ))}
    </div>
  );
}

function AccountPagination({
  currentPage,
  pageCount,
  total,
  pageSize,
  onPageSizeChange,
  onPageChange,
}: {
  currentPage: number;
  pageCount: number;
  total: number;
  pageSize: PageSize;
  onPageSizeChange: (value: PageSize) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <footer className="vx-tenant-pagination">
      <span className="vx-tenant-pagination__total">
        共 {formatNumber(total)} 条记录
      </span>
      <div className="vx-tenant-pagination__actions">
        <AdminPageSizePicker value={pageSize} onChange={onPageSizeChange} />
        <Pagination
          className="vx-tenant-pagination__pager"
          page={currentPage}
          pageCount={pageCount}
          onPageChange={onPageChange}
        />
      </div>
    </footer>
  );
}

export function AccountsPage({
  copy = defaultAccountsPageCopy,
  loadAccounts = fetchAccountOperations,
  showTenantContext = true,
}: {
  copy?: Partial<AccountsPageCopy>;
  loadAccounts?: () => Promise<AccountOperationRecord[]>;
  showTenantContext?: boolean;
} = {}) {
  const pageCopy = { ...defaultAccountsPageCopy, ...copy };
  const [accounts, setAccounts] = useState<AccountOperationRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tenantTypeFilter, setTenantTypeFilter] =
    useState<TenantTypeFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    loadAccounts()
      .then((records) => {
        if (active) setAccounts(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadAccounts]);

  const filteredAccounts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return accounts.filter((account) => {
      if (statusFilter !== "all" && account.status !== statusFilter)
        return false;
      if (
        showTenantContext &&
        !accountMatchesTenantType(account, tenantTypeFilter)
      )
        return false;
      if (roleFilter !== "all" && accountRoleGroup(account) !== roleFilter)
        return false;
      if (
        normalizedQuery &&
        !accountSearchText(account).includes(normalizedQuery)
      )
        return false;
      return true;
    });
  }, [
    accounts,
    query,
    roleFilter,
    showTenantContext,
    statusFilter,
    tenantTypeFilter,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const visibleAccounts = filteredAccounts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const visibleAccountIds = visibleAccounts.map((account) => account.id);
  const selectedVisibleAccountCount = visibleAccountIds.filter((accountId) =>
    selectedAccountIds.has(accountId),
  ).length;
  const isAccountPageSelected =
    visibleAccountIds.length > 0 &&
    selectedVisibleAccountCount === visibleAccountIds.length;
  const activeAccounts = accounts.filter(
    (account) => account.status === "active",
  ).length;
  const invitedAccounts = accounts.filter(
    (account) => account.status === "invited",
  ).length;
  const lockedAccounts = accounts.filter(
    (account) => account.status === "locked",
  ).length;
  const disabledAccounts = accounts.filter(
    (account) => account.status === "disabled",
  ).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, query, roleFilter, statusFilter, tenantTypeFilter, viewMode]);

  function handleReset() {
    setQuery("");
    setStatusFilter("all");
    setTenantTypeFilter("all");
    setRoleFilter("all");
  }

  function toggleAccountSelection(accountId: string, checked: boolean) {
    setSelectedAccountIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(accountId);
      } else {
        next.delete(accountId);
      }
      return next;
    });
  }

  function toggleAccountPageSelection(checked: boolean) {
    setSelectedAccountIds((current) => {
      const next = new Set(current);
      for (const accountId of visibleAccountIds) {
        if (checked) {
          next.add(accountId);
        } else {
          next.delete(accountId);
        }
      }
      return next;
    });
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-account-management-page">
      <PageHeader
        icon="user"
        eyebrow={pageCopy.eyebrow}
        title={pageCopy.title}
        description={pageCopy.description}
      />

      <section
        className="vx-tenant-summary"
        aria-label={pageCopy.summaryAriaLabel}
      >
        <AccountSummaryItem
          icon="user"
          label="账号总数"
          value={formatNumber(accounts.length)}
          tags={[`活跃 ${formatNumber(activeAccounts)}`]}
        />
        <AccountSummaryItem
          icon="clock"
          label="待激活"
          value={formatNumber(invitedAccounts)}
          tags={["邀请中"]}
          tone="amber"
        />
        <AccountSummaryItem
          icon="warning"
          label="已锁定"
          value={formatNumber(lockedAccounts)}
          tags={["临时锁定"]}
          tone={lockedAccounts ? "amber" : "green"}
        />
        <AccountSummaryItem
          icon="x"
          label="已停用"
          value={formatNumber(disabledAccounts)}
          tags={["长期未用"]}
          tone={disabledAccounts ? "rose" : "green"}
        />
      </section>

      <div className="vx-tenant-list-shell">
        <section
          className="vx-tenant-toolbar"
          aria-label={pageCopy.toolbarAriaLabel}
        >
          <ViewModeSwitch
            value={viewMode}
            onChange={setViewMode}
            ariaLabel={`${pageCopy.title}展示方式`}
          />
          <span className="vx-tenant-view-count">
            {formatNumber(filteredAccounts.length)}
          </span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={pageCopy.searchPlaceholder}
            className="vx-tenant-search"
            aria-label={pageCopy.searchAriaLabel}
          />
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <div className="vx-tenant-filters">
            <NativeSelect
              className="vx-input vx-tenant-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              aria-label={pageCopy.statusAriaLabel}
            >
              <option value="all">全部状态</option>
              <option value="active">正常</option>
              <option value="invited">待激活</option>
              <option value="locked">已锁定</option>
              <option value="disabled">已停用</option>
            </NativeSelect>
            {showTenantContext ? (
              <NativeSelect
                className="vx-input vx-tenant-select"
                value={tenantTypeFilter}
                onChange={(event) =>
                  setTenantTypeFilter(event.target.value as TenantTypeFilter)
                }
                aria-label={pageCopy.tenantTypeAriaLabel}
              >
                <option value="all">全部租户</option>
                <option value="individual">个人</option>
                <option value="company">组织</option>
                <option value="mixed">个人+组织</option>
              </NativeSelect>
            ) : null}
            <NativeSelect
              className="vx-input vx-tenant-select"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as RoleFilter)
              }
              aria-label={pageCopy.roleAriaLabel}
            >
              <option value="all">全部权限</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </NativeSelect>
          </div>
          <ActionButton variant="outline" icon="plus" disabled>
            {pageCopy.createActionLabel}
          </ActionButton>
        </section>

        <section
          className="vx-tenant-directory"
          aria-label={pageCopy.directoryAriaLabel}
        >
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {visibleAccounts.length ? (
            viewMode === "list" ? (
              <AccountListRows
                accounts={visibleAccounts}
                startIndex={(Math.min(currentPage, pageCount) - 1) * pageSize}
                selectedAccountIds={selectedAccountIds}
                isPageSelected={isAccountPageSelected}
                showTenantContext={showTenantContext}
                onToggleAccount={toggleAccountSelection}
                onTogglePage={toggleAccountPageSelection}
              />
            ) : (
              <AccountCards
                accounts={visibleAccounts}
                showTenantContext={showTenantContext}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? pageCopy.loadingTitle : pageCopy.emptyTitle}
                description={
                  loading
                    ? pageCopy.loadingDescription
                    : pageCopy.emptyDescription
                }
                action={
                  <ActionButton
                    variant="outline"
                    icon="x"
                    onClick={handleReset}
                  >
                    清空筛选
                  </ActionButton>
                }
              />
            </section>
          )}

          <AccountPagination
            currentPage={Math.min(currentPage, pageCount)}
            pageCount={pageCount}
            total={filteredAccounts.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) =>
              setCurrentPage(Math.min(Math.max(page, 1), pageCount))
            }
          />
        </section>
      </div>
    </div>
  );
}
