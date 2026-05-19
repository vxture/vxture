/**
 * mail.types.ts - 邮件发送参数类型
 * @package @vxture/core-mail
 * @layer Infrastructure
 * @category Types
 *
 * @author AI-Generated
 * @date 2026-05-03
 */

// ============================================================================
// 发送参数
// ============================================================================

export interface MailPayload {
  /** 收件人，单个地址或地址数组 */
  to: string | string[];
  /** 邮件主题 */
  subject: string;
  /** HTML 正文（优先显示） */
  html: string;
  /** 纯文本降级正文（可选） */
  text?: string;
}

// ============================================================================
// 内部 SMTP 配置（读自 process.env，不对外暴露）
// ============================================================================

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}
