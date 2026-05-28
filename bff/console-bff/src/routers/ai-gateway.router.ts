/**
 * ai-gateway.router.ts - AI 模型与授权管理路由
 * @package @vxture/bff-console
 *
 * 代理 console portal 的 AI 模型/授权 CRUD 请求到 ai-gateway 服务。
 * 所有端点要求 platform.model.manage 能力（运营人员权限）。
 *
 * 上游：AI_GATEWAY_URL（默认 http://localhost:3100）
 * 上游路径前缀：/ai/gateway/admin
 */

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { VxConfigService } from "@vxture/core-config";
import type { RequestContext } from "../types/console.types";

// ─── 配置 ─────────────────────────────────────────────────────────────────────

// ─── 守卫 ─────────────────────────────────────────────────────────────────────

function requireModelManageCapability(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException("No active session");
  }
  if (!req.capabilities?.includes("platform.model.manage")) {
    throw new ForbiddenException("platform.model.manage capability required");
  }
}

// ─── 代理工具 ─────────────────────────────────────────────────────────────────

async function readJson(response: globalThis.Response): Promise<unknown> {
  if (response.status === 204 || response.headers.get("content-length") === "0")
    return {};
  const text = await response.text();
  if (!text) return {};
  return JSON.parse(text);
}

async function proxyGet(
  adminBase: string,
  path: string,
): Promise<{ status: number; data: unknown }> {
  const response = await fetch(adminBase + path);
  return { status: response.status, data: await readJson(response) };
}

async function proxyPost(
  adminBase: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: unknown }> {
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) init.body = JSON.stringify(body);
  const response = await fetch(adminBase + path, init);
  return { status: response.status, data: await readJson(response) };
}

async function proxyPut(
  adminBase: string,
  path: string,
  body: unknown,
): Promise<{ status: number; data: unknown }> {
  const response = await fetch(adminBase + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, data: await readJson(response) };
}

async function proxyDelete(
  adminBase: string,
  path: string,
): Promise<{ status: number; data: unknown }> {
  const response = await fetch(adminBase + path, { method: "DELETE" });
  return { status: response.status, data: await readJson(response) };
}

// ─── Router ───────────────────────────────────────────────────────────────────

@Controller("api/ai-gateway")
export class AiGatewayRouter {
  private readonly adminBase: string;

  constructor(@Inject(VxConfigService) configService: VxConfigService) {
    const gatewayUrl = configService.platform.AI_GATEWAY_URL.trim().replace(
      /\/+$/,
      "",
    );
    this.adminBase = `${gatewayUrl}/ai/gateway/admin`;
  }

  // ── 模型列表 ──────────────────────────────────────────────────────────────

  @Get("models")
  async listModels(
    @Query("includeInactive") includeInactive: string,
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const qs = `?includeInactive=${includeInactive === "false" ? "false" : "true"}`;
    const { status, data } = await proxyGet(this.adminBase, `/models${qs}`);
    res.status(status).json(data);
  }

  // ── 创建模型 ──────────────────────────────────────────────────────────────

  @Post("models")
  @HttpCode(HttpStatus.CREATED)
  async createModel(
    @Body()
    body: {
      modelCode: string;
      modelName: string;
      provider: string;
      endpointUrl: string;
      protocol: string;
      capabilities: string[];
      apiKeyEnvVar: string;
      providerId?: string | null;
      config?: Record<string, unknown> | null;
    },
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const { status, data } = await proxyPost(this.adminBase, "/models", body);
    res.status(status).json(data);
  }

  // ── 更新模型 ──────────────────────────────────────────────────────────────

  @Put("models/:id")
  async updateModel(
    @Param("id") id: string,
    @Body()
    body: {
      modelCode?: string;
      modelName?: string;
      provider?: string;
      endpointUrl?: string;
      protocol?: string;
      capabilities?: string[];
      apiKeyEnvVar?: string;
      providerId?: string | null;
      config?: Record<string, unknown> | null;
      isActive?: boolean;
    },
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const { status, data } = await proxyPut(
      this.adminBase,
      `/models/${id}`,
      body,
    );
    res.status(status).json(data);
  }

  // ── 激活/停用模型 ─────────────────────────────────────────────────────────

  @Post("models/:id/activate")
  @HttpCode(HttpStatus.OK)
  async activateModel(
    @Param("id") id: string,
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const { status, data } = await proxyPost(
      this.adminBase,
      `/models/${id}/activate`,
    );
    res.status(status).json(data);
  }

  @Post("models/:id/deactivate")
  @HttpCode(HttpStatus.OK)
  async deactivateModel(
    @Param("id") id: string,
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const { status, data } = await proxyPost(
      this.adminBase,
      `/models/${id}/deactivate`,
    );
    res.status(status).json(data);
  }

  // ── 授权列表 ──────────────────────────────────────────────────────────────

  @Get("grants")
  async listGrants(
    @Query("modelId") modelId: string | undefined,
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const qs = modelId ? `?modelId=${encodeURIComponent(modelId)}` : "";
    const { status, data } = await proxyGet(this.adminBase, `/grants${qs}`);
    res.status(status).json(data);
  }

  // ── 创建授权 ──────────────────────────────────────────────────────────────

  @Post("grants")
  @HttpCode(HttpStatus.CREATED)
  async createGrant(
    @Body()
    body: {
      modelId: string;
      tenantId: string;
      agentId?: string | null;
      priority?: number | null;
      reason?: string | null;
      expiresAt?: string | null;
      isActive?: boolean;
    },
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const { status, data } = await proxyPost(this.adminBase, "/grants", body);
    res.status(status).json(data);
  }

  // ── 更新授权 ──────────────────────────────────────────────────────────────

  @Put("grants/:id")
  async updateGrant(
    @Param("id") id: string,
    @Body()
    body: {
      agentId?: string | null;
      priority?: number | null;
      reason?: string | null;
      expiresAt?: string | null;
      isActive?: boolean;
    },
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const { status, data } = await proxyPut(
      this.adminBase,
      `/grants/${id}`,
      body,
    );
    res.status(status).json(data);
  }

  // ── 激活授权 ──────────────────────────────────────────────────────────────

  @Post("grants/:id/activate")
  @HttpCode(HttpStatus.OK)
  async activateGrant(
    @Param("id") id: string,
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const { status, data } = await proxyPost(
      this.adminBase,
      `/grants/${id}/activate`,
    );
    res.status(status).json(data);
  }

  // ── 删除授权（停用） ──────────────────────────────────────────────────────

  @Delete("grants/:id")
  @HttpCode(HttpStatus.OK)
  async deleteGrant(
    @Param("id") id: string,
    @Req() req: Request & RequestContext,
    @Res() res: Response,
  ): Promise<void> {
    requireModelManageCapability(req);
    const { status, data } = await proxyDelete(this.adminBase, `/grants/${id}`);
    res.status(status).json(data);
  }
}
