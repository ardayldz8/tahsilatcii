import type { ReminderChannel } from "@/types/core";

export interface ReminderSettings {
  enabled: boolean;
  days_before: number;
  days_after: number;
  due_day: boolean;
  channels: ReminderChannel[];
}
