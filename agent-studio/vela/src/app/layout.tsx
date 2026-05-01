/**
 * layout.tsx - Next.js 根布局（嵌入模式，无宿主 shell）
 * @package @vxture/agent-studio-vela
 * @layer Presentation
 * @category App
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title:       'Vela 智能助手',
  description: 'Vxture 平台内嵌 AI 助手',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
