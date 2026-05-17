-- ═══════════════════════════════════════════════════════════════
-- Migration: 20260518_drop_tsq_tenant_id_unique
-- Drops the unique constraint on commerce.tenant_subscription_quota.tenant_id.
--
-- Background:
--   The column was declared @unique in the Prisma proxy schema, which caused
--   Prisma to generate constraint "tenant_subscription_quota_tenant_id_key".
--   The constraint is wrong: the table is designed for time-series quota records
--   (one row per effective window per tenant), and findCurrentSubscriptionQuota
--   already queries with effectiveAt / expiresAt + orderBy effectiveAt DESC
--   to select the current record from potentially many per tenant.
--
-- After this migration a tenant can have multiple quota rows (e.g., plan
-- upgrades create a new row; the old row expires). The existing regular index
-- idx_tsq_tenant_id remains and is sufficient for query performance.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE "commerce"."tenant_subscription_quota"
  DROP CONSTRAINT IF EXISTS "tenant_subscription_quota_tenant_id_key";
