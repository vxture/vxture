/**
 * 认证类型定义
 * @package @vxture/website
 * @layer Presentation
 * @category Types
 */

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  permissions: string[];
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface AuthState {
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenRefreshTimerId: NodeJS.Timeout | null;

  // Methods
  setToken: (token: string, refreshToken: string, tokenExpiry: number) => void;
  setUser: (user: UserInfo | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: (_clearStorage?: boolean) => Promise<void>;
  refreshTokenAction: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
  setupTokenRefreshTimer: () => void;
  clearTokenRefreshTimer: () => void;
}
