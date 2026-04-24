'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Switch } from '@/components/ui/primitives';
import { ActionButton } from '@/modules/shared/ActionButton';
import { PageHeader } from '@/modules/shared/PageHeader';
import { useConsoleTranslations } from '@/lib/console-intl';
import { PageSection } from '@/layout/shell';

export function SettingsPage() {
  const t = useConsoleTranslations('settings');

  return (
    <div className="vx-page-stack">
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        action={<ActionButton icon="check">{t('save')}</ActionButton>}
      />

      <PageSection title={t('workspace.title')} description={t('workspace.description')}>
        <div className="vx-settings-layout">
          <div className="vx-settings-column">
            <Card className="vx-settings-card">
              <CardHeader>
                <CardTitle className="vx-card-title">{t('workspace.title')}</CardTitle>
                <CardDescription>{t('workspace.description')}</CardDescription>
              </CardHeader>
              <CardContent className="vx-form-grid">
                <div className="vx-form-field">
                  <Label htmlFor="workspace-name">{t('workspace.name')}</Label>
                  <Input id="workspace-name" defaultValue="Vxture Demo Tenant" />
                </div>
                <div className="vx-form-field">
                  <Label htmlFor="workspace-domain">{t('workspace.domain')}</Label>
                  <Input id="workspace-domain" defaultValue="demo.vxture.local" />
                </div>
                <div className="vx-form-field">
                  <Label htmlFor="workspace-email">{t('workspace.email')}</Label>
                  <Input id="workspace-email" defaultValue="ops@vxture.ai" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="vx-settings-column">
            <Card className="vx-settings-card">
              <CardHeader>
                <CardTitle className="vx-card-title">{t('notifications.title')}</CardTitle>
                <CardDescription>{t('notifications.description')}</CardDescription>
              </CardHeader>
              <CardContent className="vx-toggle-list">
                <div className="vx-toggle-list__item">
                  <div>
                    <strong>{t('notifications.billing.title')}</strong>
                    <p>{t('notifications.billing.description')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="vx-toggle-list__item">
                  <div>
                    <strong>{t('notifications.quota.title')}</strong>
                    <p>{t('notifications.quota.description')}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="vx-toggle-list__item">
                  <div>
                    <strong>{t('notifications.approvals.title')}</strong>
                    <p>{t('notifications.approvals.description')}</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageSection>

      <PageSection title={t('danger.title')} description={t('danger.description')} tone="muted">
        <Card className="vx-settings-card vx-settings-card--danger">
          <CardHeader>
            <CardTitle className="vx-card-title">{t('danger.cancelTenant.title')}</CardTitle>
            <CardDescription>{t('danger.cancelTenant.description')}</CardDescription>
          </CardHeader>
          <CardContent className="vx-danger-zone">
            <p>{t('danger.cancelTenant.confirmHint')}</p>
            <ActionButton variant="outline" icon="x">{t('danger.cancelTenant.action')}</ActionButton>
          </CardContent>
        </Card>
      </PageSection>
    </div>
  );
}
