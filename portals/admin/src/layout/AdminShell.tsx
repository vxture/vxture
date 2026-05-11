'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Icon,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ShellFullscreenToggle,
  ShellIconButton,
  ShellLocaleSwitcher,
  ShellPreferencePanel,
  ShellThemeToggle,
  ShellUserMenu,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useTheme,
} from '@vxture/design-system';
import type { Density, IconName, ShellFontSizePreference, ShellThemePreference } from '@vxture/design-system';
import {
  getGlobalUserPreferences,
  setGlobalDensityPreference,
  setGlobalLocalePreference,
  setGlobalThemePreference,
} from '@vxture/platform-browser';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale, type Theme } from '@vxture/shared';
import {
  adminWorkspaces,
  getAdminNavigationItemByPath,
  getAdminWorkspaceByPath,
} from '@/config/navigation';
import type { ConsoleUser } from '@/entities/console';
import { AdminSessionProvider, useAdminSession } from '@/features/session/AdminSessionProvider';
import { useConsoleLocale, useConsoleTranslations } from '@/lib/console-intl';

const ADMIN_SIDEBAR_KEY = 'vx-admin-sidebar-collapsed';
const ADMIN_NAV_SECTION_KEY = 'vx-admin-nav-collapsed-sections';
const PAGE_FULLSCREEN_ID = 'admin-page-root-native';
const ADMIN_SIDEBAR_ANIMATION_MS = 420;
const ADMIN_SIDEBAR_TEXT_REVEAL_MS = 140;
const ADMIN_SIDEBAR_AUTO_COLLAPSE_QUERY = '(max-width: 1360px)';
const DEFAULT_AVATAR_SRC = '/assets/icon/avatar-default.png';
const FONT_SIZE_PREFERENCE_KEY = 'vxture-font-size-preference';

function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function readCollapsedSections(storageKey: string) {
  if (typeof window === 'undefined') {
    return new Set<string>();
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    return new Set<string>();
  }
}

function getTranslatedLabel(t: ReturnType<typeof useConsoleTranslations>, key: string, fallback: string): string {
  const translated = t(key);
  return translated === `navigation.${key}` ? fallback : translated;
}

function getDisplayName(user: ConsoleUser, fallback: string): string {
  return user.displayName?.trim() || user.username?.trim() || user.name?.trim() || fallback;
}

function getUniqueLine(user: ConsoleUser): string {
  return user.phone?.trim() || user.email?.trim() || user.id;
}

function isThemePreference(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark';
}

function isDensity(value: unknown): value is Density {
  return value === 'compact' || value === 'default' || value === 'comfortable';
}

function isFontSizePreference(value: unknown): value is ShellFontSizePreference {
  return value === 'small' || value === 'default' || value === 'large';
}

function getStoredFontSizePreference(): ShellFontSizePreference {
  if (typeof window === 'undefined') {
    return 'default';
  }

  const stored = window.localStorage.getItem(FONT_SIZE_PREFERENCE_KEY);
  return isFontSizePreference(stored) ? stored : 'default';
}

function applyFontSizePreference(value: ShellFontSizePreference) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.remove('vx-font-small', 'vx-font-default', 'vx-font-large');
  document.documentElement.classList.add(`vx-font-${value}`);
  document.documentElement.dataset.vxFontSize = value;
}

function getRoleLabel(user: ConsoleUser, t: ReturnType<typeof useConsoleTranslations>): string {
  const roleI18nKey = user.roleI18nKey?.trim() || user.roleLabel?.trim();
  const fallback = user.roleNameEn?.trim() || user.roleLabel?.trim() || 'Platform Architect';
  return roleI18nKey ? t(roleI18nKey, fallback) : fallback;
}

function SidebarTooltip({
  label,
  children,
  enabled = true,
}: {
  label: string;
  children: ReactNode;
  enabled?: boolean;
}) {
  if (!enabled) {
    return children;
  }

  return (
    <Tooltip delayDuration={240}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" align="center" sideOffset={12} variant="soft">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function HeaderToolButton({
  icon,
  title,
  onClick,
  active = false,
}: {
  icon: IconName;
  title: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <ShellIconButton
      icon={icon}
      label={title}
      active={active}
      className="admin-shell-icon-button admin-shell-icon-button--toolbar"
      activeClassName="admin-shell-icon-button--active"
      onClick={onClick}
    />
  );
}

