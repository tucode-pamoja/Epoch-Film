-- Supabase SQL to setup Webhooks for Push Notifications
-- Note: Replace 'YOUR_EDGE_FUNCTION_URL' and 'YOUR_SERVICE_ROLE_KEY' with actual values.

-- 1. Enable HTTP Extension
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- 2. Create the Webhook Trigger for 'bucket_casts'
CREATE OR REPLACE FUNCTION public.handle_bucket_cast_notification()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'YOUR_EDGE_FUNCTION_URL',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW),
        'table', 'bucket_casts',
        'type', TG_OP
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_bucket_cast_inserted
AFTER INSERT ON public.bucket_casts
FOR EACH ROW EXECUTE FUNCTION public.handle_bucket_cast_notification();

-- 3. Create the Webhook Trigger for 'quests' (completion)
CREATE OR REPLACE FUNCTION public.handle_quest_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if quest is just achieved
  IF (NEW.achieved = true AND (OLD.achieved = false OR OLD.achieved IS NULL)) THEN
    PERFORM
      net.http_post(
        url := 'YOUR_EDGE_FUNCTION_URL',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
        ),
        body := jsonb_build_object(
          'record', row_to_json(NEW),
          'table', 'quests',
          'type', TG_OP
        )
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_quest_achieved
AFTER UPDATE ON public.quests
FOR EACH ROW EXECUTE FUNCTION public.handle_quest_notification();
