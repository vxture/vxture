"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ActionMenu,
  Badge,
  Button,
  Checkbox,
  DialogForm,
  Icon,
  Input,
  Label,
  NativeSelect,
  Pagination,
  Textarea,
} from "@vxture/design-system";
import type { IconName } from "@vxture/design-system";
import {
  createAiModel,
  deleteAiModel,
  fetchAiModels,
  setAiModelActive,
  updateAiModel,
} from "@/api/admin-bff";
import type { AiModelRecord } from "@/entities/console";
import { useConsoleTranslations } from "@/lib/console-intl";
import { ActionButton } from "@/modules/shared/ActionButton";
import { EmptyState } from "@/modules/shared/EmptyState";
import { PageHeader } from "@/modules/shared/PageHeader";
import {
  PageSizePicker as AdminPageSizePicker,
  type PageSize,
} from "@/modules/shared/PageSizePicker";
import { ViewModeSwitch } from "@/modules/shared/ViewModeSwitch";

type ViewMode = "list" | "cards";
type ModelStatusFilter = "all" | "active" | "inactive";
type ModelSourceFilter = "all" | "online" | "private";
type DialogMode = "createModel" | "editModel" | null;
type Feedback = {
  tone: "success" | "error";
  key: string;
  values?: Record<string, number | string>;
} | null;
type ModelLinkStatus = "normal" | "abnormal" | "checking";

const PROVIDER_OPTIONS = ["doubao", "claude", "private", "custom"] as const;
const PROTOCOL_OPTIONS = [
  "openai-compatible",
  "anthropic-messages",
  "custom",
] as const;
const LINK_CHECK_MIN_FEEDBACK_MS = 650;

function defaultModelForm() {
  return {
    modelCode: "",
    modelName: "",
    provider: "doubao",
    endpointUrl: "",
    protocol: "openai-compatible",
    capabilities: "text",
    apiKeyEnvVar: "",
    configText: "",
  };
}

function isPrivateProvider(provider: string) {
  return ["private", "custom", "self-hosted"].includes(provider);
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
    .join(" ")
    .toLowerCase();
}

function configToText(config: Record<string, unknown> | null) {
  return config ? JSON.stringify(config, null, 2) : "";
}

function parseCapabilities(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseConfig(value: string): Record<string, unknown> | null {
  if (!value.trim()) return null;

  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Model config must be a JSON object");
  }

  return parsed as Record<string, unknown>;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function modelTone(model: AiModelRecord) {
  if (!model.isActive) return "muted";
  return isPrivateProvider(model.provider) ? "private" : "active";
}

function detectModelLinkStatus(model: AiModelRecord): ModelLinkStatus {
  return model.endpointUrl.trim() &&
    model.protocol.trim() &&
    model.apiKeyEnvVar.trim()
    ? "normal"
    : "abnormal";
}

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        'button, input, select, textarea, a, [role="button"], [role="menu"], [role="menuitem"]',
      ),
    )
  );
}

function ModelSummaryItem({
  icon,
  label,
  value,
  tags,
  tone = "blue",
}: {
  icon: IconName;
  label: string;
  value: string;
  tags?: string[];
  tone?: "blue" | "green" | "amber" | "rose";
}) {
  return (
    <article className={`vx-tenant-summary__item vx-tenant-tone--${tone}`}>
      <Icon name={icon} size={24} fallback="placeholder" />
      <div>
        <span>{label}</span>
        <p>
          <strong>{value}</strong>
          {tags?.map((tag) => (
            <em key={tag}>{tag}</em>
          ))}
        </p>
      </div>
    </article>
  );
}

