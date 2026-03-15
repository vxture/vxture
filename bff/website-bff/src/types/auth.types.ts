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

import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
}
