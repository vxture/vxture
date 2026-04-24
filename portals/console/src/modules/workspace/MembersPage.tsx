'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Avatar, AvatarFallback, Badge, Button, Input, Label } from '@/components/ui/primitives';
import {
  createMember,
  deleteMember,
  disableMember,
  fetchMembers,
  fetchTenantRoles,
  inviteMember,
  updateMember,
} from '@/api/console-bff';
import type { MemberRecord, SummaryMetric, TenantRoleRecord } from '@/entities/console';
import { useConsoleTranslations } from '@/lib/console-intl';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { ActionButton } from '@/modules/shared/ActionButton';
import { DetailDrawer } from '@/modules/shared/DetailDrawer';
import { EmptyState } from '@/modules/shared/EmptyState';
import { MetricGrid } from '@/modules/shared/MetricGrid';
import { PageHeader } from '@/modules/shared/PageHeader';
import { TableToolbar } from '@/modules/shared/TableToolbar';
import { PageSection, SignalList } from '@/layout/shell';

export function MembersPage() {
  const t = useConsoleTranslations('membersPage');
  const { session } = useConsoleSession();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [roles, setRoles] = useState<TenantRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<'create' | 'invite' | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    email: '',
    nickname: '',
    remark: '',
    roleId: '',
  });

  useEffect(() => {
    let active = true;
    const tenantId = session.tenant?.mode === 'tenant' ? session.tenant.id : undefined;

    setLoading(true);
    Promise.all([fetchMembers(tenantId), fetchTenantRoles(tenantId)])
      .then(([records, roleRecords]) => {
        if (!active) {
          return;
        }

        setMembers(records);
        setRoles(roleRecords.filter((role) => role.status === 'active'));
        setSelectedId(null);
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

  function tenantId() {
    return session.tenant?.mode === 'tenant' ? session.tenant.id : undefined;
  }

  function resetFeedback() {
    setMessage(null);
    setError(null);
  }

  function resetMemberForm(member?: MemberRecord | null) {
    setMemberForm({
      email: member?.email ?? '',
      nickname: member?.name ?? '',
      remark: member?.team === 'Workspace' ? '' : member?.team ?? '',
      roleId: member?.roleId ?? '',
    });
  }

  async function reloadMembers(nextSelectedId?: string | null) {
    const records = await fetchMembers(tenantId());
    setMembers(records);
    setSelectedId(nextSelectedId ?? null);
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createMode) {
      return;
    }

    setSubmitting(true);
    resetFeedback();

    try {
      const payload = {
        email: memberForm.email,
        nickname: memberForm.nickname,
        remark: memberForm.remark,
        roleId: memberForm.roleId || null,
      };

      const created =
        createMode === 'invite'
          ? await inviteMember(payload, tenantId())
          : await createMember(payload, tenantId());

      await reloadMembers(created.id);
      setCreateMode(null);
      resetMemberForm();
      setMessage(createMode === 'invite' ? '成员邀请已创建。' : '成员已创建。');
    } catch {
      setError(createMode === 'invite' ? '成员邀请失败，请稍后重试。' : '成员创建失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      return;
    }

    setSubmitting(true);
    resetFeedback();

    try {
      const updated = await updateMember(
        selected.id,
        {
          nickname: memberForm.nickname,
          remark: memberForm.remark,
          roleId: memberForm.roleId || null,
        },
        tenantId(),
      );
      await reloadMembers(updated.id);
      setEditOpen(false);
      setMessage('成员资料已更新。');
    } catch {
      setError('成员资料保存失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleMemberStatus() {
    if (!selected) {
      return;
    }

    const nextStatus = selected.status === 'Suspended' ? 'active' : 'banned';
    setSubmitting(true);
    resetFeedback();

    try {
      const updated =
        nextStatus === 'banned'
          ? await disableMember(selected.id, tenantId())
          : await updateMember(selected.id, { status: nextStatus }, tenantId());
      await reloadMembers(updated.id);
      setMessage(nextStatus === 'banned' ? t('feedback.memberDisabled') : t('feedback.memberEnabled'));
    } catch {
      setError(nextStatus === 'banned' ? t('feedback.memberDisableError') : t('feedback.memberEnableError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMember() {
    if (!selected) {
      return;
    }

    setSubmitting(true);
    resetFeedback();

    try {
      await deleteMember(selected.id, tenantId());
      await reloadMembers();
      setMessage('成员已删除。');
    } catch {
      setError('成员删除失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    return members.filter((member) => {
      const matchesQuery =
        !query ||
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.email.toLowerCase().includes(query.toLowerCase()) ||
        member.role.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || member.status.toLowerCase() === status;
      return matchesQuery && matchesStatus;
    });
  }, [members, query, status]);

  const memberMetrics: SummaryMetric[] = useMemo(() => {
    const activeMembers = members.filter((member) => member.status === 'Active').length;
    const pendingMembers = members.filter((member) => member.status === 'Invited').length;
    const owners = members.filter((member) => member.role.toLowerCase().includes('owner')).length;

    return [
      {
        label: t('metrics.members.label'),
        value: loading ? '...' : String(members.length),
        trend: t('metrics.members.trend', { count: activeMembers }),
        tone: 'positive',
      },
      {
        label: t('metrics.pendingInvites.label'),
        value: loading ? '...' : String(pendingMembers),
        trend: pendingMembers ? t('metrics.pendingInvites.trendWarning') : t('metrics.pendingInvites.trendOk'),
        tone: pendingMembers ? 'warning' : 'positive',
      },
      {
        label: t('metrics.adminCoverage.label'),
        value: loading ? '...' : String(owners),
        trend: owners ? t('metrics.adminCoverage.trendOk') : t('metrics.adminCoverage.trendWarning'),
      },
    ];
  }, [loading, members, t]);

  const selected = filtered.find((member) => member.id === selectedId) ?? null;
  const drawerSignals = selected
    ? [
        {
          title: t('drawer.accessSummary.title'),
          description: t('drawer.accessSummary.description', { name: selected.name, team: selected.team }),
        },
        {
          title: t('drawer.followUp.title'),
          description:
            selected.status === 'Invited'
              ? t('drawer.followUp.invited')
              : selected.status === 'Suspended'
                ? t('drawer.followUp.suspended')
                : t('drawer.followUp.active'),
        },
      ]
    : [];
  const selectedFields = selected
    ? [
        { label: t('drawer.fields.role'), value: selected.role },
        { label: t('drawer.fields.status'), value: selected.status },
        { label: t('drawer.fields.team'), value: selected.team },
        { label: t('drawer.fields.lastActive'), value: selected.lastActive },
      ]
    : [];

  const statusFilters = [
    { value: 'all', label: t('filters.all') },
    { value: 'active', label: t('filters.active') },
    { value: 'invited', label: t('filters.invited') },
    { value: 'suspended', label: t('filters.suspended') },
  ] as const;

  return (
    <div className="vx-page-stack">
      <PageHeader
        eyebrow={t('header.eyebrow')}
        title={t('header.title')}
        description={t('header.description')}
        action={
          <ActionButton
            icon="plus"
            onClick={() => {
              resetMemberForm();
              resetFeedback();
              setCreateMode('create');
            }}
          >
            {t('header.addMember')}
          </ActionButton>
        }
      />

      {message ? <p className="vx-profile-message">{message}</p> : null}
      {error ? <p className="vx-profile-error">{error}</p> : null}

      <MetricGrid items={memberMetrics} />

      <PageSection
        title={t('table.title')}
        description={t('table.description')}
        action={
          <TableToolbar
            title={t('table.toolbarTitle', { count: filtered.length })}
            hint={t('table.toolbarHint')}
          />
        }>
        <div className="vx-table-stack">
          <div className="vx-toolbar vx-toolbar--filters">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('table.searchPlaceholder')}
              className="vx-search-input"
            />
            <div className="vx-segmented-control" role="tablist" aria-label={t('table.filterAriaLabel')}>
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={status === filter.value}
                  className={status === filter.value ? 'vx-segmented-control__item vx-segmented-control__item--active' : 'vx-segmented-control__item'}
                  onClick={() => setStatus(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="vx-member-table">
            <div className="vx-member-table__header">
              <span>{t('table.columns.name')}</span>
              <span>{t('table.columns.email')}</span>
              <span>{t('table.columns.role')}</span>
              <span>{t('table.columns.status')}</span>
              <span>{t('table.columns.lastActive')}</span>
              <span />
            </div>
            {filtered.length ? (
              filtered.map((member) => (
                <div key={member.id} className="vx-member-table__row" onClick={() => setSelectedId(member.id)}>
                  <div className="vx-member-table__identity">
                    <Avatar>
                      <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <strong>{member.name}</strong>
                      <p>{member.team}</p>
                    </div>
                  </div>
                  <span>{member.email}</span>
                  <span>{member.role}</span>
                  <span>
                    <Badge
                      className={
                        member.status === 'Suspended'
                          ? 'vx-badge-warning'
                          : member.status === 'Active'
                            ? 'vx-badge-positive'
                            : 'vx-badge-neutral'
                      }
                    >
                      {member.status}
                    </Badge>
                  </span>
                  <span>{member.lastActive}</span>
                  <div className="vx-member-table__menu">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Open details for ${member.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(member.id);
                      }}
                    >
                      <span aria-hidden="true">⋯</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title={loading ? t('empty.loadingTitle') : t('empty.title')}
                description={loading ? t('empty.loadingDescription') : t('empty.description')}
                action={
                  <ActionButton
                    variant="outline"
                    icon="x"
                    onClick={() => {
                      setQuery('');
                      setStatus('all');
                    }}
                  >
                    {t('empty.resetFilters')}
                  </ActionButton>
                }
              />
            )}
          </div>
        </div>

        {selected ? (
          <DetailDrawer title={selected.name} description={selected.email} fields={selectedFields} onClose={() => setSelectedId(null)}>
            <SignalList items={drawerSignals} />
            <div className="vx-detail-actions">
              <ActionButton variant="outline" icon="edit">Edit member</ActionButton>
              <ActionButton
                variant="outline"
                icon="edit"
                onClick={() => {
                  resetMemberForm(selected);
                  resetFeedback();
                  setEditOpen(true);
                }}
              >
                {t('drawer.actions.edit')}
              </ActionButton>
              <ActionButton variant="outline" icon="shield-check" onClick={() => void handleToggleMemberStatus()}>
                {selected.status === 'Suspended' ? t('drawer.actions.enableMember') : selected.status === 'Invited' ? t('drawer.actions.disableInvite') : t('drawer.actions.disableMember')}
              </ActionButton>
              <ActionButton variant="outline" icon="x" onClick={() => void handleDeleteMember()}>
                {t('drawer.actions.delete')}
              </ActionButton>
            </div>
          </DetailDrawer>
        ) : null}

        {createMode ? (
          <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={createMode === 'invite' ? t('dialogs.invite.title') : t('dialogs.create.title')}>
            <div className="vx-profile-dialog__backdrop" onClick={() => setCreateMode(null)} />
            <form className="vx-profile-dialog__content" onSubmit={(event) => void submitCreate(event)}>
              <h3>{createMode === 'invite' ? t('dialogs.invite.title') : t('dialogs.create.title')}</h3>
              <Label>
                {t('dialogs.fields.email')}
                <Input
                  type="email"
                  value={memberForm.email}
                  onChange={(event) => setMemberForm((old) => ({ ...old, email: event.target.value }))}
                  required
                />
              </Label>
              <Label>
                {t('dialogs.fields.nickname')}
                <Input value={memberForm.nickname} onChange={(event) => setMemberForm((old) => ({ ...old, nickname: event.target.value }))} />
              </Label>
              <Label>
                {t('dialogs.fields.teamRemark')}
                <Input value={memberForm.remark} onChange={(event) => setMemberForm((old) => ({ ...old, remark: event.target.value }))} />
              </Label>
              <Label>
                {t('dialogs.fields.role')}
                <select
                  className="vx-input"
                  value={memberForm.roleId}
                  onChange={(event) => setMemberForm((old) => ({ ...old, roleId: event.target.value }))}
                >
                  <option value="">{t('dialogs.fields.defaultRole')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </Label>
              <div className="vx-profile-dialog__actions">
                <Button variant="outline" onClick={() => setCreateMode(null)}>{t('dialogs.actions.cancel')}</Button>
                <Button type="submit" disabled={submitting}>{createMode === 'invite' ? t('dialogs.actions.sendInvite') : t('dialogs.actions.create')}</Button>
              </div>
            </form>
          </div>
        ) : null}

        {editOpen && selected ? (
          <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t('dialogs.edit.title')}>
            <div className="vx-profile-dialog__backdrop" onClick={() => setEditOpen(false)} />
            <form className="vx-profile-dialog__content" onSubmit={(event) => void submitEdit(event)}>
              <h3>{t('dialogs.edit.title')}</h3>
              <Label>
                {t('dialogs.fields.email')}
                <Input value={selected.email} disabled />
              </Label>
              <Label>
                {t('dialogs.fields.nickname')}
                <Input value={memberForm.nickname} onChange={(event) => setMemberForm((old) => ({ ...old, nickname: event.target.value }))} />
              </Label>
              <Label>
                {t('dialogs.fields.teamRemark')}
                <Input value={memberForm.remark} onChange={(event) => setMemberForm((old) => ({ ...old, remark: event.target.value }))} />
              </Label>
              <Label>
                {t('dialogs.fields.role')}
                <select
                  className="vx-input"
                  value={memberForm.roleId}
                  onChange={(event) => setMemberForm((old) => ({ ...old, roleId: event.target.value }))}
                >
                  <option value="">{t('dialogs.fields.defaultRole')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </Label>
              <div className="vx-profile-dialog__actions">
                <Button variant="outline" onClick={() => setEditOpen(false)}>{t('dialogs.actions.cancel')}</Button>
                <Button type="submit" disabled={submitting}>{t('dialogs.actions.save')}</Button>
              </div>
            </form>
          </div>
        ) : null}
      </PageSection>
    </div>
  );
}
