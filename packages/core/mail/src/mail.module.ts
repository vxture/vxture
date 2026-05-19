/**
 * mail.module.ts - 邮件模块（全局单例）
 * @package @vxture/core-mail
 * @layer Infrastructure
 * @category Module
 *
 * @description
 *   @Global() 装饰器使 MailService 在整个 NestJS 应用中以单例形式可用，
 *   消费方只需在根 AppModule 中 import MailModule 一次，无需在每个子模块重复导入。
 *
 * @author AI-Generated
 * @date 2026-05-03
 */

import { Global, Module } from "@nestjs/common";
import { MailService } from "./mail.service";

@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
