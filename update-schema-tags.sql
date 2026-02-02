-- Add tags column to buckets table
alter table public.buckets 
add column if not exists tags text[] default '{}';

-- Optional: Index for tag search
create index if not exists buckets_tags_idx on public.buckets using gin(tags);
