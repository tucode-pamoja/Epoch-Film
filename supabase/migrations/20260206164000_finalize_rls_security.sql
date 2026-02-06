-- EPOCH FILM - Security & RLS Finalization
-- Feature: Tighten RLS and protect ticket counts

-- 1. Ensure private buckets are truly private
-- (Existing policies usually cover this, but let's be explicit)
DROP POLICY IF EXISTS "Anyone can view public buckets" ON public.buckets;
CREATE POLICY "Viewable buckets" ON public.buckets
FOR SELECT USING (
    is_public = true 
    OR auth.uid() = user_id
);

-- 2. Protect memories: viewable if bucket is public or user is owner
DROP POLICY IF EXISTS "Users can view their own memories" ON public.memories;
CREATE POLICY "Viewable memories" ON public.memories
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.buckets 
        WHERE id = bucket_id AND (is_public = true OR user_id = auth.uid())
    )
    OR auth.uid() = user_id
);

-- 3. Prevent manual ticket manipulation in buckets table
-- Owner can update title, description etc., but tickets should be handled by RPC
DROP POLICY IF EXISTS "Users can update their own buckets" ON public.buckets;
CREATE POLICY "Users can update their own buckets" ON public.buckets
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id 
    AND (
        -- Protect tickets column from manual updates
        (CASE WHEN tickets IS DISTINCT FROM (SELECT tickets FROM public.buckets WHERE id = id) THEN false ELSE true END)
        OR 
        -- Allow the Service Role or internal RPC (though RPC with SECURITY DEFINER bypasses RLS)
        (auth.role() = 'service_role')
    )
);

-- 4. Bucket Tickets RLS (who issued a ticket)
DROP POLICY IF EXISTS "Anyone can view bucket tickets" ON public.bucket_tickets;
CREATE POLICY "Anyone can view bucket tickets" ON public.bucket_tickets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own bucket tickets" ON public.bucket_tickets;
CREATE POLICY "Users can insert their own bucket tickets" ON public.bucket_tickets 
FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (SELECT 1 FROM public.buckets WHERE id = bucket_id AND is_public = true)
);

-- Note: DELETE is not allowed for tickets to prevent "un-liking" and XP manipulation
CREATE POLICY "No one can delete tickets" ON public.bucket_tickets FOR DELETE USING (false);

-- 5. User Profiles: Only owner can update their profile (XP/Level)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.users;
CREATE POLICY "Anyone can view profiles" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users 
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND (
        -- Protect XP and Level from manual updates
        (CASE WHEN xp IS DISTINCT FROM (SELECT xp FROM public.users WHERE id = id) THEN false ELSE true END)
        AND (CASE WHEN level IS DISTINCT FROM (SELECT level FROM public.users WHERE id = id) THEN false ELSE true END)
        AND (CASE WHEN daily_tickets IS DISTINCT FROM (SELECT daily_tickets FROM public.users WHERE id = id) THEN false ELSE true END)
    )
    OR (auth.role() = 'service_role')
);
