import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const ADMIN_USERNAME = Deno.env.get("ADMIN_USERNAME") ?? "";
const ADMIN_PASSWORD_HASH = Deno.env.get("ADMIN_PASSWORD_HASH") ?? "";
const SESSION_SECRET = Deno.env.get("ADMIN_SESSION_SECRET") ?? "";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const enc = new TextEncoder();

// ---------- crypto helpers ----------
const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64url = (buf: ArrayBuffer | Uint8Array) =>
  b64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

const safeEqual = (a: string, b: string) => {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
};

async function verifyPassword(password: string): Promise<boolean> {
  const [algo, iterStr, saltB64, hashB64] = ADMIN_PASSWORD_HASH.split("$");
  if (algo !== "pbkdf2_sha256" || !iterStr || !saltB64 || !hashB64) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromB64(saltB64), iterations: Number(iterStr) },
    key,
    256,
  );
  return safeEqual(b64(bits), hashB64);
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(SESSION_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

async function issueToken() {
  const payload = b64url(enc.encode(JSON.stringify({ sub: "admin", exp: Date.now() + SESSION_TTL_MS })));
  return `${payload}.${await hmac(payload)}`;
}

async function verifyToken(token: string | null) {
  if (!token || !SESSION_SECRET) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(await hmac(payload), sig)) return false;
  try {
    const data = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return data.sub === "admin" && typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

// ---------- brute-force protection (best effort, per instance) ----------
const failures = new Map<string, { count: number; until: number }>();
const clientIp = (req: Request) =>
  (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

// ---------- input helpers ----------
const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const int = (v: unknown, min: number, max: number, def: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
const strArr = (v: unknown, maxItems: number, maxLen: number) =>
  Array.isArray(v)
    ? v.filter((t) => typeof t === "string" && t.trim()).slice(0, maxItems).map((t: string) => t.trim().slice(0, maxLen))
    : [];
const isSafeUrl = (u: string) => !u || /^https?:\/\//i.test(u);
const isSafeColor = (c: string) => /^(hsl\(\s*\d{1,3}(\.\d+)?\s+\d{1,3}%\s+\d{1,3}%\s*\)|#[0-9a-f]{3,8})$/i.test(c);

const fail = (msg: string, status = 500, err?: unknown) => {
  if (err) console.error(msg, err);
  return json({ error: msg }, status);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return fail("Method not allowed", 405);

  try {
    const contentType = req.headers.get("content-type") ?? "";

    // ---------- login ----------
    if (contentType.includes("application/json")) {
      const peek = await req.clone().json().catch(() => ({}));
      if (peek?.action === "login") {
        const ip = clientIp(req);
        const f = failures.get(ip);
        if (f && f.until > Date.now()) return fail("Too many attempts. Try again later.", 429);

        const username = str(peek.username, 100);
        const password = typeof peek.password === "string" ? peek.password.slice(0, 200) : "";
        const ok = ADMIN_USERNAME.length > 0 && safeEqual(username, ADMIN_USERNAME) && (await verifyPassword(password));

        if (!ok) {
          const count = (f?.count ?? 0) + 1;
          failures.set(ip, { count, until: count >= 5 ? Date.now() + 15 * 60 * 1000 : 0 });
          await new Promise((r) => setTimeout(r, 800));
          return fail("Invalid credentials", 401);
        }
        failures.delete(ip);
        return json({ token: await issueToken(), expiresIn: SESSION_TTL_MS });
      }
    }

    // ---------- everything else requires a valid session ----------
    if (!(await verifyToken(req.headers.get("x-admin-token")))) return fail("Unauthorized", 401);

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return fail("No file provided", 400);
      if (file.size > 5 * 1024 * 1024) return fail("File too large (max 5MB)", 400);
      if (!/^image\/(png|jpe?g|webp|gif|avif)$/.test(file.type)) return fail("Only PNG, JPG, WEBP, GIF or AVIF images are allowed", 400);

      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("project-images")
        .upload(fileName, new Uint8Array(await file.arrayBuffer()), { contentType: file.type });
      if (error) return fail("Upload failed", 500, error);
      const { data } = supabase.storage.from("project-images").getPublicUrl(fileName);
      return json({ url: data.publicUrl });
    }

    const body = await req.json();
    const action = str(body?.action, 30);

    switch (action) {
      case "verify":
        return json({ success: true });

      // ----- projects -----
      case "project_create":
      case "project_update": {
        const p = body?.project ?? {};
        const title = str(p.title, 200);
        const description = str(p.description, 2000);
        if (!title || !description) return fail("Title and description are required", 400);
        const live_url = str(p.live_url, 500);
        const github_url = str(p.github_url, 500);
        if (!isSafeUrl(live_url) || !isSafeUrl(github_url)) return fail("Links must start with http:// or https://", 400);
        const slug = (str(p.slug, 200) || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        if (!slug) return fail("Invalid slug", 400);

        const payload = {
          title, description, slug,
          detailed_description: str(p.detailed_description, 20000) || null,
          live_url: live_url || null,
          github_url: github_url || null,
          tech_stack: strArr(p.tech_stack, 40, 60),
          images: strArr(p.images, 30, 1000).filter(isSafeUrl),
          sort_order: int(p.sort_order, -100000, 100000, 0),
        };

        const { error } = action === "project_create"
          ? await supabase.from("projects").insert(payload)
          : await supabase.from("projects").update(payload).eq("id", str(body?.id, 100));
        if (error) {
          if ((error as { code?: string }).code === "23505") return fail("That URL slug is already used by another project", 400);
          return fail("Could not save project", 500, error);
        }
        return json({ success: true });
      }
      case "project_delete": {
        const { error } = await supabase.from("projects").delete().eq("id", str(body?.id, 100));
        if (error) return fail("Delete failed", 500, error);
        return json({ success: true });
      }

      // ----- skills -----
      case "skill_create":
      case "skill_update": {
        const s = body?.skill ?? {};
        const name = str(s.name, 80);
        if (!name) return fail("Skill name is required", 400);
        const color = str(s.color, 60) || "hsl(174 72% 56%)";
        if (!isSafeColor(color)) return fail("Invalid color", 400);
        const payload = {
          name,
          percentage: int(s.percentage, 0, 100, 80),
          color,
          category: str(s.category, 80) || "Frontend Development",
          featured: Boolean(s.featured),
          sort_order: int(s.sort_order, -100000, 100000, 0),
        };
        const { error } = action === "skill_create"
          ? await supabase.from("skills").insert(payload)
          : await supabase.from("skills").update(payload).eq("id", str(body?.id, 100));
        if (error) return fail("Could not save skill", 500, error);
        return json({ success: true });
      }
      case "skill_delete": {
        const { error } = await supabase.from("skills").delete().eq("id", str(body?.id, 100));
        if (error) return fail("Delete failed", 500, error);
        return json({ success: true });
      }

      default:
        return fail("Unknown action", 400);
    }
  } catch (e) {
    return fail("Unexpected error", 500, e);
  }
});
