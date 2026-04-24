import type { ReactNode } from 'react';

export interface SectionNavItem {
  key: string;
  label: string;
  description?: string;
  meta?: ReactNode;
}

export function SectionNav({
  items,
  activeKey,
  onSelect,
}: {
  items: SectionNavItem[];
  activeKey: string;
  onSelect?: (key: string) => void;
}) {
  return (
    <nav className="vx-section-nav" aria-label="Section navigation">
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <button
            key={item.key}
            type="button"
            className={isActive ? 'vx-section-nav__item vx-section-nav__item--active' : 'vx-section-nav__item'}
            onClick={() => onSelect?.(item.key)}
          >
            <div className="vx-section-nav__copy">
              <strong>{item.label}</strong>
              {item.description ? <span>{item.description}</span> : null}
            </div>
            {item.meta ? <div className="vx-section-nav__meta">{item.meta}</div> : null}
          </button>
        );
      })}
    </nav>
  );
}
