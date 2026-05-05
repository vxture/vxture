/**
 * sms.service.ts - 阿里云短信发送服务
 * @package @vxture/service-sms
 * @description 封装阿里云 Dysmsapi 短信发送，开发环境自动降级为控制台输出
 * @author AI-Generated
 * @date 2026-05-05
 */

import { Injectable } from '@nestjs/common';

// pop-core 没有内置类型，手动声明最小接口
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PopCore = require('@alicloud/pop-core') as new (config: {
  accessKeyId: string;
  accessKeySecret: string;
  endpoint: string;
  apiVersion: string;
}) => {
  request(action: string, params: Record<string, unknown>, options?: Record<string, unknown>): Promise<unknown>;
};

// ─── 类型 ─────────────────────────────────────────────────────────────────────

interface AliyunSmsResponse {
  Code: string;
  Message: string;
  RequestId: string;
  BizId?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class SmsService {
  /**
   * 发送验证码短信
   * @param phone 目标手机号（国内格式，如 13800138000）
   * @param code 6 位验证码
   * @throws Error 当阿里云返回非 OK 状态时
   */
  async sendVerifyCode(phone: string, code: string): Promise<void> {
    const signName = process.env['ALIYUN_SMS_SIGN_NAME'];
    const templateCode = process.env['ALIYUN_SMS_TEMPLATE_CODE'];

    // 开发环境降级：未配置凭据时打印到控制台
    if (!this.isConfigured()) {
      console.log(`[SMS Dev] phone=${phone} code=${code}`);
      return;
    }

    const client = new PopCore({
      accessKeyId: process.env['ALIYUN_SMS_ACCESS_KEY_ID']!,
      accessKeySecret: process.env['ALIYUN_SMS_ACCESS_KEY_SECRET']!,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25',
    });

    const response = (await client.request(
      'SendSms',
      {
        PhoneNumbers: phone,
        SignName: signName ?? '',
        TemplateCode: templateCode ?? '',
        TemplateParam: JSON.stringify({ code }),
      },
      { method: 'POST' },
    )) as AliyunSmsResponse;

    if (response.Code !== 'OK') {
      throw new Error(`短信发送失败：${response.Message}（${response.Code}）`);
    }
  }

  private isConfigured(): boolean {
    return Boolean(
      process.env['ALIYUN_SMS_ACCESS_KEY_ID'] &&
      process.env['ALIYUN_SMS_ACCESS_KEY_SECRET'] &&
      process.env['ALIYUN_SMS_SIGN_NAME'] &&
      process.env['ALIYUN_SMS_TEMPLATE_CODE'],
    );
  }
}
