import { z } from "zod";
import {
  compactQuerySchema,
  optionalEmailField,
  optionalTextField,
} from "@/lib/validation/common";

const customerFields = {
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(1, "Phone is required").max(40),
  email: optionalEmailField,
  address: optionalTextField,
  notes: optionalTextField,
};

export const customersQuerySchema = z.object({
  compact: compactQuerySchema,
});

export const createCustomerSchema = z.object(customerFields);

export const updateCustomerSchema = z
  .object({
    name: customerFields.name.optional(),
    phone: customerFields.phone.optional(),
    email: optionalEmailField,
    address: optionalTextField,
    notes: optionalTextField,
  })
  .refine(
    (value) =>
      Object.values(value).some((field) => field !== undefined),
    "At least one field must be provided"
  );
