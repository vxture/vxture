/**
 * Header.tsx - 网站全局顶部导航栏
 *
 * Presentation Layer - Component
 *
 * 职责：
 * - 展示网站全局导航栏 UI
 * - 使用 src/data/header.data.ts 获取结构数据
 * - 使用 next-intl 进行翻译
 *
 * @layer Presentation
 * @category Components - Layout
 * @author AI-Generated
 * @date 2026-03-18
 */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale as useNextIntlLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  Avatar,
  AvatarFallback,
  Icon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useFullscreen,
  useTheme,
} from '@vxture/design-system';
import type { Density, IconName } from '@vxture/design-system';
import { HEADER_DATA } from '@/data/layout/header.data';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation';
import type { UserInfo } from '@/types/auth.types';
import { DEFAULT_LOCALE, LOCALE_CONFIGS, SUPPORTED_LOCALES } from '@vxture/shared';
import type { Locale } from '@vxture/shared';
import {
  getGuestPreferences,
  setGuestPreferences,
  type ThemePreference,
} from '@/data/user/mock-user-preferences';
import {
  setGlobalDensityPreference,
  setGlobalLocalePreference,
  setGlobalThemePreference,
} from '@vxture/platform-browser';

function resolveConsoleUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_CONSOLE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  return 'http://localhost:3002';
}

const PAGE_FULLSCREEN_ID = 'page-root-native';
const FONT_SIZE_PREFERENCE_KEY = 'vxture-font-size-preference';

type FontSizePreference = 'small' | 'default' | 'large';

function getAvatarInitial(user: UserInfo): string {
  const source = (user.displayName || user.username || user.name || user.email || 'V').trim();
  return Array.from(source)[0]?.toLocaleUpperCase() ?? 'V';
}

function UserAvatar({ user, size = 'md' }: { user: UserInfo; size?: 'md' | 'lg' }) {
  const dimension = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  const textSize = size === 'lg' ? 'text-lg' : 'text-sm';

  return (
    <Avatar className={`${dimension} border border-blue-200/80 shadow-sm shadow-blue-900/10 dark:border-blue-400/30`}>
      <AvatarFallback className={`bg-linear-to-br from-blue-600 via-cyan-500 to-indigo-600 ${textSize} font-semibold text-white`}>
        {getAvatarInitial(user)}
      </AvatarFallback>
    </Avatar>
  );
}

function getDisplayName(user: UserInfo, fallback: string): string {
  return user.displayName?.trim() || user.username?.trim() || user.name?.trim() || fallback;
}

function getUniqueLine(user: UserInfo): string {
  return user.phone?.trim() || user.email?.trim() || user.id;
}

