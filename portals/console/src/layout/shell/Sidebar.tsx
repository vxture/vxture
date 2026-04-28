'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@vxture/design-system';
import { TenantSwitcher } from '@/components/navigation/tenant-switcher';
import { navigationSections } from '@/config/navigation';
import { hasCapability } from '@/features/permissions/can';
import { useConsoleSession } from '@/features/session/ConsoleSessionProvider';
import { useConsoleTranslations } from '@/lib/console-intl';

export function Sidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const { session } = useConsoleSession();
  const headerT = useConsoleTranslations('header');
  const t = useConsoleTranslations('sidebar');

  return (
    <aside id="vx-console-sidebar" className={collapsed ? 'vx-shell-sidebar vx-shell-sidebar--collapsed' : 'vx-shell-sidebar'}>
      <div className={collapsed ? 'vx-shell-sidebar__topbar vx-shell-sidebar__topbar--collapsed' : 'vx-shell-sidebar__topbar'}>
        <button
          type="button"
          className="vx-shell-icon-button vx-shell-icon-button--rail"
          aria-label={collapsed ? headerT('openNavigation') : headerT('collapseNavigation')}
          aria-expanded={collapsed ? 'false' : 'true'}
          aria-controls="vx-console-sidebar"
          title={collapsed ? headerT('openNavigation') : headerT('collapseNavigation')}
          onClick={onToggleCollapse}
        >
          <span className="vx-shell-sidebar__toggle-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <div className="vx-shell-sidebar__tenant-switcher">
        <TenantSwitcher />
      </div>

      <nav className="vx-shell-nav" aria-label={t('ariaLabel')}>
        {navigationSections.map((section) => {
          const items = section.items.filter((item) => {
            const allowedByCapability = hasCapability(session.capabilities, item.capability);
            const tenantType = session.tenant?.mode === 'tenant' ? session.tenant.tenantType : undefined;
            const allowedByTenantType =
              !item.tenantTypes ||
              (tenantType ? item.tenantTypes.includes(tenantType) : false);

            return allowedByCapability && allowedByTenantType;
          });
          if (items.length === 0) {
            return null;
          }

          return (
            <div key={section.titleKey} className="vx-shell-nav__group">
              <p className="vx-shell-nav__group-title">{t(`sections.${section.titleKey}`)}</p>
              <div className="vx-shell-nav__items">
                {items.map((item) => {
                  const isActive = pathname === item.href;
                  const label = t(`items.${item.labelKey}`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={label}
                      className={isActive ? 'vx-shell-nav__item vx-shell-nav__item--active' : 'vx-shell-nav__item'}
                    >
                      <Icon name={item.icon} size={20} className="vx-shell-nav__icon" fallback="placeholder" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="vx-shell-sidebar__footer" aria-hidden={collapsed}>
        <div>
          <span>{t('footer.label')}</span>
          <strong>{t('footer.value')}</strong>
        </div>
      </div>
    </aside>
  );
}
