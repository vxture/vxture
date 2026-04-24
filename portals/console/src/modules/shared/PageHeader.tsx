import type { ReactNode } from 'react';

export function PageHeader({
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
      <div className="vx-page-header__title-row">
        <h1>{title}</h1>
        {secondary}
        {action ? <div className="vx-page-header__actions">{action}</div> : null}
      </div>
      <p className="vx-page-header__description">{description}</p>
    </section>
  );
}
