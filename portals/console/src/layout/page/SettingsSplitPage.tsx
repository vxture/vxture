import type { ReactNode } from 'react';
import { ConsolePage } from './ConsolePage';

export function SettingsSplitPage({
  header,
  navigation,
  content,
}: {
  header: ReactNode;
  navigation: ReactNode;
  content: ReactNode;
}) {
  return (
    <ConsolePage>
      {header}
      <div className="vx-settings-split-page">
        <aside className="vx-settings-split-page__nav">{navigation}</aside>
        <div className="vx-settings-split-page__content">{content}</div>
      </div>
    </ConsolePage>
  );
}
