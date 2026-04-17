export interface InvoiceStatsRow {
  amount: number;
  status: string;
  due_date: string;
  paid_at: string | null;
  customer_id: string;
  customers: { name: string } | { name: string }[] | null;
}

export function buildMonthlyRevenue(
  invoices: InvoiceStatsRow[],
  now = new Date()
) {
  const months: { month: string; tahsilat: number; alacak: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const label = date.toLocaleDateString("tr-TR", { month: "short" });

    let tahsilat = 0;
    let alacak = 0;

    for (const invoice of invoices) {
      const invoiceMonth = invoice.paid_at
        ? invoice.paid_at.slice(0, 7)
        : invoice.due_date.slice(0, 7);

      if (invoiceMonth !== key) {
        continue;
      }

      if (invoice.status === "paid") {
        tahsilat += invoice.amount;
      } else if (invoice.status === "pending" || invoice.status === "overdue") {
        alacak += invoice.amount;
      }
    }

    months.push({ month: label, tahsilat, alacak });
  }

  return months;
}

export function buildInvoiceStatusData(invoices: InvoiceStatsRow[]) {
  const statusMap: Record<string, { count: number; color: string }> = {
    pending: { count: 0, color: "#f59e0b" },
    paid: { count: 0, color: "#10b981" },
    overdue: { count: 0, color: "#ef4444" },
    cancelled: { count: 0, color: "#6b7280" },
  };

  for (const invoice of invoices) {
    if (statusMap[invoice.status]) {
      statusMap[invoice.status].count++;
    }
  }

  return Object.entries(statusMap)
    .filter(([, value]) => value.count > 0)
    .map(([name, value]) => ({
      name,
      value: value.count,
      color: value.color,
    }));
}

export function buildCollectionRateData(
  invoices: InvoiceStatsRow[],
  now = new Date()
) {
  const rates: { month: string; rate: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const label = date.toLocaleDateString("tr-TR", { month: "short" });

    let total = 0;
    let paid = 0;

    for (const invoice of invoices) {
      if (invoice.due_date.slice(0, 7) !== key) {
        continue;
      }

      total++;
      if (invoice.status === "paid") {
        paid++;
      }
    }

    rates.push({
      month: label,
      rate: total > 0 ? Math.round((paid / total) * 100) : 0,
    });
  }

  return rates;
}

export function buildTopCustomers(invoices: InvoiceStatsRow[]) {
  const customerMap = new Map<string, { name: string; total: number; paid: number }>();

  for (const invoice of invoices) {
    const customer = invoice.customers;
    const name = Array.isArray(customer)
      ? customer[0]?.name ?? "Bilinmeyen"
      : customer?.name ?? "Bilinmeyen";
    const existing = customerMap.get(invoice.customer_id) ?? {
      name,
      total: 0,
      paid: 0,
    };

    existing.total += invoice.amount;
    if (invoice.status === "paid") {
      existing.paid += invoice.amount;
    }

    customerMap.set(invoice.customer_id, existing);
  }

  return Array.from(customerMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}
