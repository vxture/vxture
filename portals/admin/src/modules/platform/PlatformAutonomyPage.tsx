"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@vxture/design-system";
import type { IconName } from "@vxture/design-system";
import { fetchAiModelGrants, fetchAiModels } from "@/api/admin-bff";
import type { AiModelGrantRecord, AiModelRecord } from "@/entities/console";
import { PageHeader } from "@/modules/shared/PageHeader";

type Tone = "blue" | "green" | "amber" | "rose";
type AutonomyMetric = {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
  tone: Tone;
};
type ResourceRow = {
  subject: string;
  key: string;
  model: string;
  quota: string;
  usage: string;
  status: string;
};

const autonomyDomains = [
  {
    title: "身份权限",
    description: "内部用户、平台角色和权限边界，与租户成员体系完全分离。",
    icon: "shield-check",
    links: [
      { label: "平台用户", href: "/platform-admins", meta: "账号、岗位、状态" },
      { label: "平台角色", href: "/admin-roles", meta: "角色、权限、授权" },
      {
        label: "权限策略",
        href: "/admin-permissions",
        meta: "权限点、层级、绑定",
      },
    ],
  },
  {
    title: "平台资源",
    description:
      "平台自身作为资源消费主体，承载 Vela、内部任务和治理分析的模型用量。",
    icon: "cloud",
    links: [
      {
        label: "模型网关",
        href: "/model-gateway",
        meta: "Provider、端点、链路",
      },
      {
        label: "密钥管理",
        href: "/platform-secrets",
        meta: "凭据、轮换、可见性",
      },
    ],
  },
  {
    title: "运行保障",
    description:
      "平台服务、后台任务、探针和告警统一纳入自治域，不混入租户运营。",
    icon: "server",
    links: [
      { label: "服务监控", href: "/service-monitor", meta: "健康、响应、异常" },
      { label: "任务调度", href: "/platform-jobs", meta: "调度、重试、死信" },
    ],
  },
  {
    title: "安全审计",
    description:
      "控制面操作必须可追溯，高风险动作进入审批、二次确认和审计闭环。",
    icon: "info",
    links: [
      { label: "审计日志", href: "/audit-logs", meta: "操作、对象、结果" },
      { label: "审批中心", href: "/approval-center", meta: "确认、审批、凭证" },
    ],
  },
] satisfies Array<{
  title: string;
  description: string;
  icon: IconName;
  links: Array<{ label: string; href: string; meta: string }>;
}>;

const operationRows = [
  { label: "密钥轮换", value: "1", meta: "7 天内到期", tone: "amber" },
  { label: "任务死信", value: "2", meta: "通知投递重试", tone: "amber" },
  { label: "冻结令牌", value: "1", meta: "等待审批复核", tone: "rose" },
  { label: "服务异常", value: "0", meta: "核心链路正常", tone: "green" },
] satisfies Array<{ label: string; value: string; meta: string; tone: Tone }>;

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function isPrivateProvider(provider: string) {
  return ["private", "custom", "self-hosted"].includes(provider);
}

function buildAutonomyMetrics(models: AiModelRecord[]): AutonomyMetric[] {
  const activeModels = models.filter((model) => model.isActive).length;

  return [
    {
      label: "模型网关",
      value: formatNumber(models.length),
      detail: `自治域已接入 ${formatNumber(activeModels)} 个启用模型，停用模型 ${formatNumber(models.length - activeModels)} 个。`,
      icon: "cloud",
      tone: "blue",
    },
    {
      label: "平台用户",
      value: "3",
      detail: "内部用户接入平台角色、MFA 和审计边界。",
      icon: "user",
      tone: "green",
    },
    {
      label: "运行服务",
      value: "17",
      detail: "核心服务纳入健康探测、状态检测和异常处置。",
      icon: "server",
      tone: "blue",
    },
    {
      label: "待审批",
      value: "1",
      detail: "高风险动作进入审批中心和确认链路。",
      icon: "check",
      tone: "amber",
    },
  ];
}

