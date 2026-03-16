/**
 * 翻译按需加载工具
 * @package @vxture/website
 * @layer Presentation
 * @category I18n
 */

import { getMessages } from 'next-intl/server';

/**
 * 按需加载页面翻译
 * @param locale 语言
 * @param page 页面名称
 */
export async function loadPageTranslations(locale: string, page: string) {
  const baseMessages = await getMessages({ locale });
  const pageMessages = (await import(`@/../messages/${locale}/${page}.json`)).default;
  return { ...baseMessages, ...pageMessages };
}

/**
 * 按需加载区域翻译
 * @param locale 语言
 * @param section 区域名称
 * @param page 页面名称（可选）
 */
export async function loadSectionTranslations(locale: string, section: string, page?: string) {
  const baseMessages = await getMessages({ locale });
  const path = page
    ? `@/../messages/${locale}/${page}/${section}.json`
    : `@/../messages/${locale}/${section}.json`;
  const sectionMessages = (await import(path)).default;
  return { ...baseMessages, ...sectionMessages };
}

/**
 * 加载布局相关翻译
 * @param locale 语言
 */
export async function loadLayoutTranslations(locale: string) {
  // 布局组件通常需要 common 和 layout 翻译
  const baseMessages = await getMessages({ locale });
  const commonMessages = (await import(`@/../messages/${locale}/common.json`)).default;
  const layoutMessages = (await import(`@/../messages/${locale}/layout.json`)).default;
  return { ...baseMessages, ...commonMessages, ...layoutMessages };
}

/**
 * 加载认证相关翻译
 * @param locale 语言
 */
export async function loadAuthTranslations(locale: string) {
  const baseMessages = await getMessages({ locale });
  const authMessages = (await import(`@/../messages/${locale}/auth.json`)).default;
  return { ...baseMessages, ...authMessages };
}
