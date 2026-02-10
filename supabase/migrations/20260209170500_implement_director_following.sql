-- 20260209170500_implement_director_following.sql
-- Implement Director Following system

-- 1. Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT cannot_follow_self CHECK (follower_id <> following_id)
);

-- 2. Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
CREATE POLICY "Anyone can view follows" ON public.follows 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows 
FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows 
FOR DELETE USING (auth.uid() = follower_id);
