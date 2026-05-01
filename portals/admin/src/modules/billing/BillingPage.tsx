"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@vxture/design-system";
import type { IconName } from "@vxture/design-system";
import { Badge, Button, Input } from "@/components/ui/primitives";
import { fetchBillingRecords, syncOfflineInvoice } from "@/api/admin-bff";
import type {
  BillingBillStatus,
  BillingBillType,
  BillingInvoiceStatus,
  BillingRecord,
} from "@/entities/console";
import { ActionButton } from "@/modules/shared/ActionButton";
import { EmptyState } from "@/modules/shared/EmptyState";
import { PageHeader } from "@/modules/shared/PageHeader";
import { ViewModeSwitch } from "@/modules/shared/ViewModeSwitch";
import {
  canSyncOfflineInvoice,
  offlineInvoiceDisabledReason,
  OfflineInvoiceDialog,
} from "@/modules/billing/OfflineInvoiceDialog";
import {
  formatDate,
  formatNumber,
  joinClasses,
  typeLabel,
} from "@/modules/tenants/tenant-utils";

type ViewMode = "list" | "cards";
type BillStatusFilter = "all" | BillingBillStatus;
type InvoiceStatusFilter = "all" | BillingInvoiceStatus;
type BillTypeFilter = "all" | BillingBillType;
type TierFilter = "all" | "free" | "pro" | "enterprise" | "other";
type BillingExceptionFilter =
  | "all"
  | "attention"
  | "overdue_followup"
  | "discounted"
  | "adjust"
  | "supplement"
  | "cancelled"
  | "invoice_exception";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

function formatCurrency(
  value: number,
  currency: string,
  maximumFractionDigits = 0,
) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currency || "CNY",
    maximumFractionDigits,
  }).format(value);
}

function billStatusLabel(status: BillingBillStatus) {
  if (status === "paying") return "支付中";
  if (status === "paid") return "已结清";
  if (status === "partial") return "部分收款";
  if (status === "cancelled") return "已作废";
  if (status === "overdue") return "逾期";
  return "待收款";
}

function billStatusIcon(status: BillingBillStatus): IconName {
  if (status === "paid") return "check";
  if (status === "cancelled") return "x";
  if (status === "overdue") return "warning";
  return "clock";
}

function billTypeLabel(type: BillingBillType) {
  if (type === "adjust") return "调整单";
  if (type === "supplement") return "补录单";
  if (type === "prepaid") return "预付费";
  return "正常账单";
}

function invoiceStatusLabel(status: BillingInvoiceStatus) {
  if (status === "applying") return "申请中";
  if (status === "auditing") return "审核中";
  if (status === "issued") return "已开票";
  if (status === "sending") return "寄送中";
  if (status === "finished") return "已完成";
  if (status === "rejected") return "已驳回";
  if (status === "red") return "已红冲";
  return "未开票";
}

function billingExceptionTags(bill: BillingRecord) {
  const tags: Array<{
    key: string;
    label: string;
    tone: string;
    title?: string;
  }> = [];

  if (bill.billType === "adjust") {
    tags.push({
      key: "adjust",
      label: "调整单",
      tone: "adjust",
      title: bill.operationRemark ?? undefined,
    });
  }
  if (bill.billType === "supplement") {
    tags.push({
      key: "supplement",
      label: "补录单",
      tone: "supplement",
      title: bill.operationRemark ?? undefined,
    });
  }
  if (bill.discountAmount > 0) {
    tags.push({
      key: "discounted",
      label: "已减免",
      tone: "discount",
      title: `减免 ${formatCurrency(bill.discountAmount, bill.currency)}`,
    });
  }
  if (bill.billStatus === "overdue") {
    tags.push({
      key: "overdue_followup",
      label: bill.operationRemark ? "逾期跟进" : "逾期待跟进",
      tone: "overdue",
      title: bill.operationRemark ?? "当前账单已逾期，尚未登记跟进原因。",
    });
  }
  if (bill.billStatus === "cancelled") {
    tags.push({
      key: "cancelled",
      label: "已作废",
      tone: "cancelled",
      title: bill.operationRemark ?? undefined,
    });
  }
  if (bill.invoiceStatus === "red" || bill.invoiceStatus === "rejected") {
    tags.push({
      key: "invoice_exception",
      label: bill.invoiceStatus === "red" ? "发票红冲" : "发票驳回",
      tone: "invoice",
      title: bill.invoiceNo ?? undefined,
    });
  }

  return tags;
}

