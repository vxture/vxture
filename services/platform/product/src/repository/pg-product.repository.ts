import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PRODUCT_PG_POOL } from '../tokens';
import type {
  AgentRecord, AgentDetail, FeatureRecord, PlanRecord, PlanPriceRecord,
  PlanDetail, ListAgentsParams, ListPlansParams, ListFeaturesParams,
  CreateAgentInput, CreatePlanInput, SetPlanFeaturesInput,
} from '../types/product.types';

interface AgentRow {
  id: string; agent_code: string; agent_name: string; description: string | null;
  status: string; visibility: string; agent_category: number | null; tags: string[];
  sort: number | null; icon_url: string | null; config_json: Record<string, unknown> | null;
  version: number; created_by: string; updated_by: string | null;
  created_at: Date; updated_at: Date; deleted_at: Date | null;
}
interface FeatureRow {
  id: string; feature_code: string; feature_name: string; parent_code: string | null;
  feature_type: string | null; description: string | null; status: boolean;
  created_by: string; updated_by: string | null;
  created_at: Date; updated_at: Date; deleted_at: Date | null;
}
interface PlanRow {
  id: string; plan_code: string; plan_name: string; description: string | null;
  plan_type: string | null; level: number | null; is_free: boolean; is_public: boolean;
  status: boolean; created_by: string; updated_by: string | null;
  created_at: Date; updated_at: Date; deleted_at: Date | null;
}
interface PlanPriceRow {
  id: string; plan_id: string; price: string; original_price: string | null;
  currency: string; period_type: string; period_value: number;
  sort: number | null; status: boolean; is_default: boolean;
  created_by: string | null; updated_by: string | null;
  created_at: Date; updated_at: Date; deleted_at: Date | null;
}

@Injectable()
export class PgProductRepository {
  constructor(@Inject(PRODUCT_PG_POOL) private readonly pool: Pool) {}

  // ── Agents ─────────────────────────────────────────────────────────────

  async listAgents(params: ListAgentsParams): Promise<{ items: AgentRecord[]; total: number }> {
    const conditions: string[] = ['deleted_at is null'];
    const values: unknown[] = [];
    let idx = 1;

    if (params.status) { conditions.push(`status = $${idx++}`); values.push(params.status); }
    if (params.visibility) { conditions.push(`visibility = $${idx++}`); values.push(params.visibility); }
    if (params.keyword) { conditions.push(`(agent_code ilike $${idx} or agent_name ilike $${idx})`); values.push(`%${params.keyword}%`); idx++; }

    const where = conditions.join(' and ');
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [countResult, rowsResult] = await Promise.all([
      this.pool.query<{ count: string }>(`select count(*) as count from product.agent where ${where}`, values),
      this.pool.query<AgentRow>(
        `select * from product.agent where ${where} order by sort asc nulls last, created_at desc limit $${idx} offset $${idx + 1}`,
        [...values, pageSize, offset],
      ),
    ]);

    return {
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
      items: rowsResult.rows.map(this.mapAgent),
    };
  }

  async getAgentById(id: string): Promise<AgentRecord | null> {
    const result = await this.pool.query<AgentRow>(
      `select * from product.agent where id = $1 and deleted_at is null limit 1`, [id],
    );
    const row = result.rows[0];
    return row ? this.mapAgent(row) : null;
  }

  async getAgentDetail(id: string): Promise<AgentDetail | null> {
    const [agentResult, featuresResult] = await Promise.all([
      this.pool.query<AgentRow>(`select * from product.agent where id = $1 and deleted_at is null limit 1`, [id]),
      this.pool.query<{ feature_id: string; feature_code: string; feature_name: string; is_required: boolean; status: boolean }>(
        `select af.feature_id, f.feature_code, f.feature_name, af.is_required, af.status
         from product.agent_feature af join product.feature f on f.id = af.feature_id
         where af.agent_id = $1 and af.deleted_at is null`,
        [id],
      ),
    ]);
    const agent = agentResult.rows[0];
    if (!agent) return null;
    return {
      ...this.mapAgent(agent),
      features: featuresResult.rows.map(r => ({
        featureId: r.feature_id, featureCode: r.feature_code, featureName: r.feature_name,
        isRequired: r.is_required, status: r.status,
      })),
    };
  }

