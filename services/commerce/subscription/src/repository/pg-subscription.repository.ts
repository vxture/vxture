import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { COMMERCE_PG_POOL } from '../tokens';
import type {
  SubscriptionRecord,
  SubscriptionHistoryRecord,
  ListSubscriptionsParams,
  ListSubscriptionsResult,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '../types/subscription.types';

interface SubscriptionRow {
  id: string;
  tenant_id: string;
  plan_id: string;
  cycle_type: string;
  start_at: Date;
  end_at: Date | null;
  trial_end_at: Date | null;
  status: string;
  auto_renew: boolean;
  order_no: string | null;
  pay_amount: string | null;
  currency: string;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

interface HistoryRow {
  id: string;
  tenant_id: string;
  subscription_id: string;
  change_type: string;
  from_plan_id: string | null;
  to_plan_id: string | null;
  from_status: string | null;
  to_status: string | null;
  operator_type: string;
  operator_id: string | null;
  operator_remark: string | null;
  client_ip: string | null;
  created_at: Date;
}

@Injectable()
export class PgSubscriptionRepository {
  constructor(@Inject(COMMERCE_PG_POOL) private readonly pool: Pool) {}

  async listSubscriptions(params: ListSubscriptionsParams): Promise<ListSubscriptionsResult> {
    const conditions: string[] = ['deleted_at is null'];
    const values: unknown[] = [];
    let idx = 1;

    if (params.tenantId) { conditions.push(`tenant_id = $${idx++}`); values.push(params.tenantId); }
    if (params.planId) { conditions.push(`plan_id = $${idx++}`); values.push(params.planId); }
    if (params.status) { conditions.push(`status = $${idx++}`); values.push(params.status); }
    if (params.cycleType) { conditions.push(`cycle_type = $${idx++}`); values.push(params.cycleType); }

    const where = conditions.join(' and ');
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const [countResult, rowsResult] = await Promise.all([
      this.pool.query<{ count: string }>(
        `select count(*) as count from commerce.tenant_subscription where ${where}`,
        values,
      ),
      this.pool.query<SubscriptionRow>(
        `select * from commerce.tenant_subscription where ${where}
         order by created_at desc limit $${idx} offset $${idx + 1}`,
        [...values, pageSize, offset],
      ),
    ]);

    return {
      total: parseInt(countResult.rows[0]?.count ?? '0', 10),
      items: rowsResult.rows.map(this.mapSubscription),
    };
  }

  async getById(id: string): Promise<SubscriptionRecord | null> {
    const result = await this.pool.query<SubscriptionRow>(
      `select * from commerce.tenant_subscription where id = $1 and deleted_at is null limit 1`,
      [id],
    );
    const row = result.rows[0];
    return row ? this.mapSubscription(row) : null;
  }

  async getActiveByTenantId(tenantId: string): Promise<SubscriptionRecord | null> {
    const result = await this.pool.query<SubscriptionRow>(
      `select * from commerce.tenant_subscription
       where tenant_id = $1 and status = 'active' and deleted_at is null
       order by created_at desc limit 1`,
      [tenantId],
    );
    const row = result.rows[0];
    return row ? this.mapSubscription(row) : null;
  }

  async create(input: CreateSubscriptionInput): Promise<SubscriptionRecord> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const result = await client.query<SubscriptionRow>(
        `insert into commerce.tenant_subscription (
          tenant_id, plan_id, cycle_type, start_at, end_at, trial_end_at,
          status, auto_renew, order_no, pay_amount, currency,
          created_by, created_at, updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10, $11, now(), now()
        ) returning *`,
        [
          input.tenantId,
          input.planId,
          input.cycleType,
          input.startAt,
          input.endAt ?? null,
          input.trialEndAt ?? null,
          input.autoRenew ?? true,
          input.orderNo ?? null,
          input.payAmount ?? null,
          input.currency ?? 'CNY',
          input.createdBy,
        ],
      );

      const subscription = result.rows[0]!;

      await client.query(
        `insert into commerce.tenant_subscription_history (
          tenant_id, subscription_id, change_type,
          to_plan_id, to_status, operator_type, operator_id, created_at
        ) values ($1, $2, 'created', $3, 'active', 'user', $4, now())`,
        [input.tenantId, subscription.id, input.planId, input.createdBy],
      );

      await client.query('commit');
      return this.mapSubscription(subscription);
    } catch (err) {
      await client.query('rollback');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id: string, subscription: SubscriptionRecord, input: UpdateSubscriptionInput): Promise<SubscriptionRecord | null> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');

      const result = await client.query<SubscriptionRow>(
        `update commerce.tenant_subscription set
          status     = coalesce($2, status),
          end_at     = coalesce($3, end_at),
          auto_renew = coalesce($4, auto_renew),
          plan_id    = coalesce($5, plan_id),
          updated_by = $6,
          updated_at = now()
         where id = $1 and deleted_at is null
         returning *`,
        [
          id,
          input.status ?? null,
          input.endAt ?? null,
          input.autoRenew ?? null,
          input.toPlanId ?? null,
          input.updatedBy ?? null,
        ],
      );

      const updated = result.rows[0];
      if (!updated) {
        await client.query('rollback');
        return null;
      }

      const changeType = input.toPlanId ? 'plan_changed'
        : input.status === 'cancelled' ? 'cancelled'
        : input.status === 'paused' ? 'paused'
        : input.status === 'active' ? 'resumed'
        : 'updated';

      await client.query(
        `insert into commerce.tenant_subscription_history (
          tenant_id, subscription_id, change_type,
          from_plan_id, to_plan_id, from_status, to_status,
          operator_type, operator_id, operator_remark, client_ip, created_at
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())`,
        [
          subscription.tenantId,
          id,
          changeType,
          subscription.planId,
          input.toPlanId ?? subscription.planId,
          subscription.status,
          input.status ?? subscription.status,
          input.operatorType ?? 'operator',
          input.operatorId ?? null,
          input.operatorRemark ?? null,
          input.clientIp ?? null,
        ],
      );

      await client.query('commit');
      return this.mapSubscription(updated);
    } catch (err) {
      await client.query('rollback');
      throw err;
    } finally {
      client.release();
    }
  }

  async getHistory(subscriptionId: string): Promise<SubscriptionHistoryRecord[]> {
    const result = await this.pool.query<HistoryRow>(
      `select * from commerce.tenant_subscription_history
       where subscription_id = $1
       order by created_at desc`,
      [subscriptionId],
    );
    return result.rows.map(this.mapHistory);
  }

  private mapSubscription(row: SubscriptionRow): SubscriptionRecord {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      planId: row.plan_id,
      cycleType: row.cycle_type,
      startAt: row.start_at,
      endAt: row.end_at,
      trialEndAt: row.trial_end_at,
      status: row.status,
      autoRenew: row.auto_renew,
      orderNo: row.order_no,
      payAmount: row.pay_amount,
      currency: row.currency,
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }

  private mapHistory(row: HistoryRow): SubscriptionHistoryRecord {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      subscriptionId: row.subscription_id,
      changeType: row.change_type,
      fromPlanId: row.from_plan_id,
      toPlanId: row.to_plan_id,
      fromStatus: row.from_status,
      toStatus: row.to_status,
      operatorType: row.operator_type,
      operatorId: row.operator_id,
      operatorRemark: row.operator_remark,
      clientIp: row.client_ip,
      createdAt: row.created_at,
    };
  }
}
