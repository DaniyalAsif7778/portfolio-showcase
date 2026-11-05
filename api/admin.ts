type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined> & { host?: string; origin?: string; cookie?: string };
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
};

const COOKIE_NAME = "portfolio_admin";
const COOKIE_TTL_SECONDS = 2 * 60 * 60;
const cookie = (value: string, maxAge: number) =>
  `${COOKIE_NAME}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}`;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const host = req.headers.host ?? "";
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== host) return res.status(403).json({ error: "Forbidden" });
    } catch {
      return res.status(403).json({ error: "Forbidden" });
    }
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const action = (body as { action?: string } | null)?.action;
  if (!body || typeof body !== "object" || typeof action !== "string") {
    return res.status(400).json({ error: "Invalid request" });
  }

  if (action === "logout") {
    res.setHeader("Set-Cookie", cookie("", 0));
    return res.status(200).json({ success: true });
  }

  const supabaseUrl = req.headers["x-supabase-url"];
  const publishableKey = req.headers["x-supabase-publishable-key"];
  const urlValue = Array.isArray(supabaseUrl) ? supabaseUrl[0] : supabaseUrl;
  const keyValue = Array.isArray(publishableKey) ? publishableKey[0] : publishableKey;
  let endpoint: URL;
  try {
    endpoint = new URL(String(urlValue));
  } catch {
    return res.status(400).json({ error: "Supabase configuration is invalid" });
  }
  if (endpoint.protocol !== "https:" || !/^[a-z0-9-]+\.supabase\.co$/i.test(endpoint.hostname) || !keyValue) {
    return res.status(400).json({ error: "Supabase configuration is invalid" });
  }

  const encodedToken = req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  let token: string | undefined;
  try {
    token = encodedToken ? decodeURIComponent(encodedToken) : undefined;
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (action !== "login" && !token) return res.status(401).json({ error: "Unauthorized" });

  const upstream = await fetch(`${endpoint.origin}/functions/v1/admin-projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: String(keyValue),
      Authorization: `Bearer ${String(keyValue)}`,
      ...(token ? { "x-admin-token": token } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await upstream.json().catch(() => ({ error: "Admin service returned an invalid response" }));

  if (action === "login" && upstream.ok && typeof data?.token === "string") {
    res.setHeader("Set-Cookie", cookie(encodeURIComponent(data.token), COOKIE_TTL_SECONDS));
    return res.status(200).json({ success: true });
  }
  if (upstream.status === 401) res.setHeader("Set-Cookie", cookie("", 0));
  return res.status(upstream.status).json(data);
}
