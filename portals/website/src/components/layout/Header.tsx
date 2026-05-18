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

import { useEffect, useMemo, useState } from 'react';
import { useLocale as useNextIntlLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  ShellFullscreenToggle,
  ShellLocaleSwitcher,
  ShellPreferencePanel,
  ShellThemeToggle,
  ShellUserMenu,
  useTheme,
} from '@vxture/design-system';
import type { Density, ShellFontSizePreference, ShellThemePreference } from '@vxture/design-system';
import { HEADER_DATA } from '@/data/layout/header.data';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { Link, usePathname, useRouter } from '@/lib/i18n/navigation';
import { buildConsoleEntryUrl } from '@/lib/console-entry';
import type { UserInfo } from '@/types/auth.types';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@vxture/shared';
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

const PAGE_FULLSCREEN_ID = 'page-root-native';
const FONT_SIZE_PREFERENCE_KEY = 'vxture-font-size-preference';
const DEFAULT_AVATAR_ONLINE_SRC = '/assets/icon/avatar-default-online.png';

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

function HeaderThemeToggle() {
  const t = useTranslations('layout.header.theme');
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const nextTheme: ThemePreference = isDark ? 'light' : 'dark';

  return (
    <ShellThemeToggle
      currentTheme={theme}
      buttonLabel={t('switchTo', { theme: t(nextTheme) })}
      onThemeChange={(value) => {
        setTheme(value);
        setGlobalThemePreference(value);
      }}
    />
  );
}

function HeaderLocaleSelect() {
  const t = useTranslations('layout.header');
  const currentLocale = useNextIntlLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const locale = SUPPORTED_LOCALES.includes(currentLocale) ? currentLocale : DEFAULT_LOCALE;

  const handleLocaleChange = (nextLocale: Locale) => {
    setGlobalLocalePreference(nextLocale);
    setGuestPreferences({ locale: nextLocale });
    router.push(pathname, { locale: nextLocale });
  };

  return (
    <ShellLocaleSwitcher
      currentLocale={locale}
      buttonLabel={t('language.title')}
      onLocaleChange={handleLocaleChange}
    />
  );
}

function HeaderFullscreenToggle() {
  return <ShellFullscreenToggle targetId={PAGE_FULLSCREEN_ID} enterLabel="显示器全屏" exitLabel="退出显示器全屏" />;
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
  const [selectedFontSize, setSelectedFontSize] = useState<ShellFontSizePreference>(getStoredFontSizePreference);

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

  const handleThemeChange = (nextTheme: ShellThemePreference) => {
    setSelectedTheme(nextTheme);
    setTheme(nextTheme);
    setGuestPreferences({ theme: nextTheme as ThemePreference });
    setGlobalThemePreference(nextTheme as ThemePreference);
  };

  const handleDensityChange = (nextDensity: Density) => {
    setSelectedDensity(nextDensity);
    setDensity(nextDensity);
    setGuestPreferences({ density: nextDensity });
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
  user: UserInfo;
  disabled: boolean;
  onSwitchUser: () => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  const t = useTranslations('layout.header.userMenu');
  const displayName = getDisplayName(user, t('unnamed'));
  const uniqueLine = getUniqueLine(user);
  const roleLabel = getRoleLabel(user, t);
  const showPersonalBadge = hasPersonalVerification(user);
  const showOrganizationBadge = hasOrganizationVerification(user);
  const avatarSrc = user.avatarUrl?.trim() || DEFAULT_AVATAR_ONLINE_SRC;

  return (
    <ShellUserMenu
      user={{
        displayName,
        uniqueLine,
        avatarSrc,
        avatarAlt: displayName,
        avatarFallback: Array.from(displayName.trim() || 'V')[0]?.toLocaleUpperCase() ?? 'V',
        badges: [
          { key: 'role', label: roleLabel },
          ...(showPersonalBadge ? [{ key: 'personal', label: t('badges.personal') }] : []),
          ...(showOrganizationBadge ? [{ key: 'organization', label: t('badges.organization') }] : []),
        ],
      }}
      openLabel={t('open')}
      online={!disabled}
      settings={<QuickSettings />}
      actions={[
        { key: 'switch-user', label: t('switchUser'), icon: 'user-switch', disabled, onClick: onSwitchUser },
        { key: 'sign-out', label: t('signOut'), icon: 'sign-out', disabled, onClick: onSignOut },
      ]}
    />
  );
}

/**
 * Header 组件
 *
 * 主题颜色说明：
 * - Light 模式：背景为浅蓝色，文字统一用 DS text token，
 *   与其他 section 保持一致；滚动前后颜色不变
 * - Dark 模式：背景为深灰色，文字统一用 DS text token，
 *   与其他 section 保持一致
 * - 不使用 useTheme() 做 className 拼接，避免 SSR hydration mismatch
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const t = useTranslations('layout.header');
  const locale = useNextIntlLocale();
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const consoleUrl = buildConsoleEntryUrl(locale);

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

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-vx-brand-50/80 dark:bg-vx-gray-800/80 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className='max-w-7xl xl:max-w-screen-2xl 2xl:max-w-400 mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link
            href={HEADER_DATA.logo.href}
            aria-label={t(HEADER_DATA.logo.labelKey)}
            className='shrink-0 flex items-center space-x-2 rounded-md transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vx-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'
          >
            <Image
              src={HEADER_DATA.logo.image}
              alt={t(HEADER_DATA.logo.altKey)}
              width={24}
              height={24}
              className='object-contain'
            />
            <h1 className='logo-text text-2xl text-vx-gray-800 dark:text-vx-text-secondary'>
              {t(HEADER_DATA.logo.labelKey)}
            </h1>
          </Link>

          {/* Navigation */}
          <nav className='hidden md:flex space-x-8'>
            {HEADER_DATA.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='transition-colors duration-300 text-vx-gray-800 dark:text-vx-text-secondary font-medium hover:text-vx-info dark:hover:text-vx-info'
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          {/* 工具栏：访客设置 / CTA / 登录用户入口 */}
          <div className='flex items-center gap-4'>
            <HeaderQuickTools />

            {/* 已登录：进入控制台 + 用户菜单 */}
            {isAuthenticated ? (
              <>
                <a
                  href={consoleUrl}
                  title={consoleLabel}
                  className='text-sm font-medium text-vx-gray-700 transition-colors duration-200 hover:text-vx-primary focus-visible:outline-none dark:text-vx-text-secondary dark:hover:text-vx-brand-300'
                >
                  {consoleLabel}
                </a>
                {user ? (
                  <UserMenu
                    user={user}
                    disabled={isLoading}
                    onSwitchUser={handleSwitchUser}
                    onSignOut={handleSignOut}
                  />
                ) : null}
              </>
            ) : (
              /* 访客 CTA：会话稳定期保留占位（invisible）防止布局跳动 */
              <div
                className={`flex items-center gap-2 ${isSessionSettling ? 'invisible' : ''}`}
                aria-hidden={isSessionSettling ? 'true' : undefined}
              >
                {guestActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={
                      action.variant === 'secondary'
                        ? 'w-20 px-4 py-2 rounded-lg transition-all duration-300 text-center text-vx-gray-700 dark:text-vx-text-secondary font-semibold hover:text-vx-gray-900 dark:hover:text-vx-white'
                        : 'w-28 px-6 py-2 bg-linear-to-r from-vx-info-500 to-vx-brand-600 text-vx-white rounded-lg hover:from-vx-info-600 hover:to-vx-brand-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center'
                    }
                  >
                    {t(action.labelKey)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
