-- Keep admin writes behind the service-role Edge Function.
REVOKE ALL PRIVILEGES ON TABLE public.projects FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.projects TO anon, authenticated;
GRANT ALL ON TABLE public.projects TO service_role;

DROP POLICY IF EXISTS "Allow project inserts" ON public.projects;
DROP POLICY IF EXISTS "Allow project updates" ON public.projects;
DROP POLICY IF EXISTS "Allow project deletes" ON public.projects;

-- The Edge Function uploads with service_role, so public client write policies are unnecessary.
DROP POLICY IF EXISTS "Anyone can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete project images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;

CREATE TABLE IF NOT EXISTS public.edge_rate_limits (
  bucket_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  request_count integer NOT NULL CHECK (request_count >= 0)
);

ALTER TABLE public.edge_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.edge_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.edge_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_edge_rate_limit(
  p_bucket_key text,
  p_limit_count integer,
  p_window_seconds integer
)
RETURNS TABLE (allowed boolean, retry_after_seconds integer)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_window_started_at timestamptz;
  v_request_count integer;
BEGIN
  IF p_bucket_key IS NULL OR length(p_bucket_key) > 128
    OR p_limit_count < 1 OR p_limit_count > 1000
    OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters';
  END IF;

  INSERT INTO public.edge_rate_limits AS current_bucket (bucket_key, window_started_at, request_count)
  VALUES (p_bucket_key, v_now, 1)
  ON CONFLICT (bucket_key) DO UPDATE
    SET window_started_at = CASE
          WHEN current_bucket.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
            THEN v_now
          ELSE current_bucket.window_started_at
        END,
        request_count = CASE
          WHEN current_bucket.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
            THEN 1
          ELSE current_bucket.request_count + 1
        END
  RETURNING current_bucket.window_started_at, current_bucket.request_count
  INTO v_window_started_at, v_request_count;

  IF pg_catalog.random() < 0.01 THEN
    DELETE FROM public.edge_rate_limits
    WHERE window_started_at < v_now - interval '1 day';
  END IF;

  RETURN QUERY
  SELECT
    v_request_count <= p_limit_count,
    CASE
      WHEN v_request_count <= p_limit_count THEN 0
      ELSE GREATEST(
        1,
        CEIL(pg_catalog.extract(epoch FROM (
          v_window_started_at + pg_catalog.make_interval(secs => p_window_seconds) - v_now
        )))::integer
      )
    END;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_edge_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_edge_rate_limit(text, integer, integer) TO service_role;
