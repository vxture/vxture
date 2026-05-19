/**
 * preference.constants.ts - Cross-frontend preference constants
 * @package @vxture/shared
 * @description Shared keys for synchronizing user preferences across frontend portals.
 */

export const PREFERENCE_CONSTANTS = {
  /** localStorage key used to broadcast the latest full preference snapshot */
  SYNC_STORAGE_KEY: "vx-user-preferences",

  /** Custom DOM event used for same-document preference updates */
  SYNC_EVENT: "vx:user-preferences",

  /** Cookie key used for density persistence across portals */
  DENSITY_COOKIE_KEY: "vx-density",

  /** localStorage key used for density persistence across portals */
  DENSITY_STORAGE_KEY: "vx-density",

  /** 1 year cookie max-age */
  COOKIE_MAX_AGE: 60 * 60 * 24 * 365,
} as const;