function isThemePreference(value: unknown): value is ThemePreference {
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

function getRoleLabel(user: UserInfo, t: ReturnType<typeof useTranslations>): string {
  const roleLabels: Record<string, string> = {
    admin: t('roles.admin'),
    member: t('roles.member'),
    tenant_admin: t('roles.tenantAdmin'),
    user: t('roles.user'),
  };
  const normalizedRole = user.role?.toLowerCase() ?? 'member';
  return user.roleLabel || roleLabels[normalizedRole] || user.role || t('roles.member');
}

function hasOrganizationVerification(user: UserInfo): boolean {
  return (
    user.organizationVerified === true ||
    Boolean(user.organizationName) ||
    user.tenantType === 'company' ||
    user.tenantType === 'organization'
  );
}

function hasPersonalVerification(user: UserInfo): boolean {
  if (typeof user.personalVerified === 'boolean') {
    return user.personalVerified;
  }

  return !hasOrganizationVerification(user);
}

function UserBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center rounded-full border border-blue-100 bg-blue-50/70 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-400/20 dark:bg-blue-950/35 dark:text-blue-200'>
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
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200 dark:bg-slate-800 dark:text-blue-200 dark:ring-blue-400/30'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function SettingRow({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <div className='flex min-h-10 items-center gap-3'>
      <span className='flex w-5 shrink-0 justify-center'>
        <Icon name={icon} className='h-4 w-4 text-slate-400 dark:text-slate-500' />
      </span>
      <div className='flex min-w-0 flex-1 items-center justify-end'>
        {children}
      </div>
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
    <div className='flex w-full rounded-lg border border-slate-200 bg-slate-50/70 p-0.5 dark:border-slate-700 dark:bg-slate-900/40'>
      {options.map((option) => (
        <SettingOption
          key={option}
          active={value === option}
          onClick={() => onChange(option)}
        >
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
      type='button'
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        active
          ? 'text-blue-700 dark:text-blue-200'
          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-200'
      }`}
    >
      <Icon name={icon} className='h-5 w-5' />
    </button>
  );
}

function HeaderThemeToggle() {
  const t = useTranslations('layout.header.theme');
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const nextTheme: ThemePreference = isDark ? 'light' : 'dark';

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
  const t = useTranslations('layout.header');
  const currentLocale = useNextIntlLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
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
    setGuestPreferences({ locale: nextLocale });
    router.push(pathname, { locale: nextLocale });
  };

  return (
    <div ref={menuRef} className='relative'>
      <HeaderToolButton
        icon='globe'
        title={t('language.title')}
        active={open}
        onClick={() => setOpen((value) => !value)}
      />
      {open ? (
        <div className='absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg shadow-blue-950/10 dark:border-slate-700 dark:bg-slate-900'>
          {SUPPORTED_LOCALES.map((option) => (
            <button
              key={option}
              type='button'
              onClick={() => handleLocaleChange(option)}
              className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                locale === option
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
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
  const { enter, exit, isFullscreen, mode, targetId } = useFullscreen();
  const isActive = isFullscreen && targetId === PAGE_FULLSCREEN_ID && mode === 'native';
  const title = isActive ? '退出显示器全屏' : '显示器全屏';

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

function HeaderQuickTools() {
  return (
    <div className='flex items-center gap-1'>
      <HeaderThemeToggle />
      <HeaderLocaleSelect />
      <HeaderFullscreenToggle />
    </div>
  );
}

function QuickSettings() {
  const t = useTranslations('layout.header.userMenu.settings');
  const currentLocale = useNextIntlLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, density, setDensity } = useTheme();

  const initialPrefs = useMemo(() => getGuestPreferences(), []);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    (initialPrefs.locale as Locale | undefined) || currentLocale || DEFAULT_LOCALE,
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemePreference>(
    isThemePreference(initialPrefs.theme) ? initialPrefs.theme : isThemePreference(theme) ? theme : 'system',
  );
  const [selectedDensity, setSelectedDensity] = useState<Density>(
    isDensity(initialPrefs.density) ? initialPrefs.density : density,
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
    setGuestPreferences({ locale: nextLocale });
    setGlobalLocalePreference(nextLocale);
    router.push(pathname, { locale: nextLocale });
  };

  const handleThemeChange = (nextTheme: ThemePreference) => {
    setSelectedTheme(nextTheme);
    setTheme(nextTheme);
    setGuestPreferences({ theme: nextTheme });
    setGlobalThemePreference(nextTheme);
  };

  const handleDensityChange = (nextDensity: Density) => {
    setSelectedDensity(nextDensity);
    setDensity(nextDensity);
    setGuestPreferences({ density: nextDensity });
    setGlobalDensityPreference(nextDensity);
  };

  const handleFontSizeChange = (nextFontSize: FontSizePreference) => {
    setSelectedFontSize(nextFontSize);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FONT_SIZE_PREFERENCE_KEY, nextFontSize);
    }
  };

  return (
    <div className='space-y-2'>
      <p className='text-sm font-semibold text-slate-900 dark:text-white'>{t('title')}</p>
      <SettingRow icon='globe'>
        <div className='relative w-full'>
          <select
            value={selectedLocale}
            onChange={(event) => handleLocaleChange(event.target.value as Locale)}
            className='h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500/60 dark:focus:ring-blue-500/20'
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <option key={locale} value={locale}>
                {LOCALE_CONFIGS[locale].nativeName}
              </option>
            ))}
          </select>
          <Icon name='chevron-down' className='pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        </div>
      </SettingRow>

      <SettingRow icon='sun'>
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

      <SettingRow icon='rows'>
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

      <SettingRow icon='settings'>
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
  user: UserInfo;
  disabled: boolean;
  onSwitchUser: () => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('layout.header.userMenu');
  const displayName = getDisplayName(user, t('unnamed'));
  const uniqueLine = getUniqueLine(user);
  const roleLabel = getRoleLabel(user, t);
  const showPersonalBadge = hasPersonalVerification(user);
  const showOrganizationBadge = hasOrganizationVerification(user);

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
          type='button'
          className='relative flex h-10 w-10 items-center justify-center rounded-full outline-none transition duration-200 hover:ring-2 hover:ring-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:ring-blue-500/60'
          aria-label={t('open')}
          title={t('open')}
        >
          <UserAvatar user={user} />
          <span className='absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900' />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={10}
        className='w-80 overflow-hidden rounded-lg border-blue-100 bg-white p-0 text-slate-900 shadow-xl shadow-blue-950/10 dark:border-blue-400/20 dark:bg-slate-900 dark:text-slate-100'
      >
        <div className='p-4'>
          <div className='flex items-center gap-3'>
            <UserAvatar user={user} size='lg' />
            <div className='min-w-0 flex-1'>
              <p className='truncate text-base font-semibold text-slate-950 dark:text-white'>{displayName}</p>
              <p className='mt-1 truncate text-sm font-normal text-slate-500 dark:text-slate-400'>{uniqueLine}</p>
            </div>
          </div>

          <div className='ml-[68px] mt-3 flex flex-wrap gap-2'>
            <UserBadge>{roleLabel}</UserBadge>
            {showPersonalBadge ? <UserBadge>{t('badges.personal')}</UserBadge> : null}
            {showOrganizationBadge ? <UserBadge>{t('badges.organization')}</UserBadge> : null}
          </div>
        </div>

        <div className='mx-4 h-px bg-slate-200/70 dark:bg-slate-800' />

        <div className='px-4 py-3'>
          <QuickSettings />
        </div>

        <div className='mx-4 h-px bg-slate-100 dark:bg-slate-800/70' />

        <div className='p-2'>
          <div>
            <button
              type='button'
              onClick={handleSwitchUser}
              disabled={disabled}
              className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-200'
            >
              <Icon name='user-switch' className='h-4 w-4' />
              {t('switchUser')}
            </button>
            <button
              type='button'
              onClick={handleSignOut}
              disabled={disabled}
              className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-200 dark:hover:bg-blue-950/40 dark:hover:text-blue-200'
            >
              <Icon name='sign-out' className='h-4 w-4' />
              {t('signOut')}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Header 组件
 *
 * 主题颜色说明：
 * - Light 模式：背景为浅蓝色，文字统一用 text-gray-800（主）/ text-gray-600（次），
 *   与其他 section 保持一致；滚动前后颜色不变
 * - Dark 模式：背景为深灰色，文字统一用 dark:text-slate-200（主）/ dark:text-slate-300（次），
 *   与其他 section 保持一致
 * - 不使用 useTheme() 做 className 拼接，避免 SSR hydration mismatch
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const t = useTranslations('layout.header');
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const consoleUrl = resolveConsoleUrl();

  // ----------------------------------------------------------------------------
  // 监听滚动
  // ----------------------------------------------------------------------------

  useEffect(() => {
    setHasMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async (redirectTo: '/' | '/signin', successMessage: string) => {
    try {
      await logout();
      addNotification(successMessage, 'success');
    } catch (error) {
      addNotification(error instanceof Error ? error.message : t('userMenu.logoutFailed'), 'error');
    } finally {
      router.push(redirectTo);
    }
  };

  const handleSwitchUser = () => handleLogout('/signin', t('userMenu.switchReady'));
  const handleSignOut = () => handleLogout('/', t('userMenu.logoutSuccess'));

  // ----------------------------------------------------------------------------
  // 渲染
  // ----------------------------------------------------------------------------

  // 禁止渲染：如果内容被禁用，不渲染
  if (!HEADER_DATA.enabled) {
    return null;
  }

  const guestActions = HEADER_DATA.actions;
  const consoleLabel = t('actions.console');
  const isSessionSettling = !hasMounted || (isLoading && !isAuthenticated && !user);
  const actions = isAuthenticated || isSessionSettling ? [] : guestActions;

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-blue-50/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-7xl xl:max-w-screen-2xl 2xl:max-w-400 mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link
            href={HEADER_DATA.logo.href}
            aria-label={t(HEADER_DATA.logo.labelKey)}
            className='shrink-0 flex items-center space-x-2 rounded-md transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
          >
            <Image
              src={HEADER_DATA.logo.image}
              alt={t(HEADER_DATA.logo.altKey)}
              width={24}
              height={24}
              className='object-contain'
            />
            <h1 className='text-2xl font-bold text-gray-800 dark:text-slate-200'>
              {t(HEADER_DATA.logo.labelKey)}
            </h1>
          </Link>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-8'>
            {HEADER_DATA.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
              className='transition-colors duration-300 text-gray-800 dark:text-slate-200 font-medium hover:text-cyan-500 dark:hover:text-cyan-400'
              >
                {t(item.labelKey)}
              </a>
            ))}
          </nav>

          {/* 工具栏：访客设置 / CTA / 登录用户入口 */}
          <div className='flex items-center gap-4'>
            <HeaderQuickTools />

            {isAuthenticated ? (
              <a
                href={consoleUrl}
                title={consoleLabel}
                className='text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 focus-visible:outline-none dark:text-slate-200 dark:hover:text-blue-300'
              >
                {consoleLabel}
              </a>
            ) : null}

            {/* CTA Buttons - 固定宽度 */}
            {actions.length > 0 && (
              <>
                {actions.map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className={
                      action.variant === 'secondary'
                        ? 'w-20 px-4 py-2 rounded-lg transition-all duration-300 text-center text-gray-700 dark:text-slate-200 font-semibold hover:text-gray-900 dark:hover:text-white'
                        : 'w-28 px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center'
                    }
                  >
                    {t(action.labelKey)}
                  </a>
                ))}
              </>
            )}

            {isAuthenticated && user ? (
              <UserMenu
                user={user}
                disabled={isLoading}
                onSwitchUser={handleSwitchUser}
                onSignOut={handleSignOut}
              />
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
