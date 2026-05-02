'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Input } from '@/components/ui/primitives';
import { fetchPlatformPermissions } from '@/api/admin-bff';
import type { PlatformAdminPermissionRecord, PlatformPermissionType } from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch, type ViewModeSwitchValue } from '@/modules/shared/ViewModeSwitch';
import { formatNumber, joinClasses } from '@/modules/tenants/tenant-utils';

type PermissionFilter = 'all' | PlatformPermissionType;
type StatusFilter = 'all' | 'active' | 'disabled';
type SourceFilter = 'all' | 'system' | 'custom';
type PermissionDomainKey = 'tenant-ops' | 'platform-autonomy' | 'foundation';

const EMPTY_MARK = '-';
const TENANT_OPS_WORKSPACE_CODE = 'admin.workspace.tenant_ops';
const PLATFORM_AUTONOMY_WORKSPACE_CODE = 'admin.workspace.platform';
const DEFAULT_DOMAIN_FILTERS: DomainFilterState = {
  query: '',
  typeFilter: 'all',
  statusFilter: 'all',
  sourceFilter: 'all',
};

const permissionTypeMeta = {
  MENU: { label: '菜单', icon: 'table', className: 'vx-admin-permission-type--menu' },
  BUTTON: { label: '按钮', icon: 'check', className: 'vx-admin-permission-type--button' },
  API: { label: '接口', icon: 'api', className: 'vx-admin-permission-type--api' },
} as const;

function permissionStatusIndicator(permission: PlatformAdminPermissionRecord): { label: string; icon: IconName } {
  return permission.status ? { label: '启用', icon: 'check' } : { label: '停用', icon: 'x' };
}

function permissionLayerPillClass(depth: number) {
  if (depth <= 0) return 'vx-admin-permission-layer-pill--root';
  if (depth === 1) return 'vx-admin-permission-layer-pill--l1';
  if (depth === 2) return 'vx-admin-permission-layer-pill--l2';
  return 'vx-admin-permission-layer-pill--l3';
}

interface PermissionTreeNode {
  permission: PlatformAdminPermissionRecord;
  children: PermissionTreeNode[];
  depth: number;
  sequence: string;
}

interface PermissionDomainGroup {
  key: PermissionDomainKey;
  title: string;
  description: string;
  icon: IconName;
  nodes: PermissionTreeNode[];
  matchedCount: number;
  totalCount: number;
  activeCount: number;
  assignedCount: number;
  disabledCount: number;
  unassignedCount: number;
  levelCounts: {
    l1: number;
    l2: number;
    l3: number;
  };
}

interface DomainFilterState {
  query: string;
  typeFilter: PermissionFilter;
  statusFilter: StatusFilter;
  sourceFilter: SourceFilter;
}

function permissionDisplayName(permission: PlatformAdminPermissionRecord) {
  return permission.permName
    .replace(/^(BTN|API|MENU)_/, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.toLowerCase())
    .join('.');
}

function permissionSearchText(permission: PlatformAdminPermissionRecord) {
  return [
    permission.id,
    permission.parentId,
    permission.permCode,
    permission.permName,
    permission.permType,
    permission.description,
    permission.routePath,
    permission.component,
  ].filter(Boolean).join(' ').toLowerCase();
}

function permissionSource() {
  return 'system' as const;
}

function permissionMatchesFilters(permission: PlatformAdminPermissionRecord, filters: DomainFilterState) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  if (filters.typeFilter !== 'all' && permission.permType !== filters.typeFilter) return false;
  if (filters.statusFilter === 'active' && !permission.status) return false;
  if (filters.statusFilter === 'disabled' && permission.status) return false;
  if (filters.sourceFilter !== 'all' && permissionSource() !== filters.sourceFilter) return false;
  if (normalizedQuery && !permissionSearchText(permission).includes(normalizedQuery)) return false;
  return true;
}

function permissionDepth(permission: PlatformAdminPermissionRecord, permissionById: Map<string, PlatformAdminPermissionRecord>) {
  let depth = 0;
  let current: PlatformAdminPermissionRecord | undefined = permission;
  const visited = new Set<string>();

  while (current?.parentId && !visited.has(current.id)) {
    visited.add(current.id);
    const parent = permissionById.get(current.parentId);
    if (!parent) break;
    depth += 1;
    current = parent;
  }

  return depth;
}

