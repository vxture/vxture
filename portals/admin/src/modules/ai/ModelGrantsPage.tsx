'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ClockCounterClockwiseIcon, PlayIcon, ShieldCheckIcon, StopIcon } from '@phosphor-icons/react';
import { Icon } from '@vxture/design-system';
import { Badge, Button, Input, Label } from '@/components/ui/primitives';
import {
  createAiModelGrant,
  fetchAiModelGrants,
  fetchAiModels,
  fetchProductAgents,
  fetchProductModelPolicies,
  setAiModelGrantActive,
  updateAiModelGrant,
} from '@/api/admin-bff';
import type {
  AiModelGrantRecord,
  AiModelRecord,
  ProductAgentRecord,
  ProductModelPolicyRecord,
} from '@/entities/console';
import { useConsoleTranslations } from '@/lib/console-intl';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';
import { ViewModeSwitch } from '@/modules/shared/ViewModeSwitch';

type ViewMode = 'list' | 'cards';
type PolicyFilter = 'all' | 'platform' | 'product' | 'defaults' | 'undefined' | 'usable';
type DialogMode = 'createGrant' | 'editGrant' | null;
type PolicyStatus = 'usable' | 'zeroQuota' | 'inactive' | 'undefined';
type Feedback = { tone: 'success' | 'error'; key: string; values?: Record<string, number | string> } | null;

const POLICY_PAGE_SIZE = 12;
const OVERRIDE_PREVIEW_SIZE = 8;

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function defaultGrantForm(modelId = '') {
  return {
    modelId,
    tenantId: '',
    agentId: '',
    priority: '100',
    reason: '',
    expiresAt: '',
    isActive: true,
  };
}

function policyStatus(policy: ProductModelPolicyRecord): PolicyStatus {
  if (!policy.isDefined) {
    return 'undefined';
  }

  if (!policy.isActive) {
    return 'inactive';
  }

  if (!policy.isUnlimited && policy.quotaTokens <= 0) {
    return 'zeroQuota';
  }

  return 'usable';
}

