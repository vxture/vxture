'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Checkbox, Input, NativeSelect } from '@vxture/design-system';
import { fetchSubscriptionOperations, submitSubscriptionOperation } from '@/api/admin-bff';
import type {
  SubscriptionOperationAction,
  SubscriptionOperationQuotaRisk,
  SubscriptionOperationRecord,
  SubscriptionOperationStatus,
} from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import {
  canRunSubscriptionAction,
  SubscriptionOperationDialog,
  subscriptionActionDisabledReason,
  subscriptionActionIcon,
  subscriptionActionLabel,
  subscriptionToggleAction,
} from '@/modules/subscriptions/SubscriptionOperationDialog';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import { formatDate, formatMoney, formatNumber, joinClasses, typeLabel } from '@/modules/tenants/tenant-utils';

type ViewMode = 'list' | 'cards';
type StatusFilter = 'all' | SubscriptionOperationStatus;
type TierFilter = 'all' | 'free' | 'pro' | 'enterprise' | 'other';
type RiskFilter = 'all' | SubscriptionOperationQuotaRisk;
type RenewFilter = 'all' | 'auto' | 'manual';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

function subscriptionStatusLabel(status: SubscriptionOperationStatus) {
  if (status === 'trial') return '试用';
  if (status === 'active') return '已生效';
  if (status === 'expiring') return '即将到期';
  if (status === 'overdue') return '逾期';
  if (status === 'suspended') return '暂停';
  return '已取消';
}

function subscriptionStatusIcon(status: SubscriptionOperationStatus): IconName {
  if (status === 'active') return 'check';
  if (status === 'trial' || status === 'expiring') return 'clock';
  if (status === 'cancelled') return 'x';
  return 'warning';
}

function cycleLabel(cycle: SubscriptionOperationRecord['cycleType']) {
  if (cycle === 'yearly') return '年付';
  if (cycle === 'once') return '一次性';
  return '月付';
}

function quotaRiskLabel(risk: SubscriptionOperationQuotaRisk) {
  if (risk === 'danger') return '高风险';
  if (risk === 'warning') return '需关注';
  return '正常';
}

function tierFilterValue(record: SubscriptionOperationRecord): TierFilter {
  const tierName = record.tierName.toLowerCase();
  if (tierName === 'free' || record.servicePlanCode === 'starter') return 'free';
  if (tierName === 'pro' || record.servicePlanCode === 'growth') return 'pro';
  if (tierName === 'enterprise' || record.servicePlanCode === 'enterprise') return 'enterprise';
  return 'other';
}

function subscriptionSearchText(record: SubscriptionOperationRecord) {
  return [
    record.id,
    record.subscriptionCode,
    record.orderNo,
    record.tenantCode,
    record.tenantName,
    record.region,
    record.industry,
    record.solutionName,
    record.servicePlanCode,
    record.servicePlanName,
    record.tierName,
    record.operatorName,
    record.operationHint,
    record.status,
  ].filter(Boolean).join(' ').toLowerCase();
}

