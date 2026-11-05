-- Restore useful skills from the earlier portfolio under clear homepage categories.
INSERT INTO public.skills (name, category, sort_order)
SELECT restored.name, restored.category, restored.sort_order
FROM (VALUES
  ('React Router', 'Routing', 25),
  ('TanStack Router', 'Routing', 26),
  ('GSAP', 'Animation', 27)
) AS restored(name, category, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.skills existing WHERE lower(existing.name) = lower(restored.name)
);
