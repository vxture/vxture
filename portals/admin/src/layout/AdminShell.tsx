'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { CaretDoubleDownIcon, CaretDoubleUpIcon, TextIndentIcon, TextOutdentIcon, TranslateIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useFullscreen,
  useTheme,
} from '@vxture/design-system';
import type { Density, IconName } from '@vxture/design-system';
import {
  getGlobalUserPreferences,
  setGlobalDensityPreference,
  setGlobalLocalePreference,
  setGlobalThemePreference,
} from '@vxture/platform-browser';
import { DEFAULT_LOCALE, LOCALE_CONFIGS, SUPPORTED_LOCALES, type Locale, type Theme } from '@vxture/shared';
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

type FontSizePreference = 'small' | 'default' | 'large';

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

function UserAvatar({ user, size = 'md' }: { user: ConsoleUser; size?: 'md' | 'lg' }) {
  const dimension = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  const displayName = getDisplayName(user, 'Admin');

  return (
    <Avatar className={`${dimension} border border-blue-200/80 shadow-sm shadow-blue-900/10 dark:border-blue-400/30`}>
      <AvatarImage
        className="h-full w-full object-cover"
        src={DEFAULT_AVATAR_SRC}
        alt={displayName}
      />
      <AvatarFallback className="bg-blue-50 text-transparent dark:bg-slate-800" aria-hidden="true" />
    </Avatar>
  );
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

function isFontSizePreference(value: unknown): value is FontSizePreference {
  return value === 'small' || value === 'default' || value === 'large';
}

function getStoredFontSizePreference(): FontSizePreference {
  if (typeof window === 'undefined') {
    return 'default';
  }

  const stored = window.localStorage.getItem(FONT_SIZE_PREFERENCE_KEY);
  return isFontSizePreference(stored) ? stored : 'default';
}

function applyFontSizePreference(value: FontSizePreference) {
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

function UserBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center truncate whitespace-nowrap rounded-full border border-blue-100 bg-blue-50/70 px-2.5 py-1 text-[11px] font-medium leading-4 text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/35 dark:text-blue-200">
      {children}
    </span>
  );
}

function SettingOption({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md px-2 py-1.5 text-[12px] font-medium leading-4 transition-colors ${
        active
          ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200 dark:bg-slate-800 dark:text-blue-200 dark:ring-blue-400/30'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
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

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: IconName;
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-10 items-center gap-3">
      <span
        className="flex w-5 shrink-0 justify-center"
        aria-label={`${label}: ${description}`}
        title={description}
      >
        <Icon name={icon} className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

function SegmentedOptions<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex w-full rounded-lg border border-slate-200 bg-slate-50/70 p-0.5 dark:border-slate-700 dark:bg-slate-900/40">
      {options.map((option) => (
        <SettingOption key={option} active={value === option} onClick={() => onChange(option)}>
          {labels[option]}
        </SettingOption>
      ))}
    </div>
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
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active || undefined}
      onClick={onClick}
      className={`admin-shell-icon-button admin-shell-icon-button--toolbar ${active ? 'admin-shell-icon-button--active' : ''}`}
    >
      <Icon name={icon} className="h-5 w-5" />
    </button>
  );
}

function HeaderThemeToggle() {
  const t = useConsoleTranslations('header.theme');
  const { theme, setTheme } = useTheme();
  const currentTheme = isThemePreference(theme) ? theme : getGlobalUserPreferences().theme;
  const isDark = currentTheme === 'dark';
  const nextTheme: Theme = isDark ? 'light' : 'dark';

  return (
    <HeaderToolButton
      icon={isDark ? 'sun' : 'moon'}
      title={t('switchTo', { theme: t(nextTheme) })}
      active={isDark}
      onClick={() => {
        setTheme(nextTheme);
        setGlobalThemePreference(nextTheme);
      }}
    />
  );
}

