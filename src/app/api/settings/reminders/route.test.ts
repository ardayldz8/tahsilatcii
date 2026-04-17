import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { GET, PUT } from "@/app/api/settings/reminders/route";

function createReminderSettingsQuery(result: { data: unknown; error: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    upsert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue(result),
      }),
    }),
  };
}

describe("/api/settings/reminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  });

  it("returns default settings when user has no saved settings", async () => {
    const query = createReminderSettingsQuery({ data: null, error: null });

    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        expect(table).toBe("reminder_settings");
        return query;
      }),
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      enabled: true,
      days_before: 3,
      days_after: 1,
      due_day: true,
      channels: ["whatsapp"],
    });
  });

  it("normalizes invalid channels on save", async () => {
    const query = createReminderSettingsQuery({
      data: {
        enabled: false,
        days_before: 5,
        days_after: 2,
        due_day: false,
        channels: ["sms", "invalid"],
      },
      error: null,
    });

    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: vi.fn().mockImplementation(() => query),
    });

    const request = new Request("http://localhost/api/settings/reminders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled: false,
        days_before: 5,
        days_after: 2,
        due_day: false,
        channels: ["sms", "invalid"],
      }),
    });

    const response = await PUT(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.channels).toEqual(["sms"]);
  });
});
