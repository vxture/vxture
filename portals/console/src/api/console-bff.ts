import type {
  Capability,
  AiModelGrantRecord,
  AiModelRecord,
  ConsoleOrganizationProfile,
  ConsoleUser,
  ConsoleUserProfile,
  MemberRecord,
  SessionSnapshot,
  TenantContext,
  TenantPermissionRecord,
  TenantRoleRecord,
} from '@/entities/console';
import { aiModelGrantRecords, aiModelRecords, anonymousSession } from '@/shared/mock-console-data';

function normalizeOrigin(value: string | undefined): string {
  const normalized = value?.trim().replace(/\/+$/, '');
  if (!normalized) {
    return 'http://localhost:8000';
  }
  return normalized;
}

const DEFAULT_BFF_URL = normalizeOrigin(
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_CONSOLE_BFF_URL
);
const CONSOLE_API_PREFIX = (process.env.NEXT_PUBLIC_CONSOLE_API_PREFIX ?? '/console-api').replace(/\/+$/, '');

interface LoginPayload {
  identifier: string;
  password: string;
}

export class ConsoleBffError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ConsoleBffError';
  }
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${path}`, {
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

function withTenant(path: string, tenantId?: string) {
  return tenantId ? `${path}?tenantId=${encodeURIComponent(tenantId)}` : path;
}

export async function fetchCurrentUser(): Promise<ConsoleUser | null> {
  return readJson<ConsoleUser | null>('/api/me', anonymousSession.user);
}

export async function fetchTenantContext(tenantId?: string): Promise<TenantContext | null> {
  return readJson<TenantContext | null>(withTenant('/api/tenant-context', tenantId), anonymousSession.tenant);
}

export async function fetchTenantOptions(): Promise<TenantContext[]> {
  return readJson<TenantContext[]>('/api/tenant-context/options', []);
}

export async function fetchCapabilities(): Promise<Capability[]> {
  return readJson<Capability[]>('/api/capabilities', anonymousSession.capabilities);
}

export async function fetchMembers(tenantId?: string): Promise<MemberRecord[]> {
  return readJson<MemberRecord[]>(withTenant('/api/iam/members', tenantId), []);
}

export async function fetchMember(memberId: string, tenantId?: string): Promise<MemberRecord | null> {
  return readJson<MemberRecord | null>(withTenant(`/api/iam/members/${memberId}`, tenantId), null);
}

export async function fetchTenantRoles(tenantId?: string): Promise<TenantRoleRecord[]> {
  return readJson<TenantRoleRecord[]>(withTenant('/api/iam/roles', tenantId), []);
}

export async function fetchTenantPermissions(tenantId?: string): Promise<TenantPermissionRecord[]> {
  return readJson<TenantPermissionRecord[]>(withTenant('/api/iam/permissions', tenantId), []);
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
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/ai-gateway/models`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('AI model creation failed', response.status);
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
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/ai-gateway/models/${modelId}`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('AI model update failed', response.status);
  }

  return (await response.json()) as AiModelRecord;
}

export async function setAiModelActive(modelId: string, active: boolean): Promise<AiModelRecord> {
  const response = await fetch(
    `${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/ai-gateway/models/${modelId}/${active ? 'activate' : 'deactivate'}`,
    {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new ConsoleBffError('AI model state update failed', response.status);
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
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/ai-gateway/grants`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('AI model grant creation failed', response.status);
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
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/ai-gateway/grants/${grantId}`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('AI model grant update failed', response.status);
  }

  return (await response.json()) as AiModelGrantRecord;
}

export async function setAiModelGrantActive(grantId: string, active: boolean): Promise<AiModelGrantRecord> {
  const response = await fetch(
    `${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/ai-gateway/grants/${grantId}${active ? '/activate' : ''}`,
    {
      method: active ? 'POST' : 'DELETE',
      credentials: 'include',
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new ConsoleBffError('AI model grant state update failed', response.status);
  }

  return (await response.json()) as AiModelGrantRecord;
}

export async function createTenantRole(
  payload: { roleCode: string; roleName: string; description?: string | null; permissionIds?: string[] },
  tenantId?: string,
): Promise<TenantRoleRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${withTenant('/api/iam/roles', tenantId)}`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('Role creation failed', response.status);
  }

  return (await response.json()) as TenantRoleRecord;
}

