-- Force schema cache reload by dropping and recreating the settings column
-- This is often needed when PostgREST (Supabase API) doesn't pick up new columns immediately

ALTER TABLE public.users DROP COLUMN IF EXISTS settings;
ALTER TABLE public.users ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows updates (inherited from table permissions, but good to be explicit)
COMMENT ON COLUMN public.users.settings IS 'User preferences for Epoch Film';

-- Force reload
NOTIFY pgrst, 'reload schema';
