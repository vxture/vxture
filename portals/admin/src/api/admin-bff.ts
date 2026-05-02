import type {
  AccountOperationRecord,
  AnnouncementRecord,
  AuditLogRecord,
  Capability,
  BillingBillAction,
  AiModelGrantRecord,
  AiModelRecord,
  BillingDetailRecord,
  BillingInvoiceLedgerRecord,
  BillingInvoiceReceiptAction,
  BillingInvoiceStatus,
  BillingInvoiceTaxType,
  BillingInvoiceType,
  BillingRecord,
  CommerceOverviewSnapshot,
  ConsoleUser,
  DevServiceSnapshot,
  OrderOfflinePaymentType,
  OrderOperationDetailRecord,
  OrderOperationRecord,
  PaymentOperationRecord,
  PlatformAdminPermissionRecord,
  PlatformAdminRecord,
  PlatformGovernanceKind,
  PlatformGovernanceRecord,
  PromotionOperationRecord,
  PromotionRedemptionRecord,
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
  SkillRecord,
  SupportTicketRecord,
  SubscriptionOperationAction,
  SubscriptionOperationDetailRecord,
  SubscriptionOperationRecord,
  TenantOperationRecord,
  UsageMeteringRecord,
} from '@/entities/console';
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
const EMPTY_SESSION: SessionSnapshot = {
  isAuthenticated: false,
  user: null,
  capabilities: [],
};

function resolveAdminApiPrefix(): string {
  const explicitPrefix = process.env.NEXT_PUBLIC_ADMIN_API_PREFIX;
  if (explicitPrefix !== undefined) {
    return explicitPrefix.trim().replace(/\/+$/, '');
  }

  const usesDirectAdminBff = Boolean(process.env.NEXT_PUBLIC_ADMIN_BFF_URL?.trim()) && !process.env.NEXT_PUBLIC_API_URL?.trim();
  return usesDirectAdminBff ? '' : '/admin-api';
}

export interface CaptchaChallenge {
  token: string;
  targetRatio: number;
}

interface LoginPayload {
  identifier: string;
  password: string;
  captchaToken: string;
  captchaPosition: number;
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

async function readJsonStrict<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}${path}`, {
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    throw new AdminBffError('Admin BFF is unavailable.', 503);
  }

  if (!response.ok) {
    throw new AdminBffError(await responseErrorMessage(response, `Admin BFF request failed: ${path}`), response.status);
  }

  return (await response.json()) as T;
}

async function responseErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.clone().json()) as { message?: string | string[] };
    return Array.isArray(body.message) ? body.message[0] ?? fallback : body.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function fetchCurrentUser(): Promise<ConsoleUser | null> {
  return readJsonStrict<ConsoleUser | null>('/api/me');
}

export async function fetchCapabilities(): Promise<Capability[]> {
  return readJsonStrict<Capability[]>('/api/capabilities');
}

export async function fetchAiModels(includeInactive = true): Promise<AiModelRecord[]> {
  return readJsonStrict<AiModelRecord[]>(
    `/api/ai-gateway/models?includeInactive=${includeInactive ? 'true' : 'false'}`,
  );
}

export async function fetchAiModelGrants(filters: { tenantId?: string; modelId?: string } = {}): Promise<AiModelGrantRecord[]> {
  const params = new URLSearchParams();
  if (filters.tenantId) params.set('tenantId', filters.tenantId);
  if (filters.modelId) params.set('modelId', filters.modelId);

  return readJsonStrict<AiModelGrantRecord[]>(
    `/api/ai-gateway/grants${params.size ? `?${params.toString()}` : ''}`,
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
  return readJson<ProductReleaseRecord[]>('/api/products/releases', []);
}

export async function fetchProductSolutions(): Promise<ProductSolutionRecord[]> {
  return readJson<ProductSolutionRecord[]>('/api/products/solutions', []);
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
  return readJson<ProductAgentRecord[]>('/api/products/agents', []);
}

export async function fetchProductModelPolicies(): Promise<ProductModelPolicyRecord[]> {
  return readJson<ProductModelPolicyRecord[]>('/api/products/model-policies', []);
}

export async function fetchPlatformAdmins(): Promise<PlatformAdminRecord[]> {
  return readJsonStrict<PlatformAdminRecord[]>('/api/platform-admins');
}

export async function fetchTenantOperations(): Promise<TenantOperationRecord[]> {
  return readJson<TenantOperationRecord[]>('/api/tenants', []);
}

export async function fetchTenantOperationsStrict(): Promise<TenantOperationRecord[]> {
  return readJsonStrict<TenantOperationRecord[]>('/api/tenants');
}

export async function fetchSupportTicketsStrict(): Promise<SupportTicketRecord[]> {
  return readJsonStrict<SupportTicketRecord[]>('/api/tickets');
}

export async function fetchSubscriptionOperations(): Promise<SubscriptionOperationRecord[]> {
  return readJson<SubscriptionOperationRecord[]>('/api/subscriptions', []);
}

export async function fetchSubscriptionOperation(subscriptionId: string): Promise<SubscriptionOperationDetailRecord | null> {
  return readJson<SubscriptionOperationDetailRecord | null>(`/api/subscriptions/${encodeURIComponent(subscriptionId)}`, null);
}

export async function fetchOrderOperations(): Promise<OrderOperationRecord[]> {
  return readJson<OrderOperationRecord[]>('/api/orders', []);
}

export async function fetchOrderOperation(orderId: string): Promise<OrderOperationDetailRecord | null> {
  return readJson<OrderOperationDetailRecord | null>(`/api/orders/${encodeURIComponent(orderId)}`, null);
}

export async function fetchPaymentOperations(): Promise<PaymentOperationRecord[]> {
  return readJson<PaymentOperationRecord[]>('/api/payments', []);
}

export async function verifyPayment(paymentId: string, remark: string): Promise<PaymentOperationRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/payments/${encodeURIComponent(paymentId)}/verify`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remark }),
  });

  if (!response.ok) {
    let message = '核销操作失败';
    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message[0] ?? message : body.message ?? message;
    } catch { /* ignore */ }
    throw new AdminBffError(message, response.status);
  }

  return (await response.json()) as PaymentOperationRecord;
}

