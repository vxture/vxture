'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
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

type PolicyFilter = 'all' | 'product' | 'defaults' | 'undefined' | 'usable';
type DialogMode = 'createGrant' | 'editGrant' | null;
type PolicyStatus = 'usable' | 'zeroQuota' | 'inactive' | 'undefined';
type Feedback = { tone: 'success' | 'error'; key: string; values?: Record<string, number | string> } | null;

const POLICY_PAGE_SIZE = 12;
const OVERRIDE_PREVIEW_SIZE = 8;

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

export function ModelGrantsPage() {
  const t = useConsoleTranslations('modelGrantsPage');
  const [models, setModels] = useState<AiModelRecord[]>([]);
  const [agents, setAgents] = useState<ProductAgentRecord[]>([]);
  const [policies, setPolicies] = useState<ProductModelPolicyRecord[]>([]);
  const [grants, setGrants] = useState<AiModelGrantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PolicyFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openGrantMenuId, setOpenGrantMenuId] = useState<string | null>(null);
  const [selectedGrantId, setSelectedGrantId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [grantForm, setGrantForm] = useState(defaultGrantForm);

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
        setOpenGrantMenuId(null);
        setSelectedGrantId(null);
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
    setOpenGrantMenuId(null);
  }, [query, filter]);

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
  const selectedGrant = selectedGrantId ? grantById.get(selectedGrantId) ?? null : null;
  const usablePolicies = policies.filter((policy) => policyStatus(policy) === 'usable').length;
  const undefinedPolicies = policies.filter((policy) => policyStatus(policy) === 'undefined').length;
  const productPolicyCount = new Set(
    policies
      .filter((policy) => policy.scopeType === 'product')
      .map((policy) => policy.productCode),
  ).size;

  const filters = [
    { value: 'all', label: t('filters.all') },
    { value: 'product', label: t('filters.product') },
    { value: 'defaults', label: t('filters.defaults') },
    { value: 'undefined', label: t('filters.undefined') },
    { value: 'usable', label: t('filters.usable') },
  ] as const;

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

  return (
    <div className="vx-page-stack vx-models-page">
      <PageHeader
        icon="shield-check"
        eyebrow={t('header.eyebrow')}
        title={t('header.title')}
        description={t('header.description')}
        secondary={<Badge>{t('header.badge')}</Badge>}
        action={<ActionButton icon="plus" onClick={openCreateGrantDialog}>{t('actions.addGrant')}</ActionButton>}
      />

      {feedback ? (
        <p className={feedback.tone === 'success' ? 'vx-profile-message' : 'vx-profile-error'}>
          {t(feedback.key, feedback.values)}
        </p>
      ) : null}

      <section className="vx-models-summary" aria-label={t('summary.ariaLabel')}>
        <div className="vx-models-summary__item">
          <Icon name="shield-check" size="xs" fallback="placeholder" />
          <span>{t('summary.policies')}</span>
          <strong>{t('summary.policiesValue', { usable: usablePolicies, total: policies.length })}</strong>
        </div>
        <div className="vx-models-summary__item">
          <Icon name="agent" size="xs" fallback="placeholder" />
          <span>{t('summary.products')}</span>
          <strong>{productPolicyCount}</strong>
        </div>
        <div className="vx-models-summary__item">
          <Icon name="clock" size="xs" fallback="placeholder" />
          <span>{t('summary.undefinedPolicies')}</span>
          <strong>{undefinedPolicies}</strong>
        </div>
      </section>

      <div className="vx-model-grants">
        <div className="vx-models-toolbar">
          <span className="vx-models-toolbar__count">{t('policyTable.toolbarTitle', { count: filteredPolicies.length })}</span>
          <span className="vx-models-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('policyTable.searchPlaceholder')}
            className="vx-search-input vx-models-toolbar__search"
            aria-label={t('policyTable.searchAriaLabel')}
          />
          <div className="vx-models-toolbar__filters">
            <div className="vx-segmented-control" role="tablist" aria-label={t('policyTable.filterAriaLabel')}>
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.value}
                  className={
                    filter === item.value
                      ? 'vx-segmented-control__item vx-segmented-control__item--active'
                      : 'vx-segmented-control__item'
                  }
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="vx-model-policy-list">
          <div className="vx-model-policy-list__header">
            <span>{t('policyTable.columns.scope')}</span>
            <span>{t('policyTable.columns.agent')}</span>
            <span>{t('policyTable.columns.model')}</span>
            <span>{t('policyTable.columns.quota')}</span>
            <span>{t('policyTable.columns.priority')}</span>
            <span>{t('policyTable.columns.status')}</span>
          </div>
          {pagedPolicies.length ? (
            pagedPolicies.map((policy) => {
              const model = policy.modelCode ? modelByCode.get(policy.modelCode) : undefined;
              const status = policyStatus(policy);
              const scopeMeta = policy.scopeType === 'product'
                ? `${policy.productCode} · ${policy.productRegion ? t(`policyTable.region.${policy.productRegion}`) : t('policyTable.region.none')}`
                : policy.scopeCode;
              const agentMeta = policy.agentCode ?? t('table.allAgents');
              const modelName = policy.modelCode ? model?.modelName ?? policy.modelCode : t('policyTable.undefinedModel');
              const modelCode = policy.modelCode ?? t('policyTable.defaultDeny');

              return (
                <div key={policy.id} className="vx-model-policy-row" title={policy.note ?? undefined}>
                  <div className="vx-model-grant-row__model">
                    <strong>{policy.scopeName}</strong>
                    <p>{scopeMeta}</p>
                  </div>
                  <div className="vx-model-grant-row__model">
                    <strong>{policy.agentName}</strong>
                    <p>{agentMeta}</p>
                  </div>
                  <div className="vx-model-grant-row__model">
                    <strong>{modelName}</strong>
                    <p>{modelCode}</p>
                  </div>
                  <span className="vx-model-row__text">{formatTokens(policy.quotaTokens, policy.isUnlimited, t('policyTable.unlimited'))}</span>
                  <span className="vx-model-row__text">{policy.priority}</span>
                  <span>
                    <Badge className={`vx-model-status vx-model-status--${status}`}>
                      {t(`status.${status}`)}
                    </Badge>
                  </span>
                </div>
              );
            })
          ) : (
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
          )}
        </div>

        <div className="vx-models-pagination">
          <span className="vx-models-pagination__total">{t('pagination.policySummary', { page: safeCurrentPage, totalPages, total: filteredPolicies.length })}</span>
          <div className="vx-models-pagination__actions">
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
      </div>

      <section className="vx-model-grants vx-model-grants--overrides">
        <div className="vx-model-grants__header">
          <div>
            <h2>{t('overrides.title')}</h2>
            <span>{t('overrides.description')}</span>
          </div>
          <span>{t('overrides.count', { count: filteredOverrides.length })}</span>
        </div>

        <div className="vx-model-grant-list">
          <div className="vx-model-grant-list__header">
            <span>{t('table.columns.model')}</span>
            <span>{t('table.columns.tenant')}</span>
            <span>{t('table.columns.agent')}</span>
            <span>{t('table.columns.priority')}</span>
            <span>{t('table.columns.expires')}</span>
            <span>{t('table.columns.status')}</span>
            <span />
          </div>
          {filteredOverrides.length ? (
            filteredOverrides.slice(0, OVERRIDE_PREVIEW_SIZE).map((grant) => {
              const model = modelById.get(grant.modelId);
              const modelName = model?.modelName ?? grant.modelId;

              return (
                <div
                  key={grant.id}
                  className={openGrantMenuId === grant.id ? 'vx-model-grant-row vx-model-grant-row--active' : 'vx-model-grant-row'}
                  title={`${grant.tenantId} · ${modelName}`}
                >
                  <div className="vx-model-grant-row__model">
                    <strong>{modelName}</strong>
                    <p>{model?.modelCode ?? grant.modelId}</p>
                  </div>
                  <span className="vx-model-row__text">{grant.tenantId}</span>
                  <span className="vx-model-row__muted">{agentLabel(grant.agentId)}</span>
                  <span className="vx-model-row__text">{grant.priority}</span>
                  <span className="vx-model-row__muted">{grant.expiresAt ? grant.expiresAt.slice(0, 10) : t('table.permanent')}</span>
                  <span>
                    <Badge className={grant.isActive ? 'vx-model-status vx-model-status--active' : 'vx-model-status vx-model-status--inactive'}>
                      {grant.isActive ? t('status.active') : t('status.inactive')}
                    </Badge>
                  </span>
                  <div
                    className="vx-model-row__menu"
                    onMouseLeave={() => setOpenGrantMenuId(null)}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setOpenGrantMenuId(null);
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t('actions.grantMenu')}
                      aria-haspopup="menu"
                      aria-expanded={openGrantMenuId === grant.id}
                      onClick={() => setOpenGrantMenuId((current) => (current === grant.id ? null : grant.id))}
                    >
                      <Icon name="more-vertical" size="sm" fallback="placeholder" />
                    </Button>
                    {openGrantMenuId === grant.id ? (
                      <div className="vx-model-actions-menu" role="menu">
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
            <EmptyState
              title={loading ? t('empty.loadingTitle') : t('empty.overrideTitle')}
              description={loading ? t('empty.loadingDescription') : t('empty.overrideDescription')}
            />
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
