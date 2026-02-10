-- Migration: Implement Production Routines
-- Adds routine-related columns to the buckets table

ALTER TABLE public.buckets 
ADD COLUMN IF NOT EXISTS is_routine BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS routine_frequency TEXT CHECK (routine_frequency IN ('DAILY', 'WEEKLY', 'MONTHLY')),
ADD COLUMN IF NOT EXISTS routine_days INTEGER[] DEFAULT NULL;

-- Index for performance on home tab filtering
CREATE INDEX IF NOT EXISTS idx_buckets_is_routine ON public.buckets(is_routine);
CREATE INDEX IF NOT EXISTS idx_buckets_user_routine ON public.buckets(user_id, is_routine);

-- Comment for clarity
COMMENT ON COLUMN public.buckets.is_routine IS 'True if this is a recurring production routine';
COMMENT ON COLUMN public.buckets.routine_frequency IS 'Cycle for routines: DAILY, WEEKLY, or MONTHLY';
COMMENT ON COLUMN public.buckets.routine_days IS 'Specific days of the week (0-6) for weekly routines';
