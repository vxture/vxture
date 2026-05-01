"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@vxture/design-system";
import type { IconName } from "@vxture/design-system";
import { Button, Input } from "@/components/ui/primitives";
import { fetchPromotionRedemptionRecords } from "@/api/admin-bff";
import type {
  BillingBillStatus,
  PromotionRedemptionRecord,
  PromotionRedemptionStatus,
} from "@/entities/console";
import { ActionButton } from "@/modules/shared/ActionButton";
import { EmptyState } from "@/modules/shared/EmptyState";
import { PageHeader } from "@/modules/shared/PageHeader";
import { ViewModeSwitch } from "@/modules/shared/ViewModeSwitch";
import {
  formatDate,
  formatNumber,
  joinClasses,
  typeLabel,
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

type StatusFilter = "all" | PromotionRedemptionStatus;
type BillStatusFilter = "all" | BillingBillStatus;
type TierFilter = "all" | "free" | "pro" | "enterprise" | "other";

function redemptionStatusLabel(status: PromotionRedemptionStatus) {
  if (status === "redeemed") return "已核销";
  if (status === "reversed") return "已退回";
  return "已应用";
}

function redemptionStatusTone(status: PromotionRedemptionStatus) {
  if (status === "redeemed") return "normal";
  if (status === "reversed") return "danger";
  return "warning";
}

function redemptionStatusIcon(status: PromotionRedemptionStatus): IconName {
  if (status === "redeemed") return "check";
  if (status === "reversed") return "x";
  return "clock";
}

function billStatusLabel(status: BillingBillStatus) {
  if (status === "paying") return "支付中";
  if (status === "paid") return "已结清";
  if (status === "partial") return "部分收款";
  if (status === "cancelled") return "已作废";
  if (status === "overdue") return "逾期";
  return "待收款";
}

function billStatusTone(status: BillingBillStatus) {
  if (status === "paid") return "normal";
  if (status === "cancelled") return "muted";
  if (status === "overdue") return "danger";
  return "warning";
}

function tierFilterValue(record: PromotionRedemptionRecord): TierFilter {
  const tierName = (record.tierName ?? "").toLowerCase();
  if (tierName === "free") return "free";
  if (tierName === "pro") return "pro";
  if (tierName === "enterprise") return "enterprise";
  return "other";
}

function redemptionSearchText(record: PromotionRedemptionRecord) {
  return [
    record.redemptionNo,
    record.promotionCode,
    record.promotionName,
    record.tenantCode,
    record.tenantName,
    record.orderNo,
    record.billNo,
    record.servicePlanName,
    record.tierName,
    record.operatorName,
    record.remark,
    redemptionStatusLabel(record.status),
    billStatusLabel(record.billStatus),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function RedemptionActionsMenu({
  record,
  open,
  onToggle,
  onClose,
}: {
  record: PromotionRedemptionRecord;
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
        aria-label={`${record.redemptionNo} 核销操作`}
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
              router.push(`/billing/${encodeURIComponent(record.billId)}`);
            }}
          >
            <Icon name="arrow-right" size="xs" fallback="placeholder" />
            账单详情
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push(`/tenants/${encodeURIComponent(record.tenantId)}`);
            }}
          >
            <Icon name="buildings" size="xs" fallback="placeholder" />
            查看租户
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push("/orders");
            }}
          >
            <Icon name="table" size="xs" fallback="placeholder" />
            订单列表
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push("/promotions");
            }}
          >
            <Icon name="sparkles" size="xs" fallback="placeholder" />
            优惠活动
          </button>
        </div>
      ) : null}
    </div>
  );
}