export async function updateTenantRole(
  roleId: string,
  payload: { roleName?: string | null; description?: string | null; status?: 'active' | 'disabled'; permissionIds?: string[] },
  tenantId?: string,
): Promise<TenantRoleRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${withTenant(`/api/iam/roles/${roleId}`, tenantId)}`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('Role update failed', response.status);
  }

  return (await response.json()) as TenantRoleRecord;
}

export async function deleteTenantRole(roleId: string, tenantId?: string) {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${withTenant(`/api/iam/roles/${roleId}`, tenantId)}`, {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ConsoleBffError('Role delete failed', response.status);
  }
}

export async function createMember(
  payload: { email: string; nickname?: string | null; remark?: string | null; roleId?: string | null; roleCode?: string | null },
  tenantId?: string,
): Promise<MemberRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${withTenant('/api/iam/members', tenantId)}`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('Member creation failed', response.status);
  }

  return (await response.json()) as MemberRecord;
}

export async function inviteMember(
  payload: { email: string; nickname?: string | null; remark?: string | null; roleId?: string | null; roleCode?: string | null },
  tenantId?: string,
): Promise<MemberRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${withTenant('/api/iam/members/invite', tenantId)}`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('Member invite failed', response.status);
  }

  return (await response.json()) as MemberRecord;
}

export async function updateMember(
  memberId: string,
  payload: { nickname?: string | null; remark?: string | null; roleId?: string | null; status?: 'active' | 'inactive' | 'banned' },
  tenantId?: string,
): Promise<MemberRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${withTenant(`/api/iam/members/${memberId}`, tenantId)}`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('Member update failed', response.status);
  }

  return (await response.json()) as MemberRecord;
}

export async function disableMember(memberId: string, tenantId?: string): Promise<MemberRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${withTenant(`/api/iam/members/${memberId}/disable`, tenantId)}`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ConsoleBffError('Member disable failed', response.status);
  }

  return (await response.json()) as MemberRecord;
}

export async function resetMemberPassword(memberId: string, payload: { nextPassword: string }, tenantId?: string) {
  const response = await fetch(
    `${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${withTenant(`/api/iam/members/${memberId}/reset-password`, tenantId)}`,
    {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new ConsoleBffError('Member password reset failed', response.status);
  }
}

export async function unlinkMember(memberId: string, tenantId?: string) {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}${withTenant(`/api/iam/members/${memberId}`, tenantId)}`, {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new ConsoleBffError('Member unlink failed', response.status);
  }
}

export async function fetchUserProfile(): Promise<ConsoleUserProfile | null> {
  return readJson<ConsoleUserProfile | null>('/api/me/profile', null);
}

export async function fetchOrganizationProfile(tenantId?: string): Promise<ConsoleOrganizationProfile | null> {
  return readJson<ConsoleOrganizationProfile | null>(withTenant('/api/me/organization', tenantId), null);
}

export async function updateUserProfile(payload: {
  displayName?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  timezone?: string | null;
  language?: string | null;
}): Promise<ConsoleUserProfile> {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/me/profile`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('Profile update failed', response.status);
  }

  return (await response.json()) as ConsoleUserProfile;
}

export async function changeUserPassword(payload: { currentPassword: string; nextPassword: string }) {
  const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/me/password`, {
    method: 'PUT',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ConsoleBffError('Password update failed', response.status);
  }
}

async function hasActiveSession() {
  try {
    const response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/auth/session`, {
      credentials: 'include',
      cache: 'no-store',
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function restoreSession(tenantId?: string): Promise<SessionSnapshot> {
  const active = await hasActiveSession();
  if (!active) {
    return anonymousSession;
  }

  const [user, tenant, tenantOptions, capabilities] = await Promise.all([
    fetchCurrentUser(),
    fetchTenantContext(tenantId),
    fetchTenantOptions(),
    fetchCapabilities(),
  ]);

  const snapshot = {
    isAuthenticated: Boolean(user),
    user,
    tenant,
    tenantOptions,
    capabilities,
  };

  return snapshot;
}

export async function login(payload: LoginPayload, tenantId?: string): Promise<SessionSnapshot> {
  let response: Response;

  try {
    response = await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ConsoleBffError('Console BFF is unavailable.', 503);
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

    throw new ConsoleBffError(message, response.status);
  }

  const snapshot = await restoreSession(tenantId);
  if (!snapshot.isAuthenticated) {
    throw new ConsoleBffError('Authenticated session could not be restored after login.', 500);
  }

  return snapshot;
}

export async function logout() {
  try {
    await fetch(`${DEFAULT_BFF_URL}${CONSOLE_API_PREFIX}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    // Keep local sign-out resilient even if the BFF is unavailable.
  }
}
