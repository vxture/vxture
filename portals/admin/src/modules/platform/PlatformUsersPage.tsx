'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@vxture/design-system';
import { Badge, Button, Input } from '@vxture/design-system';
import { fetchPlatformAdmins } from '@/api/admin-bff';
import type { PlatformAdminRecord } from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import { useConsoleTranslations } from '@/lib/console-intl';
import { formatDate, formatNumber, joinClasses } from '@/modules/tenants/tenant-utils';

type ViewMode = 'list' | 'cards';
type PlatformAdminStatusCode = PlatformAdminRecord['statusCode'];
type StatusFilter = 'all' | PlatformAdminStatusCode;
type UserTypeFilter = 'all' | 'system' | 'normal';
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
const EMPTY_MARK = '-';

function platformRoleDisplayName(admin: PlatformAdminRecord, t: ReturnType<typeof useConsoleTranslations>) {
  return t(admin.roleNameI18nKey, admin.roleNameEn);
}

function platformRoleStatusLabel(admin: PlatformAdminRecord) {
  if (admin.roleStatusCode === 'active') return '启用';
  if (admin.roleStatusCode === 'archived') return '归档';
  return '停用';
}

function platformRoleStatusPillClass(admin: PlatformAdminRecord) {
  if (admin.roleStatusCode === 'active') return 'vx-admin-role-status-pill--enabled';
  if (admin.roleStatusCode === 'archived') return 'vx-platform-user-status-pill--attention';
  return 'vx-admin-role-status-pill--disabled';
}

function platformAdminStatusCode(admin: PlatformAdminRecord): PlatformAdminStatusCode {
  const statusCode = admin.statusCode;
  if (statusCode === 'active' || statusCode === 'disabled' || statusCode === 'locked' || statusCode === 'pending' || statusCode === 'suspended') {
    return statusCode;
  }
  return admin.status ? 'active' : 'disabled';
}

function platformAdminSearchText(admin: PlatformAdminRecord) {
  return [
    admin.id,
    admin.username,
    admin.displayName,
    admin.email,
    admin.phone,
    admin.roleCode,
    admin.roleNameI18nKey,
    admin.roleNameEn,
    admin.lastLoginIp,
    admin.remark,
    platformAdminStatusCode(admin),
    platformAdminStatusLabel(admin),
    admin.isSystem ? 'system 系统用户' : 'normal 普通用户',
  ].filter(Boolean).join(' ').toLowerCase();
}

function platformAdminStatusLabel(admin: PlatformAdminRecord) {
  const labels: Record<PlatformAdminStatusCode, string> = {
    active: '启用',
    disabled: '停用',
    locked: '锁定',
    pending: '待激活',
    suspended: '暂停',
  };
  return labels[platformAdminStatusCode(admin)];
}

function platformAdminStatusTone(admin: PlatformAdminRecord) {
  const statusCode = platformAdminStatusCode(admin);
  if (statusCode === 'active') return 'normal';
  if (statusCode === 'pending') return 'progress';
  if (statusCode === 'locked' || statusCode === 'suspended') return 'attention';
  return 'closed';
}

function platformAdminStatusIcon(admin: PlatformAdminRecord) {
  const statusCode = platformAdminStatusCode(admin);
  if (statusCode === 'active') return 'check';
  if (statusCode === 'pending') return 'clock';
  return 'x';
}

function platformAdminStatusPillClass(admin: PlatformAdminRecord) {
  const statusCode = platformAdminStatusCode(admin);
  if (statusCode === 'active') return 'vx-admin-role-status-pill--enabled';
  if (statusCode === 'pending') return 'vx-platform-user-status-pill--pending';
  if (statusCode === 'locked' || statusCode === 'suspended') return 'vx-platform-user-status-pill--attention';
  return 'vx-admin-role-status-pill--disabled';
}

