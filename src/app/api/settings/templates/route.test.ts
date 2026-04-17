import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClient } = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient,
}));

import { GET, PUT } from "@/app/api/settings/templates/route";

function createSelectQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
  };
}

function createUpsertQuery(result: { data: unknown; error?: { message: string } | null }) {
  return {
    upsert: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: result.data, error: result.error ?? null }),
    }),
  };
}

describe("/api/settings/templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns default templates when user has no custom templates", async () => {
    const selectQuery = createSelectQuery({ data: [] });

    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        expect(table).toBe("message_templates");
        return selectQuery;
      }),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(5);
    expect(body[0].user_id).toBe("user-1");
  });

  it("returns 400 when templates payload is missing", async () => {
    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
    });

    const request = new Request("http://localhost/api/settings/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await PUT(request as never);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Validation failed");
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("saves provided templates and trims values", async () => {
    const upsertQuery = createUpsertQuery({
      data: [
        {
          id: "tmpl-1",
          user_id: "user-1",
          type: "manuel",
          template: "Yeni sablon",
          created_at: "2026-04-14T00:00:00Z",
          updated_at: "2026-04-14T00:00:00Z",
        },
      ],
    });

    createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        expect(table).toBe("message_templates");
        return upsertQuery;
      }),
    });

    const request = new Request("http://localhost/api/settings/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templates: {
          manuel: "  Yeni sablon  ",
        },
      }),
    });

    const response = await PUT(request as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body[0].template).toBe("Yeni sablon");
  });
});
