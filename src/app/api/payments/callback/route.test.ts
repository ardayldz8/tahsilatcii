import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServiceClient } = vi.hoisted(() => ({
  createServiceClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient,
}));

import { POST } from "@/app/api/payments/callback/route";

function createPaymentQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function createUpdateQuery(result: { error: { message: string } | null }) {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue(result),
    }),
  };
}

describe("/api/payments/callback", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, PAYMENT_CALLBACK_SECRET: "test-secret" };
  });

  it("returns 401 when callback secret is invalid", async () => {
    const request = new Request("http://localhost/api/payments/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: "u1", plan: "esnaf", status: "success" }),
    });

    const response = await POST(request as never);

    expect(response.status).toBe(401);
  });

  it("returns duplicate when payment is already processed", async () => {
    const paymentQuery = createPaymentQuery({
      data: { id: "pay-1", status: "completed", plan: "esnaf" },
    });

    createServiceClient.mockResolvedValue({
      from: vi.fn().mockImplementation((table: string) => {
        expect(table).toBe("payments");
        return paymentQuery;
      }),
    });

    const request = new Request("http://localhost/api/payments/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-payment-callback-secret": "test-secret",
      },
      body: JSON.stringify({
        user_id: "u1",
        plan: "esnaf",
        payment_id: "ref-1",
        status: "success",
      }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, duplicate: true });
  });

  it("updates profile and payment on successful callback", async () => {
    const paymentQuery = createPaymentQuery({
      data: { id: "pay-1", status: "pending", plan: "esnaf" },
    });
    const profileUpdate = createUpdateQuery({ error: null });
    const paymentUpdate = createUpdateQuery({ error: null });

    createServiceClient.mockResolvedValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "payments") {
          if (!(profileUpdate.update as ReturnType<typeof vi.fn>).mock.calls.length) {
            return paymentQuery;
          }
          return paymentUpdate;
        }
        if (table === "profiles") {
          return profileUpdate;
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/payments/callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-payment-callback-secret": "test-secret",
      },
      body: JSON.stringify({
        user_id: "u1",
        plan: "esnaf",
        payment_id: "ref-1",
        status: "success",
      }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
  });
});
