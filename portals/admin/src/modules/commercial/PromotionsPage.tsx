"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@vxture/design-system";
import { Button, Input } from "@/components/ui/primitives";
import { fetchPromotionOperations } from "@/api/admin-bff";
import type {
  PromotionOperationRecord,
  PromotionOperationStatus,
  PromotionOperationType,
} from "@/entities/console";
import { ActionButton } from "@/modules/shared/ActionButton";
import { EmptyState } from "@/modules/shared/EmptyState";
import { PageHeader } from "@/modules/shared/PageHeader";
import { ViewModeSwitch } from "@/modules/shared/ViewModeSwitch";
import {
  formatDate,
  formatNumber,
  joinClasses,
} from "@/modules/tenants/tenant-utils";
import {
  formatCurrency,
  PageSizePicker,
  type PageSize,
  SummaryItem,
  Tag,
  tierTone,
  type ViewMode,
} from "./commercial-utils";

type StatusFilter = "all" | PromotionOperationStatus;
type TypeFilter = "all" | PromotionOperationType;

function statusLabel(status: PromotionOperationStatus) {
  if (status === "scheduled") return "待开始";
  if (status === "expired") return "已结束";
  if (status === "paused") return "已暂停";
  return "生效中";
}

function typeLabel(type: PromotionOperationType) {
  if (type === "discount") return "套餐折扣";
  if (type === "coupon") return "优惠码";
  return "活动";
}

function statusTone(status: PromotionOperationStatus) {
  if (status === "active") return "normal";
  if (status === "scheduled") return "warning";
  if (status === "paused") return "muted";
  return "danger";
}

function promotionSearchText(record: PromotionOperationRecord) {
  return [
    record.promotionCode,
    record.promotionName,
    record.scopeLabel,
    record.planCode,
    record.planName,
    record.tierName,
    record.discountLabel,
    record.ownerName,
    record.description,
    statusLabel(record.status),
    typeLabel(record.promotionType),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function PromotionActionsMenu({
  record,
  open,
  onToggle,
  onClose,
}: {
  record: PromotionOperationRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className="vx-tenant-actions"
      onClick={(event) => event.stopPropagation()}
      onMouseLeave={onClose}
    >
      <button
        className="vx-tenant-actions__trigger"
        type="button"
        aria-label={`${record.promotionName} 操作`}
        title="操作"
        onClick={onToggle}
      >
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push("/promotion-redemptions");
            }}
          >
            <Icon name="check" size="xs" fallback="placeholder" />
            查看核销
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push("/service-plans");
            }}
          >
            <Icon name="star" size="xs" fallback="placeholder" />
            服务套餐
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PromotionRows({
  records,
  startIndex,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
  selectedRecordIds,
  isPageSelected,
  onToggleRecord,
  onTogglePage,
}: {
  records: PromotionOperationRecord[];
  startIndex: number;
  openMenuId: string | null;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  selectedRecordIds: Set<string>;
  isPageSelected: boolean;
  onToggleRecord: (id: string, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
}) {
  const router = useRouter();
  const pageSelectRef = useRef<HTMLInputElement | null>(null);
  const selectedOnPage = records.filter((record) =>
    selectedRecordIds.has(record.id),
  ).length;

  useEffect(() => {
    if (pageSelectRef.current) {
      pageSelectRef.current.indeterminate =
        selectedOnPage > 0 && selectedOnPage < records.length;
    }
  }, [records.length, selectedOnPage]);

  return (
    <div
      className="vx-tenant-directory-list vx-promotion-directory-list"
      role="region"
      aria-label="推广优惠清单"
    >
      <div className="vx-tenant-directory-list__header">
        <span>
          <input
            ref={pageSelectRef}
            type="checkbox"
            className="vx-model-select-checkbox"
            checked={isPageSelected}
            onChange={(event) => onTogglePage(event.target.checked)}
            aria-label="选择当前页优惠活动"
          />
        </span>
        <span>序号</span>
        <span>优惠活动</span>
        <span>适用范围</span>
        <span>优惠</span>
        <span>核销</span>
        <span>状态</span>
        <span>时间</span>
        <span>操作</span>
      </div>
      {records.map((record, index) => {
        const selected = selectedRecordIds.has(record.id);

        return (
          <div
            key={record.id}
            className={joinClasses(
              "vx-tenant-directory-row",
              "vx-promotion-operation-row",
              `vx-commercial-row--${statusTone(record.status)}`,
              selected ? "vx-promotion-operation-row--selected" : undefined,
            )}
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (
                target.closest(
                  'button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]',
                )
              )
                return;
              onToggleRecord(record.id, !selected);
            }}
          >
            <span className="vx-promotion-operation-row__select">
              <input
                type="checkbox"
                className="vx-model-select-checkbox"
                checked={selected}
                onChange={(event) =>
                  onToggleRecord(record.id, event.target.checked)
                }
                aria-label={`选择优惠活动 ${record.promotionName}`}
              />
            </span>
            <span className="vx-tenant-directory-row__index">
              {formatNumber(startIndex + index + 1)}
            </span>
            <span className="vx-commercial-row__main">
              <button
                type="button"
                className="vx-model-name-button"
                onClick={() => router.push("/promotion-redemptions")}
              >
                {record.promotionName}
              </button>
              <small>
                {record.promotionCode} · {typeLabel(record.promotionType)}
              </small>
            </span>
            <span className="vx-commercial-row__main">
              <span className="vx-tenant-directory-row__tag-line">
                <Tag tone={tierTone(record.tierName)}>
                  {record.tierName ?? "全部"}
                </Tag>
                <Tag tone="muted">{record.scopeLabel}</Tag>
              </span>
              <small>{record.planCode ?? "不限套餐"}</small>
            </span>
            <span className="vx-commercial-row__center">
              <strong>{record.discountLabel}</strong>
              <small>
                {formatCurrency(record.salePrice, record.currency)} / 原价{" "}
                {formatCurrency(record.originalPrice, record.currency)}
              </small>
            </span>
            <span className="vx-commercial-row__center">
              <strong>{formatNumber(record.redemptionCount)}</strong>
              <small>
                {formatCurrency(record.usedAmount, record.currency)} ·{" "}
                {formatNumber(record.tenantCount)} 租户
              </small>
            </span>
            <span className="vx-commercial-row__center">
              <Tag tone={statusTone(record.status)}>
                {statusLabel(record.status)}
              </Tag>
              <small>{record.ownerName}</small>
            </span>
            <span className="vx-commercial-row__center">
              <strong>{formatDate(record.startsAt)}</strong>
              <small>
                {record.endsAt ? formatDate(record.endsAt) : "长期"}
              </small>
            </span>
            <PromotionActionsMenu
              record={record}
              open={openMenuId === record.id}
              onToggle={() =>
                onOpenMenu(openMenuId === record.id ? "" : record.id)
              }
              onClose={onCloseMenu}
            />
          </div>
        );
      })}
    </div>
  );
}

