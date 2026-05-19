/**
 * sms.module.ts - 短信服务 NestJS 模块
 * @package @vxture/service-sms
 * @description 注册 SMS 服务和 Redis 客户端
 *
 * 环境变量：
 *   ALIYUN_SMS_ACCESS_KEY_ID       - 阿里云 AccessKey ID（必填）
 *   ALIYUN_SMS_ACCESS_KEY_SECRET   - 阿里云 AccessKey Secret（必填）
 *   ALIYUN_SMS_SIGN_NAME           - 短信签名（必填）
 *   ALIYUN_SMS_TEMPLATE_CODE       - 短信模板 Code（必填）
 *   REDIS_URL / REDIS_HOST+PORT    - Redis 连接（必填）
 *
 * @author AI-Generated
 * @date 2026-05-05
 */

import { Module } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "../constants/tokens";
import { SmsService } from "../service/sms.service";
import { PhoneCodeService } from "../service/phone-code.service";

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const url = process.env["REDIS_URL"];
        if (url) {
          return new Redis(url);
        }
        return new Redis({
          host: process.env["REDIS_HOST"] ?? "localhost",
          port: Number(process.env["REDIS_PORT"] ?? 6379),
        });
      },
    },
    SmsService,
    PhoneCodeService,
  ],
  exports: [SmsService, PhoneCodeService],
})
export class SmsModule {}
