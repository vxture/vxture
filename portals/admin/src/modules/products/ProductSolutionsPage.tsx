'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Input } from '@vxture/design-system';
import { fetchProductSolutions } from '@/api/admin-bff';
import type {
  ProductSolutionCapability,
  ProductSolutionCapabilitySource,
  ProductSolutionCapabilityType,
  ProductSolutionRecord,
  ProductSolutionStatus,
  ProductSolutionVisibility,
} from '@/entities/console';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import { formatDate, formatMoney, formatNumber, joinClasses } from '@/modules/tenants/tenant-utils';

type ViewMode = 'list' | 'cards';
type StatusFilter = 'all' | ProductSolutionStatus;
type VisibilityFilter = 'all' | ProductSolutionVisibility;
type IndustryFilter = 'all' | string;
type SourceFilter = 'all' | ProductSolutionCapabilitySource;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

function solutionStatusLabel(status: ProductSolutionStatus) {
  if (status === 'active') return '启用';
  if (status === 'draft') return '草稿';
  return '归档';
}

function solutionVisibilityLabel(visibility: ProductSolutionVisibility) {
  return visibility === 'public' ? '公开' : '内部';
}

function capabilityTypeLabel(type: ProductSolutionCapabilityType) {
  if (type === 'platform') return '平台';
  if (type === 'agent') return '智能体';
  if (type === 'model') return '模型';
  if (type === 'data') return '数据';
  return '服务';
}

function capabilityTypeIcon(type: ProductSolutionCapabilityType): IconName {
  if (type === 'platform') return 'database';
  if (type === 'agent') return 'agent';
  if (type === 'model') return 'cloud';
  if (type === 'data') return 'table';
  return 'server';
}

function capabilitySourceLabel(source: ProductSolutionCapabilitySource) {
  return source === 'self' ? '自建' : '三方';
}

function solutionSearchText(solution: ProductSolutionRecord) {
  return [
    solution.solutionCode,
    solution.solutionName,
    solution.description,
    solution.industry,
    solution.scenario,
    solution.customerSegment,
    solution.ownerTeam,
    solution.status,
    solution.visibility,
    ...solution.tags,
    ...solution.products.map((product) => `${product.productCode} ${product.productName} ${product.role} ${product.productType} ${product.source}`),
    ...solution.tiers.map((tier) => `${tier.tierCode} ${tier.tierName} ${tier.summary}`),
  ].join(' ').toLowerCase();
}