function policySearchText(policy: ProductModelPolicyRecord, model: AiModelRecord | undefined) {
  return [
    policy.scopeCode,
    policy.scopeName,
    policy.subjectType,
    policy.subjectId,
    policy.subjectName,
    policy.productCode,
    policy.productName,
    policy.productRegion,
    policy.agentCode,
    policy.agentName,
    policy.modelCode,
    policy.note,
    model?.modelName,
    model?.provider,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function isDefaultPolicy(policy: ProductModelPolicyRecord) {
  return policy.scopeType === 'new_product_default' || policy.scopeType === 'tenant_default';
}

function policySubjectLabel(policy: ProductModelPolicyRecord) {
  return policy.subjectType === 'platform' ? '平台主体' : '租户主体';
}

function grantSearchText(
  grant: AiModelGrantRecord,
  model: AiModelRecord | undefined,
  agent: ProductAgentRecord | undefined,
) {
  return [
    grant.tenantId,
    grant.agentId,
    grant.reason,
    agent?.agentCode,
    agent?.agentName,
    model?.modelCode,
    model?.modelName,
    model?.provider,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

function formatTokens(value: number, unlimited: boolean, unlimitedLabel: string) {
  if (unlimited) {
    return unlimitedLabel;
  }

  return new Intl.NumberFormat('zh-CN').format(value);
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]'));
}

function ModelStrategySummaryItem({
  icon: SummaryIcon,
  label,
  value,
  tags,
  tone = 'blue',
}: {
  icon: typeof ShieldCheckIcon;
  label: string;
  value: string;
  tags?: string[];
  tone?: 'blue' | 'green' | 'amber' | 'rose';
}) {
  return (
    <article className={`vx-tenant-summary__item vx-tenant-tone--${tone}`}>
      <SummaryIcon size={24} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <p>
          <strong>{value}</strong>
          {tags?.map((tag) => <em key={tag}>{tag}</em>)}
        </p>
      </div>
    </article>
  );
}

export function ModelGrantsPage() {
  const t = useConsoleTranslations('modelGrantsPage');
  const [models, setModels] = useState<AiModelRecord[]>([]);
  const [agents, setAgents] = useState<ProductAgentRecord[]>([]);
  const [policies, setPolicies] = useState<ProductModelPolicyRecord[]>([]);
  const [grants, setGrants] = useState<AiModelGrantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PolicyFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openPolicyMenuId, setOpenPolicyMenuId] = useState<string | null>(null);
  const [openGrantMenuId, setOpenGrantMenuId] = useState<string | null>(null);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<Set<string>>(() => new Set());
  const [selectedGrantIds, setSelectedGrantIds] = useState<Set<string>>(() => new Set());
  const [selectedGrantId, setSelectedGrantId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [grantForm, setGrantForm] = useState(defaultGrantForm);
  const policySelectRef = useRef<HTMLInputElement | null>(null);
  const grantSelectRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      fetchAiModels(true),
      fetchAiModelGrants(),
      fetchProductAgents(),
      fetchProductModelPolicies(),
    ])
      .then(([modelRecords, grantRecords, agentRecords, policyRecords]) => {
        if (!active) return;
        setModels(modelRecords);
        setGrants(grantRecords);
        setAgents(agentRecords);
        setPolicies(policyRecords);
        setOpenPolicyMenuId(null);
        setOpenGrantMenuId(null);
        setSelectedGrantId(null);
        setSelectedPolicyIds(new Set());
        setSelectedGrantIds(new Set());
      })
      .catch(() => {
        if (active) {
          setFeedback({ tone: 'error', key: 'feedback.loadError' });
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
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setOpenPolicyMenuId(null);
    setOpenGrantMenuId(null);
  }, [query, filter, viewMode]);

  const modelById = useMemo(
    () => new Map(models.map((model) => [model.id, model])),
    [models],
  );

  const modelByCode = useMemo(
    () => new Map(models.map((model) => [model.modelCode, model])),
    [models],
  );

  const agentById = useMemo(
    () => new Map(agents.map((agent) => [agent.id, agent])),
    [agents],
  );

  const grantById = useMemo(
    () => new Map(grants.map((grant) => [grant.id, grant])),
    [grants],
  );

  const filteredPolicies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return policies.filter((policy) => {
      const status = policyStatus(policy);
      const model = policy.modelCode ? modelByCode.get(policy.modelCode) : undefined;
      const matchesQuery = !normalizedQuery || policySearchText(policy, model).includes(normalizedQuery);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'product' && policy.scopeType === 'product') ||
        (filter === 'platform' && policy.subjectType === 'platform') ||
        (filter === 'defaults' && isDefaultPolicy(policy)) ||
        (filter === 'undefined' && status === 'undefined') ||
        (filter === 'usable' && status === 'usable');

      return matchesQuery && matchesFilter;
    });
  }, [filter, modelByCode, policies, query]);

  const filteredOverrides = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return grants.filter((grant) => {
      const model = modelById.get(grant.modelId);
      const agent = grant.agentId ? agentById.get(grant.agentId) : undefined;
      return !normalizedQuery || grantSearchText(grant, model, agent).includes(normalizedQuery);
    });
  }, [agentById, grants, modelById, query]);

  const totalPages = Math.max(1, Math.ceil(filteredPolicies.length / POLICY_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * POLICY_PAGE_SIZE;
  const pagedPolicies = filteredPolicies.slice(pageStart, pageStart + POLICY_PAGE_SIZE);
  const visibleOverrideGrants = filteredOverrides.slice(0, OVERRIDE_PREVIEW_SIZE);
  const pagedPolicyIds = pagedPolicies.map((policy) => policy.id);
  const visibleGrantIds = visibleOverrideGrants.map((grant) => grant.id);
  const selectedPoliciesOnPage = pagedPolicyIds.filter((id) => selectedPolicyIds.has(id)).length;
  const selectedGrantsOnPage = visibleGrantIds.filter((id) => selectedGrantIds.has(id)).length;
  const isPolicyPageSelected = pagedPolicyIds.length > 0 && selectedPoliciesOnPage === pagedPolicyIds.length;
  const isPolicyPagePartiallySelected = selectedPoliciesOnPage > 0 && selectedPoliciesOnPage < pagedPolicyIds.length;
  const isGrantPageSelected = visibleGrantIds.length > 0 && selectedGrantsOnPage === visibleGrantIds.length;
  const isGrantPagePartiallySelected = selectedGrantsOnPage > 0 && selectedGrantsOnPage < visibleGrantIds.length;
  const selectedGrant = selectedGrantId ? grantById.get(selectedGrantId) ?? null : null;
  const usablePolicies = policies.filter((policy) => policyStatus(policy) === 'usable').length;
  const platformPolicyCount = policies.filter((policy) => policy.subjectType === 'platform').length;
  const undefinedPolicies = policies.filter((policy) => policyStatus(policy) === 'undefined').length;

  const filters = [
    { value: 'all', label: t('filters.all') },
    { value: 'platform', label: '平台主体' },
    { value: 'product', label: t('filters.product') },
    { value: 'defaults', label: t('filters.defaults') },
    { value: 'undefined', label: t('filters.undefined') },
    { value: 'usable', label: t('filters.usable') },
  ] as const;

  useEffect(() => {
    if (policySelectRef.current) {
      policySelectRef.current.indeterminate = isPolicyPagePartiallySelected;
    }
  }, [isPolicyPagePartiallySelected]);

  useEffect(() => {
    if (grantSelectRef.current) {
      grantSelectRef.current.indeterminate = isGrantPagePartiallySelected;
    }
  }, [isGrantPagePartiallySelected]);

  function resetFeedback() {
    setFeedback(null);
  }

  function agentLabel(agentId: string | null) {
    if (!agentId) {
      return t('table.allAgents');
    }

    const agent = agentById.get(agentId);
    return agent ? `${agent.agentName} · ${agent.agentCode}` : agentId;
  }

  async function reload(nextGrantId?: string | null) {
    const records = await fetchAiModelGrants();
    setGrants(records);
    setSelectedGrantId(nextGrantId ?? null);
    setOpenGrantMenuId(null);
    setSelectedGrantIds((current) => {
      const availableIds = new Set(records.map((grant) => grant.id));
      return new Set([...current].filter((id) => availableIds.has(id)));
    });
  }

  function openCreateGrantDialog() {
    setGrantForm(defaultGrantForm(models[0]?.id ?? ''));
    resetFeedback();
    setDialogMode('createGrant');
  }

  function openEditGrantDialog(grant: AiModelGrantRecord) {
    setSelectedGrantId(grant.id);
    setOpenGrantMenuId(null);
    setGrantForm({
      modelId: grant.modelId,
      tenantId: grant.tenantId,
      agentId: grant.agentId ?? '',
      priority: String(grant.priority),
      reason: grant.reason ?? '',
      expiresAt: toDateInputValue(grant.expiresAt),
      isActive: grant.isActive,
    });
    resetFeedback();
    setDialogMode('editGrant');
  }

  async function submitGrant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    resetFeedback();

    try {
      const payload = {
        agentId: grantForm.agentId.trim() || null,
        priority: Number.parseInt(grantForm.priority, 10) || 100,
        reason: grantForm.reason.trim() || null,
        expiresAt: grantForm.expiresAt || null,
        isActive: grantForm.isActive,
      };

      if (dialogMode === 'createGrant') {
        const created = await createAiModelGrant({
          ...payload,
          modelId: grantForm.modelId,
          tenantId: grantForm.tenantId,
        });
        await reload(created.id);
        setFeedback({ tone: 'success', key: 'feedback.grantCreated' });
      } else if (dialogMode === 'editGrant' && selectedGrant) {
        const updated = await updateAiModelGrant(selectedGrant.id, payload);
        await reload(updated.id);
        setFeedback({ tone: 'success', key: 'feedback.grantUpdated' });
      }

      setDialogMode(null);
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.grantSaveError' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleGrant(grant: AiModelGrantRecord) {
    setSubmitting(true);
    resetFeedback();
    setOpenGrantMenuId(null);

    try {
      const updated = await setAiModelGrantActive(grant.id, !grant.isActive);
      await reload(updated.id);
      setFeedback({ tone: 'success', key: updated.isActive ? 'feedback.grantEnabled' : 'feedback.grantDisabled' });
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.grantStateError' });
    } finally {
      setSubmitting(false);
    }
  }

  function togglePolicySelection(policyId: string, checked: boolean) {
    setSelectedPolicyIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(policyId);
      } else {
        next.delete(policyId);
      }
      return next;
    });
  }

  function togglePolicyPageSelection(checked: boolean) {
    setSelectedPolicyIds((current) => {
      const next = new Set(current);
      for (const policyId of pagedPolicyIds) {
        if (checked) {
          next.add(policyId);
        } else {
          next.delete(policyId);
        }
      }
      return next;
    });
  }

  function toggleGrantSelection(grantId: string, checked: boolean) {
    setSelectedGrantIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(grantId);
      } else {
        next.delete(grantId);
      }
      return next;
    });
  }

  function toggleGrantPageSelection(checked: boolean) {
    setSelectedGrantIds((current) => {
      const next = new Set(current);
      for (const grantId of visibleGrantIds) {
        if (checked) {
          next.add(grantId);
        } else {
          next.delete(grantId);
        }
      }
      return next;
    });
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-model-strategy-page">
      <PageHeader
        icon="shield-check"
        eyebrow={t('header.eyebrow')}
        title={t('header.title')}
        description={t('header.description')}
        secondary={<Badge>{t('header.badge')}</Badge>}
      />

      {feedback ? (
        <p className={feedback.tone === 'success' ? 'vx-profile-message' : 'vx-profile-error'}>
          {t(feedback.key, feedback.values)}
        </p>
      ) : null}

      <section className="vx-tenant-summary vx-model-strategy-summary" aria-label={t('summary.ariaLabel')}>
        <ModelStrategySummaryItem
          icon={ShieldCheckIcon}
          label={t('summary.policies')}
          value={formatNumber(policies.length)}
          tags={[`${t('filters.usable')} ${formatNumber(usablePolicies)}`]}
        />
        <ModelStrategySummaryItem
          icon={PlayIcon}
          label={t('overrides.title')}
          value={formatNumber(grants.length)}
          tags={[`${t('status.active')} ${formatNumber(grants.filter((grant) => grant.isActive).length)}`, `平台主体 ${formatNumber(platformPolicyCount)}`]}
          tone="green"
        />
        <ModelStrategySummaryItem
          icon={ClockCounterClockwiseIcon}
          label={t('summary.undefinedPolicies')}
          value={formatNumber(undefinedPolicies)}
          tags={[t('filters.undefined')]}
          tone={undefinedPolicies ? 'amber' : 'green'}
        />
      </section>

      <div className="vx-tenant-list-shell">
        <section className="vx-tenant-toolbar" aria-label={t('policyTable.filterAriaLabel')}>
          <ViewModeSwitch value={viewMode} onChange={setViewMode} ariaLabel="模型授权展示方式" />
          <span className="vx-tenant-view-count">{formatNumber(filteredPolicies.length)}</span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('policyTable.searchPlaceholder')}
            className="vx-tenant-search"
            aria-label={t('policyTable.searchAriaLabel')}
          />
          <Button
            variant="outline"
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
          >
            重置
          </Button>
          <div className="vx-tenant-filters">
            <select className="vx-input vx-tenant-select vx-model-strategy-filter" value={filter} onChange={(event) => setFilter(event.target.value as PolicyFilter)} aria-label={t('policyTable.filterAriaLabel')}>
              {filters.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
          <ActionButton icon="plus" onClick={openCreateGrantDialog}>{t('actions.addGrant')}</ActionButton>
        </section>

        <section className="vx-tenant-directory" aria-label={t('policyTable.toolbarTitle', { count: filteredPolicies.length })}>
          {pagedPolicies.length && viewMode === 'list' ? (
            <div className="vx-tenant-directory-list vx-model-strategy-directory-list" role="region" aria-label={t('policyTable.toolbarTitle', { count: filteredPolicies.length })}>
              <div className="vx-tenant-directory-list__header">
                <span>
                  <input
                    ref={policySelectRef}
                    type="checkbox"
                    className="vx-model-select-checkbox"
                    checked={isPolicyPageSelected}
                    onChange={(event) => togglePolicyPageSelection(event.target.checked)}
                    aria-label="选择当前页策略"
                  />
                </span>
                <span>序号</span>
                <span>{t('policyTable.columns.scope')}</span>
                <span>{t('policyTable.columns.status')}</span>
                <span>{t('policyTable.columns.model')}</span>
                <span>{t('policyTable.columns.agent')}</span>
                <span>{t('policyTable.columns.quota')}</span>
                <span>{t('policyTable.columns.priority')}</span>
                <span>操作</span>
              </div>
              {pagedPolicies.map((policy, index) => {
                const model = policy.modelCode ? modelByCode.get(policy.modelCode) : undefined;
                const status = policyStatus(policy);
                const scopeMeta = policy.scopeType === 'product'
                  ? `${policy.productCode} · ${policy.productRegion ? t(`policyTable.region.${policy.productRegion}`) : t('policyTable.region.none')}`
                  : policy.scopeCode;
                const subjectMeta = `${policySubjectLabel(policy)} · ${policy.subjectId}`;
                const agentMeta = policy.agentCode ?? t('table.allAgents');
                const modelName = policy.modelCode ? model?.modelName ?? policy.modelCode : t('policyTable.undefinedModel');
                const modelCode = policy.modelCode ?? t('policyTable.defaultDeny');

                return (
                  <div
                    key={policy.id}
                    className={`vx-tenant-directory-row vx-model-strategy-row vx-model-strategy-row--${status} ${selectedPolicyIds.has(policy.id) ? 'vx-model-strategy-row--selected' : ''}`}
                    title={policy.note ?? undefined}
                    onClick={(event) => {
                      if (isInteractiveTarget(event.target)) return;
                      togglePolicySelection(policy.id, !selectedPolicyIds.has(policy.id));
                    }}
                  >
                    <span className="vx-model-strategy-row__select">
                      <input
                        type="checkbox"
                        className="vx-model-select-checkbox"
                        checked={selectedPolicyIds.has(policy.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => togglePolicySelection(policy.id, event.target.checked)}
                        aria-label={`选择 ${policy.scopeName}`}
                      />
                    </span>
                    <span className="vx-tenant-directory-row__index">{formatNumber(pageStart + index + 1)}</span>
                    <span className="vx-tenant-directory-row__tenant">
                      <ShieldCheckIcon size={20} aria-hidden="true" />
                      <span>
                        <span className="vx-tenant-directory-row__title-line">{policy.scopeName}</span>
                        <small>{subjectMeta} · {scopeMeta}</small>
                      </span>
                    </span>
                    <span className="vx-model-strategy-row__status">
                      <Badge className={`vx-tenant-pill vx-model-strategy-pill--${status}`}>
                        {t(`status.${status}`)}
                      </Badge>
                    </span>
                    <span className="vx-model-strategy-row__model">
                      <strong>{modelName}</strong>
                      <small>{modelCode}</small>
                    </span>
                    <span className="vx-model-strategy-row__agent">
                      <strong>{policy.agentName}</strong>
                      <small>{agentMeta}</small>
                    </span>
                    <span className="vx-model-strategy-row__quota">{formatTokens(policy.quotaTokens, policy.isUnlimited, t('policyTable.unlimited'))}</span>
                    <span className="vx-model-strategy-row__priority">{policy.priority}</span>
                    <div className="vx-tenant-actions" onMouseLeave={() => setOpenPolicyMenuId(null)}>
                      <button
                        className="vx-tenant-actions__trigger"
                        type="button"
                        aria-label={`${policy.scopeName} 操作`}
                        aria-haspopup="menu"
                        aria-expanded={openPolicyMenuId === policy.id}
                        onClick={() => setOpenPolicyMenuId((current) => (current === policy.id ? null : policy.id))}
                      >
                        <Icon name="more-vertical" size="lg" fallback="placeholder" />
                      </button>
                      {openPolicyMenuId === policy.id ? (
                        <div className="vx-tenant-actions__menu" role="menu">
                          <button type="button" role="menuitem" disabled>
                            <Icon name="shield-check" size="xs" fallback="placeholder" />
                            <span>策略只读</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : pagedPolicies.length ? (
            <div className="vx-tenant-directory-cards vx-model-strategy-cards" aria-label={t('policyTable.toolbarTitle', { count: filteredPolicies.length })}>
              {pagedPolicies.map((policy) => {
                const model = policy.modelCode ? modelByCode.get(policy.modelCode) : undefined;
                const status = policyStatus(policy);
                const modelName = policy.modelCode ? model?.modelName ?? policy.modelCode : t('policyTable.undefinedModel');
                const modelCode = policy.modelCode ?? t('policyTable.defaultDeny');

                return (
                  <article key={policy.id} className={`vx-tenant-directory-card vx-model-strategy-card vx-model-strategy-card--${status}`}>
                    <header>
                      <ShieldCheckIcon size={24} aria-hidden="true" />
                      <div>
                        <strong>{policy.scopeName}</strong>
                        <span>{policySubjectLabel(policy)} · {policy.scopeCode}</span>
                      </div>
                      <Badge className={`vx-tenant-pill vx-model-strategy-pill--${status}`}>
                        {t(`status.${status}`)}
                      </Badge>
                    </header>
                    <div className="vx-tenant-directory-card__badges">
                      <Badge className="vx-tenant-pill vx-tenant-pill--permission">{modelName}</Badge>
                      <Badge className="vx-tenant-pill vx-tenant-pill--quota">{formatTokens(policy.quotaTokens, policy.isUnlimited, t('policyTable.unlimited'))}</Badge>
                    </div>
                    <div className="vx-tenant-directory-card__metrics">
                      <span>
                        <b>{policy.priority}</b>
                        <small>{t('policyTable.columns.priority')}</small>
                      </span>
                      <span>
                        <b>{policy.agentName}</b>
                        <small>{policy.agentCode ?? t('table.allAgents')}</small>
                      </span>
                      <span>
                        <b>{modelCode}</b>
                        <small>{t('policyTable.columns.model')}</small>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? t('empty.loadingTitle') : t('empty.policyTitle')}
                description={loading ? t('empty.loadingDescription') : t('empty.policyDescription')}
                action={
                  <ActionButton
                    variant="outline"
                    icon="x"
                    onClick={() => {
                      setQuery('');
                      setFilter('all');
                    }}
                  >
                    {t('empty.resetFilters')}
                  </ActionButton>
                }
              />
            </section>
          )}

          <footer className="vx-tenant-pagination">
            <span className="vx-tenant-pagination__total">{t('pagination.policySummary', { page: safeCurrentPage, totalPages, total: filteredPolicies.length })}</span>
            <div className="vx-tenant-pagination__actions">
              <div className="vx-tenant-pagination__pager">
                <Button variant="outline" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                  {t('pagination.previous')}
                </Button>
                <strong>{safeCurrentPage} / {totalPages}</strong>
                <Button variant="outline" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          </footer>
        </section>
      </div>

      <section className="vx-tenant-list-shell vx-model-strategy-overrides">
        <header className="vx-tenant-directory__header vx-model-strategy-overrides__header">
          <strong>{t('overrides.title')}</strong>
          <span>{t('overrides.count', { count: filteredOverrides.length })}</span>
        </header>

        <div className="vx-tenant-directory-list vx-model-strategy-override-list" role="region" aria-label={t('overrides.title')}>
          <div className="vx-tenant-directory-list__header">
            <span>
              <input
                ref={grantSelectRef}
                type="checkbox"
                className="vx-model-select-checkbox"
                checked={isGrantPageSelected}
                onChange={(event) => toggleGrantPageSelection(event.target.checked)}
                aria-label="选择当前覆盖授权"
              />
            </span>
            <span>序号</span>
            <span>{t('table.columns.model')}</span>
            <span>{t('table.columns.status')}</span>
            <span>{t('table.columns.tenant')}</span>
            <span>{t('table.columns.agent')}</span>
            <span>{t('table.columns.priority')}</span>
            <span>{t('table.columns.expires')}</span>
            <span>操作</span>
          </div>
          {filteredOverrides.length ? (
            visibleOverrideGrants.map((grant, index) => {
              const model = modelById.get(grant.modelId);
              const modelName = model?.modelName ?? grant.modelId;

              return (
                <div
                  key={grant.id}
                  className={`vx-tenant-directory-row vx-model-strategy-override-row ${openGrantMenuId === grant.id ? 'vx-model-strategy-override-row--active' : ''} ${selectedGrantIds.has(grant.id) ? 'vx-model-strategy-override-row--selected' : ''}`}
                  title={`${grant.tenantId} · ${modelName}`}
                  onClick={(event) => {
                    if (isInteractiveTarget(event.target)) return;
                    toggleGrantSelection(grant.id, !selectedGrantIds.has(grant.id));
                  }}
                >
                  <span className="vx-model-strategy-row__select">
                    <input
                      type="checkbox"
                      className="vx-model-select-checkbox"
                      checked={selectedGrantIds.has(grant.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => toggleGrantSelection(grant.id, event.target.checked)}
                      aria-label={`选择 ${modelName}`}
                    />
                  </span>
                  <span className="vx-tenant-directory-row__index">{formatNumber(index + 1)}</span>
                  <span className="vx-tenant-directory-row__tenant">
                    {grant.isActive ? <PlayIcon size={20} aria-hidden="true" /> : <StopIcon size={20} aria-hidden="true" />}
                    <span>
                      <span className="vx-tenant-directory-row__title-line">
                        <button type="button" className="vx-model-name-button" onClick={() => openEditGrantDialog(grant)}>
                          {modelName}
                        </button>
                      </span>
                      <small>{model?.modelCode ?? grant.modelId}</small>
                    </span>
                  </span>
                  <span className="vx-model-strategy-row__status">
                    <Badge className={`vx-tenant-pill vx-tenant-pill--${grant.isActive ? 'active' : 'disabled'}`}>
                      {grant.isActive ? t('status.active') : t('status.inactive')}
                    </Badge>
                  </span>
                  <span className="vx-model-strategy-row__tenant">{grant.tenantId}</span>
                  <span className="vx-model-strategy-row__agent">{agentLabel(grant.agentId)}</span>
                  <span className="vx-model-strategy-row__priority">{grant.priority}</span>
                  <span className="vx-model-strategy-row__expires">{grant.expiresAt ? grant.expiresAt.slice(0, 10) : t('table.permanent')}</span>
                  <div className="vx-tenant-actions" onMouseLeave={() => setOpenGrantMenuId(null)}>
                    <button
                      className="vx-tenant-actions__trigger"
                      type="button"
                      aria-label={t('actions.grantMenu')}
                      aria-haspopup="menu"
                      aria-expanded={openGrantMenuId === grant.id}
                      onClick={() => setOpenGrantMenuId((current) => (current === grant.id ? null : grant.id))}
                    >
                      <Icon name="more-vertical" size="lg" fallback="placeholder" />
                    </button>
                    {openGrantMenuId === grant.id ? (
                      <div className="vx-tenant-actions__menu" role="menu">
                        <button type="button" role="menuitem" onClick={() => openEditGrantDialog(grant)}>
                          <Icon name="edit" size="xs" fallback="placeholder" />
                          <span>{t('actions.editGrant')}</span>
                        </button>
                        <button type="button" role="menuitem" disabled={submitting} onClick={() => void handleToggleGrant(grant)}>
                          <Icon name={grant.isActive ? 'x' : 'check'} size="xs" fallback="placeholder" />
                          <span>{grant.isActive ? t('actions.disableGrant') : t('actions.enableGrant')}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? t('empty.loadingTitle') : t('empty.overrideTitle')}
                description={loading ? t('empty.loadingDescription') : t('empty.overrideDescription')}
              />
            </section>
          )}
        </div>
      </section>

      {dialogMode === 'createGrant' || dialogMode === 'editGrant' ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t(`dialogs.${dialogMode}.title`)}>
          <div className="vx-profile-dialog__backdrop" onClick={() => setDialogMode(null)} />
          <form className="vx-profile-dialog__content vx-model-dialog" onSubmit={(event) => void submitGrant(event)}>
            <h3>{t(`dialogs.${dialogMode}.title`)}</h3>
            <div className="vx-model-dialog__grid">
              <Label>
                {t('dialogs.fields.grantModel')}
                <select
                  className="vx-input"
                  value={grantForm.modelId}
                  disabled={dialogMode === 'editGrant'}
                  onChange={(event) => setGrantForm((old) => ({ ...old, modelId: event.target.value }))}
                  required
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>{model.modelName}</option>
                  ))}
                </select>
              </Label>
              <Label>
                {t('dialogs.fields.tenantId')}
                <Input
                  value={grantForm.tenantId}
                  disabled={dialogMode === 'editGrant'}
                  onChange={(event) => setGrantForm((old) => ({ ...old, tenantId: event.target.value }))}
                  required
                />
              </Label>
            </div>
            <div className="vx-model-dialog__grid">
              <Label>
                {t('dialogs.fields.agentId')}
                <select
                  className="vx-input"
                  value={grantForm.agentId}
                  onChange={(event) => setGrantForm((old) => ({ ...old, agentId: event.target.value }))}
                >
                  <option value="">{t('table.allAgents')}</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>{agent.agentName}</option>
                  ))}
                </select>
              </Label>
              <Label>
                {t('dialogs.fields.priority')}
                <Input type="number" value={grantForm.priority} onChange={(event) => setGrantForm((old) => ({ ...old, priority: event.target.value }))} required />
              </Label>
            </div>
            <Label>
              {t('dialogs.fields.reason')}
              <Input value={grantForm.reason} onChange={(event) => setGrantForm((old) => ({ ...old, reason: event.target.value }))} />
            </Label>
            <div className="vx-model-dialog__grid">
              <Label>
                {t('dialogs.fields.expiresAt')}
                <Input type="date" value={grantForm.expiresAt} onChange={(event) => setGrantForm((old) => ({ ...old, expiresAt: event.target.value }))} />
              </Label>
              <label className="vx-model-dialog__check">
                <input
                  type="checkbox"
                  checked={grantForm.isActive}
                  onChange={(event) => setGrantForm((old) => ({ ...old, isActive: event.target.checked }))}
                />
                {t('dialogs.fields.grantActive')}
              </label>
            </div>
            <div className="vx-profile-dialog__actions">
              <Button variant="outline" onClick={() => setDialogMode(null)}>
                {t('dialogs.actions.cancel')}
              </Button>
              <Button type="submit" disabled={submitting}>
                {t('dialogs.actions.save')}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
