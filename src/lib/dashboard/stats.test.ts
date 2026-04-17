import { describe, expect, it } from "vitest";
import {
  buildCollectionRateData,
  buildInvoiceStatusData,
  buildMonthlyRevenue,
  buildTopCustomers,
  type InvoiceStatsRow,
} from "@/lib/dashboard/stats";

const now = new Date("2026-04-14T12:00:00Z");

const invoices: InvoiceStatsRow[] = [
  {
    amount: 2500,
    status: "pending",
    due_date: "2026-04-20",
    paid_at: null,
    customer_id: "c1",
    customers: { name: "Ahmet" },
  },
  {
    amount: 1750,
    status: "paid",
    due_date: "2026-04-15",
    paid_at: "2026-04-10T14:30:00Z",
    customer_id: "c2",
    customers: { name: "Mehmet" },
  },
  {
    amount: 4200,
    status: "overdue",
    due_date: "2026-04-05",
    paid_at: null,
    customer_id: "c3",
    customers: { name: "Ayse" },
  },
  {
    amount: 1500,
    status: "paid",
    due_date: "2026-03-05",
    paid_at: "2026-03-04T10:00:00Z",
    customer_id: "c1",
    customers: { name: "Ahmet" },
  },
];

describe("dashboard stats helpers", () => {
  it("builds monthly revenue with tahsilat and alacak values", () => {
    const result = buildMonthlyRevenue(invoices, now);
    const april = result[result.length - 1];

    expect(result).toHaveLength(6);
    expect(april.tahsilat).toBe(1750);
    expect(april.alacak).toBe(6700);
  });

  it("builds invoice status counts", () => {
    expect(buildInvoiceStatusData(invoices)).toEqual([
      { name: "pending", value: 1, color: "#f59e0b" },
      { name: "paid", value: 2, color: "#10b981" },
      { name: "overdue", value: 1, color: "#ef4444" },
    ]);
  });

  it("calculates collection rates per month", () => {
    const result = buildCollectionRateData(invoices, now);
    const march = result[result.length - 2];
    const april = result[result.length - 1];

    expect(march.rate).toBe(100);
    expect(april.rate).toBe(33);
  });

  it("sorts top customers by total invoice amount", () => {
    const result = buildTopCustomers(invoices);

    expect(result[0]).toEqual({ name: "Ayse", total: 4200, paid: 0 });
    expect(result[1]).toEqual({ name: "Ahmet", total: 4000, paid: 1500 });
    expect(result[2]).toEqual({ name: "Mehmet", total: 1750, paid: 1750 });
  });
});
