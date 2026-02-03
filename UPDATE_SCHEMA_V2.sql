-- EPOCH FILM - Database Schema Update v2
-- Feature Enhancements: Quest System & Leveling & Memory Reels

-- Add XP and Level to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- Quests Table
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 100,
    category TEXT, -- 'DAILY', 'WEEKLY', 'SEASONAL'
    requirement_type TEXT, -- 'CREATE_BUCKET', 'COMPLETE_BUCKET', 'UPLOAD_MEMORY'
    requirement_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Quests Progress
CREATE TABLE IF NOT EXISTS public.user_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, quest_id)
);

-- Memory Reels (Yearly/Monthly Recaps)
CREATE TABLE IF NOT EXISTS public.memory_reels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER, -- NULL for yearly
    media_urls TEXT[] DEFAULT '{}', -- Compiled list of memory URLs
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

-- Quests (Public read)
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quests are viewable by everyone" ON public.quests FOR SELECT USING (true);

-- User Quests (Owner read/write)
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quest progress" ON public.user_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own quest progress" ON public.user_quests FOR UPDATE USING (auth.uid() = user_id);

-- Memory Reels (Owner write, Public/Owner read)
ALTER TABLE public.memory_reels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own memory reels" ON public.memory_reels FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create their own memory reels" ON public.memory_reels FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed Initial Quests
INSERT INTO public.quests (title, description, xp_reward, category, requirement_type, requirement_count)
VALUES 
('First Frame', 'Create your first bucket list item.', 100, 'ONE_TIME', 'CREATE_BUCKET', 1),
('Documentation Start', 'Upload 3 check-in memories.', 200, 'ONE_TIME', 'UPLOAD_MEMORY', 3),
('Epoch Achieved', 'Complete your first dream.', 500, 'ONE_TIME', 'COMPLETE_BUCKET', 1)
ON CONFLICT DO NOTHING;
