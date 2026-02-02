-- Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;

-- Policy: Allow authenticated users to upload to 'memories' bucket
create policy "Authenticated users can upload to memories" on storage.objects for insert to authenticated
with
    check (bucket_id = 'memories');

-- Policy: Allow users to update/delete their own files
create policy "Users can update their own memories" on storage.objects for
update to authenticated using (
    bucket_id = 'memories'
    and auth.uid () = owner
);

create policy "Users can delete their own memories" on storage.objects for delete to authenticated using (
    bucket_id = 'memories'
    and auth.uid () = owner
);

-- Policy: Allow public read access (matches public bucket setting)
create policy "Public can view memories" on storage.objects for
select
    to public using (bucket_id = 'memories');