'use client';

import Link from 'next/link';
import { useTheme, Icon } from '@vxture/design-system';
import { Avatar, AvatarFallback, Input } from '@/components/ui/primitives';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { useConsoleLocale, useConsoleTranslations } from '@/lib/console-intl';
import { getGlobalUserPreferences, setGlobalLocalePreference, setGlobalThemePreference } from '@vxture/platform-browser';
import type { Locale, Theme } from '@vxture/shared';

export function Header({
  assistantEnabled,
  assistantOpen,
  onToggleAssistant,
}: {
  assistantEnabled: boolean;
  assistantOpen: boolean;
  onToggleAssistant: () => void;
}) {
  const { session } = useConsoleSession();
  const locale = useConsoleLocale();
  const { theme, setTheme } = useTheme();
  const t = useConsoleTranslations('header');
  const currentTheme = (theme ?? getGlobalUserPreferences().theme) as Theme;
  const nextTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  const nextLocale: Locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
  const themeIconName = currentTheme === 'dark' ? 'moon' : 'sun';
  const userDisplayName = session.user?.displayName ?? session.user?.name ?? session.user?.username ?? 'User';
  const userFallback = userDisplayName.slice(0, 2).toUpperCase();
  const assistantLabel = assistantOpen ? t('closeAssistant') : t('openAssistant');

  return (
    <header className="vx-shell-header">
      <div className="vx-shell-header__brand">
        <div className="vx-shell-header__brand-mark" aria-hidden="true">V</div>

        <div className="vx-shell-header__brand-copy">
          <strong className="vx-shell-header__brand-title">{t('title')}</strong>
        </div>
      </div>

      <label className="vx-shell-header__search-shell" aria-label={t('searchPlaceholder')}>
        <span className="vx-shell-header__search-icon" aria-hidden="true">
          <Icon name="search" size="sm" fallback="search" />
        </span>
        <Input
          className="vx-shell-header__search-input"
          placeholder={t('searchPlaceholder')}
        />
      </label>

      <div className="vx-shell-header__actions">
        <button
          type="button"
          className="vx-shell-icon-button vx-shell-icon-button--toolbar"
          aria-label={t('toggleTheme')}
          title={t('toggleTheme')}
          onClick={() => {
            setTheme(nextTheme);
            setGlobalThemePreference(nextTheme);
          }}
        >
          <Icon name={themeIconName} size="sm" fallback="sun" />
        </button>

        <button
          type="button"
          className="vx-shell-icon-button vx-shell-icon-button--toolbar"
          aria-label={t('toggleLanguage')}
          title={t('toggleLanguage')}
          onClick={() => {
            setGlobalLocalePreference(nextLocale);
          }}
        >
          <Icon name="globe" size="sm" fallback="globe" />
        </button>

        <button
          type="button"
          className="vx-shell-icon-button vx-shell-icon-button--toolbar"
          aria-label={t('notifications')}
          title={t('notifications')}
        >
          <Icon name="mail" size="sm" fallback="mail" />
        </button>

        <Link
          href="/settings"
          className="vx-shell-icon-button vx-shell-icon-button--toolbar"
          aria-label={t('settings')}
          title={t('settings')}
        >
          <Icon name="settings" size="sm" fallback="settings" />
        </Link>

        {assistantEnabled ? (
          <button
            type="button"
            className={`vx-shell-icon-button vx-shell-icon-button--assistant ${assistantOpen ? 'vx-shell-icon-button--active' : ''}`}
            aria-pressed={assistantOpen}
            aria-expanded={assistantOpen}
            aria-controls="vx-assistant-panel"
            aria-label={assistantLabel}
            title={assistantLabel}
            onClick={onToggleAssistant}
          >
            <Icon name="sparkles" size="sm" fallback="sparkles" />
          </button>
        ) : null}

        <button type="button" className="vx-shell-user" aria-label={userDisplayName} title={userDisplayName}>
          <Avatar>
            <AvatarFallback>{userFallback}</AvatarFallback>
          </Avatar>
          <span className="vx-shell-user__name">{userDisplayName}</span>
        </button>
      </div>
    </header>
  );
}
