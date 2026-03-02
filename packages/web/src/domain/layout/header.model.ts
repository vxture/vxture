/**
 * header.model.ts - Header 领域模型
 *
 * Domain Layer - Layout Domain
 *
 * 职责：
 * - 定义 Header 的领域模型和业务规则
 * - 封装导航、Logo、语言切换等逻辑
 *
 * @layer Domain
 * @category Layout
 */

import type { ContentEntity } from '../shared/types/content.types';
import type { ValidationResult } from '../shared/types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Logo 接口
 */
export interface Logo {
  readonly text: string;
  readonly image: string;
  readonly alt: string;
  readonly href: string;
}

/**
 * 导航项接口
 */
export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/**
 * 行动按钮接口
 */
export interface Action {
  readonly label: string;
  readonly href: string;
  readonly variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  readonly icon?: string;
}

/**
 * 语言选项接口
 */
export interface LanguageOption {
  readonly code: string;
  readonly label: string;
}

/**
 * 语言配置接口
 */
export interface LanguageConfig {
  readonly enabled: boolean;
  readonly icon: string;
  readonly title: string;
  readonly options: LanguageOption[];
}

/**
 * Header 内容接口
 */
export interface HeaderContent extends ContentEntity {
  readonly key: 'header';
  readonly logo: Logo;
  readonly nav: NavItem[];
  readonly actions: Action[];
  readonly language: LanguageConfig;
  readonly theme: ThemeConfig;
}

// ============================================================================
// 纯函数辅助
// ============================================================================

/**
 * Logo 辅助函数
 */
export const LogoHelpers = {
  /**
   * 验证 Logo
   */
  validate: (logo: Logo): ValidationResult => {
    const errors: string[] = [];
    if (!logo.text?.trim()) errors.push('Logo text is required');
    if (!logo.image?.trim()) errors.push('Logo image path is required');
    if (!logo.href?.trim()) errors.push('Logo href is required');
    return { valid: errors.length === 0, errors };
  },
};

/**
 * NavItem 辅助函数
 */
export const NavItemHelpers = {
  /**
   * 检查是否为当前路径
   */
  isActive: (item: NavItem, currentPath: string): boolean => {
    return currentPath === item.href || currentPath.startsWith(item.href + '/');
  },

  /**
   * 检查是否为外部链接
   */
  isExternal: (item: NavItem): boolean => {
    return item.href.startsWith('http://') || item.href.startsWith('https://');
  },
};

/**
 * Action 辅助函数
 */
export const ActionHelpers = {
  /**
   * 检查是否有图标
   */
  hasIcon: (action: Action): boolean => {
    return !!action.icon;
  },
};

/**
 * LanguageOption 辅助函数
 */
export const LanguageOptionHelpers = {
  /**
   * 检查是否为当前语言
   */
  isCurrent: (option: LanguageOption, currentLocale: string): boolean => {
    return option.code === currentLocale;
  },
};

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  readonly enabled: boolean;
  readonly icon: string;
  readonly title: string;
  readonly options: { code: 'light' | 'dark'; label: string }[];
}

/**
 * 主题配置辅助函数
 */
export const ThemeConfigHelpers = {
  /**
   * 获取当前主题选项
   */
  getCurrentOption: (config: ThemeConfig, theme: string): { code: 'light' | 'dark'; label: string } | undefined => {
    return config.options.find(opt => opt.code === theme);
  },

  /**
   * 获取可用主题数量
   */
  getThemeCount: (config: ThemeConfig): number => {
    return config.options.length;
  },

  /**
   * 检查是否支持主题切换
   */
  isThemeSwitchEnabled: (config: ThemeConfig): boolean => {
    return config.enabled && config.options.length > 1;
  },
};

/**
 * LanguageConfig 辅助函数
 */
export const LanguageConfigHelpers = {
  /**
   * 获取当前语言选项
   */
  getCurrentOption: (config: LanguageConfig, locale: string): LanguageOption | undefined => {
    return config.options.find(opt => LanguageOptionHelpers.isCurrent(opt, locale));
  },

  /**
   * 获取可用语言数量
   */
  getLanguageCount: (config: LanguageConfig): number => {
    return config.options.length;
  },

  /**
   * 检查是否支持多语言
   */
  isMultiLanguage: (config: LanguageConfig): boolean => {
    return config.enabled && config.options.length > 1;
  },
};

/**
 * HeaderContent 辅助函数
 */
export const HeaderHelpers = {
  /**
   * 获取导航项数量
   */
  getNavCount: (header: HeaderContent): number => {
    return header.nav.length;
  },

  /**
   * 根据路径查找激活的导航项
   */
  getActiveNavItem: (header: HeaderContent, currentPath: string): NavItem | undefined => {
    return header.nav.find(item => NavItemHelpers.isActive(item, currentPath));
  },

  /**
   * 获取主要行动按钮
   */
  getPrimaryAction: (header: HeaderContent): Action | undefined => {
    return header.actions.find(action => action.variant === 'primary');
  },

  /**
   * 检查是否启用多语言
   */
  hasMultiLanguage: (header: HeaderContent): boolean => {
    return LanguageConfigHelpers.isMultiLanguage(header.language);
  },

  /**
   * 验证 Header 内容
   */
  validate: (header: HeaderContent): ValidationResult => {
    const errors: string[] = [];

    // 验证 Logo
    const logoResult = LogoHelpers.validate(header.logo);
    if (!logoResult.valid) {
      errors.push(...logoResult.errors);
    }

    // 验证导航项
    if (!header.nav || header.nav.length === 0) {
      errors.push('Header must have at least one navigation item');
    }

    return { valid: errors.length === 0, errors };
  },
};