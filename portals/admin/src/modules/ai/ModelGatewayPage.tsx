'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Icon } from '@vxture/design-system';
import { Badge, Button, Input, Label } from '@/components/ui/primitives';
import {
  createAiModel,
  deleteAiModel,
  fetchAiModels,
  setAiModelActive,
  updateAiModel,
} from '@/api/admin-bff';
import type { AiModelRecord } from '@/entities/console';
import { useConsoleTranslations } from '@/lib/console-intl';
import { ActionButton } from '@/modules/shared/ActionButton';
import { EmptyState } from '@/modules/shared/EmptyState';
import { PageHeader } from '@/modules/shared/PageHeader';

type ModelFilter = 'all' | 'active' | 'inactive' | 'online' | 'private';
type DialogMode = 'createModel' | 'editModel' | null;
type Feedback = { tone: 'success' | 'error'; key: string; values?: Record<string, number | string> } | null;

const PROVIDER_OPTIONS = ['doubao', 'claude', 'private', 'custom'] as const;
const PROTOCOL_OPTIONS = ['openai-compatible', 'anthropic-messages', 'custom'] as const;
const MODEL_PAGE_SIZE = 12;

function defaultModelForm() {
  return {
    modelCode: '',
    modelName: '',
    provider: 'doubao',
    endpointUrl: '',
    protocol: 'openai-compatible',
    capabilities: 'text',
    apiKeyEnvVar: '',
    configText: '',
  };
}

function isPrivateProvider(provider: string) {
  return ['private', 'custom', 'self-hosted'].includes(provider);
}

function modelSearchText(model: AiModelRecord) {
  return [
    model.modelName,
    model.modelCode,
    model.provider,
    model.protocol,
    model.endpointUrl,
    model.apiKeyEnvVar,
    ...model.capabilities,
  ]
    .join(' ')
    .toLowerCase();
}

function configToText(config: Record<string, unknown> | null) {
  return config ? JSON.stringify(config, null, 2) : '';
}

function parseCapabilities(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseConfig(value: string): Record<string, unknown> | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Model config must be a JSON object');
  }

  return parsed as Record<string, unknown>;
}

