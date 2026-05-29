
-- Fix search_path on trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Restrict has_role execution
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Tighten public insert policies with explicit field checks
DROP POLICY "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
    AND length(message) BETWEEN 1 AND 5000
  );

DROP POLICY "Anyone can submit membership" ON public.membership_requests;
CREATE POLICY "Anyone can submit membership"
  ON public.membership_requests FOR INSERT
  WITH CHECK (
    length(company_name) BETWEEN 1 AND 200
    AND length(contact_name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
  );
