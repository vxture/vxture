'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import type { Locale } from '@vxture/shared';
import { fetchAiModels, fetchProductReleases } from '@/api/admin-bff';
import type { AiModelRecord, ProductReleaseRecord } from '@/entities/console';
import { useConsoleLocale } from '@/lib/console-intl';

type Tone = 'blue' | 'green' | 'cyan' | 'amber' | 'rose' | 'indigo';
type PeriodKey = 'recent30' | 'total' | 'year' | 'quarter' | 'month';
type BusinessPanelId = 'tenantScale' | 'subscription' | 'finance';
type BusinessMetricIcon = 'building-library' | 'users' | 'api' | 'database' | 'chart-bar' | 'shield-check' | 'cloud';
type ModelCategoryKey = 'multimodal' | 'language' | 'vision' | 'other';

interface SummaryMetric {
  label: string;
  value: string;
  secondary?: string;
  delta?: string;
  detail: string;
  tone?: Tone;
}

interface PlatformMetric {
  title: string;
  value: string;
  unit: string;
  delta: string;
  tone: Tone;
  detail: string;
}

interface ProductOperation {
  productCode: string;
  subscriptions: number;
  monthlyNew: number;
  revenue: number;
}

interface ProductMetric extends SummaryMetric {
  icon: IconName;
  tags: Array<{ label: string; value: string }>;
}

interface ModelMetric extends SummaryMetric {
  icon: IconName;
  tags: Array<{ label: string; value: string }>;
  badges?: string[];
}

interface ServiceMetric extends SummaryMetric {
  icon: IconName;
  display?: 'stars' | 'text';
}

interface OverviewPulseMetric {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: Tone;
  tags: Array<{ label?: string; value: string; tone?: Tone }>;
  rating?: number;
}

interface ModelUsageRow {
  id: string;
  modelName: string;
  modelCode: string;
  provider: string;
  tokenCalls: number;
  isActive: boolean;
}

const periodOptions = [
  { key: 'recent30', label: '近30天' },
  { key: 'total', label: '总计' },
  { key: 'year', label: '年度' },
  { key: 'quarter', label: '季度' },
  { key: 'month', label: '月度' },
] satisfies Array<{ key: PeriodKey; label: string }>;