export async function rejectPayment(paymentId: string, remark: string): Promise<PaymentOperationRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/payments/${encodeURIComponent(paymentId)}/reject`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ remark }),
  });

  if (!response.ok) {
    let message = '驳回操作失败';
    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message[0] ?? message : body.message ?? message;
    } catch { /* ignore */ }
    throw new AdminBffError(message, response.status);
  }

  return (await response.json()) as PaymentOperationRecord;
}

export async function fetchUsageMeteringRecords(): Promise<UsageMeteringRecord[]> {
  return readJson<UsageMeteringRecord[]>('/api/commercial/usage-metering', []);
}

export async function fetchPromotionOperations(): Promise<PromotionOperationRecord[]> {
  return readJson<PromotionOperationRecord[]>('/api/commercial/promotions', []);
}

export async function fetchPromotionRedemptionRecords(): Promise<PromotionRedemptionRecord[]> {
  return readJson<PromotionRedemptionRecord[]>('/api/commercial/promotion-redemptions', []);
}

export async function fetchCommerceOverview(): Promise<CommerceOverviewSnapshot | null> {
  return readJson<CommerceOverviewSnapshot | null>('/api/commercial/overview', null);
}

export async function fetchPlatformGovernanceRecords(
  kind: PlatformGovernanceKind,
): Promise<PlatformGovernanceRecord[]> {
  return readJsonStrict<PlatformGovernanceRecord[]>(`/api/platform-governance/${encodeURIComponent(kind)}`);
}

export async function confirmOrderOfflinePayment(
  orderId: string,
  payload: {
    paidAmount: number;
    offlinePayType: OrderOfflinePaymentType;
    payerName: string;
    paidAt: string;
    transactionNo?: string | null;
    evidenceUrl?: string | null;
    reason: string;
  },
): Promise<OrderOperationDetailRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/orders/${encodeURIComponent(orderId)}/offline-payment-confirm`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Order offline payment confirmation failed';

    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message[0] ?? message : body.message ?? message;
    } catch {
      // Keep a typed error for non-JSON proxy responses.
    }

    throw new AdminBffError(message, response.status);
  }

  return (await response.json()) as OrderOperationDetailRecord;
}

export async function fetchBillingRecords(): Promise<BillingRecord[]> {
  return readJson<BillingRecord[]>('/api/billing', []);
}

export async function fetchBillingRecord(billId: string): Promise<BillingDetailRecord | null> {
  return readJson<BillingDetailRecord | null>(`/api/billing/${encodeURIComponent(billId)}`, null);
}

export async function fetchInvoiceLedgerRecords(): Promise<BillingInvoiceLedgerRecord[]> {
  return readJson<BillingInvoiceLedgerRecord[]>('/api/invoices', []);
}

