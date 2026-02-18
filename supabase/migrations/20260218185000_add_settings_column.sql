-- Add settings JSONB column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN public.users.settings IS 'User preferences: { notifications: { email: boolean, push: boolean }, privacy: { public_profile: boolean }, theme: string }';

-- Notify schema refresh
NOTIFY pgrst, 'reload schema';
