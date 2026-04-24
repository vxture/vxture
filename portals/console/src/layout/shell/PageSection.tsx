import type { ReactNode } from 'react';

export function PageSection({
  title,
  description,
  action,
  children,
  tone = 'default',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  tone?: 'default' | 'muted';
}) {
  return (
    <section className={`vx-page-section vx-page-section--${tone}`}>
      {(title || description || action) ? (
        <header className="vx-page-section__header">
          <div>
            {title ? <h2 className="vx-page-section__title">{title}</h2> : null}
            {description ? <p className="vx-page-section__description">{description}</p> : null}
          </div>
          {action ? <div className="vx-page-section__action">{action}</div> : null}
        </header>
      ) : null}
      <div className="vx-page-section__body">{children}</div>
    </section>
  );
}
