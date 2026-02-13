/**
 * serverContext.ts
 *
 * 职责：
 * - 统一解析服务器端运行时上下文
 * - 提供 locale / theme 初始化
 * - 避免在 layout / metadata 中重复逻辑
 */

import { headers, cookies } from 'next/headers';

export type Theme = 'light' | 'dark';
export type Locale = 'zh-CN' | 'en-US';

export async function resolveServerContext(): Promise<{
  locale: Locale;
  theme: Theme;
}> {
  const headersList = await headers();
  const cookieStore = await cookies();

  // ---------- 语言 ----------
  const rawAccept =
    headersList.get('Accept-Language') ?? headersList.get('accept-language') ?? 'zh-CN';

  const preferredLang = rawAccept.split(',')[0].split('-')[0] || 'zh';
  const locale: Locale = preferredLang === 'en' ? 'en-US' : 'zh-CN';

  // ---------- 主题 ----------
  const savedTheme = cookieStore.get('theme-storage')?.value;
  let theme: Theme = 'light';

  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      theme = parsed.theme === 'dark' ? 'dark' : 'light';
    } catch {
      theme = 'light';
    }
  }

  return { locale, theme };
}
