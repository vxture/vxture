import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PgProductRepository } from "../repository/pg-product.repository";
import type {
  AgentRecord,
  AgentDetail,
  FeatureRecord,
  PlanRecord,
  PlanPriceRecord,
  PlanDetail,
  ListAgentsParams,
  ListPlansParams,
  ListFeaturesParams,
  CreateAgentInput,
  CreatePlanInput,
  SetPlanFeaturesInput,
} from "../types/product.types";

@Injectable()
export class ProductService {
  constructor(private readonly repo: PgProductRepository) {}

  // ── Agents ─────────────────────────────────────────────────────────────

  async listAgents(
    params: ListAgentsParams,
  ): Promise<{ items: AgentRecord[]; total: number }> {
    return this.repo.listAgents(params);
  }

  async getAgentById(id: string): Promise<AgentRecord> {
    const agent = await this.repo.getAgentById(id);
    if (!agent) throw new NotFoundException(`Agent ${id} not found`);
    return agent;
  }

  async getAgentDetail(id: string): Promise<AgentDetail> {
    const detail = await this.repo.getAgentDetail(id);
    if (!detail) throw new NotFoundException(`Agent ${id} not found`);
    return detail;
  }

  async createAgent(input: CreateAgentInput): Promise<AgentRecord> {
    return this.repo.createAgent(input);
  }

  async updateAgentStatus(
    id: string,
    status: string,
    updatedBy: string,
  ): Promise<void> {
    const agent = await this.repo.getAgentById(id);
    if (!agent) throw new NotFoundException(`Agent ${id} not found`);
    await this.repo.updateAgentStatus(id, status, updatedBy);
  }

  // ── Features ───────────────────────────────────────────────────────────

  async listFeatures(params: ListFeaturesParams): Promise<FeatureRecord[]> {
    return this.repo.listFeatures(params);
  }

  async getFeatureByCode(featureCode: string): Promise<FeatureRecord> {
    const feature = await this.repo.getFeatureByCode(featureCode);
    if (!feature)
      throw new NotFoundException(`Feature ${featureCode} not found`);
    return feature;
  }

  // ── Plans ──────────────────────────────────────────────────────────────

  async listPlans(
    params: ListPlansParams,
  ): Promise<{ items: PlanRecord[]; total: number }> {
    return this.repo.listPlans(params);
  }

  async getPlanDetail(id: string): Promise<PlanDetail> {
    const detail = await this.repo.getPlanDetail(id);
    if (!detail) throw new NotFoundException(`Plan ${id} not found`);
    return detail;
  }

  async createPlan(input: CreatePlanInput): Promise<PlanRecord> {
    return this.repo.createPlan(input);
  }

  async setPlanFeatures(input: SetPlanFeaturesInput): Promise<void> {
    const plan = await this.repo.getPlanDetail(input.planId);
    if (!plan) throw new NotFoundException(`Plan ${input.planId} not found`);
    await this.repo.setPlanFeatures(input);
  }

  async getPlanPrices(planId: string): Promise<PlanPriceRecord[]> {
    return this.repo.getPlanPrices(planId);
  }
}
