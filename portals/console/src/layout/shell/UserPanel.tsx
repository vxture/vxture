'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ShellPreferencePanel,
  ShellUserMenu,
  useTheme,
  type Density,
  type ShellThemePreference,
} from '@vxture/design-system';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { usePortalEntry } from '@/contexts/PortalEntryContext';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import {
  getGlobalUserPreferences,
  setGlobalDensityPreference,
  setGlobalLocalePreference,
  setGlobalThemePreference,
} from '@vxture/platform-browser';
import type { Locale, Theme } from '@vxture/shared';

function isDensity(value: unknown): value is Density {
  return value === 'compact' || value === 'default' || value === 'comfortable';
}

function isTheme(value: unknown): value is ShellThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function QuickSettings() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const { theme, setTheme, density, setDensity } = useTheme();

  const initialPrefs = useMemo(() => getGlobalUserPreferences(), []);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale);
  const [selectedTheme, setSelectedTheme] = useState<ShellThemePreference>(
    isTheme(theme) ? theme : isTheme(initialPrefs.theme) ? initialPrefs.theme : 'system',
  );
  const [selectedDensity, setSelectedDensity] = useState<Density>(
    isDensity(density) ? density : isDensity(initialPrefs.density) ? initialPrefs.density : 'default',
  );

  useEffect(() => {
    setSelectedLocale(currentLocale);
  }, [currentLocale]);

  const handleLocaleChange = (nextLocale: Locale) => {
    setSelectedLocale(nextLocale);
    setGlobalLocalePreference(nextLocale);
    router.replace(pathname, { locale: nextLocale });
  };

  const handleThemeChange = (nextTheme: ShellThemePreference) => {
    setSelectedTheme(nextTheme);
    setTheme(nextTheme);
    setGlobalThemePreference(nextTheme as Theme);
  };

  const handleDensityChange = (nextDensity: Density) => {
    setSelectedDensity(nextDensity);
    setDensity(nextDensity);
    setGlobalDensityPreference(nextDensity);
  };

  return (
    <ShellPreferencePanel
      locale={selectedLocale}
      theme={selectedTheme}
      density={selectedDensity}
      showFontSize={false}
      onLocaleChange={handleLocaleChange}
      onThemeChange={handleThemeChange}
      onDensityChange={handleDensityChange}
    />
  );
}

export function UserPanel() {
  const { session, signOut } = useConsoleSession();
  const { portalEntry, dismiss } = usePortalEntry();
  const t = useTranslations('header.userMenu');
  const user = session.user;

  if (!user) return null;

  const displayName = (user.displayName || user.name || user.username || 'User').trim();
  const uniqueLine = user.email || user.phone || user.id;
  const tenantLabel = session.tenant?.workspace ?? session.tenant?.name;

  return (
    <ShellUserMenu
      user={{
        displayName,
        uniqueLine,
        meta: tenantLabel,
        avatarFallback: displayName.slice(0, 2).toUpperCase(),
        badges: user.roleLabel ? [{ key: 'role', label: user.roleLabel }] : undefined,
      }}
      openLabel={displayName}
      portalReturn={portalEntry ? {
        label: t('returnTo', { caller: portalEntry.caller }),
        dismissLabel: t('dismissReturn'),
        onReturn: () => { window.location.href = portalEntry.returnTo; },
        onDismiss: dismiss,
      } : undefined}
      settings={<QuickSettings />}
      actions={[
        { key: 'sign-out', label: t('signOut'), icon: 'sign-out', onClick: signOut },
      ]}
      triggerClassName="vx-shell-user"
      statusClassName="dark:border-vx-gray-900"
    />
  );
}
