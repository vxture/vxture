'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { Badge, Button, Input, NativeSelect } from '@vxture/design-system';
import { fetchTenantOperations } from '@/api/admin-bff';
import type {
  TenantOperationMember,
  TenantOperationModelPolicy,
  TenantOperationRecord,
  TenantOperationSubscription,
  TenantOperationUsageMetric,
} from '@/entities/console';
import { EmptyState } from '@/modules/shared/EmptyState';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';
import { resolveIpLocation } from '@/shared/ip-location';
import {
  auditResultLabel,
  formatDate,
  formatMoney,
  formatNumber,
  joinClasses,
  memberStatusLabel,
  modelPolicyStateLabel,
  policySourceLabel,
  riskLabel,
  statusLabel,
  subscriptionStatusLabel,
  ticketStatusLabel,
  usagePercent,
  verifiedLabel,
} from './tenant-utils';

type TenantTabId = 'info' | 'members' | 'subscriptions' | 'usage' | 'models' | 'risk' | 'tickets';
type MemberViewMode = 'list' | 'cards';
type MemberStatusFilter = 'all' | TenantOperationMember['status'];
type MemberRoleFilter = 'all' | string;
type TenantInfoDraft = {
  tenantCode: string;
  tenantName: string;
  displayName: string;
  tenantType: TenantOperationRecord['tenantType'];
  status: TenantOperationRecord['status'];
};

const tenantTabs: Array<{ id: TenantTabId; label: string; icon: IconName }> = [
  { id: 'info', label: '租户信息', icon: 'buildings' },
  { id: 'members', label: '成员账号', icon: 'user' },
  { id: 'subscriptions', label: '订阅产品', icon: 'star' },
  { id: 'usage', label: '配额用量', icon: 'graph' },
  { id: 'models', label: '模型授权', icon: 'shield-check' },
  { id: 'risk', label: '风控审计', icon: 'table' },
  { id: 'tickets', label: '工单备注', icon: 'chat-circle' },
];

const tenantTypeOptions: Array<{ value: TenantOperationRecord['tenantType']; label: string }> = [
  { value: 'company', label: '企业租户' },
  { value: 'individual', label: '个人租户' },
];

const tenantStatusOptions: Array<{ value: TenantOperationRecord['status']; label: string }> = [
  { value: 'active', label: '正常' },
  { value: 'trial', label: '试用' },
  { value: 'suspended', label: '暂停' },
  { value: 'cancelled', label: '注销' },
];

function TenantKeyMetric({
  label,
  value,
  tag,
  tags,
  danger,
}: {
  label: string;
  value: string;
  tag?: string;
  tags?: string[];
  danger?: boolean;
}) {
  const visibleTags = tags ?? (tag ? [tag] : []);

  return (
    <div className="vx-tenant-key-metric">
      <span>{label}</span>
      <p>
        <strong className={danger ? 'is-danger' : undefined}>{value}</strong>
        {visibleTags.map((item) => (
          <em key={item}>{item}</em>
        ))}
      </p>
    </div>
  );
}

