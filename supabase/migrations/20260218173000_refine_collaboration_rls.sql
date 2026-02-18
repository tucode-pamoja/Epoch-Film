
-- 1. 공동 편집 권한 강화를 위한 bucket_casts 정책 업데이트
-- CO_DIRECTOR 역할은 버킷을 수정(UPDATE)할 수 있어야 함

-- 정책 D: 공동 감독(CO_DIRECTOR)은 수락된 상태에서 버킷 내용을 수정할 수 있다.
-- 이것은 buckets 테이블에 대한 정책이어야 합니다.

DROP POLICY IF EXISTS "Co-Directors can update buckets" ON public.buckets;

CREATE POLICY "Co-Directors can update buckets"
ON public.buckets
FOR UPDATE
USING (
    auth.uid() = user_id -- 소유자
    OR
    EXISTS (
        SELECT 1 FROM public.bucket_casts
        WHERE bucket_id = buckets.id
          AND user_id = auth.uid()
          AND role = 'CO_DIRECTOR' -- 공동 감독 역할
          AND is_accepted = TRUE -- 수락한 상태
    )
);

-- 2. Memories에 대한 권한 세분화
-- ACTOR: 자신의 기억(Memory)만 추가/수정/삭제 가능
-- CO_DIRECTOR: 모든 기억을 관리 가능 (추가/수정/삭제)

-- 기존 정책 제거
DROP POLICY IF EXISTS "Authorized cast and owners can insert memories" ON public.memories;
DROP POLICY IF EXISTS "Owner can manage all memories" ON public.memories;

-- INSERT 정책 (누가 기억을 추가할 수 있는가?)
-- 소유자, 공동 감독, 그리고 수락한 배우(ACTOR) 모두 추가 가능
CREATE POLICY "Team can add memories"
ON public.memories
FOR INSERT
WITH CHECK (
    -- 기본적으로 본인 ID로 생성해야 함
    auth.uid() = user_id 
    AND (
        -- 버킷 소유자
        EXISTS (SELECT 1 FROM public.buckets WHERE id = bucket_id AND user_id = auth.uid())
        OR
        -- 수락한 캐스트 멤버 (CO_DIRECTOR, ACTOR, GUEST 모두 일단 추가는 가능하게 하거나, GUEST 제외 등 정책 결정)
        -- 여기서는 GUEST 제외하고 CO_DIRECTOR/ACTOR만 가능하게 설정
        EXISTS (
            SELECT 1 FROM public.bucket_casts 
            WHERE bucket_id = memories.bucket_id 
              AND user_id = auth.uid()
              AND is_accepted = TRUE
              AND role IN ('CO_DIRECTOR', 'ACTOR')
        )
    )
);

-- UPDATE/DELETE 정책 (누가 기억을 수정/삭제할 수 있는가?)
-- 1. 자신이 쓴 글은 자신이 수정/삭제 가능
-- 2. 버킷 소유자는 모든 글 관리 가능
-- 3. 공동 감독(CO_DIRECTOR)도 모든 글 관리 가능

CREATE POLICY "Team can manage memories"
ON public.memories
FOR ALL -- UPDATE + DELETE (SELECT는 별도)
USING (
    -- 1. 본인 작성글
    auth.uid() = user_id
    OR
    -- 2. 버킷 소유자
    EXISTS (SELECT 1 FROM public.buckets WHERE id = bucket_id AND user_id = auth.uid())
    OR
    -- 3. 공동 감독 (CO_DIRECTOR)
    EXISTS (
        SELECT 1 FROM public.bucket_casts 
        WHERE bucket_id = memories.bucket_id 
          AND user_id = auth.uid()
          AND is_accepted = TRUE
          AND role = 'CO_DIRECTOR'
    )
);

-- 3. 실시간 알림을 위한 Function 추가 (옵션)
-- 캐스팅 상태 변경 시 알림 등을 처리할 수 있는 트리거 로직은 추후 구현

-- 4. 타입 안전성을 위한 Check Constraint 재확인
ALTER TABLE public.bucket_casts DROP CONSTRAINT IF EXISTS bucket_casts_role_check;
ALTER TABLE public.bucket_casts ADD CONSTRAINT bucket_casts_role_check CHECK (role IN ('CO_DIRECTOR', 'ACTOR', 'GUEST'));
