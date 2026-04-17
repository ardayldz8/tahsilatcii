import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { GET, POST } from "@/app/api/customers/route";

function listQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function singleQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function countQuery(count: number) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ count }),
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

describe("/api/customers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists customers for authenticated user", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        expect(table).toBe("customers");
        return listQuery({ data: [{ id: "c1", name: "Ahmet" }] });
      }),
    });

    const request = new Request("http://localhost/api/customers");
    const response = await GET(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([{ id: "c1", name: "Ahmet" }]);
  });

  it("blocks customer creation when plan limit is reached", async () => {
    let customerCalls = 0;

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "profiles") {
          return singleQuery({ data: { plan: "free" } });
        }
        if (table === "customers") {
          customerCalls += 1;
          return countQuery(3);
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ahmet", phone: "0555" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(customerCalls).toBe(1);
    expect(response.status).toBe(403);
    expect(body.error).toMatch("Plan limit reached");
  });

  it("creates a customer with normalized optional fields", async () => {
    let customerCalls = 0;

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "profiles") {
          return singleQuery({ data: { plan: "esnaf" } });
        }
        if (table === "customers") {
          customerCalls += 1;
          if (customerCalls === 1) {
            return countQuery(1);
          }
          return insertQuery({
            data: {
              id: "c1",
              user_id: "u1",
              name: "Ahmet",
              phone: "0555",
              email: null,
              address: null,
              notes: null,
              total_debt: 0,
            },
          });
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ahmet", phone: "0555", email: "", address: "", notes: "" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.total_debt).toBe(0);
    expect(body.email).toBeNull();
  });
});
