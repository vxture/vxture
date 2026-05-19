/**
 * 认证类型定义
 * @package @vxture/website
 * @layer Presentation
 * @category Types
 */

export interface UserInfo {
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

export interface RestoreSessionOptions {
  silent?: boolean;
}

export interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Methods
  setUser: (user: UserInfo | null) => void;
  login: (
    identifier: string,
    password: string,
    turnstileToken?: string,
  ) => Promise<void>;
  signup: (
    email: string,
    name: string,
    password: string,
    turnstileToken?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: (options?: RestoreSessionOptions) => Promise<UserInfo | null>;
  clearError: () => void;
}
