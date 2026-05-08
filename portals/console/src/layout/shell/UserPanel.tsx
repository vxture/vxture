/**
 * UserPanel.tsx - 用户头像弹出面板
 * @package @vxture/console
 * @layer Presentation
 * @category Layout / Shell
 * @author AI-Generated
 * @date 2026-05-06
 *
 * 样式结构参照 portals/website/src/components/layout/Header.tsx > UserMenu。
 * 数据源适配 console 的 ConsoleSessionProvider，移除 website 专属的访客偏好逻辑。
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { Icon, Popover, PopoverContent, PopoverTrigger, useTheme } from '@vxture/design-system';
import type { Density, IconName } from '@vxture/design-system';
import { Avatar, AvatarFallback } from '@/components/ui/primitives';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { usePortalEntry } from '@/contexts/PortalEntryContext';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import {
  getGlobalUserPreferences,
  setGlobalDensityPreference,
  setGlobalLocalePreference,
  setGlobalThemePreference,
} from '@vxture/platform-browser';
import { LOCALE_CONFIGS, SUPPORTED_LOCALES } from '@vxture/shared';
import type { Locale, Theme } from '@vxture/shared';

// =============================================================================
// 工具函数
// =============================================================================

function isDensity(value: unknown): value is Density {
  return value === 'compact' || value === 'default' || value === 'comfortable';
}

function isTheme(value: unknown): value is Theme | 'system' {
  return value === 'system' || value === 'light' || value === 'dark';
}

// =============================================================================
// 子组件（样式照搬 website UserMenu）
// =============================================================================

function UserBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center rounded-full border border-vx-brand-100 bg-vx-brand-50/70 px-2.5 py-1 text-xs font-medium text-vx-brand-700 dark:border-vx-brand-400/20 dark:bg-vx-brand-950/35 dark:text-vx-brand-200'>
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
          ? 'bg-vx-white text-vx-brand-700 shadow-sm ring-1 ring-vx-brand-200 dark:bg-vx-gray-800 dark:text-vx-brand-200 dark:ring-vx-brand-400/30'
          : 'text-vx-gray-500 hover:text-vx-gray-800 dark:text-vx-gray-400 dark:hover:text-vx-gray-200'
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
        <Icon name={icon} className='h-4 w-4 text-vx-gray-400 dark:text-vx-gray-500' />
      </span>
      <div className='flex min-w-0 flex-1 items-center justify-end'>{children}</div>
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
    <div className='flex w-full rounded-lg border border-vx-gray-200 bg-vx-gray-50/70 p-0.5 dark:border-vx-gray-700 dark:bg-vx-gray-900/40'>
      {options.map((opt) => (
        <SettingOption key={opt} active={value === opt} onClick={() => onChange(opt)}>
          {labels[opt]}
        </SettingOption>
      ))}
    </div>
  );
}

// =============================================================================
// 快捷设置（精简版：去除字体大小，使用 getGlobalUserPreferences 作为初始值）
// =============================================================================

function QuickSettings() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const { theme, setTheme, density, setDensity } = useTheme();

  const initialPrefs = useMemo(() => getGlobalUserPreferences(), []);

  const [selectedLocale, setSelectedLocale] = useState<Locale>(currentLocale);
  const [selectedTheme, setSelectedTheme] = useState<Theme | 'system'>(
    isTheme(theme) ? theme : isTheme(initialPrefs.theme) ? initialPrefs.theme : 'system',
  );
  const [selectedDensity, setSelectedDensity] = useState<Density>(
    isDensity(density) ? density : isDensity(initialPrefs.density) ? initialPrefs.density : 'default',
  );

  useEffect(() => {
    setSelectedLocale(currentLocale);
  }, [currentLocale]);

  const handleLocaleChange = (next: Locale) => {
    setSelectedLocale(next);
    setGlobalLocalePreference(next);
    router.replace(pathname, { locale: next });
  };

  const handleThemeChange = (next: Theme | 'system') => {
    setSelectedTheme(next);
    setTheme(next);
    setGlobalThemePreference(next as Theme);
  };

  const handleDensityChange = (next: Density) => {
    setSelectedDensity(next);
    setDensity(next);
    setGlobalDensityPreference(next);
  };

  return (
    <div className='space-y-2'>
      <SettingRow icon='globe'>
        <div className='relative w-full'>
          <select
            value={selectedLocale}
            onChange={(e) => handleLocaleChange(e.target.value as Locale)}
            className='h-9 w-full appearance-none rounded-lg border border-vx-gray-200 bg-vx-white px-3 pr-8 text-sm text-vx-gray-700 outline-none transition focus:border-vx-brand-300 focus:ring-2 focus:ring-vx-brand-100 dark:border-vx-gray-700 dark:bg-vx-gray-900 dark:text-vx-gray-100 dark:focus:border-vx-brand-500/60 dark:focus:ring-vx-brand-500/20'
          >
            {SUPPORTED_LOCALES.map((l) => (
              <option key={l} value={l}>{LOCALE_CONFIGS[l].nativeName}</option>
            ))}
          </select>
          <Icon name='chevron-down' className='pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -tranvx-gray-y-1/2 text-vx-gray-400' />
        </div>
      </SettingRow>

      <SettingRow icon='sun'>
        <SegmentedOptions
          value={selectedTheme}
          options={['system', 'light', 'dark'] as const}
          labels={{ system: '跟随系统', light: '浅色', dark: '深色' }}
          onChange={handleThemeChange}
        />
      </SettingRow>

      <SettingRow icon='rows'>
        <SegmentedOptions
          value={selectedDensity}
          options={['compact', 'default', 'comfortable'] as const}
          labels={{ compact: '紧凑', default: '默认', comfortable: '宽松' }}
          onChange={handleDensityChange}
        />
      </SettingRow>
    </div>
  );
}

// =============================================================================
// UserPanel 主组件
// =============================================================================

export function UserPanel() {
  const [open, setOpen] = useState(false);
  const { session, signOut } = useConsoleSession();
  const { portalEntry, dismiss } = usePortalEntry();

  const user = session.user;

  // 未认证时不渲染，避免空态 UI
  if (!user) return null;

  const displayName = (user.displayName || user.name || user.username || 'User').trim();
  const uniqueLine = user.email || user.phone || user.id;
  const fallback = displayName.slice(0, 2).toUpperCase();
  const tenantLabel = session.tenant?.workspace ?? session.tenant?.name;

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          className='vx-shell-user relative'
          aria-label={displayName}
          title={displayName}
        >
          <Avatar>
            <AvatarFallback className='bg-linear-to-br from-vx-brand-600 via-vx-info-500 to-vx-indigo-600 text-sm font-semibold text-vx-white'>
              {fallback}
            </AvatarFallback>
          </Avatar>
          {/* 在线状态指示点 */}
          <span className='absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-vx-gray-900 bg-vx-success-400' />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={10}
        className='w-80 overflow-hidden rounded-lg border-vx-brand-100 bg-vx-white p-0 text-vx-gray-900 shadow-xl shadow-vx-brand-950/10 dark:border-vx-brand-400/20 dark:bg-vx-gray-900 dark:text-vx-gray-100'
      >
        {/* ── 用户信息 ──────────────────────────────────────────────── */}
        <div className='p-4'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-14 w-14 border border-vx-brand-200/80 shadow-sm shadow-vx-brand-900/10 dark:border-vx-brand-400/30'>
              <AvatarFallback className='bg-linear-to-br from-vx-brand-600 via-vx-info-500 to-vx-indigo-600 text-lg font-semibold text-vx-white'>
                {fallback}
              </AvatarFallback>
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-base font-semibold text-vx-gray-900 dark:text-vx-white'>
                {displayName}
              </p>
              <p className='mt-0.5 truncate text-sm text-vx-gray-500 dark:text-vx-gray-400'>
                {uniqueLine}
              </p>
              {tenantLabel ? (
                <p className='mt-0.5 truncate text-xs text-vx-gray-400 dark:text-vx-gray-500'>
                  {tenantLabel}
                </p>
              ) : null}
            </div>
          </div>
          {user.roleLabel ? (
            <div className='ml-[68px] mt-3'>
              <UserBadge>{user.roleLabel}</UserBadge>
            </div>
          ) : null}
        </div>

        <div className='mx-4 h-px bg-vx-gray-200/70 dark:bg-vx-gray-800' />

        {/* ── 返回来源 Portal（有跨 Portal 上下文时渲染）──────────── */}
        {portalEntry ? (
          <>
            <div className='p-2'>
              <button
                type='button'
                onClick={() => { window.location.href = portalEntry.returnTo; }}
                className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-vx-brand-600 transition hover:bg-vx-brand-50 dark:text-vx-brand-300 dark:hover:bg-vx-brand-950/40'
              >
                <Icon name='arrow-left' className='h-4 w-4 shrink-0' />
                <span className='truncate'>返回 {portalEntry.caller}</span>
                {/* 关闭按钮：取消返回入口，不离开当前页 */}
                <button
                  type='button'
                  onClick={(e) => { e.stopPropagation(); dismiss(); }}
                  className='ml-auto shrink-0 rounded p-0.5 text-vx-gray-400 transition hover:text-vx-gray-700 dark:hover:text-vx-gray-200'
                  aria-label='取消返回入口'
                >
                  <Icon name='x' className='h-3 w-3' />
                </button>
              </button>
            </div>
            <div className='mx-4 h-px bg-vx-gray-100 dark:bg-vx-gray-800/70' />
          </>
        ) : null}

        {/* ── 快捷设置 ──────────────────────────────────────────────── */}
        <div className='px-4 py-3'>
          <QuickSettings />
        </div>

        <div className='mx-4 h-px bg-vx-gray-100 dark:bg-vx-gray-800/70' />

        {/* ── 退出登录 ──────────────────────────────────────────────── */}
        <div className='p-2'>
          <button
            type='button'
            onClick={handleSignOut}
            className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-vx-gray-700 transition hover:bg-vx-brand-50 hover:text-vx-brand-700 dark:text-vx-gray-200 dark:hover:bg-vx-brand-950/40 dark:hover:text-vx-brand-200'
          >
            <Icon name='sign-out' className='h-4 w-4' />
            退出登录
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
