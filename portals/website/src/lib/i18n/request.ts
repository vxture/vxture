/**
 * i18n 请求工具
 * @package @vxture/website
 * @layer Presentation
 * @category I18n
 */

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale ?? 'zh-CN';

  // 只加载最小化的通用翻译，其他页面翻译在页面级别按需加载
  const Messages = (await import(`@/../messages/${resolvedLocale}.json`)).default;

  return {
    locale: resolvedLocale,
    messages: Messages,
    routing
  };
});
