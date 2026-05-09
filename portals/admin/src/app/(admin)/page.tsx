'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button, Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import type { Locale } from '@vxture/shared';
import {
  fetchAiModelGrants,
  fetchAiModels,
  fetchDevServices,
  fetchProductAgents,
  fetchProductModelPolicies,
  fetchProductPlans,
  fetchProductReleases,
  fetchProductSolutions,
} from '@/api/admin-bff';
import type {
  AiModelGrantRecord,
  AiModelRecord,
  DevServiceSnapshot,
  ProductAgentRecord,
  ProductModelPolicyRecord,
  ProductPlanRecord,
  ProductReleaseRecord,
  ProductSolutionRecord,
  ProductSolutionTier,
} from '@/entities/console';
import {
  formatAdminCompactCurrency,
  formatAdminCompactCurrencyDelta,
  formatAdminCompactCurrencyInput,
} from '@/lib/admin-formatters';
import { useConsoleLocale } from '@/lib/console-intl';

type Tone = 'blue' | 'green' | 'cyan' | 'amber' | 'rose' | 'indigo';
type PeriodKey = 'recent30' | 'total' | 'year' | 'quarter' | 'month';
type BusinessPanelId = 'tenantScale' | 'subscription' | 'finance';
type BusinessMetricIcon = 'building-library' | 'user' | 'api' | 'database' | 'chart-bar' | 'shield-check' | 'cloud';

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

interface ProductRankingRow {
  id: string;
  name: string;
  meta: string;
  subscriptions: number;
  monthlyNew: number;
  priceTag?: string;
}

interface ProductMetric extends SummaryMetric {
  icon: IconName;
  tags: Array<{ label: string; value: string; tone?: 'neutral' | 'warning' }>;
}