function buildPermissionTree(permissions: PlatformAdminPermissionRecord[]): PermissionTreeNode[] {
  const byId = new Map<string, PermissionTreeNode>();
  for (const permission of permissions) {
    byId.set(permission.id, { permission, children: [], depth: 0, sequence: '' });
  }

  const roots: PermissionTreeNode[] = [];
  for (const node of byId.values()) {
    const parent = node.permission.parentId ? byId.get(node.permission.parentId) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: PermissionTreeNode[], depth: number) => {
    nodes.sort((a, b) => a.permission.sort - b.permission.sort || a.permission.permCode.localeCompare(b.permission.permCode));
    for (const node of nodes) {
      node.depth = depth;
      sortNodes(node.children, depth + 1);
    }
  };
  sortNodes(roots, 0);
  return roots;
}

function assignPermissionSequence(nodes: PermissionTreeNode[], parentParts: string[] = []) {
  return nodes.map((node, index) => {
    const sequenceParts = [...parentParts, String(index + 1).padStart(2, '0')];
    node.sequence = sequenceParts.join('.');
    assignPermissionSequence(node.children, sequenceParts);
    return node;
  });
}

function buildPermissionSequenceMap(permissions: PlatformAdminPermissionRecord[]) {
  const sequenceMap = new Map<string, string>();
  const stableTree = assignPermissionSequence(stripWorkspaceRoot(buildPermissionTree(permissions)));

  const walk = (node: PermissionTreeNode) => {
    sequenceMap.set(node.permission.id, node.sequence);
    node.children.forEach(walk);
  };
  stableTree.forEach(walk);

  return sequenceMap;
}

function applyPermissionSequence(nodes: PermissionTreeNode[], sequenceMap: Map<string, string>) {
  return nodes.map((node) => {
    node.sequence = sequenceMap.get(node.permission.id) ?? '';
    applyPermissionSequence(node.children, sequenceMap);
    return node;
  });
}

function collectPermissionIds(nodes: PermissionTreeNode[]) {
  const ids: string[] = [];
  const walk = (node: PermissionTreeNode) => {
    ids.push(node.permission.id);
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return ids;
}

function flattenTreeNodes(nodes: PermissionTreeNode[]) {
  const flattened: PermissionTreeNode[] = [];
  const walk = (node: PermissionTreeNode) => {
    flattened.push(node);
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return flattened;
}

function isSectionPermission(permission: PlatformAdminPermissionRecord) {
  return permission.permCode.startsWith('admin.section.');
}

function resolvePermissionDomain(permission: PlatformAdminPermissionRecord, permissionById: Map<string, PlatformAdminPermissionRecord>): PermissionDomainKey {
  let current: PlatformAdminPermissionRecord | undefined = permission;
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    if (current.permCode === TENANT_OPS_WORKSPACE_CODE) return 'tenant-ops';
    if (current.permCode === PLATFORM_AUTONOMY_WORKSPACE_CODE) return 'platform-autonomy';
    current = current.parentId ? permissionById.get(current.parentId) : undefined;
  }

  return 'foundation';
}

function includeAncestorContext(
  permissions: PlatformAdminPermissionRecord[],
  permissionById: Map<string, PlatformAdminPermissionRecord>,
) {
  const contextualPermissions = new Map<string, PlatformAdminPermissionRecord>();

  for (const permission of permissions) {
    let current: PlatformAdminPermissionRecord | undefined = permission;
    const visited = new Set<string>();

    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      contextualPermissions.set(current.id, current);
      current = current.parentId ? permissionById.get(current.parentId) : undefined;
    }
  }

  return [...contextualPermissions.values()];
}

function stripWorkspaceRoot(nodes: PermissionTreeNode[]) {
  if (nodes.length !== 1) return nodes;

  const root = nodes[0];
  if (!root) return nodes;

  if (
    (root.permission.permCode === TENANT_OPS_WORKSPACE_CODE || root.permission.permCode === PLATFORM_AUTONOMY_WORKSPACE_CODE) &&
    root.children.length
  ) {
    return root.children;
  }

  return nodes;
}

