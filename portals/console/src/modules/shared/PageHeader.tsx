import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  secondary,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <section className="vx-page-header">
      <div className="vx-page-header__copy">
        {eyebrow ? <p className="vx-page-header__eyebrow">{eyebrow}</p> : null}
        <div className="vx-page-header__title-row">
          <h1>{title}</h1>
          {secondary}
        </div>
        <p className="vx-page-header__description">{description}</p>
      </div>
      {action ? <div className="vx-page-header__actions">{action}</div> : null}
    </section>
  );
}
