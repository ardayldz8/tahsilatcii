import { z } from "zod";
import { optionalNullableTextField } from "@/lib/validation/common";

export const reminderChannelSchema = z.enum(["whatsapp", "sms", "email"]);

export const remindersQuerySchema = z.object({
  channel: reminderChannelSchema.optional(),
});

export const sendReminderSchema = z.object({
  channel: reminderChannelSchema,
  message: optionalNullableTextField,
});