function buildPermissionDomainGroups(
  permissions: PlatformAdminPermissionRecord[],
  permissionById: Map<string, PlatformAdminPermissionRecord>,
  filtersByDomain: Record<PermissionDomainKey, DomainFilterState>,
): PermissionDomainGroup[] {
  const groupedPermissions: Record<PermissionDomainKey, PlatformAdminPermissionRecord[]> = {
    'tenant-ops': [],
    'platform-autonomy': [],
    foundation: [],
  };

  for (const permission of permissions) {
    groupedPermissions[resolvePermissionDomain(permission, permissionById)].push(permission);
  }

  const groups: Array<{
    key: PermissionDomainKey;
    title: string;
    description: string;
    icon: IconName;
    permissions: PlatformAdminPermissionRecord[];
  }> = [
    {
      key: 'tenant-ops',
      title: '运营管理域权限',
      description: '面向租户、账号、产品、订阅、交易、财务和客户服务的运营后台权限。',
      icon: 'buildings',
      permissions: groupedPermissions['tenant-ops'],
    },
    {
      key: 'platform-autonomy',
      title: '平台自治域权限',
      description: '面向平台内部身份、角色权限、平台资源、运行可靠性、安全审计和审批治理的权限。',
      icon: 'shield-check',
      permissions: groupedPermissions['platform-autonomy'],
    },
    {
      key: 'foundation',
      title: '基础系统权限',
      description: '历史系统、基础认证和兼容菜单权限，保留独立分组以免与运营域、自治域混淆。',
      icon: 'key',
      permissions: groupedPermissions.foundation,
    },
  ];

  return groups
    .map((group) => {
      const sequenceMap = buildPermissionSequenceMap(group.permissions);
      const levelCounts = group.permissions.reduce(
        (counts, permission) => {
          const depth = permissionDepth(permission, permissionById);
          if (depth === 1) counts.l1 += 1;
          if (depth === 2) counts.l2 += 1;
          if (depth >= 3) counts.l3 += 1;
          return counts;
        },
        { l1: 0, l2: 0, l3: 0 },
      );
      const matchedPermissions = group.permissions.filter((permission) => permissionMatchesFilters(permission, filtersByDomain[group.key]));
      const permissionsWithContext = includeAncestorContext(matchedPermissions, permissionById).filter((permission) => resolvePermissionDomain(permission, permissionById) === group.key);
      const activeCount = group.permissions.filter((permission) => permission.status).length;
      const assignedCount = group.permissions.filter((permission) => permission.roleCount > 0).length;

      return {
        key: group.key,
        title: group.title,
        description: group.description,
        icon: group.icon,
        nodes: applyPermissionSequence(stripWorkspaceRoot(buildPermissionTree(permissionsWithContext)), sequenceMap),
        matchedCount: matchedPermissions.length,
        totalCount: group.permissions.length,
        activeCount,
        assignedCount,
        disabledCount: group.permissions.length - activeCount,
        unassignedCount: group.permissions.length - assignedCount,
        levelCounts,
      };
    })
    .filter((group) => group.totalCount > 0);
}

