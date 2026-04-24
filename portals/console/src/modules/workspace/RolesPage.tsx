'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Badge, Button, Input, Label } from '@/components/ui/primitives';
import {
  createTenantRole,
  deleteTenantRole,
  fetchTenantPermissions,
  fetchTenantRoles,
  updateTenantRole,
} from '@/api/console-bff';
import type { SummaryMetric, TenantPermissionRecord, TenantRoleRecord } from '@/entities/console';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { useConsoleTranslations } from '@/lib/console-intl';
import { PageHeader } from '@/modules/shared/PageHeader';
import { MetricGrid } from '@/modules/shared/MetricGrid';
import { PageSection } from '@/layout/shell';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';

export function RolesPage() {
  const t = useConsoleTranslations('rolesPage');
  const { session } = useConsoleSession();
  const [roles, setRoles] = useState<TenantRoleRecord[]>([]);
  const [permissions, setPermissions] = useState<TenantPermissionRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState({
    roleCode: '',
    roleName: '',
    description: '',
    status: 'active' as 'active' | 'disabled',
    permissionIds: [] as string[],
  });

  function tenantId() {
    return session.tenant?.mode === 'tenant' ? session.tenant.id : undefined;
  }

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([fetchTenantRoles(tenantId()), fetchTenantPermissions(tenantId())])
      .then(([roleRecords, permissionRecords]) => {
        if (!active) {
          return;
        }

        setRoles(roleRecords);
        setPermissions(permissionRecords);
        setSelectedId((current) => current ?? roleRecords[0]?.id ?? null);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError(t('feedback.loadError'));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [session.tenant?.id, session.tenant?.mode]);

  const selected = roles.find((role) => role.id === selectedId) ?? null;

  const metrics: SummaryMetric[] = useMemo(() => {
    const activeRoles = roles.filter((role) => role.status === 'active').length;
    const customRoles = roles.filter((role) => !role.isSystem).length;

    return [
      { label: t('metrics.roles.label'), value: loading ? '...' : String(roles.length), trend: t('metrics.roles.trend', { count: activeRoles }) },
      { label: t('metrics.customRoles.label'), value: loading ? '...' : String(customRoles), trend: t('metrics.customRoles.trend') },
      { label: t('metrics.permissions.label'), value: loading ? '...' : String(permissions.length), trend: t('metrics.permissions.trend') },
    ];
  }, [loading, permissions.length, roles, t]);

  function openCreateDialog() {
    setForm({ roleCode: '', roleName: '', description: '', status: 'active', permissionIds: [] });
    setMessage(null);
    setError(null);
    setDialogMode('create');
  }

  function openEditDialog() {
    if (!selected) {
      return;
    }

    setForm({
      roleCode: selected.roleCode,
      roleName: selected.roleName,
      description: selected.description ?? '',
      status: selected.status,
      permissionIds: selected.permissions.map((permission) => permission.id),
    });
    setMessage(null);
    setError(null);
    setDialogMode('edit');
  }

  async function reloadRoles(nextSelectedId?: string | null) {
    const roleRecords = await fetchTenantRoles(tenantId());
    setRoles(roleRecords);
    setSelectedId(nextSelectedId ?? roleRecords[0]?.id ?? null);
  }

  async function submitRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      if (dialogMode === 'create') {
        const created = await createTenantRole(
          {
            roleCode: form.roleCode,
            roleName: form.roleName,
            description: form.description,
            permissionIds: form.permissionIds,
          },
          tenantId(),
        );
        await reloadRoles(created.id);
        setMessage(t('feedback.createSuccess'));
      } else if (dialogMode === 'edit' && selected) {
        const updated = await updateTenantRole(
          selected.id,
          {
            roleName: form.roleName,
            description: form.description,
            status: form.status,
            permissionIds: form.permissionIds,
          },
          tenantId(),
        );
        await reloadRoles(updated.id);
        setMessage(t('feedback.updateSuccess'));
      }

      setDialogMode(null);
    } catch {
      setError(dialogMode === 'create' ? t('feedback.createError') : t('feedback.updateError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteRole() {
    if (!selected || selected.isSystem) {
      return;
    }

    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      await deleteTenantRole(selected.id, tenantId());
      await reloadRoles();
      setMessage(t('feedback.deleteSuccess'));
    } catch {
      setError(t('feedback.deleteError'));
    } finally {
      setSubmitting(false);
    }
  }

  function togglePermission(permissionId: string) {
    setForm((current) => ({
      ...current,
      permissionIds: current.permissionIds.includes(permissionId)
        ? current.permissionIds.filter((item) => item !== permissionId)
        : [...current.permissionIds, permissionId],
    }));
  }

  return (
    <div className="vx-page-stack">
      <PageHeader
        eyebrow={t('header.eyebrow')}
        title={t('header.title')}
        description={t('header.description')}
        action={
          <ActionButton icon="plus" onClick={openCreateDialog}>
            {t('header.create')}
          </ActionButton>
        }
      />

      {message ? <p className="vx-profile-message">{message}</p> : null}
      {error ? <p className="vx-profile-error">{error}</p> : null}

      <MetricGrid items={metrics} />

      <PageSection title={t('list.title')} description={t('list.description')}>
        {roles.length ? (
          <div className="vx-table-stack">
            <div className="vx-member-table vx-role-table">
              <div className="vx-member-table__header vx-role-table__header">
                <span>{t('detail.fields.name')}</span>
                <span>{t('detail.fields.code')}</span>
                <span>{t('detail.fields.status')}</span>
                <span>{t('list.system')}</span>
                <span>{t('detail.fields.description')}</span>
                <span>{t('list.permissionsColumn')}</span>
              </div>
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={selectedId === role.id ? 'vx-member-table__row vx-role-table__row vx-role-table__row--active' : 'vx-member-table__row vx-role-table__row'}
                  onClick={() => setSelectedId(role.id)}
                >
                  <div className="vx-member-table__identity">
                    <div>
                      <strong>{role.roleName}</strong>
                    </div>
                  </div>
                  <span>{role.roleCode}</span>
                  <span>
                    <Badge className={role.status === 'active' ? 'vx-badge-positive' : 'vx-badge-warning'}>
                      {role.status === 'active' ? t('status.active') : t('status.disabled')}
                    </Badge>
                  </span>
                  <span>{role.isSystem ? t('list.system') : '--'}</span>
                  <span className="vx-role-table__description">{role.description || t('list.noDescription')}</span>
                  <span>{t('list.permissionCount', { count: role.permissions.length })}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title={loading ? t('empty.loadingTitle') : t('empty.title')} description={loading ? t('empty.loadingDescription') : t('empty.description')} />
        )}
      </PageSection>

      {selected ? (
        <PageSection
          title={t('detail.title')}
          description={t('detail.description')}
          action={
            <div className="vx-detail-actions">
              <ActionButton variant="outline" icon="edit" onClick={openEditDialog}>
                {t('detail.edit')}
              </ActionButton>
              {!selected.isSystem ? (
                <ActionButton variant="outline" icon="x" onClick={() => void handleDeleteRole()}>
                  {t('detail.delete')}
                </ActionButton>
              ) : null}
            </div>
          }
        >
          <div className="vx-profile-group">
            <div className="vx-profile-row">
              <span>{t('detail.fields.code')}</span>
              <strong>{selected.roleCode}</strong>
            </div>
            <div className="vx-profile-row">
              <span>{t('detail.fields.name')}</span>
              <strong>{selected.roleName}</strong>
            </div>
            <div className="vx-profile-row">
              <span>{t('detail.fields.status')}</span>
              <strong>{selected.status === 'active' ? t('status.active') : t('status.disabled')}</strong>
            </div>
            <div className="vx-profile-row">
              <span>{t('detail.fields.description')}</span>
              <strong>{selected.description || '--'}</strong>
            </div>
          </div>

          <div className="vx-profile-group">
            <header className="vx-profile-group__header">
              <div>
                <h2>{t('detail.permissionsTitle')}</h2>
                <p>{t('detail.permissionsDescription')}</p>
              </div>
            </header>
            <div className="vx-role-permissions">
              {selected.permissions.length ? (
                selected.permissions.map((permission) => <span key={permission.id}>{permission.permissionCode}</span>)
              ) : (
                <span>{t('detail.noPermissions')}</span>
              )}
            </div>
          </div>
        </PageSection>
      ) : null}

      {dialogMode ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={dialogMode === 'create' ? t('dialog.createTitle') : t('dialog.editTitle')}>
          <div className="vx-profile-dialog__backdrop" onClick={() => setDialogMode(null)} />
          <form className="vx-profile-dialog__content" onSubmit={(event) => void submitRole(event)}>
            <h3>{dialogMode === 'create' ? t('dialog.createTitle') : t('dialog.editTitle')}</h3>
            <Label>
              {t('dialog.fields.code')}
              <Input value={form.roleCode} disabled={dialogMode === 'edit'} onChange={(event) => setForm((old) => ({ ...old, roleCode: event.target.value }))} />
            </Label>
            <Label>
              {t('dialog.fields.name')}
              <Input value={form.roleName} onChange={(event) => setForm((old) => ({ ...old, roleName: event.target.value }))} />
            </Label>
            <Label>
              {t('dialog.fields.description')}
              <Input value={form.description} onChange={(event) => setForm((old) => ({ ...old, description: event.target.value }))} />
            </Label>
            <Label>
              {t('dialog.fields.status')}
              <select className="vx-input" value={form.status} onChange={(event) => setForm((old) => ({ ...old, status: event.target.value as 'active' | 'disabled' }))}>
                <option value="active">{t('status.active')}</option>
                <option value="disabled">{t('status.disabled')}</option>
              </select>
            </Label>
            <div className="vx-profile-group">
              <header className="vx-profile-group__header">
                <div>
                  <h2>{t('dialog.permissionsTitle')}</h2>
                  <p>{t('dialog.permissionsDescription')}</p>
                </div>
              </header>
              <div className="vx-role-permissions">
                {permissions.map((permission) => (
                  <button
                    key={permission.id}
                    type="button"
                    className={form.permissionIds.includes(permission.id) ? 'vx-tab vx-tab--active' : 'vx-tab'}
                    onClick={() => togglePermission(permission.id)}
                  >
                    {permission.permissionCode}
                  </button>
                ))}
              </div>
            </div>
            <div className="vx-profile-dialog__actions">
              <Button variant="outline" onClick={() => setDialogMode(null)}>
                {t('dialog.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {dialogMode === 'create' ? t('dialog.create') : t('dialog.save')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
