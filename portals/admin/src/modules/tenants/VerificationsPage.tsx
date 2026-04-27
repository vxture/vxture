'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Input } from '@/components/ui/primitives';
import { fetchTenantOperations } from '@/api/admin-bff';
import type { TenantOperationRecord, TenantVerificationStatus } from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import {
  formatDate,
  formatMoney,
  formatNumber,
  joinClasses,
  normalizeTenantRiskLevel,
  riskLabel,
  tenantRiskOptions,
  verifiedLabel,
} from './tenant-utils';

type ViewMode = 'list' | 'cards';
type VerificationFilter = 'all' | TenantVerificationStatus;
type RiskFilter = 'all' | TenantOperationRecord['riskLevel'];
type RegionFilter = 'all' | string;
type VerificationStatusTone = 'normal' | 'progress' | 'attention' | 'closed';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

const verificationSortWeight: Record<TenantVerificationStatus, number> = {
  pending: 0,
  rejected: 1,
  unverified: 2,
  verified: 3,
};

function daysSince(value: string | null | undefined) {
  if (!value) return 0;
  const started = new Date(value).getTime();
  if (Number.isNaN(started)) return 0;
  return Math.max(0, Math.floor((Date.now() - started) / 86_400_000));
}

function verificationStatusIndicator(status: TenantVerificationStatus): { tone: VerificationStatusTone; label: string; icon: IconName } {
  if (status === 'verified') return { tone: 'normal', label: '已认证', icon: 'check' };
  if (status === 'pending') return { tone: 'progress', label: '待审核', icon: 'clock' };
  if (status === 'rejected') return { tone: 'attention', label: '已驳回', icon: 'warning' };
  return { tone: 'closed', label: '未认证', icon: 'info' };
}

function verificationSearchText(tenant: TenantOperationRecord) {
  return [
    tenant.id,
    tenant.tenantCode,
    tenant.tenantName,
    tenant.displayName,
    tenant.verifiedStatus,
    tenant.riskLevel,
    tenant.region,
    tenant.industry,
    tenant.scale,
    tenant.contactName,
    tenant.contactPhone,
    tenant.ownerName,
    tenant.ownerEmail,
    tenant.notes,
  ].join(' ').toLowerCase();
}

function verificationTimeText(tenant: TenantOperationRecord) {
  if (tenant.verifiedStatus === 'verified') return tenant.verifiedAt ? `通过 ${formatDate(tenant.verifiedAt)}` : '已通过';
  if (tenant.verifiedStatus === 'pending') return `等待 ${formatNumber(daysSince(tenant.verificationSubmittedAt))} 天`;
  if (tenant.verifiedStatus === 'rejected') return '需补充材料';
  return '未提交材料';
}

