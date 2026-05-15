import {
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Pool } from 'pg';
import { ADMIN_BFF_RO_POOL } from '../tokens';
import type {
  ProductAgentRecord,
  ProductCapabilityHealthStatus,
  ProductCapabilityIntegration,
  ProductCapabilityMetricRule,
  ProductCapabilityRecord,
  ProductCapabilityRegion,
  ProductCapabilitySource,
  ProductCapabilityStatus,
  ProductCapabilityType,
  ProductCapabilityVisibility,
  ProductModelPolicyRecord,
  ProductPlanAgent,
  ProductPlanFeature,
  ProductPlanPrice,
  ProductPlanRecord,
  ProductServicePlanDetailRecord,
  ProductServicePlanEntitlement,
  ProductServicePlanPrice,
  ProductSolutionDetailRecord,
  ProductReleaseRecord,
  ProductSolutionRecord,
  ProductSolutionServicePlanSummary,
  ProductSolutionTier,
  ProductSolutionTierCode,
  RequestContext,
} from '../types/console.types';

const NOW = '2026-04-25T00:00:00.000Z';
export const CONSOLE_ASSISTANT_ID = '2b3158c4-fd0a-4ffc-a5c6-910000000005';
export const RUYIN_AGENT_ID = '2b3158c4-fd0a-4ffc-a5c6-910000000006';
const NEW_PRODUCT_DEFAULT_CODE = '__new_product_default__';
const TENANT_DEFAULT_CODE = '__tenant_default__';
const tierPlanCodeMap: Record<ProductSolutionTierCode, string> = {
  free: 'starter',
  pro: 'growth',
  enterprise: 'enterprise',
  custom: 'enterprise',
};

interface CapabilityProfile {
  description: string;
  ownerTeam: string;
  capabilitySummary: string;
  accessModes: string[];
  tags: string[];
  meteringUnit: string;
  billingMode: string;
  healthStatus: ProductCapabilityHealthStatus;
  integration: ProductCapabilityIntegration;
  metrics: ProductCapabilityMetricRule[];
}

interface CapabilitySeed {
  id: string;
  productCode: string;
  productName: string;
  productType: ProductCapabilityType;
  source: ProductCapabilitySource;
  status: ProductCapabilityStatus;
  visibility: ProductCapabilityVisibility;
  region: ProductCapabilityRegion;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  relatedSolutions: ProductCapabilityRecord['relatedSolutions'];
  releases: ProductCapabilityRecord['releases'];
}

type CapabilityProfileOverride = Partial<Omit<CapabilityProfile, 'integration'>> & {
  integration?: Partial<ProductCapabilityIntegration>;
};

const capabilityProfiles: Record<string, CapabilityProfileOverride> = {
  'drone-platform': {
    description: '接入无人机设备、飞行任务和巡检成果，支撑低空巡检业务的设备调度与数据回传。',
    ownerTeam: '低空生态接入组',
    capabilitySummary: '支持无人机设备接入、任务调度、轨迹回传和巡检成果管理，是洪涝灾害监管方案的低空采集入口。',
    accessModes: ['Console', '设备 API', '任务回调'],
    tags: ['低空', '设备接入', '三方平台'],
    meteringUnit: '无人机台数',
    billingMode: '按设备规模分档',
    integration: {
      providerName: '合作方无人机平台',
      endpoint: 'https://api.partner.vxture.local/drone-platform',
      protocol: 'REST / MQTT',
      authMode: 'OAuth2 + 设备签名',
      settlementMode: '按设备规模结算',
    },
    metrics: [
      { metricCode: 'drone-platform.devices', metricName: '无人机设备数', unit: '台', cycle: 'monthly', quotaBase: '服务套餐', billingMode: '超额扩容' },
      { metricCode: 'drone-platform.missions', metricName: '巡检任务数', unit: '次', cycle: 'monthly', quotaBase: '租户订阅', billingMode: '套餐包含' },
    ],
  },
  'flood-video-interpretation': {
    description: '面向洪涝灾害视频场景，识别水位、淹没区、险情目标和异常事件。',
    ownerTeam: '模型平台组',
    capabilitySummary: '以视频解译模型为核心，支持多路视频分析、险情识别和结构化事件输出。',
    accessModes: ['视频流 API', '模型策略', '事件回调'],
    tags: ['视频解译', '大模型', '洪涝灾害'],
    meteringUnit: '视频解译路数',
    billingMode: '按路数和调用量计费',
    integration: {
      providerName: '合作方视觉模型服务',
      endpoint: 'https://api.partner.vxture.local/flood-video-interpretation',
      protocol: 'REST / RTSP',
      authMode: 'API Key + IP 白名单',
      settlementMode: '按路数结算',
    },
  },
  'report-author-agent': {
    description: '生成巡检报告、处置简报、法务报告和合规材料，按生成字数进行套餐配额控制。',
    ownerTeam: '智能体产品组',
    capabilitySummary: '提供结构化报告编制能力，可被不同业务方案复用，并按字数或报告份数计量。',
    tags: ['报告编制', '智能体', '通用能力'],
    meteringUnit: '生成字数',
    billingMode: '套餐字数 + 超额按量',
  },
  'legal-knowledge-base': {
    description: '管理法规、合同、案例和企业制度知识，支撑法务智能体的检索增强和权限隔离。',
    ownerTeam: '数据平台组',
    capabilitySummary: '提供企业级知识库存储、索引、权限和版本管理能力。',
    tags: ['知识库', '法规', '存储空间'],
    meteringUnit: '存储空间',
    billingMode: '按空间分档',
  },
  'legal-retrieval-model': {
    description: '提供法规语义检索、相似案例匹配和条款定位能力。',
    ownerTeam: '生态接入组',
    capabilitySummary: '连接合作方检索模型，为智慧法务方案提供高召回法律检索能力。',
    tags: ['语义检索', '法规库', '三方模型'],
    meteringUnit: '检索调用次数',
    billingMode: '按调用量结算',
    integration: {
      providerName: '合作方法律检索模型',
      endpoint: 'https://api.partner.vxture.local/legal-retrieval-model',
      protocol: 'REST / HTTPS',
      authMode: 'API Key',
      settlementMode: '按调用量结算',
    },
  },
  'vxture-console-cn': {
    ownerTeam: '平台产品组',
    capabilitySummary: '面向国内租户的运营控制台能力，承载账号、订阅、用量和基础运营工作流。',
    tags: ['Console', '平台能力'],
    meteringUnit: '席位',
  },
  ruyin: {
    ownerTeam: '智能体产品组',
    capabilitySummary: '通用对话智能体能力，当前用于产品与模型授权链路验证。',
    tags: ['对话', '智能体'],
    meteringUnit: '会话次数',
  },
};

