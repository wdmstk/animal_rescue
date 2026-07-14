import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorResponse = {
  error: string | Record<string, unknown>;
};

export const apiError = (
  message: string | Record<string, unknown>,
  status: number = 500
): NextResponse<ApiErrorResponse> => {
  console.error(`API Error [${status}]:`, message);
  return NextResponse.json({ error: message }, { status });
};

export const badRequest = (message: string | ZodError): NextResponse<ApiErrorResponse> =>
  apiError(message instanceof ZodError ? message.flatten() : message, 400);

export const unauthorized = (message: string = "認証が必要です"): NextResponse<ApiErrorResponse> =>
  apiError(message, 401);

export const forbidden = (message: string = "Forbidden"): NextResponse<ApiErrorResponse> =>
  apiError(message, 403);

export const notFound = (resource: string = "Resource"): NextResponse<ApiErrorResponse> =>
  apiError(`${resource} not found`, 404);

export const paymentRequired = (message: string = "この機能は有料プランで利用できます"): NextResponse<ApiErrorResponse> =>
  apiError(message, 402);

export const tooManyRequests = (message: string = "リクエストが多すぎます。しばらく待ってから再度お試しください"): NextResponse<ApiErrorResponse> =>
  apiError(message, 429);

export const serverError = (message: string = "サーバーエラーが発生しました", status: number = 500): NextResponse<ApiErrorResponse> =>
  apiError(message, status);
