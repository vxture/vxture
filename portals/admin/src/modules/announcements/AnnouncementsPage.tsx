'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Icon, Input, NativeSelect, Pagination } from '@vxture/design-system';
import { fetchAnnouncements } from '@/api/admin-bff';
import type { AnnouncementRecord } from '@/entities/console';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { formatDate, joinClasses } from '@/modules/tenants/tenant-utils';

// ─── 类型 ─────────────────────────────────────────────────────────────────────

type AnnouncementTypeFilter = AnnouncementRecord['type'] | 'all';
type AnnouncementStatusFilter = AnnouncementRecord['status'] | 'all';
type ViewMode = 'list' | 'cards';

const PAGE_SIZE = 20;

// ─── 辅助函数 ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<AnnouncementRecord['type'], string> = {
  system: '系统',
  maintenance: '维护',
  marketing: '营销',
  security: '安全',
};

const STATUS_LABELS: Record<AnnouncementRecord['status'], string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
};

const SCOPE_LABELS: Record<AnnouncementRecord['targetScope'], string> = {
  all: '全部用户',
  trial: '试用用户',
  active: '付费用户',
  custom: '自定义',
};

function statusBadgeClass(status: AnnouncementRecord['status']) {
  if (status === 'published') return 'vx-admin-role-status-pill--enabled';
  if (status === 'draft') return 'vx-platform-user-status-pill--pending';
  return 'vx-admin-role-status-pill--disabled';
}

function typeBadgeClass(type: AnnouncementRecord['type']) {
  if (type === 'security') return 'vx-platform-user-status-pill--attention';
  if (type === 'maintenance') return 'vx-platform-user-status-pill--pending';
  if (type === 'system') return 'vx-admin-role-status-pill--enabled';
  return 'vx-admin-role-status-pill--disabled';
}

function announcementSearchText(item: AnnouncementRecord) {
  return [item.title, item.content, TYPE_LABELS[item.type], STATUS_LABELS[item.status]].join(' ').toLowerCase();
}

// ─── 子组件：汇总卡片 ──────────────────────────────────────────────────────────

