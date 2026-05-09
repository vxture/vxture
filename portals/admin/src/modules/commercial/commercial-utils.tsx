import type { IconName } from '@vxture/design-system';
import { Icon } from '@vxture/design-system';
import { Badge, Button } from '@vxture/design-system';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];
export type ViewMode = 'list' | 'cards';

export function formatCurrency(value: number, currency = 'CNY', maximumFractionDigits = 0) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value);
}

export function tierTone(tierName: string | null | undefined) {
  const normalized = (tierName ?? '').toLowerCase();
  if (normalized === 'free') return 'free';
  if (normalized === 'pro') return 'pro';
  if (normalized === 'enterprise') return 'enterprise';
  return 'other';
}

export function PageSizePicker({ value, onChange }: { value: PageSize; onChange: (value: PageSize) => void }) {
  return (
    <div className="vx-tenant-page-size" aria-label="每页条数">
      {PAGE_SIZE_OPTIONS.map((option) => (
        <span key={option}>
          <Button
            variant="ghost"
            size="sm"
            className={value === option ? 'is-active' : undefined}
            onClick={() => onChange(option)}
            aria-label={`每页 ${option} 条`}
          >
            {option}
          </Button>
        </span>
      ))}
    </div>
  );
}

export function SummaryItem({
  icon,
  label,
  value,
  tags,
  tone = 'blue',
}: {
  icon: IconName;
  label: string;
  value: string;
  tags?: string[];
  tone?: 'blue' | 'green' | 'amber' | 'rose';
}) {
  return (
    <article className={`vx-tenant-summary__item vx-tenant-tone--${tone}`}>
      <Icon name={icon} size="lg" fallback="placeholder" />
      <div>
        <span>{label}</span>
        <p>
          <strong>{value}</strong>
          {tags?.map((tag) => <em key={tag}>{tag}</em>)}
        </p>
      </div>
    </article>
  );
}

export function Tag({ tone, children, title }: { tone: string; children: string; title?: string }) {
  return (
    <Badge className={`vx-tenant-pill vx-commercial-pill vx-commercial-pill--${tone}`} title={title}>
      {children}
    </Badge>
  );
}
