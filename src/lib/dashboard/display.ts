export const INVOICE_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  paid: "Odendi",
  overdue: "Gecikti",
  cancelled: "Iptal",
};
