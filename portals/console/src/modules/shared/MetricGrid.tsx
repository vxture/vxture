import { MetricCard, type StatusBadgeTone } from '@vxture/design-system';
import type { SummaryMetric } from '@/entities/console';

function metricTone(tone: SummaryMetric['tone']): StatusBadgeTone {
  if (tone === 'positive') {
    return 'success';
  }
  if (tone === 'warning') {
    return 'warning';
  }
  return 'neutral';
}

export function MetricGrid({ items }: { items: SummaryMetric[] }) {
  return (
    <div className="vx-metric-grid">
      {items.map((item) => (
        <MetricCard
          key={item.label}
          className="vx-metric-card"
          label={item.label}
          value={item.value}
          trend={item.trend}
          trendTone={metricTone(item.tone)}
        />
      ))}
    </div>
  );
}
