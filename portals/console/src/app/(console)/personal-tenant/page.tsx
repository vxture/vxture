import { TenantPlaceholderPage } from '@/modules/shared/TenantPlaceholderPage';

export default function Page() {
  return (
    <TenantPlaceholderPage
      eyebrow="账户与租户"
      title="我的租户"
      description="展示个人租户信息，仅 tenant_type=individual 时可见。"
      signals={[
        { title: '个人空间资料', description: '展示个人租户名称、标识和状态。' },
        { title: '默认权限', description: '个人租户所有者能力与限制说明。' },
        { title: '关联资源', description: '后续展示个人空间内资源和订阅归属。' },
      ]}
    />
  );
}
