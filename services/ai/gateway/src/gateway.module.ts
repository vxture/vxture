import { Module } from "@nestjs/common";

import { GatewayController } from "./gateway/gateway.controller";
import { GatewayService } from "./gateway/gateway.service";
import { HealthController } from "./gateway/health.controller";
import { ModelAdminController } from "./gateway/model-admin.controller";
import { ModelAdminService } from "./gateway/model-admin.service";
import { MeteringService } from "./metering/metering.service";
import { ClaudeProvider } from "./providers/claude.provider";
import { DoubaoProvider } from "./providers/doubao.provider";
import { PrivateModelProvider } from "./providers/private.provider";
import { ModelRegistryRepository } from "./registry/model-registry.repository";
import { ModelRegistryService } from "./registry/model-registry.service";
import { ModelRouterService } from "./router/model-router.service";
import { QuotaService } from "./quota/quota.service";

@Module({
  controllers: [GatewayController, ModelAdminController, HealthController],
  providers: [
    GatewayService,
    ModelAdminService,
    ModelRegistryRepository,
    ModelRegistryService,
    ModelRouterService,
    QuotaService,
    MeteringService,
    DoubaoProvider,
    ClaudeProvider,
    PrivateModelProvider,
  ],
  exports: [
    GatewayService,
    ModelAdminService,
    ModelRegistryService,
    ModelRouterService,
    QuotaService,
    MeteringService,
  ],
})
export class GatewayModule {}