function SummaryItem({
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

function PageSizePicker({ value, onChange }: { value: PageSize; onChange: (value: PageSize) => void }) {
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

function SubscriptionActionsMenu({
  subscription,
  open,
  onToggle,
  onClose,
  onAction,
}: {
  subscription: SubscriptionOperationRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onAction: (subscription: SubscriptionOperationRecord, action: SubscriptionOperationAction) => void;
}) {
  const router = useRouter();
  const toggleAction = subscriptionToggleAction(subscription.status);

  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()} onMouseLeave={onClose}>
      <Button variant="ghost" size="icon" className="vx-tenant-actions__trigger" aria-label={`${subscription.tenantName} 订阅操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </Button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <Button
            variant="ghost"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push(`/subscriptions/${encodeURIComponent(subscription.id)}`);
            }}
          >
            <Icon name="arrow-right" size="xs" fallback="placeholder" />
            查看详情
          </Button>
          <Button
            variant="ghost"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push(`/tenants/${encodeURIComponent(subscription.tenantId)}`);
            }}
          >
            <Icon name="buildings" size="xs" fallback="placeholder" />
            查看租户
          </Button>
          <Button variant="ghost" role="menuitem" disabled>
            <Icon name="star" size="xs" fallback="placeholder" />
            调整套餐
          </Button>
          <Button
            variant="ghost"
            role="menuitem"
            disabled={!canRunSubscriptionAction('renew', subscription)}
            title={subscriptionActionDisabledReason('renew', subscription) ?? undefined}
            onClick={() => {
              onClose();
              onAction(subscription, 'renew');
            }}
          >
            <Icon name={subscriptionActionIcon('renew')} size="xs" fallback="placeholder" />
            {subscriptionActionLabel('renew')}
          </Button>
          <Button
            variant="ghost"
            role="menuitem"
            disabled={!canRunSubscriptionAction(toggleAction, subscription)}
            title={subscriptionActionDisabledReason(toggleAction, subscription) ?? undefined}
            onClick={() => {
              onClose();
              onAction(subscription, toggleAction);
            }}
          >
            <Icon name={subscriptionActionIcon(toggleAction)} size="xs" fallback="placeholder" />
            {subscriptionActionLabel(toggleAction)}
          </Button>
          <Button
            variant="ghost"
            role="menuitem"
            className="vx-subscription-menu-action--danger"
            disabled={!canRunSubscriptionAction('cancel', subscription)}
            title={subscriptionActionDisabledReason('cancel', subscription) ?? undefined}
            onClick={() => {
              onClose();
              onAction(subscription, 'cancel');
            }}
          >
            <Icon name={subscriptionActionIcon('cancel')} size="xs" fallback="placeholder" />
            {subscriptionActionLabel('cancel')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SubscriptionListRows({
  subscriptions,
  startIndex,
  openMenuId,
  selectedSubscriptionIds,
  isPageSelected,
  onOpenMenu,
  onCloseMenu,
  onAction,
  onToggleSubscription,
  onTogglePage,
}: {
  subscriptions: SubscriptionOperationRecord[];
  startIndex: number;
  openMenuId: string | null;
  selectedSubscriptionIds: Set<string>;
  isPageSelected: boolean;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  onAction: (subscription: SubscriptionOperationRecord, action: SubscriptionOperationAction) => void;
  onToggleSubscription: (id: string, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
}) {
  const router = useRouter();
  const selectedOnPage = subscriptions.filter((subscription) => selectedSubscriptionIds.has(subscription.id)).length;
  const isPagePartiallySelected = selectedOnPage > 0 && selectedOnPage < subscriptions.length;

  return (
    <div className="vx-tenant-directory-list vx-subscription-directory-list" role="region" aria-label="租户订阅运营清单">
      <div className="vx-tenant-directory-list__header">
        <span>
          <Checkbox
            className="vx-model-select-checkbox"
            checked={isPagePartiallySelected ? 'indeterminate' : isPageSelected}
            onCheckedChange={(checked) => onTogglePage(checked === true)}
            aria-label="选择当前页订阅"
          />
        </span>
        <span>序号</span>
        <span>租户</span>
        <span>业务方案</span>
        <span>套餐权益</span>
        <span>状态</span>
        <span>配额</span>
        <span>收入</span>
        <span>操作</span>
      </div>
      {subscriptions.map((subscription, index) => (
        <div
          key={subscription.id}
          className={joinClasses('vx-tenant-directory-row', 'vx-subscription-operation-row', `vx-subscription-row--${subscription.status}`, `vx-subscription-row--quota-${subscription.quota.risk}`, selectedSubscriptionIds.has(subscription.id) ? 'vx-subscription-operation-row--selected' : '')}
          onClick={(event) => {
            if (event.target instanceof HTMLElement && event.target.closest('button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]')) return;
            onToggleSubscription(subscription.id, !selectedSubscriptionIds.has(subscription.id));
          }}
        >
          <span className="vx-subscription-operation-row__select">
            <Checkbox
              className="vx-model-select-checkbox"
              checked={selectedSubscriptionIds.has(subscription.id)}
              onClick={(event) => event.stopPropagation()}
              onCheckedChange={(checked) => onToggleSubscription(subscription.id, checked === true)}
              aria-label={`选择 ${subscription.tenantName}`}
            />
          </span>
          <span className="vx-tenant-directory-row__index">{formatNumber(startIndex + index + 1)}</span>
          <span className="vx-subscription-row__tenant">
            <Icon name={subscription.tenantType === 'company' ? 'buildings' : 'user'} size="sm" fallback="placeholder" />
            <span>
              <span className="vx-tenant-directory-row__title-line">
                <Button variant="link" className="vx-model-name-button" onClick={() => router.push(`/subscriptions/${encodeURIComponent(subscription.id)}`)}>
                  {subscription.tenantName}
                </Button>
              </span>
              <small>{subscription.tenantCode} · {subscription.region}</small>
            </span>
          </span>
          <span className="vx-subscription-row__solution">
            <strong>{subscription.solutionName}</strong>
            <small>{subscription.industry}</small>
          </span>
          <span className="vx-subscription-row__plan">
            <span className="vx-tenant-directory-row__tag-line">
              <Badge className={`vx-tenant-pill vx-subscription-pill--tier-${tierFilterValue(subscription)}`}>{subscription.tierName}</Badge>
              <Badge className="vx-tenant-pill vx-subscription-pill--cycle">{cycleLabel(subscription.cycleType)}</Badge>
            </span>
            <small>{subscription.orderNo ?? subscription.subscriptionCode}</small>
          </span>
          <span className="vx-subscription-row__status">
            <span className="vx-subscription-status-line">
              <span className={`vx-subscription-status-dot vx-subscription-status-dot--${subscription.status}`} role="img" aria-label={subscriptionStatusLabel(subscription.status)}>
                <Icon name={subscriptionStatusIcon(subscription.status)} size="xs" fallback="placeholder" />
              </span>
              <Badge className={`vx-tenant-pill vx-subscription-pill--${subscription.status}`}>{subscriptionStatusLabel(subscription.status)}</Badge>
            </span>
            <small>{formatDate(subscription.startAt)} - {formatDate(subscription.endAt)}</small>
          </span>
          <span className="vx-subscription-row__quota">
            <strong>{formatNumber(subscription.quota.usageRate)}%</strong>
            <small>{quotaRiskLabel(subscription.quota.risk)} · {formatNumber(subscription.quota.maxUsers)} 席位</small>
          </span>
          <span className="vx-subscription-row__revenue">
            <strong>{formatMoney(subscription.monthlyRevenue)}</strong>
            <small>{subscription.autoRenew ? '自动续期' : subscription.operationHint}</small>
          </span>
          <SubscriptionActionsMenu
            subscription={subscription}
            open={openMenuId === subscription.id}
            onToggle={() => onOpenMenu(openMenuId === subscription.id ? '' : subscription.id)}
            onClose={onCloseMenu}
            onAction={onAction}
          />
        </div>
      ))}
    </div>
  );
}

function SubscriptionCards({
  subscriptions,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
  onAction,
}: {
  subscriptions: SubscriptionOperationRecord[];
  openMenuId: string | null;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  onAction: (subscription: SubscriptionOperationRecord, action: SubscriptionOperationAction) => void;
}) {
  const router = useRouter();

  return (
    <div className="vx-tenant-directory-cards vx-subscription-cards" aria-label="租户订阅运营卡片">
      {subscriptions.map((subscription) => (
        <article
          key={subscription.id}
          className={joinClasses('vx-tenant-directory-card', `vx-subscription-card--${subscription.status}`)}
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/subscriptions/${encodeURIComponent(subscription.id)}`)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') router.push(`/subscriptions/${encodeURIComponent(subscription.id)}`);
          }}
        >
          <header>
            <Icon name={subscription.tenantType === 'company' ? 'buildings' : 'user'} size="lg" fallback="placeholder" />
            <div>
              <strong>{subscription.tenantName}</strong>
              <span>{subscription.tenantCode} · {typeLabel(subscription.tenantType)}</span>
            </div>
            <SubscriptionActionsMenu
              subscription={subscription}
              open={openMenuId === subscription.id}
              onToggle={() => onOpenMenu(openMenuId === subscription.id ? '' : subscription.id)}
              onClose={onCloseMenu}
              onAction={onAction}
            />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Badge className={`vx-tenant-pill vx-subscription-pill--${subscription.status}`}>{subscriptionStatusLabel(subscription.status)}</Badge>
            <Badge className={`vx-tenant-pill vx-subscription-pill--tier-${tierFilterValue(subscription)}`}>{subscription.tierName}</Badge>
            <Badge className={`vx-tenant-pill vx-subscription-pill--quota-${subscription.quota.risk}`}>{quotaRiskLabel(subscription.quota.risk)}</Badge>
          </div>
          <p className="vx-subscription-card__solution">{subscription.solutionName} · {subscription.servicePlanName}</p>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{formatNumber(subscription.quota.usageRate)}%</b>
              <small>配额消耗</small>
            </span>
            <span>
              <b>{formatNumber(subscription.quota.maxUsers)}</b>
              <small>席位</small>
            </span>
            <span>
              <b>{formatMoney(subscription.monthlyRevenue)}</b>
              <small>月收入</small>
            </span>
          </div>
          <footer>
            <span>{subscription.operationHint}</span>
            <strong>{formatDate(subscription.startAt)} - {formatDate(subscription.endAt)}</strong>
          </footer>
        </article>
      ))}
    </div>
  );
}

