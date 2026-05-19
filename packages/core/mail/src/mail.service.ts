/**
 * mail.service.ts - 事务邮件发送服务
 * @package @vxture/core-mail
 * @layer Infrastructure
 * @category Service
 *
 * @description
 *   封装 nodemailer，提供单一 send() 接口。
 *   SMTP 配置从 process.env 读取（由消费方的 VxConfigModule 在启动时载入 .env）。
 *   未配置 SMTP_HOST 时进入静默 no-op 模式：send() 仅打印警告，不抛出异常，
 *   确保本地开发和 CI 环境无需邮件服务即可正常启动。
 *
 * @author AI-Generated
 * @date 2026-05-03
 */

import { Injectable, Logger } from "@nestjs/common";
import nodemailer from "nodemailer";
import type { MailPayload, SmtpConfig } from "./mail.types";

// ============================================================================
// MailService
// ============================================================================

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: ReturnType<
    typeof nodemailer.createTransport
  > | null;
  private readonly from: string;

  constructor() {
    const config = resolveSmtpConfig();

    if (!config) {
      this.transporter = null;
      this.from = "";
      this.logger.warn(
        "SMTP_HOST 未配置，邮件服务以 no-op 模式运行，所有 send() 调用将被静默跳过",
      );
      return;
    }

    this.from = config.from;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    this.logger.log(
      `邮件服务已初始化 [${config.host}:${config.port}，from: ${config.from}]`,
    );
  }

  // ============================================================================
  // 公共接口
  // ============================================================================

  /**
   * 发送一封事务邮件。
   * 未配置 SMTP 时静默返回，不抛出异常。
   * 发送失败时抛出原始 Error，由调用方决定是否 swallow。
   */
  async send(payload: MailPayload): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `[no-op] 跳过发送邮件：subject="${payload.subject}" to="${[payload.to].flat().join(", ")}"`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: Array.isArray(payload.to) ? payload.to.join(", ") : payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    this.logger.log(
      `邮件已发送：subject="${payload.subject}" to="${[payload.to].flat().join(", ")}"`,
    );
  }
}

// ============================================================================
// 内部：从 process.env 解析 SMTP 配置
// ============================================================================

function resolveSmtpConfig(): SmtpConfig | null {
  const host = process.env["SMTP_HOST"]?.trim();
  if (!host) return null;

  const user = process.env["SMTP_USER"]?.trim() ?? "";
  const pass = process.env["SMTP_PASS"]?.trim() ?? "";
  const from = process.env["SMTP_FROM"]?.trim() || `Vxture <noreply@${host}>`;
  const port = Number(process.env["SMTP_PORT"] ?? 465);
  const secure = process.env["SMTP_SECURE"] !== "false";

  return { host, port, secure, user, pass, from };
}
