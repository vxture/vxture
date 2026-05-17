/**
 * seed.mjs — 平台初始数据种子脚本
 *
 * 写入内容：
 *   ops schema   — 角色 × 2（role_system / super_admin）
 *                  管理员 × 2（system / superadmin）
 *   identity schema — zhangsan 租户账号（Account + Credential + Profile）
 *   tenant schema   — zhangsan 租户 + 成员关系
 *
 * 所有插入幂等（ON CONFLICT DO NOTHING），重复执行安全。
 *
 * 用法：
 *   DATABASE_URL="postgresql://..." node packages/core/database/prisma/seed.mjs
 *   或直接：
 *   pnpm --filter @vxture/core-database db:seed
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── 读取 DATABASE_URL ──────────────────────────────────────────────────────────

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // 向上查找 .env.local（最多 4 层）
  const __dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const candidate = resolve(__dir, '../'.repeat(i), '.env.local');
    try {
      const content = readFileSync(candidate, 'utf-8');
      const match = content.match(/^DATABASE_URL=(.+)$/m);
      if (match) return match[1].trim();
    } catch {
      // 文件不存在，继续
    }
  }
  throw new Error('DATABASE_URL not found. Set it in environment or .env.local');
}

// ── 动态加载 pg（pnpm 虚拟存储路径）────────────────────────────────────────────

async function loadPg() {
  const { createRequire } = await import('node:module');
  const req = createRequire(import.meta.url);

  // 1. 尝试正常解析（项目本地 node_modules 有 pg 时）
  try { return req('pg'); } catch { /* fall through */ }

  // 2. pnpm 虚拟存储兜底：从 repo root 向上找
  const { resolve } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
  const pgPath = resolve(repoRoot, 'node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js');

  try { return req(pgPath); } catch { /* fall through */ }

  throw new Error(`Cannot find pg. Tried: ${pgPath}`);
}

// ── 固定 UUID（保证幂等性） ────────────────────────────────────────────────────

const ID = {
  roleSystem:        '00000000-0000-4000-a000-000000000001',
  roleSuperAdmin:    '00000000-0000-4000-a000-000000000002',
  adminSystem:       '00000000-0000-4000-a000-000000000010',
  adminSuperAdmin:   '00000000-0000-4000-a000-000000000011',
  accountZhangsan:   '00000000-0000-4000-a000-000000000100',
  tenantZhangsan:    '00000000-0000-4000-a000-000000000200',
  memberZhangsan:    '00000000-0000-4000-a000-000000000300',
};

// bcrypt hashes（cost=10，与应用一致）
// system 账户: 状态 'system'，不参与登录，hash 为随机占位
// superadmin:  密码 Admin@2026
// zhangsan:    密码 Zhangsan@2026
const HASH = {
  system:      '$2b$10$xuVJddVLjlmjlUD9pB3qY.X1Qf6026KrQCGjccgKaqBiNG6kwfAze',
  superAdmin:  '$2b$10$IUFSFUnNvbXZCrmCiSrRq.i.li3n2QkOXoZv.w8VHLPHsbIPtX3Bu',
  zhangsan:    '$2b$10$EOqOXAIHLEoODVvDWmhnHepwmIvF86svjsNn6yJy2A6thtbqB6Isu',
};

// ── Seed 函数 ──────────────────────────────────────────────────────────────────

