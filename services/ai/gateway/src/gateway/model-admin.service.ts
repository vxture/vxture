import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ModelRegistryRepository } from '../registry/model-registry.repository';
import type {
  AiModelGrantRecord,
  AiModelRecord,
  CreateAiModelGrantInput,
  CreateAiModelInput,
  ModelConfig,
  UpdateAiModelGrantInput,
  UpdateAiModelInput,
} from '../types/gateway.types';

export interface AiModelAdminRecord {
  id: string;
  providerId: string | null;
  modelCode: string;
  modelName: string;
  provider: string;
  endpointUrl: string;
  protocol: string;
  modelType: string;
  capabilities: string[];
  isActive: boolean;
  config: ModelConfig | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiModelGrantAdminRecord {
  id: string;
  modelId: string;
  tenantId: string;
  agentId: string | null;
  priority: number;
  reason: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateAiModelBody = Partial<Omit<CreateAiModelInput, 'config'>> & {
  config?: ModelConfig | null;
};

export type UpdateAiModelBody = Partial<Omit<UpdateAiModelInput, 'config'>> & {
  config?: ModelConfig | null;
};

export type CreateAiModelGrantBody = {
  modelId?: string;
  tenantId?: string;
  agentId?: string | null;
  priority?: number | null;
  reason?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
};

export type UpdateAiModelGrantBody = {
  agentId?: string | null;
  priority?: number | null;
  reason?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
};

@Injectable()
export class ModelAdminService {
  constructor(@Inject(ModelRegistryRepository) private readonly repository: ModelRegistryRepository) {}

  async listModels(includeInactive = true): Promise<AiModelAdminRecord[]> {
    const models = await this.repository.listModels(includeInactive);
    return models.map(mapModel);
  }

  async createModel(body: CreateAiModelBody): Promise<AiModelAdminRecord> {
    const input = this.normalizeCreateModel(body);
    const model = await this.repository.createModel(input);
    return mapModel(model);
  }

  async updateModel(modelId: string, body: UpdateAiModelBody): Promise<AiModelAdminRecord> {
    await this.assertModelExists(modelId);
    const input = this.normalizeUpdateModel(body);
    const model = await this.repository.updateModel(modelId, input);
    return mapModel(model);
  }

  async setModelActive(modelId: string, isActive: boolean): Promise<AiModelAdminRecord> {
    await this.assertModelExists(modelId);
    const model = await this.repository.updateModel(modelId, { isActive });
    return mapModel(model);
  }

  async deleteModel(modelId: string): Promise<AiModelAdminRecord> {
    await this.assertModelExists(modelId);
    const model = await this.repository.deleteModel(modelId);
    return mapModel(model);
  }

  async listGrants(filters: { tenantId?: string; modelId?: string }): Promise<AiModelGrantAdminRecord[]> {
    const grants = await this.repository.listGrants(filters);
    return grants.map(mapGrant);
  }

  async createGrant(body: CreateAiModelGrantBody): Promise<AiModelGrantAdminRecord> {
    const input = await this.normalizeCreateGrant(body);
    const grant = await this.repository.createGrant(input);
    return mapGrant(grant);
  }

  async updateGrant(grantId: string, body: UpdateAiModelGrantBody): Promise<AiModelGrantAdminRecord> {
    await this.assertGrantExists(grantId);
    const input = this.normalizeUpdateGrant(body);
    const grant = await this.repository.updateGrant(grantId, input);
    return mapGrant(grant);
  }

  async setGrantActive(grantId: string, isActive: boolean): Promise<AiModelGrantAdminRecord> {
    await this.assertGrantExists(grantId);
    const grant = await this.repository.updateGrant(grantId, { isActive });
    return mapGrant(grant);
  }

  private normalizeCreateModel(body: CreateAiModelBody): CreateAiModelInput {
    const capabilities = normalizeCapabilities(body.capabilities);

    return {
      modelCode: requiredString(body.modelCode, 'modelCode'),
      providerId: optionalString(body.providerId),
      modelName: requiredString(body.modelName, 'modelName'),
      provider: requiredString(body.provider, 'provider'),
      endpointUrl: requiredUrl(body.endpointUrl, 'endpointUrl'),
      protocol: requiredString(body.protocol, 'protocol'),
      modelType: body.modelType ?? 'chat',
      capabilities,
      config: body.config ?? null,
    };
  }

  private normalizeUpdateModel(body: UpdateAiModelBody): UpdateAiModelInput {
    const input: UpdateAiModelInput = {};

    if (body.modelCode !== undefined) input.modelCode = requiredString(body.modelCode, 'modelCode');
    if (body.providerId !== undefined) input.providerId = optionalString(body.providerId);
    if (body.modelName !== undefined) input.modelName = requiredString(body.modelName, 'modelName');
    if (body.provider !== undefined) input.provider = requiredString(body.provider, 'provider');
    if (body.endpointUrl !== undefined) input.endpointUrl = requiredUrl(body.endpointUrl, 'endpointUrl');
    if (body.protocol !== undefined) input.protocol = requiredString(body.protocol, 'protocol');
    if (body.modelType !== undefined) input.modelType = requiredString(body.modelType, 'modelType');
    if (body.capabilities !== undefined) input.capabilities = normalizeCapabilities(body.capabilities);
    if (body.config !== undefined) input.config = body.config;
    if (body.isActive !== undefined) input.isActive = body.isActive;

    return input;
  }

  private async normalizeCreateGrant(body: CreateAiModelGrantBody): Promise<CreateAiModelGrantInput> {
    const modelId = requiredString(body.modelId, 'modelId');
    await this.assertModelExists(modelId);

    return {
      modelId,
      tenantId: requiredString(body.tenantId, 'tenantId'),
      agentId: optionalString(body.agentId),
      priority: parsePriority(body.priority),
      reason: optionalString(body.reason),
      expiresAt: parseDateOrNull(body.expiresAt),
      isActive: body.isActive ?? true,
    };
  }

  private normalizeUpdateGrant(body: UpdateAiModelGrantBody): UpdateAiModelGrantInput {
    const input: UpdateAiModelGrantInput = {};

    if (body.agentId !== undefined) input.agentId = optionalString(body.agentId);
    if (body.priority !== undefined) input.priority = parsePriority(body.priority);
    if (body.reason !== undefined) input.reason = optionalString(body.reason);
    if (body.expiresAt !== undefined) input.expiresAt = parseDateOrNull(body.expiresAt);
    if (body.isActive !== undefined) input.isActive = body.isActive;

    return input;
  }

  private async assertModelExists(modelId: string): Promise<AiModelRecord> {
    const model = await this.repository.findModelById(modelId);

    if (!model) {
      throw new NotFoundException(`AI model "${modelId}" was not found`);
    }

    return model;
  }

  private async assertGrantExists(grantId: string): Promise<AiModelGrantRecord> {
    const grant = await this.repository.findGrantById(grantId);

    if (!grant) {
      throw new NotFoundException(`AI model grant "${grantId}" was not found`);
    }

    return grant;
  }
}

function mapModel(model: AiModelRecord): AiModelAdminRecord {
  return {
    id: model.id,
    providerId: model.providerId,
    modelCode: model.modelCode,
    modelName: model.modelName,
    provider: model.provider,
    endpointUrl: model.endpointUrl,
    protocol: model.protocol,
    modelType: model.modelType,
    capabilities: model.capabilities,
    isActive: model.isActive,
    config: model.config,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
}

function mapGrant(grant: AiModelGrantRecord): AiModelGrantAdminRecord {
  return {
    id: grant.id,
    modelId: grant.modelId,
    tenantId: grant.tenantId,
    agentId: grant.agentId,
    priority: grant.priority,
    reason: grant.reason,
    expiresAt: grant.expiresAt?.toISOString() ?? null,
    isActive: grant.isActive,
    createdAt: grant.createdAt.toISOString(),
    updatedAt: grant.updatedAt.toISOString(),
  };
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new BadRequestException(`${field} is required`);
  }

  return value.trim();
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function requiredUrl(value: unknown, field: string): string {
  const text = requiredString(value, field);

  try {
    new URL(text);
  } catch {
    throw new BadRequestException(`${field} must be a valid URL`);
  }

  return text;
}

function normalizeCapabilities(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException('capabilities must be an array');
  }

  const capabilities = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);

  if (capabilities.length === 0) {
    throw new BadRequestException('capabilities cannot be empty');
  }

  return [...new Set(capabilities)];
}

function parsePriority(value: number | null | undefined): number {
  if (value === null || value === undefined) {
    return 100;
  }

  if (!Number.isSafeInteger(value) || value < 0) {
    throw new BadRequestException('priority must be a positive integer');
  }

  return value;
}

function parseDateOrNull(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('expiresAt must be a valid date');
  }

  return date;
}
