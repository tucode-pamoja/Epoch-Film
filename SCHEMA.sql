-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create 'buckets' table
create table public.buckets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null,
  status text default 'ACTIVE' check (status in ('DRAFT', 'ACTIVE', 'ACHIEVED')),
  is_pinned boolean default false,
  target_date date,
  importance int default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create 'memories' table
create table public.memories (
  id uuid default uuid_generate_v4() primary key,
  bucket_id uuid references public.buckets(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  media_type text default 'IMAGE',
  media_url text not null,
  caption text,
  location_name text,
  captured_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.buckets enable row level security;
alter table public.memories enable row level security;

-- 4. Create Policies
-- Buckets: Users can see/edit their own buckets
create policy "Users can view their own buckets" on public.buckets
  for select using (auth.uid() = user_id);

create policy "Users can insert their own buckets" on public.buckets
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own buckets" on public.buckets
  for update using (auth.uid() = user_id);

create policy "Users can delete their own buckets" on public.buckets
  for delete using (auth.uid() = user_id);

-- Memories: Users can see/edit their own memories
create policy "Users can view their own memories" on public.memories
  for select using (auth.uid() = user_id);

create policy "Users can insert their own memories" on public.memories
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own memories" on public.memories
  for update using (auth.uid() = user_id);

create policy "Users can delete their own memories" on public.memories
  for delete using (auth.uid() = user_id);

-- 5. Realtime (Optional)
alter publication supabase_realtime add table public.buckets;
