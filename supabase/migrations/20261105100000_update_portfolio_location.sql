UPDATE public.site_settings
SET about_content = jsonb_set(
  COALESCE(about_content, '{}'::jsonb),
  '{paragraphs}',
  COALESCE(
    (
      SELECT jsonb_agg(
        to_jsonb(replace(paragraph.value #>> '{}', 'Rawalpindi, Pakistan', 'Islamabad, Pakistan'))
        ORDER BY paragraph.ordinality
      )
      FROM jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(about_content->'paragraphs') = 'array' THEN about_content->'paragraphs'
          ELSE '[]'::jsonb
        END
      ) WITH ORDINALITY AS paragraph(value, ordinality)
    ),
    '[]'::jsonb
  ),
  true
) || jsonb_build_object('location', 'Islamabad, Pakistan')
WHERE id = 1;
