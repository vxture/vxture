/**
 * 认证 API
 * @package @vxture/website
 * @layer Presentation
 * @category API
 */

import { apiClient } from './client';

export interface AuthResponse {
  token: string;
  user: User;
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

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/login', data);
  localStorage.setItem('auth_token', response.data.token);
  return response.data;
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  const response = await apiClient.post('/auth/signup', data);
  localStorage.setItem('auth_token', response.data.token);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('auth_token');
}

export async function getProfile(): Promise<User> {
  const response = await apiClient.get('/auth/profile');
  return response.data;
}
