alter table platform.platform_role
  add column if not exists status_code varchar(32) not null default 'active';

update platform.platform_role
set status_code = case
  when status = true then 'active'
  else 'disabled'
end
where status_code is null
   or status_code not in ('active', 'disabled', 'archived');

update platform.platform_role
set status_code = 'disabled'
where status = false
  and status_code = 'active';

alter table platform.platform_role
  drop constraint if exists ck_platform_role_status_code;

alter table platform.platform_role
  add constraint ck_platform_role_status_code
  check (status_code in ('active', 'disabled', 'archived'));

create index if not exists idx_platform_role_status_code
  on platform.platform_role(status_code);

comment on column platform.platform_role.status_code is
  '平台角色状态：active=启用，disabled=停用，archived=归档';
