'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Checkbox, Input, NativeSelect } from '@vxture/design-system';
import { fetchPlatformPermissions, fetchPlatformRoles, replacePlatformRolePermissions } from '@/api/admin-bff';
import type { PlatformAdminPermissionRecord, PlatformPermissionType, PlatformRoleRecord } from '@/entities/console';
import { useConsoleTranslations } from '@/lib/console-intl';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import { formatDate, formatNumber, joinClasses } from '@/modules/tenants/tenant-utils';

type ViewMode = 'list' | 'cards';
type PlatformRoleStatusCode = PlatformRoleRecord['statusCode'];
type StatusFilter = 'all' | PlatformRoleStatusCode;
type RoleKindFilter = 'all' | 'system' | 'custom';
type PermissionFilter = 'all' | PlatformPermissionType | 'empty';
type RoleStatusTone = 'normal' | 'closed' | 'attention';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
const EMPTY_MARK = '-';

interface PermissionTreeNode {
  permission: PlatformAdminPermissionRecord;
  children: PermissionTreeNode[];
  depth: number;
}

function roleDisplayName(role: PlatformRoleRecord, t: ReturnType<typeof useConsoleTranslations>) {
  return t(role.nameI18nKey, role.nameEn || role.roleCode || EMPTY_MARK);
}

function roleDescription(role: PlatformRoleRecord, t: ReturnType<typeof useConsoleTranslations>) {
  return role.descriptionI18nKey ? t(role.descriptionI18nKey, role.description || '') : role.description || '';
}

function roleStatusCode(role: PlatformRoleRecord): PlatformRoleStatusCode {
  const statusCode = role.statusCode;
  if (statusCode === 'active' || statusCode === 'disabled' || statusCode === 'archived') {
    return statusCode;
  }
  return role.status ? 'active' : 'disabled';
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
  const statusCode = roleStatusCode(role);
  if (statusCode === 'active') return { tone: 'normal', label: '启用', icon: 'check' };
  if (statusCode === 'archived') return { tone: 'attention', label: '归档', icon: 'info' };
  return { tone: 'closed', label: '停用', icon: 'x' };
}

function roleStatusPillClass(role: PlatformRoleRecord) {
  const statusCode = roleStatusCode(role);
  if (statusCode === 'active') return 'vx-admin-role-status-pill--enabled';
  if (statusCode === 'archived') return 'vx-platform-user-status-pill--attention';
  return 'vx-admin-role-status-pill--disabled';
}

function roleSearchText(role: PlatformRoleRecord) {
  return [
    role.id,
    role.roleCode,
    role.nameI18nKey,
    role.nameEn,
    role.descriptionI18nKey,
    role.description,
    role.isSystem ? 'system 系统角色' : 'custom 自定义角色',
    roleStatusCode(role),
    roleStatusIndicator(role).label,
    ...role.permissions.map((permission) => `${permission.permCode} ${permission.permName} ${permission.permType} ${permission.description}`),
  ].join(' ').toLowerCase();
}

function roleMatchesPermission(role: PlatformRoleRecord, filter: PermissionFilter) {
  if (filter === 'all') return true;
  if (filter === 'empty') return role.permissionCount === 0;
  return role.permissions.some((permission) => permission.permType === filter);
}

function permissionLabel(permission: PlatformAdminPermissionRecord) {
  return permission.permName || permissionDisplayName(permission.permCode);
}

function buildPermissionTree(permissions: PlatformAdminPermissionRecord[]) {
  const nodeById = new Map<string, PermissionTreeNode>();
  for (const permission of permissions) {
    nodeById.set(permission.id, { permission, children: [], depth: 0 });
  }

  const roots: PermissionTreeNode[] = [];
  for (const node of nodeById.values()) {
    const parent = node.permission.parentId ? nodeById.get(node.permission.parentId) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: PermissionTreeNode[], depth = 0) => {
    nodes.sort((left, right) => left.permission.sort - right.permission.sort || left.permission.permCode.localeCompare(right.permission.permCode));
    nodes.forEach((node) => {
      node.depth = depth;
      sortNodes(node.children, depth + 1);
    });
  };
  sortNodes(roots);
  return roots;
}

