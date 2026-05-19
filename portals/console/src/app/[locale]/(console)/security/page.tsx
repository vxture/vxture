import { TenantPlaceholderPage } from "@/modules/shared/TenantPlaceholderPage";

export default function Page() {
  return (
    <TenantPlaceholderPage
      eyebrow="高级设置"
      title="安全设置"
      description="预留登录日志、设备管理和后续安全治理能力。"
      signals={[
        {
          title: "登录日志",
          description: "后续展示账号登录时间、地点和设备。",
        },
        { title: "设备管理", description: "后续支持查看并移除已登录设备。" },
        {
          title: "安全策略",
          description: "后续支持 MFA、密码策略和异常登录提醒。",
        },
      ]}
    />
  );
}
