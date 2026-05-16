import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';

import {
  ModelAdminService,
  type AiModelAdminRecord,
  type AiModelGrantAdminRecord,
  type CreateAiModelBody,
  type CreateAiModelGrantBody,
  type UpdateAiModelBody,
  type UpdateAiModelGrantBody,
} from './model-admin.service';

@Controller('ai/gateway/admin')
export class ModelAdminController {
  constructor(@Inject(ModelAdminService) private readonly admin: ModelAdminService) {}

  @Get('models')
  listModels(@Query('includeInactive') includeInactive?: string): Promise<AiModelAdminRecord[]> {
    return this.admin.listModels(includeInactive !== 'false');
  }

  @Post('models')
  createModel(@Body() body: CreateAiModelBody): Promise<AiModelAdminRecord> {
    return this.admin.createModel(body);
  }

  @Put('models/:modelId')
  updateModel(
    @Param('modelId') modelId: string,
    @Body() body: UpdateAiModelBody,
  ): Promise<AiModelAdminRecord> {
    return this.admin.updateModel(modelId, body);
  }

  @Post('models/:modelId/activate')
  activateModel(@Param('modelId') modelId: string): Promise<AiModelAdminRecord> {
    return this.admin.setModelActive(modelId, true);
  }

  @Post('models/:modelId/deactivate')
  deactivateModel(@Param('modelId') modelId: string): Promise<AiModelAdminRecord> {
    return this.admin.setModelActive(modelId, false);
  }

  @Delete('models/:modelId')
  deleteModel(@Param('modelId') modelId: string): Promise<AiModelAdminRecord> {
    return this.admin.deleteModel(modelId);
  }

  @Get('grants')
  listGrants(
    @Query('tenantId') tenantId?: string,
    @Query('modelId') modelId?: string,
  ): Promise<AiModelGrantAdminRecord[]> {
    return this.admin.listGrants({
      ...(tenantId !== undefined ? { tenantId } : {}),
      ...(modelId  !== undefined ? { modelId }  : {}),
    });
  }

  @Post('grants')
  createGrant(@Body() body: CreateAiModelGrantBody): Promise<AiModelGrantAdminRecord> {
    return this.admin.createGrant(body);
  }

  @Put('grants/:grantId')
  updateGrant(
    @Param('grantId') grantId: string,
    @Body() body: UpdateAiModelGrantBody,
  ): Promise<AiModelGrantAdminRecord> {
    return this.admin.updateGrant(grantId, body);
  }

  @Post('grants/:grantId/activate')
  activateGrant(@Param('grantId') grantId: string): Promise<AiModelGrantAdminRecord> {
    return this.admin.setGrantActive(grantId, true);
  }

  @Delete('grants/:grantId')
  deactivateGrant(@Param('grantId') grantId: string): Promise<AiModelGrantAdminRecord> {
    return this.admin.setGrantActive(grantId, false);
  }
}
