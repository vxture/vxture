'use client';

import { useEffect, useState } from 'react';
import { fetchBillingInvoices, fetchBillingOverview, type ConsoleBillingOverview, type ConsoleInvoice } from '@/api/console-bff';
import { ActionButton } from '@/modules/shared/ActionButton';
import { MetricGrid } from '@/modules/shared/MetricGrid';
import { PageHeader } from '@/modules/shared/PageHeader';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { DashboardSplit, PageSection, SignalList } from '@/layout/shell';
import type { SummaryMetric } from '@/entities/console';

// ============================================================================
// 数据格式化工具
// ============================================================================

function formatAmount(amount: number, currency = 'CNY'): string {
  return currency === 'CNY' ? `¥${amount.toLocaleString()}` : `${currency} ${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function buildBillingMetrics(overview: ConsoleBillingOverview | null): SummaryMetric[] {
  if (!overview) {
    return [
      { label: 'Outstanding', value: '—', trend: 'No data', tone: 'default' },
      { label: 'Paid this cycle', value: '—', trend: '—', tone: 'default' },
      { label: 'Active subscriptions', value: '—', trend: '—', tone: 'default' },
    ];
  }

  const overdueLabel = overview.overdueInvoices > 0
    ? `${overview.overdueInvoices} overdue`
    : 'All paid';

  return [
    {
      label: 'Pending invoices',
      value: String(overview.pendingInvoices),
      trend: overdueLabel,
      tone: overview.overdueInvoices > 0 ? 'warning' : 'positive',
    },
    {
      label: 'Total paid',
      value: formatAmount(overview.totalRevenue),
      trend: `${overview.paidInvoices} invoices paid`,
      tone: 'positive',
    },
    {
      label: 'Active subscriptions',
      value: String(overview.activeSubscriptions),
      trend: `${overview.totalInvoices} invoices total`,
      tone: 'default',
    },
  ];
}

function buildInvoiceRows(invoices: ConsoleInvoice[]): string[][] {
  return invoices.map((inv) => [
    inv.invoiceNumber,
    formatDate(inv.dueDate),
    inv.lineItems[0]?.description ?? '—',
    inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
    formatAmount(inv.totalAmount, inv.currency),
  ]);
}

// ============================================================================
// BillingPage
// ============================================================================

const payoutNotes = [
  {
    title: 'Primary billing contact',
    body: 'Billing contacts receive due reminders, VAT exports, and failed charge notifications.',
  },
  {
    title: 'Retry policy',
    body: 'Failed card charges retry twice before moving into manual review with a finance task.',
  },
];

export function BillingPage() {
  const { session } = useConsoleSession();
  const [overview, setOverview] = useState<ConsoleBillingOverview | null>(null);
  const [invoices, setInvoices] = useState<ConsoleInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBillingOverview(),
      fetchBillingInvoices(10),
    ])
      .then(([ov, invs]) => {
        setOverview(ov);
        setInvoices(invs);
      })
      .finally(() => setLoading(false));
  }, [session.tenant?.id]);

  const billingMetrics = buildBillingMetrics(loading ? null : overview);
  const invoiceRows = buildInvoiceRows(invoices);

  const healthSignals = [
    {
      title: 'Billing health',
      description: loading
        ? 'Loading billing status…'
        : overview
          ? `${overview.paidInvoices} invoices paid, ${overview.pendingInvoices} pending, ${overview.overdueInvoices} overdue.`
          : 'No billing data available.',
    },
  ];

  const noteSignals = payoutNotes.map((note) => ({
    title: note.title,
    description: note.body,
  }));

  return (
    <div className="vx-page-stack">
      <PageHeader
        eyebrow="Commerce"
        title="Billing"
        description="Invoices, payment instruments, and charge visibility in a layout that feels like SaaS operations rather than ERP."
        action={<ActionButton icon="arrow-down">Download statement</ActionButton>}
      />

      <MetricGrid items={billingMetrics} />

      <DashboardSplit>
        <PageSection title="Billing health" description="Lead with due-state context before expanding into invoice history.">
          <SignalList items={healthSignals} />
        </PageSection>

        <PageSection title="Billing notes" description="Operational context for finance contacts." tone="muted">
          <SignalList items={noteSignals} />
        </PageSection>
      </DashboardSplit>

      <DashboardSplit>
        <PageSection
          title="Recent invoices"
          description="Keep the table focused on the most recent invoice and overage records."
          action={<ActionButton variant="outline" icon="arrow-right">View all invoices</ActionButton>}
        >
          {loading ? (
            <p className="vx-empty-hint">Loading invoices…</p>
          ) : invoiceRows.length > 0 ? (
            <div className="vx-table">
              <div className="vx-table__header vx-table__row">
                <span>Invoice</span>
                <span>Date</span>
                <span>Scope</span>
                <span>Status</span>
                <span>Amount</span>
              </div>
              {invoiceRows.map((row) => (
                <div key={row[0]} className="vx-table__row">
                  {row.map((cell, idx) => (
                    <span key={idx}>{cell}</span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="vx-empty-hint">No invoices found.</p>
          )}
        </PageSection>

        <PageSection title="Billing notes" description="Use concise operational context instead of pushing more columns into the table." tone="muted">
          <SignalList items={noteSignals} />
        </PageSection>
      </DashboardSplit>
    </div>
  );
}
