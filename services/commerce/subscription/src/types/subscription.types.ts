export enum BillingCycle {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  YEARLY = "yearly",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  TRIALING = "trialing",
  PAUSED = "paused",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export interface SubscriptionRecord {
  id: string;
  tenantId: string;
  planId: string;
  cycleType: string;
  startAt: Date;
  endAt: Date | null;
  trialEndAt: Date | null;
  status: string;
  autoRenew: boolean;
  orderNo: string | null;
  payAmount: string | null;
  currency: string;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SubscriptionHistoryRecord {
  id: string;
  tenantId: string;
  subscriptionId: string;
  changeType: string;
  fromPlanId: string | null;
  toPlanId: string | null;
  fromStatus: string | null;
  toStatus: string | null;
  operatorType: string;
  operatorId: string | null;
  operatorRemark: string | null;
  clientIp: string | null;
  createdAt: Date;
}

export interface ListSubscriptionsParams {
  tenantId?: string;
  planId?: string;
  status?: string;
  cycleType?: string;
  page?: number;
  pageSize?: number;
}

export interface ListSubscriptionsResult {
  items: SubscriptionRecord[];
  total: number;
}

export interface CreateSubscriptionInput {
  tenantId: string;
  planId: string;
  cycleType: string;
  startAt: Date;
  endAt?: Date;
  trialEndAt?: Date;
  autoRenew?: boolean;
  orderNo?: string;
  payAmount?: number;
  currency?: string;
  createdBy: string;
}

export interface UpdateSubscriptionInput {
  status?: string;
  endAt?: Date;
  autoRenew?: boolean;
  toPlanId?: string;
  operatorType?: string;
  operatorId?: string;
  operatorRemark?: string;
  clientIp?: string;
  updatedBy?: string;
}
