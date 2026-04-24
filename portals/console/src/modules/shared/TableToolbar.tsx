import type { ReactNode } from 'react';

export function TableToolbar({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="vx-table-toolbar">
      <div className="vx-table-toolbar__copy">
        <strong>{title}</strong>
        {hint ? <span>{hint}</span> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
