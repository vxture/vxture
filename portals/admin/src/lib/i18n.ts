import { DEFAULT_LOCALE, type Locale } from '@vxture/shared';

export function normalizeConsoleLocale(locale: string | undefined): Locale {
  return locale === 'en-US' || locale === 'zh-CN' ? locale : DEFAULT_LOCALE;
}

export async function loadConsoleMessages(locale: Locale): Promise<Record<string, unknown>> {
  switch (locale) {
    case 'en-US':
      return (await import('@/../messages/en-US.json')).default as Record<string, unknown>;
    case 'zh-CN':
    default:
      return (await import('@/../messages/zh-CN.json')).default as Record<string, unknown>;
  }
}
