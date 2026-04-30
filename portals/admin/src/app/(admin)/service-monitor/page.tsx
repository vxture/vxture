import { ServiceHealthPage } from '@/modules/ops/ServiceHealthPage';

export default function AdminServiceMonitorRoute() {
  return (
    <ServiceHealthPage
      eyebrow="能力与服务"
      title="服务监控"
      description="查看服务运行详情、响应时间、错误率、可用性指标和告警定位信号。"
    />
  );
}
