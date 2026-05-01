'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Icon } from '@vxture/design-system';
import { Badge, Button, Input } from '@/components/ui/primitives';
import { fetchPlatformPermissions } from '@/api/admin-bff';
import type { PlatformAdminPermissionRecord, PlatformPermissionType } from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { formatNumber, joinClasses } from '@/modules/tenants/tenant-utils';

type PermissionFilter = 'all' | PlatformPermissionType;
type StatusFilter = 'all' | 'active' | 'disabled';
type SourceFilter = 'all' | 'system' | 'custom';

const EMPTY_MARK = '-';

const permissionTypeMeta = {
  MENU: { label: '菜单', icon: 'table', className: 'vx-admin-permission-type--menu' },
  BUTTON: { label: '按钮', icon: 'check', className: 'vx-admin-permission-type--button' },
  API: { label: '接口', icon: 'api', className: 'vx-admin-permission-type--api' },
} as const;

interface PermissionTreeNode {
  permission: PlatformAdminPermissionRecord;
  children: PermissionTreeNode[];
  depth: number;
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

function buildPermissionTree(permissions: PlatformAdminPermissionRecord[]): PermissionTreeNode[] {
  const byId = new Map<string, PermissionTreeNode>();
  for (const permission of permissions) {
    byId.set(permission.id, { permission, children: [], depth: 0 });
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

function collectPermissionIds(nodes: PermissionTreeNode[]) {
  const ids: string[] = [];
  const walk = (node: PermissionTreeNode) => {
    ids.push(node.permission.id);
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return ids;
}

function countTreeNodes(nodes: PermissionTreeNode[]) {
  return collectPermissionIds(nodes).length;
}

function isWorkspacePermission(permission: PlatformAdminPermissionRecord) {
  return permission.permCode.startsWith('admin.workspace.');
}

function isSectionPermission(permission: PlatformAdminPermissionRecord) {
  return permission.permCode.startsWith('admin.section.');
}

function PermissionTreeNodeView({
  node,
  expandedIds,
  onToggle,
  permissionById,
}: {
  node: PermissionTreeNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  permissionById: Map<string, PlatformAdminPermissionRecord>;
}) {
  const { permission, children, depth } = node;
  const meta = permissionTypeMeta[permission.permType];
  const expanded = expandedIds.has(permission.id);
  const parentPermission = permission.parentId ? permissionById.get(permission.parentId) : null;
  const titleClassName = isSectionPermission(permission) || depth === 0 ? 'vx-admin-permission-tree-node__title--level-2' : 'vx-admin-permission-tree-node__title--level-3';

  return (
    <article className={joinClasses('vx-admin-permission-tree-node', meta.className, isSectionPermission(permission) ? 'vx-admin-permission-tree-node--section' : '', permission.status ? '' : 'vx-admin-permission-tree-node--disabled')} style={{ '--permission-depth': depth } as CSSProperties}>
      <div className="vx-admin-permission-tree-node__title-row">
        <button type="button" className="vx-admin-permission-tree-node__toggle" onClick={() => onToggle(permission.id)} disabled={!children.length} aria-label={expanded ? '收起权限子级' : '展开权限子级'}>
          <Icon name={children.length ? (expanded ? 'chevron-down' : 'chevron-right') : 'chevron-right'} size="xs" fallback="chevron-right" />
        </button>
        <Icon name={meta.icon} size="sm" fallback="placeholder" />
        <div className={joinClasses('vx-admin-permission-tree-node__title', titleClassName)}>
          <strong>{permissionDisplayName(permission)}</strong>
          {children.length ? <Badge className="vx-tenant-pill vx-tenant-pill--system">{formatNumber(children.length)} 子级</Badge> : null}
          {isSectionPermission(permission) ? <Badge className="vx-tenant-pill vx-tenant-pill--system">业务分组</Badge> : null}
          <span>{parentPermission ? parentPermission.permCode : '根权限'}</span>
        </div>
      </div>
      <div className="vx-admin-permission-tree-node__detail-row">
        <span className="vx-admin-permission-tree-node__summary">
          <strong>{permission.description || EMPTY_MARK}</strong>
        </span>
        <span className="vx-admin-permission-tree-node__code">
          <code>{permission.permCode}</code>
        </span>
        <span className="vx-admin-permission-tree-node__type">
          <Badge className="vx-tenant-pill vx-tenant-pill--system">{meta.label}</Badge>
        </span>
        <span className="vx-admin-permission-tree-node__status">
          <Badge className={`vx-tenant-pill ${permission.status ? 'vx-admin-role-status-pill--enabled' : 'vx-admin-role-status-pill--disabled'}`}>{permission.status ? '启用' : '停用'}</Badge>
        </span>
        <span className="vx-admin-permission-tree-node__source">
          <Badge className="vx-tenant-pill vx-tenant-pill--system">系统预置</Badge>
        </span>
        <span className="vx-admin-permission-tree-node__roles">
          <strong>{formatNumber(permission.activeRoleCount)} / {formatNumber(permission.roleCount)}</strong>
        </span>
        <span className="vx-admin-permission-tree-node__dependency">
          <strong>{parentPermission ? parentPermission.permCode : EMPTY_MARK}</strong>
        </span>
        <span className="vx-admin-permission-tree-node__path">
          <strong>{permission.routePath || EMPTY_MARK}</strong>
          <small>{permission.component || EMPTY_MARK}</small>
        </span>
        <span className="vx-admin-permission-tree-node__actions">
          <button type="button" disabled>编辑</button>
        </span>
      </div>
      {children.length && expanded ? (
        <div className="vx-admin-permission-tree-node__children">
          {children.map((child) => (
            <PermissionTreeNodeView key={child.permission.id} node={child} expandedIds={expandedIds} onToggle={onToggle} permissionById={permissionById} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function PermissionTreeList({
  nodes,
  permissionById,
  expandedIds,
  onToggle,
}: {
  nodes: PermissionTreeNode[];
  permissionById: Map<string, PlatformAdminPermissionRecord>;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const count = countTreeNodes(nodes);
  const workspaceNodes = nodes.filter((node) => isWorkspacePermission(node.permission));
  const looseNodes = nodes.filter((node) => !isWorkspacePermission(node.permission));

  return (
    <section className="vx-admin-permission-structure">
      <header>
        <div>
          <h2>权限结构</h2>
          <p>用缩进表示父子层级，首页只展示权限本身，不处理用户、角色和分配矩阵。</p>
        </div>
        <Badge className="vx-tenant-pill vx-tenant-pill--system">{formatNumber(count)} 项</Badge>
      </header>
      <div className="vx-admin-permission-tree" role="treegrid" aria-label="权限结构">
        <div className="vx-admin-permission-tree__header">
          <span>权限名称</span>
          <span>Code</span>
          <span>类型</span>
          <span>状态</span>
          <span>来源</span>
          <span>授权角色</span>
          <span>上级权限</span>
          <span>路径 / 组件</span>
          <span>操作</span>
        </div>
        {workspaceNodes.map((node) => {
          const meta = permissionTypeMeta[node.permission.permType];
          return (
            <section key={node.permission.id} className="vx-admin-permission-tree__workspace">
              <header>
                <span>
                  <Icon name={meta.icon} size="sm" fallback="placeholder" />
                </span>
                <div>
                  <strong>{node.permission.permName}</strong>
                  <p>{node.permission.description || node.permission.permCode}</p>
                </div>
                <Badge className="vx-tenant-pill vx-tenant-pill--system">{formatNumber(countTreeNodes(node.children))} 项</Badge>
              </header>
              {node.children.map((child) => (
                <PermissionTreeNodeView key={child.permission.id} node={child} expandedIds={expandedIds} onToggle={onToggle} permissionById={permissionById} />
              ))}
            </section>
          );
        })}
        {looseNodes.map((node) => (
          <PermissionTreeNodeView key={node.permission.id} node={node} expandedIds={expandedIds} onToggle={onToggle} permissionById={permissionById} />
        ))}
      </div>
    </section>
  );
}

export function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<PlatformAdminPermissionRecord[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PermissionFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [loading, setLoading] = useState(true);
  const [expandedPermissionIds, setExpandedPermissionIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPlatformPermissions()
      .then((records) => {
        if (active) setPermissions(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredPermissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return permissions.filter((permission) => {
      if (typeFilter !== 'all' && permission.permType !== typeFilter) return false;
      if (statusFilter === 'active' && !permission.status) return false;
      if (statusFilter === 'disabled' && permission.status) return false;
      if (sourceFilter !== 'all' && permissionSource() !== sourceFilter) return false;
      if (normalizedQuery && !permissionSearchText(permission).includes(normalizedQuery)) return false;
      return true;
    });
  }, [permissions, query, sourceFilter, statusFilter, typeFilter]);

  const rootTree = useMemo(() => buildPermissionTree(filteredPermissions), [filteredPermissions]);
  const permissionById = useMemo(() => new Map(permissions.map((permission) => [permission.id, permission])), [permissions]);

  const activeCount = permissions.filter((permission) => permission.status).length;
  const assignedCount = permissions.filter((permission) => permission.roleCount > 0).length;
  const childCount = permissions.filter((permission) => permission.parentId).length;
  const visiblePermissionIds = useMemo(() => collectPermissionIds(rootTree), [rootTree]);

  useEffect(() => {
    setExpandedPermissionIds(new Set(visiblePermissionIds));
  }, [visiblePermissionIds]);

  function handleReset() {
    setQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setSourceFilter('all');
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

  function expandAll() {
    setExpandedPermissionIds(new Set(visiblePermissionIds));
  }

  function collapseAll() {
    setExpandedPermissionIds(new Set());
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-admin-permissions-page">
      <PageHeader
        icon="shield-check"
        title="权限管理"
        description="管理平台内所有菜单、按钮和接口权限。系统预置权限用于核心功能，不建议随意修改。"
      />

      <section className="vx-tenant-summary" aria-label="平台权限统计">
        <article className="vx-tenant-summary__item vx-tenant-tone--blue">
          <Icon name="shield-check" size="lg" fallback="placeholder" />
          <div><span>权限总数</span><p><strong>{formatNumber(permissions.length)}</strong><em>platform_permission</em></p></div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--green">
          <Icon name="check" size="lg" fallback="placeholder" />
          <div><span>启用权限</span><p><strong>{formatNumber(activeCount)}</strong><em>可授权</em></p></div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--amber">
          <Icon name="workflow" size="lg" fallback="placeholder" />
          <div><span>继承关系</span><p><strong>{formatNumber(childCount)}</strong><em>子权限</em></p></div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--rose">
          <Icon name="x" size="lg" fallback="placeholder" />
          <div><span>未绑定权限</span><p><strong>{formatNumber(permissions.length - assignedCount)}</strong><em>待治理</em></p></div>
        </article>
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="平台权限筛选">
          <span className="vx-tenant-view-count">{formatNumber(filteredPermissions.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索权限 code、名称、路径、组件" className="vx-tenant-search" aria-label="搜索平台权限" />
          <Button variant="outline" onClick={handleReset}>重置</Button>
          <div className="vx-tenant-filters">
            <select className="vx-input vx-tenant-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as PermissionFilter)} aria-label="权限类型">
              <option value="all">全部类型</option>
              <option value="MENU">菜单权限</option>
              <option value="BUTTON">按钮权限</option>
              <option value="API">接口权限</option>
            </select>
            <select className="vx-input vx-tenant-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="权限状态">
              <option value="all">全部状态</option>
              <option value="active">启用</option>
              <option value="disabled">停用</option>
            </select>
            <select className="vx-input vx-tenant-select" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceFilter)} aria-label="权限来源">
              <option value="all">全部来源</option>
              <option value="system">系统预置</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <Button variant="outline" onClick={expandAll}>展开全部</Button>
          <Button variant="outline" onClick={collapseAll}>收起全部</Button>
          <ActionButton variant="outline" icon="plus" disabled>新增权限</ActionButton>
        </section>

        {filteredPermissions.length ? (
          <PermissionTreeList nodes={rootTree} permissionById={permissionById} expandedIds={expandedPermissionIds} onToggle={togglePermissionNode} />
        ) : (
          <section className="vx-tenant-empty">
            <EmptyState
              title={loading ? '正在加载平台权限' : '没有匹配的平台权限'}
              description={loading ? '正在读取 platform.platform_permission。' : '清空筛选条件后可查看全部平台权限。'}
              action={<ActionButton variant="outline" icon="x" onClick={handleReset}>清空筛选</ActionButton>}
            />
          </section>
        )}
      </div>
    </div>
  );
}
