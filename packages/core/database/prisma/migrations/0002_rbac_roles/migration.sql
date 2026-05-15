-- Migration: 0002_rbac_roles
-- Create PostgreSQL service roles and grant per-schema access.
--
-- 密码管理：生产环境通过 Docker Secrets / K8s Secrets 注入。
--   部署前执行：ALTER ROLE identity_svc PASSWORD 'your-secret';
--   禁止将真实密码写入此文件或任何代码仓库。
--
-- 执行方式：pnpm --filter @vxture/core-database migrate:deploy
--   (使用 vxture 超级用户连接，此账号仅用于 migration，不用于应用)

-- ── 工具函数：幂等创建角色 ─────────────────────────────────────────────────

-- identity-service: identity + iam schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'identity_svc') THEN
    CREATE ROLE identity_svc LOGIN PASSWORD 'REPLACE_ME_identity_svc';
  END IF;
END
$$;

-- tenant-service: tenant schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'tenant_svc') THEN
    CREATE ROLE tenant_svc LOGIN PASSWORD 'REPLACE_ME_tenant_svc';
  END IF;
END
$$;

-- commerce-service: commerce schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'commerce_svc') THEN
    CREATE ROLE commerce_svc LOGIN PASSWORD 'REPLACE_ME_commerce_svc';
  END IF;
END
$$;

-- product-service: product schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'product_svc') THEN
    CREATE ROLE product_svc LOGIN PASSWORD 'REPLACE_ME_product_svc';
  END IF;
END
$$;

-- model-service: model schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'model_svc') THEN
    CREATE ROLE model_svc LOGIN PASSWORD 'REPLACE_ME_model_svc';
  END IF;
END
$$;

-- ops-service: ops schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ops_svc') THEN
    CREATE ROLE ops_svc LOGIN PASSWORD 'REPLACE_ME_ops_svc';
  END IF;
END
$$;

-- support-service: support schema
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'support_svc') THEN
    CREATE ROLE support_svc LOGIN PASSWORD 'REPLACE_ME_support_svc';
  END IF;
END
$$;

-- reporting_ro: admin-bff 跨 schema 报表只读
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'reporting_ro') THEN
    CREATE ROLE reporting_ro LOGIN PASSWORD 'REPLACE_ME_reporting_ro';
  END IF;
END
$$;

-- ── GRANT: identity-service ───────────────────────────────────────────────

GRANT USAGE ON SCHEMA identity, iam TO identity_svc;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA identity, iam TO identity_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO identity_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA iam
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO identity_svc;

-- ── GRANT: tenant-service ─────────────────────────────────────────────────

GRANT USAGE ON SCHEMA tenant TO tenant_svc;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA tenant TO tenant_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tenant_svc;

-- ── GRANT: commerce-service ───────────────────────────────────────────────

GRANT USAGE ON SCHEMA commerce TO commerce_svc;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA commerce TO commerce_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA commerce
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO commerce_svc;

-- ── GRANT: product-service ────────────────────────────────────────────────

GRANT USAGE ON SCHEMA product TO product_svc;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA product TO product_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA product
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO product_svc;

-- ── GRANT: model-service ──────────────────────────────────────────────────

GRANT USAGE ON SCHEMA model TO model_svc;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA model TO model_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA model
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO model_svc;

-- ── GRANT: ops-service ────────────────────────────────────────────────────

GRANT USAGE ON SCHEMA ops TO ops_svc;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA ops TO ops_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA ops
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ops_svc;

-- ── GRANT: support-service ────────────────────────────────────────────────

GRANT USAGE ON SCHEMA support TO support_svc;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA support TO support_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA support
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO support_svc;

-- ── GRANT: reporting_ro（只读，所有 schema）────────────────────────────────

GRANT USAGE ON SCHEMA
  identity, iam, tenant, commerce, product, model, ops, support
  TO reporting_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA
  identity TO reporting_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA
  iam TO reporting_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA
  tenant TO reporting_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA
  commerce TO reporting_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA
  product TO reporting_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA
  model TO reporting_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA
  ops TO reporting_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA
  support TO reporting_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity
  GRANT SELECT ON TABLES TO reporting_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA iam
  GRANT SELECT ON TABLES TO reporting_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA tenant
  GRANT SELECT ON TABLES TO reporting_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA commerce
  GRANT SELECT ON TABLES TO reporting_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA product
  GRANT SELECT ON TABLES TO reporting_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA model
  GRANT SELECT ON TABLES TO reporting_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA ops
  GRANT SELECT ON TABLES TO reporting_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA support
  GRANT SELECT ON TABLES TO reporting_ro;
