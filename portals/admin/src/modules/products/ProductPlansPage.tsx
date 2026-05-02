'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Input } from '@/components/ui/primitives';
import { fetchProductPlans } from '@/api/admin-bff';
import type { ProductPlanFeature, ProductPlanRecord } from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import { formatDate, formatNumber, joinClasses } from '@/modules/tenants/tenant-utils';

type ViewMode = 'list' | 'cards';
type StatusFilter = 'all' | 'active' | 'inactive';
type PriceFilter = 'all' | 'free' | 'paid';
type VisibilityFilter = 'all' | 'public' | 'private';
type FeatureFilter = 'all' | 'quota' | 'function';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

function planStatusLabel(plan: ProductPlanRecord) {
  return plan.isActive ? '启用' : '停用';
}

function planPriceLabel(plan: ProductPlanRecord) {
  return plan.isFree ? 'Free' : 'Paid';
}

function planVisibilityLabel(plan: ProductPlanRecord) {
  return plan.isPublic ? '公开' : '内部';
}

function planTypeLabel(planType: string) {
  if (planType === 'normal') return '标准套餐';
  if (planType === 'custom') return '定制套餐';
  return planType || '套餐';
}

function periodLabel(price: ProductPlanRecord['prices'][number]) {
  if (price.periodType === 'yearly') return price.periodValue > 1 ? `${price.periodValue} 年` : '年付';
  return price.periodValue > 1 ? `${price.periodValue} 月` : '月付';
}

function defaultPrice(plan: ProductPlanRecord) {
  return plan.prices.find((price) => price.isDefault && price.isActive) ?? plan.prices.find((price) => price.isActive) ?? plan.prices[0] ?? null;
}

function formatPlanMoney(plan: ProductPlanRecord) {
  const price = defaultPrice(plan);
  if (!price || plan.isFree || price.price <= 0) return '免费';

  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: price.currency || 'CNY',
    maximumFractionDigits: 0,
  }).format(price.price);
}

function formatTokenQuota(value: number) {
  if (value >= 100_000_000) return `${formatNumber(value / 100_000_000)} 亿`;
  if (value >= 10_000) return `${formatNumber(value / 10_000)} 万`;
  return formatNumber(value);
}

function featureValue(feature: ProductPlanFeature) {
  if (feature.isUnlimited) return '不限';
  if (feature.quotaValue === null) return '包含';
  if (feature.code.includes('tokens')) return `${formatTokenQuota(feature.quotaValue)} token`;
  if (feature.quotaValue <= 1) return '包含';
  return `${formatNumber(feature.quotaValue)} 项`;
}

function featureLabel(feature: ProductPlanFeature) {
  return `${feature.name} ${featureValue(feature)}`;
}

function planSearchText(plan: ProductPlanRecord) {
  return [
    plan.planCode,
    plan.planName,
    plan.description,
    plan.planType,
    planStatusLabel(plan),
    planPriceLabel(plan),
    planVisibilityLabel(plan),
    ...plan.features.map((feature) => `${feature.code} ${feature.name} ${featureValue(feature)}`),
    ...plan.agents.map((agent) => `${agent.agentCode} ${agent.agentName}`),
  ].join(' ').toLowerCase();
}

