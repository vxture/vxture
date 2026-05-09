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
import { Geist_Mono, Inter, Sora } from 'next/font/google';
import { cookies } from 'next/headers';
import { FullscreenProvider, ThemeProvider } from '@vxture/design-system';
import type { Density } from '@vxture/design-system';
import { DEFAULT_LOCALE, PREFERENCE_CONSTANTS, THEME_CONSTANTS } from '@vxture/shared';
import type { Theme } from '@vxture/shared';
import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--vx-font-loader-brand',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--vx-font-loader-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--vx-font-loader-mono',
});

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
      <body className={`${sora.variable} ${inter.variable} ${geistMono.variable}`}>
        <ThemeProvider defaultTheme={initialTheme} defaultDensity={initialDensity}>
          <FullscreenProvider defaultMode="native" defaultLockScroll={false}>
            {children}
          </FullscreenProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
