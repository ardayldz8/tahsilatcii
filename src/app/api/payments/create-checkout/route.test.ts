import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { POST } from "@/app/api/payments/create-checkout/route";

function createProfileQuery(result: { data: unknown; error: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  };
}

function createPendingPaymentQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function createInsertPaymentQuery(result: { data: unknown; error: { message: string } | null }) {
  return {
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
}

describe("/api/payments/create-checkout", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.IYZICO_API_KEY;
    delete process.env.IYZICO_SECRET_KEY;
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  });

  it("returns 401 when user is not authenticated", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    });

    const request = new Request("http://localhost/api/payments/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "esnaf" }),
    });

    const response = await POST(request as never);

    expect(response.status).toBe(401);
  });

  it("rejects selecting the current plan", async () => {
    const profileQuery = createProfileQuery({
      data: { plan: "esnaf" },
      error: null,
    });

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "profiles") return profileQuery;
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/payments/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "esnaf" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe("You are already on this plan.");
  });

  it("reuses recent pending payments", async () => {
    const profileQuery = createProfileQuery({
      data: { plan: "free" },
      error: null,
    });
    const pendingQuery = createPendingPaymentQuery({
      data: {
        id: "pay-1",
        iyzico_payment_id: "ref-1",
        created_at: new Date().toISOString(),
      },
    });

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "profiles") return profileQuery;
        if (table === "payments") return pendingQuery;
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/payments/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "esnaf" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.mode).toBe("pending");
    expect(body.paymentId).toBe("pay-1");
  });

  it("returns configuration_required when provider env is missing", async () => {
    const profileQuery = createProfileQuery({
      data: { plan: "free" },
      error: null,
    });
    const pendingQuery = createPendingPaymentQuery({ data: null });
    const insertQuery = createInsertPaymentQuery({
      data: {
        id: "pay-2",
        plan: "esnaf",
        amount: 99,
        currency: "TRY",
        iyzico_payment_id: "ref-2",
      },
      error: null,
    });

    let paymentsCallCount = 0;

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "profiles") return profileQuery;
        if (table === "payments") {
          paymentsCallCount += 1;
          if (paymentsCallCount === 1) {
            return pendingQuery;
          }
          return insertQuery;
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/payments/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "esnaf" }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.mode).toBe("configuration_required");
  });
});
