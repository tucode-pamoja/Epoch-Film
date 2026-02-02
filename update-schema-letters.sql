-- Create 'letters' table for Time Capsule feature
create table public.letters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  bucket_id uuid references public.buckets(id) on delete set null, -- Optional link to a bucket
  content text not null,
  open_date date not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.letters enable row level security;

-- Policies
create policy "Users can view their own letters" on public.letters
  for select using (auth.uid() = user_id);

create policy "Users can insert their own letters" on public.letters
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own letters" on public.letters
  for update using (auth.uid() = user_id);

-- Index for querying by open_date (for future cron jobs)
create index if not exists letters_open_date_idx on public.letters(open_date);
