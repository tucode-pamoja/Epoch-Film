-- EPOCH FILM - Database Schema Update v3
-- Feature: Daily Ticket System

-- Add daily_tickets and last_ticket_reset_at to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS daily_tickets INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS last_ticket_reset_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create bucket_tickets table if not exists (to track who gave tickets to which bucket)
CREATE TABLE IF NOT EXISTS public.bucket_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    bucket_id UUID REFERENCES public.buckets(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, bucket_id)
);

-- Enable RLS for bucket_tickets
ALTER TABLE public.bucket_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view bucket tickets" ON public.bucket_tickets FOR SELECT USING (true);
CREATE POLICY "Users can insert their own bucket tickets" ON public.bucket_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add comments table if not exists
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket_id UUID REFERENCES public.buckets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For nested comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Recipient
    actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Who triggered the action
    bucket_id UUID REFERENCES public.buckets(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'TICKET', 'COMMENT', 'QUEST_COMPLETE'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