function ModelOperationButtons({
  model,
  submitting,
  onEnable,
  onDisable,
  onDelete,
}: {
  model: AiModelRecord;
  submitting: boolean;
  onEnable: (model: AiModelRecord) => void;
  onDisable: (model: AiModelRecord) => void;
  onDelete: (model: AiModelRecord) => void;
}) {
  return (
    <div
      className="vx-model-operation-buttons"
      aria-label={`${model.modelName} 操作`}
    >
      <Button
        variant="ghost"
        size="icon"
        title="启用"
        aria-label={`启用 ${model.modelName}`}
        disabled={submitting || model.isActive}
        onClick={() => onEnable(model)}
      >
        <Icon name="play" size={24} fallback="placeholder" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="停用"
        aria-label={`停用 ${model.modelName}`}
        disabled={submitting || !model.isActive}
        onClick={() => onDisable(model)}
      >
        <Icon name="stop" size={24} fallback="placeholder" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title={model.isActive ? "启用状态不可删除" : "删除"}
        aria-label={`删除 ${model.modelName}`}
        className="vx-model-operation-buttons__danger"
        disabled={submitting || model.isActive}
        onClick={() => onDelete(model)}
      >
        <Icon name="trash" size={24} fallback="placeholder" />
      </Button>
    </div>
  );
}

function ModelBatchOperationButtons({
  canEnable,
  canDisable,
  canDelete,
  submitting,
  onEnable,
  onDisable,
  onDelete,
}: {
  canEnable: boolean;
  canDisable: boolean;
  canDelete: boolean;
  submitting: boolean;
  onEnable: () => void;
  onDisable: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="vx-model-operation-buttons vx-model-batch-actions"
      aria-label="批量操作"
    >
      <Button
        variant="ghost"
        size="icon"
        title="批量启用"
        aria-label="批量启用"
        disabled={submitting || !canEnable}
        onClick={onEnable}
      >
        <Icon
          name="play"
          size={24}
          weight={canEnable && !submitting ? "fill" : "regular"}
          fallback="placeholder"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="批量停用"
        aria-label="批量停用"
        disabled={submitting || !canDisable}
        onClick={onDisable}
      >
        <Icon
          name="stop"
          size={24}
          weight={canDisable && !submitting ? "fill" : "regular"}
          fallback="placeholder"
        />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="批量删除"
        aria-label="批量删除"
        className="vx-model-operation-buttons__danger"
        disabled={submitting || !canDelete}
        onClick={onDelete}
      >
        <Icon
          name="trash"
          size={24}
          weight={canDelete && !submitting ? "fill" : "regular"}
          fallback="placeholder"
        />
      </Button>
    </div>
  );
}

