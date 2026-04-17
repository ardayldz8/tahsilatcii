import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServiceClient } = vi.hoisted(() => ({
  createServiceClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient,
}));

import { POST } from "@/app/api/profile/setup/route";

function upsertQuery(result: { error?: { message: string } | null }) {
  return {
    upsert: vi.fn().mockResolvedValue({ error: result.error ?? null }),
  };
}

describe("/api/profile/setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when required fields are missing", async () => {
    const request = new Request("http://localhost/api/profile/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: "Arda" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(400);
  });

  it("creates profile successfully", async () => {
    createServiceClient.mockResolvedValue({
      from: vi.fn().mockImplementation((table: string) => {
        expect(table).toBe("profiles");
        return upsertQuery({});
      }),
    });

    const request = new Request("http://localhost/api/profile/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "u1",
        email: "arda@example.com",
        full_name: "Arda",
        business_type: "tesisatci",
      }),
    });

    const response = await POST(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
  });
});
