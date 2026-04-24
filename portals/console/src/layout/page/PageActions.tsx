import type { ReactNode } from 'react';

export function PageActions({ children }: { children: ReactNode }) {
  return <div className="vx-detail-actions">{children}</div>;
}
