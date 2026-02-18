-- Force schema cache reload by updating database comment
COMMENT ON SCHEMA public IS 'Standard public schema - Reloaded at 2026-02-18 18:35';

-- Re-apply column just in case
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS introduction TEXT;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