interface ModelMetric extends SummaryMetric {
  icon: IconName;
  tags: Array<{ label: string; value: string; tone?: 'neutral' | 'warning' }>;
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

interface CapabilityServiceRow {
  id: string;
  name: string;
  meta: string;
  value: string;
  placeholder?: boolean;
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
      { title: '订阅收入', value: '¥68.4万', unit: '周期收入', delta: '+12.4%', tone: 'green', detail: '近30天收入 684,000 元，累计确认收入 8,426,000 元；有效订阅 2,196。' },
      { title: '模型成本', value: '¥17.1万', unit: '周期成本', delta: '+8.2%', tone: 'amber', detail: '近30天模型与服务成本 171,000 元，累计成本 2,164,000 元，成本率 25.0%。' },
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
        tone: 'blue',
        metrics: [
          { label: '订阅产品', value: '2,418', secondary: '有效 2,196', delta: '+186', detail: '订阅产品数量 2,418，新增 186；风险产品已合并到订阅健康状态中。' },
          { label: '订阅续费', value: '32', secondary: '预警 11', delta: '+4', detail: '近30天待跟进续费 32，较上一周期增加 4，其中 11 个存在付款或用量下降风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.6%', secondary: '待补齐 2', delta: '+0.6%', detail: '计量覆盖 98.6%，较上一周期提升 0.6%，仍有 2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'blue',
        metrics: [
          { label: '收入', value: '¥68.4万', secondary: '累计 ¥843万', delta: '+12.4%', detail: '近30天收入 684,000 元，累计确认收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥17.1万', secondary: '累计 ¥216万', delta: '+8.2%', detail: '近30天成本 171,000 元，累计成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥51.3万', secondary: '累计 ¥626万', delta: '+13.8%', detail: '近30天毛利润 513,000 元，累计毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
  total: {
    label: '总计',
    platformMetrics: [
      { title: '平台规模', value: '1,286', unit: '租户', delta: '+426', tone: 'blue', detail: '平台累计租户 1,286，累计新增 426；用户总数 38,420，活跃用户 28,600。' },
      { title: '订阅收入', value: '¥843万', unit: '累计收入', delta: '+34.8%', tone: 'green', detail: '累计确认收入 8,426,000 元；有效订阅 2,196。' },
      { title: '模型成本', value: '¥216万', unit: '累计成本', delta: '+22.6%', tone: 'amber', detail: '累计模型与服务成本 2,164,000 元，成本率 25.7%。' },
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
        tone: 'blue',
        metrics: [
          { label: '订阅产品', value: '2,418', secondary: '有效 2,196', delta: '+1,240', detail: '累计订阅产品 2,418，累计新增 1,240；产品风险归入订阅健康。' },
          { label: '订阅续费', value: '386', secondary: '预警 86', delta: '+54', detail: '累计待跟进续费 386，新增 54，其中 86 个存在付款或用量下降风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.6%', secondary: '待补齐 2', delta: '+3.8%', detail: '累计计量覆盖 98.6%，较年初提升 3.8%，2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'blue',
        metrics: [
          { label: '收入', value: '¥843万', secondary: '本年 ¥843万', delta: '+34.8%', detail: '累计确认收入 8,426,000 元，本年收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥216万', secondary: '本年 ¥216万', delta: '+22.6%', detail: '累计成本 2,164,000 元，本年成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥626万', secondary: '本年 ¥626万', delta: '+39.6%', detail: '累计毛利润 6,262,000 元，本年毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
  month: {
    label: '月度',
    platformMetrics: [
      { title: '平台规模', value: '1,286', unit: '租户', delta: '+38', tone: 'blue', detail: '本月新增租户 38，活跃租户 818；新增用户 1,120，活跃用户 18,420。' },
      { title: '订阅收入', value: '¥64.2万', unit: '月收入', delta: '+10.6%', tone: 'green', detail: '本月收入 642,000 元，累计确认收入 8,426,000 元；有效订阅 2,196。' },
      { title: '模型成本', value: '¥16.2万', unit: '月成本', delta: '+7.4%', tone: 'amber', detail: '本月成本 162,000 元，累计成本 2,164,000 元，成本率 25.2%。' },
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
        tone: 'blue',
        metrics: [
          { label: '订阅产品', value: '2,392', secondary: '有效 2,176', delta: '+162', detail: '本月订阅产品 2,392，新增 162；风险产品已并入订阅健康。' },
          { label: '订阅续费', value: '28', secondary: '预警 9', delta: '+3', detail: '本月待跟进续费 28，较上一周期增加 3，其中 9 个存在风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.2%', secondary: '待补齐 2', delta: '+0.4%', detail: '本月计量覆盖 98.2%，较上一周期提升 0.4%，2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'blue',
        metrics: [
          { label: '收入', value: '¥64.2万', secondary: '累计 ¥843万', delta: '+10.6%', detail: '本月收入 642,000 元，累计确认收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥16.2万', secondary: '累计 ¥216万', delta: '+7.4%', detail: '本月成本 162,000 元，累计成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥48万', secondary: '累计 ¥626万', delta: '+11.8%', detail: '本月毛利润 480,000 元，累计毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
  quarter: {
    label: '季度',
    platformMetrics: [
      { title: '平台规模', value: '1,286', unit: '租户', delta: '+126', tone: 'blue', detail: '本季度新增租户 126，活跃租户 902；新增用户 3,940，活跃用户 21,800。' },
      { title: '订阅收入', value: '¥196万', unit: '季度收入', delta: '+18.2%', tone: 'green', detail: '本季度收入 1,956,000 元，累计确认收入 8,426,000 元。' },
      { title: '模型成本', value: '¥48.6万', unit: '季度成本', delta: '+11.5%', tone: 'amber', detail: '本季度成本 486,000 元，累计成本 2,164,000 元，成本率 24.8%。' },
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
        tone: 'blue',
        metrics: [
          { label: '订阅产品', value: '2,418', secondary: '有效 2,196', delta: '+512', detail: '本季度订阅产品 2,418，新增 512；产品风险归入订阅健康。' },
          { label: '订阅续费', value: '96', secondary: '预警 27', delta: '+12', detail: '本季度待跟进续费 96，较上一周期增加 12，其中 27 个存在付款或用量下降风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.6%', secondary: '待补齐 2', delta: '+1.1%', detail: '本季度计量覆盖 98.6%，较上一周期提升 1.1%，2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'blue',
        metrics: [
          { label: '收入', value: '¥196万', secondary: '累计 ¥843万', delta: '+18.2%', detail: '本季度收入 1,956,000 元，累计确认收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥48.6万', secondary: '累计 ¥216万', delta: '+11.5%', detail: '本季度成本 486,000 元，累计成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥147万', secondary: '累计 ¥626万', delta: '+20.6%', detail: '本季度毛利润 1,470,000 元，累计毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
  year: {
    label: '年度',
    platformMetrics: [
      { title: '平台规模', value: '1,286', unit: '租户', delta: '+426', tone: 'blue', detail: '本年度新增租户 426，活跃租户 1,024；新增用户 12,800，活跃用户 28,600。' },
      { title: '订阅收入', value: '¥843万', unit: '年度收入', delta: '+34.8%', tone: 'green', detail: '年度收入 8,426,000 元，累计确认收入 8,426,000 元。' },
      { title: '模型成本', value: '¥216万', unit: '年度成本', delta: '+22.6%', tone: 'amber', detail: '年度成本 2,164,000 元，成本率 25.7%。' },
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
        tone: 'blue',
        metrics: [
          { label: '订阅产品', value: '2,418', secondary: '有效 2,196', delta: '+1,240', detail: '年度订阅产品 2,418，新增 1,240；产品风险归入订阅健康。' },
          { label: '订阅续费', value: '386', secondary: '预警 86', delta: '+54', detail: '年度待跟进续费 386，较上一周期增加 54，其中 86 个存在付款或用量下降风险。', tone: 'amber' },
          { label: '计量覆盖', value: '98.6%', secondary: '待补齐 2', delta: '+3.8%', detail: '年度计量覆盖 98.6%，较上一周期提升 3.8%，2 个低频产品待补齐。', tone: 'green' },
        ],
      },
      {
        title: '财务统计',
        tone: 'blue',
        metrics: [
          { label: '收入', value: '¥843万', secondary: '累计 ¥843万', delta: '+34.8%', detail: '年度收入 8,426,000 元，累计确认收入 8,426,000 元。', tone: 'green' },
          { label: '成本', value: '¥216万', secondary: '累计 ¥216万', delta: '+22.6%', detail: '年度成本 2,164,000 元，累计成本 2,164,000 元。', tone: 'amber' },
          { label: '毛利润', value: '¥626万', secondary: '累计 ¥626万', delta: '+39.6%', detail: '年度毛利润 6,262,000 元，累计毛利润 6,262,000 元。', tone: 'green' },
        ],
      },
    ],
  },
} satisfies Record<PeriodKey, { label: string; platformMetrics: PlatformMetric[]; businessBands: Array<{ title: string; tone: Tone; metrics: SummaryMetric[] }> }>;

const productOperations: ProductOperation[] = [
  { productCode: 'vxture-console-cn', subscriptions: 846, monthlyNew: 68, revenue: 2_536_000 },
  { productCode: 'ruyin-cn', subscriptions: 724, monthlyNew: 91, revenue: 1_468_000 },
  { productCode: 'ruyin-intl', subscriptions: 118, monthlyNew: 27, revenue: 338_000 },
];

const periodScale = {
  recent30: 1,
  total: 8.4,
  year: 6.2,
  quarter: 2.7,
  month: 0.92,
} satisfies Record<PeriodKey, number>;

const tierPlanCodeMap: Record<ProductSolutionTier['tierCode'], string> = {
  free: 'starter',
  pro: 'growth',
  enterprise: 'enterprise',
  custom: 'enterprise',
};

const ratingSnapshots = {
  recent30: { service: '4.7', product: '4.5', sla: '92%' },
  total: { service: '4.6', product: '4.4', sla: '90%' },
  year: { service: '4.6', product: '4.4', sla: '90%' },
  quarter: { service: '4.6', product: '4.5', sla: '91%' },
  month: { service: '4.7', product: '4.5', sla: '93%' },
} satisfies Record<PeriodKey, { service: string; product: string; sla: string }>;

const customerLifecycleSnapshots = {
  recent30: { paidTenants: '612', tenantChurn: '8', userChurn: '126', enterpriseTenants: '186', activeEnterpriseTenants: '142', newEnterpriseTenants: '+9', enterpriseChurn: '2' },
  total: { paidTenants: '684', tenantChurn: '72', userChurn: '1,860', enterpriseTenants: '248', activeEnterpriseTenants: '196', newEnterpriseTenants: '+86', enterpriseChurn: '18' },
  year: { paidTenants: '684', tenantChurn: '42', userChurn: '1,120', enterpriseTenants: '248', activeEnterpriseTenants: '196', newEnterpriseTenants: '+62', enterpriseChurn: '10' },
  quarter: { paidTenants: '648', tenantChurn: '18', userChurn: '386', enterpriseTenants: '224', activeEnterpriseTenants: '172', newEnterpriseTenants: '+21', enterpriseChurn: '4' },
  month: { paidTenants: '612', tenantChurn: '6', userChurn: '98', enterpriseTenants: '186', activeEnterpriseTenants: '138', newEnterpriseTenants: '+7', enterpriseChurn: '1' },
} satisfies Record<
  PeriodKey,
  {
    paidTenants: string;
    tenantChurn: string;
    userChurn: string;
    enterpriseTenants: string;
    activeEnterpriseTenants: string;
    newEnterpriseTenants: string;
    enterpriseChurn: string;
  }
>;

const subscriptionLifecycleSnapshots = {
  recent30: { paidSubscriptions: '1,824', conversionRate: '72%', trialSubscriptions: '386', newPaidSubscriptions: '+118', cancelledSubscriptions: '14', renewalDue: '32', renewalRisk: '11', overdueSubscriptions: '4' },
  total: { paidSubscriptions: '1,924', conversionRate: '74%', trialSubscriptions: '494', newPaidSubscriptions: '+620', cancelledSubscriptions: '126', renewalDue: '386', renewalRisk: '86', overdueSubscriptions: '28' },
  year: { paidSubscriptions: '1,924', conversionRate: '74%', trialSubscriptions: '494', newPaidSubscriptions: '+620', cancelledSubscriptions: '86', renewalDue: '386', renewalRisk: '86', overdueSubscriptions: '28' },
  quarter: { paidSubscriptions: '1,872', conversionRate: '73%', trialSubscriptions: '546', newPaidSubscriptions: '+264', cancelledSubscriptions: '34', renewalDue: '96', renewalRisk: '27', overdueSubscriptions: '10' },
  month: { paidSubscriptions: '1,806', conversionRate: '71%', trialSubscriptions: '586', newPaidSubscriptions: '+102', cancelledSubscriptions: '12', renewalDue: '28', renewalRisk: '9', overdueSubscriptions: '3' },
} satisfies Record<
  PeriodKey,
  {
    paidSubscriptions: string;
    conversionRate: string;
    trialSubscriptions: string;
    newPaidSubscriptions: string;
    cancelledSubscriptions: string;
    renewalDue: string;
    renewalRisk: string;
    overdueSubscriptions: string;
  }
>;

const revenueValidationSnapshots = {
  recent30: { actualRevenue: '¥58.2万', nominalRevenue: '¥74.4万', revenueQualityRate: '78%', discountAmount: '¥16.2万', newPaidRevenue: '+¥9.6万', collectionRate: '91%', collectedAmount: '¥61.6万', receivableAmount: '¥6.8万', overdueAmount: '¥1.8万' },
  total: { actualRevenue: '¥716万', nominalRevenue: '¥920万', revenueQualityRate: '78%', discountAmount: '¥204万', newPaidRevenue: '+¥124万', collectionRate: '92%', collectedAmount: '¥758万', receivableAmount: '¥84.2万', overdueAmount: '¥12.6万' },
  year: { actualRevenue: '¥716万', nominalRevenue: '¥920万', revenueQualityRate: '78%', discountAmount: '¥204万', newPaidRevenue: '+¥124万', collectionRate: '92%', collectedAmount: '¥758万', receivableAmount: '¥84.2万', overdueAmount: '¥12.6万' },
  quarter: { actualRevenue: '¥167万', nominalRevenue: '¥210万', revenueQualityRate: '80%', discountAmount: '¥43万', newPaidRevenue: '+¥38.6万', collectionRate: '90%', collectedAmount: '¥176万', receivableAmount: '¥19.6万', overdueAmount: '¥4.2万' },
  month: { actualRevenue: '¥54.6万', nominalRevenue: '¥69.4万', revenueQualityRate: '79%', discountAmount: '¥14.8万', newPaidRevenue: '+¥8.2万', collectionRate: '92%', collectedAmount: '¥59万', receivableAmount: '¥6.2万', overdueAmount: '¥1.4万' },
} satisfies Record<
  PeriodKey,
  {
    actualRevenue: string;
    nominalRevenue: string;
    revenueQualityRate: string;
    discountAmount: string;
    newPaidRevenue: string;
    collectionRate: string;
    collectedAmount: string;
    receivableAmount: string;
    overdueAmount: string;
  }
>;

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

function productActiveCount(records: ProductReleaseRecord[], options: { uniqueProducts?: boolean } = {}) {
  const scopedRecords = options.uniqueProducts ? uniqueProductReleases(records) : records;

  return scopedRecords.filter((release) => release.productStatus === 'active' && release.isActive).length;
}

function productSolutionCounts(records: ProductSolutionRecord[]) {
  const active = records.filter((solution) => solution.status === 'active').length;
  const publicCount = records.filter((solution) => solution.visibility === 'public').length;
  const industryCount = new Set(records.map((solution) => solution.industry).filter(Boolean)).size;

  return {
    total: records.length,
    active,
    public: publicCount,
    industryCount,
  };
}

function productTierCounts(records: ProductSolutionRecord[]) {
  const tiers = records.flatMap((solution) => solution.tiers);
  const active = tiers.filter((tier) => tier.status === 'active').length;
  const publicCount = tiers.filter((tier) => tier.isPublic).length;

  return {
    total: tiers.length,
    active,
    public: publicCount,
  };
}

function productSupplyAbnormalCounts(releases: ProductReleaseRecord[], solutions: ProductSolutionRecord[]) {
  const stoppedProducts = uniqueProductReleases(releases).filter((release) => release.productStatus === 'archived' || !release.isActive).length;
  const abnormalSolutions = solutions.filter((solution) => solution.status !== 'active').length;
  const inactiveTiers = solutions.flatMap((solution) => solution.tiers).filter((tier) => tier.status !== 'active').length;

  return {
    total: stoppedProducts + abnormalSolutions + inactiveTiers,
    stoppedProducts,
    abnormalSolutions,
    inactiveTiers,
  };
}

function defaultProductPlanPrice(plan: ProductPlanRecord | null) {
  if (!plan) return null;

  return plan.prices.find((price) => price.isDefault && price.isActive) ?? plan.prices.find((price) => price.isActive) ?? plan.prices[0] ?? null;
}

function productTierPriceLabel(tier: ProductSolutionTier, plan: ProductPlanRecord | null, locale: Locale) {
  if (tier.tierCode === 'free') return '免费';
  if (tier.tierCode === 'enterprise' || tier.tierCode === 'custom') return '合同报价';

  const price = defaultProductPlanPrice(plan);
  if (!price) return '待定价';

  return `${formatAdminCompactCurrency(price.price, locale)} / ${price.periodType === 'yearly' ? '年' : '月'}`;
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

function isModelAbnormal(model: AiModelRecord) {
  return !model.endpointUrl.trim() || !model.protocol.trim() || !model.apiKeyEnvVar.trim();
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

function serviceStatus(service: DevServiceSnapshot) {
  if (service.stopping) return '停止中';
  if (service.listening && service.healthy) return '健康';
  if (service.listening) return '未就绪';
  return '离线';
}

function serviceMaxDuration(service: DevServiceSnapshot) {
  return Math.max(0, ...service.health.map((check) => check.durationMs));
}

function capabilityServiceHealth(services: DevServiceSnapshot[]) {
  if (!services.length) {
    return { total: 12, healthy: 11, abnormal: 1, availability: 92 };
  }

  const healthy = services.filter((service) => service.listening && service.healthy).length;
  const total = services.length;
  const abnormal = total - healthy;

  return {
    total,
    healthy,
    abnormal,
    availability: Math.round((healthy / Math.max(1, total)) * 100),
  };
}

function capabilityPolicyCoverage(policies: ProductModelPolicyRecord[], grants: AiModelGrantRecord[]) {
  const definedPolicies = policies.filter((policy) => policy.isDefined && policy.isActive).length;
  const activeGrants = grants.filter((grant) => grant.isActive).length;
  const total = policies.length + grants.length;
  const active = definedPolicies + activeGrants;

  return {
    total,
    active,
    pending: Math.max(0, total - active),
    rate: Math.round((active / Math.max(1, total)) * 100),
  };
}

function riskTagTone(value: number): 'neutral' | 'warning' {
  return value > 0 ? 'warning' : 'neutral';
}

function fillCapabilityRows(rows: CapabilityServiceRow[], prefix: string) {
  if (rows.length >= 3) return rows.slice(0, 3);

  return [
    ...rows,
    ...Array.from({ length: 3 - rows.length }, (_, index) => ({
      id: `${prefix}-placeholder-${index}`,
      name: '待接入',
      meta: '暂无数据',
      value: '—',
      placeholder: true,
    })),
  ];
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
      <Button variant="ghost" size="icon" aria-label={detail} title={detail}>
        <Icon name="help" size="xs" fallback="placeholder" />
      </Button>
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
        <Button
          key={option.key}
          variant={value === option.key ? 'secondary' : 'ghost'}
          size="sm"
          role="tab"
          aria-selected={value === option.key}
          className={value === option.key ? 'admin-overview-period__item admin-overview-period__item--active' : 'admin-overview-period__item'}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </Button>
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
            <MetricValue value={metric.value} />
          </span>
        ) : (
          <MetricValue value={metric.value} className="admin-overview-pulse__value" />
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
      title: '客户增长',
      period,
      detailHref: '/tenants',
      band: overviewSnapshots[period].businessBands[0]!,
    },
    {
      id: 'subscription',
      title: '订阅转化',
      period,
      detailHref: '/subscriptions',
      band: overviewSnapshots[period].businessBands[1]!,
    },
    {
      id: 'finance',
      title: '收入验证',
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

function extractServiceBlockedCount(detail: string | undefined) {
  const matched = detail?.match(/搁置\s*([\d,]+)/);

  return matched?.[1] ?? '—';
}

function overviewPulseMetrics(period: PeriodKey, locale: Locale) {
  const snapshot = overviewSnapshots[period];
  const [tenantMetric, , tokenMetric] = snapshot.businessBands[0]!.metrics;
  const [revenueMetric] = snapshot.businessBands[2]!.metrics;
  const serviceMetric = snapshot.platformMetrics[3]!;

  return [
    {
      id: 'activeCustomers',
      title: '活跃客户',
      value: compactMetricValue(tenantMetric?.secondary, ['活跃']) || tenantMetric?.value || '—',
      detail: tenantMetric?.detail ?? '暂无活跃客户数据。',
      tone: 'blue',
      tags: [{ label: '新增', value: tenantMetric?.delta ?? '—', tone: displayDeltaTone(tenantMetric?.delta) }],
    },
    {
      id: 'revenue',
      title: '订阅收入',
      value: formatAdminCompactCurrencyInput(revenueMetric?.value, locale),
      detail: revenueMetric?.detail ?? '暂无订阅收入数据。',
      tone: 'green',
      tags: [{ value: revenueMetric?.delta ?? '—', tone: displayDeltaTone(revenueMetric?.delta) }],
    },
    {
      id: 'modelCalls',
      title: '模型调用',
      value: tokenMetric?.value ?? '—',
      detail: tokenMetric?.detail ?? '暂无模型调用数据。',
      tone: 'amber',
      tags: [{ value: tokenMetric?.delta ?? '—', tone: displayDeltaTone(tokenMetric?.delta) }],
    },
    {
      id: 'platformStability',
      title: '平台稳定性',
      value: compactMetricValue(serviceMetric.delta, ['SLA']),
      detail: serviceMetric.detail,
      tone: 'cyan',
      tags: [{ label: '阻塞工单', value: extractServiceBlockedCount(serviceMetric.detail) }],
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

function splitMetricValue(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^([+-]?[$¥]?)([\d,.]+)(万|[KkMmBb]|%)?$/);

  if (!match) return { prefix: '', number: value, unit: '' };

  return {
    prefix: match[1] ?? '',
    number: match[2] ?? value,
    unit: match[3] ?? '',
  };
}

function MetricValue({
  value,
  className,
  danger,
  as = 'strong',
}: {
  value: string;
  className?: string;
  danger?: boolean;
  as?: 'strong' | 'b';
}) {
  const valueParts = splitMetricValue(value);
  const Tag = as;
  const classNames = [
    'admin-overview-metric-value',
    className,
    danger ? 'admin-overview-metric-value--danger' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classNames}>
      {valueParts.prefix}{valueParts.number}
      {valueParts.unit ? <small>{valueParts.unit}</small> : null}
    </Tag>
  );
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
  const [first, second] = panel.band.metrics;

  if (panel.id === 'tenantScale') {
    const lifecycle = customerLifecycleSnapshots[panel.period];
    return [
      {
        label: '租户规模',
        value: first?.value ?? '—',
        valueTag: compactMetricValue(first?.secondary, ['活跃租户', '活跃']),
        detail: first?.detail ?? '暂无租户增长数据。',
        tone: 'blue',
        icon: 'chart-bar',
        minor: [
          { label: '新增', value: first?.delta ?? '—' },
          { label: '注销', value: lifecycle.tenantChurn, tone: 'rose' },
        ],
      },
      {
        label: '用户规模',
        value: second?.value ?? '—',
        valueTag: compactMetricValue(second?.secondary, ['活跃用户', '活跃']),
        detail: second?.detail ?? '暂无用户规模数据。',
        tone: 'blue',
        icon: 'user',
        minor: [
          { label: '新增', value: second?.delta ?? '—' },
          { label: '注销', value: lifecycle.userChurn, tone: 'rose' },
        ],
      },
      {
        label: '私域大客户',
        value: lifecycle.enterpriseTenants,
        valueTag: lifecycle.activeEnterpriseTenants,
        detail: '私域沉淀的高价值客户数量，包含企业客户、重点个人客户和行业项目客户，用于观察高价值客户池的增长与留存。',
        tone: 'blue',
        icon: 'building-library',
        minor: [
          { label: '新增', value: lifecycle.newEnterpriseTenants },
          { label: '流失', value: lifecycle.enterpriseChurn, tone: 'rose' },
        ],
      },
    ];
  }

  if (panel.id === 'subscription') {
    const lifecycle = subscriptionLifecycleSnapshots[panel.period];
    return [
      {
        label: '订阅规模',
        value: first?.value ?? '—',
        valueTag: compactMetricValue(first?.secondary, ['有效订阅', '有效']),
        detail: '有效订阅指当前处于试用、已付费或合同服务期内，仍能产生产品权益的订阅实例。',
        tone: 'blue',
        icon: 'database',
        minor: [
          { label: '新增', value: first?.delta ?? '—' },
          { label: '取消', value: lifecycle.cancelledSubscriptions, tone: 'rose' },
        ],
      },
      {
        label: '付费转化',
        value: lifecycle.paidSubscriptions,
        valueTag: lifecycle.conversionRate,
        detail: '转化率按付费订阅 /（试用订阅 + 付费订阅）计算，用于观察试用或免费方案转为付费方案的效率。',
        tone: 'blue',
        icon: 'chart-bar',
        minor: [
          { label: '试用', value: lifecycle.trialSubscriptions },
          { label: '付费', value: lifecycle.newPaidSubscriptions },
        ],
      },
      {
        label: '续费健康',
        value: lifecycle.renewalDue,
        valueTag: lifecycle.renewalRisk,
        detail: second?.detail ?? '暂无续费健康数据。',
        tone: 'amber',
        icon: 'shield-check',
        minor: [
          { label: '到期', value: lifecycle.renewalRisk, tone: 'rose' },
          { label: '逾期', value: lifecycle.overdueSubscriptions, tone: 'rose' },
        ],
      },
    ];
  }

  const revenue = revenueValidationSnapshots[panel.period];
  return [
    {
      label: '收入规模',
      value: formatAdminCompactCurrencyInput(first?.value, locale),
      valueTag: first?.delta ?? '—',
      detail: first?.detail ?? '暂无收入数据。',
      tone: 'blue',
      icon: 'chart-bar',
      minor: [
        { label: '新增', value: formatAdminCompactCurrencyDelta(revenue.newPaidRevenue, locale) },
        { label: financeSecondaryLabel(panel.period), value: formatAdminCompactCurrencyInput(compactMetricValue(first?.secondary, ['累计', '本年']), locale) },
      ],
    },
    {
      label: '收入质量',
      value: revenue.revenueQualityRate,
      valueTag: formatAdminCompactCurrencyInput(revenue.actualRevenue, locale),
      detail: '收入质量按实际收入 / 名义收入计算。名义收入包含代金券、折扣抵扣或账面权益，实际收入更接近真实商业验证。',
      tone: 'blue',
      icon: 'database',
      minor: [
        { label: '名义', value: formatAdminCompactCurrencyInput(revenue.nominalRevenue, locale) },
        { label: '抵扣', value: formatAdminCompactCurrencyInput(revenue.discountAmount, locale) },
      ],
    },
    {
      label: '回款健康',
      value: revenue.collectionRate,
      valueTag: formatAdminCompactCurrencyInput(revenue.collectedAmount, locale),
      detail: '回款健康用于观察确认收入是否能按账期变成现金，逾期金额越高越需要运营或财务跟进。',
      tone: 'amber',
      icon: 'shield-check',
      minor: [
        { label: '应收', value: formatAdminCompactCurrencyInput(revenue.receivableAmount, locale) },
        { label: '逾期', value: formatAdminCompactCurrencyInput(revenue.overdueAmount, locale), tone: 'rose' },
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
          <MetricValue value={metric.value} danger={isNegativeDisplayValue(metric.value)} />
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
          <MetricValue value={metric.value} className="admin-overview-product-metric__value" />
          <span className="admin-overview-product-metric__tags">
            {metric.tags.map((tag) => (
              <em key={`${tag.label}-${tag.value}`} className={tag.tone ? `admin-overview-metric-tag--${tag.tone}` : undefined}>
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
  detail = summary,
  href,
  rows,
  tone = 'blue',
}: {
  title: string;
  summary: string;
  detail?: string;
  href: string;
  rows: ProductRankingRow[];
  tone?: Tone;
}) {
  return (
    <article className={`admin-overview-product-ranking ${metricToneClass(tone)}`}>
      <div className="admin-overview-product-ranking__header">
        <div>
          <div className="admin-overview-card-title-line">
            <h3>{title}</h3>
            <DetailTip detail={detail} />
          </div>
          <p>{summary}</p>
        </div>
        <Link href={href}>详情</Link>
      </div>
      <div className="admin-overview-product-ranking__rows">
        {rows.map((item, index) => (
          <div key={item.id} className="admin-overview-product-ranking__row">
            <span className={`admin-overview-product-ranking__medal admin-overview-product-ranking__medal--${index + 1}`} role="img" aria-label={`第 ${index + 1} 名`} />
            <div>
              <strong>{item.name}</strong>
              <small>{item.meta} · 新增 +{item.monthlyNew.toLocaleString('en-US')}</small>
            </div>
            <span className="admin-overview-product-ranking__value-line">
              <MetricValue value={item.subscriptions.toLocaleString('en-US')} as="b" />
              {item.priceTag ? <em>{item.priceTag}</em> : null}
            </span>
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
          <MetricValue value={metric.value} className="admin-overview-model-metric__value" />
          <span className="admin-overview-model-metric__tags">
            {metric.tags.map((tag) => (
              <em key={`${tag.label}-${tag.value}`} className={tag.tone ? `admin-overview-metric-tag--${tag.tone}` : undefined}>
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
  summary,
  tone,
  href,
  rankStyle = 'number',
  rows,
}: {
  title: string;
  detail: string;
  summary: string;
  tone: Tone;
  href?: string;
  rankStyle?: 'number' | 'medal';
  rows: CapabilityServiceRow[];
}) {
  return (
    <article className={`admin-overview-model-category ${metricToneClass(tone)}`}>
      <div className="admin-overview-model-category__header">
        <div>
          <div className="admin-overview-card-title-line">
            <h3>{title}</h3>
            <DetailTip detail={detail} />
          </div>
          <p>{summary}</p>
        </div>
        {href ? <Link href={href}>详情</Link> : null}
      </div>
      <div className="admin-overview-model-category__rows">
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <div key={row.id} className={row.placeholder ? 'admin-overview-model-category__row admin-overview-model-category__row--placeholder' : 'admin-overview-model-category__row'}>
              <span className={rankStyle === 'medal' ? `admin-overview-product-ranking__medal admin-overview-product-ranking__medal--${index + 1}` : undefined} role={rankStyle === 'medal' ? 'img' : undefined} aria-label={rankStyle === 'medal' ? `第 ${index + 1} 名` : undefined}>
                {rankStyle === 'number' ? index + 1 : null}
              </span>
              <div>
                <strong>{row.name}</strong>
                <small>
                  <span>{row.meta}</span>
                  <em>{row.value}</em>
                </small>
              </div>
            </div>
          ))
        ) : (
          <p className="admin-overview-model-category__empty">暂无数据</p>
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
            <MetricValue value={metric.value} />
          </div>
        ) : (
          <MetricValue value={metric.value} />
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
  const [modelGrants, setModelGrants] = useState<AiModelGrantRecord[]>([]);
  const [modelPolicies, setModelPolicies] = useState<ProductModelPolicyRecord[]>([]);
  const [agents, setAgents] = useState<ProductAgentRecord[]>([]);
  const [services, setServices] = useState<DevServiceSnapshot[]>([]);
  const [releases, setReleases] = useState<ProductReleaseRecord[]>([]);
  const [plans, setPlans] = useState<ProductPlanRecord[]>([]);
  const [solutions, setSolutions] = useState<ProductSolutionRecord[]>([]);
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

    Promise.all([
      fetchAiModels(true),
      fetchAiModelGrants(),
      fetchProductModelPolicies(),
      fetchProductAgents(),
      fetchDevServices().catch(() => [] as DevServiceSnapshot[]),
      fetchProductReleases(),
      fetchProductPlans(),
      fetchProductSolutions(),
    ])
      .then(([modelRecords, grantRecords, policyRecords, agentRecords, serviceRecords, releaseRecords, planRecords, solutionRecords]) => {
        if (!active) return;
        setModels(modelRecords);
        setModelGrants(grantRecords);
        setModelPolicies(policyRecords);
        setAgents(agentRecords);
        setServices(serviceRecords);
        setReleases(releaseRecords);
        setPlans(planRecords);
        setSolutions(solutionRecords);
      });

    return () => {
      active = false;
    };
  }, []);

  const productMetrics = useMemo(() => {
    const productTotalCounts = productOwnershipCounts(releases, { uniqueProducts: true });
    const releaseTotalCounts = productOwnershipCounts(releases);
    const recentUpdatedCounts = productOwnershipCounts(releases.filter((release) => isRecentlyUpdated(release.updatedAt)));
    const versionUpdateCounts = scaleProductOwnershipCounts(recentUpdatedCounts, releaseTotalCounts, productPeriod);
    const solutionCounts = productSolutionCounts(solutions);
    const tierCounts = productTierCounts(solutions);
    const activeProductCount = productActiveCount(releases, { uniqueProducts: true });
    const abnormalCounts = productSupplyAbnormalCounts(releases, solutions);

    return [
      {
        label: '产品能力',
        value: String(productTotalCounts.total),
        detail: `产品能力是平台可被方案编排的底层产品供给，累计 ${productTotalCounts.total} 个，生效 ${activeProductCount} 个，自有 ${productTotalCounts.owned} 个，三方 ${productTotalCounts.thirdParty} 个；${productPeriodLabel}版本更新 ${versionUpdateCounts.total} 次。`,
        tone: 'blue',
        icon: 'database',
        tags: [
          { label: '生效', value: String(activeProductCount) },
          { label: '更新', value: String(versionUpdateCounts.total) },
        ],
      },
      {
        label: '方案组合',
        value: String(solutionCounts.total),
        detail: `方案组合承接行业、场景和客户分层，当前方案 ${solutionCounts.total} 个，生效 ${solutionCounts.active} 个，覆盖 ${solutionCounts.industryCount} 个行业。`,
        tone: 'blue',
        icon: 'workflow',
        tags: [
          { label: '生效', value: String(solutionCounts.active) },
          { label: '行业', value: String(solutionCounts.industryCount) },
        ],
      },
      {
        label: '套餐层级',
        value: String(tierCounts.total),
        detail: `套餐层级是方案下可售卖、可授权的权益包，当前套餐 ${tierCounts.total} 个，生效 ${tierCounts.active} 个，公开 ${tierCounts.public} 个。`,
        tone: 'blue',
        icon: 'cube',
        tags: [
          { label: '生效', value: String(tierCounts.active) },
          { label: '公开', value: String(tierCounts.public) },
        ],
      },
      {
        label: '供给异常',
        value: String(abnormalCounts.total),
        detail: `供给异常用于观察会影响售卖或交付的非正常状态：停用产品 ${abnormalCounts.stoppedProducts} 个，异常方案 ${abnormalCounts.abnormalSolutions} 个，未生效套餐 ${abnormalCounts.inactiveTiers} 个。`,
        tone: abnormalCounts.total > 0 ? 'amber' : 'blue',
        icon: 'warning',
        tags: [
          { label: '产品', value: String(abnormalCounts.stoppedProducts) },
          { label: '套餐', value: String(abnormalCounts.inactiveTiers) },
        ],
      },
    ] satisfies ProductMetric[];
  }, [productPeriod, productPeriodLabel, releases, solutions]);

  const productRankings = useMemo(() => {
    const productNameByCode = new Map(releases.map((release) => [release.productCode, release.productName]));
    const plansByCode = new Map(plans.map((plan) => [plan.planCode, plan]));
    const productRows = productOperations.map((item) => {
      const operation = periodProductOperation(item, productPeriod);

      return {
        id: operation.productCode,
        name: productNameByCode.get(operation.productCode) ?? operation.productCode,
        meta: '产品能力',
        subscriptions: operation.subscriptions,
        monthlyNew: operation.monthlyNew,
      };
    });
    const solutionRows = solutions.map((solution) => ({
      id: solution.solutionCode,
      name: solution.solutionName,
      meta: solution.industry || '方案组合',
      subscriptions: scalePeriodValue(solution.subscriptionCount, productPeriod),
      monthlyNew: scalePeriodValue(Math.max(1, Math.round(solution.subscriptionCount * 0.18)), productPeriod),
    }));
    const tierRows = solutions.flatMap((solution) => {
      const activeTiers = solution.tiers.filter((tier) => tier.status === 'active');
      const scopedTiers = activeTiers.length ? activeTiers : solution.tiers;
      const tierCount = Math.max(1, scopedTiers.length);

      return scopedTiers.map((tier, index) => {
        const weight = tier.tierCode === 'enterprise' || tier.tierCode === 'custom'
          ? 1.25
          : tier.tierCode === 'pro'
            ? 1.05
            : 0.82;

        return {
          id: `${solution.solutionCode}:${tier.tierCode}`,
          name: `${solution.solutionName} / ${tier.tierName}`,
          meta: '套餐层级',
          subscriptions: scalePeriodValue(Math.max(1, Math.round((solution.subscriptionCount / tierCount) * weight)), productPeriod),
          monthlyNew: scalePeriodValue(Math.max(1, Math.round((solution.subscriptionCount / tierCount) * 0.12 + index)), productPeriod),
          priceTag: productTierPriceLabel(tier, plansByCode.get(tierPlanCodeMap[tier.tierCode]) ?? null, locale),
        };
      });
    });

    return {
      productTop: [...productRows].sort((left, right) => right.subscriptions - left.subscriptions).slice(0, 3),
      solutionTop: [...solutionRows].sort((left, right) => right.subscriptions - left.subscriptions).slice(0, 3),
      tierTop: [...tierRows].sort((left, right) => right.subscriptions - left.subscriptions).slice(0, 3),
    };
  }, [locale, plans, productPeriod, releases, solutions]);

  const capabilityMetrics = useMemo(() => {
    const serviceHealth = capabilityServiceHealth(services);
    const totalModelCounts = modelOwnershipCounts(models);
    const activeModelCounts = modelOwnershipCounts(models.filter((model) => model.isActive));
    const abnormalModelCounts = modelOwnershipCounts(models.filter(isModelAbnormal));
    const totalTokenCalls = models.reduce((total, model) => total + modelTokenCalls(model, modelPeriod), 0);
    const policyCoverage = capabilityPolicyCoverage(modelPolicies, modelGrants);
    const activeAgents = agents.filter((agent) => agent.status === 'active').length;
    const publicAgents = agents.filter((agent) => agent.visibility === 'public').length;
    const inactiveAgents = agents.length - activeAgents;

    return [
      {
        label: '服务监控',
        value: String(serviceHealth.total),
        detail: `服务监控显示当前纳入观测的服务 ${serviceHealth.total} 个，其中健康 ${serviceHealth.healthy} 个，异常 ${serviceHealth.abnormal} 个。`,
        tone: serviceHealth.abnormal > 0 ? 'amber' : 'blue',
        icon: 'server',
        tags: [{ label: '异常', value: String(serviceHealth.abnormal), tone: riskTagTone(serviceHealth.abnormal) }],
      },
      {
        label: '模型网关',
        value: String(totalModelCounts.total),
        detail: `${modelPeriodLabel}模型网关观察平台可调度模型资源池，模型总数 ${totalModelCounts.total} 个，生效模型 ${activeModelCounts.total} 个，接入异常 ${abnormalModelCounts.total} 个，Token 总量 ${formatTokenCount(totalTokenCalls)}。`,
        tone: 'blue',
        icon: 'cloud',
        tags: [
          { label: '异常', value: String(abnormalModelCounts.total), tone: riskTagTone(abnormalModelCounts.total) },
          { label: 'Token', value: formatTokenCount(totalTokenCalls) },
        ],
      },
      {
        label: '策略覆盖',
        value: String(policyCoverage.active),
        detail: `策略覆盖统计模型授权和租户授权的启用情况，当前有效策略 ${policyCoverage.active} 条，待配置或停用 ${policyCoverage.pending} 条。`,
        tone: policyCoverage.pending > 0 ? 'amber' : 'blue',
        icon: 'shield-check',
        tags: [{ label: '待配', value: String(policyCoverage.pending), tone: riskTagTone(policyCoverage.pending) }],
      },
      {
        label: '技能市场',
        value: String(activeAgents),
        detail: `技能市场当前以智能体可调用能力作为过渡口径，启用 ${activeAgents} 个，公开 ${publicAgents} 个，异常或停用 ${inactiveAgents} 个。`,
        tone: inactiveAgents > 0 ? 'amber' : 'blue',
        icon: 'cube',
        tags: [{ label: '异常', value: String(inactiveAgents), tone: riskTagTone(inactiveAgents) }],
      },
    ] satisfies ModelMetric[];
  }, [agents, modelGrants, modelPeriod, modelPeriodLabel, modelPolicies, models, services]);

  const capabilityPanels = useMemo(() => {
    const serviceRows = (services.length ? services : []).map((service) => ({
      id: service.id,
      name: service.name,
      meta: serviceStatus(service),
      value: `${serviceMaxDuration(service)}ms`,
    }));
    const fallbackServiceRows = [
      { id: 'gateway', name: 'API Gateway', meta: '健康', value: '42ms' },
      { id: 'ai-gateway', name: 'AI Gateway', meta: '健康', value: '68ms' },
      { id: 'admin-bff', name: 'Admin BFF', meta: '未就绪', value: '132ms' },
    ];
    const modelRows = models
      .map((model) => ({
        id: model.id,
        name: model.modelName,
        meta: `${model.provider} · ${model.isActive ? '启用' : '停用'}`,
        value: formatTokenCount(modelTokenCalls(model, modelPeriod)),
        tokenCalls: modelTokenCalls(model, modelPeriod),
      }))
      .sort((left, right) => right.tokenCalls - left.tokenCalls)
      .slice(0, 3);
    const policyRows = modelPolicies
      .map((policy) => ({
        id: policy.id,
        name: policy.scopeName,
        meta: policy.agentName ?? '全部智能体',
        value: policy.isActive && policy.isDefined ? '生效' : '待配置',
      }))
      .slice(0, 3);
    const agentRows = agents
      .map((agent) => ({
        id: agent.id,
        name: agent.agentName,
        meta: agent.agentType === 'chat' ? '内容' : '业务',
        value: agent.visibility === 'public' ? '公开' : agent.visibility === 'internal' ? '内部' : '私有',
      }))
      .slice(0, 3);

    return [
      {
        title: '服务监控',
        summary: '运行、探针和响应时间。',
        detail: '查看服务运行、探针响应和异常状态。',
        tone: 'blue',
        href: '/service-monitor',
        rankStyle: 'number',
        rows: (serviceRows.length ? serviceRows : fallbackServiceRows).sort((left, right) => Number.parseInt(right.value.replace(/\D/g, ''), 10) - Number.parseInt(left.value.replace(/\D/g, ''), 10)).slice(0, 3),
      },
      {
        title: '模型网关',
        summary: 'Token 调用量前三。',
        detail: '按 Token 调用量观察模型网关后的真实使用强度。',
        tone: 'blue',
        href: '/model-gateway',
        rankStyle: 'medal',
        rows: modelRows,
      },
      {
        title: '模型授权',
        summary: '策略、授权和配额。',
        detail: '按产品、租户和智能体观察模型授权与配额配置。',
        tone: 'blue',
        href: '/model-grants',
        rankStyle: 'medal',
        rows: policyRows,
      },
      {
        title: '技能市场',
        summary: '可调用能力接入状态。',
        detail: '当前以智能体可调用能力作为技能市场过渡口径。',
        tone: 'blue',
        href: '/skills',
        rankStyle: 'medal',
        rows: fillCapabilityRows(agentRows, 'agent'),
      },
    ] satisfies Array<{ title: string; summary: string; detail: string; tone: Tone; href: string; rankStyle: 'number' | 'medal'; rows: CapabilityServiceRow[] }>;
  }, [agents, modelPeriod, modelPolicies, models, services]);

  const serviceMetrics = useMemo(() => serviceMetricsFor(servicePeriod), [servicePeriod]);
  const ratingMetrics = useMemo(() => ratingMetricsFor(servicePeriod), [servicePeriod]);

  return (
    <div className="vx-page-stack admin-overview">
      <header className="admin-overview-header">
        <OverviewHeading
          icon="squares-four"
          title="平台总览"
          description={`${globalPeriodLabel}聚合客户活跃、订阅收入、模型调用和平台稳定性，首页只保留运营判断需要的核心数字。`}
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
        <OverviewHeading icon="chart-bar" title="经营指标" description={`${overviewSnapshots[businessPeriod].label}观察客户增长、订阅转化和收入验证，优先看运营动作是否带来真实使用与商业信号。`} period={businessPeriod} onPeriodChange={setBusinessPeriod} />
        <div className="admin-overview-business-panels">
          {businessPanels.map((panel) => (
            <BusinessPanel key={panel.id} panel={panel} locale={locale} />
          ))}
        </div>
      </section>

      <section className="admin-overview-section" aria-label="产品供给">
        <OverviewHeading icon="database" title="产品供给" description={`${productPeriodLabel}按产品能力、方案组合、套餐层级和供给异常观察平台可售卖、可交付能力。`} period={productPeriod} onPeriodChange={setProductPeriod} />
        <div className="admin-overview-product-metrics">
          {productMetrics.map((metric) => (
            <ProductMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
        <div className="admin-overview-product-rankings">
          <ProductRankingCard title="产品能力排行" summary="默认前三，观察底层产品被订阅采用的强度。" href="/products" rows={productRankings.productTop} />
          <ProductRankingCard title="方案组合排行" summary="默认前三，观察场景方案的市场采用度。" href="/product-solutions" rows={productRankings.solutionTop} />
          <ProductRankingCard title="套餐层级排行" summary="默认前三，观察可售权益包的订阅使用。" href="/service-plans" rows={productRankings.tierTop} />
        </div>
      </section>

      <section className="admin-overview-section" aria-label="能力与服务">
        <OverviewHeading icon="cloud" title="模型技能" description={`${modelPeriodLabel}观察服务运行、模型调用、策略覆盖和技能市场，判断平台 AI 能力是否稳定、可控、可被业务调用。`} period={modelPeriod} onPeriodChange={setModelPeriod} />
        <div className="admin-overview-model-metrics">
          {capabilityMetrics.map((metric) => (
            <ModelMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
        <div className="admin-overview-model-categories">
          {capabilityPanels.map((panel) => (
            <ModelCategoryCard key={panel.title} title={panel.title} summary={panel.summary} detail={panel.detail} tone={panel.tone} href={panel.href} rankStyle={panel.rankStyle} rows={panel.rows} />
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
