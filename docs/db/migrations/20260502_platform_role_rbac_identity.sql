alter table platform.platform_role
  add column if not exists name_i18n_key varchar(128),
  add column if not exists name_en varchar(128),
  add column if not exists description_i18n_key varchar(128);

update platform.platform_role
set
  role_code = case lower(role_code)
    when 'super_admin' then 'PLATFORM_ARCHITECT'
    when 'audit_admin' then 'SECURITY_GOVERNANCE_OFFICER'
    when 'config_admin' then 'SYSTEM_OPERATIONS_CONTROLLER'
    when 'tenant_admin' then 'TENANT_OPERATIONS_MANAGER'
    when 'helpdesk_admin' then 'SUPPORT_RESPONSE_OFFICER'
    when 'readonly_admin' then 'OBSERVER'
    else role_code
  end,
  name_i18n_key = case lower(role_code)
    when 'super_admin' then 'role.platform_architect'
    when 'platform_architect' then 'role.platform_architect'
    when 'audit_admin' then 'role.security_governance_officer'
    when 'security_governance_officer' then 'role.security_governance_officer'
    when 'config_admin' then 'role.system_operations_controller'
    when 'system_operations_controller' then 'role.system_operations_controller'
    when 'tenant_admin' then 'role.tenant_operations_manager'
    when 'tenant_operations_manager' then 'role.tenant_operations_manager'
    when 'helpdesk_admin' then 'role.support_response_officer'
    when 'support_response_officer' then 'role.support_response_officer'
    when 'readonly_admin' then 'role.observer'
    when 'observer' then 'role.observer'
    else coalesce(name_i18n_key, concat('role.', lower(role_code)))
  end,
  name_en = case lower(role_code)
    when 'super_admin' then 'Platform Architect'
    when 'platform_architect' then 'Platform Architect'
    when 'audit_admin' then 'Security Governance Officer'
    when 'security_governance_officer' then 'Security Governance Officer'
    when 'config_admin' then 'System Operations Controller'
    when 'system_operations_controller' then 'System Operations Controller'
    when 'tenant_admin' then 'Tenant Operations Manager'
    when 'tenant_operations_manager' then 'Tenant Operations Manager'
    when 'helpdesk_admin' then 'Support Response Officer'
    when 'support_response_officer' then 'Support Response Officer'
    when 'readonly_admin' then 'Observer'
    when 'observer' then 'Observer'
    else coalesce(name_en, role_code)
  end,
  description_i18n_key = coalesce(
    description_i18n_key,
    case lower(role_code)
      when 'super_admin' then 'role.description.platform_architect'
      when 'platform_architect' then 'role.description.platform_architect'
      when 'audit_admin' then 'role.description.security_governance_officer'
      when 'security_governance_officer' then 'role.description.security_governance_officer'
      when 'config_admin' then 'role.description.system_operations_controller'
      when 'system_operations_controller' then 'role.description.system_operations_controller'
      when 'tenant_admin' then 'role.description.tenant_operations_manager'
      when 'tenant_operations_manager' then 'role.description.tenant_operations_manager'
      when 'helpdesk_admin' then 'role.description.support_response_officer'
      when 'support_response_officer' then 'role.description.support_response_officer'
      when 'readonly_admin' then 'role.description.observer'
      when 'observer' then 'role.description.observer'
      else null
    end
  );

alter table platform.platform_role
  alter column name_i18n_key set not null,
  alter column name_en set not null;

alter table platform.platform_role
  drop column if exists role_name;

create index if not exists idx_platform_role_name_i18n_key
  on platform.platform_role(name_i18n_key);

drop trigger if exists trg_platform_permission_after_insert on platform.platform_permission;
drop trigger if exists trg_platform_permission_after_delete on platform.platform_permission;
drop trigger if exists trg_sync_super_admin_perm_insert on platform.platform_permission;
drop trigger if exists trg_sync_super_admin_perm_delete on platform.platform_permission;
drop trigger if exists trg_sync_platform_architect_perm_insert on platform.platform_permission;
drop trigger if exists trg_sync_platform_architect_perm_delete on platform.platform_permission;

drop function if exists platform.sync_super_admin_perm();

create or replace function platform.sync_platform_architect_perm()
returns trigger as $$
declare
    platform_architect_id uuid;
begin
    select id
    into platform_architect_id
    from platform.platform_role
    where role_code = 'PLATFORM_ARCHITECT'
    limit 1;

    if platform_architect_id is null then
        return coalesce(new, old);
    end if;

    if tg_op = 'INSERT' then
        insert into platform.platform_role_permission (role_id, permission_id)
        values (platform_architect_id, new.id)
        on conflict (role_id, permission_id) do nothing;
    elsif tg_op = 'DELETE' then
        delete from platform.platform_role_permission
        where permission_id = old.id;
    end if;

    return coalesce(new, old);
end;
$$ language plpgsql;

create trigger trg_sync_platform_architect_perm_insert
after insert on platform.platform_permission
for each row
execute procedure platform.sync_platform_architect_perm();

create trigger trg_sync_platform_architect_perm_delete
after delete on platform.platform_permission
for each row
execute procedure platform.sync_platform_architect_perm();

comment on column platform.platform_role.role_code is '固定 RBAC 角色 code：PLATFORM_ARCHITECT | SECURITY_GOVERNANCE_OFFICER | SYSTEM_OPERATIONS_CONTROLLER | TENANT_OPERATIONS_MANAGER | SUPPORT_RESPONSE_OFFICER | OBSERVER';
comment on column platform.platform_role.name_i18n_key is '角色名称国际化 key，UI 主展示入口';
comment on column platform.platform_role.name_en is '角色英文 fallback 名称';
comment on column platform.platform_role.description_i18n_key is '角色描述国际化 key，可为空';
