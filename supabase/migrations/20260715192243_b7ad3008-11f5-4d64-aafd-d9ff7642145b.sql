
-- Roles system
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Products catalog
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'T-Shirt',
  price_ngn integer NOT NULL CHECK (price_ngn >= 0),
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  in_stock boolean NOT NULL DEFAULT true,
  is_archived boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the current catalog
INSERT INTO public.products (slug, name, category, price_ngn, description, image, gallery, sizes, colors, in_stock, is_archived, sort_order) VALUES
(
  'we-different-tee',
  'WE DIFFERENT TEE',
  'T-Shirt',
  125000,
  'Heavyweight cotton tee with the signature ''WE DIFFERENT'' chest graphic and the 247 drip emblem at the back. Available in Black and White.',
  '/__l5e/assets-v1/2bff6fa5-4e96-48bb-917b-79fd7a3b01fc/wd-black-front.jpg',
  '["/__l5e/assets-v1/2bff6fa5-4e96-48bb-917b-79fd7a3b01fc/wd-black-front.jpg","/__l5e/assets-v1/70d31f0a-fcb9-423d-b108-20004b887ba5/wd-black-back.jpg","/__l5e/assets-v1/aedfdf74-18bb-4ce4-965f-44fc400806bb/wd-white-front.jpg","/__l5e/assets-v1/35387505-2de1-4730-8104-31be9134bd8d/wd-white-back.jpg"]'::jsonb,
  '["S","M","L","XL","XXL"]'::jsonb,
  '[{"name":"Black","swatch":"#000000","images":["/__l5e/assets-v1/2bff6fa5-4e96-48bb-917b-79fd7a3b01fc/wd-black-front.jpg","/__l5e/assets-v1/70d31f0a-fcb9-423d-b108-20004b887ba5/wd-black-back.jpg"],"inStock":true},{"name":"White","swatch":"#ffffff","images":["/__l5e/assets-v1/aedfdf74-18bb-4ce4-965f-44fc400806bb/wd-white-front.jpg","/__l5e/assets-v1/35387505-2de1-4730-8104-31be9134bd8d/wd-white-back.jpg"],"inStock":true}]'::jsonb,
  true, false, 1
),
(
  'money-gang-tee',
  'MONEY GANG TEE',
  'T-Shirt',
  150000,
  'Oversized box-fit tee with archival ''MONEY GANG'' portrait print on the chest and the metallic gold 247 star at the back. Available in Black and White.',
  '/__l5e/assets-v1/b8cdd426-6594-497d-b0d8-390228d97436/mg-front.jpg',
  '["/__l5e/assets-v1/b8cdd426-6594-497d-b0d8-390228d97436/mg-front.jpg","/__l5e/assets-v1/ff8af935-30cd-479d-b77c-159b2d4a1e83/mg-back.jpg","/__l5e/assets-v1/c5483fb9-6e5c-4aa5-9271-000c78602b33/mg-white-front.jpg","/__l5e/assets-v1/2655f1bb-835b-41eb-8935-d9b4288f0107/mg-white-back.jpg"]'::jsonb,
  '["S","M","L","XL","XXL"]'::jsonb,
  '[{"name":"Black","swatch":"#000000","images":["/__l5e/assets-v1/b8cdd426-6594-497d-b0d8-390228d97436/mg-front.jpg","/__l5e/assets-v1/ff8af935-30cd-479d-b77c-159b2d4a1e83/mg-back.jpg"],"inStock":true},{"name":"White","swatch":"#ffffff","images":["/__l5e/assets-v1/c5483fb9-6e5c-4aa5-9271-000c78602b33/mg-white-front.jpg","/__l5e/assets-v1/2655f1bb-835b-41eb-8935-d9b4288f0107/mg-white-back.jpg"],"inStock":true}]'::jsonb,
  true, false, 2
),
(
  'abnormal-we-different-tee',
  'ABNORMAL WE DIFFERENT TEE',
  'T-Shirt',
  80000,
  'Statement graphic tee — bold ''247 · I''''m not weird, we just different · R&W'' chest print with the hand-painted ''WE DIFFERENT'' back hit. Cut heavyweight in classic black.',
  '/__l5e/assets-v1/f0a6c3ee-6f24-442a-9285-558a38e24370/abnormal-wd-front.jpg',
  '["/__l5e/assets-v1/f0a6c3ee-6f24-442a-9285-558a38e24370/abnormal-wd-front.jpg","/__l5e/assets-v1/87c71888-4b59-4d37-b866-3cab779c8715/abnormal-wd-back.jpg"]'::jsonb,
  '["S","M","L","XL","XXL"]'::jsonb,
  '[{"name":"Black","swatch":"#000000","images":["/__l5e/assets-v1/f0a6c3ee-6f24-442a-9285-558a38e24370/abnormal-wd-front.jpg","/__l5e/assets-v1/87c71888-4b59-4d37-b866-3cab779c8715/abnormal-wd-back.jpg"],"inStock":true}]'::jsonb,
  true, false, 3
),
(
  '247-beanie',
  '247 BEANIE',
  'Headwear',
  99900,
  'All-over camouflage knit beanie with embroidered 247 leaf motifs.',
  '/__l5e/assets-v1/bafdf842-fa0e-41fb-8a69-33c49136cd1b/beanie.jpg',
  '["/__l5e/assets-v1/bafdf842-fa0e-41fb-8a69-33c49136cd1b/beanie.jpg"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  false, true, 4
);
