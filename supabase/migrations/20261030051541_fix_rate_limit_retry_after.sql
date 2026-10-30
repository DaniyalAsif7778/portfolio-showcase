-- Keep the retry interval calculation portable and record the fix as a new migration.
CREATE OR REPLACE FUNCTION public.consume_edge_rate_limit(
  p_bucket_key text,
  p_limit_count integer,
  p_window_seconds integer
)
RETURNS TABLE(allowed boolean, retry_after_seconds integer)
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_window_started_at timestamptz;
  v_request_count integer;
  v_diff_seconds integer;
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

  v_diff_seconds := CAST(
    CEIL(
      EXTRACT(EPOCH FROM (v_window_started_at + pg_catalog.make_interval(secs => p_window_seconds)))
      - EXTRACT(EPOCH FROM v_now)
    ) AS integer
  );

  IF v_diff_seconds < 1 THEN
    v_diff_seconds := 1;
  END IF;

  RETURN QUERY
  SELECT
    v_request_count <= p_limit_count AS allowed,
    CASE WHEN v_request_count <= p_limit_count THEN 0 ELSE v_diff_seconds END AS retry_after_seconds;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_edge_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_edge_rate_limit(text, integer, integer) TO service_role;
