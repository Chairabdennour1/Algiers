
CREATE TABLE public.property_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_name text NOT NULL,
  property_type text NOT NULL,
  location text NOT NULL,
  price numeric NOT NULL,
  image_url text,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.property_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON public.property_submissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own submissions"
  ON public.property_submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view approved submissions"
  ON public.property_submissions FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Admins can view all submissions"
  ON public.property_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
  ON public.property_submissions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
