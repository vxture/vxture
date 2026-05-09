"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@vxture/design-system";
import type { IconName } from "@vxture/design-system";
import { Badge, Button, Checkbox, Input, NativeSelect } from "@vxture/design-system";
import {
  fetchInvoiceLedgerRecords,
  submitBillingInvoiceReceiptAction,
} from "@/api/admin-bff";
import type {
  BillingInvoiceLedgerRecord,
  BillingInvoiceReceiptAction,
  BillingInvoiceStatus,
  BillingInvoiceTaxType,
  BillingInvoiceType,
} from "@/entities/console";
import { ActionButton } from "@/modules/shared/ActionButton";
import { EmptyState } from "@/modules/shared/EmptyState";
import { PageHeader } from "@/modules/shared/PageHeader";
import { ViewModeSwitch } from "@/modules/shared/ViewModeSwitch";
import {
  canRunInvoiceReceiptAction,
  InvoiceReceiptActionDialog,
  invoiceReceiptActionDisabledReason,
  invoiceReceiptActionLabel,
} from "@/modules/billing/InvoiceReceiptActionDialog";
import {
  formatDate,
  formatNumber,
  joinClasses,
  typeLabel,
} from "@/modules/tenants/tenant-utils";

type ViewMode = "list" | "cards";
type InvoiceStatusFilter =
  | "all"
  | BillingInvoiceStatus
  | "active"
  | "exception";
type InvoiceTypeFilter = "all" | BillingInvoiceType;
type InvoiceTaxFilter = "all" | BillingInvoiceTaxType;
type DeliveryFilter = "all" | "not_sent" | "sent" | "finished";

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

function invoiceTypeLabel(type: BillingInvoiceType) {
  if (type === "special_vat") return "增值税专票";
  if (type === "normal_vat") return "增值税普票";
  if (type === "electronic") return "电子发票";
  if (type === "paper") return "纸质发票";
  return "其他";
}

function taxTypeLabel(type: BillingInvoiceTaxType) {
  if (type === "enterprise") return "企业";
  if (type === "individual") return "个人";
  if (type === "government") return "政府/事业单位";
  return "其他";
}

function billTypeLabel(type: string) {
  if (type === "adjust") return "调整单";
  if (type === "supplement") return "补录单";
  if (type === "prepaid") return "预付费";
  return "正常账单";
}

function billStatusLabel(status: string) {
  if (status === "paid") return "已结清";
  if (status === "partial") return "部分收款";
  if (status === "paying") return "支付中";
  if (status === "cancelled") return "已作废";
  if (status === "overdue") return "逾期";
  return "待收款";
}

function invoiceStatusIcon(status: BillingInvoiceStatus): IconName {
  if (status === "finished") return "check";
  if (status === "red" || status === "rejected") return "warning";
  if (status === "sending") return "table";
  return "key";
}

