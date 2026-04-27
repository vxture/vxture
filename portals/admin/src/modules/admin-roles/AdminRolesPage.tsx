'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Input } from '@/components/ui/primitives';
import { fetchPlatformRoles } from '@/api/admin-bff';
import type { PlatformPermissionType, PlatformRoleRecord } from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import { formatDate, formatNumber, joinClasses } from '@/modules/tenants/tenant-utils';

type ViewMode = 'list' | 'cards';
type StatusFilter = 'all' | 'enabled' | 'disabled';
type RoleKindFilter = 'all' | 'system' | 'custom';
type PermissionFilter = 'all' | PlatformPermissionType | 'empty';
type RoleStatusTone = 'normal' | 'closed';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

const roleNameMap: Record<string, string> = {
  super_admin: '超级管理员',
  audit_admin: '审计管理员',
  config_admin: '配置管理员',
  tenant_admin: '租户管理员',
  helpdesk_admin: '服务支持',
  readonly_admin: '只读观察员',
  NAME_SUPER_ADMIN: '超级管理员',
  NAME_AUDIT_ADMIN: '审计管理员',
  NAME_CONFIG_ADMIN: '配置管理员',
  NAME_TENANT_ADMIN: '租户管理员',
  NAME_HELPDESK_ADMIN: '服务支持',
  NAME_READONLY_ADMIN: '只读观察员',
};

function roleDisplayName(role: PlatformRoleRecord) {
  return roleNameMap[role.roleName] ?? roleNameMap[role.roleCode] ?? role.roleName;
}

function roleDescription(role: PlatformRoleRecord) {
  if (role.description) return role.description;
  if (role.roleCode === 'super_admin') return '拥有运营平台全部权限，通常只保留给系统负责人。';
  if (role.roleCode === 'readonly_admin') return '只读查看运营数据，不参与配置和审核操作。';
  return '平台运营内部角色，与租户成员角色相互隔离。';
}

function permissionDisplayName(value: string) {
  return value
    .replace(/^(BTN|API|MENU)_/, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.toLowerCase())
    .join('.');
}

function roleStatusIndicator(role: PlatformRoleRecord): { tone: RoleStatusTone; label: string; icon: IconName } {
  return role.status
    ? { tone: 'normal', label: '启用', icon: 'check' }
    : { tone: 'closed', label: '停用', icon: 'x' };
}

function roleSearchText(role: PlatformRoleRecord) {
  return [
    role.id,
    role.roleCode,
    role.roleName,
    roleDisplayName(role),
    role.description,
    role.isSystem ? 'system 系统角色' : 'custom 自定义角色',
    role.status ? 'enabled 启用' : 'disabled 停用',
    ...role.permissions.map((permission) => `${permission.permCode} ${permission.permName} ${permission.permType} ${permission.description}`),
  ].join(' ').toLowerCase();
}

function roleMatchesPermission(role: PlatformRoleRecord, filter: PermissionFilter) {
  if (filter === 'all') return true;
  if (filter === 'empty') return role.permissionCount === 0;
  return role.permissions.some((permission) => permission.permType === filter);
}

function topPermissionNames(role: PlatformRoleRecord) {
  return role.permissions
    .slice(0, 3)
    .map((permission) => permissionDisplayName(permission.permName || permission.permCode))
    .join(' | ');
}

function AdminRoleSummaryItem({
  icon,
  label,
  value,
  tags,
  tone = 'blue',
}: {
  icon: IconName;
  label: string;
  value: string;
  tags?: string[];
  tone?: 'blue' | 'green' | 'amber' | 'rose';
}) {
  return (
    <article className={`vx-tenant-summary__item vx-tenant-tone--${tone}`}>
      <Icon name={icon} size="lg" fallback="placeholder" />
      <div>
        <span>{label}</span>
        <p>
          <strong>{value}</strong>
          {tags?.map((tag) => <em key={tag}>{tag}</em>)}
        </p>
      </div>
    </article>
  );
}