function PermissionActionsMenu({
  permission,
  open,
  onToggle,
  onClose,
  onOpenDetail,
}: {
  permission: PlatformAdminPermissionRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenDetail: (permission: PlatformAdminPermissionRecord) => void;
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
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onOpenDetail(permission);
            }}
          >
            <Icon name="info" size="xs" fallback="placeholder" />
            权限详情
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="edit" size="xs" fallback="placeholder" />
            编辑权限
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="copy" size="xs" fallback="placeholder" />
            复制权限
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name={permission.status ? 'x' : 'check'} size="xs" fallback="placeholder" />
            {permission.status ? '停用权限' : '启用权限'}
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()}>
      <button ref={triggerRef} className="vx-tenant-actions__trigger" type="button" aria-label={`${permissionDisplayName(permission)} 操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </button>
      {menu}
    </div>
  );
}

function PermissionDetailDialog({
  permission,
  parentPermission,
  onClose,
}: {
  permission: PlatformAdminPermissionRecord;
  parentPermission: PlatformAdminPermissionRecord | null;
  onClose: () => void;
}) {
  const statusIndicator = permissionStatusIndicator(permission);

  return createPortal(
    <div className="vx-admin-role-permission-dialog" role="dialog" aria-modal="true" aria-label={`${permissionDisplayName(permission)} 权限详情`}>
      <div className="vx-admin-role-permission-dialog__backdrop" onClick={onClose} />
      <section className="vx-admin-role-permission-dialog__panel vx-admin-permission-detail-dialog">
        <header className="vx-admin-role-permission-dialog__header">
          <div>
            <h2>{permissionDisplayName(permission)}</h2>
            <p>{permission.permCode}</p>
          </div>
          <button type="button" className="vx-admin-role-permission-dialog__close" aria-label="关闭权限详情" onClick={onClose}>
            <Icon name="x" size="lg" fallback="placeholder" />
          </button>
        </header>
        <div className="vx-admin-role-permission-dialog__summary">
          <Badge className="vx-tenant-pill vx-tenant-pill--system">{permissionTypeMeta[permission.permType].label}</Badge>
          <Badge className={`vx-tenant-pill ${permission.status ? 'vx-admin-role-status-pill--enabled' : 'vx-admin-role-status-pill--disabled'}`}>
            <Icon name={statusIndicator.icon} size="xs" fallback="placeholder" />
            {statusIndicator.label}
          </Badge>
          <Badge className="vx-tenant-pill vx-tenant-pill--system">系统预置</Badge>
        </div>
        <dl className="vx-admin-permission-detail-dialog__grid">
          <div><dt>权限名称</dt><dd>{permission.permName || EMPTY_MARK}</dd></div>
          <div><dt>权限 Code</dt><dd>{permission.permCode}</dd></div>
          <div><dt>上级权限</dt><dd>{parentPermission ? parentPermission.permCode : EMPTY_MARK}</dd></div>
          <div><dt>授权角色</dt><dd>{formatNumber(permission.activeRoleCount)} / {formatNumber(permission.roleCount)}</dd></div>
          <div><dt>路径</dt><dd>{permission.routePath || EMPTY_MARK}</dd></div>
          <div><dt>组件</dt><dd>{permission.component || EMPTY_MARK}</dd></div>
          <div><dt>排序</dt><dd>{formatNumber(permission.sort)}</dd></div>
          <div><dt>更新时间</dt><dd>{permission.updatedAt ? new Date(permission.updatedAt).toLocaleString('zh-CN') : EMPTY_MARK}</dd></div>
          <div className="vx-admin-permission-detail-dialog__wide"><dt>描述</dt><dd>{permission.description || EMPTY_MARK}</dd></div>
        </dl>
      </section>
    </div>,
    document.body,
  );
}

function PermissionDomainStats({ group }: { group: PermissionDomainGroup }) {
  return (
    <section className="vx-tenant-summary vx-admin-permission-domain__stats vx-admin-permissions-summary" aria-label={`${group.title}统计`}>
      <article className="vx-tenant-summary__item vx-tenant-tone--blue">
        <Icon name="shield-check" size="lg" fallback="placeholder" />
        <div>
          <span>权限总数</span>
          <p>
            <strong>{formatNumber(group.totalCount)}</strong>
            <em>L1 {formatNumber(group.levelCounts.l1)}</em>
            <em>L2 {formatNumber(group.levelCounts.l2)}</em>
            <em>L3 {formatNumber(group.levelCounts.l3)}</em>
          </p>
        </div>
      </article>
      <article className="vx-tenant-summary__item vx-tenant-tone--green">
        <Icon name="check" size="lg" fallback="placeholder" />
        <div><span>启用权限</span><p><strong>{formatNumber(group.activeCount)}</strong><em>停用 {formatNumber(group.disabledCount)}</em></p></div>
      </article>
      <article className="vx-tenant-summary__item vx-tenant-tone--amber">
        <Icon name="key" size="lg" fallback="placeholder" />
        <div><span>绑定权限</span><p><strong>{formatNumber(group.assignedCount)}</strong><em>未绑定 {formatNumber(group.unassignedCount)}</em></p></div>
      </article>
    </section>
  );
}

function PermissionCardGrid({
  nodes,
  openActionMenuId,
  onToggleActionMenu,
  onCloseActionMenu,
  onOpenDetail,
}: {
  nodes: PermissionTreeNode[];
  openActionMenuId: string | null;
  onToggleActionMenu: (permissionId: string) => void;
  onCloseActionMenu: () => void;
  onOpenDetail: (permission: PlatformAdminPermissionRecord) => void;
}) {
  const flattenedNodes = flattenTreeNodes(nodes);

  return (
    <div className="vx-admin-permission-card-grid" aria-label="权限卡片清单">
      {flattenedNodes.map(({ permission, depth }) => {
        const meta = permissionTypeMeta[permission.permType];
        const statusIndicator = permissionStatusIndicator(permission);

        return (
          <article key={permission.id} className={joinClasses('vx-admin-permission-card', meta.className, permission.status ? '' : 'vx-admin-permission-card--disabled')} style={{ '--permission-depth': depth } as CSSProperties}>
            <header>
              <span>
                <Icon name={meta.icon} size="sm" fallback="placeholder" />
              </span>
              <div>
                <strong>{permissionDisplayName(permission)}</strong>
                <Badge className="vx-tenant-pill vx-tenant-pill--system">系统</Badge>
              </div>
              <PermissionActionsMenu
                permission={permission}
                open={openActionMenuId === permission.id}
                onToggle={() => onToggleActionMenu(permission.id)}
                onClose={onCloseActionMenu}
                onOpenDetail={onOpenDetail}
              />
            </header>
            <span className="vx-admin-permission-card__type"><Badge className="vx-tenant-pill vx-tenant-pill--system">{meta.label}</Badge></span>
            <dl>
              <div><dt>状态</dt><dd><Icon name={statusIndicator.icon} size="xs" fallback="placeholder" />{statusIndicator.label}</dd></div>
              <div><dt>授权角色</dt><dd>{formatNumber(permission.activeRoleCount)} / {formatNumber(permission.roleCount)}</dd></div>
              <div><dt>层级</dt><dd>{formatNumber(depth)}</dd></div>
              <div><dt>来源</dt><dd>系统预置</dd></div>
            </dl>
          </article>
        );
      })}
    </div>
  );
}

function PermissionTreeNodeView({
  node,
  expandedIds,
  onToggle,
  permissionById,
  openActionMenuId,
  onToggleActionMenu,
  onCloseActionMenu,
  onOpenDetail,
}: {
  node: PermissionTreeNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  permissionById: Map<string, PlatformAdminPermissionRecord>;
  openActionMenuId: string | null;
  onToggleActionMenu: (permissionId: string) => void;
  onCloseActionMenu: () => void;
  onOpenDetail: (permission: PlatformAdminPermissionRecord) => void;
}) {
  const { permission, children, depth } = node;
  const meta = permissionTypeMeta[permission.permType];
  const expanded = expandedIds.has(permission.id);
  const titleClassName = isSectionPermission(permission) || depth === 0 ? 'vx-admin-permission-tree-node__title--level-2' : 'vx-admin-permission-tree-node__title--level-3';
  const statusIndicator = permissionStatusIndicator(permission);

  return (
    <article className={joinClasses('vx-admin-permission-tree-node', meta.className, isSectionPermission(permission) ? 'vx-admin-permission-tree-node--section' : '', permission.status ? '' : 'vx-admin-permission-tree-node--disabled')} style={{ '--permission-depth': depth } as CSSProperties}>
      <div className="vx-admin-permission-tree-node__detail-row">
        <span className="vx-admin-permission-tree-node__summary">
          <span>{node.sequence || formatNumber(permission.sort)}</span>
        </span>
        <span className="vx-admin-permission-tree-node__name">
          <button type="button" className="vx-admin-permission-tree-node__toggle" onClick={() => onToggle(permission.id)} disabled={!children.length} aria-label={expanded ? '收起权限子级' : '展开权限子级'}>
            <Icon name={children.length ? (expanded ? 'chevron-down' : 'chevron-right') : 'chevron-right'} size="xs" fallback="chevron-right" />
          </button>
          <Icon name={meta.icon} size="sm" fallback="placeholder" />
          <span className={joinClasses('vx-admin-permission-tree-node__title', titleClassName)}>
            <strong>{permissionDisplayName(permission)}</strong>
            <span className="vx-admin-permission-tree-node__title-tags">
              <Badge className={joinClasses('vx-tenant-pill', 'vx-admin-permission-layer-pill', permissionLayerPillClass(depth))}>{depth === 0 ? '根权限' : `L${depth}`}</Badge>
              {children.length ? <Badge className="vx-tenant-pill vx-tenant-pill--system">{formatNumber(children.length)} 子级</Badge> : null}
              {isSectionPermission(permission) ? <Badge className="vx-tenant-pill vx-tenant-pill--system">业务分组</Badge> : null}
            </span>
          </span>
        </span>
        <span className="vx-admin-permission-tree-node__status">
          <Badge className={`vx-tenant-pill ${permission.status ? 'vx-admin-role-status-pill--enabled' : 'vx-admin-role-status-pill--disabled'}`}>
            <Icon name={statusIndicator.icon} size="xs" fallback="placeholder" />
            {statusIndicator.label}
          </Badge>
        </span>
        <span className="vx-admin-permission-tree-node__type">
          <Badge className="vx-tenant-pill vx-tenant-pill--system">{meta.label}</Badge>
        </span>
        <span className="vx-admin-permission-tree-node__source">
          <Badge className="vx-tenant-pill vx-tenant-pill--system">系统</Badge>
        </span>
        <span className="vx-admin-permission-tree-node__roles">
          <strong>{formatNumber(permission.activeRoleCount)} / {formatNumber(permission.roleCount)}</strong>
        </span>
        <span className="vx-admin-permission-tree-node__actions">
          <PermissionActionsMenu
            permission={permission}
            open={openActionMenuId === permission.id}
            onToggle={() => onToggleActionMenu(permission.id)}
            onClose={onCloseActionMenu}
            onOpenDetail={onOpenDetail}
          />
        </span>
      </div>
      {children.length && expanded ? (
        <div className="vx-admin-permission-tree-node__children">
          {children.map((child) => (
            <PermissionTreeNodeView
              key={child.permission.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              permissionById={permissionById}
              openActionMenuId={openActionMenuId}
              onToggleActionMenu={onToggleActionMenu}
              onCloseActionMenu={onCloseActionMenu}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function PermissionDomainSection({
  group,
  permissionById,
  expandedIds,
  onToggle,
  onExpand,
  onCollapse,
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onViewModeChange,
}: {
  group: PermissionDomainGroup;
  permissionById: Map<string, PlatformAdminPermissionRecord>;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onExpand: (ids: string[]) => void;
  onCollapse: (ids: string[]) => void;
  filters: DomainFilterState;
  onFilterChange: (patch: Partial<DomainFilterState>) => void;
  onResetFilters: () => void;
  viewMode: ViewModeSwitchValue;
  onViewModeChange: (mode: ViewModeSwitchValue) => void;
}) {
  const domainPermissionIds = useMemo(() => collectPermissionIds(group.nodes), [group.nodes]);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [detailPermissionId, setDetailPermissionId] = useState<string | null>(null);
  const detailPermission = detailPermissionId ? permissionById.get(detailPermissionId) ?? null : null;
  const detailParentPermission = detailPermission?.parentId ? permissionById.get(detailPermission.parentId) ?? null : null;

  function toggleActionMenu(permissionId: string) {
    setOpenActionMenuId((current) => (current === permissionId ? null : permissionId));
  }

  return (
    <section className="vx-admin-permission-domain" aria-labelledby={`permission-domain-${group.key}`}>
      <header className="admin-overview-heading vx-admin-permission-domain__header">
        <span className="admin-overview-heading__icon" aria-hidden="true">
          <Icon name={group.icon} size="lg" fallback="placeholder" />
        </span>
        <div className="admin-overview-heading__copy">
          <h2 id={`permission-domain-${group.key}`}>{group.title}</h2>
          <p>{group.description}</p>
        </div>
      </header>
      <PermissionDomainStats group={group} />
      <section className="vx-tenant-toolbar vx-admin-permission-domain__toolbar" aria-label={`${group.title}筛选`}>
        <ViewModeSwitch value={viewMode} onChange={onViewModeChange} ariaLabel={`${group.title}展示方式`} />
        <span className="vx-tenant-view-count">{formatNumber(group.matchedCount)} / {formatNumber(group.totalCount)}</span>
        <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
        <Input value={filters.query} onChange={(event) => onFilterChange({ query: event.target.value })} placeholder="搜索权限 code、名称、路径、组件" className="vx-tenant-search" aria-label={`搜索${group.title}`} />
        <Button variant="outline" onClick={onResetFilters}>重置</Button>
        <div className="vx-tenant-filters">
          <select className="vx-input vx-tenant-select" value={filters.typeFilter} onChange={(event) => onFilterChange({ typeFilter: event.target.value as PermissionFilter })} aria-label={`${group.title}权限类型`}>
            <option value="all">全部类型</option>
            <option value="MENU">菜单权限</option>
            <option value="BUTTON">按钮权限</option>
            <option value="API">接口权限</option>
          </select>
          <select className="vx-input vx-tenant-select" value={filters.statusFilter} onChange={(event) => onFilterChange({ statusFilter: event.target.value as StatusFilter })} aria-label={`${group.title}权限状态`}>
            <option value="all">全部状态</option>
            <option value="active">启用</option>
            <option value="disabled">停用</option>
          </select>
          <select className="vx-input vx-tenant-select" value={filters.sourceFilter} onChange={(event) => onFilterChange({ sourceFilter: event.target.value as SourceFilter })} aria-label={`${group.title}权限来源`}>
            <option value="all">全部来源</option>
            <option value="system">系统预置</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        <Button variant="outline" onClick={() => onExpand(domainPermissionIds)}>展开</Button>
        <Button variant="outline" onClick={() => onCollapse(domainPermissionIds)}>收起</Button>
        <ActionButton variant="outline" icon="plus" disabled>新增权限</ActionButton>
      </section>
      {group.nodes.length ? (
        viewMode === 'list' ? (
          <div className="vx-admin-permission-tree" role="treegrid" aria-label={group.title}>
            <div className="vx-admin-permission-tree__header">
              <span>序号</span>
              <span>权限名称</span>
              <span>状态</span>
              <span>类型</span>
              <span>来源</span>
              <span>授权角色</span>
              <span>操作</span>
            </div>
            {group.nodes.map((node) => (
              <PermissionTreeNodeView
                key={node.permission.id}
                node={node}
                expandedIds={expandedIds}
                onToggle={onToggle}
                permissionById={permissionById}
                openActionMenuId={openActionMenuId}
                onToggleActionMenu={toggleActionMenu}
                onCloseActionMenu={() => setOpenActionMenuId(null)}
                onOpenDetail={(permission) => {
                  setOpenActionMenuId(null);
                  setDetailPermissionId(permission.id);
                }}
              />
            ))}
          </div>
        ) : (
          <PermissionCardGrid
            nodes={group.nodes}
            openActionMenuId={openActionMenuId}
            onToggleActionMenu={toggleActionMenu}
            onCloseActionMenu={() => setOpenActionMenuId(null)}
            onOpenDetail={(permission) => {
              setOpenActionMenuId(null);
              setDetailPermissionId(permission.id);
            }}
          />
        )
      ) : (
        <section className="vx-tenant-empty vx-admin-permission-domain__empty">
          <EmptyState title={`没有匹配的${group.title}`} description="清空当前板块筛选条件后可查看该域全部权限。" action={<ActionButton variant="outline" icon="x" onClick={onResetFilters}>清空筛选</ActionButton>} />
        </section>
      )}
      {detailPermission ? (
        <PermissionDetailDialog permission={detailPermission} parentPermission={detailParentPermission} onClose={() => setDetailPermissionId(null)} />
      ) : null}
    </section>
  );
}

export function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<PlatformAdminPermissionRecord[]>([]);
  const [filtersByDomain, setFiltersByDomain] = useState<Record<PermissionDomainKey, DomainFilterState>>({
    'tenant-ops': { ...DEFAULT_DOMAIN_FILTERS },
    'platform-autonomy': { ...DEFAULT_DOMAIN_FILTERS },
    foundation: { ...DEFAULT_DOMAIN_FILTERS },
  });
  const [viewModeByDomain, setViewModeByDomain] = useState<Record<PermissionDomainKey, ViewModeSwitchValue>>({
    'tenant-ops': 'list',
    'platform-autonomy': 'list',
    foundation: 'list',
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedPermissionIds, setExpandedPermissionIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    fetchPlatformPermissions()
      .then((records) => {
        if (active) setPermissions(records);
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : '平台权限数据库读取失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const permissionById = useMemo(() => new Map(permissions.map((permission) => [permission.id, permission])), [permissions]);
  const permissionDomainGroups = useMemo(() => buildPermissionDomainGroups(permissions, permissionById, filtersByDomain), [filtersByDomain, permissions, permissionById]);

  const activeCount = permissions.filter((permission) => permission.status).length;
  const assignedCount = permissions.filter((permission) => permission.roleCount > 0).length;
  const disabledCount = permissions.length - activeCount;
  const unassignedCount = permissions.length - assignedCount;
  const permissionLevelCounts = useMemo(() => {
    return permissions.reduce(
      (counts, permission) => {
        const depth = permissionDepth(permission, permissionById);
        if (depth === 1) counts.l1 += 1;
        if (depth === 2) counts.l2 += 1;
        if (depth >= 3) counts.l3 += 1;
        return counts;
      },
      { l1: 0, l2: 0, l3: 0 },
    );
  }, [permissionById, permissions]);
  const visiblePermissionIds = useMemo(() => permissionDomainGroups.flatMap((group) => collectPermissionIds(group.nodes)), [permissionDomainGroups]);

  useEffect(() => {
    setExpandedPermissionIds(new Set(visiblePermissionIds));
  }, [visiblePermissionIds]);

  function updateDomainFilters(domain: PermissionDomainKey, patch: Partial<DomainFilterState>) {
    setFiltersByDomain((current) => ({
      ...current,
      [domain]: {
        ...current[domain],
        ...patch,
      },
    }));
  }

  function resetDomainFilters(domain: PermissionDomainKey) {
    setFiltersByDomain((current) => ({
      ...current,
      [domain]: { ...DEFAULT_DOMAIN_FILTERS },
    }));
  }

  function updateDomainViewMode(domain: PermissionDomainKey, viewMode: ViewModeSwitchValue) {
    setViewModeByDomain((current) => ({
      ...current,
      [domain]: viewMode,
    }));
  }

  function togglePermissionNode(permissionId: string) {
    setExpandedPermissionIds((current) => {
      const next = new Set(current);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  }

  function expandPermissions(permissionIds: string[]) {
    setExpandedPermissionIds((current) => {
      const next = new Set(current);
      permissionIds.forEach((permissionId) => next.add(permissionId));
      return next;
    });
  }

  function collapsePermissions(permissionIds: string[]) {
    setExpandedPermissionIds((current) => {
      const next = new Set(current);
      permissionIds.forEach((permissionId) => next.delete(permissionId));
      return next;
    });
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-admin-permissions-page">
      <PageHeader
        icon="shield-check"
        title="权限策略"
        description="统一维护平台菜单、按钮和接口权限，用于角色授权、访问控制和平台自治治理。"
      />

      <section className="vx-tenant-summary vx-admin-permissions-summary" aria-label="平台权限统计">
        <article className="vx-tenant-summary__item vx-tenant-tone--blue">
          <Icon name="shield-check" size="lg" fallback="placeholder" />
          <div>
            <span>权限总数</span>
            <p>
              <strong>{formatNumber(permissions.length)}</strong>
              <em>L1 {formatNumber(permissionLevelCounts.l1)}</em>
              <em>L2 {formatNumber(permissionLevelCounts.l2)}</em>
              <em>L3 {formatNumber(permissionLevelCounts.l3)}</em>
            </p>
          </div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--green">
          <Icon name="check" size="lg" fallback="placeholder" />
          <div><span>启用权限</span><p><strong>{formatNumber(activeCount)}</strong><em>停用 {formatNumber(disabledCount)}</em></p></div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--amber">
          <Icon name="key" size="lg" fallback="placeholder" />
          <div><span>绑定权限</span><p><strong>{formatNumber(assignedCount)}</strong><em>未绑定 {formatNumber(unassignedCount)}</em></p></div>
        </article>
      </section>

      <div className="vx-tenant-list-shell">
        {permissions.length ? (
          <section className="vx-admin-permission-structure" aria-label="权限结构">
            <div className="vx-admin-permission-domain-stack">
              {permissionDomainGroups.map((group) => (
                <PermissionDomainSection
                  key={group.key}
                  group={group}
                  permissionById={permissionById}
                  expandedIds={expandedPermissionIds}
                  onToggle={togglePermissionNode}
                  onExpand={expandPermissions}
                  onCollapse={collapsePermissions}
                  filters={filtersByDomain[group.key]}
                  onFilterChange={(patch) => updateDomainFilters(group.key, patch)}
                  onResetFilters={() => resetDomainFilters(group.key)}
                  viewMode={viewModeByDomain[group.key]}
                  onViewModeChange={(viewMode) => updateDomainViewMode(group.key, viewMode)}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="vx-tenant-empty">
            <EmptyState
              title={loading ? '正在加载平台权限' : loadError ? '平台权限读取失败' : '没有匹配的平台权限'}
              description={loading ? '正在读取 platform.platform_permission。' : loadError ?? '当前没有可展示的平台权限。'}
            />
          </section>
        )}
      </div>
    </div>
  );
}
