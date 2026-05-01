/**
 * surface.middleware.ts - Surface 校验与 CallerContext 构造中间件
 * @package @vxture/bff-vela
 * @layer Application
 * @category Middleware
 *
 * @description
 *   读取 X-Vela-Surface Header，校验与 JWT userType 的合法组合，
 *   构造 CallerContext 并挂载到 req.callerContext。
 *   Surface 校验逻辑只在本文件，router 不得重复校验。
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import { ForbiddenException, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ADMIN_TOOLS, CONSOLE_TOOLS } from '../tools/tool-whitelist.const';
import type { CallerContext, VelaSurface, VelaUserType } from '../types/caller-context.types';
import type { VelaRequest } from '../types/chat.types';

// ============================================================================
// Surface × userType 合法矩阵（唯一权威定义，与 spec §4.3 保持一致）
// ============================================================================

const VALID_COMBINATIONS: Record<VelaSurface, VelaUserType> = {
  admin:   'operator',
  console: 'tenant_user',
};

const VALID_SURFACES = new Set<string>(['admin', 'console']);

@Injectable()
export class SurfaceMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const surface = req.headers['x-vela-surface'] as string | undefined;
    const { userType, userId, role, tenantId } = (req as VelaRequest).user;

    if (!surface || !VALID_SURFACES.has(surface)) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'SURFACE_FORBIDDEN',
        message: 'Missing or invalid X-Vela-Surface header',
      });
    }

    const validUserType = VALID_COMBINATIONS[surface as VelaSurface];
    if (validUserType !== userType) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'SURFACE_FORBIDDEN',
        message: 'Surface and userType mismatch',
      });
    }

    const velaSurface = surface as VelaSurface;

    const callerContext: CallerContext = {
      surface:      velaSurface,
      userId,
      userType,
      role,
      tenantId:     tenantId ?? null,
      allowedTools: velaSurface === 'admin' ? ADMIN_TOOLS : CONSOLE_TOOLS,
      dataScope:    velaSurface === 'admin' ? 'global' : 'tenant',
    };

    (req as VelaRequest).callerContext = callerContext;
    next();
  }
}
