import type { ReactNode } from 'react';
import { ConsolePage } from './ConsolePage';
import { PageCluster } from './PageCluster';

export function EntityListPage({
  header,
  summary,
  insights,
  list,
  drawer,
}: {
  header: ReactNode;
  summary?: ReactNode;
  insights?: ReactNode;
  list: ReactNode;
  drawer?: ReactNode;
}) {
  return (
    <ConsolePage>
      {header}
      {summary}
      {insights ? <PageCluster>{insights}</PageCluster> : null}
      {list}
      {drawer}
    </ConsolePage>
  );
}
