/**
 * process-payment.dto.ts - 处理支付入参 DTO
 * @package @vxture/service-billing
 *
 * Description: 处理支付时的入参验证 DTO
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @layer Domain
 * @category DTO
 */

import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../types/billing.types';

export class ProcessPaymentInput {
  @ApiProperty({ description: '发票ID', example: '1' })
  @IsString()
  invoiceId: string;

  @ApiProperty({ description: '支付金额', example: 1100 })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '支付方式', example: PaymentMethod.CREDIT_CARD })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ description: '货币类型', example: 'CNY', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: '元数据', example: { orderId: '123' }, required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
