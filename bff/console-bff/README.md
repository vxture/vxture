# Console BFF

MVP scaffold for the unified `console` application.

## Exposed routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/me`
- `GET /api/capabilities`
- `GET /api/tenant-context`
- `GET /api/iam/summary`
- `GET /api/subscription/overview`

## Notes

- Password login is wired through `AccountAuthService` and can authenticate against the IAM database when database config is present.
- Console session cookies now use platform-scoped names so the auth contract is not console-private.
- Tenant context resolves from organization membership; when no tenant membership exists, the console falls back to a platform workspace context.