function invoiceSearchText(invoice: BillingInvoiceLedgerRecord) {
  return [
    invoice.id,
    invoice.invoiceNo,
    invoice.invoiceTitle,
    invoice.taxNo,
    invoice.invoiceCode,
    invoice.invoiceElectronicNo,
    invoice.expressCompany,
    invoice.expressNo,
    invoice.billNo,
    invoice.orderNo,
    invoice.tenantCode,
    invoice.tenantName,
    invoice.region,
    invoice.industry,
    invoice.servicePlanName,
    invoice.tierName,
    invoice.auditorName,
    invoice.statusRemark,
    invoiceStatusLabel(invoice.invoiceStatus),
    invoiceTypeLabel(invoice.invoiceType),
    taxTypeLabel(invoice.invoiceTaxType),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesStatusFilter(
  invoice: BillingInvoiceLedgerRecord,
  filter: InvoiceStatusFilter,
) {
  if (filter === "all") return true;
  if (filter === "active")
    return (
      invoice.invoiceStatus === "issued" || invoice.invoiceStatus === "sending"
    );
  if (filter === "exception")
    return (
      invoice.invoiceStatus === "red" || invoice.invoiceStatus === "rejected"
    );
  return invoice.invoiceStatus === filter;
}

function matchesDeliveryFilter(
  invoice: BillingInvoiceLedgerRecord,
  filter: DeliveryFilter,
) {
  if (filter === "all") return true;
  if (filter === "not_sent")
    return invoice.invoiceStatus === "issued" && !invoice.expressNo;
  if (filter === "sent")
    return invoice.invoiceStatus === "sending" || Boolean(invoice.expressNo);
  return invoice.invoiceStatus === "finished";
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
          <Button
            variant={value === option ? "secondary" : "ghost"}
            size="sm"
            className={value === option ? "is-active" : undefined}
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

function InvoiceActionsMenu({
  invoice,
  open,
  onToggle,
  onClose,
  onReceiptAction,
}: {
  invoice: BillingInvoiceLedgerRecord;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onReceiptAction: (
    invoice: BillingInvoiceLedgerRecord,
    action: BillingInvoiceReceiptAction,
  ) => void;
}) {
  const router = useRouter();

  return (
    <div
      className="vx-tenant-actions"
      onClick={(event) => event.stopPropagation()}
      onMouseLeave={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        className="vx-tenant-actions__trigger"
        aria-label={`${invoice.invoiceNo} 发票操作`}
        title="操作"
        onClick={onToggle}
      >
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </Button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <Button
            variant="ghost"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push(`/billing/${encodeURIComponent(invoice.billId)}`);
            }}
          >
            <Icon name="arrow-right" size="xs" fallback="placeholder" />
            账单详情
          </Button>
          <Button
            variant="ghost"
            role="menuitem"
            onClick={() => {
              onClose();
              router.push(`/tenants/${encodeURIComponent(invoice.tenantId)}`);
            }}
          >
            <Icon name="buildings" size="xs" fallback="placeholder" />
            查看租户
          </Button>
          {(["update_shipping", "finish", "red"] as const).map((action) => (
            <Button
              key={action}
              variant="ghost"
              role="menuitem"
              className={
                action === "red"
                  ? "vx-subscription-menu-action--danger"
                  : undefined
              }
              disabled={!canRunInvoiceReceiptAction(action, invoice)}
              title={
                invoiceReceiptActionDisabledReason(action, invoice) ?? undefined
              }
              onClick={() => {
                onClose();
                onReceiptAction(invoice, action);
              }}
            >
              <Icon
                name={
                  action === "red"
                    ? "warning"
                    : action === "finish"
                      ? "check"
                      : "table"
                }
                size="xs"
                fallback="placeholder"
              />
              {invoiceReceiptActionLabel(action)}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InvoiceListRows({
  invoices,
  startIndex,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
  onReceiptAction,
  selectedInvoiceIds,
  isPageSelected,
  onToggleInvoice,
  onTogglePage,
}: {
  invoices: BillingInvoiceLedgerRecord[];
  startIndex: number;
  openMenuId: string | null;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  onReceiptAction: (
    invoice: BillingInvoiceLedgerRecord,
    action: BillingInvoiceReceiptAction,
  ) => void;
  selectedInvoiceIds: Set<string>;
  isPageSelected: boolean;
  onToggleInvoice: (id: string, checked: boolean) => void;
  onTogglePage: (checked: boolean) => void;
}) {
  const router = useRouter();
  const selectedOnPage = invoices.filter((invoice) =>
    selectedInvoiceIds.has(invoice.id),
  ).length;

  return (
    <div
      className="vx-tenant-directory-list vx-invoice-directory-list"
      role="region"
      aria-label="线下发票台账"
    >
      <div className="vx-tenant-directory-list__header">
        <span>
          <Checkbox
            className="vx-model-select-checkbox"
            checked={isPageSelected ? true : selectedOnPage > 0 ? "indeterminate" : false}
            onCheckedChange={(value) => onTogglePage(value === true)}
            aria-label="选择当前页发票"
          />
        </span>
        <span>序号</span>
        <span>发票</span>
        <span>租户</span>
        <span>账单</span>
        <span>金额</span>
        <span>状态</span>
        <span>寄送</span>
        <span>操作</span>
      </div>
      {invoices.map((invoice, index) => {
        const selected = selectedInvoiceIds.has(invoice.id);

        return (
          <div
            key={invoice.id}
            className={joinClasses(
              "vx-tenant-directory-row",
              "vx-invoice-operation-row",
              `vx-invoice-row--${invoice.invoiceStatus}`,
              selected ? "vx-invoice-operation-row--selected" : undefined,
            )}
            onClick={(event) => {
              const target = event.target as HTMLElement;
              if (
                target.closest(
                  'button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]',
                )
              )
                return;
              onToggleInvoice(invoice.id, !selected);
            }}
          >
            <span className="vx-invoice-operation-row__select">
              <Checkbox
                className="vx-model-select-checkbox"
                checked={selected}
                onCheckedChange={(value) => onToggleInvoice(invoice.id, value === true)}
                aria-label={`选择发票 ${invoice.invoiceNo}`}
              />
            </span>
            <span className="vx-tenant-directory-row__index">
              {formatNumber(startIndex + index + 1)}
            </span>
            <span className="vx-invoice-row__invoice">
              <span className="vx-tenant-directory-row__title-line">
                <Button
                  variant="link"
                  className="vx-model-name-button"
                  onClick={() =>
                    router.push(
                      `/billing/${encodeURIComponent(invoice.billId)}`,
                    )
                  }
                >
                  {invoice.invoiceNo}
                </Button>
              </span>
              <small>
                {invoice.invoiceTitle} · {taxTypeLabel(invoice.invoiceTaxType)}
              </small>
            </span>
            <span className="vx-invoice-row__tenant">
              <Icon
                name={invoice.tenantType === "company" ? "buildings" : "user"}
                size="sm"
                fallback="placeholder"
              />
              <span>
                <strong>{invoice.tenantName}</strong>
                <small>
                  {invoice.tenantCode} · {typeLabel(invoice.tenantType)}
                </small>
              </span>
            </span>
            <span className="vx-invoice-row__bill">
              <span className="vx-tenant-directory-row__tag-line">
                <Badge
                  className={`vx-tenant-pill vx-invoice-pill--bill-${invoice.billStatus}`}
                >
                  {billStatusLabel(invoice.billStatus)}
                </Badge>
                <Badge
                  className={`vx-tenant-pill vx-invoice-pill--type-${invoice.billType}`}
                >
                  {billTypeLabel(invoice.billType)}
                </Badge>
              </span>
              <small>{invoice.billNo}</small>
            </span>
            <span className="vx-invoice-row__amount">
              <strong>
                {formatCurrency(invoice.invoiceAmount, invoice.currency)}
              </strong>
              <small>
                税额 {formatCurrency(invoice.taxAmount, invoice.currency)}
              </small>
            </span>
            <span className="vx-invoice-row__status">
              <span className="vx-invoice-status-line">
                <span
                  className={`vx-invoice-status-dot vx-invoice-status-dot--${invoice.invoiceStatus}`}
                  role="img"
                  aria-label={invoiceStatusLabel(invoice.invoiceStatus)}
                >
                  <Icon
                    name={invoiceStatusIcon(invoice.invoiceStatus)}
                    size="xs"
                    fallback="placeholder"
                  />
                </span>
                <Badge
                  className={`vx-tenant-pill vx-invoice-pill--${invoice.invoiceStatus}`}
                >
                  {invoiceStatusLabel(invoice.invoiceStatus)}
                </Badge>
              </span>
              <small>{invoiceTypeLabel(invoice.invoiceType)}</small>
            </span>
            <span className="vx-invoice-row__delivery">
              <strong>
                {invoice.expressNo
                  ? (invoice.expressCompany ?? "线下寄送")
                  : invoice.invoiceFileUrl
                    ? "电子文件"
                    : "未寄送"}
              </strong>
              <small>
                {invoice.expressNo ??
                  invoice.invoiceFileUrl ??
                  formatDate(invoice.sendAt)}
              </small>
            </span>
            <InvoiceActionsMenu
              invoice={invoice}
              open={openMenuId === invoice.id}
              onToggle={() =>
                onOpenMenu(openMenuId === invoice.id ? "" : invoice.id)
              }
              onClose={onCloseMenu}
              onReceiptAction={onReceiptAction}
            />
          </div>
        );
      })}
    </div>
  );
}

function InvoiceCards({
  invoices,
  openMenuId,
  onOpenMenu,
  onCloseMenu,
  onReceiptAction,
}: {
  invoices: BillingInvoiceLedgerRecord[];
  openMenuId: string | null;
  onOpenMenu: (id: string) => void;
  onCloseMenu: () => void;
  onReceiptAction: (
    invoice: BillingInvoiceLedgerRecord,
    action: BillingInvoiceReceiptAction,
  ) => void;
}) {
  const router = useRouter();

  return (
    <div
      className="vx-tenant-directory-cards vx-invoice-cards"
      aria-label="线下发票卡片"
    >
      {invoices.map((invoice) => (
        <article
          key={invoice.id}
          className={joinClasses(
            "vx-tenant-directory-card",
            `vx-invoice-card--${invoice.invoiceStatus}`,
          )}
          role="button"
          tabIndex={0}
          onClick={() =>
            router.push(`/billing/${encodeURIComponent(invoice.billId)}`)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter")
              router.push(`/billing/${encodeURIComponent(invoice.billId)}`);
          }}
        >
          <header>
            <Icon name="key" size="lg" fallback="placeholder" />
            <div>
              <strong>{invoice.invoiceNo}</strong>
              <span>
                {invoice.tenantName} · {invoice.invoiceTitle}
              </span>
            </div>
            <InvoiceActionsMenu
              invoice={invoice}
              open={openMenuId === invoice.id}
              onToggle={() =>
                onOpenMenu(openMenuId === invoice.id ? "" : invoice.id)
              }
              onClose={onCloseMenu}
              onReceiptAction={onReceiptAction}
            />
          </header>
          <div className="vx-tenant-directory-card__badges">
            <Badge
              className={`vx-tenant-pill vx-invoice-pill--${invoice.invoiceStatus}`}
            >
              {invoiceStatusLabel(invoice.invoiceStatus)}
            </Badge>
            <Badge
              className={`vx-tenant-pill vx-invoice-pill--tax-${invoice.invoiceTaxType}`}
            >
              {taxTypeLabel(invoice.invoiceTaxType)}
            </Badge>
            <Badge
              className={`vx-tenant-pill vx-invoice-pill--type-${invoice.invoiceType}`}
            >
              {invoiceTypeLabel(invoice.invoiceType)}
            </Badge>
          </div>
          <p className="vx-invoice-card__bill">
            {invoice.billNo} ·{" "}
            {invoice.servicePlanName ?? invoice.orderNo ?? "未关联订阅"}
          </p>
          <div className="vx-tenant-directory-card__metrics">
            <span>
              <b>{formatCurrency(invoice.invoiceAmount, invoice.currency)}</b>
              <small>开票金额</small>
            </span>
            <span>
              <b>
                {formatCurrency(invoice.billPayableAmount, invoice.currency)}
              </b>
              <small>账单应收</small>
            </span>
            <span>
              <b>
                {invoice.expressNo
                  ? "已寄送"
                  : invoice.invoiceStatus === "finished"
                    ? "已完成"
                    : "待处理"}
              </b>
              <small>交付状态</small>
            </span>
          </div>
          <footer>
            <span>
              {formatDate(invoice.issuedAt)} · {invoice.auditorName}
            </span>
            <strong>
              {invoice.sourceLabel === "offline"
                ? "线下登记"
                : invoice.sourceLabel}
            </strong>
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
        共 {formatNumber(total)} 条发票记录
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

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<BillingInvoiceLedgerRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>("all");
  const [invoiceTypeFilter, setInvoiceTypeFilter] =
    useState<InvoiceTypeFilter>("all");
  const [taxFilter, setTaxFilter] = useState<InvoiceTaxFilter>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [loading, setLoading] = useState(true);
  const [receiptActionTarget, setReceiptActionTarget] = useState<{
    invoice: BillingInvoiceLedgerRecord;
    action: BillingInvoiceReceiptAction;
  } | null>(null);
  const [submittingReceiptAction, setSubmittingReceiptAction] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<string | null>(
    null,
  );
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchInvoiceLedgerRecords()
      .then((records) => {
        if (active) setInvoices(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return invoices.filter((invoice) => {
      if (!matchesStatusFilter(invoice, statusFilter)) return false;
      if (
        invoiceTypeFilter !== "all" &&
        invoice.invoiceType !== invoiceTypeFilter
      )
        return false;
      if (taxFilter !== "all" && invoice.invoiceTaxType !== taxFilter)
        return false;
      if (!matchesDeliveryFilter(invoice, deliveryFilter)) return false;
      if (
        normalizedQuery &&
        !invoiceSearchText(invoice).includes(normalizedQuery)
      )
        return false;
      return true;
    });
  }, [
    deliveryFilter,
    invoiceTypeFilter,
    invoices,
    query,
    statusFilter,
    taxFilter,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const activePage = Math.min(currentPage, pageCount);
  const visibleInvoices = filteredInvoices.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  );
  const visibleInvoiceIds = useMemo(
    () => visibleInvoices.map((invoice) => invoice.id),
    [visibleInvoices],
  );
  const selectedVisibleInvoiceCount = visibleInvoiceIds.filter((id) =>
    selectedInvoiceIds.has(id),
  ).length;
  const isInvoicePageSelected =
    visibleInvoiceIds.length > 0 &&
    selectedVisibleInvoiceCount === visibleInvoiceIds.length;
  const validInvoices = invoices.filter(
    (item) => item.invoiceStatus !== "red" && item.invoiceStatus !== "rejected",
  );
  const invoiceAmount = validInvoices.reduce(
    (sum, item) => sum + item.invoiceAmount,
    0,
  );
  const deliveryPendingCount = invoices.filter(
    (item) =>
      item.invoiceStatus === "issued" || item.invoiceStatus === "sending",
  ).length;
  const finishedCount = invoices.filter(
    (item) => item.invoiceStatus === "finished",
  ).length;
  const exceptionCount = invoices.filter(
    (item) => item.invoiceStatus === "red" || item.invoiceStatus === "rejected",
  ).length;

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [
    deliveryFilter,
    invoiceTypeFilter,
    pageSize,
    query,
    statusFilter,
    taxFilter,
    viewMode,
  ]);

  function handleReset() {
    setQuery("");
    setStatusFilter("all");
    setInvoiceTypeFilter("all");
    setTaxFilter("all");
    setDeliveryFilter("all");
  }

  function handleOpenMenu(id: string) {
    setOpenMenuId(id || null);
  }

  function toggleInvoiceSelection(id: string, checked: boolean) {
    setSelectedInvoiceIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleInvoicePageSelection(checked: boolean) {
    setSelectedInvoiceIds((current) => {
      const next = new Set(current);
      visibleInvoiceIds.forEach((id) => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }

  function requestReceiptAction(
    invoice: BillingInvoiceLedgerRecord,
    action: BillingInvoiceReceiptAction,
  ) {
    setOpenMenuId(null);
    setOperationError(null);
    setOperationFeedback(null);
    setReceiptActionTarget({ invoice, action });
  }

  async function handleSubmitReceiptAction(
    payload: Parameters<typeof submitBillingInvoiceReceiptAction>[2],
  ) {
    if (!receiptActionTarget) return;

    setSubmittingReceiptAction(true);
    setOperationError(null);

    try {
      await submitBillingInvoiceReceiptAction(
        receiptActionTarget.invoice.billId,
        receiptActionTarget.invoice.id,
        payload,
      );
      const records = await fetchInvoiceLedgerRecords();
      setInvoices(records);
      setOperationFeedback(
        `${invoiceReceiptActionLabel(receiptActionTarget.action)}已同步登记。`,
      );
      setReceiptActionTarget(null);
    } catch (error) {
      setOperationError(
        error instanceof Error
          ? error.message
          : "发票后续动作登记失败，请稍后重试。",
      );
    } finally {
      setSubmittingReceiptAction(false);
    }
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-invoices-page">
      <PageHeader
        icon="key"
        eyebrow="财务结算"
        title="发票管理"
        description="线下发票台账 MVP：集中查看人工登记的发票、寄送状态和红冲/作废结果，不调用在线开票接口。"
        action={
          <Link
            href="/billing"
            className="vx-btn vx-btn--outline vx-btn--default"
          >
            <Icon name="table" size="xs" fallback="placeholder" />
            账单登记入口
          </Link>
        }
      />

      <section className="vx-tenant-summary" aria-label="发票统计">
        <SummaryItem
          icon="key"
          label="发票总数"
          value={formatNumber(invoices.length)}
          tags={[`筛选 ${formatNumber(filteredInvoices.length)}`]}
        />
        <SummaryItem
          icon="chart-bar"
          label="有效开票"
          value={formatCurrency(invoiceAmount, "CNY")}
          tags={[`完成 ${formatNumber(finishedCount)}`]}
          tone="green"
        />
        <SummaryItem
          icon="table"
          label="待交付"
          value={formatNumber(deliveryPendingCount)}
          tags={[`线下 ${formatNumber(invoices.length)}`]}
          tone={deliveryPendingCount ? "amber" : "green"}
        />
        <SummaryItem
          icon="warning"
          label="发票异常"
          value={formatNumber(exceptionCount)}
          tags={["红冲/驳回"]}
          tone={exceptionCount ? "rose" : "green"}
        />
      </section>

      {operationFeedback ? (
        <div className="vx-subscription-operation-feedback">
          {operationFeedback}
        </div>
      ) : null}

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label="发票筛选">
          <ViewModeSwitch
            value={viewMode}
            onChange={setViewMode}
            ariaLabel="发票展示方式"
          />
          <span className="vx-tenant-view-count">
            {formatNumber(filteredInvoices.length)}
          </span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索发票、租户、账单、快递"
            className="vx-tenant-search vx-invoice-search"
            aria-label="搜索发票"
          />
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <div className="vx-tenant-filters">
            <NativeSelect
              className="vx-input vx-tenant-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as InvoiceStatusFilter)
              }
              aria-label="发票状态"
            >
              <option value="all">全部状态</option>
              <option value="active">待交付</option>
              <option value="issued">已开票</option>
              <option value="sending">寄送中</option>
              <option value="finished">已完成</option>
              <option value="exception">异常发票</option>
              <option value="red">已红冲</option>
              <option value="rejected">已驳回</option>
            </NativeSelect>
            <NativeSelect
              className="vx-input vx-tenant-select"
              value={invoiceTypeFilter}
              onChange={(event) =>
                setInvoiceTypeFilter(event.target.value as InvoiceTypeFilter)
              }
              aria-label="发票类型"
            >
              <option value="all">全部类型</option>
              <option value="special_vat">增值税专票</option>
              <option value="normal_vat">增值税普票</option>
              <option value="electronic">电子发票</option>
              <option value="paper">纸质发票</option>
              <option value="other">其他</option>
            </NativeSelect>
            <NativeSelect
              className="vx-input vx-tenant-select"
              value={taxFilter}
              onChange={(event) =>
                setTaxFilter(event.target.value as InvoiceTaxFilter)
              }
              aria-label="抬头类型"
            >
              <option value="all">全部抬头</option>
              <option value="enterprise">企业</option>
              <option value="individual">个人</option>
              <option value="government">政府/事业单位</option>
              <option value="other">其他</option>
            </NativeSelect>
            <NativeSelect
              className="vx-input vx-tenant-select"
              value={deliveryFilter}
              onChange={(event) =>
                setDeliveryFilter(event.target.value as DeliveryFilter)
              }
              aria-label="交付状态"
            >
              <option value="all">全部交付</option>
              <option value="not_sent">未寄送</option>
              <option value="sent">已寄送</option>
              <option value="finished">已完成</option>
            </NativeSelect>
          </div>
        </section>

        <section className="vx-tenant-directory" aria-label="发票清单">
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>读取中</span>
            </header>
          ) : null}

          {visibleInvoices.length ? (
            viewMode === "list" ? (
              <InvoiceListRows
                invoices={visibleInvoices}
                startIndex={(activePage - 1) * pageSize}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onReceiptAction={requestReceiptAction}
                selectedInvoiceIds={selectedInvoiceIds}
                isPageSelected={isInvoicePageSelected}
                onToggleInvoice={toggleInvoiceSelection}
                onTogglePage={toggleInvoicePageSelection}
              />
            ) : (
              <InvoiceCards
                invoices={visibleInvoices}
                openMenuId={openMenuId}
                onOpenMenu={handleOpenMenu}
                onCloseMenu={() => setOpenMenuId(null)}
                onReceiptAction={requestReceiptAction}
              />
            )
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? "正在加载发票" : "没有匹配的发票"}
                description={
                  loading
                    ? "正在读取线下发票台账。"
                    : "清空筛选条件后可查看全部线下发票记录。"
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
            total={filteredInvoices.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={(page) =>
              setCurrentPage(Math.min(Math.max(page, 1), pageCount))
            }
          />
        </section>
      </div>

      {receiptActionTarget ? (
        <InvoiceReceiptActionDialog
          receipt={receiptActionTarget.invoice}
          action={receiptActionTarget.action}
          busy={submittingReceiptAction}
          error={operationError}
          onCancel={() => {
            if (!submittingReceiptAction) setReceiptActionTarget(null);
          }}
          onSubmit={handleSubmitReceiptAction}
        />
      ) : null}
    </div>
  );
}
