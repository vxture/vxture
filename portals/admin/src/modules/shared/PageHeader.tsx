import type { ReactNode } from 'react';
import { Icon } from '@vxture/design-system';
import type { IconName } from '@vxture/design-system';

export function PageHeader({
  icon = 'squares-four',
  title,
  description,
  action,
  secondary,
}: {
  eyebrow?: string;
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <section className={`vx-page-header admin-overview-heading admin-overview-heading--page vx-page-header--icon-${icon}`}>
      <span className="vx-page-header__icon admin-overview-heading__icon" aria-hidden="true">
        <Icon name={icon} size="lg" fallback="placeholder" />
      </span>
      <div className="vx-page-header__copy admin-overview-heading__copy">
        <h1>{title}</h1>
        <p className="vx-page-header__description">{description}</p>
      </div>
      {secondary || action ? (
        <div className="vx-page-header__actions">
          {secondary}
          {action}
        </div>
      ) : null}
    </section>
  );
}
