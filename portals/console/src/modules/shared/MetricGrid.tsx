import { Badge, Card, CardContent, CardHeader } from '@vxture/design-system';
import type { SummaryMetric } from '@/entities/console';

export function MetricGrid({ items }: { items: SummaryMetric[] }) {
  return (
    <div className="vx-metric-grid">
      {items.map((item) => (
        <Card key={item.label} className="vx-metric-card">
          <CardHeader className="vx-metric-card__header">
            <span>{item.label}</span>
            {item.trend ? (
              <Badge className={item.tone === 'warning' ? 'vx-badge-warning' : 'vx-badge-neutral'}>
                {item.trend}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="vx-metric-card__content">
            <strong>{item.value}</strong>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
