'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/primitives';
import { subscriptionHighlights, invoiceRows } from '@/shared/mock-console-data';
import { ActionButton } from '@/modules/shared/ActionButton';
import { PageHeader } from '@/modules/shared/PageHeader';
import { DashboardSplit, PageSection, SignalList, SummaryStrip } from '@/layout/shell';

const includedCapabilities = [
  '120 workspace seats with pooled operator access',
  '12M monthly inference requests across shared production environments',
  'Enterprise support with quarterly architecture review',
];

const changePlanningNotes = [
  {
    title: 'Upgrade recommendation',
    body: 'Fine-tune demand suggests moving GPU budget into the next tier before the next contract checkpoint.',
  },
  {
    title: 'Renewal note',
    body: 'Seats can still be adjusted before the invoice locks on May 10, 2026.',
  },
];

const paymentMethods = [
  {
    title: 'Corporate Visa',
    body: 'Primary method for annual subscription charges and variable overage billing.',
  },
  {
    title: 'Bank transfer',
    body: 'Reserved for negotiated invoice settlements and manual approval workflow.',
  },
];

export function SubscriptionPage() {
  const [tab, setTab] = useState<'overview' | 'billing' | 'payments'>('overview');
  const summaryItems = subscriptionHighlights.map((stat) => ({
    label: stat.label,
    value: stat.value,
    hint: stat.hint,
  }));
  const planningSignals = changePlanningNotes.map((note) => ({
    title: note.title,
    description: note.body,
  }));
  const includedSignals = includedCapabilities.map((item) => ({
    title: item,
  }));
  const postureSignals = [
    {
      title: 'Projected overage',
      description: 'Current model traffic projects a moderate monthly overage, but still below contract expansion threshold.',
    },
    {
      title: 'Invoice readiness',
      description: 'Finance contact and payment routing are healthy, so renewal can proceed without manual intervention.',
    },
  ];
  const chargeSignals = [
    {
      title: 'Overage driver',
      description: 'Most variable spend comes from burst model access rather than additional seat growth.',
    },
    {
      title: 'Recommended review',
      description: 'Compare projected May usage with current plan limits before approving another fine-tune workload.',
    },
  ];
  const paymentSignals = paymentMethods.map((method) => ({
    title: method.title,
    description: method.body,
  }));

  return (
    <div className="vx-page-stack">
      <PageHeader
        eyebrow="Commerce"
        title="Subscription"
        description="Surface current plan, renewal timing, and pooled resource posture before dropping into billing records."
        action={<ActionButton icon="settings">Manage plan</ActionButton>}
      />

      <SummaryStrip items={summaryItems} />

      <div className="vx-tabs-list" role="tablist" aria-label="Subscription tabs">
        <button type="button" className={tab === 'overview' ? 'vx-tab vx-tab--active' : 'vx-tab'} onClick={() => setTab('overview')}>
          Plan overview
        </button>
        <button type="button" className={tab === 'billing' ? 'vx-tab vx-tab--active' : 'vx-tab'} onClick={() => setTab('billing')}>
          Recent billing
        </button>
        <button type="button" className={tab === 'payments' ? 'vx-tab vx-tab--active' : 'vx-tab'} onClick={() => setTab('payments')}>
          Payment methods
        </button>
      </div>

      {tab === 'overview' ? (
        <DashboardSplit>
          <PageSection title="Current package" description="A modern SaaS billing page starts with the plan, not the table.">
            <div className="vx-subscription-panel">
              <div className="vx-stack-sm">
                <div className="vx-inline-between">
                  <strong>Growth annual</strong>
                  <Badge className="vx-badge-positive">Healthy</Badge>
                </div>
                <p>120 seats, 12M inference requests, pooled quota alerts, and enterprise support.</p>
                <div className="vx-detail-grid">
                  <div>
                    <span>Renewal window</span>
                    <strong>May 18, 2026</strong>
                  </div>
                  <div>
                    <span>Billing mode</span>
                    <strong>Annual + monthly overage</strong>
                  </div>
                </div>
              </div>
              <div className="vx-detail-actions">
                <ActionButton variant="outline" icon="chart-bar">Compare tiers</ActionButton>
                <ActionButton variant="outline" icon="calendar">Preview renewal</ActionButton>
              </div>
            </div>
          </PageSection>

          <PageSection title="Change planning" description="Keep upgrade or downgrade actions available, but visually secondary to the current state." tone="muted">
            <SignalList items={planningSignals} />
          </PageSection>
        </DashboardSplit>
      ) : null}

      {tab === 'overview' ? (
        <DashboardSplit>
          <PageSection title="Included in this plan" description="Summarize what operators are actually buying instead of repeating invoice language.">
            <SignalList items={includedSignals} />
          </PageSection>

          <PageSection title="Billing posture" description="Keep payment context available without turning subscription into a finance page." tone="muted">
            <SignalList items={postureSignals} />
          </PageSection>
        </DashboardSplit>
      ) : null}

      {tab === 'billing' ? (
        <DashboardSplit>
          <PageSection title="Recent charges" description="Invoices and overage records remain secondary to the subscription overview.">
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

          <PageSection title="Charge guidance" description="Explain what changed and what operators need to review next." tone="muted">
            <SignalList items={chargeSignals} />
          </PageSection>
        </DashboardSplit>
      ) : null}

      {tab === 'payments' ? (
        <PageSection title="Payment methods" description="Payment management stays available without turning the page into a finance system." tone="muted">
          <SignalList items={paymentSignals} />
        </PageSection>
      ) : null}
    </div>
  );
}
