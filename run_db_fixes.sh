#!/bin/bash
export DATABASE_URL=$(grep DATABASE_URL .env.local | cut -d '=' -f2-)
echo "Applying schema fixes..."
psql "$DATABASE_URL" -f supabase/migrations/20260209000000_fix_quests_schema.sql
psql "$DATABASE_URL" -f supabase/migrations/20260211100000_update_casting_and_memories_rls.sql
psql "$DATABASE_URL" -f supabase/migrations/20260211101000_implement_casting_and_realtime_tickets.sql
echo "Reloading schema cache..."
psql "$DATABASE_URL" -c "NOTIFY pgrst, 'reload schema';"
echo "Done."
