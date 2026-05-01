/**
 * prisma.module.ts - Vela Prisma module
 * @package vela-server
 * @layer Infrastructure
 * @category Persistence
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports:   [PrismaService],
})
export class PrismaModule {}
