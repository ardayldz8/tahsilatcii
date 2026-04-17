import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { GET, PUT } from "@/app/api/profile/route";

function singleQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function updateQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
        }),
      }),
    }),
  };
}

describe("/api/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns profile data for authenticated user", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        expect(table).toBe("profiles");
        return singleQuery({ data: { id: "u1", full_name: "Arda" } });
      }),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.full_name).toBe("Arda");
  });

  it("updates profile fields", async () => {
    createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        expect(table).toBe("profiles");
        return updateQuery({
          data: { id: "u1", full_name: "Yeni Isim", business_type: "tesisatci" },
        });
      }),
    });

    const request = new Request("http://localhost/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: "Yeni Isim", business_type: "tesisatci" }),
    });

    const response = await PUT(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.full_name).toBe("Yeni Isim");
  });
});