function PlatformUserActionsMenu({
  admin,
  open,
  onToggle,
  onClose,
}: {
  admin: PlatformAdminRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
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
      const menuHeight = menuRef.current?.offsetHeight ?? 136;
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
          <button type="button" role="menuitem" disabled>
            <Icon name="user" size="xs" fallback="placeholder" />
            查看用户
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="shield-check" size="xs" fallback="placeholder" />
            调整角色
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name={platformAdminStatusCode(admin) === 'active' ? 'x' : 'check'} size="xs" fallback="placeholder" />
            {platformAdminStatusCode(admin) === 'active' ? '停用用户' : '启用用户'}
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()}>
      <button ref={triggerRef} className="vx-tenant-actions__trigger" type="button" aria-label={`${admin.displayName} 操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </button>
      {menu}
    </div>
  );
}

function PlatformUsersList({
  admins,
  startIndex,
  selectedIds,
  openMenuId,
  onToggleSelected,
  onTogglePage,
  onOpenMenu,
  onCloseMenu,
  t,
}: {
  admins: PlatformAdminRecord[];
  startIndex: number;
  selectedIds: Set<string>;
  openMenuId: string | null;
  onToggleSelected: (id: string, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  t: ReturnType<typeof useConsoleTranslations>;
}) {
  const selectRef = useRef<HTMLInputElement | null>(null);
  const selectedCount = admins.filter((admin) => selectedIds.has(admin.id)).length;
  const pageSelected = admins.length > 0 && selectedCount === admins.length;
  const pagePartial = selectedCount > 0 && selectedCount < admins.length;

  useEffect(() => {
    if (selectRef.current) {
      selectRef.current.indeterminate = pagePartial;
    }
  }, [pagePartial]);

  return (
    <div className="vx-tenant-directory-list vx-tenant-operation-directory-list vx-platform-user-directory-list" role="region" aria-label="平台用户清单">
      <div className="vx-tenant-directory-list__header">
        <span>
          <input
            ref={selectRef}
            type="checkbox"
            className="vx-model-select-checkbox"
            checked={pageSelected}
            onChange={(event) => onTogglePage(event.target.checked)}
            aria-label="选择当前页平台用户"
          />
        </span>
        <span>序号</span>
        <span>用户</span>
        <span>状态</span>
        <span>角色</span>
        <span>最后登录</span>
        <span>联系方式</span>
        <span>操作</span>
      </div>
      {admins.map((admin, index) => {
        const selected = selectedIds.has(admin.id);
        return (
          <div
            key={admin.id}
            className={joinClasses('vx-tenant-directory-row', 'vx-tenant-operation-row', 'vx-platform-user-row', selected ? 'vx-tenant-operation-row--selected vx-platform-user-row--selected' : '')}
            onClick={(event) => {
              if (event.target instanceof HTMLElement && event.target.closest('button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]')) return;
              onToggleSelected(admin.id, !selected);
            }}
          >
            <span className="vx-tenant-operation-row__select vx-platform-user-row__select">
              <input
                type="checkbox"
                className="vx-model-select-checkbox"
                checked={selected}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => onToggleSelected(admin.id, event.target.checked)}
                aria-label={`选择 ${admin.displayName || admin.username}`}
              />
            </span>
            <span className="vx-tenant-directory-row__index">{formatNumber(startIndex + index + 1)}</span>
            <span className="vx-tenant-directory-row__tenant">
              <Icon name="user" size="sm" fallback="placeholder" />
              <span>
                <span className="vx-tenant-directory-row__title-line">
                  <button type="button" className="vx-model-name-button" onClick={(event) => event.stopPropagation()}>
                    {admin.displayName || admin.username}
                  </button>
                  {admin.isSystem ? <Badge className="vx-tenant-pill vx-tenant-pill--system">系统</Badge> : null}
                </span>
                <small>{admin.username ? `@${admin.username}` : EMPTY_MARK}</small>
              </span>
            </span>
            <span className="vx-tenant-directory-row__status">
              <span className="vx-tenant-directory-row__status-line">
                <span className={`vx-tenant-status-dot vx-tenant-status-dot--${platformAdminStatusTone(admin)}`} role="img" aria-label={platformAdminStatusLabel(admin)} title={platformAdminStatusLabel(admin)}>
                  <Icon name={platformAdminStatusIcon(admin)} size="xs" fallback="placeholder" />
                </span>
                <Badge className={`vx-tenant-pill ${platformAdminStatusPillClass(admin)}`}>{platformAdminStatusLabel(admin)}</Badge>
              </span>
            </span>
            <span className="vx-platform-user-row__role">
              <span className="vx-platform-user-row__role-line">
                <strong>{platformRoleDisplayName(admin, t)}</strong>
                <Badge className={`vx-tenant-pill ${platformRoleStatusPillClass(admin)}`}>{platformRoleStatusLabel(admin)}</Badge>
              </span>
            </span>
            <span className="vx-platform-user-row__login">
              <strong>{admin.lastLoginAt ? formatDate(admin.lastLoginAt) : EMPTY_MARK}</strong>
              <small>{admin.lastLoginIp || EMPTY_MARK}</small>
            </span>
            <span className="vx-platform-user-row__contact">
              <strong>{admin.email || EMPTY_MARK}</strong>
              <small>{admin.phone || EMPTY_MARK}</small>
            </span>
            <PlatformUserActionsMenu
              admin={admin}
              open={openMenuId === admin.id}
              onToggle={() => onOpenMenu(openMenuId === admin.id ? '' : admin.id)}
              onClose={onCloseMenu}
            />
          </div>
        );
      })}
    </div>
  );
}

function PlatformUsersCards({ admins, t }: { admins: PlatformAdminRecord[]; t: ReturnType<typeof useConsoleTranslations> }) {
  return (
    <div className="vx-tenant-directory-cards" aria-label="平台用户卡片">
      {admins.map((admin) => (
        <article key={admin.id} className="vx-tenant-directory-card">
          <header>
            <Icon name="user" size="lg" fallback="placeholder" />
            <div>
              <strong>{admin.displayName || admin.username}</strong>
              <span>{admin.username ? `@${admin.username}` : EMPTY_MARK}</span>
            </div>
            <Badge className={`vx-tenant-pill ${platformAdminStatusPillClass(admin)}`}>{platformAdminStatusLabel(admin)}</Badge>
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Badge className="vx-tenant-pill vx-account-muted-pill vx-tenant-pill--permission">{platformRoleDisplayName(admin, t)}</Badge>
            <Badge className={`vx-tenant-pill ${platformRoleStatusPillClass(admin)}`}>{platformRoleStatusLabel(admin)}</Badge>
            {admin.isSystem ? <Badge className="vx-tenant-pill vx-tenant-pill--system">系统</Badge> : null}
          </div>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{admin.lastLoginAt ? formatDate(admin.lastLoginAt) : EMPTY_MARK}</b>
              <small>最后登录</small>
            </span>
            <span>
              <b>{admin.lastLoginIp || EMPTY_MARK}</b>
              <small>登录 IP</small>
            </span>
            <span>
              <b>{admin.email || admin.phone || EMPTY_MARK}</b>
              <small>联系方式</small>
            </span>
          </div>
          <footer>
            <span>{admin.remark || EMPTY_MARK}</span>
            <strong>{admin.phone || EMPTY_MARK}</strong>
          </footer>
        </article>
      ))}
    </div>
  );
}

function PlatformUserPageSizePicker({ value, onChange }: { value: PageSize; onChange: (value: PageSize) => void }) {
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

function PlatformUserPagination({
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
        <PlatformUserPageSizePicker value={pageSize} onChange={onPageSizeChange} />
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

export function PlatformUsersPage() {
  const t = useConsoleTranslations();
  const [admins, setAdmins] = useState<PlatformAdminRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<UserTypeFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    fetchPlatformAdmins()
      .then((records) => {
        if (active) setAdmins(records);
      })
      .catch((error) => {
        if (active) setLoadError(error instanceof Error ? error.message : '平台用户数据库读取失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredAdmins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return admins.filter((admin) => {
      if (statusFilter !== 'all' && platformAdminStatusCode(admin) !== statusFilter) return false;
      if (typeFilter === 'system' && !admin.isSystem) return false;
      if (typeFilter === 'normal' && admin.isSystem) return false;
      if (normalizedQuery && !platformAdminSearchText(admin).includes(normalizedQuery)) return false;
      return true;
    });
  }, [admins, query, statusFilter, typeFilter]);

  const enabledCount = admins.filter((admin) => platformAdminStatusCode(admin) === 'active').length;
  const systemCount = admins.filter((admin) => admin.isSystem).length;
  const disabledCount = admins.filter((admin) => platformAdminStatusCode(admin) === 'disabled').length;
  const lockedCount = admins.filter((admin) => platformAdminStatusCode(admin) === 'locked').length;
  const pendingCount = admins.filter((admin) => platformAdminStatusCode(admin) === 'pending').length;
  const suspendedCount = admins.filter((admin) => platformAdminStatusCode(admin) === 'suspended').length;
  const otherUserCount = disabledCount + lockedCount + pendingCount + suspendedCount;
  const pageCount = Math.max(1, Math.ceil(filteredAdmins.length / pageSize));
  const clampedCurrentPage = Math.min(currentPage, pageCount);
  const visibleAdmins = filteredAdmins.slice((clampedCurrentPage - 1) * pageSize, clampedCurrentPage * pageSize);

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function togglePage(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      visibleAdmins.forEach((admin) => {
        if (checked) next.add(admin.id);
        else next.delete(admin.id);
      });
      return next;
    });
  }

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [pageSize, query, statusFilter, typeFilter, viewMode]);

  function resetFilters() {
    setQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-platform-users-page">
      <PageHeader
        icon="user"
        eyebrow="身份权限"
        title="平台用户"
        description="管理平台内部管理员、运营人员和运维人员；平台用户不归属于任何租户。"
      />

      <section className="vx-tenant-summary vx-platform-users-summary" aria-label="平台用户统计">
        <article className="vx-tenant-summary__item vx-tenant-summary__item--identity-icon vx-tenant-tone--blue">
          <Icon name="user" size="lg" fallback="placeholder" />
          <div><span>用户总数</span><p><strong>{formatNumber(admins.length)}</strong><em>系统用户 {formatNumber(systemCount)}人</em></p></div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--green">
          <Icon name="check" size="lg" fallback="placeholder" />
          <div><span>启用用户</span><p><strong>{formatNumber(enabledCount)}</strong><em>可登录</em></p></div>
        </article>
        <article className="vx-tenant-summary__item vx-tenant-tone--rose">
          <Icon name="x" size="lg" fallback="placeholder" />
          <div>
            <span>其他用户</span>
            <p>
              <strong>{formatNumber(otherUserCount)}</strong>
              {disabledCount ? <em>停用 {formatNumber(disabledCount)}</em> : null}
              {lockedCount ? <em>锁定 {formatNumber(lockedCount)}</em> : null}
              {pendingCount ? <em>待激活 {formatNumber(pendingCount)}</em> : null}
              {suspendedCount ? <em>暂停 {formatNumber(suspendedCount)}</em> : null}
            </p>
          </div>
        </article>
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="平台用户筛选">
          <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="平台用户展示方式" />
          <span className="vx-tenant-view-count">{formatNumber(filteredAdmins.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索用户名、显示名、邮箱、手机、角色" className="vx-tenant-search" aria-label="搜索平台用户" />
          <Button variant="outline" onClick={resetFilters}>重置</Button>
          <div className="vx-tenant-filters">
            <select className="vx-input vx-tenant-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="用户状态">
              <option value="all">全部状态</option>
              <option value="active">启用</option>
              <option value="disabled">停用</option>
              <option value="locked">锁定</option>
              <option value="pending">待激活</option>
              <option value="suspended">暂停</option>
            </select>
            <select className="vx-input vx-tenant-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as UserTypeFilter)} aria-label="用户类型">
              <option value="all">全部类型</option>
              <option value="system">系统用户</option>
              <option value="normal">普通用户</option>
            </select>
          </div>
          <ActionButton variant="outline" icon="plus" disabled>新建用户</ActionButton>
        </section>

        <section className="vx-tenant-directory" aria-label="平台用户清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {filteredAdmins.length ? (
            viewMode === 'list' ? (
              <PlatformUsersList
                admins={visibleAdmins}
                startIndex={(clampedCurrentPage - 1) * pageSize}
                selectedIds={selectedIds}
                openMenuId={openMenuId}
                onToggleSelected={toggleSelected}
                onTogglePage={togglePage}
                onOpenMenu={(id) => setOpenMenuId(id || null)}
                onCloseMenu={() => setOpenMenuId(null)}
                t={t}
              />
            ) : (
              <PlatformUsersCards admins={visibleAdmins} t={t} />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? '正在加载平台用户' : loadError ? '平台用户读取失败' : '没有匹配的平台用户'}
                description={loading ? '正在读取 platform.platform_admin。' : loadError ?? '清空筛选条件后可查看全部平台用户。'}
                action={<ActionButton variant="outline" icon="x" onClick={resetFilters}>清空筛选</ActionButton>}
              />
            </section>
          )}

          <PlatformUserPagination
            currentPage={clampedCurrentPage}
            pageCount={pageCount}
            total={filteredAdmins.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), pageCount))}
          />
        </section>
      </div>
    </div>
  );
}
