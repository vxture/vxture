'use client';

import { Avatar, AvatarFallback, Badge, Button, Input } from '@/components/ui/primitives';
import { ConsolePreferenceControls } from '@/components/preferences';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { useConsoleTranslations } from '@/lib/console-intl';

export function ConsoleHeader() {
  const { session } = useConsoleSession();
  const t = useConsoleTranslations('header');

  return (
    <header className="console-header">
      <div className="console-header__search">
        <Input placeholder={t('searchPlaceholder')} />
      </div>
      <div className="console-header__meta">
        <Badge className="vx-badge-neutral">
          {t('workspace', { workspace: session.tenant?.workspace ?? '-' })}
        </Badge>
        <ConsolePreferenceControls />
        <Button variant="ghost" size="icon" aria-label={t('notifications')}>
          <span aria-hidden="true">N</span>
        </Button>
        <div className="console-user-pill">
          <Avatar>
            <AvatarFallback>{session.user?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <strong>{session.user?.name}</strong>
            <span>{session.user?.roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
