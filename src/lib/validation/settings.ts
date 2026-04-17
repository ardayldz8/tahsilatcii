import { z } from "zod";

export const updateReminderSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  days_before: z.number().int().min(0).max(365).optional(),
  days_after: z.number().int().min(0).max(365).optional(),
  due_day: z.boolean().optional(),
  channels: z.array(z.string()).min(1).optional(),
});

const reminderTemplateValueSchema = z.string().trim().min(1).max(5000);

export const updateReminderTemplatesSchema = z.object({
  templates: z
    .object({
      "vade-oncesi": reminderTemplateValueSchema.optional(),
      "vade-gunu": reminderTemplateValueSchema.optional(),
      "vade-sonrasi": reminderTemplateValueSchema.optional(),
      hatirlatma: reminderTemplateValueSchema.optional(),
      manuel: reminderTemplateValueSchema.optional(),
    })
    .refine(
      (value) => Object.values(value).some((field) => field !== undefined),
      "At least one template must be provided"
    ),
});
