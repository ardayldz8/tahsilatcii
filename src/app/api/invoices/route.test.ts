import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { POST } from "@/app/api/invoices/route";

function singleQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function insertQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
      }),
    }),
  };
}

function customerUpdateQuery() {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  };
}

describe("/api/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for missing invoice creation fields", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    });

    const request = new Request("http://localhost/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: "c1" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });

  it("returns 404 when invoice customer does not belong to user", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "customers") {
          return singleQuery({ data: null });
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: "c1", amount: 100, due_date: "2026-04-20" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Customer not found");
  });

  it("creates invoice and updates customer debt", async () => {
    let customerCalls = 0;

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "customers") {
          customerCalls += 1;
          if (customerCalls === 1) {
            return singleQuery({ data: { id: "c1", total_debt: 50 } });
          }
          return customerUpdateQuery();
        }
        if (table === "invoices") {
          return insertQuery({
            data: {
              id: "i1",
              customer_id: "c1",
              amount: 100,
              status: "pending",
            },
          });
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_id: "c1", amount: 100, due_date: "2026-04-20" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe("i1");
  });
});
