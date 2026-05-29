
-- Page blocks: editable sections per page
CREATE TABLE public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('text','image','cta','stat')),
  title text,
  body text,
  image_url text,
  image_alt text,
  cta_label text,
  cta_href text,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX page_blocks_page_order_idx ON public.page_blocks (page, sort_order);

GRANT SELECT ON public.page_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_blocks TO authenticated;
GRANT ALL ON public.page_blocks TO service_role;

ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible blocks"
ON public.page_blocks FOR SELECT
USING (visible = true);

CREATE POLICY "Admins can view all blocks"
ON public.page_blocks FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert blocks"
ON public.page_blocks FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blocks"
ON public.page_blocks FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blocks"
ON public.page_blocks FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER page_blocks_updated_at
BEFORE UPDATE ON public.page_blocks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed Chi siamo
INSERT INTO public.page_blocks (page, sort_order, type, title, body) VALUES
('chi-siamo', 10, 'text', 'Un laboratorio vivente tra monti e mare',
 'LivingLab Sicani nasce dall''incontro tra i custodi della biodiversità mediterranea e una nuova generazione di ricercatori, tecnologi e narratori del territorio.'),
('chi-siamo', 20, 'text', 'Il nostro territorio',
 'Il nostro consorzio aggrega oltre 140 aziende agricole, frantoi, caseifici e laboratori artigianali distribuiti sui Monti Sicani, tra Agrigento e Palermo. Lavoriamo per preservare grani antichi, ulivi secolari, formaggi a latte crudo e l''intero patrimonio di pratiche agroalimentari che rende unica quest''area.'),
('chi-siamo', 30, 'text', 'Un patto territoriale',
 'Non siamo solo un marchio di tutela: siamo un patto territoriale che mette in dialogo saperi tradizionali e strumenti contemporanei — dalla sensoristica IoT alla tracciabilità digitale, dalla certificazione bio alla progettazione di filiere corte.'),
('chi-siamo', 40, 'stat', '140+', 'Produttori associati'),
('chi-siamo', 50, 'stat', '23', 'Comuni dei Sicani'),
('chi-siamo', 60, 'stat', '8', 'Filiere identitarie');
