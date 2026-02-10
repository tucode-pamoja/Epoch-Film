-- Ensure bucket_tickets table exists
CREATE TABLE IF NOT EXISTS public.bucket_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    bucket_id UUID REFERENCES public.buckets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, bucket_id)
);

-- Ensure RLS is enabled
ALTER TABLE public.bucket_tickets ENABLE ROW LEVEL SECURITY;

-- Re-create the RPC function to ensure it exists
CREATE OR REPLACE FUNCTION public.issue_bucket_ticket(
    p_bucket_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bucket_owner_id UUID;
    v_daily_tickets INTEGER;
    v_existing_ticket_id UUID;
BEGIN
    -- 1. Get bucket owner and check existence
    SELECT user_id INTO v_bucket_owner_id FROM public.buckets WHERE id = p_bucket_id;
    IF v_bucket_owner_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '존재하지 않는 버킷입니다.');
    END IF;

    -- 2. Check if user has daily tickets (Handling null as 0)
    SELECT daily_tickets INTO v_daily_tickets FROM public.users WHERE id = p_user_id;
    IF v_daily_tickets IS NULL OR v_daily_tickets <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', '오늘 사용할 수 있는 티켓이 없습니다.');
    END IF;

    -- 3. Check if already issued
    SELECT id INTO v_existing_ticket_id FROM public.bucket_tickets 
    WHERE user_id = p_user_id AND bucket_id = p_bucket_id;
    
    IF v_existing_ticket_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '이미 이 버킷에 티켓을 발행했습니다.');
    END IF;

    -- 4. Execute Ticket Issuance
    
    -- Insert into bucket_tickets
    INSERT INTO public.bucket_tickets (user_id, bucket_id)
    VALUES (p_user_id, p_bucket_id);

    -- Update bucket ticket count
    UPDATE public.buckets
    SET tickets = COALESCE(tickets, 0) + 1
    WHERE id = p_bucket_id;

    -- Deduct daily ticket from issuer and give XP
    UPDATE public.users
    SET daily_tickets = daily_tickets - 1,
        xp = COALESCE(xp, 0) + 5
    WHERE id = p_user_id;

    -- Give XP to bucket owner
    UPDATE public.users
    SET xp = COALESCE(xp, 0) + 20
    WHERE id = v_bucket_owner_id;

    RETURN jsonb_build_object('success', true, 'message', '티켓이 성공적으로 발행되었습니다.');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
