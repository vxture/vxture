'use client';

import { startTransition, useEffect, useState } from 'react';
import { ThemeProvider } from '@vxture/design-system';
import type { Locale, Theme } from '@vxture/shared';
import type { Density } from '@vxture/design-system';
import { loadConsoleMessages, normalizeConsoleLocale } from '@/lib/i18n';
import { ConsoleIntlProvider } from '@/lib/console-intl';
import { getGlobalUserPreferences, subscribeToGlobalPreferenceChanges } from '@vxture/platform-browser';

type Props = {
  children: React.ReactNode;
  initialLocale: Locale;
  initialMessages: Record<string, unknown>;
  initialTheme: Theme;
  initialDensity: Density;
};

export function ConsoleAppProviders({
  children,
  initialLocale,
  initialMessages,
  initialTheme,
  initialDensity,
}: Props) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Record<string, unknown>>(initialMessages);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const syncLocale = async (nextLocale: Locale) => {
      const normalized = normalizeConsoleLocale(nextLocale);
      const nextMessages = await loadConsoleMessages(normalized);
      startTransition(() => {
        setLocale(normalized);
        setMessages(nextMessages);
      });
    };

    const current = getGlobalUserPreferences();
    if (current.locale !== initialLocale) {
      void syncLocale(current.locale);
    }

    return subscribeToGlobalPreferenceChanges((preferences) => {
      if (preferences.locale !== locale) {
        void syncLocale(preferences.locale);
      }
    });
  }, [initialLocale, locale]);

  return (
    <ThemeProvider defaultTheme={initialTheme} defaultDensity={initialDensity}>
      <ConsoleIntlProvider locale={locale} messages={messages}>
        {children}
      </ConsoleIntlProvider>
    </ThemeProvider>
  );
}
