/**
 * platform.schema.ts - Cross-service URLs and cookie domain schema
 * @package @vxture/core-config
 * @description
 *   Defines base URLs for each platform surface and cookie domain config.
 *   All fields have local-development defaults so services start without
 *   explicit config during local development.
 */

import { z } from "zod";

// ============================================================================
// Platform Schema
// ============================================================================

export const platformSchema = z.object({
  /** Website (marketing / end-user) base URL */
  WEBSITE_BASE_URL: z.string().url().default("http://localhost:3000"),
  /** Console (tenant admin) base URL */
  CONSOLE_BASE_URL: z.string().url().default("http://localhost:3001"),
  /** Admin (platform ops) base URL */
  ADMIN_BASE_URL: z.string().url().default("http://localhost:3002"),
  /** AI Gateway internal base URL */
  AI_GATEWAY_URL: z.string().url().default("http://localhost:3100"),
  /** Auth BFF internal base URL (used by proxy BFFs to delegate auth operations) */
  AUTH_BFF_URL: z.string().url().default("http://localhost:3090"),
  /** Vela agent-server internal base URL (used by vela-bff to proxy chat/confirm) */
  VELA_SERVER_INTERNAL_URL: z.string().url().default("http://localhost:3122"),
  /** Ruyin product surface base URL (used for post-SSO redirects) */
  RUYIN_BASE_URL: z.string().url().default("http://localhost:3080"),
  /**
   * Cookie domain shared across platform surfaces (website / console / admin).
   * Omit for localhost development (browser ignores explicit localhost domain).
   * Example production value: ".vxture.com"
   */
  COOKIE_DOMAIN_PLATFORM: z.string().min(1).optional(),
  /**
   * Cookie domain for the Ruyin agent product surface.
   * Omit for localhost development.
   */
  COOKIE_DOMAIN_RUYIN: z.string().min(1).optional(),
});

export type PlatformConfig = z.infer<typeof platformSchema>;
