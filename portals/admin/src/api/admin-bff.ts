import type {
  AccountOperationRecord,
  Capability,
  AdminAssistantChatMessage,
  AdminAssistantChatResponse,
  AiModelGrantRecord,
  AiModelRecord,
  ConsoleUser,
  DevServiceSnapshot,
  ProductAgentRecord,
  ProductCapabilityRecord,
  ProductModelPolicyRecord,
  ProductPlanRecord,
  ProductReleaseRecord,
  ProductServicePlanDetailRecord,
  ProductSolutionDetailRecord,
  ProductSolutionRecord,
  PlatformRoleRecord,
  SessionSnapshot,
  TenantOperationRecord,
} from '@/entities/console';
import {
  aiModelGrantRecords,
  aiModelRecords,
  anonymousSession,
  productAgentRecords,
  productModelPolicyRecords,
  productReleaseRecords,
  productSolutionRecords,
  tenantOperationRecords,
} from '@/shared/mock-console-data';

function normalizeOrigin(value: string | undefined): string {
  const normalized = value?.trim().replace(/\/+$/, '');
  if (!normalized) {
    return 'http://localhost:8000';
  }
  return normalized;
}

const DEFAULT_BFF_URL = normalizeOrigin(
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_ADMIN_BFF_URL
);
const ADMIN_API_PREFIX = resolveAdminApiPrefix();

function resolveAdminApiPrefix(): string {
  const explicitPrefix = process.env.NEXT_PUBLIC_ADMIN_API_PREFIX;
  if (explicitPrefix !== undefined) {
    return explicitPrefix.trim().replace(/\/+$/, '');
  }

  const usesDirectAdminBff = Boolean(process.env.NEXT_PUBLIC_ADMIN_BFF_URL?.trim()) && !process.env.NEXT_PUBLIC_API_URL?.trim();
  return usesDirectAdminBff ? '' : '/admin-api';
}

interface LoginPayload {
  identifier: string;
  password: string;
}

export class AdminBffError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'AdminBffError';
  }
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}${path}`, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchCurrentUser(): Promise<ConsoleUser | null> {
  return readJson<ConsoleUser | null>('/api/me', anonymousSession.user);
}

export async function fetchCapabilities(): Promise<Capability[]> {
  return readJson<Capability[]>('/api/capabilities', anonymousSession.capabilities);
}

export async function fetchAiModels(includeInactive = true): Promise<AiModelRecord[]> {
  return readJson<AiModelRecord[]>(
    `/api/ai-gateway/models?includeInactive=${includeInactive ? 'true' : 'false'}`,
    aiModelRecords,
  );
}

export async function fetchAiModelGrants(filters: { tenantId?: string; modelId?: string } = {}): Promise<AiModelGrantRecord[]> {
  const params = new URLSearchParams();
  if (filters.tenantId) params.set('tenantId', filters.tenantId);
  if (filters.modelId) params.set('modelId', filters.modelId);

  return readJson<AiModelGrantRecord[]>(
    `/api/ai-gateway/grants${params.size ? `?${params.toString()}` : ''}`,
    aiModelGrantRecords,
  );
}

export async function fetchProductPlans(): Promise<ProductPlanRecord[]> {
  return readJson<ProductPlanRecord[]>('/api/products/plans', []);
}

export async function fetchProductCapabilities(): Promise<ProductCapabilityRecord[]> {
  return readJson<ProductCapabilityRecord[]>('/api/products/capabilities', []);
}

export async function fetchProductCapability(productCode: string): Promise<ProductCapabilityRecord | null> {
  return readJson<ProductCapabilityRecord | null>(`/api/products/capabilities/${encodeURIComponent(productCode)}`, null);
}

export async function fetchProductReleases(): Promise<ProductReleaseRecord[]> {
  return readJson<ProductReleaseRecord[]>('/api/products/releases', productReleaseRecords);
}

export async function fetchProductSolutions(): Promise<ProductSolutionRecord[]> {
  return readJson<ProductSolutionRecord[]>('/api/products/solutions', productSolutionRecords);
}

export async function fetchProductSolution(solutionCode: string): Promise<ProductSolutionDetailRecord | null> {
  return readJson<ProductSolutionDetailRecord | null>(`/api/products/solutions/${encodeURIComponent(solutionCode)}`, null);
}

export async function fetchProductServicePlan(
  solutionCode: string,
  tierCode: string,
): Promise<ProductServicePlanDetailRecord | null> {
  return readJson<ProductServicePlanDetailRecord | null>(
    `/api/products/service-plans/${encodeURIComponent(solutionCode)}/${encodeURIComponent(tierCode)}`,
    null,
  );
}

export async function fetchProductAgents(): Promise<ProductAgentRecord[]> {
  return readJson<ProductAgentRecord[]>('/api/products/agents', productAgentRecords);
}

export async function fetchProductModelPolicies(): Promise<ProductModelPolicyRecord[]> {
  return readJson<ProductModelPolicyRecord[]>('/api/products/model-policies', productModelPolicyRecords);
}

export async function fetchTenantOperations(): Promise<TenantOperationRecord[]> {
  return readJson<TenantOperationRecord[]>('/api/tenants', tenantOperationRecords);
}

export async function fetchAccountOperations(): Promise<AccountOperationRecord[]> {
  return readJson<AccountOperationRecord[]>('/api/accounts', []);
}

export async function fetchPlatformRoles(): Promise<PlatformRoleRecord[]> {
  return readJson<PlatformRoleRecord[]>('/api/admin-roles', []);
}

export async function fetchDevServices(signal?: AbortSignal): Promise<DevServiceSnapshot[]> {
  const response = await fetch('/api/dev-services', {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new AdminBffError('Dev services snapshot failed', response.status);
  }

  return (await response.json()) as DevServiceSnapshot[];
}

export async function sendAdminAssistantChat(payload: {
  messages: AdminAssistantChatMessage[];
  page?: string;
  productCode?: string;
  tenantId?: string;
}): Promise<AdminAssistantChatResponse> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/assistant/chat`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Admin assistant request failed';

    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message[0] ?? message : body.message ?? message;
    } catch {
      // Keep the typed error useful even if a proxy returns a non-JSON response.
    }

    throw new AdminBffError(message, response.status);
  }

  return (await response.json()) as AdminAssistantChatResponse;
}

