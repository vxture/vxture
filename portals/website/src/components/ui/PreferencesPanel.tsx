/**
 * PreferencesPanel.tsx - 用户偏好设置面板
 *
 * 功能：
 * - 整合语言、主题、密度、全屏模式等设置的弹出面板
 * - 支持未登录（临时 localStorage）和已登录（后端存储）两种模式
 *
 * 配置项：
 * - 语言选择：下拉框，使用 shared 的 SUPPORTED_LOCALES
 * - 主题选择：单选（跟随系统 | 亮色 | 暗色）
 * - 密度选择：单选（紧凑 | 默认 | 宽松）
 * - 全屏默认：单选（工作区全屏 | 浏览器全屏）
 *
 * @package @vxture/website
 * @layer Presentation
 * @category Components - UI
 * @author AI-Generated
 * @date 2026-03-21
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale as useNextIntlLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Label,
  Icon,
  useTheme,
} from '@vxture/design-system';
import type { Density } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';
import { SUPPORTED_LOCALES, LOCALE_CONFIGS, DEFAULT_LOCALE } from '@vxture/shared';
import type { Locale } from '@vxture/shared';
import {
  MOCK_USER_PREFERENCES,
  getGuestPreferences,
  setGuestPreferences,
  type UserPreferences,
  type ThemePreference,
  type FullscreenMode,
} from '@/data/user/mock-user-preferences';
import { WEBSITE_THEME_OPTIONS } from '@/data/theme/theme.data';
import {
  setGlobalDensityPreference,
  setGlobalLocalePreference,
  setGlobalThemePreference,
} from '@vxture/platform-browser';

// ============================================================================
// 类型定义
// ============================================================================

interface PreferencesPanelProps {
  /** 是否已登录 */
  isLoggedIn?: boolean;
  /** 图标大小 */
  size?: 'small' | 'medium' | 'large';
  /** 自定义类名 */
  className?: string;
}

// ============================================================================
// 常量定义
// ============================================================================

/** 主题选项 */
const THEME_OPTIONS = WEBSITE_THEME_OPTIONS.map((option) => ({
  value: option.value as ThemePreference,
  icon: option.icon,
  labelKey: `theme.${option.labelKey}`,
})) satisfies { value: ThemePreference; icon: typeof WEBSITE_THEME_OPTIONS[number]['icon']; labelKey: string }[];

/** 密度选项 */
const DENSITY_OPTIONS: { value: Density; icon: IconName; labelKey: string }[] = [
  { value: 'compact', icon: 'rows', labelKey: 'density.compact' },
  { value: 'default', icon: 'chart-bar', labelKey: 'density.default' },
  { value: 'comfortable', icon: 'users', labelKey: 'density.comfortable' },
];

/** 全屏模式选项 */
const FULLSCREEN_OPTIONS: { value: FullscreenMode; icon: IconName; labelKey: string }[] = [
  { value: 'workspace', icon: 'maximize', labelKey: 'fullscreen.workspace' },
  { value: 'browser', icon: 'maximize', labelKey: 'fullscreen.browser' },
];

// ============================================================================
// 组件实现
// ============================================================================

