import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vxture - 智能体解决方案平台',
  description: '为企业提供先进的AI智能体集成与解决方案',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
