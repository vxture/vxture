UPDATE ai_gateway.ai_model_grant
SET reason = CASE
  WHEN reason = 'Admin tenant test seed default lite model.' THEN 'Tenant default online lite model grant.'
  WHEN reason = 'Admin tenant test seed console assistant pro model.' THEN 'Console assistant pro model grant.'
  WHEN reason = 'Admin tenant test seed enterprise reasoning model.' THEN 'Tenant enterprise reasoning model grant.'
  ELSE reason
END,
updated_at = now()
WHERE reason IN (
  'Admin tenant test seed default lite model.',
  'Admin tenant test seed console assistant pro model.',
  'Admin tenant test seed enterprise reasoning model.'
);
