import { TenantPlaceholderPage } from '@/modules/shared/TenantPlaceholderPage';

export default function Page() {
  return (
    <TenantPlaceholderPage
      eyebrow="高级设置"
      title="通知提醒"
      description="配置邮件和站内信通知偏好。"
      signals={[
        { title: '邮件通知', description: '订阅、账单、配额和成员事件的邮件提醒。' },
        { title: '站内信', description: '控制台内消息提醒和未读聚合。' },
        { title: '接收人规则', description: '后续支持按角色配置通知接收范围。' },
      ]}
    />
  );
}