function Pagination({
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
      <span className="vx-tenant-pagination__total">共 {formatNumber(total)} 条订阅记录</span>
      <div className="vx-tenant-pagination__actions">
        <PageSizePicker value={pageSize} onChange={onPageSizeChange} />
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

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionOperationRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedSubscriptionIds, setSelectedSubscriptionIds] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [renewFilter, setRenewFilter] = useState<RenewFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<{ subscription: SubscriptionOperationRecord; action: SubscriptionOperationAction } | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchSubscriptionOperations()
      .then((records) => {
        if (active) setSubscriptions(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      if (statusFilter !== 'all' && subscription.status !== statusFilter) return false;
      if (tierFilter !== 'all' && tierFilterValue(subscription) !== tierFilter) return false;
      if (riskFilter !== 'all' && subscription.quota.risk !== riskFilter) return false;
      if (renewFilter === 'auto' && !subscription.autoRenew) return false;
      if (renewFilter === 'manual' && subscription.autoRenew) return false;
      if (normalizedQuery && !subscriptionSearchText(subscription).includes(normalizedQuery)) return false;
      return true;
    });
  }, [query, renewFilter, riskFilter, statusFilter, subscriptions, tierFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredSubscriptions.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const visibleSubscriptions = filteredSubscriptions.slice((activePage - 1) * pageSize, activePage * pageSize);
  const visibleSubscriptionIds = visibleSubscriptions.map((subscription) => subscription.id);
  const selectedVisibleSubscriptionCount = visibleSubscriptionIds.filter((id) => selectedSubscriptionIds.has(id)).length;
  const isSubscriptionPageSelected = visibleSubscriptionIds.length > 0 && selectedVisibleSubscriptionCount === visibleSubscriptionIds.length;
  const effectiveCount = subscriptions.filter((item) => item.status === 'active' || item.status === 'expiring').length;
  const followUpCount = subscriptions.filter((item) => item.status === 'trial' || item.status === 'expiring' || item.status === 'overdue' || item.quota.risk !== 'normal').length;
  const dangerQuotaCount = subscriptions.filter((item) => item.quota.risk === 'danger').length;
  const warningQuotaCount = subscriptions.filter((item) => item.quota.risk === 'warning').length;
  const monthlyRevenue = subscriptions.reduce((sum, item) => sum + item.monthlyRevenue, 0);

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [pageSize, query, renewFilter, riskFilter, statusFilter, tierFilter, viewMode]);

  function handleReset() {
    setQuery('');
    setStatusFilter('all');
    setTierFilter('all');
    setRiskFilter('all');
    setRenewFilter('all');
  }

  function handleOpenMenu(id: string) {
    setOpenMenuId(id || null);
  }

  function requestSubscriptionAction(subscription: SubscriptionOperationRecord, action: SubscriptionOperationAction) {
    setOpenMenuId(null);
    setOperationError(null);
    setOperationFeedback(null);
    setActionTarget({ subscription, action });
  }

  function toggleSubscriptionSelection(id: string, checked: boolean) {
    setSelectedSubscriptionIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleSubscriptionPageSelection(checked: boolean) {
    setSelectedSubscriptionIds((current) => {
      const next = new Set(current);
      for (const id of visibleSubscriptionIds) {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }

  async function handleSubmitSubscriptionAction(reason: string) {
    if (!actionTarget) return;

    setSubmittingAction(true);
    setOperationError(null);

    try {
      await submitSubscriptionOperation(actionTarget.subscription.id, {
        action: actionTarget.action,
        reason,
      });
      const records = await fetchSubscriptionOperations();
      setSubscriptions(records);
      setOperationFeedback(`${subscriptionActionLabel(actionTarget.action)}已完成。`);
      setActionTarget(null);
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : '订阅操作失败，请稍后重试。');
    } finally {
      setSubmittingAction(false);
    }
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-subscriptions-page">
      <PageHeader
        icon="star"
        eyebrow="订阅交易"
        title="租户订阅运营"
        description="运营侧管理租户服务权益实例，跟进试用转正、续期、暂停、配额风险和收入状态。"
      />

      <section className="vx-tenant-summary" aria-label="租户订阅运营统计">
        <SummaryItem icon="star" label="订阅实例" value={formatNumber(subscriptions.length)} tags={[`有效 ${formatNumber(effectiveCount)}`]} />
        <SummaryItem icon="warning" label="待跟进" value={formatNumber(followUpCount)} tags={[`逾期 ${formatNumber(subscriptions.filter((item) => item.status === 'overdue').length)}`]} tone={followUpCount ? 'amber' : 'green'} />
        <SummaryItem icon="chart-bar" label="月收入" value={formatMoney(monthlyRevenue)} tags={['运营口径']} tone="green" />
        <SummaryItem icon="shield-check" label="配额风险" value={formatNumber(dangerQuotaCount + warningQuotaCount)} tags={[`高风险 ${formatNumber(dangerQuotaCount)}`]} tone={dangerQuotaCount ? 'rose' : warningQuotaCount ? 'amber' : 'green'} />
      </section>

      {operationFeedback ? <div className="vx-subscription-operation-feedback">{operationFeedback}</div> : null}

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="租户订阅筛选">
          <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="租户订阅展示方式" />
          <span className="vx-tenant-view-count">{formatNumber(filteredSubscriptions.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索租户、方案、套餐、订单"
            className="vx-tenant-search vx-subscription-search"
            aria-label="搜索租户订阅"
          />
          <Button variant="outline" onClick={handleReset}>重置</Button>
          <div className="vx-tenant-filters">
            <NativeSelect className="vx-tenant-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="订阅状态">
              <option value="all">全部状态</option>
              <option value="trial">试用</option>
              <option value="active">已生效</option>
              <option value="expiring">即将到期</option>
              <option value="overdue">逾期</option>
              <option value="suspended">暂停</option>
              <option value="cancelled">已取消</option>
            </NativeSelect>
            <NativeSelect className="vx-tenant-select" value={tierFilter} onChange={(event) => setTierFilter(event.target.value as TierFilter)} aria-label="套餐版本">
              <option value="all">全部套餐</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
              <option value="other">其他</option>
            </NativeSelect>
            <NativeSelect className="vx-tenant-select" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value as RiskFilter)} aria-label="配额风险">
              <option value="all">全部配额</option>
              <option value="normal">正常</option>
              <option value="warning">需关注</option>
              <option value="danger">高风险</option>
            </NativeSelect>
            <NativeSelect className="vx-tenant-select" value={renewFilter} onChange={(event) => setRenewFilter(event.target.value as RenewFilter)} aria-label="续期方式">
              <option value="all">全部续期</option>
              <option value="auto">自动续期</option>
              <option value="manual">人工跟进</option>
            </NativeSelect>
          </div>
          <ActionButton variant="outline" icon="plus" disabled>
            开通订阅
          </ActionButton>
        </section>

        <section className="vx-tenant-directory" aria-label="租户订阅清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {visibleSubscriptions.length ? (
            viewMode === 'list' ? (
              <SubscriptionListRows
                subscriptions={visibleSubscriptions}
                startIndex={(activePage - 1) * pageSize}
                openMenuId={openMenuId}
                selectedSubscriptionIds={selectedSubscriptionIds}
                isPageSelected={isSubscriptionPageSelected}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onAction={requestSubscriptionAction}
                onToggleSubscription={toggleSubscriptionSelection}
                onTogglePage={toggleSubscriptionPageSelection}
              />
            ) : (
              <SubscriptionCards
                subscriptions={visibleSubscriptions}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onAction={requestSubscriptionAction}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? '正在加载租户订阅' : '没有匹配的订阅'}
                description={loading ? '正在读取租户订阅运营数据。' : '清空筛选条件后可查看全部订阅实例。'}
                action={
                  <ActionButton variant="outline" icon="x" onClick={handleReset}>
                    清空筛选
                  </ActionButton>
                }
              />
            </section>
          )}

          <Pagination
            currentPage={activePage}
            pageCount={pageCount}
            total={filteredSubscriptions.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), pageCount))}
          />
        </section>
      </div>

      {actionTarget ? (
        <SubscriptionOperationDialog
          action={actionTarget.action}
          subscriptionName={`${actionTarget.subscription.tenantName} / ${actionTarget.subscription.tierName}`}
          busy={submittingAction}
          error={operationError}
          onCancel={() => {
            if (!submittingAction) setActionTarget(null);
          }}
          onSubmit={handleSubmitSubscriptionAction}
        />
      ) : null}
    </div>
  );
}
