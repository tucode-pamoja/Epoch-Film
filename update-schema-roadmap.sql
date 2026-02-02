-- Add roadmap column to buckets table to store AI generated plan
alter table public.buckets
add column if not exists roadmap jsonb;

-- Example structure of roadmap JSONB:
-- {
--   "steps": [
--     { "step": 1, "title": "Research", "description": "Find flight tickets..." },
--     { "step": 2, "title": "Booking", "description": "Book hotels..." }
--   ],
--   "estimated_cost": "$2000",
--   "timeline": "3 months"
-- }