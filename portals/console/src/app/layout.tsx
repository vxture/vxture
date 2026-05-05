/**
 * RootLayout - 根布局
 *
 * 职责：定义 HTML 结构、加载全局样式、挂载 ThemeProvider。
 * locale 相关内容在 [locale]/layout.tsx 中处理。
 *
 * @package @vxture/console
 * @layer Presentation
 * @category Pages
 * @author AI-Generated
 * @date 2026-05-05
 */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { ThemeProvider } from '@vxture/design-system';
import type { Density } from '@vxture/design-system';
import { DEFAULT_LOCALE, PREFERENCE_CONSTANTS, THEME_CONSTANTS } from '@vxture/shared';
import type { Theme } from '@vxture/shared';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vxture Console',
  description: 'Unified management console for platform and tenant operations.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const initialTheme = (cookieStore.get(THEME_CONSTANTS.COOKIE_KEY)?.value ??
    THEME_CONSTANTS.DEFAULT_THEME) as Theme;
  const densityCookie = cookieStore.get(PREFERENCE_CONSTANTS.DENSITY_COOKIE_KEY)?.value;
  const initialDensity: Density =
    densityCookie === 'compact' || densityCookie === 'comfortable' ? densityCookie : 'default';

  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme={initialTheme} defaultDensity={initialDensity}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
