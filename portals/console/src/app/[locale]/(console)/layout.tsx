import type { ReactNode } from 'react';
import { ConsoleShell } from '@/layout/ConsoleShell';
import { ConsoleVelaPanel } from './ConsoleVelaPanel';

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell endPanel={<ConsoleVelaPanel />}>
      {children}
    </ConsoleShell>
  );
}
