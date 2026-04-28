import type {
  AiModelGrantRecord,
  AiModelRecord,
  TenantSubscriptionQuotaRecord,
  TenantUsageEventRecord,
  TenantUsageSummaryRecord,
} from './types/gateway.types';

type PrismaArgs = Record<string, unknown>;

interface PrismaMutationResult {
  count: number;
}

interface PrismaDelegate<TRecord> {
  findFirst(args: PrismaArgs): Promise<TRecord | null>;
  findMany(args?: PrismaArgs): Promise<TRecord[]>;
  create(args: PrismaArgs): Promise<TRecord>;
  update(args: PrismaArgs): Promise<TRecord>;
  updateMany(args: PrismaArgs): Promise<PrismaMutationResult>;
  upsert(args: PrismaArgs): Promise<TRecord>;
}

export interface AiGatewayPrismaClient {
  aiModel: PrismaDelegate<AiModelRecord>;
  aiModelGrant: PrismaDelegate<AiModelGrantRecord>;
  tenantSubscriptionQuota: PrismaDelegate<TenantSubscriptionQuotaRecord>;
  tenantUsageEvent: PrismaDelegate<TenantUsageEventRecord>;
  tenantUsageSummary: PrismaDelegate<TenantUsageSummaryRecord>;
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $transaction<T>(fn: (tx: AiGatewayPrismaClient) => Promise<T>): Promise<T>;
}

type PrismaClientConstructor = new () => AiGatewayPrismaClient;

interface PrismaClientModule {
  PrismaClient: PrismaClientConstructor;
}

declare global {
  var __vxtureAiGatewayPrisma: AiGatewayPrismaClient | undefined;
}

const { PrismaClient } = require('@prisma/client') as PrismaClientModule;

export const prisma = globalThis.__vxtureAiGatewayPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__vxtureAiGatewayPrisma = prisma;
}
