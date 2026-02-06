-- Add location coordinates to memories table
ALTER TABLE public.memories
ADD COLUMN IF NOT EXISTS location_lat double precision,
ADD COLUMN IF NOT EXISTS location_lng double precision;

-- Comment for documentation
COMMENT ON COLUMN public.memories.location_lat IS 'Latitude coordinate of the memory capture';
COMMENT ON COLUMN public.memories.location_lng IS 'Longitude coordinate of the memory capture';
