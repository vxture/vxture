/**
 * auth.api.ts - 认证 API 层
 * @package @vxture/website
 * @layer Presentation
 * @category API
 *
 * 职责：调用 BFF 认证接口，负责 HTTP 通信
 * 与前端状态分离，只返回数据，不直接操作 store
 *
 * @file auth.api.ts
 * @desc 认证 API 层，调用 BFF 接口
 * @author AI-Generated
 * @date 2026-03-15
 * @version 1.0
 * @copyright Vxture Team
 * @license MIT
 */

import { apiClient } from "./client";
import { AUTH_CONSTANTS } from "@vxture/shared";

export interface AuthUserDto {
  id: string;
  name: string;
  displayName?: string | null;
  username?: string;
  avatarUrl?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  roleLabel?: string;
  personalVerified?: boolean | null;
  organizationVerified?: boolean | null;
  organizationName?: string | null;
  tenantType?: "individual" | "company" | "organization" | string | null;
}

export interface AccountProfileDto {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  timezone: string | null;
  language: string | null;
  profileUpdatedAt: string | null;
}

export interface UpdateProfileRequest {
  displayName?: string | null;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  timezone?: string | null;
  language?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  nextPassword: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  turnstileToken?: string | undefined;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  turnstileToken?: string | undefined;
}

export async function login(data: LoginRequest): Promise<AuthUserDto> {
  const response = await apiClient.post(
    AUTH_CONSTANTS.API_ENDPOINTS.LOGIN,
    data,
  );
  return response.data;
}

export async function signup(data: SignupRequest): Promise<AuthUserDto> {
  const response = await apiClient.post("/api/auth/signup", data);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post(AUTH_CONSTANTS.API_ENDPOINTS.LOGOUT);
}

export async function getProfile(): Promise<AuthUserDto> {
  const response = await apiClient.get(AUTH_CONSTANTS.API_ENDPOINTS.ME);
  return response.data;
}

export async function getUserProfile(): Promise<AccountProfileDto> {
  const response = await apiClient.get<AccountProfileDto>("/api/me/profile");
  return response.data;
}

export async function updateUserProfile(
  data: UpdateProfileRequest,
): Promise<AccountProfileDto> {
  const response = await apiClient.put<AccountProfileDto>(
    "/api/me/profile",
    data,
  );
  return response.data;
}

export async function changeUserPassword(
  data: ChangePasswordRequest,
): Promise<void> {
  await apiClient.put("/api/me/password", data);
}

export async function forgotPassword(data: { email: string }): Promise<void> {
  await apiClient.post("/api/auth/forgot-password", data);
}

export async function resetPassword(data: {
  token: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.post("/api/auth/reset-password", data);
}

export async function initTenant(data: {
  type: "individual" | "organization";
}): Promise<{ tenantId: string }> {
  const response = await apiClient.post<{ tenantId: string }>(
    "/api/auth/tenant/init",
    data,
  );
  return response.data;
}

/** 发送手机验证码 */
export async function sendPhoneCode(
  phone: string,
  turnstileToken?: string,
): Promise<void> {
  await apiClient.post("/api/auth/send-phone-code", { phone, turnstileToken });
}

/** 手机验证码登录 */
export async function loginWithPhone(
  phone: string,
  code: string,
  turnstileToken?: string,
): Promise<AuthUserDto> {
  const response = await apiClient.post<AuthUserDto>(
    "/api/auth/login-with-phone",
    { phone, code, turnstileToken },
  );
  return response.data;
}
