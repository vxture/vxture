'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Icon, useTheme } from '@vxture/design-system';
import { getGlobalUserPreferences, setGlobalLocalePreference, setGlobalThemePreference } from '@vxture/platform-browser';
import type { Locale, Theme } from '@vxture/shared';
import { Avatar, AvatarFallback } from '@/components/ui/primitives';
import { adminNavigationSections } from '@/config/navigation';
import { AdminSessionProvider, useAdminSession } from '@/features/session/AdminSessionProvider';
import { useConsoleLocale, useConsoleTranslations } from '@/lib/console-intl';
import { AssistantPanel } from './AssistantPanel';

const ADMIN_SIDEBAR_KEY = 'vx-admin-sidebar-collapsed';
const ADMIN_NAV_SECTION_KEY = 'vx-admin-nav-collapsed-sections';
const ADMIN_ASSISTANT_KEY = 'vx-admin-assistant-open';
const ADMIN_ASSISTANT_WIDTH_KEY = 'vx-admin-assistant-width';
const ASSISTANT_MIN_WIDTH = 380;
const ASSISTANT_DEFAULT_WIDTH = 420;
const ASSISTANT_MAX_WIDTH = 720;
const CONTENT_MIN_WIDTH = 360;
const ADMIN_SIDEBAR_WIDTH = 320;
const ADMIN_SIDEBAR_COLLAPSED_WIDTH = 64;
const ADMIN_HORIZONTAL_RESERVE = 32;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getAssistantMaxWidth(sidebarCollapsed: boolean) {
  if (typeof window === 'undefined') {
    return ASSISTANT_DEFAULT_WIDTH;
  }

  const sidebarWidth = sidebarCollapsed ? ADMIN_SIDEBAR_COLLAPSED_WIDTH : ADMIN_SIDEBAR_WIDTH;
  const availableWidth = window.innerWidth - sidebarWidth - CONTENT_MIN_WIDTH - ADMIN_HORIZONTAL_RESERVE;
  return clamp(availableWidth, ASSISTANT_MIN_WIDTH, ASSISTANT_MAX_WIDTH);
}

function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function readCollapsedSections() {
  if (typeof window === 'undefined') {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_NAV_SECTION_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    return new Set<string>();
  }
}