function PromotionCards({
  records,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
}: {
  records: PromotionOperationRecord[];
  openMenuId: string | null;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
}) {
  return (
    <div
      className="vx-tenant-directory-cards vx-commercial-cards"
      aria-label="推广优惠卡片"
    >
      {records.map((record) => (
        <article
          key={record.id}
          className={joinClasses(
            "vx-tenant-directory-card",
            `vx-commercial-card--${statusTone(record.status)}`,
          )}
        >
          <header>
            <Icon name="sparkles" size="lg" fallback="placeholder" />
            <div>
              <strong>{record.promotionName}</strong>
              <span>
                {record.promotionCode} · {record.scopeLabel}
              </span>
            </div>
            <PromotionActionsMenu
              record={record}
              open={openMenuId === record.id}
              onToggle={() =>
                onOpenMenu(openMenuId === record.id ? "" : record.id)
              }
              onClose={onCloseMenu}
            />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Tag tone={statusTone(record.status)}>
              {statusLabel(record.status)}
            </Tag>
            <Tag tone={tierTone(record.tierName)}>
              {record.tierName ?? "全部"}
            </Tag>
            <Tag tone="muted">{typeLabel(record.promotionType)}</Tag>
          </div>
          <p className="vx-commercial-card__description">
            {record.description}
          </p>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{record.discountLabel}</b>
              <small>优惠</small>
            </span>
            <span>
              <b>{formatNumber(record.redemptionCount)}</b>
              <small>核销</small>
            </span>
            <span>
              <b>{formatCurrency(record.usedAmount, record.currency)}</b>
              <small>减免</small>
            </span>
          </div>
          <footer>
            <span>{record.ownerName}</span>
            <strong>{formatDate(record.updatedAt)}</strong>
          </footer>
        </article>
      ))}
    </div>
  );
}

