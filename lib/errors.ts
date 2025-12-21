/**
 * エラーハンドリングユーティリティ
 */

import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "./types/api";

// ===========================================
// エラーコード定義
// ===========================================

export const ErrorCodes = {
  // クライアントエラー (4xx)
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",

  // サーバーエラー (5xx)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// ===========================================
// カスタムエラークラス
// ===========================================

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: Record<string, string[]>) {
    return new ApiError(ErrorCodes.BAD_REQUEST, message, 400, details);
  }

  static validationError(details: Record<string, string[]>) {
    return new ApiError(
      ErrorCodes.VALIDATION_ERROR,
      "入力内容に誤りがあります",
      400,
      details
    );
  }

  static notFound(resource: string) {
    return new ApiError(
      ErrorCodes.NOT_FOUND,
      `${resource}が見つかりません`,
      404
    );
  }

  static internal(message = "サーバーエラーが発生しました") {
    return new ApiError(ErrorCodes.INTERNAL_ERROR, message, 500);
  }

  static database(message = "データベースエラーが発生しました") {
    return new ApiError(ErrorCodes.DATABASE_ERROR, message, 500);
  }
}

// ===========================================
// エラーレスポンス生成
// ===========================================

export function createErrorResponse(error: ApiError): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
  };

  return NextResponse.json(body, { status: error.statusCode });
}

// ===========================================
// エラーハンドラ
// ===========================================

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // 既知の ApiError
  if (error instanceof ApiError) {
    return createErrorResponse(error);
  }

  // Prisma エラー（P2025: Record not found）
  if (
    error instanceof Error &&
    error.name === "PrismaClientKnownRequestError" &&
    "code" in error &&
    error.code === "P2025"
  ) {
    return createErrorResponse(ApiError.notFound("リソース"));
  }

  // その他のエラー
  console.error("Unhandled error:", error);
  return createErrorResponse(ApiError.internal());
}