function VerificationSummaryItem({
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

function VerificationPageSizePicker({ value, onChange }: { value: PageSize; onChange: (value: PageSize) => void }) {
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

function VerificationActionsMenu({
  tenant,
  open,
  onToggle,
  onClose,
}: {
  tenant: TenantOperationRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const isPending = tenant.verifiedStatus === 'pending';

  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()} onMouseLeave={onClose}>
      <button className="vx-tenant-actions__trigger" type="button" aria-label={`${tenant.displayName} 认证操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push(`/tenants/${encodeURIComponent(tenant.id)}`);
            }}
          >
            <Icon name={isPending ? 'medal' : 'arrow-right'} size="xs" fallback="placeholder" />
            {isPending ? '进入审核' : '查看详情'}
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="check" size="xs" fallback="placeholder" />
            通过认证
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="x" size="xs" fallback="placeholder" />
            驳回材料
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="info" size="xs" fallback="placeholder" />
            审核记录
          </button>
        </div>
      ) : null}
    </div>
  );
}

function VerificationListRows({
  tenants,
  startIndex,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
}: {
  tenants: TenantOperationRecord[];
  startIndex: number;
  openMenuId: string | null;
  onOpenMenu: (tenantId: string) => void;
  onCloseMenu: () => void;
}) {
  const router = useRouter();

  return (
    <div className="vx-tenant-directory-list vx-verification-directory-list" role="region" aria-label="组织认证清单">
      <div className="vx-tenant-directory-list__header">
        <span>序号</span>
        <span>组织</span>
        <span>认证状态</span>
        <span>主体信息</span>
        <span>运营联系</span>
        <span>时间</span>
        <span>操作</span>
      </div>
      {tenants.map((tenant, index) => {
        const riskLevel = normalizeTenantRiskLevel(tenant.riskLevel);
        const indicator = verificationStatusIndicator(tenant.verifiedStatus);

        return (
          <div
            key={tenant.id}
            className={joinClasses('vx-tenant-directory-row', `vx-tenant-directory-row--${riskLevel}`)}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/tenants/${encodeURIComponent(tenant.id)}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') router.push(`/tenants/${encodeURIComponent(tenant.id)}`);
            }}
          >
            <span className="vx-tenant-directory-row__index">{formatNumber(startIndex + index + 1)}</span>
            <span className="vx-tenant-directory-row__tenant">
              <Icon name="buildings" size="sm" fallback="placeholder" />
              <span>
                <span className="vx-tenant-directory-row__title-line">
                  <strong>{tenant.displayName}</strong>
                </span>
                <small>{tenant.tenantCode} · {tenant.region}</small>
              </span>
            </span>
            <span className="vx-verification-row__status">
              <span className="vx-tenant-directory-row__status-line">
                <span className={`vx-tenant-status-dot vx-tenant-status-dot--${indicator.tone}`} role="img" aria-label={indicator.label} title={indicator.label}>
                  <Icon name={indicator.icon} size="xs" fallback="placeholder" />
                </span>
                <Badge className={`vx-tenant-pill vx-verification-pill--${tenant.verifiedStatus}`}>{verifiedLabel(tenant.verifiedStatus)}</Badge>
              </span>
              <small>{riskLabel(riskLevel)}</small>
            </span>
            <span className="vx-verification-row__subject">
              <span className="vx-tenant-directory-row__tag-line">
                <Badge className="vx-tenant-pill vx-tenant-pill--company">{tenant.industry}</Badge>
                <Badge className="vx-tenant-pill vx-verification-muted-pill">{tenant.scale}</Badge>
              </span>
              <small>{tenant.tenantName}</small>
            </span>
            <span className="vx-verification-row__contact">
              <strong>{tenant.contactName}</strong>
              <small>{tenant.contactPhone || tenant.ownerEmail}</small>
            </span>
            <span className="vx-verification-row__time">
              <strong>{tenant.verificationSubmittedAt ? formatDate(tenant.verificationSubmittedAt) : '未提交'}</strong>
              <small>{verificationTimeText(tenant)}</small>
            </span>
            <VerificationActionsMenu
              tenant={tenant}
              open={openMenuId === tenant.id}
              onToggle={() => onOpenMenu(openMenuId === tenant.id ? '' : tenant.id)}
              onClose={onCloseMenu}
            />
          </div>
        );
      })}
    </div>
  );
}

function VerificationCards({
  tenants,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
}: {
  tenants: TenantOperationRecord[];
  openMenuId: string | null;
  onOpenMenu: (tenantId: string) => void;
  onCloseMenu: () => void;
}) {
  const router = useRouter();

  return (
    <div className="vx-tenant-directory-cards vx-verification-cards" aria-label="组织认证卡片">
      {tenants.map((tenant) => {
        const riskLevel = normalizeTenantRiskLevel(tenant.riskLevel);

        return (
          <article
            key={tenant.id}
            className={joinClasses('vx-tenant-directory-card', `vx-tenant-directory-card--${riskLevel}`)}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/tenants/${encodeURIComponent(tenant.id)}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') router.push(`/tenants/${encodeURIComponent(tenant.id)}`);
            }}
          >
            <header>
              <Icon name="buildings" size="lg" fallback="placeholder" />
              <div>
                <strong>{tenant.displayName}</strong>
                <span>{tenant.tenantCode} · {tenant.region}</span>
              </div>
              <VerificationActionsMenu
                tenant={tenant}
                open={openMenuId === tenant.id}
                onToggle={() => onOpenMenu(openMenuId === tenant.id ? '' : tenant.id)}
                onClose={onCloseMenu}
              />
            </header>
            <div className="vx-tenant-directory-card__badges">
              <Badge className={`vx-tenant-pill vx-verification-pill--${tenant.verifiedStatus}`}>{verifiedLabel(tenant.verifiedStatus)}</Badge>
              <Badge className={`vx-tenant-pill vx-tenant-pill--risk-${riskLevel}`}>{riskLabel(riskLevel)}</Badge>
            </div>
            <div className="vx-tenant-directory-card__metrics">
              <span>
                <b>{formatNumber(daysSince(tenant.verificationSubmittedAt))}</b>
                <small>等待天数</small>
              </span>
              <span>
                <b>{formatNumber(tenant.memberCount)}</b>
                <small>成员</small>
              </span>
              <span>
                <b>{formatMoney(tenant.monthlyRevenue)}</b>
                <small>本月收入</small>
              </span>
            </div>
            <footer>
              <span>{tenant.industry} · {tenant.scale}</span>
              <strong>{verificationTimeText(tenant)}</strong>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

function VerificationPagination({
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
        <VerificationPageSizePicker value={pageSize} onChange={onPageSizeChange} />
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

export function VerificationsPage() {
  const [tenants, setTenants] = useState<TenantOperationRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('all');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenantId = new URLSearchParams(window.location.search).get('tenantId');
    if (tenantId) setQuery(tenantId);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchTenantOperations()
      .then((records) => {
        if (active) setTenants(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const organizationTenants = useMemo(
    () =>
      tenants
        .filter((tenant) => tenant.tenantType === 'company')
        .sort((left, right) => {
          const statusOrder = verificationSortWeight[left.verifiedStatus] - verificationSortWeight[right.verifiedStatus];
          if (statusOrder !== 0) return statusOrder;
          return new Date(right.verificationSubmittedAt ?? right.createdAt).getTime() - new Date(left.verificationSubmittedAt ?? left.createdAt).getTime();
        }),
    [tenants],
  );

  const regionOptions = useMemo(
    () => Array.from(new Set(organizationTenants.map((tenant) => tenant.region.split('/')[0]?.trim()).filter(Boolean))).sort(),
    [organizationTenants],
  );

  const filteredTenants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return organizationTenants.filter((tenant) => {
      const primaryRegion = tenant.region.split('/')[0]?.trim() || tenant.region;
      if (verificationFilter !== 'all' && tenant.verifiedStatus !== verificationFilter) return false;
      if (riskFilter !== 'all' && tenant.riskLevel !== riskFilter) return false;
      if (regionFilter !== 'all' && primaryRegion !== regionFilter) return false;
      if (normalizedQuery && !verificationSearchText(tenant).includes(normalizedQuery)) return false;
      return true;
    });
  }, [organizationTenants, query, regionFilter, riskFilter, verificationFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredTenants.length / pageSize));
  const visibleTenants = filteredTenants.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pendingCount = organizationTenants.filter((tenant) => tenant.verifiedStatus === 'pending').length;
  const overdueCount = organizationTenants.filter((tenant) => tenant.verifiedStatus === 'pending' && daysSince(tenant.verificationSubmittedAt) >= 3).length;
  const verifiedCount = organizationTenants.filter((tenant) => tenant.verifiedStatus === 'verified').length;
  const rejectedCount = organizationTenants.filter((tenant) => tenant.verifiedStatus === 'rejected').length;
  const unverifiedCount = organizationTenants.filter((tenant) => tenant.verifiedStatus === 'unverified').length;
  const passRate = organizationTenants.length ? Math.round((verifiedCount / organizationTenants.length) * 100) : 0;

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [pageSize, query, regionFilter, riskFilter, verificationFilter, viewMode]);

  function handleReset() {
    setQuery('');
    setVerificationFilter('all');
    setRiskFilter('all');
    setRegionFilter('all');
  }

  function handleOpenMenu(tenantId: string) {
    setOpenMenuId(tenantId || null);
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-verification-page">
      <PageHeader
        icon="medal"
        title="组织认证"
        description="集中处理组织租户提交的企业资质认证，按待审、通过、驳回和未提交状态推进审核流转。"
      />

      <section className="vx-tenant-summary" aria-label="组织认证统计">
        <VerificationSummaryItem icon="buildings" label="组织总数" value={formatNumber(organizationTenants.length)} tags={[`待审 ${formatNumber(pendingCount)}`]} />
        <VerificationSummaryItem icon="clock" label="待审核" value={formatNumber(pendingCount)} tags={[`超 3 天 ${formatNumber(overdueCount)}`]} tone="amber" />
        <VerificationSummaryItem icon="check" label="已认证" value={formatNumber(verifiedCount)} tags={[`通过率 ${formatNumber(passRate)}%`]} tone="green" />
        <VerificationSummaryItem icon="warning" label="需补充" value={formatNumber(rejectedCount + unverifiedCount)} tags={[`驳回 ${formatNumber(rejectedCount)}`, `未提交 ${formatNumber(unverifiedCount)}`]} tone={rejectedCount ? 'rose' : 'green'} />
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="组织认证筛选">
          <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="组织认证展示方式" />
          <span className="vx-tenant-view-count">{formatNumber(filteredTenants.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索组织、编码、联系人、地区"
            className="vx-tenant-search vx-verification-search"
            aria-label="搜索组织认证"
          />
          <Button variant="outline" onClick={handleReset}>重置</Button>
          <div className="vx-tenant-filters">
            <select className="vx-input vx-tenant-select" value={verificationFilter} onChange={(event) => setVerificationFilter(event.target.value as VerificationFilter)} aria-label="认证状态">
              <option value="all">全部认证</option>
              <option value="pending">待审核</option>
              <option value="verified">已认证</option>
              <option value="rejected">已驳回</option>
              <option value="unverified">未认证</option>
            </select>
            <select className="vx-input vx-tenant-select" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as RiskFilter)} aria-label="风险等级">
              <option value="all">全部风险</option>
              {tenantRiskOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select className="vx-input vx-tenant-select" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} aria-label="所属区域">
              <option value="all">全部区域</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <ActionButton variant="outline" icon="medal" disabled>
            批量审核
          </ActionButton>
        </section>

        <section className="vx-tenant-directory" aria-label="组织认证清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {visibleTenants.length ? (
            viewMode === 'list' ? (
              <VerificationListRows
                tenants={visibleTenants}
                startIndex={(Math.min(currentPage, pageCount) - 1) * pageSize}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
              />
            ) : (
              <VerificationCards
                tenants={visibleTenants}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? '正在加载组织认证' : '没有匹配的组织认证'}
                description={loading ? '正在读取组织租户认证数据。' : '清空筛选条件后可查看全部组织认证记录。'}
                action={
                  <ActionButton variant="outline" icon="x" onClick={handleReset}>
                    清空筛选
                  </ActionButton>
                }
              />
            </section>
          )}

          <VerificationPagination
            currentPage={Math.min(currentPage, pageCount)}
            pageCount={pageCount}
            total={filteredTenants.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), pageCount))}
          />
        </section>
      </div>
    </div>
  );
}