export async function syncOfflineInvoice(
  billId: string,
  payload: {
    invoiceNo: string;
    invoiceType: BillingInvoiceType;
    invoiceTaxType: BillingInvoiceTaxType;
    invoiceTitle: string;
    taxNo?: string | null;
    invoiceAmount: number;
    taxAmount?: number | null;
    invoiceStatus: Extract<BillingInvoiceStatus, 'issued' | 'sending' | 'finished'>;
    statusRemark: string;
    invoiceCode?: string | null;
    invoiceElectronicNo?: string | null;
    invoiceFileUrl?: string | null;
    issuedAt: string;
    expressCompany?: string | null;
    expressNo?: string | null;
    sendAt?: string | null;
  },
): Promise<BillingDetailRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/billing/${encodeURIComponent(billId)}/offline-invoice-sync`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Offline invoice sync failed';

    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message[0] ?? message : body.message ?? message;
    } catch {
      // Keep a typed error for non-JSON proxy responses.
    }

    throw new AdminBffError(message, response.status);
  }

  return (await response.json()) as BillingDetailRecord;
}

export async function submitBillingInvoiceReceiptAction(
  billId: string,
  receiptId: string,
  payload: {
    action: BillingInvoiceReceiptAction;
    statusRemark: string;
    expressCompany?: string | null;
    expressNo?: string | null;
    sendAt?: string | null;
  },
): Promise<BillingDetailRecord> {
  const response = await fetch(
    `${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/billing/${encodeURIComponent(billId)}/invoice-receipts/${encodeURIComponent(receiptId)}/actions`,
    {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    let message = 'Billing invoice receipt action failed';

    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message[0] ?? message : body.message ?? message;
    } catch {
      // Keep a typed error for non-JSON proxy responses.
    }

    throw new AdminBffError(message, response.status);
  }

  return (await response.json()) as BillingDetailRecord;
}

export async function submitBillingBillAction(
  billId: string,
  payload: {
    action: BillingBillAction;
    reason: string;
    discountAmount?: number | null;
    amount?: number | null;
    itemName?: string | null;
    cycleStartDate?: string | null;
    cycleEndDate?: string | null;
  },
): Promise<BillingDetailRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/billing/${encodeURIComponent(billId)}/actions`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Billing bill action failed';

    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message[0] ?? message : body.message ?? message;
    } catch {
      // Keep a typed error for non-JSON proxy responses.
    }

    throw new AdminBffError(message, response.status);
  }

  return (await response.json()) as BillingDetailRecord;
}

export async function submitSubscriptionOperation(
  subscriptionId: string,
  payload: { action: SubscriptionOperationAction; reason: string },
): Promise<SubscriptionOperationDetailRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/subscriptions/${encodeURIComponent(subscriptionId)}/actions`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Subscription operation failed';

    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message[0] ?? message : body.message ?? message;
    } catch {
      // Preserve a useful typed error even when a proxy returns non-JSON.
    }

    throw new AdminBffError(message, response.status);
  }

  return (await response.json()) as SubscriptionOperationDetailRecord;
}

export async function fetchAccountOperations(): Promise<AccountOperationRecord[]> {
  return readJson<AccountOperationRecord[]>('/api/accounts', []);
}

export async function fetchPlatformRoles(): Promise<PlatformRoleRecord[]> {
  return readJsonStrict<PlatformRoleRecord[]>('/api/admin-roles');
}

export async function replacePlatformRolePermissions(roleId: string, permissionIds: string[]): Promise<PlatformRoleRecord> {
  const response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/admin-roles/${encodeURIComponent(roleId)}/permissions`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ permissionIds }),
  });

  if (!response.ok) {
    let message = 'Role authorization update failed';

    try {
      const body = (await response.json()) as { message?: string | string[] };
      message = Array.isArray(body.message) ? body.message[0] ?? message : body.message ?? message;
    } catch {
      // Preserve a typed error when the BFF returns a non-JSON response.
    }

    throw new AdminBffError(message, response.status);
  }

  return (await response.json()) as PlatformRoleRecord;
}

export async function fetchPlatformPermissions(): Promise<PlatformAdminPermissionRecord[]> {
  return readJsonStrict<PlatformAdminPermissionRecord[]>('/api/admin-permissions');
}

export async function fetchDevServices(signal?: AbortSignal): Promise<DevServiceSnapshot[]> {
  const response = await fetch(`/api/dev-services?ts=${Date.now()}`, {
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new AdminBffError('Dev services snapshot failed', response.status);
  }

  return (await response.json()) as DevServiceSnapshot[];
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
    return EMPTY_SESSION;
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

export async function getCaptchaChallenge(): Promise<CaptchaChallenge> {
  let response: Response;

  try {
    response = await fetch(`${DEFAULT_BFF_URL}${ADMIN_API_PREFIX}/api/auth/captcha/challenge`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    throw new AdminBffError('Admin BFF is unavailable.', 503);
  }

  if (!response.ok) {
    throw new AdminBffError('Failed to obtain captcha challenge.', response.status);
  }

  return (await response.json()) as CaptchaChallenge;
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

export async function fetchAuditLogs(): Promise<AuditLogRecord[]> {
  return readJson<AuditLogRecord[]>('/api/audit-logs', []);
}

export async function fetchAnnouncements(): Promise<AnnouncementRecord[]> {
  return readJson<AnnouncementRecord[]>('/api/announcements', []);
}

export async function fetchSkills(): Promise<SkillRecord[]> {
  return readJson<SkillRecord[]>('/api/skills', []);
}