function buildResourceRows(
  models: AiModelRecord[],
  grants: AiModelGrantRecord[],
): ResourceRow[] {
  const grantCountByModelId = grants.reduce((counts, grant) => {
    counts.set(grant.modelId, (counts.get(grant.modelId) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());

  return models.map((model) => ({
    subject: isPrivateProvider(model.provider) ? "自建模型" : "三方模型",
    key: `${model.provider} / ${model.protocol}`,
    model: model.modelName,
    quota: `${formatNumber(model.capabilities.length)} 项能力`,
    usage: `${formatNumber(grantCountByModelId.get(model.id) ?? 0)} 条授权`,
    status: model.isActive ? "启用" : "停用",
  }));
}

export function PlatformAutonomyPage() {
  const [models, setModels] = useState<AiModelRecord[]>([]);
  const [grants, setGrants] = useState<AiModelGrantRecord[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resourceError, setResourceError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoadingResources(true);
    setResourceError(null);

    Promise.all([fetchAiModels(true), fetchAiModelGrants()])
      .then(([modelRecords, grantRecords]) => {
        if (!active) return;
        setModels(modelRecords);
        setGrants(grantRecords);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setModels([]);
        setGrants([]);
        setResourceError(
          error instanceof Error ? error.message : "AI Gateway 数据读取失败",
        );
      })
      .finally(() => {
        if (active) setLoadingResources(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const autonomyMetrics = useMemo(() => buildAutonomyMetrics(models), [models]);
  const resourceRows = useMemo(
    () => buildResourceRows(models, grants),
    [models, grants],
  );

  return (
    <div className="vx-page-stack platform-autonomy-page">
      <PageHeader
        icon="shield-check"
        title="平台总览"
        description="平台自治域只管理平台自身的身份、资源、运行、安全和审计；租户运营、订阅交易和客户服务保持在运营业务域。"
      />

      <section className="platform-autonomy-metrics" aria-label="平台自治态势">
        {autonomyMetrics.map((metric) => (
          <article
            key={metric.label}
            className={`platform-autonomy-metric platform-autonomy-tone--${metric.tone}`}
          >
            <span className="platform-autonomy-metric__icon" aria-hidden="true">
              <Icon name={metric.icon} size="md" fallback="placeholder" />
            </span>
            <div className="platform-autonomy-metric__copy">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="platform-autonomy-domains" aria-label="自治域能力">
        {autonomyDomains.map((domain) => (
          <article key={domain.title} className="platform-autonomy-domain">
            <header>
              <span aria-hidden="true">
                <Icon name={domain.icon} size="md" fallback="placeholder" />
              </span>
              <div>
                <h2>{domain.title}</h2>
                <p>{domain.description}</p>
              </div>
            </header>
            <div className="platform-autonomy-domain__links">
              {domain.links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span>
                    <strong>{link.label}</strong>
                    <small>{link.meta}</small>
                  </span>
                  <Icon
                    name="chevron-right"
                    size="sm"
                    fallback="chevron-right"
                  />
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section
        className="platform-autonomy-grid"
        aria-label="平台主体与风险态势"
      >
        <article className="platform-autonomy-panel platform-autonomy-panel--wide">
          <header className="platform-autonomy-panel__header">
            <div>
              <h2>平台资源</h2>
              <p>
                一期只支持 tenant 与 platform
                两类主体，平台不进入租户表，但拥有独立模型配额和统计归属。
              </p>
            </div>
            <Link href="/model-grants">模型授权</Link>
          </header>
          <div className="platform-autonomy-resource-table">
            <div className="platform-autonomy-resource-table__header">
              <span>主体</span>
              <span>标识</span>
              <span>模型</span>
              <span>配额</span>
              <span>用量</span>
              <span>状态</span>
            </div>
            {loadingResources ? (
              <div className="platform-autonomy-resource-row">
                <strong>读取中</strong>
                <span>AI Gateway</span>
                <span>模型网关</span>
                <span>-</span>
                <span>-</span>
                <em>同步中</em>
              </div>
            ) : resourceError ? (
              <div className="platform-autonomy-resource-row platform-autonomy-resource-row--error">
                <strong>读取失败</strong>
                <span>AI Gateway</span>
                <span>{resourceError}</span>
                <span>-</span>
                <span>-</span>
                <em>异常</em>
              </div>
            ) : resourceRows.length ? (
              resourceRows.map((row) => (
                <div
                  key={`${row.key}-${row.model}`}
                  className="platform-autonomy-resource-row"
                >
                  <strong>{row.subject}</strong>
                  <span>{row.key}</span>
                  <span>{row.model}</span>
                  <span>{row.quota}</span>
                  <span>{row.usage}</span>
                  <em>{row.status}</em>
                </div>
              ))
            ) : (
              <div className="platform-autonomy-resource-row">
                <strong>暂无模型</strong>
                <span>AI Gateway</span>
                <span>未接入模型资源</span>
                <span>-</span>
                <span>-</span>
                <em>空</em>
              </div>
            )}
          </div>
        </article>

        <article className="platform-autonomy-panel">
          <header className="platform-autonomy-panel__header">
            <div>
              <h2>待处理风险</h2>
              <p>面向平台控制面，不展示租户运营事项。</p>
            </div>
          </header>
          <div className="platform-autonomy-risk-list">
            {operationRows.map((row) => (
              <Link
                key={row.label}
                href={
                  row.label === "冻结令牌"
                    ? "/approval-center"
                    : row.label === "任务死信"
                      ? "/platform-jobs"
                      : row.label === "密钥轮换"
                        ? "/platform-secrets"
                        : "/service-monitor"
                }
                className={`platform-autonomy-risk platform-autonomy-tone--${row.tone}`}
              >
                <span>
                  <strong>{row.label}</strong>
                  <small>{row.meta}</small>
                </span>
                <em>{row.value}</em>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
