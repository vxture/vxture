import type { ReactNode } from 'react';

export interface DetailField {
  label: string;
  value: ReactNode;
}

export function DetailPanel({
  title,
  description,
  fields,
  children,
  actions,
}: {
  title: string;
  description?: string;
  fields?: DetailField[];
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="vx-detail-panel">
      <div className="vx-detail-panel__header">
        <div>
          <h3 className="vx-card-title">{title}</h3>
          {description ? <p className="vx-card__description">{description}</p> : null}
        </div>
      </div>
      {fields?.length ? (
        <div className="vx-detail-grid">
          {fields.map((field) => (
            <div key={field.label}>
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {children ? <div className="vx-detail-panel__body">{children}</div> : null}
      {actions ? <div className="vx-detail-panel__actions">{actions}</div> : null}
    </div>
  );
}
