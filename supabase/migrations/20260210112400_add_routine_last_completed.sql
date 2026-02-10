-- Migration: Add routine_last_completed_at to track cycle completion
ALTER TABLE public.buckets 
ADD COLUMN IF NOT EXISTS routine_last_completed_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.buckets.routine_last_completed_at IS 'Tracks the last time a routine was marked complete for cycle reset logic';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
