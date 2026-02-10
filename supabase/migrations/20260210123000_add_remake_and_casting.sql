-- 1. Buckets 테이블에 리메이크 원본 추적용 컬럼 추가
ALTER TABLE buckets 
ADD COLUMN original_bucket_id UUID REFERENCES buckets(id) ON DELETE SET NULL;

-- 2. 공동 주연(Casting) 관리를 위한 테이블 생성
CREATE TABLE bucket_casts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_id UUID REFERENCES buckets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- 초대받은 배우 (Co-star)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'changes_requested')),
    message TEXT, -- 거절 사유나 수정 제안 메시지
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 한 버킷에 같은 사람은 한 번만 초대 가능
    UNIQUE(bucket_id, user_id)
);

-- 3. RLS (Row Level Security) 설정

-- bucket_casts 테이블 RLS 활성화
ALTER TABLE bucket_casts ENABLE ROW LEVEL SECURITY;

-- 정책 1: 버킷 소유자(감독)는 초대를 보낼(INSERT) 수 있고, 삭제(DELETE)할 수 있음
CREATE POLICY "Bucket owners can manage casts" 
ON bucket_casts
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM buckets 
        WHERE buckets.id = bucket_casts.bucket_id 
        AND buckets.user_id = auth.uid()
    )
);

-- 정책 2: 초대받은 당사자는 자신의 상태를 조회(SELECT)하고 업데이트(UPDATE - 수락/거절/제안) 할 수 있음
CREATE POLICY "Invited users can view and respond" 
ON bucket_casts
FOR ALL
USING (
    user_id = auth.uid()
);

-- 정책 3: 이미 캐스팅된 멤버(accepted)는 해당 버킷을 볼 수 있어야 함 (Buckets 테이블 정책 업데이트 필요)
-- (이 부분은 buckets 테이블의 기존 정책에 추가하거나, 별도 뷰 로직에서 처리)

-- 4. 알림 트리거 등을 위한 함수 (추후 필요시 추가)
