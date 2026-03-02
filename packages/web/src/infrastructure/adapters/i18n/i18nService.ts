/**
 * i18nService.ts
 *
 * 功能：
 * - 统一管理所有多语言（i18n）相关异步服务方法，便于集中维护
 * - 提供远程拉取语言包、动态加载本地资源等 API 封装
 *
 * 用途：
 * - 供 i18nStore、I18nSync、语言切换相关组件/服务统一复用
 * - 结构与 themeService.ts、authService.ts 保持一致，便于团队协作
 *
 * 依赖/调用关系：
 * - 类型依赖 @/types/i18n.types
 * - 常量依赖 @/constants/i18nConfig
 * - 被 src/stores/i18nStore.ts、国际化相关组件调用
 *
 * 设计规范：
 * - 只存放异步服务方法，不包含业务逻辑
 * - 命名、结构、注释与 themeService/authService 保持一致
 *
 * @file i18nService.ts
 * @desc 多语言相关异步服务方法统一封装，便于团队协作与维护
 * @author vxture team
 * @created 2024-10-01
 * @lastModified 2025-10-15
 * @modifiedBy stonesmoker
 * @copyright Copyright (c) 2024-2025 vxture
 * @license MIT
 * @version 1.0.0
 * @dependencies React, Zustand
 * @see src/types/i18n.types.ts 国际化类型定义
 * @see src/constants/i18nConfig.ts 国际化常量配置
 * @tags i18n, service, async
 * @example
 *   const resource = await fetchI18nResource('en-US');
 * @remarks
 *   仅存放异步服务方法，业务逻辑请移至 store/组件层。
 * @todo
 *   支持更多多语言相关 API 封装
 */

import type { LocaleType, I18nResource } from '@/shared/types/i18n.types';


// ============================================================================
// 主服务方法区 - i18n 异步服务方法定义
// ============================================================================

/**
 * 异步获取指定语言的翻译资源
 * @param locale 目标语言标识（如 'zh-CN' | 'en-US'）
 * @returns Promise<I18nResource> 语言包键值对对象
 * @example
 *   const resource = await fetchI18nResource('en-US');
 */
export async function fetchI18nResource(locale: LocaleType): Promise<I18nResource> {
  // 实际项目中可替换为 fetch(`/locales/${locale}.json`) 或动态 import
  if (locale === 'en-US') {
    return {
      'common.backToHome': 'Back to Home',
      'common.submit': 'Submit',
      'common.cancel': 'Cancel',
      'themeTest.pageTitle': 'Theme & Language Test',
      'themeTest.toggleThemeBtn': 'Toggle Theme',
    };
  }
  // 默认中文
  return {
    'common.backToHome': '返回首页',
    'common.submit': '提交',
    'common.cancel': '取消',
    'themeTest.pageTitle': '主题与多语言测试',
    'themeTest.toggleThemeBtn': '切换主题',
  };
}

// TODO: 可扩展更多 i18n 相关服务方法，如远程同步、缓存、批量加载等
