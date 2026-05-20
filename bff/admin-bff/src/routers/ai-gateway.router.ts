import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { VxConfigService } from "@vxture/core-config";

import type {
  AiModelGrantRecord,
  AiModelRecord,
  RequestContext,
} from "../types/console.types";

type JsonObject = Record<string, unknown>;

interface GatewayErrorBody {
  message?: string | string[];
}

@Controller("api/ai-gateway")
export class AiGatewayRouter {
  private readonly gatewayUrl: string;

  constructor(configService: VxConfigService) {
    this.gatewayUrl = configService.platform.AI_GATEWAY_URL.trim().replace(
      /\/+$/,
      "",
    );
  }

  private request<T>(
    path: string,
    options?: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: JsonObject },
  ): Promise<T> {
    return gatewayRequest<T>(path, options, this.gatewayUrl);
  }

  @Get("models")
  listModels(
    @Req() req: Request & RequestContext,
    @Query("includeInactive") includeInactive?: string,
  ): Promise<AiModelRecord[]> {
    assertCanManageModels(req);
    return this.request<AiModelRecord[]>(
      `/ai/gateway/admin/models?includeInactive=${includeInactive === "false" ? "false" : "true"}`,
    );
  }

  @Post("models")
  createModel(
    @Req() req: Request & RequestContext,
    @Body() body: JsonObject,
  ): Promise<AiModelRecord> {
    assertCanManageModels(req);
    return this.request<AiModelRecord>("/ai/gateway/admin/models", {
      method: "POST",
      body,
    });
  }

  @Put("models/:modelId")
  updateModel(
    @Req() req: Request & RequestContext,
    @Param("modelId") modelId: string,
    @Body() body: JsonObject,
  ): Promise<AiModelRecord> {
    assertCanManageModels(req);
    return this.request<AiModelRecord>(
      `/ai/gateway/admin/models/${encodeURIComponent(modelId)}`,
      {
        method: "PUT",
        body,
      },
    );
  }

  @Post("models/:modelId/activate")
  activateModel(
    @Req() req: Request & RequestContext,
    @Param("modelId") modelId: string,
  ): Promise<AiModelRecord> {
    assertCanManageModels(req);
    return this.request<AiModelRecord>(
      `/ai/gateway/admin/models/${encodeURIComponent(modelId)}/activate`,
      {
        method: "POST",
      },
    );
  }

  @Post("models/:modelId/deactivate")
  deactivateModel(
    @Req() req: Request & RequestContext,
    @Param("modelId") modelId: string,
  ): Promise<AiModelRecord> {
    assertCanManageModels(req);
    return this.request<AiModelRecord>(
      `/ai/gateway/admin/models/${encodeURIComponent(modelId)}/deactivate`,
      {
        method: "POST",
      },
    );
  }

  @Delete("models/:modelId")
  deleteModel(
    @Req() req: Request & RequestContext,
    @Param("modelId") modelId: string,
  ): Promise<AiModelRecord> {
    assertCanManageModels(req);
    return this.request<AiModelRecord>(
      `/ai/gateway/admin/models/${encodeURIComponent(modelId)}`,
      {
        method: "DELETE",
      },
    );
  }

  @Get("grants")
  listGrants(
    @Req() req: Request & RequestContext,
    @Query("tenantId") tenantId?: string,
    @Query("modelId") modelId?: string,
  ): Promise<AiModelGrantRecord[]> {
    assertCanManageModels(req);

    const params = new URLSearchParams();
    if (tenantId) params.set("tenantId", tenantId);
    if (modelId) params.set("modelId", modelId);

    return this.request<AiModelGrantRecord[]>(
      `/ai/gateway/admin/grants${params.size ? `?${params.toString()}` : ""}`,
    );
  }

  @Post("grants")
  createGrant(
    @Req() req: Request & RequestContext,
    @Body() body: JsonObject,
  ): Promise<AiModelGrantRecord> {
    assertCanManageModels(req);
    return this.request<AiModelGrantRecord>("/ai/gateway/admin/grants", {
      method: "POST",
      body,
    });
  }

  @Put("grants/:grantId")
  updateGrant(
    @Req() req: Request & RequestContext,
    @Param("grantId") grantId: string,
    @Body() body: JsonObject,
  ): Promise<AiModelGrantRecord> {
    assertCanManageModels(req);
    return this.request<AiModelGrantRecord>(
      `/ai/gateway/admin/grants/${encodeURIComponent(grantId)}`,
      {
        method: "PUT",
        body,
      },
    );
  }

  @Post("grants/:grantId/activate")
  activateGrant(
    @Req() req: Request & RequestContext,
    @Param("grantId") grantId: string,
  ): Promise<AiModelGrantRecord> {
    assertCanManageModels(req);
    return this.request<AiModelGrantRecord>(
      `/ai/gateway/admin/grants/${encodeURIComponent(grantId)}/activate`,
      {
        method: "POST",
      },
    );
  }

  @Delete("grants/:grantId")
  deactivateGrant(
    @Req() req: Request & RequestContext,
    @Param("grantId") grantId: string,
  ): Promise<AiModelGrantRecord> {
    assertCanManageModels(req);
    return this.request<AiModelGrantRecord>(
      `/ai/gateway/admin/grants/${encodeURIComponent(grantId)}`,
      {
        method: "DELETE",
      },
    );
  }
}

function assertCanManageModels(req: Request & RequestContext): void {
  if (!req.user) {
    throw new UnauthorizedException("No active session");
  }

  if (req.capabilities && !req.capabilities.includes("platform.model.manage")) {
    throw new ForbiddenException("Missing platform.model.manage capability");
  }
}

async function gatewayRequest<TResponse>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: JsonObject;
  } = {},
  baseUrl: string = "http://localhost:3100",
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      ...(options.body
        ? { headers: { "content-type": "application/json" } }
        : {}),
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw new BadGatewayException("AI Gateway is unavailable");
  }

  const responseText = await response.text();

  if (!response.ok) {
    throw new BadGatewayException(
      parseGatewayError(responseText, response.status),
    );
  }

  if (!responseText.trim()) {
    return undefined as TResponse;
  }

  return JSON.parse(responseText) as TResponse;
}

function parseGatewayError(responseText: string, status: number): string {
  if (!responseText.trim()) {
    return `AI Gateway request failed with status ${status}`;
  }

  try {
    const parsed = JSON.parse(responseText) as GatewayErrorBody;
    if (Array.isArray(parsed.message)) {
      return (
        parsed.message[0] ?? `AI Gateway request failed with status ${status}`
      );
    }

    return parsed.message ?? `AI Gateway request failed with status ${status}`;
  } catch {
    return responseText;
  }
}