  async createAgent(input: CreateAgentInput): Promise<AgentRecord> {
    const result = await this.pool.query<AgentRow>(
      `insert into product.agent (
        agent_code, agent_name, description, status, visibility, agent_category,
        tags, sort, icon_url, config_json, created_by, created_at, updated_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now(),now()) returning *`,
      [
        input.agentCode, input.agentName, input.description ?? null,
        input.status ?? 'active', input.visibility ?? 'public',
        input.agentCategory ?? 0, input.tags ?? [], input.sort ?? 0,
        input.iconUrl ?? null,
        input.configJson ? JSON.stringify(input.configJson) : null,
        input.createdBy,
      ],
    );
    return this.mapAgent(result.rows[0]!);
  }

  async updateAgentStatus(id: string, status: string, updatedBy: string): Promise<void> {
    await this.pool.query(
      `update product.agent set status = $2, updated_by = $3, updated_at = now() where id = $1`,
      [id, status, updatedBy],
    );
  }

  // ── Features ───────────────────────────────────────────────────────────

  async listFeatures(params: ListFeaturesParams): Promise<FeatureRecord[]> {
    const conditions: string[] = ['deleted_at is null'];
    const values: unknown[] = [];
    let idx = 1;

    if (params.featureType) { conditions.push(`feature_type = $${idx++}`); values.push(params.featureType); }
    if (params.parentCode) { conditions.push(`parent_code = $${idx++}`); values.push(params.parentCode); }

    const result = await this.pool.query<FeatureRow>(
      `select * from product.feature where ${conditions.join(' and ')} order by feature_code asc`,
      values,
    );
    return result.rows.map(this.mapFeature);
  }

  async getFeatureByCode(featureCode: string): Promise<FeatureRecord | null> {
    const result = await this.pool.query<FeatureRow>(
      `select * from product.feature where feature_code = $1 and deleted_at is null limit 1`, [featureCode],
    );
    const row = result.rows[0];
    return row ? this.mapFeature(row) : null;
  }

  // ── Plans ──────────────────────────────────────────────────────────────

  async listPlans(params: ListPlansParams): Promise<{ items: PlanRecord[]; total: number }> {
    const conditions: string[] = ['deleted_at is null'];
    const values: unknown[] = [];
    let idx = 1;

    if (params.status !== undefined) { conditions.push(`status = $${idx++}`); values.push(params.status); }
    if (params.planType) { conditions.push(`plan_type = $${idx++}`); values.push(params.planType); }

    const where = conditions.join(' and ');
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [countResult, rowsResult] = await Promise.all([
      this.pool.query<{ count: string }>(`select count(*) as count from product.plan where ${where}`, values),
      this.pool.query<PlanRow>(
        `select * from product.plan where ${where} order by level asc nulls last, plan_code asc limit $${idx} offset $${idx + 1}`,
        [...values, pageSize, offset],
      ),
    ]);

    return {
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
      items: rowsResult.rows.map(this.mapPlan),
    };
  }

  async getPlanDetail(id: string): Promise<PlanDetail | null> {
    const [planResult, pricesResult, featuresResult, agentsResult] = await Promise.all([
      this.pool.query<PlanRow>(`select * from product.plan where id = $1 and deleted_at is null limit 1`, [id]),
      this.pool.query<PlanPriceRow>(
        `select * from product.plan_price where plan_id = $1 and deleted_at is null order by sort asc`, [id],
      ),
      this.pool.query<{ feature_id: string; feature_code: string; feature_name: string; quota_value: string | null; is_unlimited: boolean; config_json: Record<string, unknown> | null }>(
        `select ppf.feature_id, f.feature_code, f.feature_name, ppf.quota_value, ppf.is_unlimited, ppf.config_json
         from product.plan_feature ppf join product.feature f on f.id = ppf.feature_id
         where ppf.plan_id = $1 and ppf.deleted_at is null`, [id],
      ),
      this.pool.query<{ agent_id: string; agent_code: string; agent_name: string; is_allowed: boolean }>(
        `select ppa.agent_id, a.agent_code, a.agent_name, ppa.is_allowed
         from product.plan_agent ppa join product.agent a on a.id = ppa.agent_id
         where ppa.plan_id = $1 and ppa.deleted_at is null`, [id],
      ),
    ]);

    const plan = planResult.rows[0];
    if (!plan) return null;

    return {
      ...this.mapPlan(plan),
      prices: pricesResult.rows.map(this.mapPlanPrice),
      features: featuresResult.rows.map(r => ({
        featureId: r.feature_id, featureCode: r.feature_code, featureName: r.feature_name,
        quotaValue: r.quota_value, isUnlimited: r.is_unlimited, configJson: r.config_json,
      })),
      agents: agentsResult.rows.map(r => ({
        agentId: r.agent_id, agentCode: r.agent_code, agentName: r.agent_name, isAllowed: r.is_allowed,
      })),
    };
  }

