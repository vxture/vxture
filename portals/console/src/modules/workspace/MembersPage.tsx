'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Icon } from '@vxture/design-system';
import { Avatar, Badge, Button, Input, Label } from '@/components/ui/primitives';
import {
  createMember,
  disableMember,
  fetchMembers,
  fetchTenantRoles,
  inviteMember,
  resetMemberPassword,
  unlinkMember,
  updateMember,
} from '@/api/console-bff';
import type { MemberRecord, TenantRoleRecord } from '@/entities/console';
import { useTranslations } from 'next-intl';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';

type MemberStatusFilter = 'all' | 'active' | 'invited' | 'suspended';

const DEFAULT_MEMBER_AVATAR = '/assets/icon/avatar-default.png';
const MEMBERS_PAGE_SIZE = 10;

const statusClassMap: Record<MemberRecord['status'], string> = {
  Active: 'vx-member-status--active',
  Invited: 'vx-member-status--invited',
  Suspended: 'vx-member-status--suspended',
};

function memberUsername(member: MemberRecord) {
  return member.username?.trim() || member.email.split('@')[0] || member.accountId;
}

function memberAvatar(member: MemberRecord) {
  return member.avatarUrl?.trim() || DEFAULT_MEMBER_AVATAR;
}

function memberSearchText(member: MemberRecord) {
  return [member.name, memberUsername(member), member.email, member.phone, member.role, member.team]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function MembersPage() {
  const t = useTranslations('membersPage');
  const { session } = useConsoleSession();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [roles, setRoles] = useState<TenantRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<MemberStatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<'create' | 'invite' | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [unlinkOpen, setUnlinkOpen] = useState(false);
  const [bulkUnlinkOpen, setBulkUnlinkOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    email: '',
    nickname: '',
    remark: '',
    roleId: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    nextPassword: '',
  });

  useEffect(() => {
    let active = true;
    const currentTenantId = session.tenant?.mode === 'tenant' ? session.tenant.id : undefined;

    setLoading(true);
    Promise.all([fetchMembers(currentTenantId), fetchTenantRoles(currentTenantId)])
      .then(([records, roleRecords]) => {
        if (!active) {
          return;
        }

        setMembers(records);
        setRoles(roleRecords.filter((role) => role.status === 'active'));
        setSelectedIds(new Set());
        setSelectedId(null);
        setOpenMenuId(null);
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

  useEffect(() => {
    setCurrentPage(1);
    setOpenMenuId(null);
  }, [query, status]);

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

  function openCreateDialog(mode: 'create' | 'invite') {
    resetMemberForm();
    resetFeedback();
    setCreateMode(mode);
  }

  function openEditDialog(member: MemberRecord) {
    setSelectedId(member.id);
    setOpenMenuId(null);
    resetMemberForm(member);
    resetFeedback();
    setEditOpen(true);
  }

  function openResetDialog(member: MemberRecord) {
    setSelectedId(member.id);
    setOpenMenuId(null);
    setPasswordForm({ nextPassword: '' });
    resetFeedback();
    setResetOpen(true);
  }

  function openUnlinkDialog(member: MemberRecord) {
    setSelectedId(member.id);
    setOpenMenuId(null);
    resetFeedback();
    setUnlinkOpen(true);
  }

  async function reloadMembers(nextSelectedId?: string | null) {
    const records = await fetchMembers(tenantId());
    setMembers(records);
    setSelectedIds(new Set());
    setSelectedId(nextSelectedId ?? null);
    setOpenMenuId(null);
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
      setMessage(t(createMode === 'invite' ? 'feedback.inviteSuccess' : 'feedback.createSuccess'));
    } catch {
      setError(t(createMode === 'invite' ? 'feedback.inviteError' : 'feedback.createError'));
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
      setMessage(t('feedback.updateSuccess'));
    } catch {
      setError(t('feedback.updateError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      return;
    }

    if (passwordForm.nextPassword.length < 6) {
      setError(t('feedback.resetPasswordLength'));
      return;
    }

    setSubmitting(true);
    resetFeedback();

    try {
      await resetMemberPassword(selected.id, { nextPassword: passwordForm.nextPassword }, tenantId());
      setResetOpen(false);
      setPasswordForm({ nextPassword: '' });
      setMessage(t('feedback.resetPasswordSuccess', { name: selected.name }));
    } catch {
      setError(t('feedback.resetPasswordError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleMemberStatus(member: MemberRecord) {
    const nextStatus = member.status === 'Suspended' ? 'active' : 'banned';
    setSubmitting(true);
    resetFeedback();
    setOpenMenuId(null);

    try {
      const updated =
        nextStatus === 'banned'
          ? await disableMember(member.id, tenantId())
          : await updateMember(member.id, { status: nextStatus }, tenantId());
      await reloadMembers(updated.id);
      setMessage(nextStatus === 'banned' ? t('feedback.memberDisabled') : t('feedback.memberEnabled'));
    } catch {
      setError(nextStatus === 'banned' ? t('feedback.memberDisableError') : t('feedback.memberEnableError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnlinkMember() {
    if (!selected) {
      return;
    }

    setSubmitting(true);
    resetFeedback();
    setOpenMenuId(null);

    try {
      await unlinkMember(selected.id, tenantId());
      await reloadMembers();
      setUnlinkOpen(false);
      setMessage(t('feedback.unlinkSuccess'));
    } catch {
      setError(t('feedback.unlinkError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkStatus(nextStatus: 'active' | 'banned') {
    const targets = members.filter(
      (member) =>
        selectedIds.has(member.id) &&
        (nextStatus === 'banned' ? member.status !== 'Suspended' : member.status === 'Suspended'),
    );
    if (!targets.length) {
      return;
    }

    setSubmitting(true);
    resetFeedback();
    setOpenMenuId(null);

    try {
      await Promise.all(
        targets.map((member) =>
          nextStatus === 'banned'
            ? disableMember(member.id, tenantId())
            : updateMember(member.id, { status: nextStatus }, tenantId()),
        ),
      );
      await reloadMembers();
      setMessage(nextStatus === 'banned' ? t('feedback.bulkDisabled', { count: targets.length }) : t('feedback.bulkEnabled', { count: targets.length }));
    } catch {
      setError(nextStatus === 'banned' ? t('feedback.bulkDisableError') : t('feedback.bulkEnableError'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkUnlink() {
    const targets = members.filter((member) => selectedIds.has(member.id));
    if (!targets.length) {
      return;
    }

    setSubmitting(true);
    resetFeedback();
    setOpenMenuId(null);

    try {
      await Promise.all(targets.map((member) => unlinkMember(member.id, tenantId())));
      await reloadMembers();
      setBulkUnlinkOpen(false);
      setMessage(t('feedback.bulkUnlinkSuccess', { count: targets.length }));
    } catch {
      setError(t('feedback.bulkUnlinkError'));
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return members.filter((member) => {
      const matchesQuery = !normalizedQuery || memberSearchText(member).includes(normalizedQuery);
      const matchesStatus = status === 'all' || member.status.toLowerCase() === status;
      return matchesQuery && matchesStatus;
    });
  }, [members, query, status]);

  const statusCounts = useMemo(
    () => ({
      active: members.filter((member) => member.status === 'Active').length,
      invited: members.filter((member) => member.status === 'Invited').length,
      suspended: members.filter((member) => member.status === 'Suspended').length,
    }),
    [members],
  );

  const selected = members.find((member) => member.id === selectedId) ?? null;
  const totalPages = Math.max(1, Math.ceil(filtered.length / MEMBERS_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * MEMBERS_PAGE_SIZE;
  const pagedMembers = filtered.slice(pageStart, pageStart + MEMBERS_PAGE_SIZE);
  const selectedMembers = members.filter((member) => selectedIds.has(member.id));
  const selectedCount = selectedMembers.length;
  const selectablePageIds = pagedMembers.map((member) => member.id);
  const isPageSelected = selectablePageIds.length > 0 && selectablePageIds.every((id) => selectedIds.has(id));
  const hasSelectedActive = selectedMembers.some((member) => member.status !== 'Suspended');
  const hasSelectedSuspended = selectedMembers.some((member) => member.status === 'Suspended');
  const memberActionVisibility = {
    bulk: selectedCount > 0,
    invite: true,
    create: true,
  };

  const statusFilters = [
    { value: 'all', label: t('filters.all') },
    { value: 'active', label: t('filters.active') },
    { value: 'invited', label: t('filters.invited') },
    { value: 'suspended', label: t('filters.suspended') },
  ] as const;

  const countTitle = t('table.countHint', {
    total: members.length,
    active: statusCounts.active,
    invited: statusCounts.invited,
    suspended: statusCounts.suspended,
  });

  function toggleMemberSelection(memberId: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(memberId);
      } else {
        next.delete(memberId);
      }
      return next;
    });
  }

  function togglePageSelection(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      selectablePageIds.forEach((id) => {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  }

  return (
    <div className={selectedCount ? 'vx-page-stack vx-members-page vx-members-page--selecting' : 'vx-page-stack vx-members-page'}>
      <PageHeader
        eyebrow={t('header.eyebrow')}
        title={t('header.title')}
        description={t('header.description')}
      />

      {message ? <p className="vx-profile-message">{message}</p> : null}
      {error ? <p className="vx-profile-error">{error}</p> : null}

      <div className="vx-members-workspace">
        <div className="vx-members-actionbar">
          <div className="vx-members-header-actions">
            {memberActionVisibility.bulk ? (
              <div className="vx-members-header-selection">
                <span>{t('bulk.selected', { count: selectedCount })}</span>
                <ActionButton
                  variant="outline"
                  icon="shield-check"
                  disabled={submitting || !hasSelectedActive}
                  onClick={() => void handleBulkStatus('banned')}
                >
                  {t('bulk.disable')}
                </ActionButton>
                <ActionButton
                  variant="outline"
                  icon="check"
                  disabled={submitting || !hasSelectedSuspended}
                  onClick={() => void handleBulkStatus('active')}
                >
                  {t('bulk.enable')}
                </ActionButton>
                <ActionButton
                  variant="outline"
                  icon="user-switch"
                  disabled={submitting}
                  onClick={() => setBulkUnlinkOpen(true)}
                >
                  {t('bulk.unlink')}
                </ActionButton>
              </div>
            ) : null}
            <div className="vx-members-header-primary">
              {memberActionVisibility.invite ? (
                <ActionButton variant="outline" icon="mail" onClick={() => openCreateDialog('invite')}>
                  {t('header.inviteMember')}
                </ActionButton>
              ) : null}
              {memberActionVisibility.create ? (
                <ActionButton icon="plus" onClick={() => openCreateDialog('create')}>
                  {t('header.addMember')}
                </ActionButton>
              ) : null}
            </div>
          </div>
        </div>

        <div className="vx-members-toolbar">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('table.searchPlaceholder')}
            className="vx-search-input vx-members-toolbar__search"
            aria-label={t('table.searchAriaLabel')}
          />
          <div className="vx-members-toolbar__filters">
            <span className="vx-members-toolbar__count" title={countTitle}>
              {t('table.toolbarTitle', { count: filtered.length })}
            </span>
            <div className="vx-segmented-control" role="tablist" aria-label={t('table.filterAriaLabel')}>
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  role="tab"
                  title={filter.label}
                  aria-selected={status === filter.value}
                  className={
                    status === filter.value
                      ? 'vx-segmented-control__item vx-segmented-control__item--active'
                      : 'vx-segmented-control__item'
                  }
                  onClick={() => setStatus(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="vx-member-list">
          <div className="vx-member-list__header">
            <label className="vx-member-select vx-member-select--header" title={t('table.selectPage')}>
              <input
                type="checkbox"
                checked={isPageSelected}
                aria-label={t('table.selectPage')}
                onChange={(event) => togglePageSelection(event.target.checked)}
              />
            </label>
            <span>{t('table.columns.name')}</span>
            <span>{t('table.columns.phone')}</span>
            <span>{t('table.columns.email')}</span>
            <span>{t('table.columns.role')}</span>
            <span>{t('table.columns.status')}</span>
            <span>{t('table.columns.lastActive')}</span>
            <span />
          </div>
          {pagedMembers.length ? (
            pagedMembers.map((member) => {
              const username = memberUsername(member);
              const detailTitle = t('table.memberTitle', {
                name: member.name,
                username,
                phone: member.phone ?? t('table.emptyPhone'),
                email: member.email,
                role: member.role,
                team: member.team,
                status: t(`status.${member.status}`),
              });

              return (
                <div
                  key={member.id}
                  className={
                    openMenuId === member.id
                      ? 'vx-member-table__row vx-member-table__row--active'
                      : 'vx-member-table__row'
                  }
                  title={detailTitle}
                >
                  <label className="vx-member-select" title={t('table.selectMember', { name: member.name })}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(member.id)}
                      aria-label={t('table.selectMember', { name: member.name })}
                      onChange={(event) => toggleMemberSelection(member.id, event.target.checked)}
                    />
                  </label>
                  <div className="vx-member-table__identity">
                    <Avatar
                      className="vx-member-table__avatar"
                      role="img"
                      aria-label={t('table.avatarAlt', { name: member.name })}
                      style={{ backgroundImage: `url("${memberAvatar(member)}")` }}
                    >
                      <span className="vx-member-table__avatar-label">{member.name}</span>
                    </Avatar>
                    <div className="vx-member-table__person">
                      <div className="vx-member-table__person-line">
                        <strong>{member.name}</strong>
                        {member.isPrimaryOwner ? <span>{t('table.primaryOwner')}</span> : null}
                      </div>
                      <p title={username}>{username}</p>
                    </div>
                  </div>
                  <span className="vx-member-table__muted" title={member.phone ?? t('table.emptyPhone')}>
                    {member.phone ?? t('table.emptyPhone')}
                  </span>
                  <span className="vx-member-table__muted" title={member.email}>
                    {member.email}
                  </span>
                  <span className="vx-member-table__text" title={member.role}>
                    {member.role}
                  </span>
                  <span>
                    <Badge
                      className={`vx-member-status ${statusClassMap[member.status]}`}
                      title={t('table.statusTitle', { status: t(`status.${member.status}`) })}
                    >
                      {t(`status.${member.status}`)}
                    </Badge>
                  </span>
                  <span className="vx-member-table__muted" title={member.lastActive}>
                    {member.lastActive}
                  </span>
                  <div
                    className="vx-member-table__menu"
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setOpenMenuId(null);
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('actions.menuLabel', { name: member.name })}
                      title={t('actions.menuLabel', { name: member.name })}
                      aria-haspopup="menu"
                      aria-expanded={openMenuId === member.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId((current) => (current === member.id ? null : member.id));
                      }}
                    >
                      <Icon name="more-vertical" size="xs" fallback="placeholder" />
                    </Button>
                    {openMenuId === member.id ? (
                      <div className="vx-member-actions-menu" role="menu">
                        <button type="button" role="menuitem" onClick={() => openEditDialog(member)}>
                          <Icon name="edit" size="xs" fallback="placeholder" />
                          <span>{t('actions.edit')}</span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          disabled={submitting}
                          onClick={() => void handleToggleMemberStatus(member)}
                        >
                          <Icon name="shield-check" size="xs" fallback="placeholder" />
                          <span>
                            {member.status === 'Suspended'
                              ? t('actions.enableMember')
                              : member.status === 'Invited'
                                ? t('actions.disableInvite')
                                : t('actions.disableMember')}
                          </span>
                        </button>
                        <button type="button" role="menuitem" onClick={() => openResetDialog(member)}>
                          <Icon name="key" size="xs" fallback="placeholder" />
                          <span>{t('actions.resetPassword')}</span>
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="vx-member-actions-menu__danger"
                          disabled={submitting}
                          onClick={() => openUnlinkDialog(member)}
                        >
                          <Icon name="user-switch" size="xs" fallback="placeholder" />
                          <span>{t('actions.unlink')}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
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

        <div className="vx-members-pagination">
          <div className="vx-members-pagination__actions">
            <span>{t('pagination.summary', { page: safeCurrentPage, totalPages, total: filtered.length })}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              {t('pagination.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </div>

        {createMode ? (
          <div
            className="vx-profile-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={createMode === 'invite' ? t('dialogs.invite.title') : t('dialogs.create.title')}
          >
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
                <Input
                  value={memberForm.nickname}
                  onChange={(event) => setMemberForm((old) => ({ ...old, nickname: event.target.value }))}
                />
              </Label>
              <Label>
                {t('dialogs.fields.teamRemark')}
                <Input
                  value={memberForm.remark}
                  onChange={(event) => setMemberForm((old) => ({ ...old, remark: event.target.value }))}
                />
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
                <Button variant="outline" onClick={() => setCreateMode(null)}>
                  {t('dialogs.actions.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {createMode === 'invite' ? t('dialogs.actions.sendInvite') : t('dialogs.actions.create')}
                </Button>
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
                <Input
                  value={memberForm.nickname}
                  onChange={(event) => setMemberForm((old) => ({ ...old, nickname: event.target.value }))}
                />
              </Label>
              <Label>
                {t('dialogs.fields.teamRemark')}
                <Input
                  value={memberForm.remark}
                  onChange={(event) => setMemberForm((old) => ({ ...old, remark: event.target.value }))}
                />
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
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  {t('dialogs.actions.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {t('dialogs.actions.save')}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {resetOpen && selected ? (
          <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t('dialogs.reset.title')}>
            <div className="vx-profile-dialog__backdrop" onClick={() => setResetOpen(false)} />
            <form className="vx-profile-dialog__content" onSubmit={(event) => void submitResetPassword(event)}>
              <h3>{t('dialogs.reset.title')}</h3>
              <p className="vx-profile-dialog__hint">{t('dialogs.reset.description', { name: selected.name })}</p>
              <Label>
                {t('dialogs.fields.nextPassword')}
                <Input
                  type="password"
                  value={passwordForm.nextPassword}
                  onChange={(event) => setPasswordForm({ nextPassword: event.target.value })}
                  minLength={6}
                  required
                />
              </Label>
              <div className="vx-profile-dialog__actions">
                <Button variant="outline" onClick={() => setResetOpen(false)}>
                  {t('dialogs.actions.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {t('dialogs.actions.resetPassword')}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {unlinkOpen && selected ? (
          <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t('dialogs.unlink.title')}>
            <div className="vx-profile-dialog__backdrop" onClick={() => setUnlinkOpen(false)} />
            <form className="vx-profile-dialog__content" onSubmit={(event) => {
              event.preventDefault();
              void handleUnlinkMember();
            }}>
              <h3>{t('dialogs.unlink.title')}</h3>
              <p className="vx-profile-dialog__hint">{t('dialogs.unlink.description', { name: selected.name })}</p>
              <div className="vx-profile-dialog__actions">
                <Button variant="outline" onClick={() => setUnlinkOpen(false)}>
                  {t('dialogs.actions.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {t('dialogs.actions.unlink')}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {bulkUnlinkOpen ? (
          <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t('dialogs.bulkUnlink.title')}>
            <div className="vx-profile-dialog__backdrop" onClick={() => setBulkUnlinkOpen(false)} />
            <form className="vx-profile-dialog__content" onSubmit={(event) => {
              event.preventDefault();
              void handleBulkUnlink();
            }}>
              <h3>{t('dialogs.bulkUnlink.title')}</h3>
              <p className="vx-profile-dialog__hint">{t('dialogs.bulkUnlink.description', { count: selectedCount })}</p>
              <div className="vx-profile-dialog__actions">
                <Button variant="outline" onClick={() => setBulkUnlinkOpen(false)}>
                  {t('dialogs.actions.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {t('dialogs.actions.unlink')}
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
