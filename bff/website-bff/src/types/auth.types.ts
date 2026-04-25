/**
 * auth.types.ts - Authentication DTO Types
 * @package @vxture/bff-website
 * @description DTO types for authentication APIs (BFF contract to frontend)
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 * @layer Application
 * @category Types
 */

import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  identifier?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export interface AuthUserDto {
  id: string;
  name: string;
  displayName?: string | null;
  username?: string;
  email: string;
  phone?: string | null;
  role: string;
  roleLabel?: string;
  personalVerified?: boolean | null;
  organizationVerified?: boolean | null;
  organizationName?: string | null;
  tenantType?: string | null;
}

export interface RequestContext {
  user?: AuthUserDto;
}
