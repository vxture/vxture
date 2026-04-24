'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationSections } from '@/config/navigation';
import { hasCapability } from '@/features/permissions/can';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { Icon } from '@vxture/design-system';
import { useConsoleTranslations } from '@/lib/console-intl';

export function ConsoleSidebar() {
  const pathname = usePathname();
  const { session } = useConsoleSession();
  const t = useConsoleTranslations('sidebar');

  return (
    <aside className="console-sidebar">
      <div className="console-sidebar__brand">
        <div className="console-sidebar__brand-mark">
          <span>V</span>
        </div>
        <div>
          <p className="vx-eyebrow">{t('eyebrow')}</p>
          <h2>{t('title')}</h2>
          <span>{t('description')}</span>
        </div>
      </div>
      <nav className="console-nav" aria-label={t('ariaLabel')}>
        {navigationSections.map((section) => {
          const items = section.items.filter((item) => hasCapability(session.capabilities, item.capability));
          if (items.length === 0) {
            return null;
          }

          return (
            <div key={section.titleKey} className="console-nav__group">
              <p className="console-nav__group-title">{t(`sections.${section.titleKey}`)}</p>
              {items.map((item) => {
                const isActive = pathname === item.href;
                const label = t(`items.${item.labelKey}`);
                const description = t(`items.${item.descriptionKey}`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={isActive ? 'console-nav__item console-nav__item--active' : 'console-nav__item'}
                  >
                    <div className="console-nav__item-icon">
                      <Icon name={item.icon} className="w-4 h-4" fallback="placeholder" />
                    </div>
                    <div>
                      <strong>{label}</strong>
                      <span>{description}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div className="console-sidebar__footer">
        <span>{session.tenant?.name}</span>
        <strong>
          {session.tenant?.mode === 'platform' ? t('workspaceMode.platform') : t('workspaceMode.tenant')}
        </strong>
      </div>
    </aside>
  );
}
