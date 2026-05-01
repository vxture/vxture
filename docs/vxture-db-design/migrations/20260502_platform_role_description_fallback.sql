update platform.platform_role
set description = case role_code
  when 'PLATFORM_ARCHITECT'
    then 'Owns platform architecture, global configuration, and high-risk authorization boundaries.'
  when 'SECURITY_GOVERNANCE_OFFICER'
    then 'Owns security governance, audit review, and control policy oversight.'
  when 'SYSTEM_OPERATIONS_CONTROLLER'
    then 'Owns runtime operations, service reliability, and system control actions.'
  when 'TENANT_OPERATIONS_MANAGER'
    then 'Owns tenant lifecycle operations, account governance, and business-side handling.'
  when 'SUPPORT_RESPONSE_OFFICER'
    then 'Owns support response, ticket handling, and customer-facing issue coordination.'
  when 'OBSERVER'
    then 'Read-only role for beta, demo, review, and observation scenarios.'
  else description
end
where role_code in (
  'PLATFORM_ARCHITECT',
  'SECURITY_GOVERNANCE_OFFICER',
  'SYSTEM_OPERATIONS_CONTROLLER',
  'TENANT_OPERATIONS_MANAGER',
  'SUPPORT_RESPONSE_OFFICER',
  'OBSERVER'
);

comment on column platform.platform_role.description is
  '角色默认 fallback 描述，不存储 i18n key；UI 优先使用 description_i18n_key。';