function AdminRolePageSizePicker({ value, onChange }: { value: PageSize; onChange: (value: PageSize) => void }) {
  return (
    <div className="vx-tenant-page-size" aria-label="每页条数">
      {PAGE_SIZE_OPTIONS.map((option) => (
        <span key={option}>
          <button
            type="button"
            className={value === option ? 'is-active' : undefined}
            onClick={() => onChange(option)}
            aria-label={`每页 ${option} 条`}
          >
            {option}
          </button>
        </span>
      ))}
    </div>
  );
}

function AdminRoleActionsMenu({
  role,
  open,
  onToggle,
  onClose,
}: {
  role: PlatformRoleRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()} onMouseLeave={onClose}>
      <button className="vx-tenant-actions__trigger" type="button" aria-label={`${roleDisplayName(role)} 操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <button type="button" role="menuitem" disabled>
            <Icon name="shield-check" size="xs" fallback="placeholder" />
            权限配置
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="edit" size="xs" fallback="placeholder" />
            编辑角色
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="copy" size="xs" fallback="placeholder" />
            复制角色
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name={role.status ? 'x' : 'check'} size="xs" fallback="placeholder" />
            {role.status ? '停用角色' : '启用角色'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PermissionTags({ role }: { role: PlatformRoleRecord }) {
  return (
    <span className="vx-admin-role-permission-tags">
      <Badge className="vx-tenant-pill vx-admin-role-pill--menu">菜单 {formatNumber(role.menuPermissionCount)}</Badge>
      <Badge className="vx-tenant-pill vx-admin-role-pill--button">按钮 {formatNumber(role.buttonPermissionCount)}</Badge>
      <Badge className="vx-tenant-pill vx-admin-role-pill--api">接口 {formatNumber(role.apiPermissionCount)}</Badge>
    </span>
  );
}

function AdminRoleListRows({
  roles,
  startIndex,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
}: {
  roles: PlatformRoleRecord[];
  startIndex: number;
  openMenuId: string | null;
  onOpenMenu: (roleId: string) => void;
  onCloseMenu: () => void;
}) {
  return (
    <div className="vx-tenant-directory-list vx-admin-role-directory-list" role="region" aria-label="运营角色清单">
      <div className="vx-tenant-directory-list__header">
        <span>序号</span>
        <span>角色</span>
        <span>状态</span>
        <span>管理员</span>
        <span>权限</span>
        <span>更新</span>
        <span>操作</span>
      </div>
      {roles.map((role, index) => {
        const indicator = roleStatusIndicator(role);

        return (
          <div key={role.id} className={joinClasses('vx-tenant-directory-row', role.status ? 'vx-admin-role-row--active' : 'vx-admin-role-row--disabled')}>
            <span className="vx-tenant-directory-row__index">{formatNumber(startIndex + index + 1)}</span>
            <span className="vx-tenant-directory-row__tenant vx-admin-role-row__identity">
              <Icon name="shield-check" size="sm" fallback="placeholder" />
              <span>
                <span className="vx-tenant-directory-row__title-line">
                  <strong>{roleDisplayName(role)}</strong>
                  <Badge className="vx-tenant-pill vx-admin-role-muted-pill">{role.isSystem ? '系统' : '自定义'}</Badge>
                </span>
                <small>{role.roleCode} · sort {formatNumber(role.sort)}</small>
              </span>
            </span>
            <span className="vx-admin-role-row__status">
              <span className="vx-tenant-directory-row__status-line">
                <span className={`vx-tenant-status-dot vx-tenant-status-dot--${indicator.tone}`} role="img" aria-label={indicator.label} title={indicator.label}>
                  <Icon name={indicator.icon} size="xs" fallback="placeholder" />
                </span>
                <Badge className={`vx-tenant-pill vx-admin-role-status-pill--${role.status ? 'enabled' : 'disabled'}`}>{indicator.label}</Badge>
              </span>
            </span>
            <span className="vx-admin-role-row__admins">
              <strong>{formatNumber(role.activeAdminCount)} / {formatNumber(role.adminCount)}</strong>
              <small>启用 / 全部</small>
            </span>
            <span className="vx-admin-role-row__permissions">
              <PermissionTags role={role} />
              <small>{role.permissionCount ? topPermissionNames(role) : '未分配权限'}</small>
            </span>
            <span className="vx-admin-role-row__updated">
              <strong>{formatDate(role.updatedAt)}</strong>
              <small>{formatDate(role.createdAt)} 创建</small>
            </span>
            <AdminRoleActionsMenu
              role={role}
              open={openMenuId === role.id}
              onToggle={() => onOpenMenu(openMenuId === role.id ? '' : role.id)}
              onClose={onCloseMenu}
            />
          </div>
        );
      })}
    </div>
  );
}

function AdminRoleCards({
  roles,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
}: {
  roles: PlatformRoleRecord[];
  openMenuId: string | null;
  onOpenMenu: (roleId: string) => void;
  onCloseMenu: () => void;
}) {
  return (
    <div className="vx-tenant-directory-cards vx-admin-role-cards" aria-label="运营角色卡片">
      {roles.map((role) => (
        <article key={role.id} className={joinClasses('vx-tenant-directory-card', role.status ? 'vx-admin-role-card--active' : 'vx-admin-role-card--disabled')}>
          <header>
            <Icon name="shield-check" size="lg" fallback="placeholder" />
            <div>
              <strong>{roleDisplayName(role)}</strong>
              <span>{role.roleCode} · {role.isSystem ? '系统角色' : '自定义角色'}</span>
            </div>
            <AdminRoleActionsMenu
              role={role}
              open={openMenuId === role.id}
              onToggle={() => onOpenMenu(openMenuId === role.id ? '' : role.id)}
              onClose={onCloseMenu}
            />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Badge className={`vx-tenant-pill vx-admin-role-status-pill--${role.status ? 'enabled' : 'disabled'}`}>{role.status ? '启用' : '停用'}</Badge>
            <Badge className="vx-tenant-pill vx-admin-role-muted-pill">{role.isSystem ? '系统' : '自定义'}</Badge>
          </div>
          <p className="vx-admin-role-card__description">{roleDescription(role)}</p>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{formatNumber(role.permissionCount)}</b>
              <small>权限</small>
            </span>
            <span>
              <b>{formatNumber(role.adminCount)}</b>
              <small>管理员</small>
            </span>
            <span>
              <b>{formatNumber(role.sort)}</b>
              <small>排序</small>
            </span>
          </div>
          <PermissionTags role={role} />
          <footer>
            <span>{topPermissionNames(role) || '未分配权限'}</span>
            <strong>{formatDate(role.updatedAt)}</strong>
          </footer>
        </article>
      ))}
    </div>
  );
}

function AdminRolePagination({
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
      <span className="vx-tenant-pagination__total">共 {formatNumber(total)} 条记录</span>
      <div className="vx-tenant-pagination__actions">
        <AdminRolePageSizePicker value={pageSize} onChange={onPageSizeChange} />
        <div className="vx-tenant-pagination__pager">
          <Button variant="outline" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
            上一页
          </Button>
          <strong>{currentPage} / {pageCount}</strong>
          <Button variant="outline" disabled={currentPage >= pageCount} onClick={() => onPageChange(currentPage + 1)}>
            下一页
          </Button>
        </div>
      </div>
    </footer>
  );
}

export function AdminRolesPage() {
  const [roles, setRoles] = useState<PlatformRoleRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleKindFilter, setRoleKindFilter] = useState<RoleKindFilter>('all');
  const [permissionFilter, setPermissionFilter] = useState<PermissionFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchPlatformRoles()
      .then((records) => {
        if (active) setRoles(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredRoles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return roles.filter((role) => {
      if (statusFilter === 'enabled' && !role.status) return false;
      if (statusFilter === 'disabled' && role.status) return false;
      if (roleKindFilter === 'system' && !role.isSystem) return false;
      if (roleKindFilter === 'custom' && role.isSystem) return false;
      if (!roleMatchesPermission(role, permissionFilter)) return false;
      if (normalizedQuery && !roleSearchText(role).includes(normalizedQuery)) return false;
      return true;
    });
  }, [permissionFilter, query, roleKindFilter, roles, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const visibleRoles = filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const enabledRoles = roles.filter((role) => role.status).length;
  const systemRoles = roles.filter((role) => role.isSystem).length;
  const assignedAdmins = roles.reduce((sum, role) => sum + role.adminCount, 0);
  const permissionTotal = roles.reduce((sum, role) => sum + role.permissionCount, 0);
  const emptyRoles = roles.filter((role) => role.permissionCount === 0).length;

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [pageSize, permissionFilter, query, roleKindFilter, statusFilter, viewMode]);

  function handleReset() {
    setQuery('');
    setStatusFilter('all');
    setRoleKindFilter('all');
    setPermissionFilter('all');
  }

  function handleOpenMenu(roleId: string) {
    setOpenMenuId(roleId || null);
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-admin-roles-page">
      <PageHeader
        icon="shield-check"
        title="运营角色"
        description="管理运营后台自身的角色与权限集合。此处只读取 platform_role 体系，不参与租户成员角色流转。"
      />

      <section className="vx-tenant-summary" aria-label="运营角色统计">
        <AdminRoleSummaryItem icon="shield-check" label="角色总数" value={formatNumber(roles.length)} tags={[`启用 ${formatNumber(enabledRoles)}`]} />
        <AdminRoleSummaryItem icon="key" label="授权总量" value={formatNumber(permissionTotal)} tags={[`空角色 ${formatNumber(emptyRoles)}`]} tone={emptyRoles ? 'amber' : 'green'} />
        <AdminRoleSummaryItem icon="users" label="管理员" value={formatNumber(assignedAdmins)} tags={[`系统角色 ${formatNumber(systemRoles)}`]} tone="green" />
        <AdminRoleSummaryItem icon="table" label="权限结构" value={formatNumber(roles.reduce((sum, role) => sum + role.menuPermissionCount, 0))} tags={['菜单']} tone="blue" />
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="运营角色筛选">
          <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="运营角色展示方式" />
          <span className="vx-tenant-view-count">{formatNumber(filteredRoles.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索角色、code、权限"
            className="vx-tenant-search vx-admin-role-search"
            aria-label="搜索运营角色"
          />
          <Button variant="outline" onClick={handleReset}>重置</Button>
          <div className="vx-tenant-filters">
            <select className="vx-input vx-tenant-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="角色状态">
              <option value="all">全部状态</option>
              <option value="enabled">启用</option>
              <option value="disabled">停用</option>
            </select>
            <select className="vx-input vx-tenant-select" value={roleKindFilter} onChange={(event) => setRoleKindFilter(event.target.value as RoleKindFilter)} aria-label="角色类型">
              <option value="all">全部类型</option>
              <option value="system">系统角色</option>
              <option value="custom">自定义角色</option>
            </select>
            <select className="vx-input vx-tenant-select" value={permissionFilter} onChange={(event) => setPermissionFilter(event.target.value as PermissionFilter)} aria-label="权限类型">
              <option value="all">全部权限</option>
              <option value="MENU">菜单</option>
              <option value="BUTTON">按钮</option>
              <option value="API">接口</option>
              <option value="empty">未授权</option>
            </select>
          </div>
          <ActionButton variant="outline" icon="plus" disabled>
            新建角色
          </ActionButton>
        </section>

        <section className="vx-tenant-directory" aria-label="运营角色清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {visibleRoles.length ? (
            viewMode === 'list' ? (
              <AdminRoleListRows
                roles={visibleRoles}
                startIndex={(Math.min(currentPage, pageCount) - 1) * pageSize}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
              />
            ) : (
              <AdminRoleCards
                roles={visibleRoles}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? '正在加载运营角色' : '没有匹配的运营角色'}
                description={loading ? '正在从 platform_role 读取运营平台角色。' : '清空筛选条件后可查看全部运营角色。'}
                action={
                  <ActionButton variant="outline" icon="x" onClick={handleReset}>
                    清空筛选
                  </ActionButton>
                }
              />
            </section>
          )}

          <AdminRolePagination
            currentPage={Math.min(currentPage, pageCount)}
            pageCount={pageCount}
            total={filteredRoles.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), pageCount))}
          />
        </section>
      </div>
    </div>
  );
}
