import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ConsoleShell } from '@/layout/ConsoleShell';

// ssr: false — Vela 依赖 Zustand、fetch，不支持 SSR
const VelaChat = dynamic(
  () => import('@vxture/agent-studio-vela').then((m) => m.VelaChat),
  { ssr: false },
);

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell endPanel={<VelaChat surface="console" position="sidebar" />}>
      {children}
    </ConsoleShell>
  );
}
