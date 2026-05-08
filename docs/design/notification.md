# 通知系统设计

> ⏳ 待编制
>
> 本文档将描述 Vxture 的通知系统设计，包括：
> - 邮件通知流程（website-bff → service-mail → 阿里云 SMTP）
> - 短信验证码流程（auth-bff → service-sms）
> - 限流策略（Redis TTL / 每分钟 / 每小时 / 每天限额）
> - 通知模板管理
> - 未来：站内消息 / Push 通知扩展点
>
> **参考文档**：
> - `docs/context/status.md` — T01 邮件系统实施状态
> - `docs/packages/services/` — service-mail 等服务包
