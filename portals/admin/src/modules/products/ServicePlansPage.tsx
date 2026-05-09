'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Input } from '@vxture/design-system';
import { fetchProductPlans, fetchProductSolutions } from '@/api/admin-bff';
import type {
  ProductPlanRecord,
  ProductSolutionRecord,
  ProductSolutionStatus,
  ProductSolutionTier,
} from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import { formatDate, formatMoney, formatNumber, joinClasses } from '@/modules/tenants/tenant-utils';

type ViewMode = 'list' | 'cards';
type StatusFilter = 'all' | ProductSolutionStatus;
type VisibilityFilter = 'all' | 'public' | 'internal';
type PriceFilter = 'all' | 'free' | 'paid' | 'contract';
type IndustryFilter = 'all' | string;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

const tierPlanCodeMap: Record<ProductSolutionTier['tierCode'], string> = {
  free: 'starter',
  pro: 'growth',
  enterprise: 'enterprise',
  custom: 'enterprise',
};

interface ServicePlanTierItem {
  id: string;
  solution: ProductSolutionRecord;
  tier: ProductSolutionTier;
  basePlan: ProductPlanRecord | null;
}

interface ServicePlanGroup {
  solution: ProductSolutionRecord;
  tiers: ServicePlanTierItem[];
}

function tierStatusLabel(status: ProductSolutionStatus) {
  if (status === 'active') return '启用';
  if (status === 'draft') return '草稿';
  return '归档';
}

function solutionVisibilityLabel(visibility: ProductSolutionRecord['visibility']) {
  return visibility === 'public' ? '公开' : '内部';
}

function tierPriceKind(tier: ProductSolutionTier): PriceFilter {
  if (tier.tierCode === 'free') return 'free';
  if (tier.tierCode === 'enterprise' || tier.tierCode === 'custom') return 'contract';
  return 'paid';
}

function defaultPrice(plan: ProductPlanRecord | null) {
  if (!plan) return null;
  return plan.prices.find((price) => price.isDefault && price.isActive) ?? plan.prices.find((price) => price.isActive) ?? plan.prices[0] ?? null;
}

function tierPriceLabel(item: ServicePlanTierItem) {
  const priceKind = tierPriceKind(item.tier);
  if (priceKind === 'free') return '免费';
  if (priceKind === 'contract') return '合同报价';

  const price = defaultPrice(item.basePlan);
  if (!price) return '待定价';

  return `${formatMoney(price.price)} / ${price.periodType === 'yearly' ? '年' : '月'}`;
}

function tierSearchText(item: ServicePlanTierItem) {
  return [
    item.solution.solutionCode,
    item.solution.solutionName,
    item.solution.description,
    item.solution.industry,
    item.solution.scenario,
    item.solution.customerSegment,
    item.tier.tierCode,
    item.tier.tierName,
    item.tier.summary,
    item.tier.status,
    item.basePlan?.planCode,
    item.basePlan?.planName,
    ...item.solution.products.map((product) => `${product.productCode} ${product.productName} ${product.role}`),
  ].filter(Boolean).join(' ').toLowerCase();
}

function buildTierItems(solutions: ProductSolutionRecord[], plans: ProductPlanRecord[]) {
  const plansByCode = new Map(plans.map((plan) => [plan.planCode, plan]));

  return solutions.flatMap((solution) =>
    solution.tiers.map((tier) => ({
      id: `${solution.id}:${tier.tierCode}`,
      solution,
      tier,
      basePlan: plansByCode.get(tierPlanCodeMap[tier.tierCode]) ?? null,
    })),
  );
}

function groupTierItems(items: ServicePlanTierItem[]) {
  const groups = new Map<string, ServicePlanGroup>();

  for (const item of items) {
    const group = groups.get(item.solution.id) ?? { solution: item.solution, tiers: [] };
    group.tiers.push(item);
    groups.set(item.solution.id, group);
  }

  return Array.from(groups.values());
}