function hasBillingException(bill: BillingRecord) {
  return billingExceptionTags(bill).length > 0;
}

function matchesBillingExceptionFilter(
  bill: BillingRecord,
  filter: BillingExceptionFilter,
) {
  if (filter === "all") return true;
  if (filter === "attention") return hasBillingException(bill);
  if (filter === "overdue_followup") return bill.billStatus === "overdue";
  if (filter === "discounted") return bill.discountAmount > 0;
  if (filter === "adjust") return bill.billType === "adjust";
  if (filter === "supplement") return bill.billType === "supplement";
  if (filter === "cancelled") return bill.billStatus === "cancelled";
  return bill.invoiceStatus === "red" || bill.invoiceStatus === "rejected";
}

function cycleLabel(cycle: string) {
  if (cycle === "yearly") return "年度";
  if (cycle === "monthly") return "月度";
  if (cycle === "once") return "一次性";
  return cycle || "未设置";
}

function tierFilterValue(record: BillingRecord): TierFilter {
  const tierName = (record.tierName ?? "").toLowerCase();
  if (tierName === "free" || record.tierName === "Free") return "free";
  if (tierName === "pro" || record.tierName === "Pro") return "pro";
  if (tierName === "enterprise" || record.tierName === "Enterprise")
    return "enterprise";
  return record.tierName ? "other" : "other";
}

function billingSearchText(record: BillingRecord) {
  return [
    record.id,
    record.billNo,
    record.orderNo,
    record.invoiceNo,
    record.tenantCode,
    record.tenantName,
    record.region,
    record.industry,
    record.servicePlanName,
    record.tierName,
    record.operatorName,
    record.operationRemark,
    billTypeLabel(record.billType),
    billStatusLabel(record.billStatus),
    invoiceStatusLabel(record.invoiceStatus),
    record.billStatus,
    record.invoiceStatus,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function SummaryItem({
  icon,
  label,
  value,
  tags,
  tone = "blue",
}: {
  icon: IconName;
  label: string;
  value: string;
  tags?: string[];
  tone?: "blue" | "green" | "amber" | "rose";
}) {
  return (
    <article className={`vx-tenant-summary__item vx-tenant-tone--${tone}`}>
      <Icon name={icon} size="lg" fallback="placeholder" />
      <div>
        <span>{label}</span>
        <p>
          <strong>{value}</strong>
          {tags?.map((tag) => (
            <em key={tag}>{tag}</em>
          ))}
        </p>
      </div>
    </article>
  );
}

function PageSizePicker({
  value,
  onChange,
}: {
  value: PageSize;
  onChange: (value: PageSize) => void;
}) {
  return (
    <div className="vx-tenant-page-size" aria-label="每页条数">
      {PAGE_SIZE_OPTIONS.map((option) => (
        <span key={option}>
          <button
            type="button"
            className={value === option ? "is-active" : undefined}
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

function BillingActionsMenu({
  bill,
  open,
  onToggle,
  onClose,
  onSyncInvoice,
}: {
  bill: BillingRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSyncInvoice: (bill: BillingRecord) => void;
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
        aria-label={`${bill.billNo} 账单操作`}
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
              router.push(`/billing/${encodeURIComponent(bill.id)}`);
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
              router.push(`/tenants/${encodeURIComponent(bill.tenantId)}`);
            }}
          >
            <Icon name="buildings" size="xs" fallback="placeholder" />
            查看租户
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!bill.subscriptionId}
            onClick={() => {
              if (!bill.subscriptionId) return;
              onClose();
              router.push(
                `/subscriptions/${encodeURIComponent(bill.subscriptionId)}`,
              );
            }}
          >
            <Icon name="star" size="xs" fallback="placeholder" />
            查看订阅
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!bill.subscriptionId}
            onClick={() => {
              if (!bill.subscriptionId) return;
              onClose();
              router.push(`/orders/${encodeURIComponent(bill.subscriptionId)}`);
            }}
          >
            <Icon name="table" size="xs" fallback="placeholder" />
            查看订单
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!canSyncOfflineInvoice(bill)}
            title={offlineInvoiceDisabledReason(bill) ?? undefined}
            onClick={() => {
              onClose();
              onSyncInvoice(bill);
            }}
          >
            <Icon name="key" size="xs" fallback="placeholder" />
            登记发票
          </button>
        </div>
      ) : null}
    </div>
  );
}