function collectDescendantPermissionIds(node: PermissionTreeNode) {
  const ids: string[] = [];
  const walk = (current: PermissionTreeNode) => {
    ids.push(current.permission.id);
    current.children.forEach(walk);
  };
  walk(node);
  return ids;
}

function collectAncestorPermissionIds(permission: PlatformAdminPermissionRecord, permissionById: Map<string, PlatformAdminPermissionRecord>) {
  const ids: string[] = [];
  let current: PlatformAdminPermissionRecord | undefined = permission;
  const visited = new Set<string>();

  while (current?.parentId && !visited.has(current.id)) {
    visited.add(current.id);
    const parent = permissionById.get(current.parentId);
    if (!parent) break;
    ids.push(parent.id);
    current = parent;
  }

  return ids;
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
    <article className={joinClasses(`vx-tenant-summary__item vx-tenant-tone--${tone}`, icon === 'user' || icon === 'role' ? 'vx-tenant-summary__item--identity-icon' : '')}>
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
          <Button
            variant="ghost"
            size="sm"
            className={value === option ? 'is-active' : undefined}
            onClick={() => onChange(option)}
            aria-label={`每页 ${option} 条`}
          >
            {option}
          </Button>
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
  roleLabel,
  onOpenPermissions,
  onOpenAuthorization,
}: {
  role: PlatformRoleRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  roleLabel: string;
  onOpenPermissions: (role: PlatformRoleRecord) => void;
  onOpenAuthorization: (role: PlatformRoleRecord) => void;
}) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuWidth = 160;
      const menuHeight = menuRef.current?.offsetHeight ?? 176;
      const left = Math.max(8, Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth));
      const belowTop = rect.bottom + 4;
      const top = belowTop + menuHeight > window.innerHeight - 8 ? Math.max(8, rect.top - menuHeight - 4) : belowTop;
      setMenuPosition({ left, top });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose, open]);

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          className="vx-tenant-actions__menu vx-tenant-actions__menu--portal"
          role="menu"
          style={{ left: menuPosition.left, top: menuPosition.top }}
        >
          <Button
            variant="ghost"
            role="menuitem"
            onClick={() => {
              onClose();
              onOpenAuthorization(role);
            }}
          >
            <Icon name="key" size="xs" fallback="placeholder" />
            角色授权
          </Button>
          <Button
            variant="ghost"
            role="menuitem"
            onClick={() => {
              onClose();
              onOpenPermissions(role);
            }}
          >
            <Icon name="table" size="xs" fallback="placeholder" />
            权限详情
          </Button>
          <Button variant="ghost" role="menuitem" disabled>
            <Icon name="edit" size="xs" fallback="placeholder" />
            编辑角色
          </Button>
          <Button variant="ghost" role="menuitem" disabled>
            <Icon name="copy" size="xs" fallback="placeholder" />
            复制角色
          </Button>
          <Button variant="ghost" role="menuitem" disabled>
            <Icon name={roleStatusCode(role) === 'active' ? 'x' : 'check'} size="xs" fallback="placeholder" />
            {roleStatusCode(role) === 'active' ? '停用角色' : '启用角色'}
          </Button>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()}>
      <Button ref={triggerRef} variant="ghost" size="icon" className="vx-tenant-actions__trigger" aria-label={`${roleLabel} 操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </Button>
      {menu}
    </div>
  );
}

function AdminRolePermissionDialog({
  role,
  roleLabel,
  onClose,
}: {
  role: PlatformRoleRecord;
  roleLabel: string;
  onClose: () => void;
}) {
  const permissionsByType = useMemo(() => {
    const groups: Record<PlatformPermissionType, PlatformRoleRecord['permissions']> = {
      MENU: [],
      BUTTON: [],
      API: [],
    };
    for (const permission of role.permissions) {
      groups[permission.permType].push(permission);
    }
    return groups;
  }, [role.permissions]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="vx-admin-role-permission-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-role-permission-dialog-title" onMouseDown={onClose}>
      <section className="vx-admin-role-permission-dialog__panel" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <span className="vx-admin-role-permission-dialog__icon" aria-hidden="true">
            <Icon name="role" size="lg" fallback="placeholder" />
          </span>
          <div>
            <h2 id="admin-role-permission-dialog-title">{roleLabel}</h2>
            <p>{role.roleCode}</p>
          </div>
          <Button variant="ghost" size="icon" className="vx-admin-role-permission-dialog__close" aria-label="关闭权限详情" onClick={onClose}>
            <Icon name="x" size="sm" fallback="placeholder" />
          </Button>
        </header>
        <div className="vx-admin-role-permission-dialog__summary">
          <Badge className="vx-tenant-pill vx-admin-role-pill--menu">菜单 {formatNumber(role.menuPermissionCount)}</Badge>
          <Badge className="vx-tenant-pill vx-admin-role-pill--button">按钮 {formatNumber(role.buttonPermissionCount)}</Badge>
          <Badge className="vx-tenant-pill vx-admin-role-pill--api">接口 {formatNumber(role.apiPermissionCount)}</Badge>
        </div>
        <div className="vx-admin-role-permission-dialog__body">
          {(['MENU', 'BUTTON', 'API'] as const).map((type) => (
            <section key={type} className="vx-admin-role-permission-dialog__group">
              <h3>{type === 'MENU' ? '菜单权限' : type === 'BUTTON' ? '按钮权限' : '接口权限'}</h3>
              {permissionsByType[type].length ? (
                <div className="vx-admin-role-permission-dialog__list">
                  {permissionsByType[type].map((permission) => (
                    <article key={permission.id}>
                      <strong>{permissionDisplayName(permission.permName || permission.permCode)}</strong>
                      <code>{permission.permCode}</code>
                      {permission.description ? <small>{permission.description}</small> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="vx-admin-role-permission-dialog__empty">-</p>
              )}
            </section>
          ))}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function PermissionAuthorizationNode({
  node,
  selectedIds,
  permissionById,
  onToggle,
}: {
  node: PermissionTreeNode;
  selectedIds: Set<string>;
  permissionById: Map<string, PlatformAdminPermissionRecord>;
  onToggle: (node: PermissionTreeNode, checked: boolean) => void;
}) {
  const descendantIds = useMemo(() => collectDescendantPermissionIds(node), [node]);
  const selectedDescendantCount = descendantIds.filter((permissionId) => selectedIds.has(permissionId)).length;
  const checked = selectedIds.has(node.permission.id);
  const indeterminate = selectedDescendantCount > 0 && selectedDescendantCount < descendantIds.length;
  const parent = node.permission.parentId ? permissionById.get(node.permission.parentId) : null;

  return (
    <article className="vx-admin-role-auth-node" style={{ '--permission-depth': node.depth } as CSSProperties}>
      <label>
        <Checkbox
          className="vx-model-select-checkbox"
          checked={indeterminate ? 'indeterminate' : checked}
          disabled={!node.permission.status}
          onCheckedChange={(nextChecked) => onToggle(node, nextChecked === true)}
        />
        <span className="vx-admin-role-auth-node__main">
          <strong>{permissionLabel(node.permission)}</strong>
          <span>
            <Badge className={`vx-tenant-pill vx-admin-role-pill--${node.permission.permType.toLowerCase()}`}>{node.permission.permType === 'MENU' ? '菜单' : node.permission.permType === 'BUTTON' ? '按钮' : '接口'}</Badge>
            <Badge className="vx-tenant-pill vx-tenant-pill--system">{node.depth === 0 ? '根权限' : `L${node.depth}`}</Badge>
            {!node.permission.status ? <Badge className="vx-tenant-pill vx-admin-role-status-pill--disabled">停用</Badge> : null}
          </span>
          <small>{parent ? parent.permName || parent.permCode : node.permission.permCode}</small>
        </span>
      </label>
      {node.children.length ? (
        <div className="vx-admin-role-auth-node__children">
          {node.children.map((child) => (
            <PermissionAuthorizationNode
              key={child.permission.id}
              node={child}
              selectedIds={selectedIds}
              permissionById={permissionById}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function AdminRoleAuthorizationDialog({
  role,
  roleLabel,
  permissions,
  saving,
  error,
  onClose,
  onSave,
}: {
  role: PlatformRoleRecord;
  roleLabel: string;
  permissions: PlatformAdminPermissionRecord[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (permissionIds: string[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(role.permissions.map((permission) => permission.id)));
  const [query, setQuery] = useState('');
  const permissionById = useMemo(() => new Map(permissions.map((permission) => [permission.id, permission])), [permissions]);
  const permissionTree = useMemo(() => buildPermissionTree(permissions), [permissions]);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTree = useMemo(() => {
    if (!normalizedQuery) return permissionTree;

    const matches = (permission: PlatformAdminPermissionRecord) => {
      return [
        permission.permCode,
        permission.permName,
        permission.description,
        permission.routePath,
        permission.component,
        permission.permType,
      ].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
    };

    const filterNode = (node: PermissionTreeNode): PermissionTreeNode | null => {
      const children = node.children.map(filterNode).filter((child): child is PermissionTreeNode => Boolean(child));
      if (matches(node.permission) || children.length) {
        return { ...node, children };
      }
      return null;
    };

    return permissionTree.map(filterNode).filter((node): node is PermissionTreeNode => Boolean(node));
  }, [normalizedQuery, permissionTree]);

  const selectedPermissions = permissions.filter((permission) => selectedIds.has(permission.id));
  const selectedMenuCount = selectedPermissions.filter((permission) => permission.permType === 'MENU').length;
  const selectedButtonCount = selectedPermissions.filter((permission) => permission.permType === 'BUTTON').length;
  const selectedApiCount = selectedPermissions.filter((permission) => permission.permType === 'API').length;
  const changed = role.permissions.length !== selectedIds.size || role.permissions.some((permission) => !selectedIds.has(permission.id));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  function toggleNode(node: PermissionTreeNode, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(node.permission.id);
        collectAncestorPermissionIds(node.permission, permissionById).forEach((permissionId) => next.add(permissionId));
      } else {
        collectDescendantPermissionIds(node).forEach((permissionId) => next.delete(permissionId));
      }
      return next;
    });
  }

  return createPortal(
    <div className="vx-admin-role-permission-dialog vx-admin-role-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-role-auth-dialog-title" onMouseDown={() => !saving && onClose()}>
      <section className="vx-admin-role-permission-dialog__panel vx-admin-role-auth-dialog__panel" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <span className="vx-admin-role-permission-dialog__icon" aria-hidden="true">
            <Icon name="key" size="lg" fallback="placeholder" />
          </span>
          <div>
            <h2 id="admin-role-auth-dialog-title">角色授权</h2>
            <p>{roleLabel} / {role.roleCode}</p>
          </div>
          <Button variant="ghost" size="icon" className="vx-admin-role-permission-dialog__close" aria-label="关闭角色授权" disabled={saving} onClick={onClose}>
            <Icon name="x" size="sm" fallback="placeholder" />
          </Button>
        </header>
        <div className="vx-admin-role-permission-dialog__summary">
          <Badge className="vx-tenant-pill vx-admin-role-pill--menu">菜单 {formatNumber(selectedMenuCount)}</Badge>
          <Badge className="vx-tenant-pill vx-admin-role-pill--button">按钮 {formatNumber(selectedButtonCount)}</Badge>
          <Badge className="vx-tenant-pill vx-admin-role-pill--api">接口 {formatNumber(selectedApiCount)}</Badge>
          <Badge className="vx-tenant-pill vx-tenant-pill--system">合计 {formatNumber(selectedIds.size)}</Badge>
        </div>
        <section className="vx-admin-role-auth-dialog__toolbar" aria-label="授权筛选">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索权限 code、名称、路径" aria-label="搜索权限" />
          <Button variant="outline" disabled={saving} onClick={() => setSelectedIds(new Set(role.permissions.map((permission) => permission.id)))}>还原</Button>
        </section>
        {error ? <p className="vx-admin-role-auth-dialog__error">{error}</p> : null}
        <div className="vx-admin-role-auth-dialog__tree" role="tree" aria-label={`${roleLabel} 权限授权树`}>
          {visibleTree.length ? (
            visibleTree.map((node) => (
              <PermissionAuthorizationNode key={node.permission.id} node={node} selectedIds={selectedIds} permissionById={permissionById} onToggle={toggleNode} />
            ))
          ) : (
            <p className="vx-admin-role-permission-dialog__empty">没有匹配的权限</p>
          )}
        </div>
        <footer className="vx-admin-role-auth-dialog__footer">
          <Button variant="outline" disabled={saving} onClick={onClose}>取消</Button>
          <ActionButton icon="check" disabled={saving || !changed} onClick={() => onSave([...selectedIds])}>
            {saving ? '保存中' : '保存授权'}
          </ActionButton>
        </footer>
      </section>
    </div>,
    document.body,
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
  selectedRoleIds,
  isPageSelected,
  onOpenMenu,
  onCloseMenu,
  onToggleRole,
  onTogglePage,
  roleLabels,
  t,
  onOpenPermissions,
  onOpenAuthorization,
}: {
  roles: PlatformRoleRecord[];
  startIndex: number;
  openMenuId: string | null;
  selectedRoleIds: Set<string>;
  isPageSelected: boolean;
  onOpenMenu: (roleId: string) => void;
  onCloseMenu: () => void;
  onToggleRole: (roleId: string, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
  roleLabels: Map<string, string>;
  t: ReturnType<typeof useConsoleTranslations>;
  onOpenPermissions: (role: PlatformRoleRecord) => void;
  onOpenAuthorization: (role: PlatformRoleRecord) => void;
}) {
  const selectedOnPage = roles.filter((role) => selectedRoleIds.has(role.id)).length;
  const isPagePartiallySelected = selectedOnPage > 0 && selectedOnPage < roles.length;

  return (
    <div className="vx-tenant-directory-list vx-admin-role-directory-list" role="region" aria-label="平台角色清单">
      <div className="vx-tenant-directory-list__header">
        <span>
          <Checkbox
            className="vx-model-select-checkbox"
            checked={isPagePartiallySelected ? 'indeterminate' : isPageSelected}
            onCheckedChange={(checked) => onTogglePage(checked === true)}
            aria-label="选择当前页角色"
          />
        </span>
        <span>序号</span>
        <span>角色</span>
        <span>状态</span>
        <span>成员</span>
        <span>权限</span>
        <span>创建人</span>
        <span>操作</span>
      </div>
      {roles.map((role, index) => {
        const indicator = roleStatusIndicator(role);
        const roleLabel = roleLabels.get(role.id) ?? role.nameEn ?? role.roleCode ?? EMPTY_MARK;

        return (
          <div
            key={role.id}
            className={joinClasses(
              'vx-tenant-directory-row',
              'vx-admin-role-operation-row',
              roleStatusCode(role) === 'active' ? 'vx-admin-role-row--active' : 'vx-admin-role-row--disabled',
              selectedRoleIds.has(role.id) ? 'vx-admin-role-operation-row--selected' : '',
            )}
            onClick={(event) => {
              if (event.target instanceof HTMLElement && event.target.closest('button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]')) return;
              onToggleRole(role.id, !selectedRoleIds.has(role.id));
            }}
          >
            <span className="vx-admin-role-operation-row__select">
              <Checkbox
                className="vx-model-select-checkbox"
                checked={selectedRoleIds.has(role.id)}
                onClick={(event) => event.stopPropagation()}
                onCheckedChange={(checked) => onToggleRole(role.id, checked === true)}
                aria-label={`选择 ${roleLabel}`}
              />
            </span>
            <span className="vx-tenant-directory-row__index">{formatNumber(startIndex + index + 1)}</span>
            <span className="vx-tenant-directory-row__tenant vx-admin-role-row__identity" title={roleDescription(role, t) || undefined}>
              <Icon name="role" size="sm" fallback="placeholder" />
              <span>
                <span className="vx-tenant-directory-row__title-line">
                  <Button variant="link" className="vx-model-name-button" onClick={(event) => event.stopPropagation()}>
                    {roleLabel}
                  </Button>
                  {role.isSystem ? <Badge className="vx-tenant-pill vx-tenant-pill--system">系统</Badge> : null}
                </span>
                <small>{role.roleCode}</small>
              </span>
            </span>
            <span className="vx-admin-role-row__status">
              <span className="vx-tenant-directory-row__status-line">
                <span className={`vx-tenant-status-dot vx-tenant-status-dot--${indicator.tone}`} role="img" aria-label={indicator.label} title={indicator.label}>
                  <Icon name={indicator.icon} size="xs" fallback="placeholder" />
                </span>
                <Badge className={`vx-tenant-pill ${roleStatusPillClass(role)}`}>{indicator.label}</Badge>
              </span>
            </span>
            <span className="vx-admin-role-row__admins">
              <strong>{formatNumber(role.activeAdminCount)} / {formatNumber(role.adminCount)}</strong>
              <small>启用 / 全部</small>
            </span>
            <span className="vx-admin-role-row__permissions">
              <PermissionTags role={role} />
            </span>
            <span className="vx-admin-role-row__updated">
              <strong>{role.createdByName || EMPTY_MARK}</strong>
              <small>{formatDate(role.createdAt)}</small>
            </span>
            <AdminRoleActionsMenu
              role={role}
              roleLabel={roleLabel}
              open={openMenuId === role.id}
              onToggle={() => onOpenMenu(openMenuId === role.id ? '' : role.id)}
              onClose={onCloseMenu}
              onOpenPermissions={onOpenPermissions}
              onOpenAuthorization={onOpenAuthorization}
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
  roleLabels,
  t,
  onOpenPermissions,
  onOpenAuthorization,
}: {
  roles: PlatformRoleRecord[];
  openMenuId: string | null;
  onOpenMenu: (roleId: string) => void;
  onCloseMenu: () => void;
  roleLabels: Map<string, string>;
  t: ReturnType<typeof useConsoleTranslations>;
  onOpenPermissions: (role: PlatformRoleRecord) => void;
  onOpenAuthorization: (role: PlatformRoleRecord) => void;
}) {
  return (
    <div className="vx-tenant-directory-cards vx-admin-role-cards" aria-label="平台角色卡片">
      {roles.map((role) => (
        <article key={role.id} className={joinClasses('vx-tenant-directory-card', roleStatusCode(role) === 'active' ? 'vx-admin-role-card--active' : 'vx-admin-role-card--disabled')}>
          <header>
            <Icon name="role" size="lg" fallback="placeholder" />
            <div title={roleDescription(role, t) || undefined}>
              <strong>{roleLabels.get(role.id) ?? role.nameEn ?? role.roleCode ?? EMPTY_MARK}</strong>
              <span>{role.roleCode}</span>
            </div>
            <AdminRoleActionsMenu
              role={role}
              roleLabel={roleLabels.get(role.id) ?? role.nameEn ?? role.roleCode ?? EMPTY_MARK}
              open={openMenuId === role.id}
              onToggle={() => onOpenMenu(openMenuId === role.id ? '' : role.id)}
              onClose={onCloseMenu}
              onOpenPermissions={onOpenPermissions}
              onOpenAuthorization={onOpenAuthorization}
            />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Badge className={`vx-tenant-pill ${roleStatusPillClass(role)}`}>{roleStatusIndicator(role).label}</Badge>
            {role.isSystem ? <Badge className="vx-tenant-pill vx-tenant-pill--system">系统</Badge> : null}
          </div>
          <p className="vx-admin-role-card__description" title={roleDescription(role, t) || undefined}>{role.roleCode}</p>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{formatNumber(role.permissionCount)}</b>
              <small>权限</small>
            </span>
            <span>
              <b>{formatNumber(role.adminCount)}</b>
              <small>成员</small>
            </span>
            <span>
              <b>{formatDate(role.createdAt)}</b>
              <small>创建</small>
            </span>
          </div>
          <PermissionTags role={role} />
          <footer>
            <span>权限 {formatNumber(role.permissionCount)} 项</span>
            <strong>{role.createdByName || EMPTY_MARK}</strong>
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
  const t = useConsoleTranslations();
  const [roles, setRoles] = useState<PlatformRoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PlatformAdminPermissionRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleKindFilter, setRoleKindFilter] = useState<RoleKindFilter>('all');
  const [permissionFilter, setPermissionFilter] = useState<PermissionFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [permissionDialogRoleId, setPermissionDialogRoleId] = useState<string | null>(null);
  const [authorizationRoleId, setAuthorizationRoleId] = useState<string | null>(null);
  const [authorizationSaving, setAuthorizationSaving] = useState(false);
  const [authorizationError, setAuthorizationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);

    Promise.all([fetchPlatformRoles(), fetchPlatformPermissions()])
      .then(([roleRecords, permissionRecords]) => {
        if (!active) return;
        setRoles(roleRecords);
        setPermissions(permissionRecords);
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : '平台角色权限数据库读取失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const roleLabels = useMemo(() => {
    return new Map(roles.map((role) => [role.id, roleDisplayName(role, t)]));
  }, [roles, t]);

  const filteredRoles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return roles.filter((role) => {
      if (statusFilter !== 'all' && roleStatusCode(role) !== statusFilter) return false;
      if (roleKindFilter === 'system' && !role.isSystem) return false;
      if (roleKindFilter === 'custom' && role.isSystem) return false;
      if (!roleMatchesPermission(role, permissionFilter)) return false;
      if (normalizedQuery && !`${roleSearchText(role)} ${roleLabels.get(role.id) ?? ''}`.toLowerCase().includes(normalizedQuery)) return false;
      return true;
    });
  }, [permissionFilter, query, roleKindFilter, roleLabels, roles, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const visibleRoles = filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const permissionDialogRole = permissionDialogRoleId ? roles.find((role) => role.id === permissionDialogRoleId) ?? null : null;
  const authorizationRole = authorizationRoleId ? roles.find((role) => role.id === authorizationRoleId) ?? null : null;
  const visibleRoleIds = visibleRoles.map((role) => role.id);
  const selectedVisibleRoleCount = visibleRoleIds.filter((roleId) => selectedRoleIds.has(roleId)).length;
  const isRolePageSelected = visibleRoleIds.length > 0 && selectedVisibleRoleCount === visibleRoleIds.length;
  const enabledRoles = roles.filter((role) => roleStatusCode(role) === 'active').length;
  const systemRoles = roles.filter((role) => role.isSystem).length;
  const disabledRoles = roles.filter((role) => roleStatusCode(role) === 'disabled').length;
  const archivedRoles = roles.filter((role) => roleStatusCode(role) === 'archived').length;
  const otherRoleCount = disabledRoles + archivedRoles;

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

  function toggleRoleSelection(roleId: string, checked: boolean) {
    setSelectedRoleIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(roleId);
      } else {
        next.delete(roleId);
      }
      return next;
    });
  }

  function toggleRolePageSelection(checked: boolean) {
    setSelectedRoleIds((current) => {
      const next = new Set(current);
      for (const roleId of visibleRoleIds) {
        if (checked) {
          next.add(roleId);
        } else {
          next.delete(roleId);
        }
      }
      return next;
    });
  }

  async function saveRoleAuthorization(permissionIds: string[]) {
    if (!authorizationRole) return;

    setAuthorizationSaving(true);
    setAuthorizationError(null);
    try {
      const updatedRole = await replacePlatformRolePermissions(authorizationRole.id, permissionIds);
      setRoles((current) => current.map((role) => (role.id === updatedRole.id ? updatedRole : role)));
      setAuthorizationRoleId(null);
    } catch (error) {
      setAuthorizationError(error instanceof Error ? error.message : '角色授权保存失败');
    } finally {
      setAuthorizationSaving(false);
    }
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-admin-roles-page">
      <PageHeader
        icon="role"
        title="平台角色"
        description="管理平台用户角色、权限集合和授权覆盖；不参与租户成员角色流转。"
      />

      <section className="vx-tenant-summary vx-admin-roles-summary" aria-label="平台角色统计">
        <AdminRoleSummaryItem icon="role" label="角色总数" value={formatNumber(roles.length)} tags={[`系统预置 ${formatNumber(systemRoles)}`]} />
        <AdminRoleSummaryItem icon="check" label="启用角色" value={formatNumber(enabledRoles)} tags={['可授权']} tone="green" />
        <AdminRoleSummaryItem
          icon="x"
          label="其他角色"
          value={formatNumber(otherRoleCount)}
          tags={[
            ...(disabledRoles ? [`停用 ${formatNumber(disabledRoles)}`] : []),
            ...(archivedRoles ? [`归档 ${formatNumber(archivedRoles)}`] : []),
          ]}
          tone="rose"
        />
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="平台角色筛选">
          <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="平台角色展示方式" />
          <span className="vx-tenant-view-count">{formatNumber(filteredRoles.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索角色、权限、描述"
            className="vx-tenant-search vx-admin-role-search"
            aria-label="搜索平台角色"
          />
          <Button variant="outline" onClick={handleReset}>重置</Button>
          <div className="vx-tenant-filters">
            <NativeSelect className="vx-tenant-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="角色状态">
              <option value="all">全部状态</option>
              <option value="active">启用</option>
              <option value="disabled">停用</option>
              <option value="archived">归档</option>
            </NativeSelect>
            <NativeSelect className="vx-tenant-select" value={roleKindFilter} onChange={(event) => setRoleKindFilter(event.target.value as RoleKindFilter)} aria-label="角色类型">
              <option value="all">全部类型</option>
              <option value="system">系统角色</option>
              <option value="custom">自定义角色</option>
            </NativeSelect>
            <NativeSelect className="vx-tenant-select" value={permissionFilter} onChange={(event) => setPermissionFilter(event.target.value as PermissionFilter)} aria-label="权限类型">
              <option value="all">全部权限</option>
              <option value="MENU">菜单</option>
              <option value="BUTTON">按钮</option>
              <option value="API">接口</option>
              <option value="empty">未授权</option>
            </NativeSelect>
          </div>
          <ActionButton variant="outline" icon="plus" disabled>
            新建角色
          </ActionButton>
        </section>

        <section className="vx-tenant-directory" aria-label="平台角色清单">
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
                selectedRoleIds={selectedRoleIds}
                isPageSelected={isRolePageSelected}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onToggleRole={toggleRoleSelection}
                onTogglePage={toggleRolePageSelection}
                roleLabels={roleLabels}
                t={t}
                onOpenPermissions={(role) => setPermissionDialogRoleId(role.id)}
                onOpenAuthorization={(role) => {
                  setAuthorizationError(null);
                  setAuthorizationRoleId(role.id);
                }}
              />
            ) : (
              <AdminRoleCards
                roles={visibleRoles}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                roleLabels={roleLabels}
                t={t}
                onOpenPermissions={(role) => setPermissionDialogRoleId(role.id)}
                onOpenAuthorization={(role) => {
                  setAuthorizationError(null);
                  setAuthorizationRoleId(role.id);
                }}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? '正在加载平台角色' : loadError ? '平台角色读取失败' : '没有匹配的平台角色'}
                description={loading ? '正在从 platform.platform_role 读取平台角色。' : loadError ?? '清空筛选条件后可查看全部平台角色。'}
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
      {permissionDialogRole ? (
        <AdminRolePermissionDialog
          role={permissionDialogRole}
          roleLabel={roleLabels.get(permissionDialogRole.id) ?? permissionDialogRole.nameEn ?? permissionDialogRole.roleCode ?? EMPTY_MARK}
          onClose={() => setPermissionDialogRoleId(null)}
        />
      ) : null}
      {authorizationRole ? (
        <AdminRoleAuthorizationDialog
          role={authorizationRole}
          roleLabel={roleLabels.get(authorizationRole.id) ?? authorizationRole.nameEn ?? authorizationRole.roleCode ?? EMPTY_MARK}
          permissions={permissions}
          saving={authorizationSaving}
          error={authorizationError}
          onClose={() => {
            if (!authorizationSaving) setAuthorizationRoleId(null);
          }}
          onSave={saveRoleAuthorization}
        />
      ) : null}
    </div>
  );
}
