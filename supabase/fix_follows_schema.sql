-- EPOCH FILM - Robust Following System Setup
-- This script ensures the follows table exists and is correctly configured.

-- 1. Create table first (if not exists)
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT cannot_follow_self CHECK (follower_id <> following_id)
);

-- 2. Add/Correct Foreign Keys pointing to public.users (not auth.users)
DO $$
BEGIN
    ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
    ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
    
    ALTER TABLE public.follows 
        ADD CONSTRAINT follows_follower_id_fkey 
        FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;
        
    ALTER TABLE public.follows 
        ADD CONSTRAINT follows_following_id_fkey 
        FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;
END $$;

-- 3. Security (RLS)
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);
