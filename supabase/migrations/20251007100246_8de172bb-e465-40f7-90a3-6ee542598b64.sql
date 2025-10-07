-- Add explicit SELECT policy for admins to view all content
CREATE POLICY "Admins can view all content"
ON public.content_pages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));