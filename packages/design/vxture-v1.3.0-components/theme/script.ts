/**
 * SSR-safe theme bootstrap script.
 *
 * Inline this in <head> BEFORE any rendered content so the correct theme
 * class is on <html> by the time CSS first paints. Otherwise users see a
 * brief flash of the wrong theme on first load.
 *
 * Usage in Next.js app/layout.tsx:
 *
 *   import { themeBootstrapScript } from '@vxture/design-system/theme/script';
 *
 *   export default function RootLayout({ children }) {
 *     return (
 *       <html lang="zh-CN" suppressHydrationWarning>
 *         <head>
 *           <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
 *         </head>
 *         <body>
 *           <ThemeProvider>{children}</ThemeProvider>
 *         </body>
 *       </html>
 *     );
 *   }
 */
export const themeBootstrapScript = `
(function() {
  try {
    var saved = localStorage.getItem('vxture-theme') || 'system';
    var isDark = saved === 'dark' ||
      (saved === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (_) { /* localStorage blocked — fall through */ }
})();
`.trim();