export function ModelGatewayPage() {
  const t = useConsoleTranslations('modelGatewayPage');
  const [models, setModels] = useState<AiModelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ModelFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [openModelMenuId, setOpenModelMenuId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [modelForm, setModelForm] = useState(defaultModelForm);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchAiModels(true)
      .then((records) => {
        if (!active) return;
        setModels(records);
        setOpenModelMenuId(null);
        setSelectedModelId(null);
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
    setOpenModelMenuId(null);
  }, [query, filter]);

  const modelById = useMemo(
    () => new Map(models.map((model) => [model.id, model])),
    [models],
  );

  const filteredModels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return models.filter((model) => {
      const matchesQuery = !normalizedQuery || modelSearchText(model).includes(normalizedQuery);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && model.isActive) ||
        (filter === 'inactive' && !model.isActive) ||
        (filter === 'online' && !isPrivateProvider(model.provider)) ||
        (filter === 'private' && isPrivateProvider(model.provider));

      return matchesQuery && matchesFilter;
    });
  }, [filter, models, query]);

  const totalPages = Math.max(1, Math.ceil(filteredModels.length / MODEL_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * MODEL_PAGE_SIZE;
  const pagedModels = filteredModels.slice(pageStart, pageStart + MODEL_PAGE_SIZE);
  const selectedModel = selectedModelId ? modelById.get(selectedModelId) ?? null : null;
  const activeModels = models.filter((model) => model.isActive).length;
  const privateModels = models.filter((model) => isPrivateProvider(model.provider)).length;
  const onlineModels = models.length - privateModels;

  const filters = [
    { value: 'all', label: t('filters.all') },
    { value: 'active', label: t('filters.active') },
    { value: 'inactive', label: t('filters.inactive') },
    { value: 'online', label: t('filters.online') },
    { value: 'private', label: t('filters.private') },
  ] as const;

  function resetFeedback() {
    setFeedback(null);
  }

  function providerLabel(provider: string) {
    const label = t(`providers.${provider}`);
    return label.startsWith('modelGatewayPage.providers.') ? provider : label;
  }

  async function reload(nextModelId?: string | null) {
    const records = await fetchAiModels(true);
    setModels(records);
    setSelectedModelId(nextModelId ?? null);
    setOpenModelMenuId(null);
  }

  function openCreateModelDialog() {
    setModelForm(defaultModelForm());
    resetFeedback();
    setDialogMode('createModel');
  }

  function openEditModelDialog(model: AiModelRecord) {
    setSelectedModelId(model.id);
    setOpenModelMenuId(null);
    setModelForm({
      modelCode: model.modelCode,
      modelName: model.modelName,
      provider: model.provider,
      endpointUrl: model.endpointUrl,
      protocol: model.protocol,
      capabilities: model.capabilities.join(', '),
      apiKeyEnvVar: model.apiKeyEnvVar,
      configText: configToText(model.config),
    });
    resetFeedback();
    setDialogMode('editModel');
  }

  async function submitModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    resetFeedback();

    try {
      const payload = {
        modelCode: modelForm.modelCode,
        modelName: modelForm.modelName,
        provider: modelForm.provider,
        endpointUrl: modelForm.endpointUrl,
        protocol: modelForm.protocol,
        capabilities: parseCapabilities(modelForm.capabilities),
        apiKeyEnvVar: modelForm.apiKeyEnvVar,
        config: parseConfig(modelForm.configText),
      };

      if (dialogMode === 'createModel') {
        const created = await createAiModel(payload);
        await reload(created.id);
        setFeedback({ tone: 'success', key: 'feedback.modelCreated' });
      } else if (dialogMode === 'editModel' && selectedModel) {
        const updated = await updateAiModel(selectedModel.id, payload);
        await reload(updated.id);
        setFeedback({ tone: 'success', key: 'feedback.modelUpdated' });
      }

      setDialogMode(null);
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.modelSaveError' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleModel(model: AiModelRecord) {
    setSubmitting(true);
    resetFeedback();
    setOpenModelMenuId(null);

    try {
      const updated = await setAiModelActive(model.id, !model.isActive);
      await reload(updated.id);
      setFeedback({ tone: 'success', key: updated.isActive ? 'feedback.modelEnabled' : 'feedback.modelDisabled' });
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.modelStateError' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteModel(model: AiModelRecord) {
    setOpenModelMenuId(null);
    if (!window.confirm(t('feedback.deleteConfirm', { name: model.modelName }))) {
      return;
    }

    setSubmitting(true);
    resetFeedback();

    try {
      await deleteAiModel(model.id);
      await reload(null);
      setFeedback({ tone: 'success', key: 'feedback.modelDeleted' });
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.modelDeleteError' });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyModelCode(model: AiModelRecord) {
    setOpenModelMenuId(null);
    try {
      await navigator.clipboard.writeText(model.modelCode);
      setFeedback({ tone: 'success', key: 'feedback.modelCodeCopied' });
    } catch {
      setFeedback({ tone: 'error', key: 'feedback.copyError' });
    }
  }

  return (
    <div className="vx-page-stack vx-models-page">
      <PageHeader
        icon="cloud"
        eyebrow={t('header.eyebrow')}
        title={t('header.title')}
        description={t('header.description')}
        secondary={<Badge>{t('header.badge')}</Badge>}
        action={<ActionButton icon="plus" onClick={openCreateModelDialog}>{t('actions.addModel')}</ActionButton>}
      />

      {feedback ? (
        <p className={feedback.tone === 'success' ? 'vx-profile-message' : 'vx-profile-error'}>
          {t(feedback.key, feedback.values)}
        </p>
      ) : null}

      <section className="vx-models-summary" aria-label={t('summary.ariaLabel')}>
        <div className="vx-models-summary__item">
          <Icon name="cloud" size="xs" fallback="placeholder" />
          <span>{t('summary.models')}</span>
          <strong>{t('summary.modelsValue', { active: activeModels, total: models.length })}</strong>
        </div>
        <div className="vx-models-summary__item">
          <Icon name="server" size="xs" fallback="placeholder" />
          <span>{t('summary.privateModels')}</span>
          <strong>{privateModels}</strong>
        </div>
        <div className="vx-models-summary__item">
          <Icon name="api" size="xs" fallback="placeholder" />
          <span>{t('summary.onlineModels')}</span>
          <strong>{onlineModels}</strong>
        </div>
      </section>

      <div className="vx-models-workspace">
        <div className="vx-models-toolbar">
          <span className="vx-models-toolbar__count">{t('table.toolbarTitle', { count: filteredModels.length })}</span>
          <span className="vx-models-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('table.searchPlaceholder')}
            className="vx-search-input vx-models-toolbar__search"
            aria-label={t('table.searchAriaLabel')}
          />
          <div className="vx-models-toolbar__filters">
            <div className="vx-segmented-control" role="tablist" aria-label={t('table.filterAriaLabel')}>
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

        <div className="vx-model-list">
          <div className="vx-model-list__header">
            <span>{t('table.columns.model')}</span>
            <span>{t('table.columns.provider')}</span>
            <span>{t('table.columns.capabilities')}</span>
            <span>{t('table.columns.endpoint')}</span>
            <span>{t('table.columns.key')}</span>
            <span>{t('table.columns.status')}</span>
            <span />
          </div>
          {pagedModels.length ? (
            pagedModels.map((model) => (
              <div
                key={model.id}
                className={openModelMenuId === model.id ? 'vx-model-row vx-model-row--active' : 'vx-model-row'}
                title={`${model.modelName} · ${model.modelCode}`}
              >
                <div className="vx-model-row__identity">
                  <span className={isPrivateProvider(model.provider) ? 'vx-model-row__icon vx-model-row__icon--private' : 'vx-model-row__icon'}>
                    <Icon name={isPrivateProvider(model.provider) ? 'server' : 'cloud'} size="xs" fallback="placeholder" />
                  </span>
                  <div>
                    <strong>{model.modelName}</strong>
                    <p>{model.modelCode}</p>
                  </div>
                </div>
                <span className="vx-model-row__text">{providerLabel(model.provider)}</span>
                <div className="vx-model-row__chips">
                  {model.capabilities.slice(0, 3).map((capability) => (
                    <span key={capability}>{capability}</span>
                  ))}
                  {model.capabilities.length > 3 ? <span>+{model.capabilities.length - 3}</span> : null}
                </div>
                <span className="vx-model-row__muted" title={model.endpointUrl}>{model.endpointUrl}</span>
                <span className="vx-model-row__muted" title={model.apiKeyEnvVar}>{model.apiKeyEnvVar}</span>
                <span>
                  <Badge className={model.isActive ? 'vx-model-status vx-model-status--active' : 'vx-model-status vx-model-status--inactive'}>
                    {model.isActive ? t('status.active') : t('status.inactive')}
                  </Badge>
                </span>
                <div
                  className="vx-model-row__menu"
                  onMouseLeave={() => setOpenModelMenuId(null)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setOpenModelMenuId(null);
                    }
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('actions.modelMenu', { name: model.modelName })}
                    aria-haspopup="menu"
                    aria-expanded={openModelMenuId === model.id}
                    onClick={() => setOpenModelMenuId((current) => (current === model.id ? null : model.id))}
                  >
                    <Icon name="more-vertical" size="sm" fallback="placeholder" />
                  </Button>
                  {openModelMenuId === model.id ? (
                    <div className="vx-model-actions-menu" role="menu">
                      <button type="button" role="menuitem" onClick={() => openEditModelDialog(model)}>
                        <Icon name="edit" size="xs" fallback="placeholder" />
                        <span>{t('actions.editModel')}</span>
                      </button>
                      <button type="button" role="menuitem" onClick={() => void handleCopyModelCode(model)}>
                        <Icon name="code" size="xs" fallback="placeholder" />
                        <span>{t('actions.copyModelCode')}</span>
                      </button>
                      <button type="button" role="menuitem" disabled={submitting} onClick={() => void handleToggleModel(model)}>
                        <Icon name={model.isActive ? 'x' : 'check'} size="xs" fallback="placeholder" />
                        <span>{model.isActive ? t('actions.disableModel') : t('actions.enableModel')}</span>
                      </button>
                      <button type="button" role="menuitem" className="vx-model-actions-menu__danger" disabled={submitting} onClick={() => void handleDeleteModel(model)}>
                        <Icon name="trash" size="xs" fallback="placeholder" />
                        <span>{t('actions.deleteModel')}</span>
                      </button>
                    </div>
                  ) : null}
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
          <span className="vx-models-pagination__total">{t('pagination.summary', { page: safeCurrentPage, totalPages, total: filteredModels.length })}</span>
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

      {dialogMode === 'createModel' || dialogMode === 'editModel' ? (
        <div className="vx-profile-dialog" role="dialog" aria-modal="true" aria-label={t(`dialogs.${dialogMode}.title`)}>
          <div className="vx-profile-dialog__backdrop" onClick={() => setDialogMode(null)} />
          <form className="vx-profile-dialog__content vx-model-dialog" onSubmit={(event) => void submitModel(event)}>
            <h3>{t(`dialogs.${dialogMode}.title`)}</h3>
            <div className="vx-model-dialog__grid">
              <Label>
                {t('dialogs.fields.modelName')}
                <Input value={modelForm.modelName} onChange={(event) => setModelForm((old) => ({ ...old, modelName: event.target.value }))} required />
              </Label>
              <Label>
                {t('dialogs.fields.modelCode')}
                <Input value={modelForm.modelCode} onChange={(event) => setModelForm((old) => ({ ...old, modelCode: event.target.value }))} required />
              </Label>
              <Label>
                {t('dialogs.fields.provider')}
                <select className="vx-input" value={modelForm.provider} onChange={(event) => setModelForm((old) => ({ ...old, provider: event.target.value }))}>
                  {PROVIDER_OPTIONS.map((provider) => (
                    <option key={provider} value={provider}>{providerLabel(provider)}</option>
                  ))}
                </select>
              </Label>
              <Label>
                {t('dialogs.fields.protocol')}
                <select className="vx-input" value={modelForm.protocol} onChange={(event) => setModelForm((old) => ({ ...old, protocol: event.target.value }))}>
                  {PROTOCOL_OPTIONS.map((protocol) => (
                    <option key={protocol} value={protocol}>{protocol}</option>
                  ))}
                </select>
              </Label>
            </div>
            <Label>
              {t('dialogs.fields.endpointUrl')}
              <Input value={modelForm.endpointUrl} onChange={(event) => setModelForm((old) => ({ ...old, endpointUrl: event.target.value }))} required />
            </Label>
            <div className="vx-model-dialog__grid">
              <Label>
                {t('dialogs.fields.apiKeyEnvVar')}
                <Input value={modelForm.apiKeyEnvVar} onChange={(event) => setModelForm((old) => ({ ...old, apiKeyEnvVar: event.target.value }))} required />
              </Label>
              <Label>
                {t('dialogs.fields.capabilities')}
                <Input value={modelForm.capabilities} onChange={(event) => setModelForm((old) => ({ ...old, capabilities: event.target.value }))} required />
              </Label>
            </div>
            <Label>
              {t('dialogs.fields.config')}
              <textarea
                className="vx-input vx-model-dialog__textarea"
                value={modelForm.configText}
                onChange={(event) => setModelForm((old) => ({ ...old, configText: event.target.value }))}
                placeholder='{"anthropicVersion":"2023-06-01"}'
              />
            </Label>
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
