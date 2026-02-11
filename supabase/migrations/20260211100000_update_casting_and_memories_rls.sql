-- 1. bucket_casts 테이블 업데이트: role 및 is_accepted 필드 추가
ALTER TABLE bucket_casts 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'ACTOR',
ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT FALSE;

-- 기존 status 기반으로 is_accepted 초기화 (하위 호환성)
UPDATE bucket_casts 
SET is_accepted = TRUE 
WHERE status = 'accepted';

-- 2. memories 테이블 RLS 강화: 소유자 및 수락된 캐스팅 멤버가 장면(Memory)을 업로드할 수 있도록 허용
-- 기존 INSERT 정책 삭제
DROP POLICY IF EXISTS "Users can insert their own memories" ON public.memories;

-- 새로운 INSERT 정책 추가
CREATE POLICY "Authorized cast and owners can insert memories" 
ON public.memories
FOR INSERT 
WITH CHECK (
    auth.uid() = user_id -- 본인의 데이터(user_id)여야 함
    AND (
        -- 1) 버킷의 소유자인 경우
        EXISTS (
            SELECT 1 FROM public.buckets 
            WHERE id = memories.bucket_id AND user_id = auth.uid()
        )
        OR 
        -- 2) 버킷의 캐스트 멤버이며 초대를 수락한 경우
        EXISTS (
            SELECT 1 FROM public.bucket_casts 
            WHERE bucket_id = memories.bucket_id 
              AND user_id = auth.uid() 
              AND is_accepted = TRUE
        )
    )
);

-- 3. memories 테이블 SELECT 정책 업데이트: 캐스트 멤버도 비공개 버킷의 장면을 볼 수 있어야 함
DROP POLICY IF EXISTS "Viewable memories" ON public.memories;
CREATE POLICY "Viewable memories" ON public.memories
FOR SELECT USING (
    auth.uid() = user_id -- 본인이 올린 장면
    OR
    EXISTS (
        SELECT 1 FROM public.buckets 
        WHERE id = memories.bucket_id 
          AND (
            is_public = true -- 공개 버킷
            OR user_id = auth.uid() -- 소유자
            OR EXISTS ( -- 수락된 캐스트 멤버
                SELECT 1 FROM public.bucket_casts 
                WHERE bucket_id = memories.bucket_id 
                  AND user_id = auth.uid() 
                  AND is_accepted = TRUE
            )
          )
    )
);
