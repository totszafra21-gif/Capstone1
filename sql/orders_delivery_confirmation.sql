-- Run this SQL in Supabase SQL Editor to support customer delivery confirmation

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivered_confirmed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivered_confirmed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_orders_delivered_confirmed ON public.orders(delivered_confirmed);

