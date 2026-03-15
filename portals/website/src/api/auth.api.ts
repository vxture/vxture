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

import { apiClient } from './client';

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export async function login(data: LoginRequest): Promise<AuthUserDto> {
  const response = await apiClient.post('/api/auth/login', data);
  return response.data;
}

export async function signup(data: SignupRequest): Promise<AuthUserDto> {
  const response = await apiClient.post('/api/auth/signup', data);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout');
}

export async function getProfile(): Promise<AuthUserDto> {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
}
