import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { DELETE } from "@/app/api/invoices/[id]/route";

function singleQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function deleteQuery(result: { error?: { message: string } | null }) {
  return {
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: result.error ?? null }),
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

describe("/api/invoices/[id] DELETE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when invoice does not exist", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "invoices") {
          return singleQuery({ data: null });
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const response = await DELETE(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "i1" }),
    });

    expect(response.status).toBe(404);
  });

  it("deletes unpaid invoice and reduces customer debt", async () => {
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
                customers: { id: "c1", total_debt: 250 },
              },
            });
          }
          return deleteQuery({});
        }
        if (table === "customers") {
          return customerUpdateQuery();
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const response = await DELETE(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "i1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
  });
});
