import type { MessageTemplate, ReminderType } from "@/types/index";

export const DEFAULT_REMINDER_TEMPLATES: Record<ReminderType, string> = {
  "vade-oncesi":
    "Sayin {customerName}, {invoiceNo} numarali {amount} TL tutarindaki faturanizin son odeme tarihi {dueDate}. Ilginiz icin tesekkurler. - {businessName}",
  "vade-gunu":
    "Sayin {customerName}, bugun {invoiceNo} numarali {amount} TL tutarindaki faturanizin son odeme gunudur. - {businessName}",
  "vade-sonrasi":
    "Sayin {customerName}, {invoiceNo} numarali {amount} TL tutarindaki faturanizin vadesi gecmistir. Lutfen en kisa surede odemenizi gerceklestirin. - {businessName}",
  hatirlatma:
    "Sayin {customerName}, {invoiceNo} numarali faturaniz hala odenmemistir. - {businessName}",
  manuel: "Sayin {customerName}, odemenizi bekliyoruz. - {businessName}",
};

export function getDefaultReminderTemplateRows(userId: string): MessageTemplate[] {
  const now = new Date().toISOString();

  return (Object.entries(DEFAULT_REMINDER_TEMPLATES) as Array<
    [ReminderType, string]
  >).map(([type, template]) => ({
    id: `default-${type}`,
    user_id: userId,
    type,
    template,
    created_at: now,
    updated_at: now,
  }));
}