function ServicePlanSummaryItem({
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

function ServicePlanPageSizePicker({ value, onChange }: { value: PageSize; onChange: (value: PageSize) => void }) {
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

function ServicePlanActionsMenu({
  item,
  open,
  onToggle,
  onClose,
  onViewDetails,
}: {
  item: ServicePlanTierItem;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onViewDetails: () => void;
}) {
  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()} onMouseLeave={onClose}>
      <button className="vx-tenant-actions__trigger" type="button" aria-label={`${item.solution.solutionName} ${item.tier.tierName} 操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <button type="button" role="menuitem" onClick={onViewDetails}>
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
            <Icon name={item.tier.status === 'active' ? 'x' : 'check'} size="xs" fallback="placeholder" />
            {item.tier.status === 'active' ? '下架套餐' : '上架套餐'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ServicePlanTier({
  item,
  viewMode,
  open,
  onToggle,
  onClose,
  onViewDetails,
}: {
  item: ServicePlanTierItem;
  viewMode: ViewMode;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onViewDetails: () => void;
}) {
  const priceKind = tierPriceKind(item.tier);
  const products = item.solution.products.slice(0, 3);
  const hiddenProductCount = Math.max(0, item.solution.products.length - products.length);
  const className = joinClasses(
    viewMode === 'cards' ? 'vx-service-plan-tier-card' : 'vx-service-plan-tier-row',
    `vx-service-plan-tier--${item.tier.status}`,
  );

  return (
    <article
      className={className}
      role="button"
      tabIndex={0}
      onClick={onViewDetails}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onViewDetails();
      }}
    >
      <div className="vx-service-plan-tier__identity">
        <Icon name="star" size={viewMode === 'cards' ? 'lg' : 'sm'} fallback="placeholder" />
        <span>
          <strong>{item.tier.tierName}</strong>
          <small>{item.solution.solutionCode} · {item.tier.tierCode}</small>
        </span>
      </div>

      <div className="vx-service-plan-tier__status">
        <span className="vx-service-plan-tag-line">
          <Badge className={`vx-tenant-pill vx-service-plan-pill--${item.tier.status}`}>{tierStatusLabel(item.tier.status)}</Badge>
          <Badge className={`vx-tenant-pill vx-service-plan-pill--${item.tier.isPublic ? 'public' : 'internal'}`}>{item.tier.isPublic ? '公开' : '内部'}</Badge>
        </span>
        <small>{item.basePlan?.planName ?? '独立配置'}</small>
      </div>

      <div className="vx-service-plan-tier__summary">
        <p title={item.tier.summary}>{item.tier.summary}</p>
        <span className="vx-service-plan-product-tags">
          {products.map((product) => (
            <Badge key={product.id} className={`vx-tenant-pill vx-service-plan-pill--product-${product.productType}`} title={product.role}>
              {product.productName}
            </Badge>
          ))}
          {hiddenProductCount ? <Badge className="vx-tenant-pill vx-service-plan-pill--more">+{formatNumber(hiddenProductCount)}</Badge> : null}
        </span>
      </div>

      <div className="vx-service-plan-tier__price">
        <strong>{tierPriceLabel(item)}</strong>
        <small>{priceKind === 'free' ? '试用版本' : priceKind === 'contract' ? '专属商务' : '标准定价'}</small>
      </div>

      <ServicePlanActionsMenu item={item} open={open} onToggle={onToggle} onClose={onClose} onViewDetails={onViewDetails} />
    </article>
  );
}

function ServicePlanGroupBlock({
  group,
  viewMode,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
  onOpenDetails,
}: {
  group: ServicePlanGroup;
  viewMode: ViewMode;
  openMenuId: string | null;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  onOpenDetails: (solutionCode: string, tierCode: ProductSolutionTier['tierCode']) => void;
}) {
  const partnerProductCount = group.solution.products.filter((product) => product.source === 'partner').length;

  return (
    <section className="vx-service-plan-group">
      <header className="vx-service-plan-group__header">
        <div className="vx-service-plan-group__identity">
          <Icon name="workflow" size="lg" fallback="placeholder" />
          <div>
            <h2>{group.solution.solutionName}</h2>
            <p>{group.solution.industry} | {group.solution.scenario}</p>
          </div>
        </div>
        <div className="vx-service-plan-group__badges">
          <Badge className={`vx-tenant-pill vx-service-plan-pill--solution-${group.solution.status}`}>{tierStatusLabel(group.solution.status)}</Badge>
          <Badge className={`vx-tenant-pill vx-service-plan-pill--${group.solution.visibility}`}>{solutionVisibilityLabel(group.solution.visibility)}</Badge>
        </div>
      </header>

      <div className="vx-service-plan-group__meta">
        <span>{formatNumber(group.solution.products.length)} 产品能力</span>
        <span>三方 {formatNumber(partnerProductCount)}</span>
        <span>{formatNumber(group.tiers.length)} 套餐版本</span>
        <span>{formatNumber(group.solution.subscriptionCount)} 订阅</span>
        <span>{formatMoney(group.solution.monthlyRevenue)} / 月</span>
        <span>{formatDate(group.solution.updatedAt)} 更新</span>
      </div>

      <div className={viewMode === 'cards' ? 'vx-service-plan-tier-grid' : 'vx-service-plan-tier-list'}>
        {group.tiers.map((item) => (
          <ServicePlanTier
            key={item.id}
            item={item}
            viewMode={viewMode}
            open={openMenuId === item.id}
            onToggle={() => onOpenMenu(openMenuId === item.id ? '' : item.id)}
            onClose={onCloseMenu}
            onViewDetails={() => onOpenDetails(item.solution.solutionCode, item.tier.tierCode)}
          />
        ))}
      </div>
    </section>
  );
}

function ServicePlanPagination({
  currentPage,
  pageCount,
  totalGroups,
  totalTiers,
  pageSize,
  onPageSizeChange,
  onPageChange,
}: {
  currentPage: number;
  pageCount: number;
  totalGroups: number;
  totalTiers: number;
  pageSize: PageSize;
  onPageSizeChange: (value: PageSize) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <footer className="vx-tenant-pagination">
      <span className="vx-tenant-pagination__total">
        共 {formatNumber(totalGroups)} 个方案，{formatNumber(totalTiers)} 个套餐
      </span>
      <div className="vx-tenant-pagination__actions">
        <ServicePlanPageSizePicker value={pageSize} onChange={onPageSizeChange} />
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

export function ServicePlansPage() {
  const router = useRouter();
  const [solutions, setSolutions] = useState<ProductSolutionRecord[]>([]);
  const [plans, setPlans] = useState<ProductPlanRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([fetchProductSolutions(), fetchProductPlans()])
      .then(([solutionRecords, planRecords]) => {
        if (!active) return;
        setSolutions(solutionRecords);
        setPlans(planRecords);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const industries = useMemo(() => Array.from(new Set(solutions.map((solution) => solution.industry))).sort((left, right) => left.localeCompare(right, 'zh-CN')), [solutions]);
  const tierItems = useMemo(() => buildTierItems(solutions, plans), [plans, solutions]);
  const filteredTierItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tierItems.filter((item) => {
      if (statusFilter !== 'all' && item.tier.status !== statusFilter) return false;
      if (visibilityFilter !== 'all' && item.solution.visibility !== visibilityFilter) return false;
      if (industryFilter !== 'all' && item.solution.industry !== industryFilter) return false;
      if (priceFilter !== 'all' && tierPriceKind(item.tier) !== priceFilter) return false;
      if (normalizedQuery && !tierSearchText(item).includes(normalizedQuery)) return false;
      return true;
    });
  }, [industryFilter, priceFilter, query, statusFilter, tierItems, visibilityFilter]);
  const filteredGroups = useMemo(() => groupTierItems(filteredTierItems), [filteredTierItems]);
  const pageCount = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const visibleGroups = filteredGroups.slice((activePage - 1) * pageSize, activePage * pageSize);
  const activeTierCount = tierItems.filter((item) => item.tier.status === 'active').length;
  const publicTierCount = tierItems.filter((item) => item.tier.isPublic).length;
  const solutionCount = solutions.length;
  const subscriptionCount = solutions.reduce((sum, solution) => sum + solution.subscriptionCount, 0);
  const monthlyRevenue = solutions.reduce((sum, solution) => sum + solution.monthlyRevenue, 0);

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [industryFilter, pageSize, priceFilter, query, statusFilter, visibilityFilter, viewMode]);

  function handleReset() {
    setQuery('');
    setStatusFilter('all');
    setVisibilityFilter('all');
    setPriceFilter('all');
    setIndustryFilter('all');
  }

  function handleOpenMenu(id: string) {
    setOpenMenuId(id || null);
  }

  function handleOpenDetails(solutionCode: string, tierCode: ProductSolutionTier['tierCode']) {
    router.push(`/service-plans/${encodeURIComponent(solutionCode)}/${encodeURIComponent(tierCode)}`);
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-service-plans-page">
      <PageHeader
        icon="star"
        title="服务套餐"
        description="按解决方案铺开 Free / Pro / Enterprise 等服务套餐，维护配额、价格、售卖状态和适用范围。"
      />

      <section className="vx-tenant-summary" aria-label="服务套餐管理统计">
        <ServicePlanSummaryItem icon="workflow" label="业务方案" value={formatNumber(solutionCount)} tags={[`套餐 ${formatNumber(tierItems.length)}`]} />
        <ServicePlanSummaryItem icon="star" label="启用套餐" value={formatNumber(activeTierCount)} tags={[`公开 ${formatNumber(publicTierCount)}`]} tone="green" />
        <ServicePlanSummaryItem icon="user" label="订阅使用" value={formatNumber(subscriptionCount)} tags={[`场景 ${formatNumber(industries.length)}`]} tone="amber" />
        <ServicePlanSummaryItem icon="chart-bar" label="月度收入" value={formatMoney(monthlyRevenue)} tags={['方案口径']} tone="blue" />
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="服务套餐筛选">
          <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="服务套餐展示方式" />
          <span className="vx-tenant-view-count">{formatNumber(filteredTierItems.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索方案、套餐、配额"
            className="vx-tenant-search vx-service-plan-search"
            aria-label="搜索服务套餐"
          />
          <Button variant="outline" onClick={handleReset}>重置</Button>
          <div className="vx-tenant-filters">
            <select className="vx-input vx-tenant-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="套餐状态">
              <option value="all">全部状态</option>
              <option value="active">启用</option>
              <option value="draft">草稿</option>
              <option value="archived">归档</option>
            </select>
            <select className="vx-input vx-tenant-select" value={priceFilter} onChange={(event) => setPriceFilter(event.target.value as PriceFilter)} aria-label="价格类型">
              <option value="all">全部价格</option>
              <option value="free">免费</option>
              <option value="paid">标准付费</option>
              <option value="contract">合同报价</option>
            </select>
            <select className="vx-input vx-tenant-select" value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)} aria-label="适用范围">
              <option value="all">全部范围</option>
              <option value="public">公开</option>
              <option value="internal">内部</option>
            </select>
            <select className="vx-input vx-tenant-select vx-service-plan-select--industry" value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)} aria-label="业务方案">
              <option value="all">全部行业</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
          <ActionButton variant="outline" icon="plus" disabled>
            新建套餐
          </ActionButton>
        </section>

        <section className="vx-service-plan-directory" aria-label="服务套餐清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {visibleGroups.length ? (
            <div className="vx-service-plan-groups">
              {visibleGroups.map((group) => (
                <ServicePlanGroupBlock
                  key={group.solution.id}
                  group={group}
                  viewMode={viewMode}
                  openMenuId={openMenuId}
                  onOpenMenu={handleOpenMenu}
                  onCloseMenu={() => setOpenMenuId(null)}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? '正在加载服务套餐' : '没有匹配的服务套餐'}
                description={loading ? '正在读取业务方案和套餐版本。' : '清空筛选条件后可查看全部服务套餐。'}
                action={
                  <ActionButton variant="outline" icon="x" onClick={handleReset}>
                    清空筛选
                  </ActionButton>
                }
              />
            </section>
          )}

          <ServicePlanPagination
            currentPage={activePage}
            pageCount={pageCount}
            totalGroups={filteredGroups.length}
            totalTiers={filteredTierItems.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), pageCount))}
          />
        </section>
      </div>
    </div>
  );
}
