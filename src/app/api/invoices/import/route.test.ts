import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { POST } from "@/app/api/invoices/import/route";

function listQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function insertQuery(result: { error?: { message: string } | null }) {
  return {
    insert: vi.fn().mockResolvedValue({ error: result.error ?? null }),
  };
}

function singleQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function updateQuery() {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  };
}

describe("/api/invoices/import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for empty payload", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    });

    const request = new Request("http://localhost/api/invoices/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });

  it("returns row errors for invalid import data", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "customers") {
          return listQuery({ data: [{ id: "c1", name: "Ahmet" }] });
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/invoices/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { customer_name: "Ahmet", amount: 0, due_date: "2026-04-20" },
        { customer_name: "Mehmet", amount: 100, due_date: "bad-date" },
      ]),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.failed).toBe(2);
    expect(body.success).toBe(0);
  });

  it("imports valid rows and updates customer debt", async () => {
    let customerCalls = 0;

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "customers") {
          customerCalls += 1;
          if (customerCalls === 1) {
            return listQuery({ data: [{ id: "c1", name: "Ahmet" }] });
          }
          if (customerCalls === 2) {
            return singleQuery({ data: { total_debt: 50 } });
          }
          return updateQuery();
        }
        if (table === "invoices") {
          return insertQuery({});
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/invoices/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { customer_name: "Ahmet", amount: 120, due_date: "2026-04-20" },
      ]),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(1);
    expect(body.failed).toBe(0);
  });
});
