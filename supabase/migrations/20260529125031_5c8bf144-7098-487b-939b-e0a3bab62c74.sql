
-- Allow any authenticated user to manage news, page_blocks, image_overrides
-- news
DROP POLICY IF EXISTS "Admins can delete news" ON public.news;
DROP POLICY IF EXISTS "Admins can insert news" ON public.news;
DROP POLICY IF EXISTS "Admins can update news" ON public.news;
DROP POLICY IF EXISTS "Admins can view all news" ON public.news;

CREATE POLICY "Authenticated can view all news" ON public.news
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert news" ON public.news
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update news" ON public.news
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete news" ON public.news
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- page_blocks
DROP POLICY IF EXISTS "Admins can delete blocks" ON public.page_blocks;
DROP POLICY IF EXISTS "Admins can insert blocks" ON public.page_blocks;
DROP POLICY IF EXISTS "Admins can update blocks" ON public.page_blocks;
DROP POLICY IF EXISTS "Admins can view all blocks" ON public.page_blocks;

CREATE POLICY "Authenticated can view all blocks" ON public.page_blocks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert blocks" ON public.page_blocks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update blocks" ON public.page_blocks
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete blocks" ON public.page_blocks
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- image_overrides
DROP POLICY IF EXISTS "Admins can manage image overrides" ON public.image_overrides;
CREATE POLICY "Authenticated can manage image overrides" ON public.image_overrides
  FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
