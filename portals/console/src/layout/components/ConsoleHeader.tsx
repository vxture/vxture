'use client';

import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Input } from '@vxture/design-system';
import { ConsolePreferenceControls } from '@/components/preferences';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { useTranslations } from 'next-intl';

const DEFAULT_USER_AVATAR_ONLINE_SRC = '/assets/icon/avatar-default-online.png';

export function ConsoleHeader() {
  const { session } = useConsoleSession();
  const t = useTranslations('header');
  const displayName = session.user?.name ?? 'User';

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
            <AvatarImage src={DEFAULT_USER_AVATAR_ONLINE_SRC} alt={displayName} />
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <strong>{displayName}</strong>
            <span>{session.user?.roleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
