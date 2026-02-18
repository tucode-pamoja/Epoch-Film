-- Add comment to force schema update
COMMENT ON COLUMN public.users.introduction IS 'Director bio';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