export const productAgents: ProductAgentRecord[] = [
  {
    id: CONSOLE_ASSISTANT_ID,
    agentCode: 'console-assistant',
    agentName: 'Console 平台智能助手',
    description: '面向 console 平台的对话型智能助手，先用于模型策略和计量链路验证。',
    agentType: 'chat',
    status: 'active',
    visibility: 'internal',
    defaultModelCode: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: RUYIN_AGENT_ID,
    agentCode: 'ruyin',
    agentName: 'Ruyin',
    description: '通用对话智能体，验证阶段先以对话智能体接入。',
    agentType: 'chat',
    status: 'active',
    visibility: 'public',
    defaultModelCode: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const productSolutions: ProductSolutionRecord[] = [
  {
    id: 'solution-flood-regulation',
    solutionCode: 'flood-regulation',
    solutionName: '洪涝灾害监管业务',
    description: '面向水利、应急和城市治理客户的洪涝灾害监管方案，覆盖低空巡检、视频解译、调度协同、数据沉淀和报告编制。',
    industry: '应急管理 / 水利监管',
    scenario: '洪涝灾害监管',
    customerSegment: '省市应急、水利部门、园区管委会',
    status: 'active',
    visibility: 'public',
    ownerTeam: '行业解决方案组',
    subscriptionCount: 12,
    activeTenantCount: 10,
    monthlyRevenue: 128000,
    tags: ['低空巡检', '视频解译', '应急调度'],
    products: [
      { id: 'flood-drone-platform', productCode: 'drone-platform', productName: '无人机平台', productType: 'platform', source: 'partner', role: '飞行任务与设备接入', status: 'active' },
      { id: 'flood-dispatch-agent', productCode: 'dispatch-agent', productName: '智能调度智能体', productType: 'agent', source: 'self', role: '灾情研判与任务调度', status: 'active' },
      { id: 'flood-video-model', productCode: 'flood-video-interpretation', productName: '视频解译大模型', productType: 'model', source: 'partner', role: '水位、淹没区和险情识别', status: 'active' },
      { id: 'flood-data-platform', productCode: 'disaster-data-platform', productName: '数据管理平台', productType: 'data', source: 'self', role: '遥感、视频和事件数据沉淀', status: 'active' },
      { id: 'flood-report-agent', productCode: 'report-author-agent', productName: '报告编制智能体', productType: 'agent', source: 'self', role: '巡检报告与处置简报生成', status: 'active' },
    ],
    tiers: [
      { tierCode: 'free', tierName: 'Free', summary: '1 台无人机，1 路视频解译，不含报告编制', status: 'active', isPublic: true },
      { tierCode: 'pro', tierName: 'Pro', summary: '50 台无人机，50 路视频解译，报告编制 100 万字/年', status: 'active', isPublic: true },
      { tierCode: 'enterprise', tierName: 'Enterprise', summary: '专属资源、合同约定配额和现场交付服务', status: 'active', isPublic: true },
    ],
    createdAt: NOW,
    updatedAt: '2026-04-28T00:00:00.000Z',
  },
  {
    id: 'solution-smart-legal',
    solutionCode: 'smart-legal',
    solutionName: '智慧法务',
    description: '面向企业法务、园区合规和政务法制场景，组合知识库、法务智能体、合同审查和报告编制能力。',
    industry: '企业服务 / 法务合规',
    scenario: '智慧法务',
    customerSegment: '集团法务、园区企业服务、政务法制部门',
    status: 'active',
    visibility: 'public',
    ownerTeam: '企业服务方案组',
    subscriptionCount: 18,
    activeTenantCount: 15,
    monthlyRevenue: 86000,
    tags: ['知识库', '合同审查', '报告编制'],
    products: [
      { id: 'legal-kb-platform', productCode: 'legal-knowledge-base', productName: '知识库平台', productType: 'platform', source: 'self', role: '法规、合同和案例知识沉淀', status: 'active' },
      { id: 'legal-agent', productCode: 'digital-legal', productName: '法务智能体', productType: 'agent', source: 'self', role: '法律问答、合规检索和材料生成', status: 'active' },
      { id: 'legal-contract-agent', productCode: 'contract-review', productName: '合同审核智能体', productType: 'agent', source: 'self', role: '合同条款抽取与风险提示', status: 'active' },
      { id: 'legal-report-agent', productCode: 'report-author-agent', productName: '报告编制智能体', productType: 'agent', source: 'self', role: '法务报告、合规报告生成', status: 'active' },
      { id: 'legal-search-model', productCode: 'legal-retrieval-model', productName: '法规检索模型', productType: 'model', source: 'partner', role: '法规语义检索与相似案例匹配', status: 'active' },
    ],
    tiers: [
      { tierCode: 'free', tierName: 'Free', summary: '100 万字报告编制，基础知识库存储空间', status: 'active', isPublic: true },
      { tierCode: 'pro', tierName: 'Pro', summary: '1000 万字报告编制，高级合同审查和扩展存储空间', status: 'active', isPublic: true },
      { tierCode: 'enterprise', tierName: 'Enterprise', summary: '专属知识库、私有模型接入和法务交付服务', status: 'active', isPublic: true },
    ],
    createdAt: NOW,
    updatedAt: '2026-04-27T00:00:00.000Z',
  },
  {
    id: 'solution-emergency-command',
    solutionCode: 'emergency-command',
    solutionName: '应急指挥协同',
    description: '面向城市级应急指挥中心的跨部门协同方案，覆盖态势研判、资源调度、预案匹配和处置复盘。',
    industry: '应急管理 / 城市治理',
    scenario: '应急指挥协同',
    customerSegment: '城市应急指挥中心、区县应急局',
    status: 'draft',
    visibility: 'internal',
    ownerTeam: '城市治理方案组',
    subscriptionCount: 3,
    activeTenantCount: 1,
    monthlyRevenue: 32000,
    tags: ['态势研判', '预案匹配', '协同调度'],
    products: [
      { id: 'emergency-command-agent', productCode: 'emergency-command', productName: '应急指挥智能体', productType: 'agent', source: 'self', role: '预案匹配、态势研判和指挥建议', status: 'active' },
      { id: 'emergency-ops-agent', productCode: 'operation-analysis', productName: '经营分析智能体', productType: 'agent', source: 'self', role: '事件复盘和指标归因', status: 'active' },
      { id: 'emergency-data-platform', productCode: 'event-data-platform', productName: '事件数据平台', productType: 'data', source: 'self', role: '事件、资源和处置过程数据沉淀', status: 'draft' },
      { id: 'emergency-map-service', productCode: 'gis-service', productName: '空间态势服务', productType: 'service', source: 'partner', role: '地图态势和空间分析能力', status: 'draft' },
    ],
    tiers: [
      { tierCode: 'free', tierName: 'Free', summary: '单部门试用，基础预案匹配和少量事件复盘', status: 'draft', isPublic: false },
      { tierCode: 'pro', tierName: 'Pro', summary: '多部门协同、资源调度和月度处置复盘', status: 'draft', isPublic: false },
      { tierCode: 'enterprise', tierName: 'Enterprise', summary: '城市级专属部署、联动接口和现场保障服务', status: 'draft', isPublic: false },
    ],
    createdAt: NOW,
    updatedAt: '2026-04-26T00:00:00.000Z',
  },
];

export const productReleases: ProductReleaseRecord[] = [
  {
    id: '0bb203b6-7dfb-42d8-a6ad-920000000101',
    productCode: 'vxture-console-cn',
    productName: 'Vxture Console 国内版',
    productRegion: 'domestic',
    productStatus: 'active',
    releaseCode: 'console-cn-2026-q2',
    releaseName: '2026 Q2 商业发布',
    description: '面向国内租户的 console 平台智能助手与运营能力发布，版本等级由本发布定义。',
    releaseType: 'standard',
    versionLabels: ['基础版', '专业版', '企业版'],
    isFree: false,
    isPublic: true,
    isActive: true,
    prices: [
      { id: 'c211fef4-88ef-45cc-bfe4-940000000101', currency: 'CNY', price: 2999, originalPrice: 3999, periodType: 'monthly', periodValue: 1, isDefault: true, isActive: true },
      { id: 'c211fef4-88ef-45cc-bfe4-940000000102', currency: 'CNY', price: 29900, originalPrice: 39990, periodType: 'yearly', periodValue: 1, isDefault: false, isActive: true },
    ],
    features: [
      { code: 'release.versions', name: '发布版本', type: 'function', quotaValue: 3, isUnlimited: false, config: { labels: ['基础版', '专业版', '企业版'] } },
      { code: 'ai.business_agents', name: '智能体应用', type: 'function', quotaValue: 1, isUnlimited: false, config: { includedAgents: ['console-assistant'] } },
      { code: 'ai.token_metering', name: '租户模型用量监测', type: 'function', quotaValue: 1, isUnlimited: false, config: { period: 'monthly' } },
    ],
    allowedAgents: ['Console 平台智能助手'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: '0bb203b6-7dfb-42d8-a6ad-920000000102',
    productCode: 'ruyin-cn',
    productName: 'Ruyin 国内版',
    productRegion: 'domestic',
    productStatus: 'active',
    releaseCode: 'ruyin-cn-2026-q2',
    releaseName: '2026 Q2 对话验证发布',
    description: 'Ruyin 国内版验证发布，先以对话智能体接入产品与模型授权链路。',
    releaseType: 'standard',
    versionLabels: ['基础版', '高级版', '定制版'],
    isFree: false,
    isPublic: true,
    isActive: true,
    prices: [
      { id: 'c211fef4-88ef-45cc-bfe4-940000000201', currency: 'CNY', price: 1999, originalPrice: 2999, periodType: 'monthly', periodValue: 1, isDefault: true, isActive: true },
      { id: 'c211fef4-88ef-45cc-bfe4-940000000202', currency: 'CNY', price: 19900, originalPrice: 29990, periodType: 'yearly', periodValue: 1, isDefault: false, isActive: true },
    ],
    features: [
      { code: 'release.versions', name: '发布版本', type: 'function', quotaValue: 3, isUnlimited: false, config: { labels: ['基础版', '高级版', '定制版'] } },
      { code: 'ai.business_agents', name: '智能体应用', type: 'function', quotaValue: 1, isUnlimited: false, config: { includedAgents: ['ruyin'] } },
      { code: 'ai.token_metering', name: '租户模型用量监测', type: 'function', quotaValue: 1, isUnlimited: false, config: { period: 'monthly' } },
    ],
    allowedAgents: ['Ruyin'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: '0bb203b6-7dfb-42d8-a6ad-920000000103',
    productCode: 'ruyin-intl',
    productName: 'Ruyin 国际版',
    productRegion: 'international',
    productStatus: 'draft',
    releaseCode: 'ruyin-intl-2026-q2-preview',
    releaseName: '2026 Q2 Preview',
    description: 'Ruyin 国际版预览发布；产品存在但模型策略尚未定义，默认不授权。',
    releaseType: 'standard',
    versionLabels: ['Standard', 'Pro'],
    isFree: false,
    isPublic: false,
    isActive: false,
    prices: [
      { id: 'c211fef4-88ef-45cc-bfe4-940000000301', currency: 'USD', price: 399, originalPrice: 499, periodType: 'monthly', periodValue: 1, isDefault: true, isActive: false },
    ],
    features: [
      { code: 'release.versions', name: '发布版本', type: 'function', quotaValue: 2, isUnlimited: false, config: { labels: ['Standard', 'Pro'] } },
      { code: 'ai.business_agents', name: '智能体应用', type: 'function', quotaValue: 1, isUnlimited: false, config: { includedAgents: ['ruyin'] } },
    ],
    allowedAgents: ['Ruyin'],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const explicitModelPolicies: ProductModelPolicyRecord[] = [];

export const defaultModelPolicies: ProductModelPolicyRecord[] = [
  {
    id: 'policy-default-new-product',
    subjectType: 'tenant',
    subjectId: '*',
    subjectName: '租户主体',
    scopeType: 'new_product_default',
    scopeCode: NEW_PRODUCT_DEFAULT_CODE,
    scopeName: '新产品授权策略',
    isDefined: false,
    productCode: NEW_PRODUCT_DEFAULT_CODE,
    productName: '新产品默认',
    productRegion: null,
    agentId: null,
    agentCode: null,
    agentName: '全部智能体',
    modelCode: null,
    quotaTokens: 0,
    isUnlimited: false,
    priority: 999,
    isActive: false,
    cycle: 'monthly',
    note: '未定义时默认不授权，新产品上线前需要补充产品级策略。',
  },
  {
    id: 'policy-default-tenant',
    subjectType: 'tenant',
    subjectId: '*',
    subjectName: '租户主体',
    scopeType: 'tenant_default',
    scopeCode: TENANT_DEFAULT_CODE,
    scopeName: '按租户授权策略',
    isDefined: false,
    productCode: TENANT_DEFAULT_CODE,
    productName: '租户默认',
    productRegion: null,
    agentId: null,
    agentCode: null,
    agentName: '全部智能体',
    modelCode: null,
    quotaTokens: 0,
    isUnlimited: false,
    priority: 1000,
    isActive: false,
    cycle: 'monthly',
    note: '未定义租户覆盖时回落到产品策略；产品策略也未定义时默认不授权。',
  },
];

@Controller('api/products')
export class ProductsRouter {
  constructor(@Inject(ADMIN_BFF_RO_POOL) private readonly pool: Pool) {}

  @Get('capabilities')
  listCapabilities(@Req() req: Request & RequestContext): ProductCapabilityRecord[] {
    assertCanManageProducts(req);
    return listProductCapabilities();
  }

  @Get('capabilities/:productCode')
  getCapability(
    @Req() req: Request & RequestContext,
    @Param('productCode') productCode: string,
  ): ProductCapabilityRecord {
    assertCanManageProducts(req);
    const normalizedCode = decodeURIComponent(productCode);
    const capability = listProductCapabilities().find((item) => item.productCode === normalizedCode);

    if (!capability) {
      throw new NotFoundException(`Product capability ${normalizedCode} not found`);
    }

    return capability;
  }

  @Get('releases')
  listReleases(@Req() req: Request & RequestContext): ProductReleaseRecord[] {
    assertCanManageProducts(req);
    return listProductReleases();
  }

  @Get('plans')
  async listPlans(@Req() req: Request & RequestContext): Promise<ProductPlanRecord[]> {
    assertCanManageProducts(req);

    const [planRows, priceRows, featureRows, agentRows] = await Promise.all([
      this.pool.query<ProductPlanRow>(PRODUCT_PLAN_SQL),
      this.pool.query<ProductPlanPriceRow>(PRODUCT_PLAN_PRICE_SQL),
      this.pool.query<ProductPlanFeatureRow>(PRODUCT_PLAN_FEATURE_SQL),
      this.pool.query<ProductPlanAgentRow>(PRODUCT_PLAN_AGENT_SQL),
    ]);
    const pricesByPlan = groupBy(priceRows.rows, (row) => row.plan_id);
    const featuresByPlan = groupBy(featureRows.rows, (row) => row.plan_id);
    const agentsByPlan = groupBy(agentRows.rows, (row) => row.plan_id);

    return planRows.rows.map((plan) => ({
      id: plan.id,
      planCode: plan.plan_code,
      planName: plan.plan_name,
      description: plan.description,
      planType: plan.plan_type,
      level: Number(plan.level),
      isFree: plan.is_free,
      isPublic: plan.is_public,
      isActive: plan.status,
      subscriptionCount: Number(plan.subscription_count),
      prices: (pricesByPlan.get(plan.id) ?? []).map(mapPlanPrice),
      features: (featuresByPlan.get(plan.id) ?? []).map(mapPlanFeature),
      agents: (agentsByPlan.get(plan.id) ?? []).map(mapPlanAgent),
      createdAt: toIso(plan.created_at),
      updatedAt: toIso(plan.updated_at),
    }));
  }

  @Get('solutions')
  listSolutions(@Req() req: Request & RequestContext): ProductSolutionRecord[] {
    assertCanManageProducts(req);
    return listProductSolutions();
  }

  @Get('solutions/:solutionCode')
  getSolution(
    @Req() req: Request & RequestContext,
    @Param('solutionCode') solutionCode: string,
  ): ProductSolutionDetailRecord {
    assertCanManageProducts(req);
    return getProductSolutionDetail(decodeURIComponent(solutionCode));
  }

  @Get('service-plans/:solutionCode/:tierCode')
  getServicePlan(
    @Req() req: Request & RequestContext,
    @Param('solutionCode') solutionCode: string,
    @Param('tierCode') tierCode: ProductSolutionTierCode,
  ): ProductServicePlanDetailRecord {
    assertCanManageProducts(req);
    return getProductServicePlanDetail(decodeURIComponent(solutionCode), decodeURIComponent(tierCode) as ProductSolutionTierCode);
  }

  @Get('agents')
  listAgents(@Req() req: Request & RequestContext): ProductAgentRecord[] {
    assertCanManageProducts(req);
    return listProductAgents();
  }

  @Get('model-policies')
  listModelPolicies(@Req() req: Request & RequestContext): ProductModelPolicyRecord[] {
    assertCanManageProducts(req);
    return listEffectiveModelPolicies();
  }
}

export function listProductAgents(): ProductAgentRecord[] {
  return productAgents;
}

export function listProductReleases(): ProductReleaseRecord[] {
  return productReleases;
}

export function listProductSolutions(): ProductSolutionRecord[] {
  return productSolutions;
}

export function getProductSolutionDetail(solutionCode: string): ProductSolutionDetailRecord {
  const solution = productSolutions.find((item) => item.solutionCode === solutionCode);
  if (!solution) {
    throw new NotFoundException(`Product solution ${solutionCode} not found`);
  }

  return {
    ...solution,
    deliveryMode: deliveryModeForSolution(solution),
    deliveryBoundaries: deliveryBoundariesForSolution(solution),
    relatedServicePlans: solution.tiers.map(mapSolutionServicePlanSummary),
  };
}

export function getProductServicePlanDetail(
  solutionCode: string,
  tierCode: ProductSolutionTierCode,
): ProductServicePlanDetailRecord {
  const solution = productSolutions.find((item) => item.solutionCode === solutionCode);
  if (!solution) {
    throw new NotFoundException(`Product solution ${solutionCode} not found`);
  }

  const tier = solution.tiers.find((item) => item.tierCode === tierCode);
  if (!tier) {
    throw new NotFoundException(`Service plan ${solutionCode}/${tierCode} not found`);
  }

  const price = priceForTier(tier);
  const entitlements = solution.products.map((product) => entitlementFor(solution.solutionCode, tier.tierCode, product));

  return {
    id: `${solution.id}:${tier.tierCode}`,
    solutionCode: solution.solutionCode,
    solutionName: solution.solutionName,
    industry: solution.industry,
    scenario: solution.scenario,
    customerSegment: solution.customerSegment,
    ownerTeam: solution.ownerTeam,
    tierCode: tier.tierCode,
    tierName: tier.tierName,
    summary: tier.summary,
    status: tier.status,
    isPublic: tier.isPublic,
    price,
    subscriptionCount: Math.max(0, Math.round(solution.subscriptionCount * subscriptionRatioForTier(tier.tierCode))),
    activeTenantCount: Math.max(0, Math.round(solution.activeTenantCount * subscriptionRatioForTier(tier.tierCode))),
    deliveryMode: deliveryModeForSolution(solution),
    applicableScope: applicableScopeForTier(solution, tier),
    salesNotes: salesNotesForTier(tier),
    entitlements,
    includedProductCount: entitlements.filter((item) => item.included).length,
    excludedProductCount: entitlements.filter((item) => !item.included).length,
    createdAt: solution.createdAt,
    updatedAt: solution.updatedAt,
  };
}

export function listProductCapabilities(): ProductCapabilityRecord[] {
  const seeds = new Map<string, CapabilitySeed>();

  for (const solution of productSolutions) {
    for (const product of solution.products) {
      const existing = seeds.get(product.productCode);
      const seed = existing ?? {
        id: product.id,
        productCode: product.productCode,
        productName: product.productName,
        productType: product.productType,
        source: product.source,
        status: product.status,
        visibility: solution.visibility,
        region: 'domestic' as ProductCapabilityRegion,
        description: product.role,
        tags: [...solution.tags],
        createdAt: solution.createdAt,
        updatedAt: solution.updatedAt,
        relatedSolutions: [],
        releases: [],
      };

      seed.status = mergeCapabilityStatus(seed.status, product.status);
      seed.updatedAt = latestIso(seed.updatedAt, solution.updatedAt);
      seed.tags = Array.from(new Set([...seed.tags, ...solution.tags]));
      seed.relatedSolutions.push({
        solutionCode: solution.solutionCode,
        solutionName: solution.solutionName,
        role: product.role,
        status: solution.status,
        tierNames: solution.tiers.map((tier) => tier.tierName),
      });
      seeds.set(product.productCode, seed);
    }
  }

  for (const agent of productAgents) {
    if (seeds.has(agent.agentCode)) continue;
    seeds.set(agent.agentCode, {
      id: agent.id,
      productCode: agent.agentCode,
      productName: agent.agentName,
      productType: 'agent',
      source: 'self',
      status: agent.status === 'active' ? 'active' : 'draft',
      visibility: agent.visibility === 'public' ? 'public' : 'internal',
      region: 'global',
      description: agent.description,
      tags: [agent.agentType === 'chat' ? '对话智能体' : '业务智能体'],
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      relatedSolutions: [],
      releases: [],
    });
  }

  for (const release of productReleases) {
    const existing = seeds.get(release.productCode);
    const seed = existing ?? {
      id: release.id,
      productCode: release.productCode,
      productName: release.productName,
      productType: inferCapabilityTypeFromRelease(release),
      source: inferCapabilitySourceFromRelease(release),
      status: release.productStatus,
      visibility: release.isPublic ? 'public' as ProductCapabilityVisibility : 'internal' as ProductCapabilityVisibility,
      region: release.productRegion,
      description: release.description,
      tags: [...release.versionLabels],
      createdAt: release.createdAt,
      updatedAt: release.updatedAt,
      relatedSolutions: [],
      releases: [],
    };

    seed.status = mergeCapabilityStatus(seed.status, release.productStatus);
    seed.updatedAt = latestIso(seed.updatedAt, release.updatedAt);
    seed.tags = Array.from(new Set([...seed.tags, ...release.versionLabels]));
    seed.releases.push({
      releaseCode: release.releaseCode,
      releaseName: release.releaseName,
      status: release.productStatus,
      isActive: release.isActive,
      versionLabels: release.versionLabels,
    });
    seeds.set(release.productCode, seed);
  }

  return Array.from(seeds.values())
    .map(mapCapabilitySeed)
    .sort((left, right) => {
      if (left.status !== right.status) return left.status === 'active' ? -1 : right.status === 'active' ? 1 : 0;
      return left.productName.localeCompare(right.productName, 'zh-CN');
    });
}

function mapCapabilitySeed(seed: CapabilitySeed): ProductCapabilityRecord {
  const profile = capabilityProfileFor(seed);
  const tierNames = new Set(seed.relatedSolutions.flatMap((solution) => solution.tierNames));
  const releaseVersionNames = new Set(seed.releases.flatMap((release) => release.versionLabels));
  const modelPolicyCount = listEffectiveModelPolicies().filter((policy) => policy.scopeType === 'product' && policy.productCode === seed.productCode && policy.isDefined).length;

  return {
    id: seed.id,
    productCode: seed.productCode,
    productName: seed.productName,
    description: profile.description,
    productType: seed.productType,
    source: seed.source,
    status: seed.status,
    visibility: seed.visibility,
    region: seed.region,
    ownerTeam: profile.ownerTeam,
    capabilitySummary: profile.capabilitySummary,
    accessModes: profile.accessModes,
    tags: Array.from(new Set([...profile.tags, ...seed.tags])),
    meteringUnit: profile.meteringUnit,
    billingMode: profile.billingMode,
    healthStatus: profile.healthStatus,
    integration: profile.integration,
    metrics: profile.metrics,
    relatedSolutions: seed.relatedSolutions,
    releases: seed.releases,
    solutionCount: seed.relatedSolutions.length,
    planCount: Math.max(tierNames.size, releaseVersionNames.size),
    releaseCount: seed.releases.length,
    modelPolicyCount,
    createdAt: seed.createdAt,
    updatedAt: seed.updatedAt,
  };
}

function mapSolutionServicePlanSummary(tier: ProductSolutionTier): ProductSolutionServicePlanSummary {
  return {
    tierCode: tier.tierCode,
    tierName: tier.tierName,
    summary: tier.summary,
    status: tier.status,
    isPublic: tier.isPublic,
    priceLabel: priceForTier(tier).priceLabel,
  };
}

function deliveryModeForSolution(solution: ProductSolutionRecord): string {
  if (solution.solutionCode === 'flood-regulation') return '平台订阅 + 三方设备/模型接入 + 行业实施服务';
  if (solution.solutionCode === 'smart-legal') return '平台订阅 + 知识库初始化 + 法务场景配置';
  if (solution.solutionCode === 'emergency-command') return '专属项目交付 + 多系统接口联调';
  return '平台订阅 + 行业方案配置';
}

function deliveryBoundariesForSolution(solution: ProductSolutionRecord): string[] {
  if (solution.solutionCode === 'flood-regulation') {
    return [
      '覆盖无人机巡检任务、视频解译、灾情调度、数据管理和报告编制业务闭环。',
      '无人机设备采购、现场飞手服务和第三方网络链路不默认包含，按合同另行约定。',
      '视频解译模型输出作为辅助研判结果，正式处置结论需由客户业务人员确认。',
    ];
  }

  if (solution.solutionCode === 'smart-legal') {
    return [
      '覆盖法规知识库、合同审查、法律问答和报告编制等企业法务辅助场景。',
      '历史文档清洗、专属法规库采购和外部律师服务不默认包含。',
      '智能体输出不作为正式法律意见，需经客户法务或律师审核确认。',
    ];
  }

  return [
    '覆盖方案内产品能力的开通、配置、订阅和用量计量。',
    '外部系统接口、现场部署和专属模型调优按合同另行确认。',
    '方案当前处于草稿或灰度阶段时，不承诺公开售卖 SLA。',
  ];
}

function priceForTier(tier: ProductSolutionTier): ProductServicePlanPrice {
  if (tier.tierCode === 'free') {
    return { priceLabel: '免费', price: 0, originalPrice: 0, currency: 'CNY', periodType: 'monthly', periodValue: 1 };
  }

  const plan = productPlanByCode(tierPlanCodeMap[tier.tierCode]);
  const defaultPrice = plan?.prices.find((price) => price.isDefault && price.isActive) ?? plan?.prices.find((price) => price.isActive) ?? plan?.prices[0];
  if (defaultPrice && tier.tierCode === 'pro') {
    return {
      priceLabel: `${formatCurrency(Number(defaultPrice.price), defaultPrice.currency)} / ${defaultPrice.periodType === 'yearly' ? '年' : '月'}`,
      price: Number(defaultPrice.price),
      originalPrice: Number(defaultPrice.originalPrice),
      currency: defaultPrice.currency,
      periodType: defaultPrice.periodType,
      periodValue: defaultPrice.periodValue,
    };
  }

  return { priceLabel: '合同报价', price: null, originalPrice: null, currency: 'CNY', periodType: 'contract', periodValue: 1 };
}

function productPlanByCode(planCode: string): ProductPlanRecord | null {
  const fallback = planFallbacks[planCode];
  if (!fallback) return null;
  return fallback;
}

const planFallbacks: Record<string, ProductPlanRecord> = {
  starter: {
    id: 'plan-fallback-starter',
    planCode: 'starter',
    planName: '入门版',
    description: '适合个人或小团队试用。',
    planType: 'normal',
    level: 10,
    isFree: true,
    isPublic: true,
    isActive: true,
    subscriptionCount: 0,
    prices: [{ id: 'price-starter', currency: 'CNY', price: 0, originalPrice: 0, periodType: 'monthly', periodValue: 1, isDefault: true, isActive: true }],
    features: [],
    agents: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  growth: {
    id: 'plan-fallback-growth',
    planCode: 'growth',
    planName: '专业版',
    description: '适合组织客户使用。',
    planType: 'normal',
    level: 20,
    isFree: false,
    isPublic: true,
    isActive: true,
    subscriptionCount: 0,
    prices: [{ id: 'price-growth', currency: 'CNY', price: 2999, originalPrice: 3999, periodType: 'monthly', periodValue: 1, isDefault: true, isActive: true }],
    features: [],
    agents: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  enterprise: {
    id: 'plan-fallback-enterprise',
    planCode: 'enterprise',
    planName: '企业版',
    description: '适合专属交付和合同方案。',
    planType: 'normal',
    level: 30,
    isFree: false,
    isPublic: true,
    isActive: true,
    subscriptionCount: 0,
    prices: [{ id: 'price-enterprise', currency: 'CNY', price: 9999, originalPrice: 12999, periodType: 'monthly', periodValue: 1, isDefault: true, isActive: true }],
    features: [],
    agents: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
};

function formatCurrency(value: number, currency: string): string {
  if (currency === 'CNY') return `¥${new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 0 }).format(value)}`;
  return `${currency} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
}

function entitlementFor(
  solutionCode: string,
  tierCode: ProductSolutionTierCode,
  product: ProductSolutionRecord['products'][number],
): ProductServicePlanEntitlement {
  const key = `${solutionCode}:${tierCode}:${product.productCode}`;
  const override = entitlementOverrides[key];
  if (override) {
    return { ...product, ...override };
  }

  if (tierCode === 'enterprise' || tierCode === 'custom') {
    return { ...product, included: true, quotaSummary: '合同约定', note: '按客户规模、接口和交付范围确认。' };
  }

  if (tierCode === 'free') {
    return { ...product, included: true, quotaSummary: '基础试用额度', note: '仅用于试用验证，不承诺生产 SLA。' };
  }

  return { ...product, included: true, quotaSummary: '标准专业版额度', note: '适合正式生产使用，可按套餐规则扩容。' };
}

const entitlementOverrides: Record<string, Pick<ProductServicePlanEntitlement, 'included' | 'quotaSummary' | 'note'>> = {
  'flood-regulation:free:drone-platform': { included: true, quotaSummary: '1 台无人机', note: '支持单设备试用接入。' },
  'flood-regulation:free:flood-video-interpretation': { included: true, quotaSummary: '1 路视频解译', note: '用于单路视频验证。' },
  'flood-regulation:free:report-author-agent': { included: false, quotaSummary: '不包含', note: '报告编制从 Pro 开始开放。' },
  'flood-regulation:pro:drone-platform': { included: true, quotaSummary: '50 台无人机', note: '支持组织级巡检任务。' },
  'flood-regulation:pro:flood-video-interpretation': { included: true, quotaSummary: '50 路视频解译', note: '支持多点位视频分析。' },
  'flood-regulation:pro:report-author-agent': { included: true, quotaSummary: '100 万字/年', note: '用于巡检报告和处置简报。' },
  'smart-legal:free:report-author-agent': { included: true, quotaSummary: '100 万字/年', note: '适合轻量报告生成。' },
  'smart-legal:free:legal-knowledge-base': { included: true, quotaSummary: '基础存储空间', note: '适合少量法规和合同材料。' },
  'smart-legal:free:contract-review': { included: false, quotaSummary: '不包含', note: '合同审核从 Pro 开始开放。' },
  'smart-legal:free:legal-retrieval-model': { included: false, quotaSummary: '不包含', note: '高级法规检索从 Pro 开始开放。' },
  'smart-legal:pro:report-author-agent': { included: true, quotaSummary: '1000 万字/年', note: '支持组织级报告编制。' },
  'smart-legal:pro:legal-knowledge-base': { included: true, quotaSummary: '扩展存储空间', note: '支持多部门知识库。' },
  'smart-legal:pro:contract-review': { included: true, quotaSummary: '高级合同审查', note: '支持合同条款抽取和风险提示。' },
  'smart-legal:pro:legal-retrieval-model': { included: true, quotaSummary: '高级检索额度', note: '支持法规语义检索。' },
};

function applicableScopeForTier(solution: ProductSolutionRecord, tier: ProductSolutionTier): string[] {
  if (tier.tierCode === 'free') {
    return ['试用客户', 'POC 验证', `${solution.scenario} 单场景验证`];
  }
  if (tier.tierCode === 'pro') {
    return ['正式订阅客户', '组织级生产使用', `${solution.industry} 标准业务团队`];
  }
  return ['大型组织客户', '专属合同客户', '需要私有部署、接口联调或现场交付的客户'];
}

function salesNotesForTier(tier: ProductSolutionTier): string[] {
  if (tier.tierCode === 'free') return ['默认公开可见。', '不包含专属实施和现场服务。', '可升级到 Pro 或 Enterprise。'];
  if (tier.tierCode === 'pro') return ['标准售卖版本。', '支持套餐内配额和超额扩容。', '可配置优惠活动和年度价格。'];
  return ['按合同报价。', '支持专属交付边界、私有模型和接口联调。', '售卖前需要运营和交付团队复核。'];
}

function subscriptionRatioForTier(tierCode: ProductSolutionTierCode): number {
  if (tierCode === 'free') return 0.35;
  if (tierCode === 'pro') return 0.5;
  return 0.15;
}

function inferCapabilityTypeFromRelease(release: ProductReleaseRecord): ProductCapabilityType {
  const searchText = `${release.productCode} ${release.productName}`.toLowerCase();
  if (searchText.includes('console') || searchText.includes('platform')) return 'platform';
  return 'agent';
}

function inferCapabilitySourceFromRelease(release: ProductReleaseRecord): ProductCapabilitySource {
  const searchText = `${release.productCode} ${release.productName} ${release.description}`.toLowerCase();
  return searchText.includes('partner') || searchText.includes('third') || searchText.includes('三方') || searchText.includes('合作方') ? 'partner' : 'self';
}

function mergeCapabilityStatus(left: ProductCapabilityStatus, right: ProductCapabilityStatus): ProductCapabilityStatus {
  if (left === 'active' || right === 'active') return 'active';
  if (left === 'draft' || right === 'draft') return 'draft';
  return 'archived';
}

function latestIso(left: string, right: string): string {
  return new Date(left).getTime() >= new Date(right).getTime() ? left : right;
}

function capabilityProfileFor(seed: CapabilitySeed): CapabilityProfile {
  const overrides = capabilityProfiles[seed.productCode] ?? {};
  const integration = {
    ...defaultIntegration(seed),
    ...overrides.integration,
  };

  return {
    description: overrides.description ?? seed.description,
    ownerTeam: overrides.ownerTeam ?? defaultOwnerTeam(seed),
    capabilitySummary: overrides.capabilitySummary ?? defaultCapabilitySummary(seed),
    accessModes: overrides.accessModes ?? defaultAccessModes(seed.productType),
    tags: overrides.tags ?? [],
    meteringUnit: overrides.meteringUnit ?? defaultMeteringUnit(seed.productType),
    billingMode: overrides.billingMode ?? defaultBillingMode(seed.productType),
    healthStatus: overrides.healthStatus ?? (seed.status === 'active' ? 'normal' : 'warning'),
    integration,
    metrics: overrides.metrics ?? defaultMetrics(seed),
  };
}

function defaultOwnerTeam(seed: CapabilitySeed): string {
  if (seed.source === 'partner') return '生态接入组';
  if (seed.productType === 'agent') return '智能体产品组';
  if (seed.productType === 'model') return '模型平台组';
  if (seed.productType === 'data') return '数据平台组';
  return '平台产品组';
}

function defaultCapabilitySummary(seed: CapabilitySeed): string {
  if (seed.productType === 'agent') return '提供面向业务场景的智能体能力，可被业务产品方案组合并在套餐中配置配额。';
  if (seed.productType === 'model') return '提供模型推理或识别能力，通过模型策略和计量规则控制调用范围。';
  if (seed.productType === 'data') return '提供数据存储、管理或治理能力，支撑业务方案的数据沉淀和权限边界。';
  if (seed.productType === 'service') return '提供外部服务能力接入，通常需要维护供应商、接口和服务状态。';
  return '提供平台级功能能力，可作为业务方案的基础模块组合售卖。';
}

function defaultAccessModes(type: ProductCapabilityType): string[] {
  if (type === 'model') return ['API 调用', '模型策略'];
  if (type === 'agent') return ['Console', 'API 调用'];
  if (type === 'data') return ['Console', '权限策略'];
  if (type === 'service') return ['API 接入'];
  return ['Console', 'API 接入'];
}

function defaultMeteringUnit(type: ProductCapabilityType): string {
  if (type === 'model') return '调用量 / 路数';
  if (type === 'agent') return '字数 / 次数';
  if (type === 'data') return '存储空间';
  if (type === 'service') return '服务调用';
  return '席位 / 资源数';
}

function defaultBillingMode(type: ProductCapabilityType): string {
  if (type === 'model') return '按量计费 + 套餐配额';
  if (type === 'service') return '合同结算';
  return '套餐包含 + 超额计费';
}

function defaultIntegration(seed: CapabilitySeed): ProductCapabilityIntegration {
  const requiresIntegration = seed.source === 'partner' || seed.productType === 'model' || seed.productType === 'service';

  return {
    providerName: seed.source === 'partner' ? '合作方服务商' : 'Vxture',
    providerType: seed.source,
    status: requiresIntegration ? (seed.status === 'active' ? 'connected' : 'testing') : 'not_required',
    endpoint: requiresIntegration ? `https://api.partner.vxture.local/${seed.productCode}` : null,
    protocol: requiresIntegration ? 'REST / HTTPS' : '内部服务',
    authMode: requiresIntegration ? 'API Key / OAuth2' : '平台会话',
    settlementMode: seed.source === 'partner' ? '按合同结算' : null,
    lastCheckedAt: seed.status === 'active' ? '2026-04-28T00:00:00.000Z' : null,
  };
}

function defaultMetrics(seed: CapabilitySeed): ProductCapabilityMetricRule[] {
  if (seed.productType === 'model') {
    return [
      { metricCode: `${seed.productCode}.requests`, metricName: '模型调用次数', unit: '次', cycle: 'monthly', quotaBase: '套餐版本', billingMode: '超额按量' },
      { metricCode: `${seed.productCode}.channels`, metricName: '并发路数', unit: '路', cycle: 'realtime', quotaBase: '服务套餐', billingMode: '合同约定' },
    ];
  }

  if (seed.productType === 'data') {
    return [
      { metricCode: `${seed.productCode}.storage`, metricName: '存储空间', unit: 'GB', cycle: 'monthly', quotaBase: '套餐版本', billingMode: '超额扩容' },
      { metricCode: `${seed.productCode}.retention`, metricName: '数据保留期', unit: '天', cycle: 'fixed', quotaBase: '服务套餐', billingMode: '套餐包含' },
    ];
  }

  if (seed.productType === 'agent') {
    return [
      { metricCode: `${seed.productCode}.words`, metricName: '生成字数', unit: '字', cycle: 'yearly', quotaBase: '服务套餐', billingMode: '超额按量' },
      { metricCode: `${seed.productCode}.sessions`, metricName: '会话次数', unit: '次', cycle: 'monthly', quotaBase: '租户订阅', billingMode: '套餐包含' },
    ];
  }

  return [
    { metricCode: `${seed.productCode}.resources`, metricName: '资源数量', unit: '个', cycle: 'monthly', quotaBase: '服务套餐', billingMode: '套餐包含' },
    { metricCode: `${seed.productCode}.users`, metricName: '可用账号', unit: '人', cycle: 'monthly', quotaBase: '租户订阅', billingMode: '超额扩容' },
  ];
}

function groupBy<T>(rows: T[], keyFn: (row: T) => string) {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = keyFn(row);
    const current = groups.get(key) ?? [];
    current.push(row);
    groups.set(key, current);
  }
  return groups;
}

function toIso(value: Date | string | null): string {
  if (!value) return new Date(0).toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapPlanPrice(row: ProductPlanPriceRow): ProductPlanPrice {
  return {
    id: row.id,
    currency: row.currency,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    periodType: row.period_type,
    periodValue: Number(row.period_value),
    isDefault: row.is_default,
    isActive: row.status,
  };
}

function mapPlanFeature(row: ProductPlanFeatureRow): ProductPlanFeature {
  return {
    code: row.feature_code,
    name: row.feature_name,
    type: row.feature_type,
    quotaValue: row.quota_value === null ? null : Number(row.quota_value),
    isUnlimited: row.is_unlimited,
    config: row.config_json,
  };
}

function mapPlanAgent(row: ProductPlanAgentRow): ProductPlanAgent {
  return {
    id: row.id,
    agentCode: row.agent_code,
    agentName: row.agent_name,
    agentType: row.agent_type,
    status: normalizePlanAgentStatus(row.status),
  };
}

function normalizePlanAgentStatus(status: string): ProductPlanAgent['status'] {
  if (status === 'active' || status === 'inactive' || status === 'draft') return status;
  return 'inactive';
}

export function listEffectiveModelPolicies(): ProductModelPolicyRecord[] {
  const rows = [...explicitModelPolicies, ...defaultModelPolicies];
  const definedProductCodes = new Set(explicitModelPolicies.map((policy) => policy.productCode));

  for (const release of productReleases) {
    if (definedProductCodes.has(release.productCode)) continue;

    rows.push({
      id: `policy-undefined-${release.productCode}`,
      subjectType: 'tenant',
      subjectId: '*',
      subjectName: '租户主体',
      scopeType: 'product',
      scopeCode: release.productCode,
      scopeName: release.productName,
      isDefined: false,
      productCode: release.productCode,
      productName: release.productName,
      productRegion: release.productRegion,
      agentId: null,
      agentCode: null,
      agentName: '全部智能体',
      modelCode: null,
      quotaTokens: 0,
      isUnlimited: false,
      priority: 999,
      isActive: false,
      cycle: 'monthly',
      note: '产品已发布但模型策略未定义，默认不授权。',
    });
  }

  return rows;
}

function assertCanManageProducts(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException('No active session');
  }

  if (req.capabilities && !req.capabilities.includes('platform.product.manage')) {
    throw new ForbiddenException('Missing platform.product.manage capability');
  }
}

interface ProductPlanRow {
  id: string;
  plan_code: string;
  plan_name: string;
  description: string;
  plan_type: string;
  level: number;
  is_free: boolean;
  is_public: boolean;
  status: boolean;
  subscription_count: number;
  created_at: Date | string;
  updated_at: Date | string;
}

interface ProductPlanPriceRow {
  id: string;
  plan_id: string;
  currency: string;
  price: string | number;
  original_price: string | number;
  period_type: 'monthly' | 'yearly';
  period_value: number;
  is_default: boolean;
  status: boolean;
}

interface ProductPlanFeatureRow {
  plan_id: string;
  feature_code: string;
  feature_name: string;
  feature_type: 'quota' | 'function';
  quota_value: string | number | null;
  is_unlimited: boolean;
  config_json: Record<string, unknown> | null;
}

interface ProductPlanAgentRow {
  plan_id: string;
  id: string;
  agent_code: string;
  agent_name: string;
  agent_type: 'chat' | 'business';
  status: string;
}

const PRODUCT_PLAN_SQL = `
  SELECT
    p.id,
    p.plan_code,
    p.plan_name,
    COALESCE(p.description, '') AS description,
    p.plan_type,
    p.level,
    p.is_free,
    p.is_public,
    p.status,
    p.created_at,
    p.updated_at,
    COUNT(DISTINCT s.id)::int AS subscription_count
  FROM product.plan p
  LEFT JOIN commerce.tenant_subscription s
    ON s.plan_id = p.id
   AND s.deleted_at IS NULL
  WHERE p.deleted_at IS NULL
  GROUP BY p.id
  ORDER BY p.level ASC, p.plan_code ASC
`;

const PRODUCT_PLAN_PRICE_SQL = `
  SELECT
    id,
    plan_id,
    currency,
    price,
    COALESCE(original_price, price) AS original_price,
    period_type,
    period_value,
    is_default,
    status
  FROM product.plan_price
  WHERE deleted_at IS NULL
  ORDER BY plan_id ASC, is_default DESC, sort ASC, price ASC
`;

const PRODUCT_PLAN_FEATURE_SQL = `
  SELECT
    pf.plan_id,
    f.feature_code,
    f.feature_name,
    f.feature_type,
    pf.quota_value,
    pf.is_unlimited,
    pf.config_json
  FROM product.plan_feature pf
  INNER JOIN product.feature f
    ON f.id = pf.feature_id
   AND f.deleted_at IS NULL
  WHERE pf.deleted_at IS NULL
  ORDER BY pf.plan_id ASC, f.feature_type ASC, f.feature_code ASC
`;

const PRODUCT_PLAN_AGENT_SQL = `
  SELECT
    pa.plan_id,
    a.id,
    a.agent_code,
    a.agent_name,
    a.agent_type,
    a.status
  FROM product.plan_agent pa
  INNER JOIN product.agent a
    ON a.id = pa.agent_id
   AND a.deleted_at IS NULL
  WHERE pa.deleted_at IS NULL
    AND COALESCE(pa.is_allowed, true) = true
  ORDER BY pa.plan_id ASC, a.sort ASC, a.agent_code ASC
`;