function HeaderThemeToggle() {
  const t = useConsoleTranslations('header.theme');
  const { theme, setTheme } = useTheme();
  const currentTheme = isThemePreference(theme) ? theme : getGlobalUserPreferences().theme;
  const isDark = currentTheme === 'dark';
  const nextTheme: Theme = isDark ? 'light' : 'dark';

  return (
    <ShellThemeToggle
      currentTheme={currentTheme}
      buttonLabel={t('switchTo', { theme: t(nextTheme) })}
      className="admin-shell-icon-button admin-shell-icon-button--toolbar"
      activeClassName="admin-shell-icon-button--active"
      onThemeChange={(nextTheme) => {
        setTheme(nextTheme);
        setGlobalThemePreference(nextTheme);
      }}
    />
  );
}

function HeaderLocaleSelect() {
  const t = useConsoleTranslations('header');
  const currentLocale = useConsoleLocale();
  const locale = SUPPORTED_LOCALES.includes(currentLocale) ? currentLocale : DEFAULT_LOCALE;

  const handleLocaleChange = (nextLocale: Locale) => {
    setGlobalLocalePreference(nextLocale);
  };

  return (
    <ShellLocaleSwitcher
      currentLocale={locale}
      buttonLabel={t('language.title')}
      align="start"
      buttonClassName="admin-shell-icon-button admin-shell-icon-button--toolbar"
      activeButtonClassName="admin-shell-icon-button--active"
      popoverClassName="admin-shell-locale-panel"
      onLocaleChange={handleLocaleChange}
    />
  );
}

function HeaderFullscreenToggle() {
  const t = useConsoleTranslations('header.fullscreen');
  return (
    <ShellFullscreenToggle
      targetId={PAGE_FULLSCREEN_ID}
      enterLabel={t('enter')}
      exitLabel={t('exit')}
      className="admin-shell-icon-button admin-shell-icon-button--toolbar"
      activeClassName="admin-shell-icon-button--active"
    />
  );
}

function QuickSettings() {
  const t = useConsoleTranslations('header.userMenu.settings');
  const currentLocale = useConsoleLocale();
  const { theme, setTheme, density, setDensity } = useTheme();
  const initialPrefs = useMemo(() => getGlobalUserPreferences(), []);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(initialPrefs.locale || currentLocale || DEFAULT_LOCALE);
  const [selectedTheme, setSelectedTheme] = useState<ShellThemePreference>(
    isThemePreference(initialPrefs.theme) ? initialPrefs.theme : isThemePreference(theme) ? theme : 'system',
  );
  const [selectedDensity, setSelectedDensity] = useState<Density>(
    isDensity(initialPrefs.density) ? initialPrefs.density : isDensity(density) ? density : 'default',
  );
  const [selectedFontSize, setSelectedFontSize] = useState<ShellFontSizePreference>(getStoredFontSizePreference);

  useEffect(() => {
    setSelectedLocale(currentLocale);
  }, [currentLocale]);

  useEffect(() => {
    applyFontSizePreference(selectedFontSize);
  }, [selectedFontSize]);

  const handleLocaleChange = (nextLocale: Locale) => {
    setSelectedLocale(nextLocale);
    setGlobalLocalePreference(nextLocale);
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

  const handleFontSizeChange = (nextFontSize: ShellFontSizePreference) => {
    setSelectedFontSize(nextFontSize);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FONT_SIZE_PREFERENCE_KEY, nextFontSize);
    }
  };

  return (
    <ShellPreferencePanel
      locale={selectedLocale}
      theme={selectedTheme}
      density={selectedDensity}
      fontSize={selectedFontSize}
      labels={{
        title: t('title'),
        locale: t('labels.locale'),
        theme: t('labels.theme'),
        density: t('labels.density'),
        fontSize: t('labels.fontSize'),
        themeOptions: {
          system: t('theme.system'),
          light: t('theme.light'),
          dark: t('theme.dark'),
        },
        densityOptions: {
          compact: t('density.compact'),
          default: t('density.default'),
          comfortable: t('density.comfortable'),
        },
        fontSizeOptions: {
          small: t('fontSize.small'),
          default: t('fontSize.default'),
          large: t('fontSize.large'),
        },
      }}
      onLocaleChange={handleLocaleChange}
      onThemeChange={handleThemeChange}
      onDensityChange={handleDensityChange}
      onFontSizeChange={handleFontSizeChange}
    />
  );
}

