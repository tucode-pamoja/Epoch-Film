-- EPOCH FILM - Google OAuth Implementation & User Sync
-- This migration ensures that users signing in with Google (or any provider) 
-- are automatically reflected in the public.users table with their profile info.

-- 1. Ensure public.users table exists with correct schema
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nickname TEXT,
    profile_image_url TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    daily_tickets INTEGER DEFAULT 5,
    last_ticket_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Create Sync Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, profile_image_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'name', 
        new.raw_user_meta_data->>'nickname',
        split_part(new.email, '@', 1)
    ),
    COALESCE(
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    nickname = COALESCE(EXCLUDED.nickname, public.users.nickname),
    profile_image_url = COALESCE(EXCLUDED.profile_image_url, public.users.profile_image_url),
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Policies (Finalize)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.users;
CREATE POLICY "Anyone can view profiles" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users 
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