export default function PreferencesPanel({
  isLoggedIn = false,
  size = 'medium',
  className = '',
}: PreferencesPanelProps) {
  const t = useTranslations('layout.header.preferences');
  const [open, setOpen] = useState(false);
  const { theme, setTheme, density, setDensity } = useTheme();
  const currentLocale = useNextIntlLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  // 本地状态（用于 UI 渲染）
  const [selectedLocale, setSelectedLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [selectedTheme, setSelectedTheme] = useState<ThemePreference>('system');
  const [selectedDensity, setSelectedDensity] = useState<Density>('default');
  const [selectedFullscreen, setSelectedFullscreen] = useState<FullscreenMode>('workspace');

  // 尺寸配置
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  const buttonSizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  // ----------------------------------------------------------------------------
  // 初始化：从数据源加载偏好
  // ----------------------------------------------------------------------------

  const loadPreferences = useCallback(() => {
    if (isLoggedIn) {
      // 已登录：使用 mock 数据
      setSelectedLocale(MOCK_USER_PREFERENCES.locale);
      setSelectedTheme(MOCK_USER_PREFERENCES.theme);
      setSelectedDensity(MOCK_USER_PREFERENCES.density);
      setSelectedFullscreen(MOCK_USER_PREFERENCES.fullscreenMode);
    } else {
      // 未登录：使用 localStorage 或默认值
      const guestPrefs = getGuestPreferences();
      setSelectedLocale((guestPrefs.locale as Locale) || currentLocale);
      setSelectedTheme((guestPrefs.theme as ThemePreference) || (theme as ThemePreference) || 'system');
      setSelectedDensity((guestPrefs.density as Density) || density);
      setSelectedFullscreen((guestPrefs.fullscreenMode as FullscreenMode) || 'workspace');
    }
  }, [isLoggedIn, currentLocale, theme, density]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // ----------------------------------------------------------------------------
  // 保存偏好
  // ----------------------------------------------------------------------------

  const savePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    if (isLoggedIn) {
      // 已登录：TODO - 调用 API 保存到后端
      console.log('[PreferencesPanel] Saving to backend:', prefs);
    } else {
      // 未登录：保存到 localStorage
      setGuestPreferences(prefs);
    }
  }, [isLoggedIn]);

  // ----------------------------------------------------------------------------
  // 处理各项变更
  // ----------------------------------------------------------------------------

  const handleLocaleChange = (newLocale: Locale) => {
    setSelectedLocale(newLocale);
    savePreferences({ locale: newLocale });
    setGlobalLocalePreference(newLocale);
    router.push(pathname, { locale: newLocale });
  };

  const handleThemeChange = (newTheme: ThemePreference) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    savePreferences({ theme: newTheme });
    setGlobalThemePreference(newTheme);
  };

  const handleDensityChange = (newDensity: Density) => {
    setSelectedDensity(newDensity);
    setDensity(newDensity);
    savePreferences({ density: newDensity });
    setGlobalDensityPreference(newDensity);
  };

  const handleFullscreenChange = (newMode: FullscreenMode) => {
    setSelectedFullscreen(newMode);
    savePreferences({ fullscreenMode: newMode });
  };

  // ----------------------------------------------------------------------------
  // 渲染辅助：选项组
  // ----------------------------------------------------------------------------

  const renderOptionGroup = <TValue extends string>(
    title: string,
    options: { value: TValue; icon: IconName; labelKey: string }[],
    selectedValue: TValue,
    onChange: (value: TValue) => void
  ) => (
    <div className='space-y-2'>
      <Label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
        {title}
      </Label>
      <div className='grid grid-cols-3 gap-1'>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200
              ${selectedValue === option.value
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <Icon name={option.icon} className='w-5 h-5 mb-1' />
            <span className='text-xs font-medium'>{t(option.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ----------------------------------------------------------------------------
  // 渲染：语言下拉框
  // ----------------------------------------------------------------------------

  const renderLocaleSelect = () => (
    <div className='space-y-2'>
      <Label className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
        {t('language.title')}
      </Label>
      <div className='relative'>
        <select
          value={selectedLocale}
          onChange={(e) => handleLocaleChange(e.target.value as Locale)}
          className='w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500'
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {LOCALE_CONFIGS[locale].nativeName}
            </option>
          ))}
        </select>
        <Icon name='chevron-down' className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
      </div>
    </div>
  );

  // ----------------------------------------------------------------------------
  // 主渲染
  // ----------------------------------------------------------------------------

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={`${buttonSizes[size]} ${className}`}
          title={t('title')}
        >
          <Icon name='settings' className={iconSizes[size]} />
          <span className='sr-only'>{t('title')}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={8}
        className='w-80 p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      >
        {/* 标题区 */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <Icon name='settings' className='w-5 h-5 text-gray-600 dark:text-gray-400' />
            <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
              {t('title')}
            </h3>
          </div>
          {isLoggedIn ? (
            <span className='px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full'>
              {t('status.loggedIn')}
            </span>
          ) : (
            <span className='px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full'>
              {t('status.guest')}
            </span>
          )}
        </div>

        <div className='space-y-4'>
          {/* 语言选择 */}
          {renderLocaleSelect()}

          {/* 分隔线 */}
          <div className='h-px bg-gray-200 dark:bg-gray-700' />

          {/* 主题选择 */}
          {renderOptionGroup(
            t('theme.title'),
            THEME_OPTIONS,
            selectedTheme,
            handleThemeChange
          )}

          {/* 密度选择 */}
          {renderOptionGroup(
            t('density.title'),
            DENSITY_OPTIONS,
            selectedDensity,
            handleDensityChange
          )}

          {/* 全屏默认 */}
          {renderOptionGroup(
            t('fullscreen.title'),
            FULLSCREEN_OPTIONS,
            selectedFullscreen,
            handleFullscreenChange
          )}
        </div>

        {/* 底部提示 */}
        <div className='mt-4 pt-3 border-t border-gray-200 dark:border-gray-700'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {isLoggedIn ? t('hint.synced') : t('hint.local')}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
