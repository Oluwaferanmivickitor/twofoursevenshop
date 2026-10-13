ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'awaiting_payment', ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'order_placed', ADD COLUMN IF NOT EXISTS courier_name text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS tracking_number text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS internal_notes text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS stage_timestamps jsonb NOT NULL DEFAULT '{}'::jsonb;
UPDATE public.orders SET lifecycle_status = CASE WHEN status IN ('processing','packed','shipped','delivered','cancelled','refunded','payment_confirmed','awaiting_payment','payment_failed') THEN status ELSE 'order_placed' END, payment_status = CASE WHEN status IN ('processing','packed','shipped','delivered','payment_confirmed') THEN 'paid' WHEN status = 'refunded' THEN 'refunded' WHEN status = 'payment_failed' THEN 'failed' ELSE 'awaiting_payment' END, stage_timestamps = jsonb_build_object('order_placed', created_at);
CREATE TABLE public.order_activity (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE, actor_id uuid, actor_label text NOT NULL DEFAULT 'Customer', action text NOT NULL, from_status text, to_status text, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.order_activity TO authenticated;
GRANT ALL ON public.order_activity TO service_role;
ALTER TABLE public.order_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read order activity" ON public.order_activity FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX order_activity_order_idx ON public.order_activity(order_id, created_at);
CREATE OR REPLACE FUNCTION public.guard_order_lifecycle() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE old_stage text; next_stage text;
BEGIN
 IF NEW.payment_status NOT IN ('awaiting_payment','paid','failed','refunded') THEN RAISE EXCEPTION 'Invalid payment status'; END IF;
 IF NEW.lifecycle_status NOT IN ('order_placed','payment_confirmed','processing','packed','shipped','delivered','cancelled','refunded','payment_failed','awaiting_payment') THEN RAISE EXCEPTION 'Invalid order stage'; END IF;
 IF NEW.lifecycle_status IN ('payment_confirmed','processing','packed','shipped','delivered') AND NEW.payment_status <> 'paid' THEN RAISE EXCEPTION 'Payment must be paid before processing or dispatch'; END IF;
 IF NEW.lifecycle_status = 'shipped' AND (trim(NEW.courier_name) = '' OR trim(NEW.tracking_number) = '') THEN RAISE EXCEPTION 'Courier name and tracking number are required'; END IF;
 IF TG_OP = 'UPDATE' AND NEW.lifecycle_status <> OLD.lifecycle_status THEN
  old_stage := OLD.lifecycle_status; next_stage := NEW.lifecycle_status;
  IF old_stage IN ('cancelled','refunded') THEN RAISE EXCEPTION 'This order is closed'; END IF;
  IF next_stage = 'refunded' AND OLD.payment_status <> 'paid' THEN RAISE EXCEPTION 'Only a paid order can be recorded as refunded'; END IF;
  IF next_stage NOT IN ('cancelled','refunded','payment_failed','awaiting_payment') AND NOT ((old_stage IN ('order_placed','awaiting_payment','payment_failed') AND next_stage = 'payment_confirmed') OR (old_stage = 'payment_confirmed' AND next_stage = 'processing') OR (old_stage = 'processing' AND next_stage = 'packed') OR (old_stage = 'packed' AND next_stage = 'shipped') OR (old_stage = 'shipped' AND next_stage = 'delivered')) THEN RAISE EXCEPTION 'Advance one stage at a time'; END IF;
  NEW.stage_timestamps := OLD.stage_timestamps || jsonb_build_object(next_stage, now());
  NEW.status := next_stage;
 ELSIF TG_OP = 'INSERT' THEN NEW.stage_timestamps := jsonb_build_object('order_placed', now()); END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER guard_order_lifecycle BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_order_lifecycle();
CREATE OR REPLACE FUNCTION public.log_order_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE who text := coalesce(nullif(auth.jwt()->>'email',''), CASE WHEN auth.uid() IS NULL THEN 'Customer' ELSE 'Store owner' END);
BEGIN
 IF TG_OP = 'INSERT' THEN INSERT INTO public.order_activity(order_id, actor_id, actor_label, action, to_status) VALUES (NEW.id, auth.uid(), who, 'Order placed', NEW.lifecycle_status);
 ELSE
  IF NEW.lifecycle_status <> OLD.lifecycle_status THEN INSERT INTO public.order_activity(order_id, actor_id, actor_label, action, from_status, to_status) VALUES (NEW.id, auth.uid(), who, 'Stage changed', OLD.lifecycle_status, NEW.lifecycle_status); END IF;
  IF NEW.payment_status <> OLD.payment_status THEN INSERT INTO public.order_activity(order_id, actor_id, actor_label, action, from_status, to_status) VALUES (NEW.id, auth.uid(), who, 'Payment changed', OLD.payment_status, NEW.payment_status); END IF;
  IF NEW.internal_notes <> OLD.internal_notes THEN INSERT INTO public.order_activity(order_id, actor_id, actor_label, action) VALUES (NEW.id, auth.uid(), who, 'Internal notes updated'); END IF;
  IF NEW.receipt_path IS DISTINCT FROM OLD.receipt_path THEN INSERT INTO public.order_activity(order_id, actor_id, actor_label, action) VALUES (NEW.id, auth.uid(), who, 'Payment proof updated'); END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.log_order_activity() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER log_order_activity AFTER INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.log_order_activity();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_stock jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS caption text NOT NULL DEFAULT '', ADD COLUMN IF NOT EXISTS link_url text NOT NULL DEFAULT '';
ALTER TABLE public.delivery_locations ADD COLUMN IF NOT EXISTS estimated_days text NOT NULL DEFAULT '';
CREATE TABLE public.store_settings (id text PRIMARY KEY DEFAULT 'store', free_delivery_threshold_ngn integer NOT NULL DEFAULT 0);
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public delivery settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.store_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='orders') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; END IF; END $$;