function RedemptionRows({
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
  records: PromotionRedemptionRecord[];
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
      className="vx-tenant-directory-list vx-redemption-directory-list"
      role="region"
      aria-label="优惠核销清单"
    >
      <div className="vx-tenant-directory-list__header">
        <span>
          <input
            ref={pageSelectRef}
            type="checkbox"
            className="vx-model-select-checkbox"
            checked={isPageSelected}
            onChange={(event) => onTogglePage(event.target.checked)}
            aria-label="选择当前页核销记录"
          />
        </span>
        <span>序号</span>
        <span>核销记录</span>
        <span>租户</span>
        <span>账单</span>
        <span>优惠金额</span>
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
              "vx-redemption-operation-row",
              `vx-commercial-row--${redemptionStatusTone(record.status)}`,
              selected ? "vx-redemption-operation-row--selected" : undefined,
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
            <span className="vx-redemption-operation-row__select">
              <input
                type="checkbox"
                className="vx-model-select-checkbox"
                checked={selected}
                onChange={(event) =>
                  onToggleRecord(record.id, event.target.checked)
                }
                aria-label={`选择核销记录 ${record.redemptionNo}`}
              />
            </span>
            <span className="vx-tenant-directory-row__index">
              {formatNumber(startIndex + index + 1)}
            </span>
            <span className="vx-commercial-row__main">
              <button
                type="button"
                className="vx-model-name-button"
                onClick={() =>
                  router.push(`/billing/${encodeURIComponent(record.billId)}`)
                }
              >
                {record.redemptionNo}
              </button>
              <small>
                {record.promotionCode} · {record.promotionName}
              </small>
            </span>
            <span className="vx-commercial-row__tenant">
              <Icon
                name={record.tenantType === "company" ? "buildings" : "user"}
                size="sm"
                fallback="placeholder"
              />
              <span>
                <strong>{record.tenantName}</strong>
                <small>
                  {record.tenantCode} · {typeLabel(record.tenantType)}
                </small>
              </span>
            </span>
            <span className="vx-commercial-row__main">
              <span className="vx-tenant-directory-row__tag-line">
                <Tag tone={billStatusTone(record.billStatus)}>
                  {billStatusLabel(record.billStatus)}
                </Tag>
                <Tag tone={tierTone(record.tierName)}>
                  {record.tierName ?? "未关联"}
                </Tag>
              </span>
              <small>
                {record.billNo} · {record.orderNo ?? "未关联订单"}
              </small>
            </span>
            <span className="vx-commercial-row__center">
              <strong>
                {formatCurrency(record.discountAmount, record.currency)}
              </strong>
              <small>
                应付 {formatCurrency(record.payableAmount, record.currency)} /
                原价 {formatCurrency(record.orderAmount, record.currency)}
              </small>
            </span>
            <span className="vx-commercial-row__center">
              <span className="vx-commercial-status-line">
                <span
                  className={`vx-commercial-status-dot vx-commercial-status-dot--${redemptionStatusTone(record.status)}`}
                  role="img"
                  aria-label={redemptionStatusLabel(record.status)}
                >
                  <Icon
                    name={redemptionStatusIcon(record.status)}
                    size="xs"
                    fallback="placeholder"
                  />
                </span>
                <Tag tone={redemptionStatusTone(record.status)}>
                  {redemptionStatusLabel(record.status)}
                </Tag>
              </span>
              <small>{record.operatorName}</small>
            </span>
            <span className="vx-commercial-row__center">
              <strong>{formatDate(record.redeemedAt)}</strong>
              <small>{record.remark ?? "系统记录"}</small>
            </span>
            <RedemptionActionsMenu
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

function RedemptionCards({
  records,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
}: {
  records: PromotionRedemptionRecord[];
  openMenuId: string | null;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className="vx-tenant-directory-cards vx-commercial-cards"
      aria-label="优惠核销卡片"
    >
      {records.map((record) => (
        <article
          key={record.id}
          className={joinClasses(
            "vx-tenant-directory-card",
            `vx-commercial-card--${redemptionStatusTone(record.status)}`,
          )}
          role="button"
          tabIndex={0}
          onClick={() =>
            router.push(`/billing/${encodeURIComponent(record.billId)}`)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter")
              router.push(`/billing/${encodeURIComponent(record.billId)}`);
          }}
        >
          <header>
            <Icon name="sparkles" size="lg" fallback="placeholder" />
            <div>
              <strong>{record.redemptionNo}</strong>
              <span>
                {record.tenantName} · {record.promotionName}
              </span>
            </div>
            <RedemptionActionsMenu
              record={record}
              open={openMenuId === record.id}
              onToggle={() =>
                onOpenMenu(openMenuId === record.id ? "" : record.id)
              }
              onClose={onCloseMenu}
            />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Tag tone={redemptionStatusTone(record.status)}>
              {redemptionStatusLabel(record.status)}
            </Tag>
            <Tag tone={billStatusTone(record.billStatus)}>
              {billStatusLabel(record.billStatus)}
            </Tag>
            <Tag tone={tierTone(record.tierName)}>
              {record.tierName ?? "未关联"}
            </Tag>
          </div>
          <p className="vx-commercial-card__description">
            {record.billNo} ·{" "}
            {record.servicePlanName ?? record.orderNo ?? "未关联套餐"}
          </p>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{formatCurrency(record.discountAmount, record.currency)}</b>
              <small>优惠金额</small>
            </span>
            <span>
              <b>{formatCurrency(record.payableAmount, record.currency)}</b>
              <small>账单应付</small>
            </span>
            <span>
              <b>{formatDate(record.redeemedAt)}</b>
              <small>{record.operatorName}</small>
            </span>
          </div>
          <footer>
            <span>{record.promotionCode}</span>
            <strong>{record.orderNo ?? "未关联订单"}</strong>
          </footer>
        </article>
      ))}
    </div>
  );
}

export function PromotionRedemptionsPage() {
  const [records, setRecords] = useState<PromotionRedemptionRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [billStatusFilter, setBillStatusFilter] =
    useState<BillStatusFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPromotionRedemptionRecords()
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
      if (billStatusFilter !== "all" && record.billStatus !== billStatusFilter)
        return false;
      if (tierFilter !== "all" && tierFilterValue(record) !== tierFilter)
        return false;
      if (
        normalizedQuery &&
        !redemptionSearchText(record).includes(normalizedQuery)
      )
        return false;
      return true;
    });
  }, [billStatusFilter, query, records, statusFilter, tierFilter]);

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
  const discountAmount = records.reduce(
    (sum, record) => sum + record.discountAmount,
    0,
  );
  const redeemedCount = records.filter(
    (record) => record.status === "redeemed",
  ).length;
  const reversedCount = records.filter(
    (record) => record.status === "reversed",
  ).length;
  const pendingAmount = records
    .filter((record) => record.status === "applied")
    .reduce((sum, record) => sum + record.discountAmount, 0);

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [billStatusFilter, pageSize, query, statusFilter, tierFilter, viewMode]);

  function handleReset() {
    setQuery("");
    setStatusFilter("all");
    setBillStatusFilter("all");
    setTierFilter("all");
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
    <div className="vx-page-stack vx-tenant-management-page vx-redemptions-page">
      <PageHeader
        icon="check"
        eyebrow="商业与财务"
        title="优惠核销"
        description="运营侧查看账单减免、套餐优惠和核销状态；MVP 阶段基于账单 discount_amount 自动形成核销台账。"
      />

      <section className="vx-tenant-summary" aria-label="优惠核销统计">
        <SummaryItem
          icon="check"
          label="核销记录"
          value={formatNumber(records.length)}
          tags={[`筛选 ${formatNumber(filteredRecords.length)}`]}
        />
        <SummaryItem
          icon="chart-bar"
          label="减免金额"
          value={formatCurrency(discountAmount, "CNY")}
          tags={[`待核 ${formatCurrency(pendingAmount, "CNY")}`]}
          tone="green"
        />
        <SummaryItem
          icon="sparkles"
          label="已核销"
          value={formatNumber(redeemedCount)}
          tags={["账单已收"]}
          tone="green"
        />
        <SummaryItem
          icon="warning"
          label="已退回"
          value={formatNumber(reversedCount)}
          tags={["账单作废"]}
          tone={reversedCount ? "rose" : "green"}
        />
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="优惠核销筛选">
          <ViewModeSwitch
            value={viewMode}
            onChange={setViewMode}
            ariaLabel="优惠核销展示方式"
          />
          <span className="vx-tenant-view-count">
            {formatNumber(filteredRecords.length)}
          </span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索核销、租户、账单、套餐"
            className="vx-tenant-search vx-commercial-search"
            aria-label="搜索核销"
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
              aria-label="核销状态"
            >
              <option value="all">全部核销</option>
              <option value="applied">已应用</option>
              <option value="redeemed">已核销</option>
              <option value="reversed">已退回</option>
            </select>
            <select
              className="vx-input vx-tenant-select"
              value={billStatusFilter}
              onChange={(event) =>
                setBillStatusFilter(event.target.value as BillStatusFilter)
              }
              aria-label="账单状态"
            >
              <option value="all">全部账单</option>
              <option value="unpaid">待收款</option>
              <option value="paying">支付中</option>
              <option value="partial">部分收款</option>
              <option value="paid">已结清</option>
              <option value="overdue">逾期</option>
              <option value="cancelled">已作废</option>
            </select>
            <select
              className="vx-input vx-tenant-select"
              value={tierFilter}
              onChange={(event) =>
                setTierFilter(event.target.value as TierFilter)
              }
              aria-label="套餐版本"
            >
              <option value="all">全部套餐</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
              <option value="other">其他</option>
            </select>
          </div>
        </section>

        <section className="vx-tenant-directory" aria-label="优惠核销清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}
          {visibleRecords.length ? (
            viewMode === "list" ? (
              <RedemptionRows
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
              <RedemptionCards
                records={visibleRecords}
                openMenuId={openMenuId}
                onOpenMenu={(id) => setOpenMenuId(id || null)}
                onCloseMenu={() => setOpenMenuId(null)}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? "正在加载核销记录" : "没有匹配的核销记录"}
                description={
                  loading
                    ? "正在读取优惠核销台账。"
                    : "清空筛选条件后可查看全部核销记录。"
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
              共 {formatNumber(filteredRecords.length)} 条核销记录
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