function AnnouncementSummary({ items }: { items: AnnouncementRecord[] }) {
  const published = items.filter((i) => i.status === 'published').length;
  const drafts = items.filter((i) => i.status === 'draft').length;
  const now = new Date();
  const thisMonth = items.filter((i) => {
    if (!i.publishedAt) return false;
    const d = new Date(i.publishedAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  return (
    <div className="vx-models-summary">
      <div className="vx-models-summary__item">
        <Icon name="bell" size="md" fallback="placeholder" />
        <span>已发布公告</span>
        <strong>{published}</strong>
      </div>
      <div className="vx-models-summary__item">
        <Icon name="edit" size="md" fallback="placeholder" />
        <span>草稿中</span>
        <strong>{drafts}</strong>
      </div>
      <div className="vx-models-summary__item">
        <Icon name="calendar" size="md" fallback="placeholder" />
        <span>本月已发送</span>
        <strong>{thisMonth}</strong>
      </div>
    </div>
  );
}

// ─── 子组件：工具栏 ────────────────────────────────────────────────────────────

function AnnouncementToolbar({
  search,
  typeFilter,
  statusFilter,
  viewMode,
  total,
  onSearchChange,
  onTypeFilterChange,
  onStatusFilterChange,
  onViewModeChange,
}: {
  search: string;
  typeFilter: AnnouncementTypeFilter;
  statusFilter: AnnouncementStatusFilter;
  viewMode: ViewMode;
  total: number;
  onSearchChange: (v: string) => void;
  onTypeFilterChange: (v: AnnouncementTypeFilter) => void;
  onStatusFilterChange: (v: AnnouncementStatusFilter) => void;
  onViewModeChange: (v: ViewMode) => void;
}) {
  return (
    <div className="vx-models-toolbar">
      <Input
        className="vx-models-toolbar__search"
        type="search"
        placeholder="搜索标题、内容…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="vx-models-toolbar__filters">
        <NativeSelect
          className="vx-admin-filter-select"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as AnnouncementTypeFilter)}
        >
          <option value="all">全部类型</option>
          <option value="system">系统</option>
          <option value="maintenance">维护</option>
          <option value="marketing">营销</option>
          <option value="security">安全</option>
        </NativeSelect>
        <NativeSelect
          className="vx-admin-filter-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as AnnouncementStatusFilter)}
        >
          <option value="all">全部状态</option>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已归档</option>
        </NativeSelect>
        <div className="vx-admin-view-toggle">
          <Button
            variant="ghost"
            size="icon"
            className={joinClasses('vx-admin-view-toggle__btn', viewMode === 'list' ? 'vx-admin-view-toggle__btn--active' : '')}
            onClick={() => onViewModeChange('list')}
            title="列表视图"
          >
            <Icon name="rows" size="sm" fallback="placeholder" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={joinClasses('vx-admin-view-toggle__btn', viewMode === 'cards' ? 'vx-admin-view-toggle__btn--active' : '')}
            onClick={() => onViewModeChange('cards')}
            title="卡片视图"
          >
            <Icon name="squares-four" size="sm" fallback="placeholder" />
          </Button>
        </div>
      </div>
      <div className="vx-models-toolbar__spacer" />
      <span className="vx-models-toolbar__count">{total} 条</span>
      <Button variant="default" size="sm" className="vx-admin-action-btn" disabled title="新建公告（数据层待接入）">
        <Icon name="plus" size="sm" fallback="placeholder" />
        新建公告
      </Button>
    </div>
  );
}

// ─── 子组件：列表视图 ──────────────────────────────────────────────────────────

function AnnouncementList({ items, startIndex }: { items: AnnouncementRecord[]; startIndex: number }) {
  return (
    <div className="vx-tenant-directory-list vx-announcement-directory-list" role="region" aria-label="公告列表">
      <div className="vx-tenant-directory-list__header">
        <span>序号</span>
        <span>标题</span>
        <span>类型</span>
        <span>对象范围</span>
        <span>状态</span>
        <span>发布时间</span>
        <span>到期时间</span>
        <span>操作</span>
      </div>
      {items.map((item, index) => (
        <div key={item.id} className="vx-tenant-directory-row vx-announcement-row">
          <span className="vx-announcement-row__index">{startIndex + index + 1}</span>
          <span className="vx-announcement-row__title">{item.title}</span>
          <span className="vx-announcement-row__type">
            <Badge className={typeBadgeClass(item.type)}>{TYPE_LABELS[item.type]}</Badge>
          </span>
          <span className="vx-announcement-row__scope">{SCOPE_LABELS[item.targetScope]}</span>
          <span className="vx-announcement-row__status">
            <Badge className={statusBadgeClass(item.status)}>{STATUS_LABELS[item.status]}</Badge>
          </span>
          <span className="vx-announcement-row__published">
            {item.publishedAt ? formatDate(item.publishedAt) : '-'}
          </span>
          <span className="vx-announcement-row__expires">
            {item.expiresAt ? formatDate(item.expiresAt) : '-'}
          </span>
          <span className="vx-tenant-actions">
            <Button variant="ghost" size="icon" className="vx-tenant-actions__trigger" disabled title="操作（数据层待接入）">
              <Icon name="more-vertical" size="lg" fallback="placeholder" />
            </Button>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── 子组件：卡片视图 ──────────────────────────────────────────────────────────

function AnnouncementCards({ items }: { items: AnnouncementRecord[] }) {
  return (
    <div className="vx-announcement-cards">
      {items.map((item) => (
        <div key={item.id} className="vx-announcement-card">
          <div className="vx-announcement-card__header">
            <Badge className={typeBadgeClass(item.type)}>{TYPE_LABELS[item.type]}</Badge>
            <Badge className={statusBadgeClass(item.status)}>{STATUS_LABELS[item.status]}</Badge>
          </div>
          <h3 className="vx-announcement-card__title">{item.title}</h3>
          <p className="vx-announcement-card__content">{item.content}</p>
          <div className="vx-announcement-card__meta">
            <span>{SCOPE_LABELS[item.targetScope]}</span>
            {item.publishedAt && <span>{formatDate(item.publishedAt)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export function AnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AnnouncementTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAnnouncements()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = items;
    if (typeFilter !== 'all') result = result.filter((i) => i.type === typeFilter);
    if (statusFilter !== 'all') result = result.filter((i) => i.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((i) => announcementSearchText(i).includes(q));
    }
    return result;
  }, [items, search, typeFilter, statusFilter]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleTypeFilter = (v: AnnouncementTypeFilter) => { setTypeFilter(v); setPage(1); };
  const handleStatusFilter = (v: AnnouncementStatusFilter) => { setStatusFilter(v); setPage(1); };

  return (
    <div className={joinClasses('vx-page-stack', 'vx-announcement-page')}>
      <PageHeader
        icon="bell"
        title="消息公告"
        description="发布平台公告和定向通知，查询通知触达与历史记录。"
      />
      <AnnouncementSummary items={items} />
      <AnnouncementToolbar
        search={search}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        viewMode={viewMode}
        total={filtered.length}
        onSearchChange={handleSearch}
        onTypeFilterChange={handleTypeFilter}
        onStatusFilterChange={handleStatusFilter}
        onViewModeChange={setViewMode}
      />
      {loading ? (
        <EmptyState title="加载中…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="暂无公告"
          description={search || typeFilter !== 'all' || statusFilter !== 'all' ? '尝试调整筛选条件' : '点击「新建公告」发布第一条平台通知'}
        />
      ) : (
        <>
          {viewMode === 'list' ? (
            <AnnouncementList items={pageItems} startIndex={(page - 1) * PAGE_SIZE} />
          ) : (
            <AnnouncementCards items={pageItems} />
          )}
          {pageCount > 1 ? (
            <Pagination
              className="vx-tenant-pagination"
              page={page}
              pageCount={pageCount}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
