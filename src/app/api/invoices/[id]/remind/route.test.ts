import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { POST } from "@/app/api/invoices/[id]/remind/route";

function singleQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function countQuery(count: number) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockResolvedValue({ count }),
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

describe("/api/invoices/[id]/remind", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 when channel is not allowed on current plan", async () => {
    let profileCalls = 0;

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "invoices") {
          return singleQuery({
            data: {
              id: "i1",
              invoice_no: "FAT-001",
              amount: 2500,
              customers: { name: "Ahmet", phone: "0532 123 45 67", email: null },
            },
          });
        }
        if (table === "profiles") {
          profileCalls += 1;
          return singleQuery({ data: { plan: "free", full_name: "Arda" } });
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/invoices/i1/remind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "sms" }),
    });

    const response = await POST(request as never, { params: Promise.resolve({ id: "i1" }) });
    const body = await response.json();

    expect(profileCalls).toBe(1);
    expect(response.status).toBe(403);
    expect(body.error).toBe("This channel is not available on your plan");
  });

  it("returns whatsapp link and sent status for whatsapp reminders", async () => {
    let reminderCalls = 0;

    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "invoices") {
          return singleQuery({
            data: {
              id: "i1",
              invoice_no: "FAT-001",
              amount: 2500,
              customers: { name: "Ahmet", phone: "0532 123 45 67", email: null },
            },
          });
        }
        if (table === "profiles") {
          return singleQuery({ data: { plan: "free", full_name: "Arda" } });
        }
        if (table === "reminders") {
          reminderCalls += 1;
          if (reminderCalls === 1) {
            return countQuery(0);
          }
          return insertQuery({
            data: {
              id: "r1",
              channel: "whatsapp",
              status: "sent",
            },
          });
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/invoices/i1/remind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: "whatsapp" }),
    });

    const response = await POST(request as never, { params: Promise.resolve({ id: "i1" }) });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.reminder.status).toBe("sent");
    expect(body.whatsapp_link).toContain("wa.me/905321234567");
    expect(body.whatsappLink).toContain("wa.me/905321234567");
    expect(body.delivery.provider).toBe("whatsapp-link");
  });
});
