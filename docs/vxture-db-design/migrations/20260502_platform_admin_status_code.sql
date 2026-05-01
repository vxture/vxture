alter table platform.platform_admin
  add column if not exists status_code varchar(32) not null default 'active';

update platform.platform_admin
set status_code = case
  when status = true then 'active'
  else 'disabled'
end
where status_code is null
   or status_code not in ('active', 'disabled', 'locked', 'pending', 'suspended');

update platform.platform_admin
set status_code = 'disabled'
where status = false
  and status_code = 'active';

alter table platform.platform_admin
  drop constraint if exists ck_platform_admin_status_code;

alter table platform.platform_admin
  add constraint ck_platform_admin_status_code
  check (status_code in ('active', 'disabled', 'locked', 'pending', 'suspended'));

create index if not exists idx_platform_admin_status_code
  on platform.platform_admin(status_code);

comment on column platform.platform_admin.status_code is
  '平台用户状态：active=启用，disabled=停用，locked=锁定，pending=待激活，suspended=暂停';
