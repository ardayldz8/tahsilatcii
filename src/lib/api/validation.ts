import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { badRequest } from "@/lib/api/errors";

type ValidationSuccess<T> = { success: true; data: T };
type ValidationFailure = { success: false; response: NextResponse };

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

function formatZodIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: NextRequest,
  schema: TSchema
): Promise<ValidationResult<z.infer<TSchema>>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: badRequest(
        "Request body must be valid JSON",
        [{ path: "body", message: "Invalid JSON payload" }],
        "INVALID_JSON"
      ),
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      response: badRequest(
        "Validation failed",
        formatZodIssues(parsed.error),
        "VALIDATION_ERROR"
      ),
    };
  }

  return { success: true, data: parsed.data };
}

export function parseSearchParams<TSchema extends z.ZodTypeAny>(
  request: NextRequest,
  schema: TSchema
): ValidationResult<z.infer<TSchema>> {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    return {
      success: false,
      response: badRequest(
        "Validation failed",
        formatZodIssues(parsed.error),
        "VALIDATION_ERROR"
      ),
    };
  }

  return { success: true, data: parsed.data };
}

export async function parseRouteParams<TSchema extends z.ZodTypeAny>(
  paramsPromise: Promise<unknown>,
  schema: TSchema
): Promise<ValidationResult<z.infer<TSchema>>> {
  const params = await paramsPromise;
  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    return {
      success: false,
      response: badRequest(
        "Validation failed",
        formatZodIssues(parsed.error),
        "VALIDATION_ERROR"
      ),
    };
  }

  return { success: true, data: parsed.data };
}
