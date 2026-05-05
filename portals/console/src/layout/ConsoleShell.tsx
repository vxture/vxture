'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ConsoleSessionProvider, useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { TenantProvider } from '@/features/tenant';
import { AppShell } from '@/layout/shell';

function ShellFrame({ children, endPanel }: { children: ReactNode; endPanel?: ReactNode }) {
  const { session, status } = useConsoleSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('shell.loading');

  useEffect(() => {
    if (status === 'ready' && (!session.isAuthenticated || !session.user || !session.tenant)) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, session.isAuthenticated, session.tenant, session.user, status]);

  // 覆盖两种等待态：会话加载中 + token 已过期（useEffect 正在触发重定向）
  if (status !== 'ready' || !session.isAuthenticated || !session.user || !session.tenant) {
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
