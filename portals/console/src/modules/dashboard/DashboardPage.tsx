'use client';

import Link from 'next/link';
import { Icon, type IconName } from '@vxture/design-system';
import { Badge } from '@/components/ui/primitives';
import { invoiceRows, quotaRows } from '@/shared/mock-console-data';
import { ActionButton } from '@/modules/shared/ActionButton';
import { PageHeader } from '@/modules/shared/PageHeader';
import { TableToolbar } from '@/modules/shared/TableToolbar';
import { useConsoleTranslations } from '@/lib/console-intl';
import { DashboardSplit, PageSection, SignalList, SummaryStrip } from '@/layout/shell';

export function DashboardPage() {
  const t = useConsoleTranslations('dashboard');
  const dashboardStats = [
    { id: 'plan', icon: 'medal' },
    { id: 'quota', icon: 'chart-bar' },
    { id: 'reminders', icon: 'warning' },
  ] as const;
  const quickActions = [
    { id: 'addMember', href: '/members', icon: 'users' },
    { id: 'reviewSubscription', href: '/subscription', icon: 'chart-bar' },
    { id: 'adjustQuotas', href: '/quotas', icon: 'database' },
  ] as const;
  const summaryItems = dashboardStats.map((stat) => ({
    label: t(`stats.${stat.id}.label`),
    value: t(`stats.${stat.id}.value`),
    hint: t(`stats.${stat.id}.hint`),
    aside: (
      <span className="vx-summary-strip__icon" aria-hidden="true">
        <Icon name={stat.icon as IconName} size="sm" fallback="info" />
      </span>
    ),
  }));
  const signalItems = [
    {
      title: t('signals.billing.title'),
      description: t('signals.billing.description'),
    },
    {
      title: t('signals.quota.title'),
      description: t('signals.quota.description'),
    },
    {
      title: t('signals.access.title'),
      description: t('signals.access.description'),
    },
  ];

  return (
    <div className="vx-page-stack">
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        action={
          <ActionButton icon="plus">
            {t('createAction')}
          </ActionButton>
        }
      />

      <SummaryStrip items={summaryItems} />

      <DashboardSplit>
        <PageSection title={t('quickActions.title')} description={t('quickActions.description')}>
          <div className="vx-action-list">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href} className="vx-action-item">
                <div className="vx-action-item__icon">
                  <Icon name={action.icon as IconName} size={20} fallback="arrow-right" />
                </div>
                <div>
                  <strong>{t(`quickActions.${action.id}.label`)}</strong>
                  <p>{t(`quickActions.${action.id}.description`)}</p>
                </div>
                <span className="vx-action-item__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </PageSection>

        <PageSection
          title={t('signals.title')}
          description={t('signals.description')}
          action={<Badge className="vx-badge-neutral">{t('signals.badge')}</Badge>}
          tone="muted"
        >
          <SignalList items={signalItems} />
        </PageSection>
      </DashboardSplit>

      <PageSection title={t('invoices.title')} description={t('invoices.description')}>
        <TableToolbar
          title="Growth annual / overage"
          hint={t('invoices.headers.scope')}
          action={
            <ActionButton variant="outline" icon="warning">
              {t('signals.billing.title')}
            </ActionButton>
          }
        />
        <div className="vx-table">
          <div className="vx-table__header vx-table__row">
            <span>{t('invoices.headers.invoice')}</span>
            <span>{t('invoices.headers.date')}</span>
            <span>{t('invoices.headers.scope')}</span>
            <span>{t('invoices.headers.status')}</span>
            <span>{t('invoices.headers.amount')}</span>
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

      <PageSection title={t('quotas.title')} description={t('quotas.description')} tone="muted">
        <div className="vx-table">
          <div className="vx-table__header vx-table__row">
            <span>{t('quotas.headers.pool')}</span>
            <span>{t('quotas.headers.usage')}</span>
            <span>{t('quotas.headers.share')}</span>
            <span>{t('quotas.headers.status')}</span>
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
