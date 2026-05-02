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

import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

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

export class SignupDto {
  @IsEmail({}, { message: '请输入有效邮箱' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: '姓名不能为空' })
  name!: string;

  @IsString()
  @MinLength(8, { message: '密码至少 8 位字符' })
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: '请输入有效邮箱' })
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8, { message: '密码至少 8 位字符' })
  newPassword!: string;
}

export class InitTenantDto {
  @IsString()
  @IsIn(['individual', 'organization'], { message: '请选择个人或企业' })
  type!: 'individual' | 'organization';
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
  tenantId?: string;
}
