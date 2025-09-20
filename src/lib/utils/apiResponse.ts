import { NextResponse } from 'next/server';

import type { ApiResponse } from '@/types';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export class ApiResponseHandler {
  static success<T>(data?: T, status: number = 200) {
    const body: ApiResponse<T> = { success: true, data };
    return NextResponse.json(body, { status });
  }

  static error(message: string, status: number = 500, code?: string, details?: unknown) {
    const body: ApiResponse = { success: false, error: { message, code, details } };
    return NextResponse.json(body, { status });
  }

  static handleError(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
      return this.error(error.message, error.statusCode);
    }

    return this.error(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
