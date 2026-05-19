// ── Agent ──────────────────────────────────────────────────────────────────

export interface AgentRecord {
  id: string;
  agentCode: string;
  agentName: string;
  description: string | null;
  status: string;
  visibility: string;
  agentCategory: number | null;
  tags: string[];
  sort: number | null;
  iconUrl: string | null;
  configJson: Record<string, unknown> | null;
  version: number;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface AgentDetail extends AgentRecord {
  features: AgentFeatureItem[];
}

export interface AgentFeatureItem {
  featureId: string;
  featureCode: string;
  featureName: string;
  isRequired: boolean;
  status: boolean;
}

// ── Feature ────────────────────────────────────────────────────────────────

export interface FeatureRecord {
  id: string;
  featureCode: string;
  featureName: string;
  parentCode: string | null;
  featureType: string | null;
  description: string | null;
  status: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ── Plan ───────────────────────────────────────────────────────────────────

export interface PlanRecord {
  id: string;
  planCode: string;
  planName: string;
  description: string | null;
  planType: string | null;
  level: number | null;
  isFree: boolean;
  isPublic: boolean;
  status: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PlanPriceRecord {
  id: string;
  planId: string;
  price: string;
  originalPrice: string | null;
  currency: string;
  periodType: string;
  periodValue: number;
  sort: number | null;
  status: boolean;
  isDefault: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PlanFeatureItem {
  featureId: string;
  featureCode: string;
  featureName: string;
  quotaValue: string | null;
  isUnlimited: boolean;
  configJson: Record<string, unknown> | null;
}

export interface PlanDetail extends PlanRecord {
  prices: PlanPriceRecord[];
  features: PlanFeatureItem[];
  agents: {
    agentId: string;
    agentCode: string;
    agentName: string;
    isAllowed: boolean;
  }[];
}

export interface ListAgentsParams {
  status?: string;
  visibility?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}
export interface ListPlansParams {
  status?: boolean;
  planType?: string;
  page?: number;
  pageSize?: number;
}
export interface ListFeaturesParams {
  featureType?: string;
  parentCode?: string;
}

export interface CreateAgentInput {
  agentCode: string;
  agentName: string;
  description?: string;
  status?: string;
  visibility?: string;
  agentCategory?: number;
  tags?: string[];
  sort?: number;
  iconUrl?: string;
  configJson?: Record<string, unknown>;
  createdBy: string;
}

export interface CreatePlanInput {
  planCode: string;
  planName: string;
  description?: string;
  planType?: string;
  level?: number;
  isFree?: boolean;
  isPublic?: boolean;
  createdBy: string;
}

export interface SetPlanFeaturesInput {
  planId: string;
  features: {
    featureId: string;
    quotaValue?: number;
    isUnlimited?: boolean;
    configJson?: Record<string, unknown>;
  }[];
  operatorId: string;
}