export function ModelGatewayPage() {
  const t = useConsoleTranslations("modelGatewayPage");
  const [models, setModels] = useState<AiModelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [detectingLinks, setDetectingLinks] = useState(false);
  const [linkStatusByModelId, setLinkStatusByModelId] = useState<
    Record<string, ModelLinkStatus>
  >({});
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ModelStatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<ModelSourceFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(
    () => new Set(),
  );
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
        setLinkStatusByModelId(
          Object.fromEntries(
            records.map((model) => [model.id, detectModelLinkStatus(model)]),
          ),
        );
        setSelectedModelId(null);
      })
      .catch(() => {
        if (active) setFeedback({ tone: "error", key: "feedback.loadError" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, query, sourceFilter, statusFilter, viewMode]);

  const modelById = useMemo(
    () => new Map(models.map((model) => [model.id, model])),
    [models],
  );

  const filteredModels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return models.filter((model) => {
      const matchesQuery =
        !normalizedQuery || modelSearchText(model).includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && model.isActive) ||
        (statusFilter === "inactive" && !model.isActive);
      const matchesSource =
        sourceFilter === "all" ||
        (sourceFilter === "online" && !isPrivateProvider(model.provider)) ||
        (sourceFilter === "private" && isPrivateProvider(model.provider));

      return matchesQuery && matchesStatus && matchesSource;
    });
  }, [models, query, sourceFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredModels.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * pageSize;
  const pagedModels = filteredModels.slice(pageStart, pageStart + pageSize);
  const pagedModelIds = pagedModels.map((model) => model.id);
  const selectedOnPage = pagedModelIds.filter((id) =>
    selectedModelIds.has(id),
  ).length;
  const isPageSelected =
    pagedModelIds.length > 0 && selectedOnPage === pagedModelIds.length;
  const isPagePartiallySelected =
    selectedOnPage > 0 && selectedOnPage < pagedModelIds.length;
  const selectedModel = selectedModelId
    ? (modelById.get(selectedModelId) ?? null)
    : null;
  const selectedModels = [...selectedModelIds]
    .map((modelId) => modelById.get(modelId))
    .filter((model): model is AiModelRecord => Boolean(model));
  const canBatchEnable = selectedModels.some((model) => !model.isActive);
  const canBatchDisable = selectedModels.some((model) => model.isActive);
  const canBatchDelete =
    selectedModels.length > 0 &&
    selectedModels.every((model) => !model.isActive);
  const activeModels = models.filter((model) => model.isActive).length;
  const inactiveModels = models.length - activeModels;
  const privateModels = models.filter((model) =>
    isPrivateProvider(model.provider),
  ).length;
  const onlineModels = models.length - privateModels;

  const statusFilters = [
    { value: "all", label: t("filters.all") },
    { value: "active", label: t("filters.active") },
    { value: "inactive", label: t("filters.inactive") },
  ] as const;
  const sourceFilters = [
    { value: "all", label: t("filters.all") },
    { value: "online", label: t("filters.online") },
    { value: "private", label: t("filters.private") },
  ] as const;

  function resetFeedback() {
    setFeedback(null);
  }

  function providerLabel(provider: string) {
    const label = t(`providers.${provider}`);
    return label.startsWith("modelGatewayPage.providers.") ? provider : label;
  }

  function handleReset() {
    setQuery("");
    setStatusFilter("all");
    setSourceFilter("all");
  }

  async function reload(nextModelId?: string | null) {
    const records = await fetchAiModels(true);
    setModels(records);
    setLinkStatusByModelId(
      Object.fromEntries(
        records.map((model) => [model.id, detectModelLinkStatus(model)]),
      ),
    );
    setSelectedModelId(nextModelId ?? null);
    setSelectedModelIds((current) => {
      const availableIds = new Set(records.map((model) => model.id));
      return new Set([...current].filter((id) => availableIds.has(id)));
    });
  }

  function openCreateModelDialog() {
    setModelForm(defaultModelForm());
    resetFeedback();
    setDialogMode("createModel");
  }

  function openEditModelDialog(model: AiModelRecord) {
    setSelectedModelId(model.id);
    setModelForm({
      modelCode: model.modelCode,
      modelName: model.modelName,
      provider: model.provider,
      endpointUrl: model.endpointUrl,
      protocol: model.protocol,
      capabilities: model.capabilities.join(", "),
      apiKeyEnvVar: model.apiKeyEnvVar,
      configText: configToText(model.config),
    });
    resetFeedback();
    setDialogMode("editModel");
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

      if (dialogMode === "createModel") {
        const created = await createAiModel(payload);
        await reload(created.id);
        setFeedback({ tone: "success", key: "feedback.modelCreated" });
      } else if (dialogMode === "editModel" && selectedModel) {
        const updated = await updateAiModel(selectedModel.id, payload);
        await reload(updated.id);
        setFeedback({ tone: "success", key: "feedback.modelUpdated" });
      }

      setDialogMode(null);
    } catch {
      setFeedback({ tone: "error", key: "feedback.modelSaveError" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleModel(model: AiModelRecord) {
    setSubmitting(true);
    resetFeedback();

    try {
      const updated = await setAiModelActive(model.id, !model.isActive);
      setModels((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setLinkStatusByModelId((current) => ({
        ...current,
        [updated.id]: detectModelLinkStatus(updated),
      }));
      setSelectedModelId(updated.id);
    } catch {
      setFeedback({ tone: "error", key: "feedback.modelStateError" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteModel(model: AiModelRecord) {
    if (model.isActive) return;
    if (!window.confirm(t("feedback.deleteConfirm", { name: model.modelName })))
      return;

    setSubmitting(true);
    resetFeedback();

    try {
      await deleteAiModel(model.id);
      await reload(null);
      setSelectedModelIds((current) => {
        const next = new Set(current);
        next.delete(model.id);
        return next;
      });
      setFeedback({ tone: "success", key: "feedback.modelDeleted" });
    } catch {
      setFeedback({ tone: "error", key: "feedback.modelDeleteError" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBatchEnableModels() {
    const targets = selectedModels.filter((model) => !model.isActive);
    if (!targets.length) return;

    setSubmitting(true);
    resetFeedback();

    try {
      const updatedModels = await Promise.all(
        targets.map((model) => setAiModelActive(model.id, true)),
      );
      const updatedById = new Map(
        updatedModels.map((model) => [model.id, model]),
      );
      setModels((current) =>
        current.map((item) => updatedById.get(item.id) ?? item),
      );
      setLinkStatusByModelId((current) => ({
        ...current,
        ...Object.fromEntries(
          updatedModels.map((model) => [
            model.id,
            detectModelLinkStatus(model),
          ]),
        ),
      }));
      setSelectedModelId(updatedModels[0]?.id ?? null);
    } catch {
      setFeedback({ tone: "error", key: "feedback.modelStateError" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBatchDisableModels() {
    const targets = selectedModels.filter((model) => model.isActive);
    if (!targets.length) return;

    setSubmitting(true);
    resetFeedback();

    try {
      const updatedModels = await Promise.all(
        targets.map((model) => setAiModelActive(model.id, false)),
      );
      const updatedById = new Map(
        updatedModels.map((model) => [model.id, model]),
      );
      setModels((current) =>
        current.map((item) => updatedById.get(item.id) ?? item),
      );
      setLinkStatusByModelId((current) => ({
        ...current,
        ...Object.fromEntries(
          updatedModels.map((model) => [
            model.id,
            detectModelLinkStatus(model),
          ]),
        ),
      }));
      setSelectedModelId(updatedModels[0]?.id ?? null);
    } catch {
      setFeedback({ tone: "error", key: "feedback.modelStateError" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBatchDeleteModels() {
    const targets = selectedModels.filter((model) => !model.isActive);
    if (!targets.length || targets.length !== selectedModels.length) return;
    if (!window.confirm(`确认删除已选 ${targets.length} 个已停用模型？`))
      return;

    setSubmitting(true);
    resetFeedback();

    try {
      await Promise.all(targets.map((model) => deleteAiModel(model.id)));
      await reload(null);
      setSelectedModelIds(new Set());
      setFeedback({ tone: "success", key: "feedback.modelDeleted" });
    } catch {
      setFeedback({ tone: "error", key: "feedback.modelDeleteError" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDetectLinks() {
    const targetIds = selectedModels.map((model) => model.id);
    if (!targetIds.length) return;

    setDetectingLinks(true);
    resetFeedback();
    setLinkStatusByModelId((current) => ({
      ...current,
      ...Object.fromEntries(
        targetIds.map((modelId) => [modelId, "checking" as const]),
      ),
    }));

    try {
      const [records] = await Promise.all([
        fetchAiModels(true),
        new Promise((resolve) =>
          window.setTimeout(resolve, LINK_CHECK_MIN_FEEDBACK_MS),
        ),
      ]);
      const targetIdSet = new Set(targetIds);
      setModels(records);
      setLinkStatusByModelId((current) => ({
        ...current,
        ...Object.fromEntries(
          records
            .filter((model) => targetIdSet.has(model.id))
            .map((model) => [model.id, detectModelLinkStatus(model)]),
        ),
      }));
    } catch {
      setFeedback({ tone: "error", key: "feedback.loadError" });
    } finally {
      setDetectingLinks(false);
    }
  }

  function toggleModelSelection(modelId: string, checked: boolean) {
    setSelectedModelIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(modelId);
      } else {
        next.delete(modelId);
      }
      return next;
    });
  }

  function togglePageSelection(checked: boolean) {
    setSelectedModelIds((current) => {
      const next = new Set(current);
      for (const modelId of pagedModelIds) {
        if (checked) {
          next.add(modelId);
        } else {
          next.delete(modelId);
        }
      }
      return next;
    });
  }

  return (
    <div className="vx-page-stack vx-tenant-management-page vx-model-gateway-page">
      <PageHeader
        icon="code"
        eyebrow={t("header.eyebrow")}
        title={t("header.title")}
        description={t("header.description")}
        secondary={<Badge>{t("header.badge")}</Badge>}
      />

      {feedback ? (
        <p
          className={
            feedback.tone === "success"
              ? "vx-profile-message"
              : "vx-profile-error"
          }
        >
          {t(feedback.key, feedback.values)}
        </p>
      ) : null}

      <section
        className="vx-tenant-summary vx-model-gateway-summary"
        aria-label={t("summary.ariaLabel")}
      >
        <ModelSummaryItem
          icon="plug"
          label={t("summary.models")}
          value={formatNumber(models.length)}
          tags={[
            `${t("filters.online")} ${formatNumber(onlineModels)}`,
            `${t("filters.private")} ${formatNumber(privateModels)}`,
          ]}
        />
        <ModelSummaryItem
          icon="play"
          label={t("filters.active")}
          value={formatNumber(activeModels)}
          tags={["可调度"]}
          tone={activeModels ? "green" : "amber"}
        />
        <ModelSummaryItem
          icon="code"
          label={t("status.inactive")}
          value={formatNumber(inactiveModels)}
          tags={inactiveModels ? ["需复核"] : ["无停用"]}
          tone={inactiveModels ? "amber" : "green"}
        />
      </section>

      <div className="vx-tenant-list-shell">
        <section
          className="vx-tenant-toolbar"
          aria-label={t("table.filterAriaLabel")}
        >
          <ViewModeSwitch
            value={viewMode}
            onChange={setViewMode}
            ariaLabel="模型展示方式"
          />
          <span className="vx-tenant-view-count">
            {formatNumber(filteredModels.length)}
          </span>
          <span className="vx-tenant-toolbar__spacer" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("table.searchPlaceholder")}
            className="vx-tenant-search"
            aria-label={t("table.searchAriaLabel")}
          />
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
          <div className="vx-tenant-filters">
            <NativeSelect
              className="vx-tenant-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ModelStatusFilter)
              }
              aria-label="模型状态"
            >
              {statusFilters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              className="vx-tenant-select"
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(event.target.value as ModelSourceFilter)
              }
              aria-label="模型来源"
            >
              {sourceFilters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <ModelBatchOperationButtons
            canEnable={canBatchEnable}
            canDisable={canBatchDisable}
            canDelete={canBatchDelete}
            submitting={submitting}
            onEnable={() => void handleBatchEnableModels()}
            onDisable={() => void handleBatchDisableModels()}
            onDelete={() => void handleBatchDeleteModels()}
          />
          <ActionButton
            icon="shield-check"
            variant="outline"
            disabled={detectingLinks || selectedModels.length === 0}
            onClick={() => void handleDetectLinks()}
          >
            状态检测
          </ActionButton>
          <ActionButton icon="plus" onClick={openCreateModelDialog}>
            {t("actions.addModel")}
          </ActionButton>
        </section>

        <section
          className="vx-tenant-directory"
          aria-label={t("table.toolbarTitle", { count: filteredModels.length })}
        >
          {loading ? (
            <header className="vx-tenant-directory__header">
              <span>{t("empty.loadingTitle")}</span>
            </header>
          ) : null}

          {pagedModels.length && viewMode === "list" ? (
            <div
              className="vx-tenant-directory-list vx-model-gateway-directory-list"
              role="region"
              aria-label={t("table.toolbarTitle", {
                count: filteredModels.length,
              })}
            >
              <div className="vx-tenant-directory-list__header">
                <span>
                  <Checkbox
                    className="vx-model-select-checkbox"
                    checked={
                      isPagePartiallySelected ? "indeterminate" : isPageSelected
                    }
                    onCheckedChange={(checked) =>
                      togglePageSelection(checked === true)
                    }
                    aria-label="选择当前页模型"
                  />
                </span>
                <span>序号</span>
                <span>{t("table.columns.model")}</span>
                <span>{t("table.columns.status")}</span>
                <span>链路状态</span>
                <span>来源</span>
                <span>模型能力</span>
                <span>操作</span>
              </div>
              {pagedModels.map((model, index) => (
                <div
                  key={model.id}
                  className={`vx-tenant-directory-row vx-model-gateway-row vx-model-gateway-row--${modelTone(model)} ${selectedModelIds.has(model.id) ? "vx-model-gateway-row--selected" : ""}`}
                  title={`${model.modelName} · ${model.modelCode}`}
                  onClick={(event) => {
                    if (isInteractiveTarget(event.target)) return;
                    toggleModelSelection(
                      model.id,
                      !selectedModelIds.has(model.id),
                    );
                  }}
                >
                  <span className="vx-model-gateway-row__select">
                    <Checkbox
                      className="vx-model-select-checkbox"
                      checked={selectedModelIds.has(model.id)}
                      onClick={(event) => event.stopPropagation()}
                      onCheckedChange={(checked) =>
                        toggleModelSelection(model.id, checked === true)
                      }
                      aria-label={`选择 ${model.modelName}`}
                    />
                  </span>
                  <span className="vx-tenant-directory-row__index">
                    {formatNumber(pageStart + index + 1)}
                  </span>
                  <span className="vx-tenant-directory-row__tenant">
                    <Icon
                      name={isPrivateProvider(model.provider) ? "code" : "plug"}
                      size={20}
                      fallback="placeholder"
                    />
                    <span>
                      <span className="vx-tenant-directory-row__title-line">
                        <Button
                          variant="link"
                          className="vx-model-name-button"
                          onClick={() => openEditModelDialog(model)}
                        >
                          {model.modelName}
                        </Button>
                      </span>
                      <small>{model.modelCode}</small>
                    </span>
                  </span>
                  <span className="vx-model-gateway-row__status">
                    <span className="vx-tenant-directory-row__status-line">
                      <span
                        className={`vx-model-state-icon vx-model-state-icon--${model.isActive ? "active" : "inactive"}`}
                        role="img"
                        aria-label={
                          model.isActive
                            ? t("status.active")
                            : t("status.inactive")
                        }
                        title={
                          model.isActive
                            ? t("status.active")
                            : t("status.inactive")
                        }
                      >
                        <Icon
                          name={model.isActive ? "check" : "x"}
                          size="xs"
                          fallback="placeholder"
                        />
                      </span>
                      <Badge
                        className={`vx-tenant-pill vx-tenant-pill--${model.isActive ? "active" : "disabled"}`}
                      >
                        {model.isActive
                          ? t("status.active")
                          : t("status.inactive")}
                      </Badge>
                    </span>
                  </span>
                  <span className="vx-model-gateway-row__link">
                    <Badge
                      className={`vx-tenant-pill vx-model-link-pill--${linkStatusByModelId[model.id] ?? detectModelLinkStatus(model)}`}
                    >
                      {(linkStatusByModelId[model.id] ??
                        detectModelLinkStatus(model)) === "checking"
                        ? "检测中"
                        : (linkStatusByModelId[model.id] ??
                              detectModelLinkStatus(model)) === "normal"
                          ? "正常"
                          : "异常"}
                    </Badge>
                  </span>
                  <span className="vx-model-gateway-row__source">
                    <Badge
                      className={`vx-tenant-pill vx-model-provider-pill--${isPrivateProvider(model.provider) ? "private" : "online"}`}
                    >
                      {providerLabel(model.provider)}
                    </Badge>
                    <small>{model.protocol}</small>
                  </span>
                  <span className="vx-model-gateway-row__capabilities">
                    <span className="vx-tenant-directory-row__tag-line">
                      {model.capabilities.slice(0, 3).map((capability) => (
                        <Badge
                          key={capability}
                          className="vx-tenant-pill vx-tenant-pill--permission"
                        >
                          {capability}
                        </Badge>
                      ))}
                      {model.capabilities.length > 3 ? (
                        <Badge className="vx-tenant-pill vx-tenant-pill--quota">
                          +{model.capabilities.length - 3}
                        </Badge>
                      ) : null}
                    </span>
                  </span>
                  <div
                    className="vx-tenant-actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <ActionMenu
                      label={t("actions.modelMenu", { name: model.modelName })}
                      triggerClassName="vx-tenant-actions__trigger"
                      triggerProps={{
                        title: t("actions.modelMenu", {
                          name: model.modelName,
                        }),
                      }}
                      items={[
                        {
                          id: "edit",
                          label: t("actions.editModel"),
                          icon: (
                            <Icon
                              name="edit"
                              size="xs"
                              fallback="placeholder"
                            />
                          ),
                          onSelect: () => openEditModelDialog(model),
                        },
                        {
                          id: "enable",
                          label: t("actions.enableModel"),
                          icon: (
                            <Icon
                              name="play"
                              size={16}
                              weight="fill"
                              fallback="placeholder"
                            />
                          ),
                          disabled: submitting || model.isActive,
                          onSelect: () => void handleToggleModel(model),
                        },
                        {
                          id: "disable",
                          label: t("actions.disableModel"),
                          icon: (
                            <Icon
                              name="stop"
                              size={16}
                              weight="fill"
                              fallback="placeholder"
                            />
                          ),
                          disabled: submitting || !model.isActive,
                          onSelect: () => void handleToggleModel(model),
                        },
                        {
                          id: "delete",
                          label: t("actions.deleteModel"),
                          icon: (
                            <Icon
                              name="trash"
                              size={16}
                              fallback="placeholder"
                            />
                          ),
                          disabled: submitting || model.isActive,
                          danger: true,
                          onSelect: () => void handleDeleteModel(model),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : pagedModels.length ? (
            <div
              className="vx-tenant-directory-cards vx-model-gateway-cards"
              aria-label={t("table.toolbarTitle", {
                count: filteredModels.length,
              })}
            >
              {pagedModels.map((model) => (
                <article
                  key={model.id}
                  className={`vx-tenant-directory-card vx-model-gateway-card vx-model-gateway-card--${modelTone(model)}`}
                >
                  <header>
                    <Icon
                      name={isPrivateProvider(model.provider) ? "code" : "plug"}
                      size={24}
                      fallback="placeholder"
                    />
                    <div>
                      <Button
                        variant="link"
                        className="vx-model-name-button"
                        onClick={() => openEditModelDialog(model)}
                      >
                        {model.modelName}
                      </Button>
                      <span>{model.modelCode}</span>
                    </div>
                    <ModelOperationButtons
                      model={model}
                      submitting={submitting}
                      onEnable={(target) => void handleToggleModel(target)}
                      onDisable={(target) => void handleToggleModel(target)}
                      onDelete={(target) => void handleDeleteModel(target)}
                    />
                  </header>
                  <div className="vx-tenant-directory-card__badges">
                    <Badge
                      className={`vx-tenant-pill vx-model-provider-pill--${isPrivateProvider(model.provider) ? "private" : "online"}`}
                    >
                      {providerLabel(model.provider)}
                    </Badge>
                    <Badge
                      className={`vx-tenant-pill vx-tenant-pill--${model.isActive ? "active" : "disabled"}`}
                    >
                      {model.isActive
                        ? t("status.active")
                        : t("status.inactive")}
                    </Badge>
                  </div>
                  <div className="vx-tenant-directory-card__metrics">
                    <span>
                      <b>{model.capabilities.length}</b>
                      <small>{t("table.columns.capabilities")}</small>
                    </span>
                    <span>
                      <b>
                        {isPrivateProvider(model.provider)
                          ? t("filters.private")
                          : t("filters.online")}
                      </b>
                      <small>{t("table.columns.provider")}</small>
                    </span>
                    <span>
                      <b>{model.protocol}</b>
                      <small>{t("dialogs.fields.protocol")}</small>
                    </span>
                  </div>
                  <footer>
                    <span>
                      {model.capabilities.slice(0, 2).join(", ") || "-"}
                    </span>
                    <strong>{model.apiKeyEnvVar || "-"}</strong>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <section className="vx-tenant-empty">
              <EmptyState
                title={loading ? t("empty.loadingTitle") : t("empty.title")}
                description={
                  loading
                    ? t("empty.loadingDescription")
                    : t("empty.description")
                }
                action={
                  <ActionButton
                    variant="outline"
                    icon="x"
                    onClick={handleReset}
                  >
                    {t("empty.resetFilters")}
                  </ActionButton>
                }
              />
            </section>
          )}

          <footer className="vx-tenant-pagination">
            <span className="vx-tenant-pagination__total">
              {t("pagination.summary", {
                page: safeCurrentPage,
                totalPages,
                total: filteredModels.length,
              })}
            </span>
            <div className="vx-tenant-pagination__actions">
              <AdminPageSizePicker
                value={pageSize}
                onChange={setPageSize}
                activeVariant="ghost"
                inactiveVariant="ghost"
                aria-label="page size"
                optionAriaLabel={(option) => `Page size ${option}`}
              />
              <Pagination
                className="vx-tenant-pagination__pager"
                page={safeCurrentPage}
                pageCount={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </footer>
        </section>
      </div>

      {dialogMode === "createModel" || dialogMode === "editModel" ? (
        <DialogForm
          open
          title={t(`dialogs.${dialogMode}.title`)}
          submitLabel={t("dialogs.actions.save")}
          cancelLabel={t("dialogs.actions.cancel")}
          submitting={submitting}
          contentClassName="max-w-3xl"
          onOpenChange={(open) => {
            if (!open) setDialogMode(null);
          }}
          onSubmit={(event) => void submitModel(event)}
        >
          <div className="vx-model-dialog__grid">
            <Label>
              {t("dialogs.fields.modelName")}
              <Input
                value={modelForm.modelName}
                onChange={(event) =>
                  setModelForm((old) => ({
                    ...old,
                    modelName: event.target.value,
                  }))
                }
                required
              />
            </Label>
            <Label>
              {t("dialogs.fields.modelCode")}
              <Input
                value={modelForm.modelCode}
                onChange={(event) =>
                  setModelForm((old) => ({
                    ...old,
                    modelCode: event.target.value,
                  }))
                }
                required
              />
            </Label>
            <Label>
              {t("dialogs.fields.provider")}
              <NativeSelect
                value={modelForm.provider}
                onChange={(event) =>
                  setModelForm((old) => ({
                    ...old,
                    provider: event.target.value,
                  }))
                }
              >
                {PROVIDER_OPTIONS.map((provider) => (
                  <option key={provider} value={provider}>
                    {providerLabel(provider)}
                  </option>
                ))}
              </NativeSelect>
            </Label>
            <Label>
              {t("dialogs.fields.protocol")}
              <NativeSelect
                value={modelForm.protocol}
                onChange={(event) =>
                  setModelForm((old) => ({
                    ...old,
                    protocol: event.target.value,
                  }))
                }
              >
                {PROTOCOL_OPTIONS.map((protocol) => (
                  <option key={protocol} value={protocol}>
                    {protocol}
                  </option>
                ))}
              </NativeSelect>
            </Label>
          </div>
          <Label>
            {t("dialogs.fields.endpointUrl")}
            <Input
              value={modelForm.endpointUrl}
              onChange={(event) =>
                setModelForm((old) => ({
                  ...old,
                  endpointUrl: event.target.value,
                }))
              }
              required
            />
          </Label>
          <div className="vx-model-dialog__grid">
            <Label>
              {t("dialogs.fields.apiKeyEnvVar")}
              <Input
                value={modelForm.apiKeyEnvVar}
                onChange={(event) =>
                  setModelForm((old) => ({
                    ...old,
                    apiKeyEnvVar: event.target.value,
                  }))
                }
                required
              />
            </Label>
            <Label>
              {t("dialogs.fields.capabilities")}
              <Input
                value={modelForm.capabilities}
                onChange={(event) =>
                  setModelForm((old) => ({
                    ...old,
                    capabilities: event.target.value,
                  }))
                }
                required
              />
            </Label>
          </div>
          <Label>
            {t("dialogs.fields.config")}
            <Textarea
              className="vx-input vx-model-dialog__textarea"
              value={modelForm.configText}
              onChange={(event) =>
                setModelForm((old) => ({
                  ...old,
                  configText: event.target.value,
                }))
              }
              placeholder='{"anthropicVersion":"2023-06-01"}'
            />
          </Label>
        </DialogForm>
      ) : null}
    </div>
  );
}