function SolutionSummaryItem({
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

function ProductSolutionPageSizePicker({ value, onChange }: { value: PageSize; onChange: (value: PageSize) => void }) {
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

function ProductSolutionActionsMenu({
  solution,
  open,
  onToggle,
  onClose,
  onViewDetails,
}: {
  solution: ProductSolutionRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onViewDetails: () => void;
}) {
  return (
    <div className="vx-tenant-actions" onClick={(event) => event.stopPropagation()} onMouseLeave={onClose}>
      <button className="vx-tenant-actions__trigger" type="button" aria-label={`${solution.solutionName} 操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <button type="button" role="menuitem" onClick={onViewDetails}>
            <Icon name="arrow-right" size="xs" fallback="placeholder" />
            查看详情
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="edit" size="xs" fallback="placeholder" />
            编辑方案
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name="cube" size="xs" fallback="placeholder" />
            配置产品
          </button>
          <button type="button" role="menuitem" disabled>
            <Icon name={solution.status === 'active' ? 'x' : 'check'} size="xs" fallback="placeholder" />
            {solution.status === 'active' ? '停用方案' : '启用方案'}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CapabilityTags({ products, maxVisible = 3 }: { products: ProductSolutionCapability[]; maxVisible?: number }) {
  const visibleProducts = products.slice(0, maxVisible);
  const hiddenCount = Math.max(0, products.length - visibleProducts.length);

  return (
    <span className="vx-product-solution-capability-tags">
      {visibleProducts.map((product) => (
        <Badge
          key={product.id}
          className={`vx-tenant-pill vx-product-solution-pill--${product.productType}`}
          title={`${capabilityTypeLabel(product.productType)} | ${capabilitySourceLabel(product.source)} | ${product.role}`}
        >
          {product.productName}
        </Badge>
      ))}
      {hiddenCount ? <Badge className="vx-tenant-pill vx-product-solution-pill--more">+{formatNumber(hiddenCount)}</Badge> : null}
    </span>
  );
}

function ProductSolutionListRows({
  solutions,
  startIndex,
  openMenuId,
  selectedSolutionIds,
  isPageSelected,
  onOpenMenu,
  onCloseMenu,
  onOpenDetails,
  onToggleSolution,
  onTogglePage,
}: {
  solutions: ProductSolutionRecord[];
  startIndex: number;
  openMenuId: string | null;
  selectedSolutionIds: Set<string>;
  isPageSelected: boolean;
  onOpenMenu: (solutionId: string) => void;
  onCloseMenu: () => void;
  onOpenDetails: (solutionCode: string) => void;
  onToggleSolution: (solutionId: string, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
}) {
  const pageSelectRef = useRef<HTMLInputElement | null>(null);
  const selectedOnPage = solutions.filter((solution) => selectedSolutionIds.has(solution.id)).length;
  const isPagePartiallySelected = selectedOnPage > 0 && selectedOnPage < solutions.length;

  useEffect(() => {
    if (pageSelectRef.current) {
      pageSelectRef.current.indeterminate = isPagePartiallySelected;
    }
  }, [isPagePartiallySelected]);

  return (
    <div className="vx-tenant-directory-list vx-product-solution-directory-list" role="region" aria-label="解决方案清单">
      <div className="vx-tenant-directory-list__header">
        <span>
          <input
            ref={pageSelectRef}
            type="checkbox"
            className="vx-model-select-checkbox"
            checked={isPageSelected}
            onChange={(event) => onTogglePage(event.target.checked)}
            aria-label="选择当前页业务方案"
          />
        </span>
        <span>序号</span>
        <span>业务方案</span>
        <span>行业场景</span>
        <span>产品能力</span>
        <span>服务套餐</span>
        <span>运营</span>
        <span>操作</span>
      </div>
      {solutions.map((solution, index) => {
        const partnerCount = solution.products.filter((product) => product.source === 'partner').length;

        return (
          <div
            key={solution.id}
            className={joinClasses('vx-tenant-directory-row', 'vx-product-solution-operation-row', `vx-product-solution-row--${solution.status}`, selectedSolutionIds.has(solution.id) ? 'vx-product-solution-operation-row--selected' : '')}
            onClick={(event) => {
              if (event.target instanceof HTMLElement && event.target.closest('button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]')) return;
              onToggleSolution(solution.id, !selectedSolutionIds.has(solution.id));
            }}
          >
            <span className="vx-product-solution-operation-row__select">
              <input
                type="checkbox"
                className="vx-model-select-checkbox"
                checked={selectedSolutionIds.has(solution.id)}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => onToggleSolution(solution.id, event.target.checked)}
                aria-label={`选择 ${solution.solutionName}`}
              />
            </span>
            <span className="vx-tenant-directory-row__index">{formatNumber(startIndex + index + 1)}</span>
            <span className="vx-tenant-directory-row__tenant vx-product-solution-row__identity">
              <Icon name="workflow" size="sm" fallback="placeholder" />
              <span>
                <span className="vx-tenant-directory-row__title-line">
                  <button type="button" className="vx-model-name-button" onClick={() => onOpenDetails(solution.solutionCode)}>
                    {solution.solutionName}
                  </button>
                </span>
                <small>{solution.solutionCode} · {solution.ownerTeam}</small>
              </span>
            </span>
            <span className="vx-product-solution-row__scenario">
              <span className="vx-tenant-directory-row__tag-line">
                <Badge className={`vx-tenant-pill vx-product-solution-pill--${solution.status}`}>{solutionStatusLabel(solution.status)}</Badge>
                <Badge className={`vx-tenant-pill vx-product-solution-pill--${solution.visibility}`}>{solutionVisibilityLabel(solution.visibility)}</Badge>
              </span>
              <small>{solution.industry} | {solution.scenario}</small>
            </span>
            <span className="vx-product-solution-row__products">
              <CapabilityTags products={solution.products} />
              <small>{formatNumber(solution.products.length)} 产品能力 | 三方 {formatNumber(partnerCount)}</small>
            </span>
            <span className="vx-product-solution-row__tiers">
              <span className="vx-product-solution-tier-tags">
                {solution.tiers.map((tier) => (
                  <Badge
                    key={tier.tierCode}
                    className={`vx-tenant-pill vx-product-solution-pill--tier-${tier.tierCode}`}
                    title={tier.summary}
                  >
                    {tier.tierName}
                  </Badge>
                ))}
              </span>
              <small>{formatNumber(solution.tiers.length)} 个版本 | {formatDate(solution.updatedAt)} 更新</small>
            </span>
            <span className="vx-product-solution-row__subscriptions">
              <strong>{formatMoney(solution.monthlyRevenue)}</strong>
              <small>{formatNumber(solution.subscriptionCount)} 订阅 | 活跃 {formatNumber(solution.activeTenantCount)}</small>
            </span>
            <ProductSolutionActionsMenu
              solution={solution}
              open={openMenuId === solution.id}
              onToggle={() => onOpenMenu(openMenuId === solution.id ? '' : solution.id)}
              onClose={onCloseMenu}
              onViewDetails={() => onOpenDetails(solution.solutionCode)}
            />
          </div>
        );
      })}
    </div>
  );
}

function ProductSolutionCards({
  solutions,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
  onOpenDetails,
}: {
  solutions: ProductSolutionRecord[];
  openMenuId: string | null;
  onOpenMenu: (solutionId: string) => void;
  onCloseMenu: () => void;
  onOpenDetails: (solutionCode: string) => void;
}) {
  return (
    <div className="vx-tenant-directory-cards vx-product-solution-cards" aria-label="解决方案卡片">
      {solutions.map((solution) => (
        <article
          key={solution.id}
          className={joinClasses('vx-tenant-directory-card', `vx-product-solution-card--${solution.status}`)}
          role="button"
          tabIndex={0}
          onClick={() => onOpenDetails(solution.solutionCode)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onOpenDetails(solution.solutionCode);
          }}
        >
          <header>
            <Icon name="workflow" size="lg" fallback="placeholder" />
            <div>
              <strong>{solution.solutionName}</strong>
              <span>{solution.solutionCode} · {solution.industry}</span>
            </div>
            <ProductSolutionActionsMenu
              solution={solution}
              open={openMenuId === solution.id}
              onToggle={() => onOpenMenu(openMenuId === solution.id ? '' : solution.id)}
              onClose={onCloseMenu}
              onViewDetails={() => onOpenDetails(solution.solutionCode)}
            />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Badge className={`vx-tenant-pill vx-product-solution-pill--${solution.status}`}>{solutionStatusLabel(solution.status)}</Badge>
            <Badge className={`vx-tenant-pill vx-product-solution-pill--${solution.visibility}`}>{solutionVisibilityLabel(solution.visibility)}</Badge>
          </div>
          <p className="vx-product-solution-card__description">{solution.description}</p>
          <div className="vx-product-solution-card__capabilities">
            {solution.products.map((product) => (
              <span key={product.id}>
                <Icon name={capabilityTypeIcon(product.productType)} size="xs" fallback="placeholder" />
                {product.productName}
              </span>
            ))}
          </div>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{formatNumber(solution.products.length)}</b>
              <small>产品能力</small>
            </span>
            <span>
              <b>{formatNumber(solution.tiers.length)}</b>
              <small>套餐版本</small>
            </span>
            <span>
              <b>{formatNumber(solution.subscriptionCount)}</b>
              <small>订阅</small>
            </span>
          </div>
          <footer>
            <span>{solution.customerSegment}</span>
            <strong>{formatMoney(solution.monthlyRevenue)}</strong>
          </footer>
        </article>
      ))}
    </div>
  );
}

function ProductSolutionPagination({
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
        <ProductSolutionPageSizePicker value={pageSize} onChange={onPageSizeChange} />
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

export function ProductSolutionsPage() {
  const router = useRouter();
  const [solutions, setSolutions] = useState<ProductSolutionRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedSolutionIds, setSelectedSolutionIds] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [industryFilter, setIndustryFilter] = useState<IndustryFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchProductSolutions()
      .then((records) => {
        if (!active) return;
        setSolutions(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const industries = useMemo(() => Array.from(new Set(solutions.map((solution) => solution.industry))).sort((left, right) => left.localeCompare(right, 'zh-CN')), [solutions]);
  const filteredSolutions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return solutions.filter((solution) => {
      if (statusFilter !== 'all' && solution.status !== statusFilter) return false;
      if (visibilityFilter !== 'all' && solution.visibility !== visibilityFilter) return false;
      if (industryFilter !== 'all' && solution.industry !== industryFilter) return false;
      if (sourceFilter !== 'all' && !solution.products.some((product) => product.source === sourceFilter)) return false;
      if (normalizedQuery && !solutionSearchText(solution).includes(normalizedQuery)) return false;
      return true;
    });
  }, [industryFilter, query, solutions, sourceFilter, statusFilter, visibilityFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredSolutions.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const visibleSolutions = filteredSolutions.slice((activePage - 1) * pageSize, activePage * pageSize);
  const visibleSolutionIds = visibleSolutions.map((solution) => solution.id);
  const selectedVisibleSolutionCount = visibleSolutionIds.filter((solutionId) => selectedSolutionIds.has(solutionId)).length;
  const isSolutionPageSelected = visibleSolutionIds.length > 0 && selectedVisibleSolutionCount === visibleSolutionIds.length;
  const activeSolutions = solutions.filter((solution) => solution.status === 'active').length;
  const productCount = solutions.reduce((sum, solution) => sum + solution.products.length, 0);
  const partnerProductCount = solutions.reduce((sum, solution) => sum + solution.products.filter((product) => product.source === 'partner').length, 0);
  const tierCount = solutions.reduce((sum, solution) => sum + solution.tiers.length, 0);
  const subscriptionCount = solutions.reduce((sum, solution) => sum + solution.subscriptionCount, 0);
  const monthlyRevenue = solutions.reduce((sum, solution) => sum + solution.monthlyRevenue, 0);

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [industryFilter, pageSize, query, sourceFilter, statusFilter, visibilityFilter, viewMode]);

  function handleReset() {
    setQuery('');
    setStatusFilter('all');
    setVisibilityFilter('all');
    setIndustryFilter('all');
    setSourceFilter('all');
  }

  function handleOpenMenu(solutionId: string) {
    setOpenMenuId(solutionId || null);
  }

  function handleOpenDetails(solutionCode: string) {
    router.push(`/product-solutions/${encodeURIComponent(solutionCode)}`);
  }

  function toggleSolutionSelection(solutionId: string, checked: boolean) {
    setSelectedSolutionIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(solutionId);
      } else {
        next.delete(solutionId);
      }
      return next;
    });
  }

  function toggleSolutionPageSelection(checked: boolean) {
    setSelectedSolutionIds((current) => {
      const next = new Set(current);
      for (const solutionId of visibleSolutionIds) {
        if (checked) {
          next.add(solutionId);
        } else {
          next.delete(solutionId);
        }
      }
      return next;
    });
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-product-solutions-page">
      <PageHeader
        icon="workflow"
        title="解决方案"
        description="按行业业务场景组合产品能力，定义方案边界、包含产品、服务套餐和适用客户。"
      />

      <section className="vx-tenant-summary" aria-label="解决方案统计">
        <SolutionSummaryItem icon="workflow" label="方案总数" value={formatNumber(solutions.length)} tags={[`启用 ${formatNumber(activeSolutions)}`]} />
        <SolutionSummaryItem icon="cube" label="产品能力" value={formatNumber(productCount)} tags={[`三方 ${formatNumber(partnerProductCount)}`]} tone="green" />
        <SolutionSummaryItem icon="star" label="服务套餐" value={formatNumber(tierCount)} tags={[`订阅 ${formatNumber(subscriptionCount)}`]} tone="amber" />
        <SolutionSummaryItem icon="chart-bar" label="月度收入" value={formatMoney(monthlyRevenue)} tags={[`场景 ${formatNumber(industries.length)}`]} tone="blue" />
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="解决方案筛选">
          <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="解决方案展示方式" />
          <span className="vx-tenant-view-count">{formatNumber(filteredSolutions.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索方案、行业、产品能力"
            className="vx-tenant-search vx-product-solution-search"
            aria-label="搜索解决方案"
          />
          <Button variant="outline" onClick={handleReset}>重置</Button>
          <div className="vx-tenant-filters">
            <select className="vx-input vx-tenant-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} aria-label="方案状态">
              <option value="all">全部状态</option>
              <option value="active">启用</option>
              <option value="draft">草稿</option>
              <option value="archived">归档</option>
            </select>
            <select className="vx-input vx-tenant-select" value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)} aria-label="可见范围">
              <option value="all">全部范围</option>
              <option value="public">公开</option>
              <option value="internal">内部</option>
            </select>
            <select className="vx-input vx-tenant-select vx-product-solution-select--industry" value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)} aria-label="行业场景">
              <option value="all">全部行业</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            <select className="vx-input vx-tenant-select" value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceFilter)} aria-label="产品来源">
              <option value="all">全部来源</option>
              <option value="self">自建</option>
              <option value="partner">三方</option>
            </select>
          </div>
          <ActionButton variant="outline" icon="plus" disabled>
            新建方案
          </ActionButton>
        </section>

        <section className="vx-tenant-directory" aria-label="解决方案清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {visibleSolutions.length ? (
            viewMode === 'list' ? (
              <ProductSolutionListRows
                solutions={visibleSolutions}
                startIndex={(activePage - 1) * pageSize}
                openMenuId={openMenuId}
                selectedSolutionIds={selectedSolutionIds}
                isPageSelected={isSolutionPageSelected}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onOpenDetails={handleOpenDetails}
                onToggleSolution={toggleSolutionSelection}
                onTogglePage={toggleSolutionPageSelection}
              />
            ) : (
              <ProductSolutionCards
                solutions={visibleSolutions}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onOpenDetails={handleOpenDetails}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? '正在加载解决方案' : '没有匹配的解决方案'}
                description={loading ? '正在读取行业解决方案数据。' : '清空筛选条件后可查看全部解决方案。'}
                action={
                  <ActionButton variant="outline" icon="x" onClick={handleReset}>
                    清空筛选
                  </ActionButton>
                }
              />
            </section>
          )}

          <ProductSolutionPagination
            currentPage={activePage}
            pageCount={pageCount}
            total={filteredSolutions.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), pageCount))}
          />
        </section>
      </div>
    </div>
  );
}
