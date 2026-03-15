/**
 * 认证类型定义
 * @package @vxture/website
 * @layer Presentation
 * @category Types
 */

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Methods
  setUser: (user: UserInfo | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