function ShellFrame({ children }: { children: ReactNode }) {
  const { session, status, signOut } = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useConsoleLocale();
  const { theme, setTheme } = useTheme();
  const loadingT = useConsoleTranslations('shell.loading');
  const headerT = useConsoleTranslations('header');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set());
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantWidth, setAssistantWidth] = useState(ASSISTANT_DEFAULT_WIDTH);

  const activeItem = adminNavigationSections
    .flatMap((section) => section.items)
    .find((item) => isActivePath(pathname, item.href));
  const currentTheme = (theme ?? getGlobalUserPreferences().theme) as Theme;
  const nextTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  const nextLocale: Locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
  const themeIconName = currentTheme === 'dark' ? 'moon' : 'sun';
  const userDisplayName = session.user?.displayName || session.user?.username || session.user?.name || 'Admin';
  const userFallback = userDisplayName.slice(0, 2).toUpperCase();
  const assistantLabel = assistantOpen ? headerT('closeAssistant') : headerT('openAssistant');

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem(ADMIN_SIDEBAR_KEY) === 'true');
    setCollapsedSections(readCollapsedSections());
    const savedAssistant = window.localStorage.getItem(ADMIN_ASSISTANT_KEY);
    setAssistantOpen(savedAssistant ? savedAssistant === 'true' : true);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_ASSISTANT_WIDTH_KEY);
    const parsed = saved ? Number(saved) : NaN;
    const nextWidth = Number.isFinite(parsed) ? parsed : ASSISTANT_DEFAULT_WIDTH;
    const maxWidth = getAssistantMaxWidth(sidebarCollapsed);
    setAssistantWidth(clamp(nextWidth, ASSISTANT_MIN_WIDTH, maxWidth));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = getAssistantMaxWidth(sidebarCollapsed);
      setAssistantWidth((current) => {
        const next = clamp(current, ASSISTANT_MIN_WIDTH, maxWidth);
        window.localStorage.setItem(ADMIN_ASSISTANT_WIDTH_KEY, String(next));
        return next;
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (status === 'ready' && (!session.isAuthenticated || !session.user)) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, session.isAuthenticated, session.user, status]);

  function handleToggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(ADMIN_SIDEBAR_KEY, String(next));
      return next;
    });
  }

  function handleToggleNavSection(sectionTitle: string) {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (next.has(sectionTitle)) {
        next.delete(sectionTitle);
      } else {
        next.add(sectionTitle);
      }
      window.localStorage.setItem(ADMIN_NAV_SECTION_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function handleSignOut() {
    void signOut().then(() => router.replace('/login'));
  }

  function handleToggleAssistant() {
    setAssistantOpen((current) => {
      const next = !current;
      window.localStorage.setItem(ADMIN_ASSISTANT_KEY, String(next));
      return next;
    });
  }

  function handleAssistantWidthChange(width: number) {
    const maxWidth = getAssistantMaxWidth(sidebarCollapsed);
    const next = clamp(width, ASSISTANT_MIN_WIDTH, maxWidth);
    setAssistantWidth(next);
    window.localStorage.setItem(ADMIN_ASSISTANT_WIDTH_KEY, String(next));
  }

  if (status !== 'ready') {
    return (
      <div className="console-loading">
        <div className="console-loading__card">
          <p className="eyebrow">{loadingT('eyebrow')}</p>
          <h1>{loadingT('title')}</h1>
          <p>{loadingT('description')}</p>
        </div>
      </div>
    );
  }

  if (!session.isAuthenticated || !session.user) {
    return null;
  }

  const shellClassName = [
    'admin-shell',
    sidebarCollapsed ? 'admin-shell--nav-collapsed' : '',
    assistantOpen ? 'admin-shell--assistant-open' : '',
  ].filter(Boolean).join(' ');
  const shellStyle = {
    '--vx-shell-assistant-width': `${assistantWidth}px`,
  } as CSSProperties;

  return (
    <div className={shellClassName} style={shellStyle}>
      <header className="admin-shell__header">
        <div className="admin-shell-header__left">
          <button type="button" className="admin-shell-icon-button admin-shell-icon-button--launcher" aria-label={headerT('appLauncher')} title={headerT('appLauncher')}>
            <Icon name="app-grid" size="lg" fallback="placeholder" />
          </button>
          <Link className="admin-shell-header__brand" href="/" aria-label="Vxture Admin 首页">
            <Image
              className="admin-shell-header__brand-logo"
              src="/brand/vxture-logo-white.png"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              priority
            />
            <strong>vxture.ai</strong>
          </Link>
          <span className="admin-shell-header__divider" aria-hidden="true" />
          <strong className="admin-shell-header__workspace">Admin</strong>
          <span className="admin-shell-header__context">{activeItem?.label ?? '平台运营'}</span>
        </div>

        <div className="admin-shell-header__actions">
          <button
            type="button"
            className={`vx-shell-agent-button ${assistantOpen ? 'vx-shell-agent-button--active' : ''}`}
            aria-pressed={assistantOpen}
            aria-expanded={assistantOpen}
            aria-controls="vx-assistant-panel"
            aria-label={assistantLabel}
            title={assistantLabel}
            onClick={handleToggleAssistant}
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

          <div className="admin-shell-header__action-group" role="group" aria-label={headerT('quickPreferences')}>
            <button
              type="button"
              className="admin-shell-icon-button admin-shell-icon-button--toolbar"
              aria-label={headerT('toggleTheme')}
              title={headerT('toggleTheme')}
              onClick={() => {
                setTheme(nextTheme);
                setGlobalThemePreference(nextTheme);
              }}
            >
              <Icon name={themeIconName} size="sm" fallback="sun" />
            </button>
            <button
              type="button"
              className="admin-shell-icon-button admin-shell-icon-button--toolbar"
              aria-label={headerT('toggleLanguage')}
              title={headerT('toggleLanguage')}
              onClick={() => setGlobalLocalePreference(nextLocale)}
            >
              <Icon name="globe" size="sm" fallback="globe" />
            </button>
          </div>

          <div className="admin-shell-header__action-group" role="group" aria-label={headerT('workspaceActions')}>
            <button type="button" className="admin-shell-icon-button admin-shell-icon-button--toolbar" aria-label={headerT('help')} title={headerT('help')}>
              <Icon name="help" size="sm" fallback="placeholder" />
            </button>
            <button type="button" className="admin-shell-icon-button admin-shell-icon-button--toolbar" aria-label={headerT('notifications')} title={headerT('notifications')}>
              <Icon name="bell" size="sm" fallback="placeholder" />
            </button>
            <button type="button" className="admin-shell-icon-button admin-shell-icon-button--toolbar" aria-label={headerT('settings')} title={headerT('settings')}>
              <Icon name="settings" size="sm" fallback="settings" />
            </button>
          </div>

          <button type="button" className="admin-shell-user" aria-label={userDisplayName} title={userDisplayName}>
            <Avatar>
              <AvatarFallback>{userFallback}</AvatarFallback>
            </Avatar>
          </button>
          <button type="button" className="admin-shell-icon-button admin-shell-icon-button--toolbar" aria-label="退出登录" title="退出登录" onClick={handleSignOut}>
            <Icon name="sign-out" size="sm" fallback="placeholder" />
          </button>
        </div>
      </header>

      <div className="admin-shell__body">
        <aside id="vx-admin-sidebar" className="admin-shell-sidebar" aria-label="平台运营导航">
          <div className="admin-shell-sidebar__top">
            <div className="admin-shell-sidebar__title">
              <span>Vxture Admin</span>
              <strong>平台运营</strong>
            </div>
            <button
              type="button"
              className="admin-shell-icon-button admin-shell-icon-button--rail"
              aria-label={sidebarCollapsed ? headerT('openNavigation') : headerT('collapseNavigation')}
              aria-expanded={!sidebarCollapsed}
              aria-controls="vx-admin-sidebar"
              title={sidebarCollapsed ? headerT('openNavigation') : headerT('collapseNavigation')}
              onClick={handleToggleSidebar}
            >
              <span className="admin-shell-sidebar__toggle-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>

          <nav className="admin-shell-nav">
            {adminNavigationSections.map((section) => {
              const sectionCollapsed = collapsedSections.has(section.title);
              const sectionActive = section.items.some((item) => isActivePath(pathname, item.href));

              return (
                <section
                  key={section.title}
                  className={[
                    'admin-shell-nav__section',
                    sectionCollapsed ? 'admin-shell-nav__section--collapsed' : '',
                    sectionActive ? 'admin-shell-nav__section--active' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <button
                    type="button"
                    className="admin-shell-nav__section-trigger"
                    aria-expanded={!sectionCollapsed}
                    title={section.title}
                    onClick={() => handleToggleNavSection(section.title)}
                  >
                    <span className="admin-shell-nav__title">{section.title}</span>
                    <Icon name={sectionCollapsed ? 'chevron-right' : 'chevron-down'} size="xs" fallback="chevron-down" />
                  </button>
                  {!sectionCollapsed ? (
                    <div className="admin-shell-nav__items">
                      {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const className = [
                      'admin-shell-nav__item',
                      active ? 'admin-shell-nav__item--active' : '',
                      item.disabled ? 'admin-shell-nav__item--disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    const content = (
                      <>
                        <Icon name={item.icon} size={24} fallback="placeholder" />
                        <span>
                          <strong>{item.label}</strong>
                        </span>
                      </>
                    );

                    return item.disabled ? (
                      <span key={item.href} className={className} title={item.label}>
                        {content}
                      </span>
                    ) : (
                      <Link key={item.href} className={className} href={item.href} title={item.label}>
                        {content}
                      </Link>
                    );
                      })}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </nav>

          <div className="admin-shell-sidebar__footer" aria-hidden="true" />
        </aside>

        <main className="admin-content" aria-label="Admin content">
          <section className="admin-content__core">{children}</section>
          <section className="admin-content__visual-space" aria-hidden="true" />
        </main>

        <AssistantPanel
          id="vx-assistant-panel"
          routeLabel={activeItem?.label ?? '平台运营'}
          open={assistantOpen}
          maxWidth={getAssistantMaxWidth(sidebarCollapsed)}
          minWidth={ASSISTANT_MIN_WIDTH}
          onWidthChange={handleAssistantWidthChange}
          onClose={handleToggleAssistant}
        />
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminSessionProvider>
      <ShellFrame>{children}</ShellFrame>
    </AdminSessionProvider>
  );
}