function PlanSummaryItem({
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

function ProductPlanPageSizePicker({ value, onChange }: { value: PageSize; onChange: (value: PageSize) => void }) {
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

function ProductPlanActionsMenu({
  plan,
  open,
  onToggle,
  onClose,
}: {
  plan: ProductPlanRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()} onMouseLeave={onClose}>
      <button className="vx-tenant-actions__trigger" type="button" aria-label={`${plan.planName} 操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <button type="button" role="menuitem" disabled>
            <Icon name="arrow-right" size="xs" fallback="placeholder" />
            查看详情
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="chart-bar" size="xs" fallback="placeholder" />
            配额配置
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="edit" size="xs" fallback="placeholder" />
            价格配置
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name={plan.isActive ? 'x' : 'check'} size="xs" fallback="placeholder" />
            {plan.isActive ? '下架套餐' : '上架套餐'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ProductPlanListRows({
  plans,
  startIndex,
  openMenuId,
  selectedPlanIds,
  isPageSelected,
  onOpenMenu,
  onCloseMenu,
  onTogglePlan,
  onTogglePage,
}: {
  plans: ProductPlanRecord[];
  startIndex: number;
  openMenuId: string | null;
  selectedPlanIds: Set<string>;
  isPageSelected: boolean;
  onOpenMenu: (planId: string) => void;
  onCloseMenu: () => void;
  onTogglePlan: (planId: string, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
}) {
  const pageSelectRef = useRef<HTMLInputElement | null>(null);
  const selectedOnPage = plans.filter((plan) => selectedPlanIds.has(plan.id)).length;
  const isPagePartiallySelected = selectedOnPage > 0 && selectedOnPage < plans.length;

  useEffect(() => {
    if (pageSelectRef.current) {
      pageSelectRef.current.indeterminate = isPagePartiallySelected;
    }
  }, [isPagePartiallySelected]);

  return (
    <div className="vx-tenant-directory-list vx-product-plan-directory-list" role="region" aria-label="套餐清单">
      <div className="vx-tenant-directory-list__header">
        <span>
          <input
            ref={pageSelectRef}
            type="checkbox"
            className="vx-model-select-checkbox"
            checked={isPageSelected}
            onChange={(event) => onTogglePage(event.target.checked)}
            aria-label="选择当前页套餐"
          />
        </span>
        <span>序号</span>
        <span>套餐</span>
        <span>状态</span>
        <span>价格</span>
        <span>配额权益</span>
        <span>智能体</span>
        <span>订阅</span>
        <span>操作</span>
      </div>
      {plans.map((plan, index) => {
        const price = defaultPrice(plan);
        const features = plan.features.slice(0, 3);
        const agents = plan.agents.slice(0, 3);

        return (
          <div
            key={plan.id}
            className={joinClasses('vx-tenant-directory-row', 'vx-product-plan-operation-row', plan.isActive ? 'vx-product-plan-row--active' : 'vx-product-plan-row--inactive', selectedPlanIds.has(plan.id) ? 'vx-product-plan-operation-row--selected' : '')}
            onClick={(event) => {
              if (event.target instanceof HTMLElement && event.target.closest('button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]')) return;
              onTogglePlan(plan.id, !selectedPlanIds.has(plan.id));
            }}
          >
            <span className="vx-product-plan-operation-row__select">
              <input
                type="checkbox"
                className="vx-model-select-checkbox"
                checked={selectedPlanIds.has(plan.id)}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => onTogglePlan(plan.id, event.target.checked)}
                aria-label={`选择 ${plan.planName}`}
              />
            </span>
            <span className="vx-tenant-directory-row__index">{formatNumber(startIndex + index + 1)}</span>
            <span className="vx-tenant-directory-row__tenant vx-product-plan-row__identity">
              <Icon name="cube" size="sm" fallback="placeholder" />
              <span>
                <span className="vx-tenant-directory-row__title-line">
                  <button type="button" className="vx-model-name-button" onClick={(event) => event.stopPropagation()}>
                    {plan.planName}
                  </button>
                </span>
                <small>{plan.planCode} · Level {formatNumber(plan.level)}</small>
              </span>
            </span>
            <span className="vx-product-plan-row__status">
              <span className="vx-tenant-directory-row__tag-line">
                <Badge className={`vx-tenant-pill vx-product-plan-pill--${plan.isActive ? 'active' : 'inactive'}`}>{planStatusLabel(plan)}</Badge>
                <Badge className={`vx-tenant-pill vx-product-plan-pill--${plan.isPublic ? 'public' : 'private'}`}>{planVisibilityLabel(plan)}</Badge>
              </span>
              <small>{planTypeLabel(plan.planType)}</small>
            </span>
            <span className="vx-product-plan-row__price">
              <strong>{formatPlanMoney(plan)}</strong>
              <small>{price ? `${periodLabel(price)} | ${planPriceLabel(plan)}` : planPriceLabel(plan)}</small>
            </span>
            <span className="vx-product-plan-row__features">
              <span className="vx-product-plan-feature-tags">
                {features.map((feature) => (
                  <Badge key={feature.code} className={`vx-tenant-pill vx-product-plan-pill--${feature.type}`}>
                    {featureLabel(feature)}
                  </Badge>
                ))}
              </span>
              <small>{formatNumber(plan.features.length)} 项权益</small>
            </span>
            <span className="vx-product-plan-row__agents">
              <span className="vx-product-plan-agent-tags">
                {agents.length ? (
                  agents.map((agent) => (
                    <Badge key={agent.id} className="vx-tenant-pill vx-product-plan-pill--agent">
                      {agent.agentName}
                    </Badge>
                  ))
                ) : (
                  <Badge className="vx-tenant-pill vx-product-plan-pill--empty">未授权</Badge>
                )}
              </span>
              <small>{formatNumber(plan.agents.length)} 个智能体</small>
            </span>
            <span className="vx-product-plan-row__subscriptions">
              <strong>{formatNumber(plan.subscriptionCount)}</strong>
              <small>{formatDate(plan.updatedAt)} 更新</small>
            </span>
            <ProductPlanActionsMenu
              plan={plan}
              open={openMenuId === plan.id}
              onToggle={() => onOpenMenu(openMenuId === plan.id ? '' : plan.id)}
              onClose={onCloseMenu}
            />
          </div>
        );
      })}
    </div>
  );
}

function ProductPlanCards({
  plans,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
}: {
  plans: ProductPlanRecord[];
  openMenuId: string | null;
  onOpenMenu: (planId: string) => void;
  onCloseMenu: () => void;
}) {
  return (
    <div className="vx-tenant-directory-cards vx-product-plan-cards" aria-label="套餐卡片">
      {plans.map((plan) => (
        <article key={plan.id} className={joinClasses('vx-tenant-directory-card', plan.isActive ? 'vx-product-plan-card--active' : 'vx-product-plan-card--inactive')}>
          <header>
            <Icon name="cube" size="lg" fallback="placeholder" />
            <div>
              <strong>{plan.planName}</strong>
              <span>{plan.planCode} · {planTypeLabel(plan.planType)}</span>
            </div>
            <ProductPlanActionsMenu
              plan={plan}
              open={openMenuId === plan.id}
              onToggle={() => onOpenMenu(openMenuId === plan.id ? '' : plan.id)}
              onClose={onCloseMenu}
            />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Badge className={`vx-tenant-pill vx-product-plan-pill--${plan.isActive ? 'active' : 'inactive'}`}>{planStatusLabel(plan)}</Badge>
            <Badge className={`vx-tenant-pill vx-product-plan-pill--${plan.isFree ? 'free' : 'paid'}`}>{planPriceLabel(plan)}</Badge>
            <Badge className={`vx-tenant-pill vx-product-plan-pill--${plan.isPublic ? 'public' : 'private'}`}>{planVisibilityLabel(plan)}</Badge>
          </div>
          <p className="vx-product-plan-card__description">{plan.description || '暂无套餐说明。'}</p>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{formatPlanMoney(plan)}</b>
              <small>默认价格</small>
            </span>
            <span>
              <b>{formatNumber(plan.features.length)}</b>
              <small>权益</small>
            </span>
            <span>
              <b>{formatNumber(plan.subscriptionCount)}</b>
              <small>订阅</small>
            </span>
          </div>
          <footer>
            <span>{plan.agents.map((agent) => agent.agentName).join(' | ') || '未授权智能体'}</span>
            <strong>{formatNumber(plan.agents.length)} 个</strong>
          </footer>
        </article>
      ))}
    </div>
  );
}

function ProductPlanPagination({
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
        <ProductPlanPageSizePicker value={pageSize} onChange={onPageSizeChange} />
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

export function ProductPlansPage() {
  const [plans, setPlans] = useState<ProductPlanRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [featureFilter, setFeatureFilter] = useState<FeatureFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchProductPlans()
      .then((records) => {
        if (!active) return;
        setPlans(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredPlans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return plans.filter((plan) => {
      if (statusFilter !== 'all' && (statusFilter === 'active') !== plan.isActive) return false;
      if (priceFilter !== 'all' && (priceFilter === 'free') !== plan.isFree) return false;
      if (visibilityFilter !== 'all' && (visibilityFilter === 'public') !== plan.isPublic) return false;
      if (featureFilter !== 'all' && !plan.features.some((feature) => feature.type === featureFilter)) return false;
      if (normalizedQuery && !planSearchText(plan).includes(normalizedQuery)) return false;
      return true;
    });
  }, [featureFilter, plans, priceFilter, query, statusFilter, visibilityFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const visiblePlans = filteredPlans.slice((activePage - 1) * pageSize, activePage * pageSize);
  const visiblePlanIds = visiblePlans.map((plan) => plan.id);
  const selectedVisiblePlanCount = visiblePlanIds.filter((planId) => selectedPlanIds.has(planId)).length;
  const isPlanPageSelected = visiblePlanIds.length > 0 && selectedVisiblePlanCount === visiblePlanIds.length;
  const activePlans = plans.filter((plan) => plan.isActive).length;
  const freePlans = plans.filter((plan) => plan.isFree).length;
  const paidPlans = plans.length - freePlans;
  const featureCount = plans.reduce((sum, plan) => sum + plan.features.length, 0);
  const agentCount = new Set(plans.flatMap((plan) => plan.agents.map((agent) => agent.id))).size;
  const subscriptionCount = plans.reduce((sum, plan) => sum + plan.subscriptionCount, 0);
  const publicPlans = plans.filter((plan) => plan.isPublic).length;

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [featureFilter, pageSize, priceFilter, query, statusFilter, visibilityFilter, viewMode]);

  function handleReset() {
    setQuery('');
    setStatusFilter('all');
    setPriceFilter('all');
    setVisibilityFilter('all');
    setFeatureFilter('all');
  }

  function handleOpenMenu(planId: string) {
    setOpenMenuId(planId || null);
  }

  function togglePlanSelection(planId: string, checked: boolean) {
    setSelectedPlanIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(planId);
      } else {
        next.delete(planId);
      }
      return next;
    });
  }

  function togglePlanPageSelection(checked: boolean) {
    setSelectedPlanIds((current) => {
      const next = new Set(current);
      for (const planId of visiblePlanIds) {
        if (checked) {
          next.add(planId);
        } else {
          next.delete(planId);
        }
      }
      return next;
    });
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-product-plans-page">
      <PageHeader
        icon="cube"
        title="服务套餐"
        description="统一管理解决方案下的 Free / Pro / Enterprise 等服务套餐，重点维护配额权益、价格周期、售卖状态和适用范围。"
      />

      <section className="vx-tenant-summary" aria-label="服务套餐管理统计">
        <PlanSummaryItem icon="cube" label="套餐总数" value={formatNumber(plans.length)} tags={[`启用 ${formatNumber(activePlans)}`]} />
        <PlanSummaryItem icon="chart-bar" label="商业套餐" value={formatNumber(paidPlans)} tags={[`Free ${formatNumber(freePlans)}`]} tone="green" />
        <PlanSummaryItem icon="shield-check" label="配额权益" value={formatNumber(featureCount)} tags={[`智能体 ${formatNumber(agentCount)}`]} tone="amber" />
        <PlanSummaryItem icon="user" label="订阅使用" value={formatNumber(subscriptionCount)} tags={[`公开 ${formatNumber(publicPlans)}`]} tone="blue" />
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="套餐筛选">
          <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="套餐展示方式" />
          <span className="vx-tenant-view-count">{formatNumber(filteredPlans.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索套餐、code、权益、智能体"
            className="vx-tenant-search vx-product-plan-search"
            aria-label="搜索套餐"
          />
          <Button variant="outline" onClick={handleReset}>重置</Button>
          <div className="vx-tenant-filters">
            <select className="vx-input vx-tenant-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="套餐状态">
              <option value="all">全部状态</option>
              <option value="active">启用</option>
              <option value="inactive">停用</option>
            </select>
            <select className="vx-input vx-tenant-select" value={priceFilter} onChange={(event) => setPriceFilter(event.target.value as PriceFilter)} aria-label="价格类型">
              <option value="all">全部价格</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select className="vx-input vx-tenant-select" value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)} aria-label="适用范围">
              <option value="all">全部范围</option>
              <option value="public">公开</option>
              <option value="private">内部</option>
            </select>
            <select className="vx-input vx-tenant-select" value={featureFilter} onChange={(event) => setFeatureFilter(event.target.value as FeatureFilter)} aria-label="权益类型">
              <option value="all">全部权益</option>
              <option value="quota">配额权益</option>
              <option value="function">功能权益</option>
            </select>
          </div>
          <ActionButton variant="outline" icon="plus" disabled>
            新建套餐
          </ActionButton>
        </section>

        <section className="vx-tenant-directory" aria-label="套餐清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {visiblePlans.length ? (
            viewMode === 'list' ? (
              <ProductPlanListRows
                plans={visiblePlans}
                startIndex={(activePage - 1) * pageSize}
                openMenuId={openMenuId}
                selectedPlanIds={selectedPlanIds}
                isPageSelected={isPlanPageSelected}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onTogglePlan={togglePlanSelection}
                onTogglePage={togglePlanPageSelection}
              />
            ) : (
              <ProductPlanCards
                plans={visiblePlans}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? '正在加载套餐' : '没有匹配的套餐'}
                description={loading ? '正在读取产品套餐数据。' : '清空筛选条件后可查看全部套餐。'}
                action={
                  <ActionButton variant="outline" icon="x" onClick={handleReset}>
                    清空筛选
                  </ActionButton>
                }
              />
            </section>
          )}

          <ProductPlanPagination
            currentPage={activePage}
            pageCount={pageCount}
            total={filteredPlans.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), pageCount))}
          />
        </section>
      </div>
    </div>
  );
}
