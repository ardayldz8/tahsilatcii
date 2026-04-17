import { z } from "zod";

const nullableTrimmedString = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

export const optionalTextField = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => value || null)
  .optional();

export const optionalEmailField = z
  .union([z.string().trim().email(), z.literal("")])
  .transform((value) => value || null)
  .optional();

export const optionalNullableTextField = nullableTrimmedString;

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "Must be in YYYY-MM-DD format",
});

export const uuidParamsSchema = z.object({
  id: z.string().trim().min(1, "id is required"),
});

export const compactQuerySchema = z.enum(["0", "1"]).optional();
