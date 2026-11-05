-- Public pages only read portfolio content. Admin writes go through the authenticated
-- admin-projects Edge Function using its service role client.
REVOKE ALL PRIVILEGES ON TABLE public.projects FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.projects TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.projects TO service_role;

REVOKE ALL PRIVILEGES ON TABLE public.skills FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.skills TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.skills TO service_role;

REVOKE ALL PRIVILEGES ON TABLE public.site_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.site_settings TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.site_settings TO service_role;

-- Preserve authenticated visitor features while removing the unused anon grants.
REVOKE ALL PRIVILEGES ON TABLE public.project_comments FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.project_comments TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.project_comments TO service_role;

REVOKE ALL PRIVILEGES ON TABLE public.project_likes FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.project_likes TO anon, authenticated;
GRANT INSERT, DELETE ON TABLE public.project_likes TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.project_likes TO service_role;

REVOKE ALL PRIVILEGES ON TABLE public.project_ratings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.project_ratings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.project_ratings TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.project_ratings TO service_role;

REVOKE ALL PRIVILEGES ON TABLE public.edge_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.edge_rate_limits TO service_role;
