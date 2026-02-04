-- Add visibility and ticket count to buckets
ALTER TABLE public.buckets 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tickets INTEGER DEFAULT 0;

-- Optional: Create a table for ticket transactions (likes) to prevent multiple votes
CREATE TABLE IF NOT EXISTS public.bucket_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    bucket_id UUID REFERENCES public.buckets(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, bucket_id)
);

-- RLS for bucket_tickets
ALTER TABLE public.bucket_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ticket counts" ON public.bucket_tickets FOR SELECT USING (true);
CREATE POLICY "Users can issue tickets to public buckets" ON public.bucket_tickets FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM public.buckets WHERE id = bucket_id AND is_public = true)
);

-- Update public buckets policy to allow everyone to see public ones
CREATE POLICY "Anyone can view public buckets" ON public.buckets 
FOR SELECT USING (is_public = true OR auth.uid() = user_id);
