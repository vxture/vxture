/**
 * captcha.service.ts - 滑动验证码服务（服务端签名与校验）
 * @package @vxture/bff-admin
 *
 * Description: 生成 JWT 签名的验证码挑战令牌，并在服务端校验滑块位置比例。
 * 每个令牌只可使用一次（jti 黑名单防重放），TTL 5 分钟。
 * 密钥在进程启动时随机生成，重启后旧令牌自动失效。
 *
 * @author AI-Generated
 * @date 2026-05-02
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Service
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID } from 'node:crypto';

// ─── 配置常量 ─────────────────────────────────────────────────────────────────

const CAPTCHA_TTL_SECONDS = 300;      // 令牌有效期：5 分钟
const TOLERANCE_RATIO = 0.06;         // 允许 ±6% 位置偏差（约 ±12px / 200px 宽滑块）
const TARGET_MIN = 0.42;              // 目标位置最小比例
const TARGET_RANGE = 0.36;            // 目标位置随机范围（上限 0.78）

// ─── 类型 ─────────────────────────────────────────────────────────────────────

interface CaptchaPayload {
  targetRatio: number;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface CaptchaChallenge {
  token: string;
  targetRatio: number;
}

// ─── 服务 ─────────────────────────────────────────────────────────────────────

@Injectable()
export class CaptchaService {
  /** 进程级一次性密钥，重启后旧令牌自动失效 */
  private readonly secret = randomBytes(32).toString('hex');
  /** jti 黑名单：已使用或已失效的令牌 ID → 过期时间戳 */
  private readonly usedJtis = new Map<string, number>();

  constructor(private readonly jwtService: JwtService) {}

  /** 生成一个新的滑块验证码挑战，返回签名令牌和目标位置比例 */
  generateChallenge(): CaptchaChallenge {
    this.purgeExpiredJtis();
    const targetRatio = TARGET_MIN + Math.random() * TARGET_RANGE;
    const jti = randomUUID();
    const token = this.jwtService.sign(
      { targetRatio, jti } satisfies Omit<CaptchaPayload, 'iat' | 'exp'>,
      { secret: this.secret, expiresIn: CAPTCHA_TTL_SECONDS },
    );
    return { token, targetRatio };
  }

  /**
   * 校验验证码挑战令牌和滑块位置。
   * 校验失败抛出 UnauthorizedException。
   * @param token BFF 签发的挑战令牌
   * @param captchaPosition 用户实际滑块位置比例 (offset / sliderMax)，范围 [0, 1]
   */
  verifyChallenge(token: string, captchaPosition: number): void {
    let payload: CaptchaPayload;

    try {
      payload = this.jwtService.verify<CaptchaPayload>(token, { secret: this.secret });
    } catch {
      throw new UnauthorizedException('验证码已过期，请重新获取');
    }

    // 记录 jti（无论成功与否），防止用同一令牌枚举位置
    const expiry = Date.now() + CAPTCHA_TTL_SECONDS * 1000;
    const alreadyUsed = this.usedJtis.has(payload.jti);
    this.usedJtis.set(payload.jti, expiry);

    if (alreadyUsed) {
      throw new UnauthorizedException('验证码已使用，请重新获取');
    }

    if (Math.abs(captchaPosition - payload.targetRatio) > TOLERANCE_RATIO) {
      throw new UnauthorizedException('验证码位置不正确，请重试');
    }
  }

  // ─── 私有方法 ──────────────────────────────────────────────────────────────

  private purgeExpiredJtis(): void {
    const now = Date.now();
    for (const [jti, expiry] of this.usedJtis) {
      if (now > expiry) {
        this.usedJtis.delete(jti);
      }
    }
  }
}