function TenantSectionHeading({ icon, title }: { icon: IconName; title: string }) {
  return (
    <div className="admin-overview-heading">
      <span className="admin-overview-heading__icon" aria-hidden="true">
        <Icon name={icon} size="lg" fallback="placeholder" />
      </span>
      <div className="admin-overview-heading__copy">
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function createTenantInfoDraft(tenant: TenantOperationRecord): TenantInfoDraft {
  return {
    tenantCode: tenant.tenantCode,
    tenantName: tenant.tenantName,
    displayName: tenant.displayName,
    tenantType: tenant.tenantType,
    status: tenant.status,
  };
}

function isTenantInfoDirty(current: TenantInfoDraft | null, baseline: TenantInfoDraft | null) {
  if (!current || !baseline) return false;
  return Object.keys(current).some((key) => current[key as keyof TenantInfoDraft] !== baseline[key as keyof TenantInfoDraft]);
}

function isAgentSubscription(subscription: TenantOperationSubscription) {
  const searchableText = `${subscription.productName} ${subscription.releaseName} ${subscription.planName}`.toLowerCase();
  return searchableText.includes('agent') || searchableText.includes('智能体') || searchableText.includes('ruyin');
}

function getTenantSubscriptionSummary(tenant: TenantOperationRecord) {
  const knownSubscriptions = tenant.subscriptions.length || tenant.subscriptionCount;
  const agentCount = tenant.subscriptions.filter(isAgentSubscription).length;
  const platformCount = Math.max(knownSubscriptions - agentCount, 0);

  return { agentCount, platformCount };
}

function getActiveMonthCount(startedAt: string) {
  const started = new Date(startedAt);
  if (Number.isNaN(started.getTime())) return 1;

  const now = new Date();
  const monthCount = (now.getFullYear() - started.getFullYear()) * 12 + now.getMonth() - started.getMonth() + 1;
  return Math.max(monthCount, 1);
}

function getTenantCumulativeRevenue(tenant: TenantOperationRecord) {
  const cumulativeRevenue = tenant.subscriptions.reduce(
    (total, subscription) => total + subscription.monthlyRevenue * getActiveMonthCount(subscription.startedAt),
    0,
  );

  return cumulativeRevenue || tenant.monthlyRevenue;
}

function getMemberAccountCode(member: TenantOperationMember) {
  return member.accountCode ?? member.email.split('@')[0] ?? '-';
}

function getMemberStatusTime(member: TenantOperationMember) {
  return member.activatedAt ?? member.registeredAt ?? member.lastActiveAt;
}

function getMemberSearchText(member: TenantOperationMember) {
  return [
    member.name,
    member.email,
    getMemberAccountCode(member),
    member.role,
    member.status,
    resolveIpLocation(member.lastActiveIp),
  ].join(' ').toLowerCase();
}

function TenantConfigItem({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `vx-tenant-config-item ${className}` : 'vx-tenant-config-item'}>
      <span>{label}</span>
      <div className="vx-tenant-config-item__value">{children}</div>
    </div>
  );
}

function TenantConfigValue({ children }: { children: ReactNode }) {
  return <strong>{children || '-'}</strong>;
}

function TenantInfoTab({
  tenant,
  draft,
  editing,
  infoDirty,
  showVerificationReview,
  reviewHref,
  onDraftChange,
  onEdit,
  onReset,
  onSave,
  onChangeAdmin,
  onResetPassword,
}: {
  tenant: TenantOperationRecord;
  draft: TenantInfoDraft;
  editing: boolean;
  infoDirty: boolean;
  showVerificationReview: boolean;
  reviewHref: string;
  onDraftChange: <K extends keyof TenantInfoDraft>(field: K, value: TenantInfoDraft[K]) => void;
  onEdit: () => void;
  onReset: () => void;
  onSave: () => void;
  onChangeAdmin: () => void;
  onResetPassword: () => void;
}) {
  return (
    <div className="vx-tenant-tab-grid vx-tenant-tab-grid--info">
      <section className="vx-tenant-block">
        <header>
          <TenantSectionHeading icon="buildings" title="基础资料" />
          <div className="vx-tenant-block__actions" aria-label="基础资料操作">
            {editing ? (
              <>
                {infoDirty ? <span className="vx-tenant-unsaved">有未保存修改</span> : null}
                <Button variant="outline" onClick={onReset}>放弃</Button>
                <Button className={infoDirty ? 'vx-tenant-save-alert' : undefined} disabled={!infoDirty} onClick={onSave}>保存</Button>
              </>
            ) : (
              <>
                {showVerificationReview ? (
                  <Link className="vx-tenant-review-action" href={reviewHref}>
                    <Icon name="medal" size="xs" fallback="placeholder" />
                    <span>认证审核</span>
                  </Link>
                ) : null}
                <Button variant="outline" onClick={onEdit}>
                  <Icon name="edit" size="xs" fallback="placeholder" />
                  <span>修改</span>
                </Button>
              </>
            )}
          </div>
        </header>
        <div className="vx-tenant-config-stack">
          <div className="vx-tenant-config-row vx-tenant-config-row--three">
            <TenantConfigItem label="租户代码">
              {editing ? <Input value={draft.tenantCode} onChange={(event) => onDraftChange('tenantCode', event.target.value)} /> : <TenantConfigValue>{draft.tenantCode}</TenantConfigValue>}
            </TenantConfigItem>
            <TenantConfigItem label="租户名称">
              {editing ? <Input value={draft.tenantName} onChange={(event) => onDraftChange('tenantName', event.target.value)} /> : <TenantConfigValue>{draft.tenantName}</TenantConfigValue>}
            </TenantConfigItem>
            <TenantConfigItem label="租户简称">
              {editing ? <Input value={draft.displayName} onChange={(event) => onDraftChange('displayName', event.target.value)} /> : <TenantConfigValue>{draft.displayName}</TenantConfigValue>}
            </TenantConfigItem>
          </div>

          <div className="vx-tenant-config-row vx-tenant-config-row--three">
            <TenantConfigItem label="租户类型">
              {editing ? (
                <NativeSelect
                  className="vx-input vx-tenant-select"
                  value={draft.tenantType}
                  onChange={(event) => onDraftChange('tenantType', event.target.value as TenantInfoDraft['tenantType'])}
                >
                  {tenantTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </NativeSelect>
              ) : (
                <Badge className={`vx-tenant-pill vx-tenant-pill--${draft.tenantType}`}>
                  {tenantTypeOptions.find((option) => option.value === draft.tenantType)?.label}
                </Badge>
              )}
            </TenantConfigItem>
            <TenantConfigItem label="租户状态">
              {editing ? (
                <NativeSelect
                  className="vx-input vx-tenant-select"
                  value={draft.status}
                  onChange={(event) => onDraftChange('status', event.target.value as TenantInfoDraft['status'])}
                >
                  {tenantStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </NativeSelect>
              ) : (
                <Badge className={`vx-tenant-pill vx-tenant-pill--${draft.status}`}>{statusLabel(draft.status)}</Badge>
              )}
            </TenantConfigItem>
            <TenantConfigItem label="认证状态">
              <Badge className={`vx-tenant-pill vx-tenant-pill--${tenant.verifiedStatus}`}>{verifiedLabel(tenant.verifiedStatus)}</Badge>
            </TenantConfigItem>
          </div>

          <div className="vx-tenant-config-row vx-tenant-config-row--three">
            <TenantConfigItem label="所属区域">
              <TenantConfigValue>{tenant.region}</TenantConfigValue>
            </TenantConfigItem>
            <TenantConfigItem label="所属行业">
              <TenantConfigValue>{tenant.industry}</TenantConfigValue>
            </TenantConfigItem>
            <TenantConfigItem label="人员规模">
              <TenantConfigValue>{tenant.scale}</TenantConfigValue>
            </TenantConfigItem>
          </div>
        </div>
      </section>

      <section className="vx-tenant-block">
        <header>
          <TenantSectionHeading icon="user-switch" title="主管理员" />
        </header>
        <div className="vx-tenant-config-row vx-tenant-config-row--contact">
          <TenantConfigItem label="姓名">
            <TenantConfigValue>
              {tenant.ownerName}
              {tenant.tenantType === 'individual' ? <Badge className="vx-tenant-pill vx-tenant-pill--owner">owner</Badge> : null}
            </TenantConfigValue>
          </TenantConfigItem>
          <TenantConfigItem label="Mail">
            <TenantConfigValue>{tenant.ownerEmail}</TenantConfigValue>
          </TenantConfigItem>
          <TenantConfigItem label="Phone">
            <TenantConfigValue>{tenant.contactPhone}</TenantConfigValue>
          </TenantConfigItem>
          <div className="vx-tenant-admin-actions">
            <Button variant="outline" size="sm" onClick={onChangeAdmin}>
              <Icon name="user-switch" size="xs" fallback="placeholder" />
              <span>修改主管理员</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onResetPassword}>
              <Icon name="key" size="xs" fallback="placeholder" />
              <span>重置密码</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="vx-tenant-block vx-tenant-block--wide">
        <header>
          <TenantSectionHeading icon="info" title="运营备注" />
        </header>
        <p className="vx-tenant-note">{tenant.notes}</p>
        <div className="vx-tenant-tags">
          {tenant.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function MemberActionsMenu({
  member,
  open,
  onToggle,
  onClose,
}: {
  member: TenantOperationMember;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="vx-tenant-actions vx-tenant-member-actions" onClick={(event) => event.stopPropagation()} onMouseLeave={onClose}>
      <Button variant="ghost" size="icon" className="vx-tenant-actions__trigger" aria-label={`${member.name} 操作`} title="操作" onClick={onToggle}>
        <Icon name="more-vertical" size="lg" fallback="placeholder" />
      </Button>
      {open ? (
        <div className="vx-tenant-actions__menu" role="menu">
          <Button variant="ghost" role="menuitem" disabled>
            <Icon name="user-switch" size="xs" fallback="placeholder" />
            调整权限
          </Button>
          <Button variant="ghost" role="menuitem" disabled>
            <Icon name="key" size="xs" fallback="placeholder" />
            重置密码
          </Button>
          <Button variant="ghost" role="menuitem" disabled>
            <Icon name={member.status === 'suspended' ? 'success' : 'warning'} size="xs" fallback="placeholder" />
            {member.status === 'suspended' ? '恢复账号' : '停用账号'}
          </Button>
          <Button variant="ghost" role="menuitem" disabled>
            <Icon name="trash" size="xs" fallback="placeholder" />
            移除账号
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function TenantMemberIdentity({ member }: { member: TenantOperationMember }) {
  return (
    <span className="vx-tenant-member-row__identity">
      <Icon name={member.role.toLowerCase() === 'owner' ? 'shield-check' : 'user'} size="sm" fallback="placeholder" />
      <span className="vx-tenant-member-row__name">
        <strong>{member.name}</strong>
        <small>{getMemberAccountCode(member)}</small>
        <small>{member.email}</small>
      </span>
    </span>
  );
}

function TenantMemberStatus({ member }: { member: TenantOperationMember }) {
  const statusTimeValue = getMemberStatusTime(member);
  const statusTime = formatDate(statusTimeValue);

  return (
    <span className="vx-tenant-member-row__status">
      <Badge className={`vx-tenant-pill vx-tenant-member-status-pill vx-tenant-pill--${member.status}`}>{memberStatusLabel(member.status)}</Badge>
      <small title={`注册激活时间 ${statusTime}`} aria-label={`注册激活时间 ${statusTime}`}>
        {statusTime}
      </small>
    </span>
  );
}

function TenantMemberActiveAt({ member }: { member: TenantOperationMember }) {
  const location = resolveIpLocation(member.lastActiveIp);

  return (
    <span>
      <strong>{formatDate(member.lastActiveAt)}</strong>
      <small title={member.lastActiveIp ? `登录 IP ${member.lastActiveIp}` : '暂无登录 IP'}>{location}</small>
    </span>
  );
}

function TenantMemberList({
  members,
  openMenuId,
  onToggleMenu,
  onCloseMenu,
}: {
  members: TenantOperationMember[];
  openMenuId: string | null;
  onToggleMenu: (memberId: string) => void;
  onCloseMenu: () => void;
}) {
  return (
    <div className="vx-tenant-member-list" role="region" aria-label="账号列表">
      <div className="vx-tenant-member-list__header">
        <span>序号</span>
        <span>账号</span>
        <span>权限</span>
        <span>状态</span>
        <span>最近活跃</span>
        <span>操作</span>
      </div>
      {members.map((member, index) => (
        <div key={member.id} className={joinClasses('vx-tenant-member-row', `vx-tenant-member-row--${member.status}`)}>
          <span className="vx-tenant-member-row__index">{formatNumber(index + 1)}</span>
          <TenantMemberIdentity member={member} />
          <span className="vx-tenant-member-row__permission">
            <Badge className="vx-tenant-pill vx-tenant-pill--permission">{member.role}</Badge>
          </span>
          <TenantMemberStatus member={member} />
          <TenantMemberActiveAt member={member} />
          <MemberActionsMenu member={member} open={openMenuId === member.id} onToggle={() => onToggleMenu(member.id)} onClose={onCloseMenu} />
        </div>
      ))}
    </div>
  );
}

function TenantMemberCards({
  members,
  openMenuId,
  onToggleMenu,
  onCloseMenu,
}: {
  members: TenantOperationMember[];
  openMenuId: string | null;
  onToggleMenu: (memberId: string) => void;
  onCloseMenu: () => void;
}) {
  return (
    <div className="vx-tenant-member-cards" aria-label="账号卡片">
      {members.map((member) => {
        const location = resolveIpLocation(member.lastActiveIp);
        const statusTime = formatDate(getMemberStatusTime(member));

        return (
          <article key={member.id} className={joinClasses('vx-tenant-member-card', `vx-tenant-member-row--${member.status}`)}>
            <header>
              <Icon name={member.role.toLowerCase() === 'owner' ? 'shield-check' : 'user'} size="lg" fallback="placeholder" />
              <div className="vx-tenant-member-row__name">
                <strong>{member.name}</strong>
                <small>{getMemberAccountCode(member)}</small>
                <small>{member.email}</small>
              </div>
              <MemberActionsMenu member={member} open={openMenuId === member.id} onToggle={() => onToggleMenu(member.id)} onClose={onCloseMenu} />
            </header>
            <div className="vx-tenant-member-card__badges">
              <Badge className="vx-tenant-pill vx-tenant-pill--permission">{member.role}</Badge>
              <Badge className={`vx-tenant-pill vx-tenant-member-status-pill vx-tenant-pill--${member.status}`}>{memberStatusLabel(member.status)}</Badge>
            </div>
            <div className="vx-tenant-member-card__metrics">
              <span>
                <strong>{statusTime}</strong>
                <small title={`注册激活时间 ${statusTime}`}>注册激活</small>
              </span>
              <span>
                <strong>{formatDate(member.lastActiveAt)}</strong>
                <small title={member.lastActiveIp ? `登录 IP ${member.lastActiveIp}` : '暂无登录 IP'}>{location}</small>
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function TenantMembersTab({ members }: { members: TenantOperationMember[] }) {
  const [viewMode, setViewMode] = useState<MemberViewMode>('list');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<MemberRoleFilter>('all');

  const roleOptions = useMemo(
    () => Array.from(new Set(members.map((member) => member.role))).sort((left, right) => left.localeCompare(right)),
    [members],
  );
  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return members.filter((member) => {
      const matchQuery = normalizedQuery ? getMemberSearchText(member).includes(normalizedQuery) : true;
      const matchStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchRole = roleFilter === 'all' || member.role === roleFilter;
      return matchQuery && matchStatus && matchRole;
    });
  }, [members, query, roleFilter, statusFilter]);

  const activeCount = members.filter((member) => member.status === 'active').length;
  const invitedCount = members.filter((member) => member.status === 'invited').length;
  const suspendedCount = members.filter((member) => member.status === 'suspended').length;

  function handleReset() {
    setQuery('');
    setStatusFilter('all');
    setRoleFilter('all');
    setOpenMenuId(null);
  }

  function handleToggleMenu(memberId: string) {
    setOpenMenuId((current) => (current === memberId ? null : memberId));
  }

  return (
    <div className="vx-tenant-list-shell vx-tenant-member-shell">
      <section className="vx-tenant-toolbar vx-tenant-member-toolbar" aria-label="账号筛选">
        <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="账号展示方式" />
        <span className="vx-tenant-view-count">{formatNumber(filteredMembers.length)}</span>
        <div className="vx-tenant-member-summary" aria-label="账号统计">
          <Badge className="vx-tenant-pill vx-tenant-pill--active">活跃 {formatNumber(activeCount)}</Badge>
          <Badge className="vx-tenant-pill vx-tenant-pill--invited">邀请 {formatNumber(invitedCount)}</Badge>
          <Badge className="vx-tenant-pill vx-tenant-pill--suspended">停用 {formatNumber(suspendedCount)}</Badge>
        </div>
        <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索账号、账号代码、邮箱"
          className="vx-tenant-search vx-tenant-member-search"
          aria-label="搜索账号"
        />
        <Button variant="outline" onClick={handleReset}>重置</Button>
        <NativeSelect
          className="vx-input vx-tenant-select vx-tenant-member-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as MemberStatusFilter)}
          aria-label="账号状态"
        >
          <option value="all">全部状态</option>
          <option value="active">正常</option>
          <option value="invited">邀请中</option>
          <option value="suspended">停用</option>
        </NativeSelect>
        <NativeSelect
          className="vx-input vx-tenant-select vx-tenant-member-select"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          aria-label="账号权限"
        >
          <option value="all">全部权限</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </NativeSelect>
      </section>

      <section className="vx-tenant-directory vx-tenant-member-directory" aria-label="账号清单">
        {filteredMembers.length ? (
          viewMode === 'list' ? (
            <TenantMemberList members={filteredMembers} openMenuId={openMenuId} onToggleMenu={handleToggleMenu} onCloseMenu={() => setOpenMenuId(null)} />
          ) : (
            <TenantMemberCards members={filteredMembers} openMenuId={openMenuId} onToggleMenu={handleToggleMenu} onCloseMenu={() => setOpenMenuId(null)} />
          )
        ) : (
          <section className="vx-tenant-empty">
            <EmptyState
              title="没有匹配的账号"
              description="清空筛选条件后可查看全部账号。"
              action={<Button variant="outline" onClick={handleReset}>清空筛选</Button>}
            />
          </section>
        )}
      </section>
    </div>
  );
}

function TenantSubscriptionsTab({ subscriptions }: { subscriptions: TenantOperationSubscription[] }) {
  return (
    <div className="vx-tenant-subscriptions">
      {subscriptions.map((subscription) => (
        <article key={subscription.id} className={`vx-tenant-subscription vx-tenant-subscription--${subscription.status}`}>
          <header>
            <div>
              <strong>{subscription.productName}</strong>
              <span>{subscription.releaseName}</span>
            </div>
            <Badge className={`vx-tenant-pill vx-tenant-pill--${subscription.status}`}>{subscriptionStatusLabel(subscription.status)}</Badge>
          </header>
          <div className="vx-tenant-subscription__metrics">
            <TenantKeyMetric label="发布版本" value={subscription.planName} />
            <TenantKeyMetric label="席位" value={formatNumber(subscription.seats)} />
            <TenantKeyMetric label="月收入" value={formatMoney(subscription.monthlyRevenue)} />
            <TenantKeyMetric label="续费时间" value={formatDate(subscription.renewsAt)} />
          </div>
        </article>
      ))}
    </div>
  );
}

function TenantUsageTab({ usage }: { usage: TenantOperationUsageMetric[] }) {
  return (
    <div className="vx-tenant-usage-list">
      {usage.map((metric) => {
        const percent = usagePercent(metric);
        return (
          <article key={metric.code} className={`vx-tenant-usage vx-tenant-usage--${metric.status}`}>
            <header>
              <strong>{metric.label}</strong>
              <span>{metric.trend}</span>
            </header>
            <div className="vx-tenant-usage__numbers">
              <b>{formatNumber(metric.used)}</b>
              <small>{metric.quota === null ? '不限量' : ` / ${formatNumber(metric.quota)} ${metric.unit}`}</small>
            </div>
            <div className="vx-tenant-usage__bar" aria-hidden="true">
              <span style={{ width: `${percent}%` }} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function TenantModelsTab({ policies }: { policies: TenantOperationModelPolicy[] }) {
  return (
    <div className="vx-tenant-table vx-tenant-table--models">
      <div className="vx-tenant-table__header">
        <span>智能体</span>
        <span>产品</span>
        <span>模型</span>
        <span>配额</span>
        <span>状态</span>
      </div>
      {policies.map((policy) => (
        <div key={policy.id} className="vx-tenant-table__row">
          <span>
            <strong>{policy.agentName}</strong>
            <small>{policySourceLabel(policy.source)}</small>
          </span>
          <span>{policy.productName}</span>
          <span>{policy.modelCode}</span>
          <span>{formatNumber(policy.usedTokens)} / {formatNumber(policy.quotaTokens)}</span>
          <span>
            <Badge className={`vx-tenant-pill vx-tenant-pill--${policy.state}`}>{modelPolicyStateLabel(policy.state)}</Badge>
          </span>
        </div>
      ))}
    </div>
  );
}

function TenantRiskTab({ tenant }: { tenant: TenantOperationRecord }) {
  return (
    <div className="vx-tenant-tab-grid vx-tenant-tab-grid--risk">
      <section className="vx-tenant-risk-panel">
        <header>
          <Icon name="shield-check" size="sm" fallback="placeholder" />
          <h3>风险状态</h3>
        </header>
        <div className="vx-tenant-risk-panel__level">
          <strong className={`vx-tenant-risk-text--${tenant.riskLevel}`}>{riskLabel(tenant.riskLevel)}</strong>
          <span>{verifiedLabel(tenant.verifiedStatus)}</span>
          <span>{tenant.ticketOpenCount} 个未结工单</span>
        </div>
        <p>{tenant.notes}</p>
      </section>

      <section className="vx-tenant-audit-list">
        <header>
          <Icon name="table" size="sm" fallback="placeholder" />
          <h3>审计记录</h3>
        </header>
        {tenant.auditEvents.map((event) => (
          <div key={event.id} className={`vx-tenant-audit-list__item vx-tenant-audit-list__item--${event.result}`}>
            <span>
              <strong>{event.action}</strong>
              <small>{event.actor}</small>
            </span>
            <em>{formatDate(event.at)}</em>
            <Badge className={`vx-tenant-pill vx-tenant-pill--${event.result}`}>{auditResultLabel(event.result)}</Badge>
          </div>
        ))}
      </section>
    </div>
  );
}

function TenantTicketsTab({ tenant }: { tenant: TenantOperationRecord }) {
  if (!tenant.tickets.length) {
    return (
      <div className="vx-tenant-empty">
        <EmptyState title="暂无未结工单" description="该租户当前没有需要平台运营跟进的工单。" />
      </div>
    );
  }

  return (
    <div className="vx-tenant-ticket-list">
      {tenant.tickets.map((ticket) => (
        <article key={ticket.id} className={`vx-tenant-ticket vx-tenant-ticket--${ticket.status}`}>
          <span>
            <strong>{ticket.title}</strong>
            <small>{ticket.id} · {ticket.priority.toUpperCase()}</small>
          </span>
          <Badge className={`vx-tenant-pill vx-tenant-pill--${ticket.status}`}>{ticketStatusLabel(ticket.status)}</Badge>
          <em>{formatDate(ticket.updatedAt)}</em>
        </article>
      ))}
    </div>
  );
}

export function TenantDetailPage({ tenantId }: { tenantId: string }) {
  const [tenants, setTenants] = useState<TenantOperationRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TenantTabId>('info');
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [infoEditing, setInfoEditing] = useState(false);
  const [infoDraft, setInfoDraft] = useState<TenantInfoDraft | null>(null);
  const [infoBaseline, setInfoBaseline] = useState<TenantInfoDraft | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchTenantOperations()
      .then((records) => {
        if (active) setTenants(records);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const tenant = useMemo(
    () => tenants.find((item) => item.id === tenantId || item.tenantCode === tenantId),
    [tenantId, tenants],
  );

  useEffect(() => {
    if (!tenant) return;
    const nextDraft = createTenantInfoDraft(tenant);
    setInfoDraft(nextDraft);
    setInfoBaseline(nextDraft);
    setInfoEditing(false);
  }, [tenant]);

  const infoDirty = useMemo(() => isTenantInfoDirty(infoDraft, infoBaseline), [infoDraft, infoBaseline]);

  if (!tenant) {
    return (
      <div className="vx-page-stack vx-tenant-management-page">
        <Link className="vx-tenant-back-link" href="/tenants">
          <Icon name="arrow-left" size="xs" fallback="placeholder" />
          返回租户列表
        </Link>
        <section className="vx-tenant-empty">
          <EmptyState
            title={loading ? '正在加载租户' : '未找到租户'}
            description={loading ? '正在读取租户详情。' : '该租户不存在，或当前筛选数据源尚未同步。'}
          />
        </section>
      </div>
    );
  }

  const visibleInfoDraft = infoDraft ?? createTenantInfoDraft(tenant);
  const currentTenantId = tenant.id;
  const showVerificationReview = tenant.verifiedStatus !== 'verified';
  const subscriptionSummary = getTenantSubscriptionSummary(tenant);
  const cumulativeRevenue = getTenantCumulativeRevenue(tenant);

  function handleInfoDraftChange<K extends keyof TenantInfoDraft>(field: K, value: TenantInfoDraft[K]) {
    setInfoDraft((current) => ({
      ...(current ?? visibleInfoDraft),
      [field]: value,
    }));
  }

  function handleInfoReset() {
    if (!infoBaseline) return;
    setInfoDraft(infoBaseline);
    setInfoEditing(false);
  }

  function handleInfoSave() {
    setTenants((records) =>
      records.map((record) =>
        record.id === currentTenantId
          ? {
              ...record,
              tenantCode: visibleInfoDraft.tenantCode,
              tenantName: visibleInfoDraft.tenantName,
              displayName: visibleInfoDraft.displayName,
              tenantType: visibleInfoDraft.tenantType,
              status: visibleInfoDraft.status,
            }
          : record,
      ),
    );
    setInfoBaseline(visibleInfoDraft);
    setInfoEditing(false);
  }

  function handleInfoEdit() {
    setActiveTab('info');
    setInfoEditing(true);
  }

  function handlePasswordReset() {
    setActiveTab('info');
  }

  function handleChangeAdmin() {
    setActiveTab('members');
  }

  async function handleCopyText(value: string) {
    if (!value) return;
    await navigator.clipboard?.writeText(value);
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page">
      <Link className="vx-tenant-back-link" href="/tenants">
        <Icon name="arrow-left" size="xs" fallback="placeholder" />
        返回租户列表
      </Link>

      <section
        className={summaryExpanded ? 'vx-tenant-detail-summary' : 'vx-tenant-detail-summary vx-tenant-detail-summary--collapsed'}
        aria-label={`${tenant.displayName} 标题概要`}
      >
        <Button
          className="vx-tenant-detail-summary__toggle"
          variant="ghost"
          size="icon"
          aria-expanded={summaryExpanded}
          aria-label={summaryExpanded ? '收起标题概要' : '展开标题概要'}
          title={summaryExpanded ? '收起标题概要' : '展开标题概要'}
          onClick={() => setSummaryExpanded((expanded) => !expanded)}
        >
          <Icon name={summaryExpanded ? 'chevron-up' : 'chevron-down'} size="xs" fallback="chevron-down" />
        </Button>

        <header className="vx-tenant-detail__header">
          <section className="vx-tenant-detail__identity" aria-label="租户概要">
            <span className="vx-tenant-detail__icon" aria-hidden="true">
              <Icon name={tenant.tenantType === 'company' ? 'buildings' : 'user'} size="lg" fallback="placeholder" />
            </span>
            <div className="vx-tenant-detail__title">
              <div className="vx-tenant-title-line vx-tenant-title-line--name">
                <h2>{tenant.displayName}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="vx-tenant-title-copy"
                  aria-label="复制租户名称"
                  title="复制租户名称"
                  onClick={() => void handleCopyText(tenant.displayName)}
                >
                  <Icon name="copy" size="xs" fallback="placeholder" />
                </Button>
              </div>
              <div className="vx-tenant-title-line vx-tenant-title-line--code">
                <p>{tenant.tenantCode}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="vx-tenant-title-copy"
                  aria-label="复制租户代码"
                  title="复制租户代码"
                  onClick={() => void handleCopyText(tenant.tenantCode)}
                >
                  <Icon name="copy" size="xs" fallback="placeholder" />
                </Button>
              </div>
              <div>
                <Badge className={`vx-tenant-pill vx-tenant-pill--${tenant.status}`}>{statusLabel(tenant.status)}</Badge>
                <Badge className={`vx-tenant-pill vx-tenant-pill--${tenant.verifiedStatus}`}>{verifiedLabel(tenant.verifiedStatus)}</Badge>
                <Badge className={`vx-tenant-pill vx-tenant-pill--risk-${tenant.riskLevel}`}>{riskLabel(tenant.riskLevel)}</Badge>
              </div>
            </div>
          </section>

          {summaryExpanded ? (
            <>
              <section className="vx-tenant-detail__metric-column" aria-label="成员和订阅概要">
                <TenantKeyMetric label="用户数量" value={formatNumber(tenant.memberCount)} tag={`活跃 ${formatNumber(tenant.activeMemberCount)}`} />
                <TenantKeyMetric
                  label="订阅产品"
                  value={formatNumber(tenant.subscriptionCount)}
                  tags={[`智能体${formatNumber(subscriptionSummary.agentCount)}个`, `平台${formatNumber(subscriptionSummary.platformCount)}个`]}
                />
              </section>

              <section className="vx-tenant-detail__metric-column" aria-label="用量和收入概要">
                <TenantKeyMetric label="配额消耗" value={formatNumber(tenant.tokenUsed)} tag="token" />
                <TenantKeyMetric label="本月收入" value={formatMoney(tenant.monthlyRevenue)} tag={`累计 ${formatMoney(cumulativeRevenue)}`} />
              </section>
            </>
          ) : null}
        </header>
      </section>

      <section className="vx-tenant-detail" aria-label={`${tenant.displayName} 管理详情`}>
        <div className="vx-tenant-detail__form">
          <div className="vx-tenant-detail__toolbar">
            <div className="vx-tenant-tabs" role="tablist" aria-label={`${tenant.displayName} 信息分区`}>
              {tenantTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                  size="sm"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={activeTab === tab.id ? 'is-active' : undefined}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon name={tab.icon} size="xs" fallback="placeholder" />
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          <section className="vx-tenant-tab-panel" role="tabpanel">
            {activeTab === 'info' ? (
              <TenantInfoTab
                tenant={tenant}
                draft={visibleInfoDraft}
                editing={infoEditing}
                infoDirty={infoDirty}
                showVerificationReview={showVerificationReview}
                reviewHref={`/verifications?tenantId=${encodeURIComponent(tenant.id)}`}
                onDraftChange={handleInfoDraftChange}
                onEdit={handleInfoEdit}
                onReset={handleInfoReset}
                onSave={handleInfoSave}
                onChangeAdmin={handleChangeAdmin}
                onResetPassword={handlePasswordReset}
              />
            ) : null}
            {activeTab === 'members' ? <TenantMembersTab members={tenant.members} /> : null}
            {activeTab === 'subscriptions' ? <TenantSubscriptionsTab subscriptions={tenant.subscriptions} /> : null}
            {activeTab === 'usage' ? <TenantUsageTab usage={tenant.usage} /> : null}
            {activeTab === 'models' ? <TenantModelsTab policies={tenant.modelPolicies} /> : null}
            {activeTab === 'risk' ? <TenantRiskTab tenant={tenant} /> : null}
            {activeTab === 'tickets' ? <TenantTicketsTab tenant={tenant} /> : null}
          </section>
        </div>
      </section>
    </div>
  );
}
