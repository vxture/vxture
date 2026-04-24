import { ActionButton } from '@/modules/shared/ActionButton';
import { billingMetrics, invoiceRows } from '@/shared/mock-console-data';
import { MetricGrid } from '@/modules/shared/MetricGrid';
import { PageHeader } from '@/modules/shared/PageHeader';
import { DashboardSplit, PageSection, SignalList } from '@/layout/shell';

const payoutNotes = [
  {
    title: 'Primary billing contact',
    body: 'ops-finance@vxture.ai receives due reminders, VAT exports, and failed charge notifications.',
  },
  {
    title: 'Retry policy',
    body: 'Failed card charges retry twice before moving into manual review with a finance task.',
  },
];

const paymentMethods = [
  {
    name: 'Corporate Visa',
    detail: 'Ending in 2048, primary for subscription and variable overage billing.',
    status: 'Primary',
  },
  {
    name: 'Bank transfer',
    detail: 'Reserved for invoice-based settlements above annual contract thresholds.',
    status: 'Backup',
  },
];

export function BillingPage() {
  const healthSignals = [
    {
      title: 'Current exposure',
      description: 'One model overage invoice is open, but recurring subscription billing remains in good standing.',
    },
    {
      title: 'Next due checkpoint',
      description: 'The outstanding balance should be settled before automatic quota review triggers at the end of the week.',
    },
  ];
  const paymentSignals = paymentMethods.map((method) => ({
    title: method.name,
    description: method.detail,
    aside: <span className="vx-inline-meta">{method.status}</span>,
  }));
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

        <PageSection title="Payment methods" description="Payment instruments stay visible, but they should not dominate the page." tone="muted">
          <SignalList items={paymentSignals} />
        </PageSection>
      </DashboardSplit>

      <DashboardSplit>
        <PageSection
          title="Recent invoices"
          description="Keep the table focused on the most recent invoice and overage records."
          action={<ActionButton variant="outline" icon="arrow-right">View all invoices</ActionButton>}
        >
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
                {row.map((cell) => (
                  <span key={cell}>{cell}</span>
                ))}
              </div>
            ))}
          </div>
        </PageSection>

        <PageSection title="Billing notes" description="Use concise operational context instead of pushing more columns into the table." tone="muted">
          <SignalList items={noteSignals} />
        </PageSection>
      </DashboardSplit>
    </div>
  );
}
