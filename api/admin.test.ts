import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "./admin";

const makeResponse = () => {
  const headers: Record<string, string> = {};
  return {
    headers,
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    setHeader(name: string, value: string) { headers[name] = value; },
    json(value: unknown) { this.body = value; },
  };
};

describe("same-origin admin session proxy", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("stores the Edge Function session in an HttpOnly cookie", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ token: "secret-session", expiresIn: 7200000 }), { status: 200 })));
    const res = makeResponse();
    await handler({ method: "POST", headers: { host: "portfolio.test", origin: "https://portfolio.test", "x-supabase-url": "https://example.supabase.co", "x-supabase-publishable-key": "public-key" }, body: { action: "login" } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Set-Cookie"]).toContain("HttpOnly");
    expect(res.headers["Set-Cookie"]).toContain("SameSite=Strict");
    expect(res.body).toEqual({ success: true });
    expect(JSON.stringify(res.body)).not.toContain("secret-session");
  });

  it("rejects cross-origin requests before contacting Supabase", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = makeResponse();
    await handler({ method: "POST", headers: { host: "portfolio.test", origin: "https://attacker.test" }, body: { action: "login" } }, res);

    expect(res.statusCode).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requires an admin cookie for protected actions", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = makeResponse();
    await handler({ method: "POST", headers: { host: "portfolio.test", "x-supabase-url": "https://example.supabase.co", "x-supabase-publishable-key": "public-key" }, body: { action: "verify" } }, res);

    expect(res.statusCode).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows the public readiness check without an admin cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ready: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const res = makeResponse();
    await handler({ method: "POST", headers: { host: "portfolio.test", "x-supabase-url": "https://example.supabase.co", "x-supabase-publishable-key": "public-key" }, body: { action: "login_status" } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ready: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
