-- EPOCH FILM - Database RPC for Atomic Ticket Issuance
-- Feature: Transactional ticket deduction and XP rewards

CREATE OR REPLACE FUNCTION public.issue_bucket_ticket(
    p_bucket_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to update users and buckets
AS $$
DECLARE
    v_bucket_owner_id UUID;
    v_daily_tickets INTEGER;
    v_existing_ticket_id UUID;
    v_result JSONB;
BEGIN
    -- 1. Get bucket owner and check existence
    SELECT user_id INTO v_bucket_owner_id FROM public.buckets WHERE id = p_bucket_id;
    IF v_bucket_owner_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '존재하지 않는 버킷입니다.');
    END IF;

    -- 2. Check if user is the owner (can't issue ticket to own bucket if you want)
    -- IF v_bucket_owner_id = p_user_id THEN
    --    RETURN jsonb_build_object('success', false, 'message', '자신의 버킷에는 티켓을 발행할 수 없습니다.');
    -- END IF;

    -- 3. Check if user has daily tickets
    SELECT daily_tickets INTO v_daily_tickets FROM public.users WHERE id = p_user_id;
    IF v_daily_tickets IS NULL OR v_daily_tickets <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', '오늘 사용할 수 있는 티켓이 없습니다.');
    END IF;

    -- 4. Check if already issued
    SELECT id INTO v_existing_ticket_id FROM public.bucket_tickets 
    WHERE user_id = p_user_id AND bucket_id = p_bucket_id;
    
    IF v_existing_ticket_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '이미 이 버킷에 티켓을 발행했습니다.');
    END IF;

    -- TRANSACTION START (Implicit in PG function)
    
    -- 5. Insert into bucket_tickets
    INSERT INTO public.bucket_tickets (user_id, bucket_id)
    VALUES (p_user_id, p_bucket_id);

    -- 6. Update bucket ticket count
    UPDATE public.buckets
    SET tickets = tickets + 1
    WHERE id = p_bucket_id;

    -- 7. Deduct daily ticket from issuer
    UPDATE public.users
    SET daily_tickets = daily_tickets - 1,
        xp = xp + 5 -- Issuer reward
    WHERE id = p_user_id;

    -- 8. Give XP to bucket owner
    UPDATE public.users
    SET xp = xp + 20 -- Owner reward
    WHERE id = v_bucket_owner_id;

    -- TRANSACTION END
    
    RETURN jsonb_build_object('success', true, 'message', '티켓이 성공적으로 발행되었습니다.');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
