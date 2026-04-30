/**
 * auth.service.ts - Ruyin Agent BFF auth utilities
 * @package @vxture/bff-ruyinagent
 *
 * Description: Verifies platform access tokens and projects them into BFF request user context.
 *
 * @author AI-Generated
 * @date 2026-04-22
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Service
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtAccessPayload } from '@vxture/core-auth';
import { VxConfigService } from '@vxture/core-config';
import type { AgentViewer } from '../types/auth.types';

@Injectable()
export class AgentAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: VxConfigService,
  ) {}

  verifyAccessToken(token: string): JwtAccessPayload {
    return this.jwtService.verify<JwtAccessPayload>(token, {
      secret: this.configService.auth.JWT_SECRET,
    });
  }

  buildViewer(payload: JwtAccessPayload): AgentViewer {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      permissions: payload.permissions ?? [],
      provider: payload.provider,
    };
  }
}
