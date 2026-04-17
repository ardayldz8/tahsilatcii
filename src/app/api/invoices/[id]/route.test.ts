import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { PUT } from "@/app/api/invoices/[id]/route";

function singleQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function customerUpdateQuery() {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  };
}

function invoiceUpdateQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
          }),
        }),
      }),
    }),
  };
}

describe("/api/invoices/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when invoice is missing", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "invoices") {
          return singleQuery({ data: null });
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/invoices/i1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });

    const response = await PUT(request as never, { params: Promise.resolve({ id: "i1" }) });
    expect(response.status).toBe(404);
  });

  it("marks pending invoice as paid and returns updated invoice", async () => {
    let invoiceCalls = 0;

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "invoices") {
          invoiceCalls += 1;
          if (invoiceCalls === 1) {
            return singleQuery({
              data: {
                id: "i1",
                status: "pending",
                amount: 100,
                customer_id: "c1",
                customers: { id: "c1", total_debt: 200 },
              },
            });
          }
          return invoiceUpdateQuery({
            data: { id: "i1", status: "paid", paid_at: "2026-04-14T00:00:00Z" },
          });
        }
        if (table === "customers") {
          return customerUpdateQuery();
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/invoices/i1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });

    const response = await PUT(request as never, { params: Promise.resolve({ id: "i1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("paid");
  });
});
