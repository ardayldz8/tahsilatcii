import { z } from "zod";
import { compactQuerySchema, isoDateSchema, optionalNullableTextField } from "@/lib/validation/common";

const invoiceStatusSchema = z.enum(["pending", "paid", "overdue", "cancelled"]);

export const invoicesQuerySchema = z.object({
  status: invoiceStatusSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  compact: compactQuerySchema,
});

export const createInvoiceSchema = z.object({
  customer_id: z.string().trim().min(1, "customer_id is required"),
  amount: z.coerce.number().positive("amount must be greater than 0"),
  due_date: isoDateSchema,
  notes: optionalNullableTextField,
});

export const updateInvoiceSchema = z
  .object({
    status: invoiceStatusSchema.optional(),
    notes: optionalNullableTextField,
    photo_url: z.union([z.string().trim().url(), z.literal(""), z.null()]).transform((value) => value || null).optional(),
    amount: z.coerce.number().positive("amount must be greater than 0").optional(),
    due_date: isoDateSchema.optional(),
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    "At least one field must be provided"
  );

export const importInvoicesSchema = z
  .array(
    z.object({
      customer_name: z.string().trim().optional(),
      amount: z.union([z.number(), z.string()]).optional(),
      due_date: z.string().optional(),
      notes: optionalNullableTextField,
    })
  )
  .min(1, "At least one row is required");