function HeaderLocaleSelect() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useConsoleTranslations('header');
  const currentLocale = useConsoleLocale();
  const locale = SUPPORTED_LOCALES.includes(currentLocale) ? currentLocale : DEFAULT_LOCALE;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLocaleChange = (nextLocale: Locale) => {
    setOpen(false);
    setGlobalLocalePreference(nextLocale);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        title={t('language.title')}
        aria-label={t('language.title')}
        aria-pressed={open}
        onClick={() => setOpen((value) => !value)}
        className={`admin-shell-icon-button admin-shell-icon-button--toolbar ${open ? 'admin-shell-icon-button--active' : ''}`}
      >
        <TranslateIcon size={20} aria-hidden="true" />
      </button>
      {open ? (
        <div className="admin-shell-locale-panel absolute left-0 top-full z-50 w-40">
          {SUPPORTED_LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleLocaleChange(option)}
              className={`admin-shell-locale-option ${locale === option ? 'admin-shell-locale-option--active' : ''}`}
            >
              {LOCALE_CONFIGS[option].nativeName}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function HeaderFullscreenToggle() {
  const t = useConsoleTranslations('header.fullscreen');
  const { enter, exit, isFullscreen, mode, targetId } = useFullscreen();
  const isActive = isFullscreen && targetId === PAGE_FULLSCREEN_ID && mode === 'native';
  const title = isActive ? t('exit') : t('enter');

  return (
    <HeaderToolButton
      icon={isActive ? 'minimize' : 'maximize'}
      title={title}
      active={isActive}
      onClick={() => {
        if (isActive) {
          exit();
          return;
        }

        enter(PAGE_FULLSCREEN_ID, document.documentElement, { mode: 'native', lockScroll: false });
      }}
    />
  );
}

function QuickSettings() {
  const t = useConsoleTranslations('header.userMenu.settings');
  const currentLocale = useConsoleLocale();
  const { theme, setTheme, density, setDensity } = useTheme();
  const initialPrefs = useMemo(() => getGlobalUserPreferences(), []);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(initialPrefs.locale || currentLocale || DEFAULT_LOCALE);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(
    isThemePreference(initialPrefs.theme) ? initialPrefs.theme : isThemePreference(theme) ? theme : 'system',
  );
  const [selectedDensity, setSelectedDensity] = useState<Density>(
    isDensity(initialPrefs.density) ? initialPrefs.density : isDensity(density) ? density : 'default',
  );
  const [selectedFontSize, setSelectedFontSize] = useState<FontSizePreference>(getStoredFontSizePreference);

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

  const handleThemeChange = (nextTheme: Theme) => {
    setSelectedTheme(nextTheme);
    setTheme(nextTheme);
    setGlobalThemePreference(nextTheme);
  };

  const handleDensityChange = (nextDensity: Density) => {
    setSelectedDensity(nextDensity);
    setDensity(nextDensity);
    setGlobalDensityPreference(nextDensity);
  };

  const handleFontSizeChange = (nextFontSize: FontSizePreference) => {
    setSelectedFontSize(nextFontSize);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FONT_SIZE_PREFERENCE_KEY, nextFontSize);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.08em] text-slate-400 dark:text-slate-500">{t('title')}</p>
      <SettingRow icon="globe" label={t('labels.locale')} description={t('hints.locale')}>
        <div className="relative w-full">
          <select
            value={selectedLocale}
            onChange={(event) => handleLocaleChange(event.target.value as Locale)}
            className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[13px] font-normal leading-5 text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500/60 dark:focus:ring-blue-500/20"
          >
            {SUPPORTED_LOCALES.map((localeOption) => (
              <option key={localeOption} value={localeOption}>
                {LOCALE_CONFIGS[localeOption].nativeName}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </SettingRow>

      <SettingRow icon="sun" label={t('labels.theme')} description={t('hints.theme')}>
        <SegmentedOptions
          value={selectedTheme}
          options={['system', 'light', 'dark'] as const}
          labels={{
            system: t('theme.system'),
            light: t('theme.light'),
            dark: t('theme.dark'),
          }}
          onChange={handleThemeChange}
        />
      </SettingRow>

      <SettingRow icon="rows" label={t('labels.density')} description={t('hints.density')}>
        <SegmentedOptions
          value={selectedDensity}
          options={['compact', 'default', 'comfortable'] as const}
          labels={{
            compact: t('density.compact'),
            default: t('density.default'),
            comfortable: t('density.comfortable'),
          }}
          onChange={handleDensityChange}
        />
      </SettingRow>

      <SettingRow icon="settings" label={t('labels.fontSize')} description={t('hints.fontSize')}>
        <SegmentedOptions
          value={selectedFontSize}
          options={['small', 'default', 'large'] as const}
          labels={{
            small: t('fontSize.small'),
            default: t('fontSize.default'),
            large: t('fontSize.large'),
          }}
          onChange={handleFontSizeChange}
        />
      </SettingRow>
    </div>
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
  const [open, setOpen] = useState(false);
  const t = useConsoleTranslations('header.userMenu');
  const tRoot = useConsoleTranslations();
  const displayName = getDisplayName(user, t('unnamed'));
  const uniqueLine = getUniqueLine(user);
  const roleLabel = getRoleLabel(user, tRoot);

  const handleSwitchUser = async () => {
    setOpen(false);
    await onSwitchUser();
  };

  const handleSignOut = async () => {
    setOpen(false);
    await onSignOut();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full outline-none transition duration-200 hover:ring-2 hover:ring-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:ring-blue-500/60"
          aria-label={t('open')}
          title={t('open')}
        >
          <UserAvatar user={user} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={16}
        className="w-80 overflow-hidden rounded-lg border-blue-100 bg-white p-0 text-[13px] font-normal leading-normal text-slate-900 shadow-xl shadow-blue-950/10 dark:border-blue-400/20 dark:bg-slate-900 dark:text-slate-100"
      >
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold leading-6 text-slate-950 dark:text-white">{displayName}</p>
              <p className="mt-1 truncate text-[13px] font-normal leading-5 text-slate-500 dark:text-slate-400">{uniqueLine}</p>
            </div>
          </div>

          <div className="ml-[68px] mt-3 flex flex-wrap gap-2">
            <UserBadge>{roleLabel}</UserBadge>
          </div>
        </div>

        <div className="mx-4 h-px bg-slate-200/70 dark:bg-slate-800" />

        <div className="px-4 py-4">
          <QuickSettings />
        </div>

        <div className="mx-4 h-px bg-slate-100 dark:bg-slate-800/70" />

        <div className="px-4 py-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={handleSwitchUser}
              disabled={disabled}
              className="flex w-full items-center gap-3 rounded-md px-0 py-2.5 text-left text-[13px] font-medium leading-5 text-slate-700 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-200 dark:hover:text-blue-200"
            >
              <Icon name="user-switch" className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              {t('switchUser')}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={disabled}
              className="flex w-full items-center gap-3 rounded-md px-0 py-2.5 text-left text-[13px] font-medium leading-5 text-slate-700 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-200 dark:hover:text-blue-200"
            >
              <Icon name="sign-out" className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              {t('signOut')}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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
              <button
                type="button"
                className={`admin-shell-icon-button admin-shell-icon-button--launcher ${workspacePanelOpen ? 'admin-shell-icon-button--active' : ''}`}
                aria-label={headerT('appLauncher')}
                title={headerT('appLauncher')}
              >
                <Icon name="app-grid" size="lg" fallback="placeholder" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={20}
              className="admin-workspace-switcher w-[320px] rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-xl shadow-blue-950/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <div className="admin-workspace-switcher__header">
                <strong>工作域</strong>
              </div>
              <div className="admin-workspace-switcher__list">
                {adminWorkspaces.map((workspace) => {
                  const active = workspace.id === activeWorkspace.id;

                  return (
                    <button
                      key={workspace.id}
                      type="button"
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
                    </button>
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
          <input className="vx-shell-header__search-input" type="search" placeholder={headerT('searchPlaceholder')} />
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
            <button
              type="button"
              className="admin-shell-icon-button admin-shell-icon-button--rail"
              aria-label={sidebarEffectiveCollapsed ? headerT('openNavigation') : headerT('collapseNavigation')}
              aria-expanded={!sidebarEffectiveCollapsed}
              aria-controls="vx-admin-sidebar"
              onClick={handleToggleSidebar}
            >
              {sidebarEffectiveCollapsed ? <TextIndentIcon size={24} aria-hidden="true" /> : <TextOutdentIcon size={24} aria-hidden="true" />}
            </button>
            {sidebarTextMounted ? <strong className="admin-shell-sidebar__domain-title">{activeWorkspace.label}</strong> : null}
            {sidebarTextMounted ? (
              <button
                type="button"
                className="admin-shell-sidebar__section-toggle-all"
                aria-label={allSectionsCollapsed ? '展开全部导航分组' : '收起全部导航分组'}
                title={allSectionsCollapsed ? '展开全部导航分组' : '收起全部导航分组'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleToggleAllNavSections}
              >
                {allSectionsCollapsed ? <CaretDoubleDownIcon size={16} aria-hidden="true" /> : <CaretDoubleUpIcon size={16} aria-hidden="true" />}
              </button>
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
                    <button
                      type="button"
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
                    </button>
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