function BillingListRows({
  bills,
  startIndex,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
  onSyncInvoice,
  selectedBillIds,
  isPageSelected,
  onToggleBill,
  onTogglePage,
}: {
  bills: BillingRecord[];
  startIndex: number;
  openMenuId: string | null;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  onSyncInvoice: (bill: BillingRecord) => void;
  selectedBillIds: Set<string>;
  isPageSelected: boolean;
  onToggleBill: (id: string, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
}) {
  const router = useRouter();
  const pageSelectRef = useRef<HTMLInputElement | null>(null);
  const selectedOnPage = bills.filter((bill) =>
    selectedBillIds.has(bill.id),
  ).length;

  useEffect(() => {
    if (pageSelectRef.current) {
      pageSelectRef.current.indeterminate =
        selectedOnPage > 0 && selectedOnPage < bills.length;
    }
  }, [bills.length, selectedOnPage]);

  return (
    <div
      className="vx-tenant-directory-list vx-billing-directory-list"
      role="region"
      aria-label="账单发票清单"
    >
      <div className="vx-tenant-directory-list__header">
        <span>
          <input
            ref={pageSelectRef}
            type="checkbox"
            className="vx-model-select-checkbox"
            checked={isPageSelected}
            onChange={(event) => onTogglePage(event.target.checked)}
            aria-label="选择当前页账单"
          />
        </span>
        <span>序号</span>
        <span>账单</span>
        <span>租户</span>
        <span>订阅套餐</span>
        <span>金额</span>
        <span>处理</span>
        <span>收款</span>
        <span>发票</span>
        <span>操作</span>
      </div>
      {bills.map((bill, index) => {
        const selected = selectedBillIds.has(bill.id);

        return (
          <div
            key={bill.id}
            className={joinClasses(
              "vx-tenant-directory-row",
              "vx-billing-operation-row",
              `vx-billing-row--${bill.billStatus}`,
              selected ? "vx-billing-operation-row--selected" : undefined,
            )}
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (
                target.closest(
                  'button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]',
                )
              )
                return;
              onToggleBill(bill.id, !selected);
            }}
          >
            <span className="vx-billing-operation-row__select">
              <input
                type="checkbox"
                className="vx-model-select-checkbox"
                checked={selected}
                onChange={(event) =>
                  onToggleBill(bill.id, event.target.checked)
                }
                aria-label={`选择账单 ${bill.billNo}`}
              />
            </span>
            <span className="vx-tenant-directory-row__index">
              {formatNumber(startIndex + index + 1)}
            </span>
            <span className="vx-billing-row__bill">
              <span className="vx-tenant-directory-row__title-line">
                <button
                  type="button"
                  className="vx-model-name-button"
                  onClick={() =>
                    router.push(`/billing/${encodeURIComponent(bill.id)}`)
                  }
                >
                  {bill.billNo}
                </button>
              </span>
              <small>
                {cycleLabel(bill.billCycle)} · {formatDate(bill.cycleStartDate)}{" "}
                - {formatDate(bill.cycleEndDate)}
              </small>
            </span>
            <span className="vx-billing-row__tenant">
              <Icon
                name={bill.tenantType === "company" ? "buildings" : "user"}
                size="sm"
                fallback="placeholder"
              />
              <span>
                <strong>{bill.tenantName}</strong>
                <small>
                  {bill.tenantCode} · {typeLabel(bill.tenantType)}
                </small>
              </span>
            </span>
            <span className="vx-billing-row__plan">
              <span className="vx-tenant-directory-row__tag-line">
                <Badge
                  className={`vx-tenant-pill vx-billing-pill--tier-${tierFilterValue(bill)}`}
                >
                  {bill.tierName ?? "未关联"}
                </Badge>
              </span>
              <small>
                {bill.servicePlanName ?? bill.orderNo ?? "未关联订阅"}
              </small>
            </span>
            <span className="vx-billing-row__amount">
              <strong>
                {formatCurrency(bill.payableAmount, bill.currency)}
              </strong>
              <small>
                {bill.discountAmount > 0
                  ? `原价 ${formatCurrency(bill.totalAmount, bill.currency)} · 减免 ${formatCurrency(bill.discountAmount, bill.currency)}`
                  : `原价 ${formatCurrency(bill.totalAmount, bill.currency)}`}
              </small>
            </span>
            <span className="vx-billing-row__exception">
              {billingExceptionTags(bill).length ? (
                <span className="vx-billing-exception-tags">
                  {billingExceptionTags(bill).map((tag) => (
                    <Badge
                      key={tag.key}
                      className={`vx-tenant-pill vx-billing-exception-pill vx-billing-exception-pill--${tag.tone}`}
                      title={tag.title}
                    >
                      {tag.label}
                    </Badge>
                  ))}
                </span>
              ) : (
                <small className="vx-billing-exception-empty">-</small>
              )}
              {bill.operationRemark ? (
                <small title={bill.operationRemark}>
                  {bill.operationRemark}
                </small>
              ) : null}
            </span>
            <span className="vx-billing-row__payment">
              <span className="vx-billing-status-line">
                <span
                  className={`vx-billing-status-dot vx-billing-status-dot--${bill.billStatus}`}
                  role="img"
                  aria-label={billStatusLabel(bill.billStatus)}
                >
                  <Icon
                    name={billStatusIcon(bill.billStatus)}
                    size="xs"
                    fallback="placeholder"
                  />
                </span>
                <Badge
                  className={`vx-tenant-pill vx-billing-pill--${bill.billStatus}`}
                >
                  {billStatusLabel(bill.billStatus)}
                </Badge>
              </span>
              <small>
                已收 {formatCurrency(bill.paidAmount, bill.currency)}
              </small>
            </span>
            <span className="vx-billing-row__invoice">
              <Badge
                className={`vx-tenant-pill vx-billing-pill--invoice-${bill.invoiceStatus}`}
              >
                {invoiceStatusLabel(bill.invoiceStatus)}
              </Badge>
              <small>
                {bill.invoiceNo ??
                  `已登记 ${formatCurrency(bill.invoicedAmount, bill.currency)}`}
              </small>
            </span>
            <BillingActionsMenu
              bill={bill}
              open={openMenuId === bill.id}
              onToggle={() => onOpenMenu(openMenuId === bill.id ? "" : bill.id)}
              onClose={onCloseMenu}
              onSyncInvoice={onSyncInvoice}
            />
          </div>
        );
      })}
    </div>
  );
}

