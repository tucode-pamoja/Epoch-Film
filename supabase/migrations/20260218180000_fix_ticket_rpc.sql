
-- update issue_bucket_ticket RPC to match business logic (unlimited likes style, with notifications)

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
    v_existing_ticket_id UUID;
    v_bucket_title TEXT;
BEGIN
    -- 1. 버킷 소유자 및 정보 확인
    SELECT user_id, title INTO v_bucket_owner_id, v_bucket_title 
    FROM public.buckets 
    WHERE id = p_bucket_id;
    
    IF v_bucket_owner_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '존재하지 않는 버킷입니다.');
    END IF;

    -- 2. 중복 발행 확인 (기존 bucket_tickets 테이블 기준)
    SELECT id INTO v_existing_ticket_id FROM public.bucket_tickets 
    WHERE user_id = p_user_id AND bucket_id = p_bucket_id;
    
    IF v_existing_ticket_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '이미 이 버킷에 티켓을 발행했습니다.');
    END IF;

    -- 3. 티켓 기록 삽입 (실시간 알림용 신규 테이블 - tickets)
    INSERT INTO public.tickets (sender_id, receiver_id, bucket_id)
    VALUES (p_user_id, v_bucket_owner_id, p_bucket_id);

    -- 4. 중복 방지용 레거시 테이블 삽입 (bucket_tickets)
    INSERT INTO public.bucket_tickets (user_id, bucket_id)
    VALUES (p_user_id, p_bucket_id);

    -- 5. 버킷 티켓 수 증가
    UPDATE public.buckets
    SET tickets = tickets + 1
    WHERE id = p_bucket_id;

    -- 6. 발권자 XP 지급 (감상 보상)
    UPDATE public.users
    SET xp = xp + 5
    -- daily_tickets 차감 로직 제거 (무제한 티켓/좋아요 모드)
    WHERE id = p_user_id;

    -- 7. 소유자 XP 지급 (티켓 수신 보상)
    UPDATE public.users
    SET xp = xp + 20
    WHERE id = v_bucket_owner_id;

    -- 8. 알림 생성 (Notifications)
    -- 본인이 본인 버킷에 티켓을 발행하는 경우는 알림 생략 (보통 막혀있지만)
    IF v_bucket_owner_id != p_user_id THEN
        INSERT INTO public.notifications (user_id, actor_id, bucket_id, type, is_read)
        VALUES (v_bucket_owner_id, p_user_id, p_bucket_id, 'TICKET', FALSE);
    END IF;
    
    RETURN jsonb_build_object('success', true, 'message', '티켓이 성공적으로 발행되었습니다.');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
