-- Keep the fallback profile and the shared Supabase profile aligned with the supplied education details.
UPDATE public.site_settings
SET about_content = jsonb_set(
  COALESCE(about_content, '{}'::jsonb),
  '{education}',
  '[
    {"title":"Intermediate Computer Science (ICS)","school":"Superior College Pindsultani","period":""},
    {"title":"Matric in Computer Science","school":"SPIRIT SCHOOL Basal","period":"2023 to 2025"}
  ]'::jsonb,
  true
),
updated_at = now()
WHERE id = 1;
