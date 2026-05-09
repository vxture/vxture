import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist_Mono, Inter, Sora } from 'next/font/google';
import { FullscreenProvider, ThemeProvider } from '@vxture/design-system';
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
  title: 'Ruyin',
  description: 'Ruyin agent workspace',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${sora.variable} ${inter.variable} ${geistMono.variable}`}>
        <ThemeProvider defaultTheme="light" defaultDensity="default">
          <FullscreenProvider defaultMode="native" defaultLockScroll={false}>
            {children}
          </FullscreenProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
