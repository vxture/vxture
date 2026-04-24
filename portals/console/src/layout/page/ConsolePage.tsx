import type { ReactNode } from 'react';

export function ConsolePage({ children }: { children: ReactNode }) {
  return <div className="vx-page-stack">{children}</div>;
}
