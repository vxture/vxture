import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { LOCALE_CONSTANTS, PREFERENCE_CONSTANTS, THEME_CONSTANTS, type Locale, type Theme } from '@vxture/shared';
import type { Density } from '@vxture/design-system';
import { ConsoleAppProviders } from '@/providers/ConsoleAppProviders';
import { loadConsoleMessageCatalog, loadConsoleMessages, normalizeConsoleLocale } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vxture Admin',
  description: 'Platform operations portal for Vxture supply-side capabilities.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const locale = normalizeConsoleLocale(cookieStore.get(LOCALE_CONSTANTS.COOKIE_KEY)?.value) as Locale;
  const initialTheme = (cookieStore.get(THEME_CONSTANTS.COOKIE_KEY)?.value ?? THEME_CONSTANTS.DEFAULT_THEME) as Theme;
  const densityCookie = cookieStore.get(PREFERENCE_CONSTANTS.DENSITY_COOKIE_KEY)?.value;
  const initialDensity: Density =
    densityCookie === 'compact' || densityCookie === 'comfortable' ? densityCookie : 'default';
  const messages = await loadConsoleMessages(locale);
  const messageCatalog = await loadConsoleMessageCatalog();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ConsoleAppProviders
          initialLocale={locale}
          initialMessages={messages}
          initialMessageCatalog={messageCatalog}
          initialTheme={initialTheme}
          initialDensity={initialDensity}
        >
          {children}
        </ConsoleAppProviders>
      </body>
    </html>
  );
}
