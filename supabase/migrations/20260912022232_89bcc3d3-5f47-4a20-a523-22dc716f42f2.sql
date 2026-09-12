GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

GRANT SELECT ON public.hero_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO authenticated;
GRANT ALL ON public.hero_slides TO service_role;

GRANT SELECT ON public.delivery_locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_locations TO authenticated;
GRANT ALL ON public.delivery_locations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

INSERT INTO public.hero_slides (image_url, alt, sort_order, is_active)
SELECT * FROM (VALUES
  ('/src/assets/hero-1.jpg', 'TwoFourSeven campaign image one', 0, true),
  ('/src/assets/hero-2.jpg', 'TwoFourSeven campaign image two', 1, true),
  ('/src/assets/hero-3.jpg', 'TwoFourSeven campaign image three', 2, true)
) AS v(image_url, alt, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides);

NOTIFY pgrst, 'reload schema';