'use client';
import * as React from 'react';
import { cn } from '../../utils/cn';

export type DrawerProps = {
  /** Whether the drawer is open */
  open: boolean;
  /** Called when the user requests close (scrim click / Esc) */
  onClose: () => void;
  /** Side to slide in from */
  side?: 'right' | 'left';
  /** Width in px or any CSS length — default 420px */
  width?: number | string;
  /** Drawer title — shown in header bar */
  title?: React.ReactNode;
  /** Optional footer slot */
  footer?: React.ReactNode;
  /** Body content */
  children: React.ReactNode;
  className?: string;
};

/**
 * Drawer — slide-in side panel.
 *
 * Uses --vx-z-drawer (2000) and --vx-z-modal-bg (1900) for the scrim.
 * Press Esc or click the scrim to dismiss.
 *
 * @example
 *   const [open, setOpen] = useState(false);
 *   <Drawer open={open} onClose={() => setOpen(false)} title="Model Details">
 *     ...details...
 *   </Drawer>
 */
export function Drawer({
  open,
  onClose,
  side = 'right',
  width = 420,
  title,
  footer,
  children,
  className,
}: DrawerProps) {
  /* Esc to close */
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /* Lock body scroll while open */
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const widthCss = typeof width === 'number' ? `${width}px` : width;

  return (
    <div className={cn('vx-drawer-root', `vx-drawer-root--${side}`, className)}>
      <div className="vx-drawer__scrim" onClick={onClose} aria-hidden />
      <div
        className="vx-drawer__panel"
        role="dialog"
        aria-modal="true"
        style={{ width: widthCss }}
      >
        {title && (
          <div className="vx-drawer__header">
            <div className="vx-drawer__title">{title}</div>
            <button
              type="button"
              className="vx-drawer__close"
              onClick={onClose}
              aria-label="Close drawer"
            >✕</button>
          </div>
        )}
        <div className="vx-drawer__body">{children}</div>
        {footer && <div className="vx-drawer__footer">{footer}</div>}
      </div>
    </div>
  );
}