export async function createAiModel(payload: {
  modelCode: string;
  modelName: string;
  provider: string;
  endpointUrl: string;
  protocol: string;
  capabilities: string[];
  apiKeyEnvVar: string;
  providerId?: string | null;
  config?: Record<string, unknown> | null;
}): Promise<AiModelRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/ai-gateway/models`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new AdminBffError('AI model creation failed', response.status);
  }

  return (await response.json()) as AiModelRecord;
}

export async function updateAiModel(
  modelId: string,
  payload: {
    modelCode?: string;
    modelName?: string;
    provider?: string;
    endpointUrl?: string;
    protocol?: string;
    capabilities?: string[];
    apiKeyEnvVar?: string;
    providerId?: string | null;
    config?: Record<string, unknown> | null;
    isActive?: boolean;
  },
): Promise<AiModelRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/ai-gateway/models/${modelId}`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new AdminBffError('AI model update failed', response.status);
  }

  return (await response.json()) as AiModelRecord;
}

export async function setAiModelActive(modelId: string, active: boolean): Promise<AiModelRecord> {
  const response = await fetch(
    `${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/ai-gateway/models/${modelId}/${active ? 'activate' : 'deactivate'}`,
    {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new AdminBffError('AI model state update failed', response.status);
  }

  return (await response.json()) as AiModelRecord;
}

export async function deleteAiModel(modelId: string): Promise<AiModelRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/ai-gateway/models/${modelId}`, {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new AdminBffError('AI model deletion failed', response.status);
  }

  return (await response.json()) as AiModelRecord;
}

export async function createAiModelGrant(payload: {
  modelId: string;
  tenantId: string;
  agentId?: string | null;
  priority?: number | null;
  reason?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}): Promise<AiModelGrantRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/ai-gateway/grants`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new AdminBffError('AI model grant creation failed', response.status);
  }

  return (await response.json()) as AiModelGrantRecord;
}

export async function updateAiModelGrant(
  grantId: string,
  payload: {
    agentId?: string | null;
    priority?: number | null;
    reason?: string | null;
    expiresAt?: string | null;
    isActive?: boolean;
  },
): Promise<AiModelGrantRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/ai-gateway/grants/${grantId}`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new AdminBffError('AI model grant update failed', response.status);
  }

  return (await response.json()) as AiModelGrantRecord;
}

export async function setAiModelGrantActive(grantId: string, active: boolean): Promise<AiModelGrantRecord> {
  const response = await fetch(
    `${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/ai-gateway/grants/${grantId}${active ? '/activate' : ''}`,
    {
      method: active ? 'POST' : 'DELETE',
      credentials: 'include',
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new AdminBffError('AI model grant state update failed', response.status);
  }

  return (await response.json()) as AiModelGrantRecord;
}

async function hasActiveSession() {
  try {
    const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/auth/session`, {
      credentials: 'include',
      cache: 'no-store',
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function restoreSession(): Promise<SessionSnapshot> {
  const active = await hasActiveSession();
  if (!active) {
    return anonymousSession;
  }

  const [user, capabilities] = await Promise.all([
    fetchCurrentUser(),
    fetchCapabilities(),
  ]);

  const snapshot = {
    isAuthenticated: Boolean(user),
    user,
    capabilities,
  };

  return snapshot;
}

export async function login(payload: LoginPayload): Promise<SessionSnapshot> {
  let response: Response;

  try {
    response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AdminBffError('Admin BFF is unavailable.', 503);
  }

  if (!response.ok) {
    let message = 'Login failed';

    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) {
        message = body.message[0] ?? message;
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      // Ignore malformed error body and fall back to generic message.
    }

    throw new AdminBffError(message, response.status);
  }

  const snapshot = await restoreSession();
  if (!snapshot.isAuthenticated) {
    throw new AdminBffError('Authenticated session could not be restored after login.', 500);
  }

  return snapshot;
}

export async function logout() {
  try {
    await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    // Keep local sign-out resilient even if the BFF is unavailable.
  }
}
