'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ConsoleSessionProvider, useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { TenantProvider } from '@/features/tenant';
import { useConsoleTranslations } from '@/lib/console-intl';
import { AppShell } from '@/layout/shell';

function ShellFrame({ children, endPanel }: { children: ReactNode; endPanel?: ReactNode }) {
  const { session, status } = useConsoleSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useConsoleTranslations('shell.loading');

  useEffect(() => {
    if (status === 'ready' && (!session.isAuthenticated || !session.user || !session.tenant)) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, session.isAuthenticated, session.tenant, session.user, status]);

  if (status !== 'ready') {
    return (
      <div className="console-loading">
        <div className="console-loading__card">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1>{t('title')}</h1>
          <p>{t('description')}</p>
        </div>
      </div>
    );
  }

  if (!session.isAuthenticated || !session.user || !session.tenant) {
    return null;
  }

  return (
    <AppShell endPanel={endPanel}>
      <div className="console-page">
        <div className="console-page__body">
          {children}
        </div>
      </div>
    </AppShell>
  );
}

export function ConsoleShell({ children, endPanel }: { children: ReactNode; endPanel?: ReactNode }) {
  return (
    <ConsoleSessionProvider>
      <TenantProvider>
        <ShellFrame endPanel={endPanel}>{children}</ShellFrame>
      </TenantProvider>
    </ConsoleSessionProvider>
  );
}
