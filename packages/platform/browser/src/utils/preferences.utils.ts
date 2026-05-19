/**
 * Cross-portal user preference utilities
 * @package @vxture/platform-browser
 */

import {
  DEFAULT_LOCALE,
  LOCALE_CONSTANTS,
  PREFERENCE_CONSTANTS,
  THEME_CONSTANTS,
  type Locale,
  type Theme,
} from "@vxture/shared";

export type DensityPreference = "compact" | "default" | "comfortable";

export interface GlobalUserPreferences {
  locale: Locale;
  theme: Theme;
  density: DensityPreference;
}

const DEFAULT_PREFERENCES: GlobalUserPreferences = {
  locale: DEFAULT_LOCALE,
  theme: THEME_CONSTANTS.DEFAULT_THEME,
  density: "default",
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function readCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;

  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length);
}

function writeCookie(name: string, value: string): void {
  if (!isBrowser()) return;

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${PREFERENCE_CONSTANTS.COOKIE_MAX_AGE}; samesite=lax`;
}

function dispatchPreferenceSync(preferences: GlobalUserPreferences): void {
  if (!isBrowser()) return;

  const payload = JSON.stringify({
    ...preferences,
    updatedAt: Date.now(),
  });

  window.localStorage.setItem(PREFERENCE_CONSTANTS.SYNC_STORAGE_KEY, payload);
  window.dispatchEvent(
    new CustomEvent(PREFERENCE_CONSTANTS.SYNC_EVENT, { detail: preferences }),
  );
}

function normalizeTheme(theme: string | null | undefined): Theme {
  if (theme === "light" || theme === "dark" || theme === "system") {
    return theme;
  }
  return DEFAULT_PREFERENCES.theme;
}

function normalizeLocale(locale: string | null | undefined): Locale {
  if (locale === "zh-CN" || locale === "en-US") {
    return locale;
  }
  return DEFAULT_PREFERENCES.locale;
}

function normalizeDensity(
  density: string | null | undefined,
): DensityPreference {
  if (
    density === "compact" ||
    density === "default" ||
    density === "comfortable"
  ) {
    return density;
  }
  return DEFAULT_PREFERENCES.density;
}

export function getGlobalUserPreferences(): GlobalUserPreferences {
  if (!isBrowser()) {
    return DEFAULT_PREFERENCES;
  }

  const locale = normalizeLocale(
    window.localStorage.getItem(LOCALE_CONSTANTS.STORAGE_KEY) ??
      readCookie(LOCALE_CONSTANTS.COOKIE_KEY),
  );

  const theme = normalizeTheme(
    window.localStorage.getItem(THEME_CONSTANTS.STORAGE_KEY) ??
      window.localStorage.getItem("theme") ??
      readCookie(THEME_CONSTANTS.COOKIE_KEY),
  );

  const density = normalizeDensity(
    window.localStorage.getItem(PREFERENCE_CONSTANTS.DENSITY_STORAGE_KEY) ??
      readCookie(PREFERENCE_CONSTANTS.DENSITY_COOKIE_KEY),
  );

  return { locale, theme, density };
}

export function setGlobalUserPreferences(
  partial: Partial<GlobalUserPreferences>,
): GlobalUserPreferences {
  if (!isBrowser()) {
    return { ...DEFAULT_PREFERENCES, ...partial };
  }

  const nextPreferences: GlobalUserPreferences = {
    ...getGlobalUserPreferences(),
    ...partial,
  };

  window.localStorage.setItem(
    LOCALE_CONSTANTS.STORAGE_KEY,
    nextPreferences.locale,
  );
  window.localStorage.setItem(
    THEME_CONSTANTS.STORAGE_KEY,
    nextPreferences.theme,
  );
  window.localStorage.setItem(
    PREFERENCE_CONSTANTS.DENSITY_STORAGE_KEY,
    nextPreferences.density,
  );

  writeCookie(LOCALE_CONSTANTS.COOKIE_KEY, nextPreferences.locale);
  writeCookie(THEME_CONSTANTS.COOKIE_KEY, nextPreferences.theme);
  writeCookie(PREFERENCE_CONSTANTS.DENSITY_COOKIE_KEY, nextPreferences.density);

  dispatchPreferenceSync(nextPreferences);
  return nextPreferences;
}

export function setGlobalLocalePreference(
  locale: Locale,
): GlobalUserPreferences {
  return setGlobalUserPreferences({ locale });
}

export function setGlobalThemePreference(theme: Theme): GlobalUserPreferences {
  return setGlobalUserPreferences({ theme });
}

export function setGlobalDensityPreference(
  density: DensityPreference,
): GlobalUserPreferences {
  return setGlobalUserPreferences({ density });
}

export function subscribeToGlobalPreferenceChanges(
  listener: (preferences: GlobalUserPreferences) => void,
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (
      event.key !== PREFERENCE_CONSTANTS.SYNC_STORAGE_KEY ||
      !event.newValue
    ) {
      return;
    }

    try {
      const parsed = JSON.parse(
        event.newValue,
      ) as Partial<GlobalUserPreferences>;
      listener({
        locale: normalizeLocale(parsed.locale),
        theme: normalizeTheme(parsed.theme),
        density: normalizeDensity(parsed.density),
      });
    } catch {
      // ignore malformed payload
    }
  };

  const onCustomEvent = (event: Event) => {
    const detail = (event as CustomEvent<GlobalUserPreferences>).detail;
    if (!detail) return;
    listener(detail);
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(
    PREFERENCE_CONSTANTS.SYNC_EVENT,
    onCustomEvent as EventListener,
  );

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(
      PREFERENCE_CONSTANTS.SYNC_EVENT,
      onCustomEvent as EventListener,
    );
  };
}
