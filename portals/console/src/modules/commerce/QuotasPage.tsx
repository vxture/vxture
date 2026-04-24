import { ActionButton } from '@/modules/shared/ActionButton';
import { quotaMetrics, quotaRows } from '@/shared/mock-console-data';
import { MetricGrid } from '@/modules/shared/MetricGrid';
import { PageHeader } from '@/modules/shared/PageHeader';
import { TableToolbar } from '@/modules/shared/TableToolbar';
import { DashboardSplit, PageSection, SignalList } from '@/layout/shell';

const quotaSignals = [
  {
    title: 'Fine-tune budget watch',
    description: 'GPU hours are the first pool approaching review threshold and should stay visible above the table.',
  },
  {
    title: 'Seat headroom',
    description: 'Current seat usage leaves space for near-term onboarding without changing the subscription tier.',
  },
];

export function QuotasPage() {
  return (
    <div className="vx-page-stack">
      <PageHeader
        eyebrow="Commerce"
        title="Quotas"
        description="Quota monitoring should feel operational and readable, not like a dense reporting dashboard."
        action={<ActionButton icon="warning">Adjust alert policy</ActionButton>}
      />

      <MetricGrid items={quotaMetrics} />

      <DashboardSplit>
        <PageSection title="Quota posture" description="Lead with the pools that need human attention before expanding into raw usage rows." tone="muted">
          <SignalList items={quotaSignals} />
        </PageSection>

        <PageSection title="Alert actions" description="Quota management should feel like operations, not just reporting.">
          <div className="vx-detail-actions">
            <ActionButton variant="outline" icon="warning">Review GPU alerting</ActionButton>
            <ActionButton variant="outline" icon="arrow-down">Export usage snapshot</ActionButton>
            <ActionButton variant="outline" icon="settings">Adjust thresholds</ActionButton>
          </div>
        </PageSection>
      </DashboardSplit>

      <PageSection title="Quota pools" description="Core pools stay within 5 to 7 columns so scanning remains fast.">
        <TableToolbar title="3 shared resource pools" hint="Usage, share, and health stay visible in one scan line." />
        <div className="vx-table">
          <div className="vx-table__header vx-table__row">
            <span>Pool</span>
            <span>Usage</span>
            <span>Share</span>
            <span>Status</span>
          </div>
          {quotaRows.map((row) => (
            <div key={row[0]} className="vx-table__row">
              {row.map((cell) => (
                <span key={cell}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