export function PromotionsPage() {
  const [records, setRecords] = useState<PromotionOperationRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    let active = true;
    fetchPromotionOperations()
      .then((items) => {
        if (active) setRecords(items);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return records.filter((record) => {
      if (statusFilter !== "all" && record.status !== statusFilter)
        return false;
      if (typeFilter !== "all" && record.promotionType !== typeFilter)
        return false;
      if (
        normalizedQuery &&
        !promotionSearchText(record).includes(normalizedQuery)
      )
        return false;
      return true;
    });
  }, [query, records, statusFilter, typeFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const visibleRecords = filteredRecords.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  );
  const visibleRecordIds = useMemo(
    () => visibleRecords.map((record) => record.id),
    [visibleRecords],
  );
  const selectedVisibleRecordCount = visibleRecordIds.filter((id) =>
    selectedRecordIds.has(id),
  ).length;
  const isRecordPageSelected =
    visibleRecordIds.length > 0 &&
    selectedVisibleRecordCount === visibleRecordIds.length;
  const activeCount = records.filter(
    (record) => record.status === "active",
  ).length;
  const redemptionCount = records.reduce(
    (sum, record) => sum + record.redemptionCount,
    0,
  );
  const usedAmount = records.reduce(
    (sum, record) => sum + record.usedAmount,
    0,
  );

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [pageSize, query, statusFilter, typeFilter, viewMode]);

  function handleReset() {
    setQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  }

  function toggleRecordSelection(id: string, checked: boolean) {
    setSelectedRecordIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleRecordPageSelection(checked: boolean) {
    setSelectedRecordIds((current) => {
      const next = new Set(current);
      visibleRecordIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-promotions-page">
      <PageHeader
        icon="sparkles"
        eyebrow="产品与套餐"
        title="推广优惠"
        description="市场运营侧查看套餐优惠活动、价格折扣和核销效果；MVP 阶段基于套餐价格与账单减免自动生成台账。"
      />
      <section className="vx-tenant-summary" aria-label="推广优惠统计">
        <SummaryItem
          icon="sparkles"
          label="优惠活动"
          value={formatNumber(records.length)}
          tags={[`生效 ${formatNumber(activeCount)}`]}
        />
        <SummaryItem
          icon="check"
          label="核销次数"
          value={formatNumber(redemptionCount)}
          tags={[`筛选 ${formatNumber(filteredRecords.length)}`]}
          tone="green"
        />
        <SummaryItem
          icon="chart-bar"
          label="优惠金额"
          value={formatCurrency(usedAmount, "CNY")}
          tags={["账单减免"]}
          tone="green"
        />
        <SummaryItem
          icon="clock"
          label="待配置"
          value={formatNumber(
            records.filter((record) => record.promotionType === "coupon")
              .length,
          )}
          tags={["优惠码"]}
          tone="amber"
        />
      </section>
      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="推广优惠筛选">
          <ViewModeSwitch
            value={viewMode}
            onChange={setViewMode}
            ariaLabel="推广优惠展示方式"
          />
          <span className="vx-tenant-view-count">
            {formatNumber(filteredRecords.length)}
          </span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索优惠、套餐、负责人"
            className="vx-tenant-search vx-commercial-search"
            aria-label="搜索优惠"
          />
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <div className="vx-tenant-filters">
            <select
              className="vx-input vx-tenant-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              aria-label="优惠状态"
            >
              <option value="all">全部状态</option>
              <option value="active">生效中</option>
              <option value="scheduled">待开始</option>
              <option value="paused">已暂停</option>
              <option value="expired">已结束</option>
            </select>
            <select
              className="vx-input vx-tenant-select"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as TypeFilter)
              }
              aria-label="优惠类型"
            >
              <option value="all">全部类型</option>
              <option value="discount">套餐折扣</option>
              <option value="coupon">优惠码</option>
              <option value="campaign">活动</option>
            </select>
          </div>
          <ActionButton variant="outline" icon="plus" disabled>
            新建优惠
          </ActionButton>
        </section>
        <section className="vx-tenant-directory" aria-label="推广优惠清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}
          {visibleRecords.length ? (
            viewMode === "list" ? (
              <PromotionRows
                records={visibleRecords}
                startIndex={(activePage - 1) * pageSize}
                openMenuId={openMenuId}
                onOpenMenu={(id) => setOpenMenuId(id || null)}
                onCloseMenu={() => setOpenMenuId(null)}
                selectedRecordIds={selectedRecordIds}
                isPageSelected={isRecordPageSelected}
                onToggleRecord={toggleRecordSelection}
                onTogglePage={toggleRecordPageSelection}
              />
            ) : (
              <PromotionCards
                records={visibleRecords}
                openMenuId={openMenuId}
                onOpenMenu={(id) => setOpenMenuId(id || null)}
                onCloseMenu={() => setOpenMenuId(null)}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? "正在加载优惠" : "没有匹配的优惠"}
                description={
                  loading
                    ? "正在读取推广优惠台账。"
                    : "清空筛选条件后可查看全部优惠活动。"
                }
                action={
                  <ActionButton
                    variant="outline"
                    icon="x"
                    onClick={handleReset}
                  >
                    清空筛选
                  </ActionButton>
                }
              />
            </section>
          )}
          <footer className="vx-tenant-pagination">
            <span className="vx-tenant-pagination__total">
              共 {formatNumber(filteredRecords.length)} 条优惠记录
            </span>
            <div className="vx-tenant-pagination__actions">
              <PageSizePicker value={pageSize} onChange={setPageSize} />
              <div className="vx-tenant-pagination__pager">
                <Button
                  variant="outline"
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage(activePage - 1)}
                >
                  上一页
                </Button>
                <strong>
                  {activePage} / {pageCount}
                </strong>
                <Button
                  variant="outline"
                  disabled={activePage >= pageCount}
                  onClick={() => setCurrentPage(activePage + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
