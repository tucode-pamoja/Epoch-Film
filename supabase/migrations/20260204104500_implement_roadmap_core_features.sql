-- EPOCH FILM - Infrastructure Update
-- Purpose: Implement core dashboard logic, Quest system, and metadata support
-- Date: 2026-02-04

-- 1. Extend users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Extend buckets table
ALTER TABLE public.buckets 
ADD COLUMN IF NOT EXISTS target_date DATE;

-- 3. Extend memories table for metadata
ALTER TABLE public.memories
ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS captured_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS media_type VARCHAR(10) DEFAULT 'IMAGE';

-- 4. Re-setup Quest System (Clean Slate for Roadmap Spec)
DROP TABLE IF EXISTS public.user_quests;
DROP TABLE IF EXISTS public.quests;

CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL')),
  title VARCHAR(200) NOT NULL,
  title_ko VARCHAR(200),
  description TEXT,
  xp_reward INTEGER DEFAULT 0,
  badge_reward VARCHAR(50),
  requirement_type VARCHAR(50) NOT NULL, -- 'CREATE_BUCKET', 'COMPLETE_BUCKET', 'ADD_MEMORY', etc.
  requirement_count INTEGER DEFAULT 1,
  category_filter VARCHAR(50), -- NULL = any category
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CLAIMED', 'EXPIRED')),
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- RLS for Quests
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quests are viewable by everyone" ON public.quests FOR SELECT USING (true);

-- RLS for User Quests
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quest progress" ON public.user_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own quest progress" ON public.user_quests FOR UPDATE USING (auth.uid() = user_id);

-- 5. Seed Initial Quests
INSERT INTO public.quests (type, title, title_ko, description, xp_reward, requirement_type, requirement_count) VALUES
('DAILY', 'First Frame', '첫 프레임', '오늘 새로운 버킷을 1개 추가하세요', 50, 'CREATE_BUCKET', 1),
('DAILY', 'Memory Keeper', '기억 수집가', '체크인 샷을 1개 업로드하세요', 30, 'ADD_MEMORY', 1),
('WEEKLY', 'Director\'s Cut', '감독판', '이번 주 버킷 2개를 완료하세요', 200, 'COMPLETE_BUCKET', 2),
('WEEKLY', 'Storyteller', '이야기꾼', '5개의 체크인 샷을 업로드하세요', 150, 'ADD_MEMORY', 5),
('MONTHLY', 'Blockbuster', '블록버스터', '이번 달 5개의 버킷을 완료하세요', 500, 'COMPLETE_BUCKET', 5);
