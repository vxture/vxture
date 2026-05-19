/**
 * confirm.router.ts - POST /vela/confirm 执行确认透传路由
 * @package @vxture/bff-vela
 * @layer Application
 * @category Router
 *
 * @description
 *   接收前端的确认 / 取消请求，将 CallerContext 编码后透传给 agent-server/vela
 *   的 POST /internal/vela/confirm 接口，直接返回 JSON 响应（非 SSE）。
 *
 * @author AI-Generated
 * @date 2026-04-30
 */

import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import type { VelaRequest } from "../types/chat.types";

// ============================================================================
// DTO
// ============================================================================

interface ConfirmBffRequestDto {
  auditId: string;
  confirmed: boolean;
  sessionId?: string;
}

// ============================================================================
// ConfirmRouter
// ============================================================================

@Controller("vela")
export class ConfirmRouter {
  @Post("confirm")
  @HttpCode(200)
  async confirm(
    @Req() req: Request,
    @Body() body: ConfirmBffRequestDto,
  ): Promise<unknown> {
    if (!body.auditId || typeof body.auditId !== "string") {
      throw new BadRequestException({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "auditId is required",
      });
    }
    if (typeof body.confirmed !== "boolean") {
      throw new BadRequestException({
        statusCode: 400,
        code: "BAD_REQUEST",
        message: "confirmed must be boolean",
      });
    }

    const ctx = (req as VelaRequest).callerContext;
    const encoded = Buffer.from(JSON.stringify(ctx)).toString("base64");

    const serverUrl =
      process.env["VELA_SERVER_INTERNAL_URL"] ?? "http://localhost:3122";

    let upstream: globalThis.Response;
    try {
      upstream = await fetch(`${serverUrl}/internal/vela/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Vela-Context": encoded,
        },
        body: JSON.stringify({
          auditId: body.auditId,
          confirmed: body.confirmed,
          sessionId: body.sessionId,
        }),
      });
    } catch {
      throw new HttpException(
        {
          statusCode: 503,
          code: "SERVICE_UNAVAILABLE",
          message: "Upstream service unavailable",
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const json = (await upstream.json()) as unknown;

    if (!upstream.ok) {
      throw new BadRequestException(json);
    }

    return json;
  }
}
