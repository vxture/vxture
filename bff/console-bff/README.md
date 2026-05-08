# Console BFF

MVP scaffold for the unified `console` application.

## Exposed routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/tenant/switch`
- `GET /api/auth/session`
- `GET /api/me`
- `GET /api/capabilities`
- `GET /api/tenant-context`
- `GET /api/iam/summary`
- `GET /api/subscription/overview`

## Notes

- Password login and tenant switching are delegated to auth-bff; console-bff verifies JWT only.
- Console session cookies now use platform-scoped names so the auth contract is not console-private.
- Tenant context is selected by the signed console token. Console APIs must not accept `tenantId` query parameters for tenant-scoped reads or writes.
