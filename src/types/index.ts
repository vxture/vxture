export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
}

// Placeholder User type — adjust fields as your app requires
export interface User {
  id: string;
  name?: string;
  email?: string;
}