async function seed(client) {

  // ── 1. ops.role ──────────────────────────────────────────────────────────────

  await client.query(`
    insert into ops.role
      (id, role_code, status, name_en, name_i18n_key, description, is_system, sort)
    values
      ($1, 'sys_config',   'active', 'System Config', 'ops.role.sys_config',
       'Platform self-governance config meta-role, used as createdBy for system-init data.',
       true, 0),
      ($2, 'super_admin',  'active', 'Super Admin',   'ops.role.super_admin',
       'Platform built-in super admin with all permissions.',
       true, 1)
    on conflict (role_code) do nothing
  `, [ID.roleSystem, ID.roleSuperAdmin]);

  console.log('✓  ops.role — sys_config, super_admin');

  // ── 2. ops.admin ─────────────────────────────────────────────────────────────

  // 先查角色 id（可能 ON CONFLICT 触发，已有数据的 id 不是上面的 fixed id）
  const roleRes = await client.query(`
    select id, role_code from ops.role
    where role_code in ('sys_config', 'super_admin') and status = 'active'
  `);
  const roleMap = Object.fromEntries(roleRes.rows.map(r => [r.role_code, r.id]));

  const sysRoleId        = roleMap['sys_config']  ?? ID.roleSystem;
  const superAdminRoleId = roleMap['super_admin'] ?? ID.roleSuperAdmin;

  await client.query(`
    insert into ops.admin
      (id, role_id, username, display_name, status, password_hash, is_system,
       remark, sort, created_at, updated_at)
    values
      ($1, $3, 'system',     'system',      'system', $5, true,
       'Platform meta account. Auto-initializes base and demo data. Never logs in via UI.',
       0, now(), now()),
      ($2, $4, 'superadmin', 'super admin', 'active', $6, true,
       'Built-in super admin. Has all platform permissions.',
       1, now(), now())
    on conflict (username) do nothing
  `, [
    ID.adminSystem, ID.adminSuperAdmin,
    sysRoleId, superAdminRoleId,
    HASH.system, HASH.superAdmin,
  ]);

  console.log('✓  ops.admin — system (status=system), superadmin (status=active, pwd=Admin@2026)');

  // ── 3. identity.account — zhangsan ──────────────────────────────────────────

  await client.query(`
    insert into identity.account
      (id, username, email, status, account_source, created_at, updated_at)
    values
      ($1, 'zhangsan', 'zhangsan@vxture.dev', 'active', 'web', now(), now())
    on conflict (username) do nothing
  `, [ID.accountZhangsan]);

  await client.query(`
    insert into identity.account_credential
      (account_id, password_hash, created_at, updated_at)
    values
      ($1, $2, now(), now())
    on conflict (account_id) do nothing
  `, [ID.accountZhangsan, HASH.zhangsan]);

  await client.query(`
    insert into identity.account_profile
      (account_id, display_name, language, timezone, created_at, updated_at)
    values
      ($1, 'Zhang San', 'zh-CN', 'Asia/Shanghai', now(), now())
    on conflict (account_id) do nothing
  `, [ID.accountZhangsan]);

  console.log('✓  identity — account/credential/profile for zhangsan (pwd=Zhangsan@2026)');

  // ── 4. tenant.tenant — zhangsan ──────────────────────────────────────────────

  await client.query(`
    insert into tenant.tenant
      (id, tenant_code, tenant_type, tenant_name, display_name, status,
       region, language, time_zone, owner_account_id,
       is_trial, created_by, created_at, updated_at)
    values
      ($1, 'zhangsan', 'individual', 'Zhang San', 'Zhang San', 'active',
       'cn-hangzhou', 'zh-CN', 'Asia/Shanghai', $2,
       false, $2, now(), now())
    on conflict (tenant_code) do nothing
  `, [ID.tenantZhangsan, ID.accountZhangsan]);

  // ── 5. tenant.tenant_member ───────────────────────────────────────────────────

  // 查 tenant 实际 id（可能已存在且 id 不同）
  const tenantRes = await client.query(
    `select id from tenant.tenant where tenant_code = 'zhangsan' and deleted_at is null limit 1`
  );
  const actualTenantId = tenantRes.rows[0]?.id ?? ID.tenantZhangsan;

  await client.query(`
    insert into tenant.tenant_member
      (id, tenant_id, account_id, role, status,
       joined_source, is_primary_owner, joined_at, created_by, created_at, updated_at)
    values
      ($1, $2, $3, 'owner', 'active',
       'created', true, now(), $3, now(), now())
    on conflict (tenant_id, account_id) do nothing
  `, [ID.memberZhangsan, actualTenantId, ID.accountZhangsan]);

  console.log('✓  tenant — tenant/member for zhangsan');
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const databaseUrl = loadDatabaseUrl();
  const pg = await loadPg();
  const { Client } = pg.default ?? pg;

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  console.log(`\nConnected to: ${databaseUrl.replace(/:([^:@]+)@/, ':***@')}\n`);

  try {
    await client.query('BEGIN');
    await seed(client);
    await client.query('COMMIT');
    console.log('\n✓  Seed completed successfully.\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n✗  Seed failed, rolled back.\n', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
