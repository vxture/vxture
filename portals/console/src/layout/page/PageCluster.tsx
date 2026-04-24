import type { ReactNode } from 'react';

export function PageCluster({ children }: { children: ReactNode }) {
  return <div className="vx-page-stack">{children}</div>;
}
