-- 1. bucket_casts 테이블 구조 및 정책 재설계 (The Casting Board)
-- 기존 테이블이 있다면 설정을 변경합니다.

-- 역할(role) 제약 조건 추가
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bucket_casts_role_check') THEN
        ALTER TABLE bucket_casts ADD CONSTRAINT bucket_casts_role_check CHECK (role IN ('CO_DIRECTOR', 'ACTOR', 'GUEST'));
    END IF;
END $$;

-- 기존 정책 제거 후 재설계
DROP POLICY IF EXISTS "Bucket owners can manage casts" ON public.bucket_casts;
DROP POLICY IF EXISTS "Invited users can view and respond" ON public.bucket_casts;
DROP POLICY IF EXISTS "Directors can cast members" ON public.bucket_casts;
DROP POLICY IF EXISTS "Members can accept invitation" ON public.bucket_casts;
DROP POLICY IF EXISTS "Cast members visible to team" ON public.bucket_casts;

-- 정책 A: 버킷 소유자(감독)는 멤버를 초대(INSERT)할 수 있다.
CREATE POLICY "Directors can cast members" 
ON bucket_casts FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM buckets WHERE id = bucket_casts.bucket_id
  )
);

-- 정책 B: 초대받은 본인은 자신의 상태를 수락(UPDATE)할 수 있다.
CREATE POLICY "Members can accept invitation" 
ON bucket_casts FOR UPDATE
USING ( auth.uid() = user_id );

-- 정책 C: 관련된 사람들은 명단을 볼 수 있다.
CREATE POLICY "Cast members visible to team" 
ON bucket_casts FOR SELECT 
USING (
  auth.uid() IN (
    SELECT user_id FROM buckets WHERE id = bucket_casts.bucket_id -- 감독
  ) OR 
  auth.uid() = user_id -- 본인
);

-- 2. tickets 테이블 생성 (The Live Signal용)
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bucket_id UUID REFERENCES buckets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tickets 테이블 RLS 설정
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tickets" ON public.tickets FOR SELECT USING (true);

CREATE POLICY "Users can insert tickets" ON public.tickets 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 3. issue_bucket_ticket RPC 함수 업데이트 (새로운 tickets 테이블 연동)
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
    -- 1. 버킷 소유자 확인
    SELECT user_id INTO v_bucket_owner_id FROM public.buckets WHERE id = p_bucket_id;
    IF v_bucket_owner_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '존재하지 않는 버킷입니다.');
    END IF;

    -- 2. 일일 티켓 보유 확인
    SELECT daily_tickets INTO v_daily_tickets FROM public.users WHERE id = p_user_id;
    IF v_daily_tickets IS NULL OR v_daily_tickets <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', '오늘 사용할 수 있는 티켓이 없습니다.');
    END IF;

    -- 3. 중복 발행 확인 (기존 bucket_tickets 테이블 기준 - 하위 호환성 유지)
    SELECT id INTO v_existing_ticket_id FROM public.bucket_tickets 
    WHERE user_id = p_user_id AND bucket_id = p_bucket_id;
    
    IF v_existing_ticket_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', '이미 이 버킷에 티켓을 발행했습니다.');
    END IF;

    -- 4. 티켓 기록 삽입 (실시간 알림용 신규 테이블)
    INSERT INTO public.tickets (sender_id, receiver_id, bucket_id)
    VALUES (p_user_id, v_bucket_owner_id, p_bucket_id);

    -- 5. 중복 방지용 레거시 테이블 삽입
    INSERT INTO public.bucket_tickets (user_id, bucket_id)
    VALUES (p_user_id, p_bucket_id);

    -- 6. 버킷 티켓 수 증가
    UPDATE public.buckets
    SET tickets = tickets + 1
    WHERE id = p_bucket_id;

    -- 7. 발권자 티켓 차감 및 XP 지급
    UPDATE public.users
    SET daily_tickets = daily_tickets - 1,
        xp = xp + 5
    WHERE id = p_user_id;

    -- 8. 소유자 XP 지급
    UPDATE public.users
    SET xp = xp + 20
    WHERE id = v_bucket_owner_id;
    
    RETURN jsonb_build_object('success', true, 'message', '티켓이 성공적으로 발행되었습니다.');

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