const overviewSnapshots = {
  recent30: {
    label: '近30天',
    platformMetrics: [
      { title: '平台规模', value: '1,286', unit: '租户', delta: '+42', tone: 'blue', detail: '近30天新增租户 42，活跃租户 842；新增用户 1,280，活跃用户 18,960。' },
      { title: '订阅收入', value: '¥684k', unit: '周期收入', delta: '+12.4%', tone: 'green', detail: '近30天收入 684,000 元，累计确认收入 8,426,000 元；有效订阅 2,196。' },
      { title: '模型成本', value: '¥171k', unit: '周期成本', delta: '+8.2%', tone: 'amber', detail: '近30天模型与服务成本 171,000 元，累计成本 2,164,000 元，成本率 25.0%。' },
      { title: '服务质量', value: '4.7', unit: '服务星级', delta: 'SLA 92%', tone: 'cyan', detail: '近30天工单 326，已完成 248，进行中 54，搁置 24；服务评价 4.7 星。' },
    ],
    businessBands: [
      {
        title: '规模与用量',
        tone: 'blue',
        metrics: [
          { label: '租户数量', value: '1,286', secondary: '活跃 842', delta: '+42', detail: '租户总数 1,286，近30天新增 42，活跃租户 842。' },
          { label: '用户数量', value: '38,420', secondary: '活跃 18,960', delta: '+1,280', detail: '用户总数 38,420，近30天新增 1,280，活跃用户 18,960。' },
          { label: 'Token消耗', value: '2.42B', secondary: '峰值 14 租户', delta: '+9.6%', detail: '近30天 Token 消耗 2.42B，峰值来自 14 个高频租户。', tone: 'cyan' },
        ],
      },
      {
        title: '订阅与计量',
        tone: 'green',
        metrics: [
          { label: '订阅产品', value: '2,418', secondary: '有效 2,196', delta: '+186', detail: '订阅产品数量 2,418，新增 186；风险产品已合并到订阅健康状态中。' },
          { label: '订阅续费', value: '32', secondary: '预警 11', delta: '+4', detail: '近30天待跟进续费 32，较上一周期增加 4，其中 11 个存在付款或用量下降风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.6%', secondary: '待补齐 2', delta: '+0.6%', detail: '计量覆盖 98.6%，较上一周期提升 0.6%，仍有 2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'indigo',
        metrics: [
          { label: '收入', value: '¥684k', secondary: '累计 ¥8.43M', delta: '+12.4%', detail: '近30天收入 684,000 元，累计确认收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥171k', secondary: '累计 ¥2.16M', delta: '+8.2%', detail: '近30天成本 171,000 元，累计成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥513k', secondary: '累计 ¥6.26M', delta: '+13.8%', detail: '近30天毛利润 513,000 元，累计毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
  total: {
    label: '总计',
    platformMetrics: [
      { title: '平台规模', value: '1,286', unit: '租户', delta: '+426', tone: 'blue', detail: '平台累计租户 1,286，累计新增 426；用户总数 38,420，活跃用户 28,600。' },
      { title: '订阅收入', value: '¥8.43M', unit: '累计收入', delta: '+34.8%', tone: 'green', detail: '累计确认收入 8,426,000 元；有效订阅 2,196。' },
      { title: '模型成本', value: '¥2.16M', unit: '累计成本', delta: '+22.6%', tone: 'amber', detail: '累计模型与服务成本 2,164,000 元，成本率 25.7%。' },
      { title: '服务质量', value: '4.6', unit: '服务星级', delta: 'SLA 90%', tone: 'cyan', detail: '累计工单 3,426，已完成 2,836，进行中 326，搁置 264；服务评价 4.6 星。' },
    ],
    businessBands: [
      {
        title: '规模与用量',
        tone: 'blue',
        metrics: [
          { label: '租户数量', value: '1,286', secondary: '活跃 1,024', delta: '+426', detail: '租户总数 1,286，累计新增 426，活跃租户 1,024。' },
          { label: '用户数量', value: '38,420', secondary: '活跃 28,600', delta: '+12,800', detail: '用户总数 38,420，累计新增 12,800，活跃用户 28,600。' },
          { label: 'Token消耗', value: '42.6B', secondary: '峰值 64 租户', delta: '+24.8B', detail: '累计 Token 消耗 42.6B，年度新增 24.8B。', tone: 'cyan' },
        ],
      },
      {
        title: '订阅与计量',
        tone: 'green',
        metrics: [
          { label: '订阅产品', value: '2,418', secondary: '有效 2,196', delta: '+1,240', detail: '累计订阅产品 2,418，累计新增 1,240；产品风险归入订阅健康。' },
          { label: '订阅续费', value: '386', secondary: '预警 86', delta: '+54', detail: '累计待跟进续费 386，新增 54，其中 86 个存在付款或用量下降风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.6%', secondary: '待补齐 2', delta: '+3.8%', detail: '累计计量覆盖 98.6%，较年初提升 3.8%，2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'indigo',
        metrics: [
          { label: '收入', value: '¥8.43M', secondary: '本年 ¥8.43M', delta: '+34.8%', detail: '累计确认收入 8,426,000 元，本年收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥2.16M', secondary: '本年 ¥2.16M', delta: '+22.6%', detail: '累计成本 2,164,000 元，本年成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥6.26M', secondary: '本年 ¥6.26M', delta: '+39.6%', detail: '累计毛利润 6,262,000 元，本年毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
  month: {
    label: '月度',
    platformMetrics: [
      { title: '平台规模', value: '1,286', unit: '租户', delta: '+38', tone: 'blue', detail: '本月新增租户 38，活跃租户 818；新增用户 1,120，活跃用户 18,420。' },
      { title: '订阅收入', value: '¥642k', unit: '月收入', delta: '+10.6%', tone: 'green', detail: '本月收入 642,000 元，累计确认收入 8,426,000 元；有效订阅 2,196。' },
      { title: '模型成本', value: '¥162k', unit: '月成本', delta: '+7.4%', tone: 'amber', detail: '本月成本 162,000 元，累计成本 2,164,000 元，成本率 25.2%。' },
      { title: '服务质量', value: '4.7', unit: '服务星级', delta: 'SLA 93%', tone: 'cyan', detail: '本月工单 298，已完成 231，进行中 45，搁置 22；服务评价 4.7 星。' },
    ],
    businessBands: [
      {
        title: '规模与用量',
        tone: 'blue',
        metrics: [
          { label: '租户数量', value: '1,286', secondary: '活跃 818', delta: '+38', detail: '租户总数 1,286，本月新增 38，活跃租户 818。' },
          { label: '用户数量', value: '38,420', secondary: '活跃 18,420', delta: '+1,120', detail: '用户总数 38,420，本月新增 1,120，活跃用户 18,420。' },
          { label: 'Token消耗', value: '2.18B', secondary: '峰值 13 租户', delta: '+8.4%', detail: '本月 Token 消耗 2.18B，峰值来自 13 个高频租户。', tone: 'cyan' },
        ],
      },
      {
        title: '订阅与计量',
        tone: 'green',
        metrics: [
          { label: '订阅产品', value: '2,392', secondary: '有效 2,176', delta: '+162', detail: '本月订阅产品 2,392，新增 162；风险产品已并入订阅健康。' },
          { label: '订阅续费', value: '28', secondary: '预警 9', delta: '+3', detail: '本月待跟进续费 28，较上一周期增加 3，其中 9 个存在风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.2%', secondary: '待补齐 2', delta: '+0.4%', detail: '本月计量覆盖 98.2%，较上一周期提升 0.4%，2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'indigo',
        metrics: [
          { label: '收入', value: '¥642k', secondary: '累计 ¥8.43M', delta: '+10.6%', detail: '本月收入 642,000 元，累计确认收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥162k', secondary: '累计 ¥2.16M', delta: '+7.4%', detail: '本月成本 162,000 元，累计成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥480k', secondary: '累计 ¥6.26M', delta: '+11.8%', detail: '本月毛利润 480,000 元，累计毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
  quarter: {
    label: '季度',
    platformMetrics: [
      { title: '平台规模', value: '1,286', unit: '租户', delta: '+126', tone: 'blue', detail: '本季度新增租户 126，活跃租户 902；新增用户 3,940，活跃用户 21,800。' },
      { title: '订阅收入', value: '¥1.96M', unit: '季度收入', delta: '+18.2%', tone: 'green', detail: '本季度收入 1,956,000 元，累计确认收入 8,426,000 元。' },
      { title: '模型成本', value: '¥486k', unit: '季度成本', delta: '+11.5%', tone: 'amber', detail: '本季度成本 486,000 元，累计成本 2,164,000 元，成本率 24.8%。' },
      { title: '服务质量', value: '4.6', unit: '服务星级', delta: 'SLA 91%', tone: 'cyan', detail: '本季度工单 884，已完成 702，进行中 124，搁置 58；服务评价 4.6 星。' },
    ],
    businessBands: [
      {
        title: '规模与用量',
        tone: 'blue',
        metrics: [
          { label: '租户数量', value: '1,286', secondary: '活跃 902', delta: '+126', detail: '租户总数 1,286，本季度新增 126，活跃租户 902。' },
          { label: '用户数量', value: '38,420', secondary: '活跃 21,800', delta: '+3,940', detail: '用户总数 38,420，本季度新增 3,940，活跃用户 21,800。' },
          { label: 'Token消耗', value: '6.82B', secondary: '峰值 28 租户', delta: '+16.8%', detail: '本季度 Token 消耗 6.82B，峰值来自 28 个高频租户。', tone: 'cyan' },
        ],
      },
      {
        title: '订阅与计量',
        tone: 'green',
        metrics: [
          { label: '订阅产品', value: '2,418', secondary: '有效 2,196', delta: '+512', detail: '本季度订阅产品 2,418，新增 512；产品风险归入订阅健康。' },
          { label: '订阅续费', value: '96', secondary: '预警 27', delta: '+12', detail: '本季度待跟进续费 96，较上一周期增加 12，其中 27 个存在付款或用量下降风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.6%', secondary: '待补齐 2', delta: '+1.1%', detail: '本季度计量覆盖 98.6%，较上一周期提升 1.1%，2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'indigo',
        metrics: [
          { label: '收入', value: '¥1.96M', secondary: '累计 ¥8.43M', delta: '+18.2%', detail: '本季度收入 1,956,000 元，累计确认收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥486k', secondary: '累计 ¥2.16M', delta: '+11.5%', detail: '本季度成本 486,000 元，累计成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥1.47M', secondary: '累计 ¥6.26M', delta: '+20.6%', detail: '本季度毛利润 1,470,000 元，累计毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
  year: {
    label: '年度',
    platformMetrics: [
      { title: '平台规模', value: '1,286', unit: '租户', delta: '+426', tone: 'blue', detail: '本年度新增租户 426，活跃租户 1,024；新增用户 12,800，活跃用户 28,600。' },
      { title: '订阅收入', value: '¥8.43M', unit: '年度收入', delta: '+34.8%', tone: 'green', detail: '年度收入 8,426,000 元，累计确认收入 8,426,000 元。' },
      { title: '模型成本', value: '¥2.16M', unit: '年度成本', delta: '+22.6%', tone: 'amber', detail: '年度成本 2,164,000 元，成本率 25.7%。' },
      { title: '服务质量', value: '4.6', unit: '服务星级', delta: 'SLA 90%', tone: 'cyan', detail: '年度工单 3,426，已完成 2,836，进行中 326，搁置 264；服务评价 4.6 星。' },
    ],
    businessBands: [
      {
        title: '规模与用量',
        tone: 'blue',
        metrics: [
          { label: '租户数量', value: '1,286', secondary: '活跃 1,024', delta: '+426', detail: '租户总数 1,286，本年度新增 426，活跃租户 1,024。' },
          { label: '用户数量', value: '38,420', secondary: '活跃 28,600', delta: '+12,800', detail: '用户总数 38,420，本年度新增 12,800，活跃用户 28,600。' },
          { label: 'Token消耗', value: '24.8B', secondary: '峰值 64 租户', delta: '+38.0%', detail: '年度 Token 消耗 24.8B，峰值来自 64 个高频租户。', tone: 'cyan' },
        ],
      },
      {
        title: '订阅与计量',
        tone: 'green',
        metrics: [
          { label: '订阅产品', value: '2,418', secondary: '有效 2,196', delta: '+1,240', detail: '年度订阅产品 2,418，新增 1,240；产品风险归入订阅健康。' },
          { label: '订阅续费', value: '386', secondary: '预警 86', delta: '+54', detail: '年度待跟进续费 386，较上一周期增加 54，其中 86 个存在付款或用量下降风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.6%', secondary: '待补齐 2', delta: '+3.8%', detail: '年度计量覆盖 98.6%，较上一周期提升 3.8%，2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'indigo',
        metrics: [
          { label: '收入', value: '¥8.43M', secondary: '累计 ¥8.43M', delta: '+34.8%', detail: '年度收入 8,426,000 元，累计确认收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥2.16M', secondary: '累计 ¥2.16M', delta: '+22.6%', detail: '年度成本 2,164,000 元，累计成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥6.26M', secondary: '累计 ¥6.26M', delta: '+39.6%', detail: '年度毛利润 6,262,000 元，累计毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
} satisfies Record<PeriodKey, { label: string; platformMetrics: PlatformMetric[]; businessBands: Array<{ title: string; tone: Tone; metrics: SummaryMetric[] }> }>;

const productOperations: ProductOperation[] = [
  { productCode: 'vxture-console-cn', subscriptions: 846, monthlyNew: 68, revenue: 2_536_000 },
  { productCode: 'ruyinagent-cn', subscriptions: 724, monthlyNew: 91, revenue: 1_468_000 },
  { productCode: 'ruyinagent-intl', subscriptions: 118, monthlyNew: 27, revenue: 338_000 },
];

const periodScale = {
  recent30: 1,
  total: 8.4,
  year: 6.2,
  quarter: 2.7,
  month: 0.92,
} satisfies Record<PeriodKey, number>;

const ratingSnapshots = {
  recent30: { service: '4.7', product: '4.5', sla: '92%' },
  total: { service: '4.6', product: '4.4', sla: '90%' },
  year: { service: '4.6', product: '4.4', sla: '90%' },
  quarter: { service: '4.6', product: '4.5', sla: '91%' },
  month: { service: '4.7', product: '4.5', sla: '93%' },
} satisfies Record<PeriodKey, { service: string; product: string; sla: string }>;

function formatCurrency(value: number, locale: Locale = 'zh-CN') {
  return formatFinanceAmount(value, '¥', locale);
}

function isRecentlyUpdated(value: string) {
  const updatedAt = new Date(value).getTime();
  if (!Number.isFinite(updatedAt)) return false;

  const days = (Date.now() - updatedAt) / 86_400_000;
  return days >= 0 && days <= 30;
}

function scalePeriodValue(value: number, period: PeriodKey) {
  return Math.max(0, Math.round(value * periodScale[period]));
}

function periodReleaseUpdateCount(baseCount: number, totalCount: number, period: PeriodKey) {
  if (period === 'total') return totalCount;
  if (period === 'year') return Math.min(totalCount, Math.max(baseCount, scalePeriodValue(baseCount, period)));

  return Math.min(totalCount, scalePeriodValue(baseCount, period));
}

function isThirdPartyProduct(release: ProductReleaseRecord) {
  const productCode = release.productCode.toLowerCase();

  return release.releaseType === 'custom' || ['partner', 'provider', 'third'].some((marker) => productCode.includes(marker));
}

function uniqueProductReleases(records: ProductReleaseRecord[]) {
  const productMap = new Map<string, ProductReleaseRecord>();

  records.forEach((release) => {
    if (!productMap.has(release.productCode)) {
      productMap.set(release.productCode, release);
    }
  });

  return Array.from(productMap.values());
}

function productOwnershipCounts(records: ProductReleaseRecord[], options: { uniqueProducts?: boolean } = {}) {
  const scopedRecords = options.uniqueProducts ? uniqueProductReleases(records) : records;
  const thirdParty = scopedRecords.filter(isThirdPartyProduct).length;
  const owned = scopedRecords.length - thirdParty;

  return {
    total: scopedRecords.length,
    owned,
    thirdParty,
  };
}

function scaleProductOwnershipCounts(baseCounts: ReturnType<typeof productOwnershipCounts>, totalCounts: ReturnType<typeof productOwnershipCounts>, period: PeriodKey) {
  const owned = periodReleaseUpdateCount(baseCounts.owned, totalCounts.owned, period);
  const thirdParty = periodReleaseUpdateCount(baseCounts.thirdParty, totalCounts.thirdParty, period);

  return {
    total: owned + thirdParty,
    owned,
    thirdParty,
  };
}

function productOwnershipTags(counts: ReturnType<typeof productOwnershipCounts>) {
  return [
    { label: '自有', value: String(counts.owned) },
    { label: '三方', value: String(counts.thirdParty) },
  ];
}

function isStoppedProduct(release: ProductReleaseRecord) {
  return release.productStatus === 'archived' || (release.productStatus === 'active' && !release.isActive);
}

function periodProductOperation(item: ProductOperation, period: PeriodKey) {
  return {
    ...item,
    subscriptions: scalePeriodValue(item.subscriptions, period),
    monthlyNew: scalePeriodValue(item.monthlyNew, period),
    revenue: scalePeriodValue(item.revenue, period),
  };
}

function modelCapabilities(model: AiModelRecord) {
  return model.capabilities.map((capability) => capability.toLowerCase());
}

function isPrivateModel(model: AiModelRecord) {
  return model.provider === 'private' || modelCapabilities(model).includes('private');
}

function modelOwnershipCounts(records: AiModelRecord[]) {
  const selfBuilt = records.filter(isPrivateModel).length;
  const thirdParty = records.length - selfBuilt;

  return {
    total: records.length,
    selfBuilt,
    thirdParty,
  };
}

function modelOwnershipTags(counts: ReturnType<typeof modelOwnershipCounts>) {
  return [
    { label: '自建', value: String(counts.selfBuilt) },
    { label: '三方', value: String(counts.thirdParty) },
  ];
}

function isVisionModel(model: AiModelRecord) {
  return modelCapabilities(model).some((capability) => ['vision', 'image', 'visual'].includes(capability));
}

function isMultimodalModel(model: AiModelRecord) {
  return modelCapabilities(model).some((capability) => ['multimodal', 'audio'].includes(capability)) || (isVisionModel(model) && modelCapabilities(model).includes('text'));
}

function isLanguageModel(model: AiModelRecord) {
  return modelCapabilities(model).some((capability) => ['text', 'reasoning', 'tool-call', 'code'].includes(capability));
}

function isModelAbnormal(model: AiModelRecord) {
  return !model.endpointUrl.trim() || !model.protocol.trim() || !model.apiKeyEnvVar.trim();
}

function isIndustryMechanismModel(model: AiModelRecord) {
  const keywordText = [model.modelCode, model.modelName, ...modelCapabilities(model)].join(' ').toLowerCase();

  return ['industry', 'domain', 'mechanism', 'industrial', 'vertical', 'sector'].some((keyword) => keywordText.includes(keyword));
}

function modelCategoryKey(model: AiModelRecord): ModelCategoryKey {
  if (isMultimodalModel(model)) return 'multimodal';
  if (isLanguageModel(model)) return 'language';
  if (isVisionModel(model)) return 'vision';

  return 'other';
}

function modelConfigNumber(model: AiModelRecord, keys: readonly string[]) {
  if (!model.config) return null;

  for (const key of keys) {
    const value = model.config[key];

    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, ''));
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}

function stableTokenFallback(model: AiModelRecord) {
  const seed = [...model.modelCode].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 17), 0);
  const base = 1_200_000 + (seed % 6_400_000);

  return model.isActive ? base : Math.round(base * 0.18);
}

function modelTokenCalls(model: AiModelRecord, period: PeriodKey) {
  const baseValue =
    modelConfigNumber(model, ['periodTokens', 'tokenCalls', 'tokenUsage', 'totalTokens', 'tokens', 'usedTokens']) ??
    stableTokenFallback(model);

  return scalePeriodValue(baseValue, period);
}

function formatTokenCount(value: number) {
  return value.toLocaleString('en-US');
}

function serviceMetricsFor(period: PeriodKey) {
  const label = overviewSnapshots[period].label;
  const ticketTotal = scalePeriodValue(326, period);
  const completed = scalePeriodValue(248, period);
  const processing = scalePeriodValue(54, period);
  const paused = scalePeriodValue(24, period);

  return [
    { label: '工单总数', value: ticketTotal.toLocaleString('en-US'), detail: `${label}累计工单 ${ticketTotal.toLocaleString('en-US')}。`, tone: 'blue', icon: 'chat-circle' },
    { label: '已完成', value: completed.toLocaleString('en-US'), detail: `${label}已完成 ${completed.toLocaleString('en-US')}，完成率 76.1%。`, tone: 'green', icon: 'success' },
    { label: '进行中', value: processing.toLocaleString('en-US'), detail: `${label}进行中 ${processing.toLocaleString('en-US')}，平均响应 18 分钟。`, tone: 'cyan', icon: 'clock' },
    { label: '已搁置', value: paused.toLocaleString('en-US'), detail: `${label}已搁置 ${paused.toLocaleString('en-US')}，主要等待客户或产品确认。`, tone: 'amber', icon: 'warning' },
  ] satisfies ServiceMetric[];
}

function ratingMetricsFor(period: PeriodKey) {
  const label = overviewSnapshots[period].label;
  const snapshot = ratingSnapshots[period];

  return [
    { label: '服务评价', value: snapshot.service, detail: `${label}服务评价 ${snapshot.service} 星。`, tone: 'green', icon: 'star', display: 'stars' },
    { label: '产品评价', value: snapshot.product, detail: `${label}产品评价 ${snapshot.product} 星。`, tone: 'blue', icon: 'medal', display: 'stars' },
    { label: 'SLA', value: snapshot.sla, detail: `${label}服务 SLA 达成率 ${snapshot.sla}。`, tone: 'cyan', icon: 'shield-check', display: 'text' },
  ] satisfies ServiceMetric[];
}

function metricToneClass(tone: Tone = 'blue') {
  return `admin-overview-tone admin-overview-tone--${tone}`;
}

function pulseTagToneClass(tone?: Tone) {
  return tone ? `admin-overview-pulse__tag--${tone}` : undefined;
}

function DetailTip({ detail }: { detail: string }) {
  return (
    <span className="admin-overview-tip">
      <button type="button" aria-label={detail} title={detail}>
        <Icon name="help" size="xs" fallback="placeholder" />
      </button>
      <span role="tooltip">{detail}</span>
    </span>
  );
}

function PeriodSwitch({
  value,
  options,
  onChange,
}: {
  value: PeriodKey;
  options: readonly PeriodKey[];
  onChange: (next: PeriodKey) => void;
}) {
  const visibleOptions = periodOptions.filter((option) => options.includes(option.key));
  const activeIndex = Math.max(
    0,
    visibleOptions.findIndex((option) => option.key === value),
  );
  const switchStyle = {
    '--active-offset': `${activeIndex * 100}%`,
    '--item-count': visibleOptions.length,
  } as CSSProperties;

  return (
    <div className="admin-overview-period" role="tablist" aria-label="统计周期" style={switchStyle}>
      {visibleOptions.map((option) => (
        <button
          key={option.key}
          type="button"
          role="tab"
          aria-selected={value === option.key}
          className={value === option.key ? 'admin-overview-period__item admin-overview-period__item--active' : 'admin-overview-period__item'}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function OverviewHeading({
  icon,
  title,
  description,
  period,
  onPeriodChange,
  level = 'section',
}: {
  icon: IconName;
  title: string;
  description: string;
  period: PeriodKey;
  onPeriodChange: (next: PeriodKey) => void;
  level?: 'page' | 'section';
}) {
  const TitleTag = level === 'page' ? 'h1' : 'h2';

  return (
    <div className={`admin-overview-heading ${level === 'page' ? 'admin-overview-heading--page' : ''}`}>
      <span className="admin-overview-heading__icon" aria-hidden="true">
        <Icon name={icon} size="lg" fallback="placeholder" />
      </span>
      <div className="admin-overview-heading__copy">
        <TitleTag>{title}</TitleTag>
        <p>{description}</p>
      </div>
      <PeriodSwitch value={period} options={['recent30', 'total', 'year', 'quarter', 'month']} onChange={onPeriodChange} />
    </div>
  );
}

function OverviewPulseCard({ metric }: { metric: OverviewPulseMetric }) {
  return (
    <article className={`admin-overview-pulse__item ${metricToneClass(metric.tone)}`}>
      <span className="admin-overview-pulse__label">
        {metric.title}
        <DetailTip detail={metric.detail} />
      </span>
      <div className="admin-overview-pulse__line">
        {metric.rating ? (
          <span className="admin-overview-pulse__rating">
            <RatingStars value={metric.rating} />
            <strong>{metric.value}</strong>
          </span>
        ) : (
          <strong className="admin-overview-pulse__value">{metric.value}</strong>
        )}
        <span className="admin-overview-pulse__tags">
          {metric.tags.map((tag) => (
            <em className={pulseTagToneClass(tag.tone)} key={`${tag.label ?? 'value'}-${tag.value}`}>
              {tag.label ? `${tag.label} ` : ''}
              {tag.value}
            </em>
          ))}
        </span>
      </div>
    </article>
  );
}

function businessPanelsFor(period: PeriodKey) {
  return [
    {
      id: 'tenantScale',
      title: '租户规模',
      period,
      detailHref: '/tenants',
      band: overviewSnapshots[period].businessBands[0]!,
    },
    {
      id: 'subscription',
      title: '服务订阅',
      period,
      detailHref: '/subscriptions',
      band: overviewSnapshots[period].businessBands[1]!,
    },
    {
      id: 'finance',
      title: '财务指标',
      period,
      detailHref: '/revenue',
      band: overviewSnapshots[period].businessBands[2]!,
    },
  ] satisfies Array<{
    id: BusinessPanelId;
    title: string;
    period: PeriodKey;
    detailHref: string;
    band: { title: string; tone: Tone; metrics: SummaryMetric[] };
  }>;
}

function tokenAverages(period: PeriodKey) {
  const values = {
    recent30: ['1.88M', '63k'],
    total: ['33.1M', '1.11M'],
    year: ['19.3M', '646k'],
    quarter: ['5.30M', '177k'],
    month: ['1.69M', '57k'],
  } satisfies Record<PeriodKey, [string, string]>;

  return values[period];
}

function compactMetricValue(value: string | undefined, prefixes: readonly string[]) {
  if (!value) return '—';
  const trimmed = value.trim();
  const matchedPrefix = prefixes.find((prefix) => trimmed === prefix || trimmed.startsWith(`${prefix} `));

  return matchedPrefix ? trimmed.slice(matchedPrefix.length).trim() || trimmed : trimmed;
}

function displayMinorValue(label: string, value: string) {
  const aliases: Record<string, readonly string[]> = {
    新增: ['新增租户', '新增用户', '新增订阅', '新增'],
    活跃: ['活跃租户', '活跃用户', '活跃'],
    有效: ['有效订阅', '有效'],
    风险: ['风险续费', '风险', '预警'],
    取消订阅: ['取消订阅', '风险续费', '风险', '预警'],
    总数: ['订阅总数', '总数'],
    提升: ['覆盖提升', '提升'],
    待补齐: ['待补齐'],
    累计: ['累计确认收入', '累计成本', '累计毛利润', '累计'],
    本年: ['本年收入', '本年成本', '本年毛利润', '本年'],
    增长: ['增长'],
    变化: ['变化'],
  };

  return compactMetricValue(value, [label, ...(aliases[label] ?? [])]);
}

function financeSecondaryLabel(period: PeriodKey) {
  return period === 'total' ? '本年' : '累计';
}

function parseFinanceAmount(value: string | undefined) {
  if (!value) return null;
  const match = value.trim().match(/([+-])?\s*(¥)?\s*([+-])?\s*([\d,.]+)\s*([kKmMbB万])?/);

  if (!match) return null;

  const sign = match[1] ?? match[3] ?? '';
  const currency = match[2] ?? '';
  const numeric = Number(match[4]!.replace(/,/g, ''));
  const unit = match[5];

  if (!Number.isFinite(numeric)) return null;

  const multiplier =
    unit?.toLowerCase() === 'b' ? 1_000_000_000 :
    unit?.toLowerCase() === 'm' ? 1_000_000 :
    unit?.toLowerCase() === 'k' ? 1_000 :
    unit === '万' ? 10_000 :
    1;
  const amount = numeric * multiplier * (sign === '-' ? -1 : 1);

  return { amount, currency };
}

function compactUnitValue(value: number, locale: Locale) {
  const maximumFractionDigits = value >= 100 ? 0 : value >= 10 ? 1 : 2;

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatFinanceAmount(amount: number, currency: string, locale: Locale) {
  const sign = amount < 0 ? '-' : '';
  const absoluteAmount = Math.abs(amount);

  if (locale === 'zh-CN') {
    if (absoluteAmount >= 100_000) {
      return `${sign}${currency}${compactUnitValue(absoluteAmount / 10_000, locale)}万`;
    }

    return `${sign}${currency}${Math.round(absoluteAmount).toLocaleString(locale)}`;
  }

  const englishUnits = [
    { threshold: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, suffix: 'M' },
    { threshold: 1_000, suffix: 'K' },
  ];
  const unit = englishUnits.find((item) => absoluteAmount >= item.threshold);

  if (unit) {
    return `${sign}${currency}${compactUnitValue(absoluteAmount / unit.threshold, locale)}${unit.suffix}`;
  }

  return `${sign}${currency}${Math.round(absoluteAmount).toLocaleString(locale)}`;
}

function financeDisplayValue(value: string | undefined, locale: Locale) {
  const parsed = parseFinanceAmount(value);

  if (!parsed) return value?.trim() || '—';

  return formatFinanceAmount(parsed.amount, parsed.currency, locale);
}

function financeNumberValue(value: string | undefined) {
  return parseFinanceAmount(value)?.amount ?? null;
}

function grossMarginRate(revenue: string | undefined, grossProfit: string | undefined) {
  const revenueValue = financeNumberValue(revenue);
  const grossProfitValue = financeNumberValue(grossProfit);

  if (!revenueValue || grossProfitValue === null) return null;

  return `${Math.round((grossProfitValue / revenueValue) * 100)}%`;
}

function overviewPulseMetrics(period: PeriodKey, locale: Locale) {
  const snapshot = overviewSnapshots[period];
  const [, userMetric] = snapshot.businessBands[0]!.metrics;
  const [revenueMetric, costMetric] = snapshot.businessBands[2]!.metrics;
  const serviceMetric = snapshot.platformMetrics[3]!;

  return [
    {
      id: 'userScale',
      title: '用户规模',
      value: userMetric?.value ?? '—',
      detail: userMetric?.detail ?? '暂无用户规模数据。',
      tone: 'blue',
      tags: [{ value: userMetric?.delta ?? '—', tone: displayDeltaTone(userMetric?.delta) }],
    },
    {
      id: 'revenue',
      title: '订阅收入',
      value: financeDisplayValue(revenueMetric?.value, locale),
      detail: revenueMetric?.detail ?? '暂无订阅收入数据。',
      tone: 'green',
      tags: [{ value: revenueMetric?.delta ?? '—' }],
    },
    {
      id: 'cost',
      title: '运营成本',
      value: financeDisplayValue(costMetric?.value, locale),
      detail: costMetric?.detail ?? '暂无运营成本数据。',
      tone: 'amber',
      tags: [{ value: costMetric?.delta ?? '—' }],
    },
    {
      id: 'service',
      title: '服务质量',
      value: serviceMetric.value,
      detail: serviceMetric.detail,
      tone: 'cyan',
      rating: Number(serviceMetric.value),
      tags: [{ label: 'SLA', value: compactMetricValue(serviceMetric.delta, ['SLA']) }],
    },
  ] satisfies OverviewPulseMetric[];
}

function displayDeltaTone(value: string | undefined): Tone | undefined {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === '—') return undefined;
  if (trimmed.startsWith('-') || trimmed.startsWith('¥-')) return 'rose';
  if (trimmed.startsWith('+')) return 'blue';

  return undefined;
}

function isNegativeDisplayValue(value: string) {
  const trimmed = value.trim();

  return trimmed.startsWith('-') || trimmed.startsWith('¥-');
}

interface BusinessCardMetric {
  label: string;
  value: string;
  valueTag?: string;
  detail: string;
  tone?: Tone;
  icon: BusinessMetricIcon;
  minor: Array<{ label: string; value: string; tone?: Tone }>;
}

function businessCardMetrics(panel: ReturnType<typeof businessPanelsFor>[number], locale: Locale): BusinessCardMetric[] {
  const [first, second, third] = panel.band.metrics;

  if (panel.id === 'tenantScale') {
    const [tenantAverage, userAverage] = tokenAverages(panel.period);
    return [
      {
        label: '租户数量',
        value: first?.value ?? '—',
        detail: first?.detail ?? '暂无租户规模数据。',
        tone: first?.tone,
        icon: 'building-library',
        minor: [
          { label: '新增', value: first?.delta ?? '—' },
          { label: '活跃', value: compactMetricValue(first?.secondary, ['活跃租户', '活跃']) },
        ],
      },
      {
        label: '用户数量',
        value: second?.value ?? '—',
        detail: second?.detail ?? '暂无用户规模数据。',
        tone: second?.tone,
        icon: 'users',
        minor: [
          { label: '新增', value: second?.delta ?? '—' },
          { label: '活跃', value: compactMetricValue(second?.secondary, ['活跃用户', '活跃']) },
        ],
      },
      {
        label: '配额消耗',
        value: third?.value ?? '—',
        detail: third?.detail ?? '暂无配额消耗数据。',
        tone: third?.tone,
        icon: 'api',
        minor: [
          { label: '租户平均', value: tenantAverage },
          { label: '用户平均', value: userAverage },
        ],
      },
    ];
  }

  if (panel.id === 'subscription') {
    return [
      {
        label: '订阅总数',
        value: first?.value ?? '—',
        detail: first?.detail ?? '暂无订阅总数数据。',
        tone: first?.tone,
        icon: 'database',
        minor: [
          { label: '新增', value: first?.delta ?? '—' },
          { label: '有效', value: compactMetricValue(first?.secondary, ['有效订阅', '有效']) },
        ],
      },
      {
        label: '新增订阅',
        value: first?.delta ?? '—',
        detail: first?.detail ?? '暂无新增订阅数据。',
        tone: first?.tone,
        icon: 'chart-bar',
        minor: [
          { label: '总数', value: first?.value ?? '—' },
          { label: '取消订阅', value: compactMetricValue(second?.secondary, ['取消订阅', '风险续费', '预警', '风险']), tone: 'rose' },
        ],
      },
      {
        label: '计量覆盖',
        value: third?.value ?? '—',
        detail: third?.detail ?? '暂无计量覆盖数据。',
        tone: third?.tone,
        icon: 'shield-check',
        minor: [
          { label: '提升', value: third?.delta ?? '—' },
          { label: '待补齐', value: compactMetricValue(third?.secondary, ['待补齐']), tone: 'rose' },
        ],
      },
    ];
  }

  return [
    {
      label: '收入',
      value: financeDisplayValue(first?.value, locale),
      detail: first?.detail ?? '暂无收入数据。',
      tone: first?.tone,
      icon: 'chart-bar',
      minor: [
        { label: '增长', value: first?.delta ?? '—' },
        { label: financeSecondaryLabel(panel.period), value: financeDisplayValue(compactMetricValue(first?.secondary, ['累计', '本年']), locale) },
      ],
    },
    {
      label: '成本',
      value: financeDisplayValue(second?.value, locale),
      detail: second?.detail ?? '暂无成本数据。',
      tone: second?.tone,
      icon: 'cloud',
      minor: [
        { label: '变化', value: second?.delta ?? '—' },
        { label: financeSecondaryLabel(panel.period), value: financeDisplayValue(compactMetricValue(second?.secondary, ['累计', '本年']), locale) },
      ],
    },
    {
      label: '毛利',
      value: financeDisplayValue(third?.value, locale),
      valueTag: grossMarginRate(first?.value, third?.value) ?? undefined,
      detail: third?.detail ?? '暂无毛利数据。',
      tone: third?.tone,
      icon: 'chart-bar',
      minor: [
        { label: '增长', value: third?.delta ?? '—' },
        { label: financeSecondaryLabel(panel.period), value: financeDisplayValue(compactMetricValue(third?.secondary, ['累计', '本年']), locale) },
      ],
    },
  ];
}

function BusinessMetricCard({ metric }: { metric: BusinessCardMetric }) {
  return (
    <article className={`admin-overview-business-card ${metricToneClass(metric.tone)}`}>
      <span className="admin-overview-business-card__icon" aria-hidden="true">
        <Icon name={metric.icon} size="lg" fallback="placeholder" />
      </span>
      <div className="admin-overview-business-card__main">
        <span>
          {metric.label}
          <DetailTip detail={metric.detail} />
        </span>
        <span className="admin-overview-business-card__value-line">
          <strong className={isNegativeDisplayValue(metric.value) ? 'admin-overview-business-card__value--danger' : undefined}>{metric.value}</strong>
          {metric.valueTag ? <em>{metric.valueTag}</em> : null}
        </span>
      </div>
      <div className="admin-overview-business-card__minor">
        {metric.minor.map((item) => (
          <div key={item.label} className={`admin-overview-business-card__minor-item ${item.tone === 'rose' ? 'admin-overview-business-card__minor-item--danger' : ''}`}>
            <small>{item.label}</small>
            <span className="admin-overview-business-card__minor-value">{displayMinorValue(item.label, item.value)}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function BusinessPanel({ panel, locale }: { panel: ReturnType<typeof businessPanelsFor>[number]; locale: Locale }) {
  return (
    <section className={`admin-overview-business-panel ${metricToneClass(panel.band.tone)}`} aria-label={panel.title}>
      <div className="admin-overview-business-panel__header">
        <div className="admin-overview-business-panel__header-left">
          <h3>{panel.title}</h3>
          <Link className="admin-overview-business-panel__chart" href={`/usage-metering?period=${panel.period}&scope=${encodeURIComponent(panel.title)}`} title={`${panel.title}图形化显示`}>
            <Icon name="chart-bar" size="sm" fallback="placeholder" />
          </Link>
        </div>
        <Link className="admin-overview-business-panel__detail" href={panel.detailHref}>
          详情
        </Link>
      </div>
      <div className="admin-overview-business-panel__cards">
        {businessCardMetrics(panel, locale).map((metric) => (
          <BusinessMetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}

function ProductMetricCard({ metric }: { metric: ProductMetric }) {
  return (
    <article className={`admin-overview-product-metric ${metricToneClass(metric.tone)}`}>
      <span className="admin-overview-product-metric__icon" aria-hidden="true">
        <Icon name={metric.icon} size="lg" fallback="placeholder" />
      </span>
      <div className="admin-overview-product-metric__main">
        <span className="admin-overview-product-metric__label">
          {metric.label}
          <DetailTip detail={metric.detail} />
        </span>
        <div className="admin-overview-product-metric__line">
          <strong className="admin-overview-product-metric__value">{metric.value}</strong>
          <span className="admin-overview-product-metric__tags">
            {metric.tags.map((tag) => (
              <em key={`${tag.label}-${tag.value}`}>
                {tag.label} {tag.value}
              </em>
            ))}
          </span>
        </div>
      </div>
    </article>
  );
}

function ProductRankingCard({
  title,
  summary,
  href,
  rows,
  kind,
  locale,
}: {
  title: string;
  summary: string;
  href: string;
  rows: Array<ProductOperation & { productName: string }>;
  kind: 'subscriptions' | 'revenue';
  locale: Locale;
}) {
  return (
    <article className={`admin-overview-product-ranking ${kind === 'subscriptions' ? 'admin-overview-tone--blue' : 'admin-overview-tone--green'}`}>
      <div className="admin-overview-product-ranking__header">
        <div>
          <h3>{title}</h3>
          <p>{summary}</p>
        </div>
        <Link href={href}>详情</Link>
      </div>
      <div className="admin-overview-product-ranking__rows">
        {rows.map((item, index) => (
          <div key={item.productCode} className="admin-overview-product-ranking__row">
            <span className={`admin-overview-product-ranking__medal admin-overview-product-ranking__medal--${index + 1}`}>{index + 1}</span>
            <div>
              <strong>{item.productName}</strong>
              <small>{kind === 'subscriptions' ? `新增 +${item.monthlyNew.toLocaleString('en-US')}` : `${item.subscriptions.toLocaleString('en-US')} 订阅`}</small>
            </div>
            <b>{kind === 'subscriptions' ? item.subscriptions.toLocaleString('en-US') : formatCurrency(item.revenue, locale)}</b>
          </div>
        ))}
      </div>
    </article>
  );
}

function ModelMetricCard({ metric }: { metric: ModelMetric }) {
  return (
    <article className={`admin-overview-model-metric ${metricToneClass(metric.tone)}`}>
      <span className="admin-overview-model-metric__icon" aria-hidden="true">
        <Icon name={metric.icon} size="lg" fallback="placeholder" />
      </span>
      <div className="admin-overview-model-metric__main">
        <span className="admin-overview-model-metric__label">
          {metric.label}
          {metric.badges?.map((badge) => (
            <em key={badge}>{badge}</em>
          ))}
          <DetailTip detail={metric.detail} />
        </span>
        <div className="admin-overview-model-metric__line">
          <strong className="admin-overview-model-metric__value">{metric.value}</strong>
          <span className="admin-overview-model-metric__tags">
            {metric.tags.map((tag) => (
              <em key={`${tag.label}-${tag.value}`}>
                {tag.label} {tag.value}
              </em>
            ))}
          </span>
        </div>
      </div>
    </article>
  );
}

function ModelCategoryCard({
  title,
  detail,
  tone,
  rows,
}: {
  title: string;
  detail: string;
  tone: Tone;
  rows: ModelUsageRow[];
}) {
  return (
    <article className={`admin-overview-model-category ${metricToneClass(tone)}`}>
      <div className="admin-overview-model-category__header">
        <h3>{title}</h3>
        <DetailTip detail={detail} />
      </div>
      <div className="admin-overview-model-category__rows">
        {rows.length > 0 ? (
          rows.map((model, index) => (
            <div key={model.id} className="admin-overview-model-category__row">
              <span>{index + 1}</span>
              <div>
                <strong>{model.modelName}</strong>
                <small>{model.provider} · {model.isActive ? '启用' : '停用'}</small>
              </div>
              <b>{formatTokenCount(model.tokenCalls)}</b>
            </div>
          ))
        ) : (
          <p className="admin-overview-model-category__empty">暂无模型</p>
        )}
      </div>
    </article>
  );
}

function ServiceBlock({
  title,
  summary,
  href,
  tone,
  children,
}: {
  title: string;
  summary: string;
  href: string;
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <article className={`admin-overview-service-block ${metricToneClass(tone)}`}>
      <div className="admin-overview-service-block__header">
        <div>
          <h3>{title}</h3>
          <p>{summary}</p>
        </div>
        <Link href={href}>详情</Link>
      </div>
      {children}
    </article>
  );
}

function ServiceMetricCard({ metric }: { metric: ServiceMetric }) {
  return (
    <article className={`admin-overview-service-metric ${metricToneClass(metric.tone)}`}>
      <span className="admin-overview-service-metric__icon" aria-hidden="true">
        <Icon name={metric.icon} size="lg" fallback="placeholder" />
      </span>
      <div className="admin-overview-service-metric__main">
        <span>
          {metric.label}
          <DetailTip detail={metric.detail} />
        </span>
        {metric.display === 'stars' ? (
          <div className="admin-overview-service-metric__rating-line">
            <RatingStars value={Number(metric.value)} />
            <strong>{metric.value}</strong>
          </div>
        ) : (
          <strong>{metric.value}</strong>
        )}
      </div>
      {metric.display === 'text' ? <small>达成率</small> : null}
    </article>
  );
}

function RatingStars({ value }: { value: number }) {
  const rounded = Math.round(value);

  return (
    <span className="admin-overview-stars" aria-label={`${value} 星`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rounded ? 'admin-overview-stars__item admin-overview-stars__item--active' : 'admin-overview-stars__item'}>
          {index < rounded ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

export default function AdminOverviewPage() {
  const locale = useConsoleLocale();
  const [models, setModels] = useState<AiModelRecord[]>([]);
  const [releases, setReleases] = useState<ProductReleaseRecord[]>([]);
  const [globalPeriod, setGlobalPeriod] = useState<PeriodKey>('recent30');
  const [businessPeriod, setBusinessPeriod] = useState<PeriodKey>('recent30');
  const [productPeriod, setProductPeriod] = useState<PeriodKey>('recent30');
  const [modelPeriod, setModelPeriod] = useState<PeriodKey>('recent30');
  const [servicePeriod, setServicePeriod] = useState<PeriodKey>('recent30');
  const pulseMetrics = overviewPulseMetrics(globalPeriod, locale);
  const businessPanels = businessPanelsFor(businessPeriod);
  const globalPeriodLabel = overviewSnapshots[globalPeriod].label;
  const productPeriodLabel = overviewSnapshots[productPeriod].label;
  const modelPeriodLabel = overviewSnapshots[modelPeriod].label;
  const servicePeriodLabel = overviewSnapshots[servicePeriod].label;

  function handleGlobalPeriodChange(next: PeriodKey) {
    setGlobalPeriod(next);
    setBusinessPeriod(next);
    setProductPeriod(next);
    setModelPeriod(next);
    setServicePeriod(next);
  }

  useEffect(() => {
    let active = true;

    Promise.all([fetchAiModels(true), fetchProductReleases()])
      .then(([modelRecords, releaseRecords]) => {
        if (!active) return;
        setModels(modelRecords);
        setReleases(releaseRecords);
      });

    return () => {
      active = false;
    };
  }, []);

  const productNameByCode = useMemo(() => {
    return new Map(releases.map((release) => [release.productCode, release.productName]));
  }, [releases]);

  const productMetrics = useMemo(() => {
    const productTotalCounts = productOwnershipCounts(releases, { uniqueProducts: true });
    const recentCreatedCounts = productOwnershipCounts(releases.filter((release) => isRecentlyUpdated(release.createdAt)), { uniqueProducts: true });
    const newProductCounts = scaleProductOwnershipCounts(recentCreatedCounts, productTotalCounts, productPeriod);
    const releaseTotalCounts = productOwnershipCounts(releases);
    const recentUpdatedCounts = productOwnershipCounts(releases.filter((release) => isRecentlyUpdated(release.updatedAt)));
    const versionUpdateCounts = scaleProductOwnershipCounts(recentUpdatedCounts, releaseTotalCounts, productPeriod);
    const stoppedProductCounts = productOwnershipCounts(releases.filter(isStoppedProduct), { uniqueProducts: true });

    return [
      {
        label: '产品总数',
        value: String(productTotalCounts.total),
        detail: `累计产品 ${productTotalCounts.total} 个，自有 ${productTotalCounts.owned} 个，三方 ${productTotalCounts.thirdParty} 个。`,
        tone: 'blue',
        icon: 'database',
        tags: productOwnershipTags(productTotalCounts),
      },
      {
        label: '新发产品',
        value: String(newProductCounts.total),
        detail: `${productPeriodLabel}新发产品 ${newProductCounts.total} 个，自有 ${newProductCounts.owned} 个，三方 ${newProductCounts.thirdParty} 个。`,
        tone: 'green',
        icon: 'plus',
        tags: productOwnershipTags(newProductCounts),
      },
      {
        label: '版本更新',
        value: String(versionUpdateCounts.total),
        detail: `${productPeriodLabel}版本更新 ${versionUpdateCounts.total} 次，自有 ${versionUpdateCounts.owned} 次，三方 ${versionUpdateCounts.thirdParty} 次。`,
        tone: 'cyan',
        icon: 'workflow',
        tags: productOwnershipTags(versionUpdateCounts),
      },
      {
        label: '停用产品',
        value: String(stoppedProductCounts.total),
        detail: `累计停用产品 ${stoppedProductCounts.total} 个，自有 ${stoppedProductCounts.owned} 个，三方 ${stoppedProductCounts.thirdParty} 个。`,
        tone: 'rose',
        icon: 'warning',
        tags: productOwnershipTags(stoppedProductCounts),
      },
    ] satisfies ProductMetric[];
  }, [productPeriod, productPeriodLabel, releases]);

  const productRankings = useMemo(() => {
    const rows = productOperations.map((item) => ({
      ...periodProductOperation(item, productPeriod),
      productName: productNameByCode.get(item.productCode) ?? item.productCode,
    }));

    return {
      subscriptionTop: [...rows].sort((left, right) => right.subscriptions - left.subscriptions).slice(0, 3),
      revenueTop: [...rows].sort((left, right) => right.revenue - left.revenue).slice(0, 3),
    };
  }, [productNameByCode, productPeriod]);

  const modelMetrics = useMemo(() => {
    const activeModelCounts = modelOwnershipCounts(models.filter((model) => model.isActive));
    const abnormalModelCounts = modelOwnershipCounts(models.filter(isModelAbnormal));
    const inactiveModelCounts = modelOwnershipCounts(models.filter((model) => !model.isActive));
    const industryMechanismModelCounts = modelOwnershipCounts(models.filter(isIndustryMechanismModel));

    return [
      {
        label: '生效模型数量',
        value: String(activeModelCounts.total),
        detail: `${modelPeriodLabel}生效模型 ${activeModelCounts.total} 个，自建 ${activeModelCounts.selfBuilt} 个，三方 ${activeModelCounts.thirdParty} 个。`,
        tone: 'green',
        icon: 'cloud',
        badges: ['大模型'],
        tags: modelOwnershipTags(activeModelCounts),
      },
      {
        label: '异常模型数量',
        value: String(abnormalModelCounts.total),
        detail: `${modelPeriodLabel}异常模型 ${abnormalModelCounts.total} 个，自建 ${abnormalModelCounts.selfBuilt} 个，三方 ${abnormalModelCounts.thirdParty} 个。`,
        tone: 'rose',
        icon: 'error',
        badges: ['大模型'],
        tags: modelOwnershipTags(abnormalModelCounts),
      },
      {
        label: '停用模型数量',
        value: String(inactiveModelCounts.total),
        detail: `${modelPeriodLabel}停用模型 ${inactiveModelCounts.total} 个，自建 ${inactiveModelCounts.selfBuilt} 个，三方 ${inactiveModelCounts.thirdParty} 个。`,
        tone: 'amber',
        icon: 'warning',
        badges: ['大模型'],
        tags: modelOwnershipTags(inactiveModelCounts),
      },
      {
        label: '行业机理模型',
        value: String(industryMechanismModelCounts.total),
        detail: `${modelPeriodLabel}行业机理模型 ${industryMechanismModelCounts.total} 个，自建 ${industryMechanismModelCounts.selfBuilt} 个，三方 ${industryMechanismModelCounts.thirdParty} 个。`,
        tone: 'indigo',
        icon: 'cube',
        tags: modelOwnershipTags(industryMechanismModelCounts),
      },
    ] satisfies ModelMetric[];
  }, [modelPeriodLabel, models]);

  const modelCategoryPanels = useMemo(() => {
    const categories = [
      { key: 'multimodal', title: '多模态', detail: '包含 Text + Vision 或 Audio 能力，按 token 调用量排序。', tone: 'indigo' },
      { key: 'language', title: '语言类', detail: '包含 Text、Reasoning、Tool Call、Code 能力，按 token 调用量排序。', tone: 'blue' },
      { key: 'vision', title: '视觉类', detail: '包含 Vision、Image、Visual 能力，按 token 调用量排序。', tone: 'cyan' },
      { key: 'other', title: '其他类', detail: '未归入语言、视觉、多模态的模型，按 token 调用量排序。', tone: 'amber' },
    ] satisfies Array<{ key: ModelCategoryKey; title: string; detail: string; tone: Tone }>;

    const rows = models.map((model) => ({
      id: model.id,
      modelName: model.modelName,
      modelCode: model.modelCode,
      provider: model.provider,
      tokenCalls: modelTokenCalls(model, modelPeriod),
      isActive: model.isActive,
      category: modelCategoryKey(model),
    }));

    return categories.map((category) => ({
      ...category,
      rows: rows
        .filter((row) => row.category === category.key)
        .sort((left, right) => right.tokenCalls - left.tokenCalls)
        .slice(0, 3),
    }));
  }, [modelPeriod, models]);

  const serviceMetrics = useMemo(() => serviceMetricsFor(servicePeriod), [servicePeriod]);
  const ratingMetrics = useMemo(() => ratingMetricsFor(servicePeriod), [servicePeriod]);

  return (
    <div className="vx-page-stack admin-overview">
      <header className="admin-overview-header">
        <OverviewHeading
          icon="squares-four"
          title="平台总览"
          description={`${globalPeriodLabel}聚合经营、产品、模型和服务状态，首页只保留运营判断需要的核心数字。`}
          period={globalPeriod}
          onPeriodChange={handleGlobalPeriodChange}
          level="page"
        />
      </header>

      <section className="admin-overview-pulse" aria-label="平台核心态势">
        {pulseMetrics.map((metric) => (
          <OverviewPulseCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="admin-overview-section" aria-label="经营指标">
        <OverviewHeading icon="chart-bar" title="经营指标" description={`${overviewSnapshots[businessPeriod].label}统计，三组核心指标同步切换。`} period={businessPeriod} onPeriodChange={setBusinessPeriod} />
        <div className="admin-overview-business-panels">
          {businessPanels.map((panel) => (
            <BusinessPanel key={panel.id} panel={panel} locale={locale} />
          ))}
        </div>
      </section>

      <section className="admin-overview-section" aria-label="产品发布">
        <OverviewHeading icon="database" title="产品发布" description={`${productPeriodLabel}供给规模、发布变化和明星产品排行。`} period={productPeriod} onPeriodChange={setProductPeriod} />
        <div className="admin-overview-product-metrics">
          {productMetrics.map((metric) => (
            <ProductMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
        <div className="admin-overview-product-rankings">
          <ProductRankingCard title="订阅排名" summary="默认前三，观察产品用户规模。" href="/subscriptions" rows={productRankings.subscriptionTop} kind="subscriptions" locale={locale} />
          <ProductRankingCard title="收入排名" summary="默认前三，观察产品实质效益。" href="/revenue" rows={productRankings.revenueTop} kind="revenue" locale={locale} />
        </div>
      </section>

      <section className="admin-overview-section" aria-label="大模型接入">
        <OverviewHeading icon="cloud" title="模型接入" description={`${modelPeriodLabel}接入状态与模型分类调用排行。`} period={modelPeriod} onPeriodChange={setModelPeriod} />
        <div className="admin-overview-model-metrics">
          {modelMetrics.map((metric) => (
            <ModelMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
        <div className="admin-overview-model-categories">
          {modelCategoryPanels.map((category) => (
            <ModelCategoryCard key={category.key} title={category.title} detail={category.detail} tone={category.tone} rows={category.rows} />
          ))}
        </div>
      </section>

      <section className="admin-overview-section" aria-label="服务与工单">
        <OverviewHeading icon="chat-circle" title="服务与工单" description={`${servicePeriodLabel}工单处理和服务评价分层展示。`} period={servicePeriod} onPeriodChange={setServicePeriod} />
        <div className="admin-overview-service-stack">
          <ServiceBlock title="工单统计" summary="工单总量、处理状态和搁置情况。" href="/tickets" tone="blue">
            <div className="admin-overview-service-metrics admin-overview-service-metrics--tickets">
            {serviceMetrics.map((metric) => (
                <ServiceMetricCard key={metric.label} metric={metric} />
            ))}
            </div>
          </ServiceBlock>
          <ServiceBlock title="服务评价" summary="服务满意度、产品评价和 SLA 达成。" href="/tickets" tone="green">
            <div className="admin-overview-service-metrics admin-overview-service-metrics--rating">
            {ratingMetrics.map((metric) => (
                <ServiceMetricCard key={metric.label} metric={metric} />
            ))}
            </div>
          </ServiceBlock>
        </div>
      </section>
    </div>
  );
}
