-- Hard Reset of the introduction column
-- This approach forces the Schema Cache to invalidate because dropping a column is a major structural change.

-- 1. Drop the column if it exists (clearing any "ghost" state)
ALTER TABLE public.users DROP COLUMN IF EXISTS introduction;

-- 2. Force a schema cache reload via notification immediately after drop
NOTIFY pgrst, 'reload schema';

-- 3. Re-add the column freshly
ALTER TABLE public.users ADD COLUMN introduction TEXT;

-- 4. Add the comment again
COMMENT ON COLUMN public.users.introduction IS 'Director bio - Hard Reset';

-- 5. Notify again to be sure
NOTIFY pgrst, 'reload schema';
