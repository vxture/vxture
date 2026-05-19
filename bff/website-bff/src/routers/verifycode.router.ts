/**
 * verifycode.router.ts - 验证码发送与校验路由
 * @package @vxture/bff-website
 * @layer Application
 * @category Router
 *
 * 接口：
 *   POST /api/send-code    → 发送邮箱验证码（含限流）
 *   POST /api/verify-code  → 校验验证码（一次性）
 *
 * @author AI-Generated
 * @date 2026-05-02
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 */

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from "@nestjs/common";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { VerifyCodeService } from "@vxture/service-mail";

// ─── DTO ──────────────────────────────────────────────────────────────────────

class SendCodeDto {
  @IsEmail({}, { message: "请输入有效的邮箱地址" })
  email!: string;
}

class VerifyCodeDto {
  @IsEmail({}, { message: "请输入有效的邮箱地址" })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: "验证码为 6 位数字" })
  code!: string;
}

// ─── Router ───────────────────────────────────────────────────────────────────

@Controller("api")
export class VerifyCodeRouter {
  constructor(
    @Inject(VerifyCodeService)
    private readonly verifyCodeService: VerifyCodeService,
  ) {}

  /** 发送验证码；限流命中时返回 429 */
  @Post("send-code")
  @HttpCode(HttpStatus.OK)
  async sendCode(@Body() dto: SendCodeDto): Promise<{ message: string }> {
    await this.verifyCodeService.sendCode(dto.email);
    return { message: "验证码已发送，请注意查收" };
  }

  /** 校验验证码；返回 valid 布尔值 */
  @Post("verify-code")
  @HttpCode(HttpStatus.OK)
  async verifyCode(@Body() dto: VerifyCodeDto): Promise<{ valid: boolean }> {
    const valid = await this.verifyCodeService.verifyCode(dto.email, dto.code);
    return { valid };
  }
}