function BillingCards({
  bills,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
  onSyncInvoice,
}: {
  bills: BillingRecord[];
  openMenuId: string | null;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  onSyncInvoice: (bill: BillingRecord) => void;
}) {
  const router = useRouter();

  return (
    <div
      className="vx-tenant-directory-cards vx-billing-cards"
      aria-label="账单发票卡片"
    >
      {bills.map((bill) => (
        <article
          key={bill.id}
          className={joinClasses(
            "vx-tenant-directory-card",
            `vx-billing-card--${bill.billStatus}`,
          )}
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/billing/${encodeURIComponent(bill.id)}`)}
          onKeyDown={(event) => {
            if (event.key === "Enter")
              router.push(`/billing/${encodeURIComponent(bill.id)}`);
          }}
        >
          <header>
            <Icon name="key" size="lg" fallback="placeholder" />
            <div>
              <strong>{bill.billNo}</strong>
              <span>
                {bill.tenantName} · {bill.tierName ?? "未关联套餐"}
              </span>
            </div>
            <BillingActionsMenu
              bill={bill}
              open={openMenuId === bill.id}
              onToggle={() => onOpenMenu(openMenuId === bill.id ? "" : bill.id)}
              onClose={onCloseMenu}
              onSyncInvoice={onSyncInvoice}
            />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Badge
              className={`vx-tenant-pill vx-billing-pill--${bill.billStatus}`}
            >
              {billStatusLabel(bill.billStatus)}
            </Badge>
            <Badge
              className={`vx-tenant-pill vx-billing-pill--invoice-${bill.invoiceStatus}`}
            >
              {invoiceStatusLabel(bill.invoiceStatus)}
            </Badge>
            {billingExceptionTags(bill).map((tag) => (
              <Badge
                key={tag.key}
                className={`vx-tenant-pill vx-billing-exception-pill vx-billing-exception-pill--${tag.tone}`}
                title={tag.title}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
          <p className="vx-billing-card__plan">
            {bill.servicePlanName ?? bill.orderNo ?? "未关联订阅"}
          </p>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{formatCurrency(bill.payableAmount, bill.currency)}</b>
              <small>账单应收</small>
            </span>
            <span>
              <b>{formatCurrency(bill.paidAmount, bill.currency)}</b>
              <small>已收金额</small>
            </span>
            <span>
              <b>{formatCurrency(bill.invoicedAmount, bill.currency)}</b>
              <small>已开票</small>
            </span>
          </div>
          <footer>
            <span>
              {formatDate(bill.cycleStartDate)} -{" "}
              {formatDate(bill.cycleEndDate)}
            </span>
            <strong>{bill.operatorName}</strong>
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
      <span className="vx-tenant-pagination__total">
        共 {formatNumber(total)} 条账单记录
      </span>
      <div className="vx-tenant-pagination__actions">
        <PageSizePicker value={pageSize} onChange={onPageSizeChange} />
        <div className="vx-tenant-pagination__pager">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            上一页
          </Button>
          <strong>
            {currentPage} / {pageCount}
          </strong>
          <Button
            variant="outline"
            disabled={currentPage >= pageCount}
            onClick={() => onPageChange(currentPage + 1)}
          >
            下一页
          </Button>
        </div>
      </div>
    </footer>
  );
}

export function BillingPage() {
  const [bills, setBills] = useState<BillingRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [billStatusFilter, setBillStatusFilter] =
    useState<BillStatusFilter>("all");
  const [invoiceStatusFilter, setInvoiceStatusFilter] =
    useState<InvoiceStatusFilter>("all");
  const [billTypeFilter, setBillTypeFilter] = useState<BillTypeFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [exceptionFilter, setExceptionFilter] =
    useState<BillingExceptionFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);
  const [invoiceTarget, setInvoiceTarget] = useState<BillingRecord | null>(
    null,
  );
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<string | null>(
    null,
  );
  const [selectedBillIds, setSelectedBillIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchBillingRecords()
      .then((records) => {
        if (active) setBills(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredBills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return bills.filter((bill) => {
      if (billStatusFilter !== "all" && bill.billStatus !== billStatusFilter)
        return false;
      if (
        invoiceStatusFilter !== "all" &&
        bill.invoiceStatus !== invoiceStatusFilter
      )
        return false;
      if (billTypeFilter !== "all" && bill.billType !== billTypeFilter)
        return false;
      if (tierFilter !== "all" && tierFilterValue(bill) !== tierFilter)
        return false;
      if (!matchesBillingExceptionFilter(bill, exceptionFilter)) return false;
      if (normalizedQuery && !billingSearchText(bill).includes(normalizedQuery))
        return false;
      return true;
    });
  }, [
    billStatusFilter,
    billTypeFilter,
    bills,
    exceptionFilter,
    invoiceStatusFilter,
    query,
    tierFilter,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredBills.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const visibleBills = filteredBills.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  );
  const visibleBillIds = useMemo(
    () => visibleBills.map((bill) => bill.id),
    [visibleBills],
  );
  const selectedVisibleBillCount = visibleBillIds.filter((id) =>
    selectedBillIds.has(id),
  ).length;
  const isBillPageSelected =
    visibleBillIds.length > 0 &&
    selectedVisibleBillCount === visibleBillIds.length;
  const receivableAmount = bills.reduce(
    (sum, item) => sum + item.payableAmount,
    0,
  );
  const paidAmount = bills.reduce((sum, item) => sum + item.paidAmount, 0);
  const pendingCount = bills.filter(
    (item) =>
      item.billStatus === "unpaid" ||
      item.billStatus === "paying" ||
      item.billStatus === "partial" ||
      item.billStatus === "overdue",
  ).length;
  const invoicePendingCount = bills.filter(
    (item) =>
      item.invoiceStatus === "none" ||
      item.invoiceStatus === "applying" ||
      item.invoiceStatus === "auditing",
  ).length;
  const invoicedAmount = bills.reduce(
    (sum, item) => sum + item.invoicedAmount,
    0,
  );
  const exceptionCount = bills.filter(hasBillingException).length;
  const discountedAmount = bills.reduce(
    (sum, item) => sum + item.discountAmount,
    0,
  );
  const exceptionBillCount = bills.filter(
    (item) => item.billType === "adjust" || item.billType === "supplement",
  ).length;

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [
    billStatusFilter,
    billTypeFilter,
    exceptionFilter,
    invoiceStatusFilter,
    pageSize,
    query,
    tierFilter,
    viewMode,
  ]);

  function handleReset() {
    setQuery("");
    setBillStatusFilter("all");
    setInvoiceStatusFilter("all");
    setBillTypeFilter("all");
    setTierFilter("all");
    setExceptionFilter("all");
  }

  function handleOpenMenu(id: string) {
    setOpenMenuId(id || null);
  }

  function toggleBillSelection(id: string, checked: boolean) {
    setSelectedBillIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleBillPageSelection(checked: boolean) {
    setSelectedBillIds((current) => {
      const next = new Set(current);
      visibleBillIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }

  function requestInvoiceSync(bill: BillingRecord) {
    setOpenMenuId(null);
    setOperationError(null);
    setOperationFeedback(null);
    setInvoiceTarget(bill);
  }

  async function handleSyncOfflineInvoice(
    payload: Parameters<typeof syncOfflineInvoice>[1],
  ) {
    if (!invoiceTarget) return;

    setSubmittingInvoice(true);
    setOperationError(null);

    try {
      await syncOfflineInvoice(invoiceTarget.id, payload);
      const records = await fetchBillingRecords();
      setBills(records);
      setOperationFeedback("线下发票已完成同步登记。");
      setInvoiceTarget(null);
    } catch (error) {
      setOperationError(
        error instanceof Error
          ? error.message
          : "线下发票登记失败，请稍后重试。",
      );
    } finally {
      setSubmittingInvoice(false);
    }
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-billing-page">
      <PageHeader
        icon="key"
        eyebrow="商业与财务"
        title="账单发票"
        description="运营侧查看租户账单、收款进度和线下发票处理结果；当前仅支持人工同步登记，不调用在线开票接口。"
      />

      <section className="vx-tenant-summary" aria-label="账单发票统计">
        <SummaryItem
          icon="key"
          label="账单总数"
          value={formatNumber(bills.length)}
          tags={[
            `筛选 ${formatNumber(filteredBills.length)}`,
            `异常 ${formatNumber(exceptionCount)}`,
          ]}
        />
        <SummaryItem
          icon="clock"
          label="待收款"
          value={formatNumber(pendingCount)}
          tags={[
            `逾期 ${formatNumber(bills.filter((item) => item.billStatus === "overdue").length)}`,
          ]}
          tone={pendingCount ? "amber" : "green"}
        />
        <SummaryItem
          icon="chart-bar"
          label="应收金额"
          value={formatCurrency(receivableAmount, "CNY")}
          tags={[
            `已收 ${formatCurrency(paidAmount, "CNY")}`,
            `减免 ${formatCurrency(discountedAmount, "CNY")}`,
          ]}
          tone="green"
        />
        <SummaryItem
          icon="table"
          label="开票进度"
          value={formatCurrency(invoicedAmount, "CNY")}
          tags={[
            `待处理 ${formatNumber(invoicePendingCount)}`,
            `调整 ${formatNumber(exceptionBillCount)}`,
          ]}
          tone={invoicePendingCount ? "amber" : "green"}
        />
      </section>

      {operationFeedback ? (
        <div className="vx-subscription-operation-feedback">
          {operationFeedback}
        </div>
      ) : null}

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="账单筛选">
          <ViewModeSwitch
            value={viewMode}
            onChange={setViewMode}
            ariaLabel="账单展示方式"
          />
          <span className="vx-tenant-view-count">
            {formatNumber(filteredBills.length)}
          </span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索账单、租户、订单、发票"
            className="vx-tenant-search vx-billing-search"
            aria-label="搜索账单"
          />
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <div className="vx-tenant-filters">
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
              <option value="cancelled">已取消</option>
            </select>
            <select
              className="vx-input vx-tenant-select"
              value={invoiceStatusFilter}
              onChange={(event) =>
                setInvoiceStatusFilter(
                  event.target.value as InvoiceStatusFilter,
                )
              }
              aria-label="发票状态"
            >
              <option value="all">全部发票</option>
              <option value="none">未开票</option>
              <option value="applying">申请中</option>
              <option value="auditing">审核中</option>
              <option value="issued">已开票</option>
              <option value="sending">寄送中</option>
              <option value="finished">已完成</option>
              <option value="rejected">已驳回</option>
              <option value="red">已红冲</option>
            </select>
            <select
              className="vx-input vx-tenant-select"
              value={billTypeFilter}
              onChange={(event) =>
                setBillTypeFilter(event.target.value as BillTypeFilter)
              }
              aria-label="账单类型"
            >
              <option value="all">全部类型</option>
              <option value="normal">正常账单</option>
              <option value="adjust">调整单</option>
              <option value="supplement">补录单</option>
              <option value="prepaid">预付费</option>
            </select>
            <select
              className="vx-input vx-tenant-select"
              value={exceptionFilter}
              onChange={(event) =>
                setExceptionFilter(event.target.value as BillingExceptionFilter)
              }
              aria-label="处理类型"
            >
              <option value="all">全部处理</option>
              <option value="attention">需关注</option>
              <option value="overdue_followup">逾期跟进</option>
              <option value="discounted">应收减免</option>
              <option value="adjust">调整单</option>
              <option value="supplement">补录单</option>
              <option value="cancelled">已作废</option>
              <option value="invoice_exception">发票异常</option>
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

        <section className="vx-tenant-directory" aria-label="账单清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {visibleBills.length ? (
            viewMode === "list" ? (
              <BillingListRows
                bills={visibleBills}
                startIndex={(activePage - 1) * pageSize}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onSyncInvoice={requestInvoiceSync}
                selectedBillIds={selectedBillIds}
                isPageSelected={isBillPageSelected}
                onToggleBill={toggleBillSelection}
                onTogglePage={toggleBillPageSelection}
              />
            ) : (
              <BillingCards
                bills={visibleBills}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onSyncInvoice={requestInvoiceSync}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? "正在加载账单" : "没有匹配的账单"}
                description={
                  loading
                    ? "正在读取账单、收款和发票登记数据。"
                    : "清空筛选条件后可查看全部账单记录。"
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

          <Pagination
            currentPage={activePage}
            pageCount={pageCount}
            total={filteredBills.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) =>
              setCurrentPage(Math.min(Math.max(page, 1), pageCount))
            }
          />
        </section>
      </div>

      {invoiceTarget ? (
        <OfflineInvoiceDialog
          bill={invoiceTarget}
          busy={submittingInvoice}
          error={operationError}
          onCancel={() => {
            if (!submittingInvoice) setInvoiceTarget(null);
          }}
          onSubmit={handleSyncOfflineInvoice}
        />
      ) : null}
    </div>
  );
}
