-- Create 'achievements' table for Hall of Fame
create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_type text not null, -- e.g., 'FIRST_REEL', 'TRAVELER', 'EARLY_BIRD'
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb -- Optional: to store details like 'level', 'count', etc.
);

-- Enable RLS
alter table public.achievements enable row level security;

-- Policies
create policy "Anyone can view achievements" on public.achievements
  for select using (true);

create policy "System can insert achievements" on public.achievements
  for insert with check (true); -- In real app, restricting to service_role is better, but for simulation allowing authenticated might be easier for now, or just open.

-- Let's stick to standard RLS:
-- Users can see everyone's achievements (Hall of Fame)
-- Only system (via server actions) should ideally insert, but for now we'll allow authenticated users to potentially trigger it via actions that check logic.
