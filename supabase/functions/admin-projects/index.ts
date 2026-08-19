import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
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

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PANEL_PASSWORD") ?? "";

const isAuthorized = (req: Request) => {
  const provided = req.headers.get("x-admin-password") ?? "";
  return ADMIN_PASSWORD.length > 0 && provided === ADMIN_PASSWORD;
};

const str = (v: unknown, max = 5000) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!isAuthorized(req)) return json({ error: "Unauthorized" }, 401);

    const contentType = req.headers.get("content-type") ?? "";

    // Image upload (multipart)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return json({ error: "No file provided" }, 400);
      if (file.size > 5 * 1024 * 1024) return json({ error: "File too large (max 5MB)" }, 400);
      if (!file.type.startsWith("image/")) return json({ error: "Only image files are allowed" }, 400);

      const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext || "png"}`;

      const { error } = await supabase.storage
        .from("project-images")
        .upload(fileName, new Uint8Array(await file.arrayBuffer()), { contentType: file.type });
      if (error) {
        console.error("upload error", error);
        return json({ error: "Upload failed" }, 500);
      }
      const { data } = supabase.storage.from("project-images").getPublicUrl(fileName);
      return json({ url: data.publicUrl });
    }

    const body = await req.json();
    const action = str(body?.action, 20);

    if (action === "verify") return json({ success: true });

    if (action === "delete") {
      const id = str(body?.id, 100);
      if (!id) return json({ error: "Missing id" }, 400);
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) {
        console.error("delete error", error);
        return json({ error: "Delete failed" }, 500);
      }
      return json({ success: true });
    }

    if (action === "create" || action === "update") {
      const p = body?.project ?? {};
      const title = str(p.title, 200);
      const description = str(p.description, 2000);
      if (!title || !description) return json({ error: "Title and description are required" }, 400);

      const payload = {
        title,
        description,
        slug: str(p.slug, 200) || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        detailed_description: str(p.detailed_description, 20000) || null,
        live_url: str(p.live_url, 500) || null,
        github_url: str(p.github_url, 500) || null,
        tech_stack: Array.isArray(p.tech_stack)
          ? p.tech_stack.filter((t: unknown) => typeof t === "string").slice(0, 40).map((t: string) => t.slice(0, 60))
          : [],
        images: Array.isArray(p.images)
          ? p.images.filter((t: unknown) => typeof t === "string").slice(0, 30).map((t: string) => t.slice(0, 1000))
          : [],
      };

      if (action === "create") {
        const { error } = await supabase.from("projects").insert(payload);
        if (error) {
          console.error("insert error", error);
          return json({ error: "Could not save project" }, 500);
        }
      } else {
        const id = str(body?.id, 100);
        if (!id) return json({ error: "Missing id" }, 400);
        const { error } = await supabase.from("projects").update(payload).eq("id", id);
        if (error) {
          console.error("update error", error);
          return json({ error: "Could not save project" }, 500);
        }
      }
      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("admin-projects error", e);
    return json({ error: "Unexpected error" }, 500);
  }
});
