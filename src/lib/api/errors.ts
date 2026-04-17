import { NextResponse } from "next/server";

export type ApiErrorDetails =
  | Record<string, unknown>
  | string[]
  | Array<{ path: string; message: string }>;

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INVALID_JSON"
  | "INTERNAL_ERROR";

export function errorResponse(
  status: number,
  error: string,
  code: ApiErrorCode,
  details?: ApiErrorDetails
) {
  return NextResponse.json(
    {
      error,
      code,
      ...(details !== undefined ? { details } : {}),
    },
    { status }
  );
}

export function badRequest(
  error: string,
  details?: ApiErrorDetails,
  code: ApiErrorCode = "BAD_REQUEST"
) {
  return errorResponse(400, error, code, details);
}

export function unauthorized(error = "Unauthorized") {
  return errorResponse(401, error, "UNAUTHORIZED");
}

export function forbidden(error: string, details?: ApiErrorDetails) {
  return errorResponse(403, error, "FORBIDDEN", details);
}

export function notFound(error: string, details?: ApiErrorDetails) {
  return errorResponse(404, error, "NOT_FOUND", details);
}

export function conflict(error: string, details?: ApiErrorDetails) {
  return errorResponse(409, error, "CONFLICT", details);
}

export function internalError(error = "Internal server error") {
  return errorResponse(500, error, "INTERNAL_ERROR");
}
