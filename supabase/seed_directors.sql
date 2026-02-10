-- EPOCH FILM - SEED DATA FOR DEMO (ROBUST VERSION)
-- This script creates 3 Legendary Directors and 30 Epochs (10 each)
-- It also ensures all necessary columns and RLS policies are active.

DO $$
DECLARE
    nolan_id UUID := '00000000-0000-0000-0000-000000000001';
    gerwig_id UUID := '00000000-0000-0000-0000-000000000002';
    bong_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
    -- [1] Schema Safeguards
    -- Users table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'level') THEN
        ALTER TABLE public.users ADD COLUMN level INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'xp') THEN
        ALTER TABLE public.users ADD COLUMN xp INTEGER DEFAULT 0;
    END IF;

    -- Buckets table columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buckets' AND column_name = 'is_public') THEN
        ALTER TABLE public.buckets ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;

    -- [2] RLS Safeguards (Crucial for Explore visibility)
    -- Enable RLS just in case
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.buckets ENABLE ROW LEVEL SECURITY;

    -- Drop existing specific policies to avoid conflicts, then recreate
    DROP POLICY IF EXISTS "Anyone can view profiles" ON public.users;
    CREATE POLICY "Anyone can view profiles" ON public.users FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Anyone can view public buckets" ON public.buckets;
    CREATE POLICY "Anyone can view public buckets" ON public.buckets FOR SELECT USING (is_public = true OR auth.uid() = user_id);

    -- Remove Foreign Key Constraint to allow legendary mock directors
    BEGIN
        ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    -- [3] Insert Mock Directors
    INSERT INTO public.users (id, email, nickname, profile_image_url, level, xp)
    VALUES 
        (nolan_id, 'nolan@cinema.com', 'Christopher Nolan', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', 15, 7500),
        (gerwig_id, 'greta@vision.com', 'Greta Gerwig', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 12, 5400),
        (bong_id, 'bong@archives.com', 'Bong Joon-ho', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 18, 9200)
    ON CONFLICT (id) DO UPDATE SET
        nickname = EXCLUDED.nickname,
        profile_image_url = EXCLUDED.profile_image_url;

    -- [4] Clean & Insert Epochs
    DELETE FROM public.buckets WHERE user_id IN (nolan_id, gerwig_id, bong_id);

    -- Christopher Nolan's Epochs
    INSERT INTO public.buckets (user_id, title, category, status, is_public)
    VALUES
        (nolan_id, 'Inception: The Dream Architecture', 'GROWTH', 'ACHIEVED', true),
        (nolan_id, 'Interstellar: A Trip to Iceland', 'TRAVEL', 'ACHIEVED', true),
        (nolan_id, 'The Dark Knight: Learn Night Photography', 'CULTURE', 'ACHIEVED', true),
        (nolan_id, 'Dunkirk: 70mm Film Collection', 'CULTURE', 'ACHIEVED', true),
        (nolan_id, 'Memento: Write a Non-linear Story', 'GROWTH', 'ACHIEVED', true),
        (nolan_id, 'Oppenheimer: Master Physics Basics', 'GROWTH', 'ACTIVE', true),
        (nolan_id, 'Tenant: Perfect Inverse Movement', 'HEALTH', 'ACTIVE', true),
        (nolan_id, 'Prestige: Learn 10 Magic Tricks', 'CULTURE', 'ACTIVE', true),
        (nolan_id, 'Following: Solo Trip to London', 'TRAVEL', 'ACTIVE', true),
        (nolan_id, 'Insomnia: 30 Days of 5 AM Morning', 'HEALTH', 'ACTIVE', true);

    -- Greta Gerwig's Epochs
    INSERT INTO public.buckets (user_id, title, category, status, is_public)
    VALUES
        (gerwig_id, 'Lady Bird: Visit Sacramento', 'TRAVEL', 'ACHIEVED', true),
        (gerwig_id, 'Little Women: Classic Wardrobe Polish', 'CULTURE', 'ACHIEVED', true),
        (gerwig_id, 'Barbie: Pink Aesthetic Interior', 'CULTURE', 'ACHIEVED', true),
        (gerwig_id, 'Frances Ha: Dance Class Completion', 'HEALTH', 'ACHIEVED', true),
        (gerwig_id, 'Mistress America: NYC Writers Workshop', 'GROWTH', 'ACHIEVED', true),
        (gerwig_id, 'Narnia: Read C.S. Lewis Entirely', 'CULTURE', 'ACTIVE', true),
        (gerwig_id, 'Stage Play: Direct a Community Theater', 'CULTURE', 'ACTIVE', true),
        (gerwig_id, 'Pastoral: Cabin Life for a Month', 'TRAVEL', 'ACTIVE', true),
        (gerwig_id, 'Silk Road: Learn Silk Weaving', 'CULTURE', 'ACTIVE', true),
        (gerwig_id, 'Coming of Age: Write a Memoir', 'GROWTH', 'ACTIVE', true);

    -- Bong Joon-ho's Epochs
    INSERT INTO public.buckets (user_id, title, category, status, is_public)
    VALUES
        (bong_id, 'Parasite: Learn Architecture Basics', 'GROWTH', 'ACHIEVED', true),
        (bong_id, 'Snowpiercer: Trans-Siberian Train Trip', 'TRAVEL', 'ACHIEVED', true),
        (bong_id, 'Memories of Murder: Field Research', 'TRAVEL', 'ACHIEVED', true),
        (bong_id, 'The Host: Han River Marathon', 'HEALTH', 'ACHIEVED', true),
        (bong_id, 'Okja: 1 Year Vegetarian Challenge', 'FOOD', 'ACHIEVED', true),
        (bong_id, 'Mickey 17: Build a Custom PC', 'GROWTH', 'ACTIVE', true),
        (bong_id, 'Underground: French Comic Collection', 'CULTURE', 'ACTIVE', true),
        (bong_id, 'Social Class: Read Das Kapital', 'GROWTH', 'ACTIVE', true),
        (bong_id, 'Visual Story: Storyboard Masterclass', 'CULTURE', 'ACTIVE', true),
        (bong_id, 'Sea Fog: Get a Sailing License', 'TRAVEL', 'ACTIVE', true);

END $$;
