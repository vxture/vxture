'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { buildBreadcrumbs } from '@/config/routes';
import { useConsoleTranslations } from '@/lib/console-intl';

export function Breadcrumbs() {
  const pathname = usePathname();
  const items = buildBreadcrumbs(pathname);
  const t = useConsoleTranslations('routes');

  return (
    <nav className="vx-breadcrumbs" aria-label="Breadcrumb">
      <ol className="vx-breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const label = t(item.label);
          return (
            <li key={item.href} className="vx-breadcrumbs__item">
              {isLast ? (
                <span className="vx-breadcrumbs__current">{label}</span>
              ) : (
                <Link href={item.href} className="vx-breadcrumbs__link">
                  {label}
                </Link>
              )}
              {!isLast ? <span className="vx-breadcrumbs__sep">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
