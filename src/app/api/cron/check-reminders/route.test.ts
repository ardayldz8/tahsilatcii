import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServiceClient } = vi.hoisted(() => ({
  createServiceClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient,
}));

import { GET } from "@/app/api/cron/check-reminders/route";

function invoicesQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    lte: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function reminderSettingsQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function retryQueueQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function reminderLookupQuery(existing: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: existing, error: null }),
  };
}

function reminderInsertQuery() {
  return {
    insert: vi.fn().mockResolvedValue({ error: null }),
  };
}

describe("/api/cron/check-reminders", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, CRON_SECRET: "cron-secret" };
  });

  it("returns 401 when cron secret is missing or invalid", async () => {
    const request = new Request("http://localhost/api/cron/check-reminders");
    const response = await GET(request as never);
    expect(response.status).toBe(401);
  });

  it("returns processed 0 when no invoices need reminders", async () => {
    createServiceClient.mockResolvedValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "reminder_settings") {
          return reminderSettingsQuery({ data: [] });
        }
        if (table === "invoices") {
          return invoicesQuery({ data: [] });
        }
        if (table === "reminders") {
          return retryQueueQuery({ data: [] });
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const request = new Request("http://localhost/api/cron/check-reminders", {
      headers: { authorization: "Bearer cron-secret" },
    });

    const response = await GET(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.processed).toBe(0);
  });

  it("creates reminders for matching invoices and channels", async () => {
    let reminderCalls = 0;
    createServiceClient.mockResolvedValue({
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "invoices") {
          return invoicesQuery({
            data: [
              {
                id: "i1",
                user_id: "u1",
                invoice_no: "FAT-001",
                amount: 2500,
                due_date: "2026-04-17",
                customers: { name: "Ahmet", phone: "0532 123 45 67", email: null },
              },
            ],
          });
        }
        if (table === "reminder_settings") {
          return reminderSettingsQuery({
            data: [
              {
                user_id: "u1",
                enabled: true,
                days_before: 3,
                days_after: 1,
                due_day: true,
                channels: ["whatsapp", "sms"],
              },
            ],
          });
        }
        if (table === "reminders") {
          reminderCalls += 1;
          if (reminderCalls === 1) {
            return retryQueueQuery({ data: [] });
          }
          if (reminderCalls % 2 === 0) {
            return reminderLookupQuery(null);
          }
          return reminderInsertQuery();
        }
        throw new Error(`Unexpected table ${table}`);
      }),
    });

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T09:00:00Z"));

    const request = new Request("http://localhost/api/cron/check-reminders", {
      headers: { authorization: "Bearer cron-secret" },
    });

    const response = await GET(request as never);
    const body = await response.json();

    vi.useRealTimers();

    expect(response.status).toBe(200);
    expect(body.created).toBe(2);
    expect(body.processed).toBe(1);
    expect(body.skipped).toBe(0);
  });
});
