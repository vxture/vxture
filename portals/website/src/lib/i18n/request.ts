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

  // 直接静态导入所有必要的翻译文件
  const rootMessages = (await import(`@/../messages/${resolvedLocale}.json`)).default;
  const commonMessages = (await import(`@/../messages/${resolvedLocale}/common.json`)).default;
  const headerMessages = (await import(`@/../messages/${resolvedLocale}/layout/header.json`)).default;
  const footerMessages = (await import(`@/../messages/${resolvedLocale}/layout/footer.json`)).default;

  // 构建正确的嵌套结构
  const messages: Record<string, any> = {
    ...rootMessages,
    ...commonMessages,
    layout: {
      header: headerMessages,
      footer: footerMessages
    }
  };

  return {
    locale: resolvedLocale,
    messages,
    routing
  };
});