function UserMenu({
  user,
  disabled,
  onSwitchUser,
  onSignOut,
}: {
  user: ConsoleUser;
  disabled: boolean;
  onSwitchUser: () => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  const t = useConsoleTranslations('header.userMenu');
  const tRoot = useConsoleTranslations();
  const displayName = getDisplayName(user, t('unnamed'));
  const uniqueLine = getUniqueLine(user);
  const roleLabel = getRoleLabel(user, tRoot);

  return (
    <ShellUserMenu
      user={{
        displayName,
        uniqueLine,
        avatarSrc: DEFAULT_AVATAR_SRC,
        avatarAlt: displayName,
        avatarFallback: displayName.slice(0, 2).toUpperCase(),
        badges: [{ key: 'role', label: roleLabel }],
      }}
      openLabel={t('open')}
      settings={<QuickSettings />}
      actions={[
        { key: 'switch-user', label: t('switchUser'), icon: 'user-switch', disabled, onClick: onSwitchUser },
        { key: 'sign-out', label: t('signOut'), icon: 'sign-out', disabled, onClick: onSignOut },
      ]}
      sideOffset={16}
      statusClassName="dark:border-vx-gray-900"
    />
  );
}

function ShellFrame({ children }: { children: ReactNode }) {
  const { session, status, signOut } = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();
  const loadingT = useConsoleTranslations('shell.loading');
  const headerT = useConsoleTranslations('header');
  const navigationT = useConsoleTranslations('navigation');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarAutoCollapsed, setSidebarAutoCollapsed] = useState(false);
  const [sidebarVisualCollapsed, setSidebarVisualCollapsed] = useState(false);
  const [sidebarAnimating, setSidebarAnimating] = useState(false);
  const [sidebarTextMounted, setSidebarTextMounted] = useState(true);
  const [sidebarTextVisible, setSidebarTextVisible] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set());
  const [workspacePanelOpen, setWorkspacePanelOpen] = useState(false);

  const activeWorkspace = getAdminWorkspaceByPath(pathname);
  const activeSections = activeWorkspace.sections;
  const activeItemMatch = getAdminNavigationItemByPath(pathname);
  const activeItem = activeItemMatch?.item;
  const activeItemLabel = activeItem
    ? getTranslatedLabel(navigationT, `items.${activeItem.id}.label`, activeItem.label)
    : navigationT('fallback');
  const activeSectionStorageKey = `${ADMIN_NAV_SECTION_KEY}:${activeWorkspace.id}`;
  const allSectionsCollapsed = activeSections.every((section) => collapsedSections.has(section.id));
  const sidebarEffectiveCollapsed = sidebarCollapsed || sidebarAutoCollapsed;

  useEffect(() => {
    const savedSidebarCollapsed = window.localStorage.getItem(ADMIN_SIDEBAR_KEY) === 'true';
    setSidebarCollapsed(savedSidebarCollapsed);
    setSidebarVisualCollapsed(savedSidebarCollapsed);
    setSidebarAnimating(false);
    setSidebarTextMounted(!savedSidebarCollapsed);
    setSidebarTextVisible(!savedSidebarCollapsed);
  }, []);

  useEffect(() => {
    setCollapsedSections(readCollapsedSections(activeSectionStorageKey));
  }, [activeSectionStorageKey]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(ADMIN_SIDEBAR_AUTO_COLLAPSE_QUERY);
    const updateAutoCollapse = () => setSidebarAutoCollapsed(mediaQuery.matches);

    updateAutoCollapse();
    mediaQuery.addEventListener('change', updateAutoCollapse);

    return () => {
      mediaQuery.removeEventListener('change', updateAutoCollapse);
    };
  }, []);

  useEffect(() => {
    setSidebarAnimating(true);

    if (sidebarEffectiveCollapsed) {
      setSidebarTextVisible(false);
      setSidebarVisualCollapsed(true);
      const timeout = window.setTimeout(() => {
        setSidebarTextMounted(false);
        setSidebarAnimating(false);
      }, ADMIN_SIDEBAR_ANIMATION_MS);

      return () => {
        window.clearTimeout(timeout);
      };
    }

    setSidebarTextMounted(true);
    setSidebarTextVisible(false);
    let secondFrame: number | undefined;
    let revealTimeout: number | undefined;
    let settleTimeout: number | undefined;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setSidebarVisualCollapsed(false);
        revealTimeout = window.setTimeout(() => {
          setSidebarTextVisible(true);
        }, ADMIN_SIDEBAR_TEXT_REVEAL_MS);
        settleTimeout = window.setTimeout(() => {
          setSidebarAnimating(false);
        }, ADMIN_SIDEBAR_ANIMATION_MS);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) {
        window.cancelAnimationFrame(secondFrame);
      }
      if (revealTimeout !== undefined) {
        window.clearTimeout(revealTimeout);
      }
      if (settleTimeout !== undefined) {
        window.clearTimeout(settleTimeout);
      }
    };
  }, [sidebarEffectiveCollapsed]);

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
      window.localStorage.setItem(activeSectionStorageKey, JSON.stringify([...next]));
      return next;
    });
  }

  function handleToggleAllNavSections() {
    setCollapsedSections(() => {
      const next = allSectionsCollapsed
        ? new Set<string>()
        : new Set(activeSections.map((section) => section.id));
      window.localStorage.setItem(activeSectionStorageKey, JSON.stringify([...next]));
      return next;
    });
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  async function handleSwitchUser() {
    await signOut();
    router.replace('/login');
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
    sidebarVisualCollapsed ? 'admin-shell--nav-collapsed' : '',
    sidebarAutoCollapsed ? 'admin-shell--nav-auto-collapsed' : '',
    sidebarAnimating ? 'admin-shell--nav-transitioning' : '',
    !sidebarTextVisible ? 'admin-shell--nav-text-hidden' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClassName} data-fullscreen-id={PAGE_FULLSCREEN_ID}>
      <header className="admin-shell__header">
        <div className="admin-shell-header__left">
          <Popover open={workspacePanelOpen} onOpenChange={setWorkspacePanelOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`admin-shell-icon-button admin-shell-icon-button--launcher ${workspacePanelOpen ? 'admin-shell-icon-button--active' : ''}`}
                aria-label={headerT('appLauncher')}
                title={headerT('appLauncher')}
              >
                <Icon name="app-grid" size="lg" fallback="placeholder" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={20}
              className="admin-workspace-switcher rounded-lg border border-vx-gray-200 bg-vx-white p-5 text-vx-gray-900 shadow-xl shadow-vx-brand-950/10 dark:border-vx-gray-700 dark:bg-vx-gray-900 dark:text-vx-gray-100"
            >
              <div className="admin-workspace-switcher__header">
                <strong>工作域</strong>
              </div>
              <div className="admin-workspace-switcher__list">
                {adminWorkspaces.map((workspace) => {
                  const active = workspace.id === activeWorkspace.id;

                  return (
                    <Button
                      key={workspace.id}
                      variant="ghost"
                      className="admin-workspace-switcher__item"
                      data-workspace={workspace.id}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => {
                        setWorkspacePanelOpen(false);
                        if (!active) {
                          router.push(workspace.homeHref);
                        }
                      }}
                    >
                      <span className="admin-workspace-switcher__icon" aria-hidden="true">
                        <Icon name={workspace.icon} size={32} fallback="placeholder" />
                      </span>
                      <span className="admin-workspace-switcher__copy">
                        <strong>{workspace.label}</strong>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
          <Link className="admin-shell-header__brand" href="/" aria-label={headerT('brandHome')}>
            <Image
              className="admin-shell-header__brand-logo"
              src="/brand/vxture-logo-white.png"
              alt=""
              aria-hidden="true"
              width={24}
              height={24}
              priority
            />
            <strong>{headerT('brandName')}</strong>
          </Link>
          <span className="admin-shell-header__divider" aria-hidden="true" />
          <strong className="admin-shell-header__workspace">{headerT('title')}</strong>
          <span className="admin-shell-header__context">{activeItemLabel}</span>
        </div>

        <label className="vx-shell-header__search-shell" aria-label={headerT('searchPlaceholder')}>
          <span className="vx-shell-header__search-icon" aria-hidden="true">
            <Icon name="search" size="sm" fallback="search" />
          </span>
          <Input className="vx-shell-header__search-input" type="search" placeholder={headerT('searchPlaceholder')} />
        </label>

        <div className="admin-shell-header__actions">
          <div className="admin-shell-header__action-group" role="group" aria-label={headerT('quickPreferences')}>
            <HeaderThemeToggle />
            <HeaderLocaleSelect />
            <HeaderFullscreenToggle />
          </div>

          <div className="admin-shell-header__action-group" role="group" aria-label={headerT('workspaceActions')}>
            <HeaderToolButton icon="help" title={headerT('help')} onClick={() => {}} />
            <HeaderToolButton icon="bell" title={headerT('notifications')} onClick={() => {}} />
            <HeaderToolButton icon="settings" title={headerT('settings')} onClick={() => {}} />
          </div>

          <UserMenu
            user={session.user}
            disabled={status !== 'ready'}
            onSwitchUser={handleSwitchUser}
            onSignOut={handleSignOut}
          />
        </div>
      </header>

      <div className="admin-shell__body">
        <aside id="vx-admin-sidebar" className="admin-shell-sidebar" aria-label={`${activeWorkspace.label}导航`}>
          <div className="admin-shell-sidebar__top">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="admin-shell-icon-button admin-shell-icon-button--rail"
              aria-label={sidebarEffectiveCollapsed ? headerT('openNavigation') : headerT('collapseNavigation')}
              aria-expanded={!sidebarEffectiveCollapsed}
              aria-controls="vx-admin-sidebar"
              onClick={handleToggleSidebar}
            >
              <Icon name={sidebarEffectiveCollapsed ? 'text-indent' : 'text-outdent'} size={24} fallback="placeholder" />
            </Button>
            {sidebarTextMounted ? <strong className="admin-shell-sidebar__domain-title">{activeWorkspace.label}</strong> : null}
            {sidebarTextMounted ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="admin-shell-sidebar__section-toggle-all"
                aria-label={allSectionsCollapsed ? '展开全部导航分组' : '收起全部导航分组'}
                title={allSectionsCollapsed ? '展开全部导航分组' : '收起全部导航分组'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleToggleAllNavSections}
              >
                <Icon name={allSectionsCollapsed ? 'caret-double-down' : 'caret-double-up'} size={16} fallback="placeholder" />
              </Button>
            ) : null}
          </div>

          <nav className="admin-shell-nav">
            {activeSections.map((section) => {
              const sectionTitle = getTranslatedLabel(navigationT, `sections.${section.id}`, section.title);
              const sectionCollapsed = collapsedSections.has(section.id);
              const sectionActive = section.items.some((item) => isActivePath(pathname, item.href));

              return (
                <section
                  key={section.id}
                  className={[
                    'admin-shell-nav__section',
                    sectionCollapsed ? 'admin-shell-nav__section--collapsed' : '',
                    sectionActive ? 'admin-shell-nav__section--active' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <SidebarTooltip label={sectionTitle} enabled={sidebarVisualCollapsed}>
                    <Button
                      type="button"
                      variant="ghost"
                      className="admin-shell-nav__section-trigger"
                      aria-label={sectionTitle}
                      aria-expanded={!sectionCollapsed}
                      onClick={() => handleToggleNavSection(section.id)}
                    >
                      {sidebarTextMounted ? <span className="admin-shell-nav__title">{sectionTitle}</span> : null}
                      <span className="admin-shell-nav__section-icon admin-shell-nav__section-icon--expanded" aria-hidden="true">
                        <Icon name={sectionCollapsed ? 'chevron-right' : 'chevron-down'} size="xs" fallback="chevron-down" />
                      </span>
                      <span className="admin-shell-nav__section-icon admin-shell-nav__section-icon--collapsed" aria-hidden="true">
                        <Icon name={sectionCollapsed ? 'chevron-right' : 'chevron-down'} size="xs" fallback="chevron-down" />
                      </span>
                    </Button>
                  </SidebarTooltip>
                  {!sectionCollapsed ? (
                    <div className="admin-shell-nav__items">
                      {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const itemLabel = getTranslatedLabel(navigationT, `items.${item.id}.label`, item.label);
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
                        {sidebarTextMounted ? (
                          <span>
                            <strong>{itemLabel}</strong>
                            {item.status === 'planned' ? <em className="admin-shell-nav__status">待建设</em> : null}
                          </span>
                        ) : null}
                      </>
                    );

                    return item.disabled ? (
                      <SidebarTooltip key={item.href} label={itemLabel} enabled={sidebarVisualCollapsed}>
                        <span className={className} aria-label={itemLabel}>
                          {content}
                        </span>
                      </SidebarTooltip>
                    ) : (
                      <SidebarTooltip key={item.href} label={itemLabel} enabled={sidebarVisualCollapsed}>
                        <Link className={className} href={item.href} aria-label={itemLabel} aria-current={active ? 'page' : undefined}>
                          {content}
                        </Link>
                      </SidebarTooltip>
                    );
                      })}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </nav>

          <div className="admin-shell-sidebar__footer" />
        </aside>

        <main className="admin-content" aria-label="Admin content">
          <section className="admin-content__core">{children}</section>
          <section className="admin-content__visual-space" aria-hidden="true" />
        </main>

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
