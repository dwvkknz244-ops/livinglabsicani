
-- Storage bucket for editable site images
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public can read site-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

-- Admin write
CREATE POLICY "Admins can upload site-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site-images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

-- Overrides table mapping image key -> URL
CREATE TABLE public.image_overrides (
  key text PRIMARY KEY,
  url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.image_overrides TO anon, authenticated;
GRANT ALL ON public.image_overrides TO service_role;

ALTER TABLE public.image_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view image overrides"
ON public.image_overrides FOR SELECT
USING (true);

CREATE POLICY "Admins can manage image overrides"
ON public.image_overrides FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
