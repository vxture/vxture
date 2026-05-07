'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme, Icon } from '@vxture/design-system';
import { Input } from '@/components/ui/primitives';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { usePortalEntry } from '@/contexts/PortalEntryContext';
import { UserPanel } from './UserPanel';
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
  const { portalEntry } = usePortalEntry();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [launcherOpen, setLauncherOpen] = useState(false);
  const launcherRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('header');
  const currentTheme = (theme ?? getGlobalUserPreferences().theme) as Theme;
  const nextTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  const nextLocale: Locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
  const themeIconName = currentTheme === 'dark' ? 'moon' : 'sun';
  const tenantLabel = session.tenant?.workspace ?? session.tenant?.name;
  const assistantLabel = assistantOpen ? t('closeAssistant') : t('openAssistant');

  useEffect(() => {
    if (!launcherOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!launcherRef.current?.contains(event.target as Node)) {
        setLauncherOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLauncherOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [launcherOpen]);

  return (
    <header className="vx-shell-header">
      <div className="vx-shell-header__left">
        <div className="vx-shell-launcher" ref={launcherRef}>
          <button
            type="button"
            className="vx-shell-icon-button vx-shell-icon-button--launcher"
            aria-label={t('featureOverview')}
            aria-haspopup="dialog"
            aria-expanded={launcherOpen}
            onClick={() => setLauncherOpen((open) => !open)}
          >
            <Icon name="app-grid" size="lg" fallback="placeholder" />
          </button>

          {launcherOpen ? (
            <div className="vx-shell-launcher__panel" role="dialog" aria-label={t('featureOverview')}>
              <Icon name="app-grid" size="xl" fallback="placeholder" className="vx-shell-launcher__placeholder" />
            </div>
          ) : null}
        </div>

        {/* Way 1：有跨 Portal 上下文时，logo 链接指向来源 Portal */}
        {portalEntry ? (
          <a
            href={portalEntry.returnTo}
            className="vx-shell-header__brand vx-shell-header__brand--portal"
            aria-label={`返回 ${portalEntry.caller}`}
            title={`返回 ${portalEntry.caller}`}
          >
            <Image
              className="vx-shell-header__brand-logo"
              src="/brand/vxture-logo-white.png"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              priority
            />
            <strong className="vx-shell-header__brand-title">vxture.ai</strong>
          </a>
        ) : (
          <Link href="/" className="vx-shell-header__brand" aria-label="vxture.ai">
            <Image
              className="vx-shell-header__brand-logo"
              src="/brand/vxture-logo-white.png"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              priority
            />
            <strong className="vx-shell-header__brand-title">vxture.ai</strong>
          </Link>
        )}

        <span className="vx-shell-header__divider" aria-hidden="true">|</span>
        <strong className="vx-shell-header__workspace-label">{t('workspace')}</strong>
        {tenantLabel ? <span className="vx-shell-header__context" title={tenantLabel}>{tenantLabel}</span> : null}
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
          className={`vx-shell-agent-button ${assistantOpen ? 'vx-shell-agent-button--active' : ''}`}
          aria-pressed={assistantEnabled ? assistantOpen : undefined}
          aria-expanded={assistantEnabled ? assistantOpen : undefined}
          aria-controls="vx-assistant-panel"
          aria-label={assistantLabel}
          title={assistantLabel}
          onClick={onToggleAssistant}
        >
          <Image
            className="vx-shell-agent-button__icon"
            src="/assets/ai/ai-agent-icon-32.gif"
            alt=""
            aria-hidden="true"
            width={32}
            height={32}
            unoptimized
          />
        </button>

        <div className="vx-shell-header__action-group" role="group" aria-label={t('quickPreferences')}>
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
              router.replace(pathname, { locale: nextLocale });
            }}
          >
            <Icon name="globe" size="sm" fallback="globe" />
          </button>
        </div>

        <div className="vx-shell-header__action-group" role="group" aria-label={t('workspaceActions')}>
          <button
            type="button"
            className="vx-shell-icon-button vx-shell-icon-button--toolbar"
            aria-label={t('help')}
            title={t('help')}
          >
            <Icon name="help" size="sm" fallback="placeholder" />
          </button>

          <button
            type="button"
            className="vx-shell-icon-button vx-shell-icon-button--toolbar"
            aria-label={t('notifications')}
            title={t('notifications')}
          >
            <Icon name="bell" size="sm" fallback="placeholder" />
          </button>

          <Link
            href="/settings"
            className="vx-shell-icon-button vx-shell-icon-button--toolbar"
            aria-label={t('settings')}
            title={t('settings')}
          >
            <Icon name="settings" size="sm" fallback="settings" />
          </Link>
        </div>

        {/* Way 2：头像弹出面板，含返回来源 Portal 区块 */}
        <UserPanel />
      </div>
    </header>
  );
}