  async createPlan(input: CreatePlanInput): Promise<PlanRecord> {
    const result = await this.pool.query<PlanRow>(
      `insert into product.plan (
        plan_code, plan_name, description, plan_type, level, is_free, is_public, created_by, created_at, updated_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,now(),now()) returning *`,
      [
        input.planCode, input.planName, input.description ?? null,
        input.planType ?? 'normal', input.level ?? 0,
        input.isFree ?? false, input.isPublic ?? true, input.createdBy,
      ],
    );
    return this.mapPlan(result.rows[0]!);
  }

  async setPlanFeatures(input: SetPlanFeaturesInput): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query(`update product.plan_feature set deleted_at = now() where plan_id = $1 and deleted_at is null`, [input.planId]);
      for (const f of input.features) {
        await client.query(
          `insert into product.plan_feature (plan_id, feature_id, quota_value, is_unlimited, config_json, created_by, updated_by, created_at, updated_at)
           values ($1,$2,$3,$4,$5,$6,$6,now(),now())
           on conflict (plan_id, feature_id) do update set
             quota_value = excluded.quota_value, is_unlimited = excluded.is_unlimited,
             config_json = excluded.config_json, updated_by = excluded.updated_by,
             updated_at = now(), deleted_at = null`,
          [input.planId, f.featureId, f.quotaValue ?? 0, f.isUnlimited ?? false,
           f.configJson ? JSON.stringify(f.configJson) : null, input.operatorId],
        );
      }
      await client.query('commit');
    } catch (err) {
      await client.query('rollback');
      throw err;
    } finally {
      client.release();
    }
  }

  async getPlanPrices(planId: string): Promise<PlanPriceRecord[]> {
    const result = await this.pool.query<PlanPriceRow>(
      `select * from product.plan_price where plan_id = $1 and deleted_at is null order by sort asc`, [planId],
    );
    return result.rows.map(this.mapPlanPrice);
  }

  // ── Mappers ────────────────────────────────────────────────────────────

  private mapAgent(row: AgentRow): AgentRecord {
    return {
      id: row.id, agentCode: row.agent_code, agentName: row.agent_name,
      description: row.description, status: row.status, visibility: row.visibility,
      agentCategory: row.agent_category, tags: row.tags, sort: row.sort,
      iconUrl: row.icon_url, configJson: row.config_json, version: row.version,
      createdBy: row.created_by, updatedBy: row.updated_by,
      createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at,
    };
  }

  private mapFeature(row: FeatureRow): FeatureRecord {
    return {
      id: row.id, featureCode: row.feature_code, featureName: row.feature_name,
      parentCode: row.parent_code, featureType: row.feature_type,
      description: row.description, status: row.status,
      createdBy: row.created_by, updatedBy: row.updated_by,
      createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at,
    };
  }

  private mapPlan(row: PlanRow): PlanRecord {
    return {
      id: row.id, planCode: row.plan_code, planName: row.plan_name,
      description: row.description, planType: row.plan_type, level: row.level,
      isFree: row.is_free, isPublic: row.is_public, status: row.status,
      createdBy: row.created_by, updatedBy: row.updated_by,
      createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at,
    };
  }

  private mapPlanPrice(row: PlanPriceRow): PlanPriceRecord {
    return {
      id: row.id, planId: row.plan_id, price: row.price, originalPrice: row.original_price,
      currency: row.currency, periodType: row.period_type, periodValue: row.period_value,
      sort: row.sort, status: row.status, isDefault: row.is_default,
      createdBy: row.created_by, updatedBy: row.updated_by,
      createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at,
    };
  }
}
