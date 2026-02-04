# EPOCH FILM - Implementation Review & Roadmap

**작성일:** 2026-02-04
**검토 범위:** 기획서 대비 구현 현황, 보완 사항, 추가 기능 제안

---

## Part 1: 구현 현황 체크리스트

### 1.1 Core Features (기획서 기준)

| 기능 | 기획서 | 구현 상태 | 완성도 | 비고 |
|------|--------|-----------|--------|------|
| **인증 시스템** | Google, Kakao, Apple 소셜 로그인 | ✅ 구현됨 | 90% | Apple 로그인 테스트 필요 |
| **Archive CRUD** | 버킷 생성/수정/삭제 | ✅ 구현됨 | 95% | 삭제 확인 모달 개선 필요 |
| **Selected Sequence** | 최대 10개 핀 | ✅ 구현됨 | 100% | - |
| **Check-in Shot** | 사진 업로드 + 캡션 | ✅ 구현됨 | 85% | 동영상 미지원, EXIF 자동추출 미구현 |
| **AI Director** | 로드맵 생성 | ✅ 구현됨 | 95% | Groq + Gemini 이중화 완료 |
| **Hall of Fame** | 뱃지 시스템 | ✅ 구현됨 | 80% | 뱃지 5종만 구현, 확장 필요 |
| **Letter to Future** | 타임캡슐 편지 | ✅ 구현됨 | 90% | 알림 시스템 연동 미구현 |
| **Life Dashboard** | 통계/레벨/스트릭 | ✅ 구현됨 | 70% | Mock 데이터 사용 중, 실제 계산 로직 필요 |
| **Quest System** | 일간/주간 퀘스트 | ✅ 구현됨 | 60% | UI만 구현, DB/백엔드 로직 없음 |
| **Cinematic Timeline** | 수평 타임라인 | ✅ 구현됨 | 75% | 기본 구조만, 드래그 조정 미구현 |

### 1.2 UI/UX Features (디자인 가이드 기준)

| 요소 | 기획 | 구현 상태 | 완성도 |
|------|------|-----------|--------|
| **Neo-Cinematic 컬러** | Warm gold + Darkroom | ✅ 적용됨 | 100% |
| **Film Grain Effect** | 애니메이션 노이즈 | ✅ 적용됨 | 90% |
| **Film Border (Sprocket)** | 필름 구멍 | ✅ 적용됨 | 100% |
| **Light Leak Effect** | 빛 새어나옴 효과 | ✅ 적용됨 | 90% |
| **Vignette Effect** | 모서리 어둡게 | ⚠️ 클래스만 정의 | 50% |
| **3D Card Tilt** | 마우스 따라 회전 | ✅ 적용됨 | 100% |
| **영화 포스터 스타일 카드** | 2:3 비율, 썸네일 배경 | ✅ 적용됨 | 95% |
| **Display 폰트 (고운 바탕)** | 감성적 헤드라인 | ✅ 적용됨 | 100% |
| **Bottom Navigation** | 모바일 네비게이션 | ✅ 구현됨 | 95% |

### 1.3 Database Schema (스키마 문서 기준)

| 테이블 | 기획 | 구현 | 완성도 | 누락 컬럼 |
|--------|------|------|--------|-----------|
| **users** | ✅ | ✅ | 90% | mbti, preferred_categories |
| **buckets** | ✅ | ✅ | 95% | target_date |
| **memories** | ✅ | ✅ | 80% | location_lat, location_lng, media_type |
| **achievements** | ✅ | ✅ | 100% | - |
| **letters** | ✅ | ✅ | 100% | - |
| **quests** | ❌ 없음 | ❌ 미구현 | 0% | 전체 테이블 필요 |
| **user_quests** | ❌ 없음 | ❌ 미구현 | 0% | 전체 테이블 필요 |

---

## Part 2: 미구현 / 보완 필요 사항

### 2.1 🔴 Critical (즉시 수정 필요)

#### 1. Dashboard 실제 데이터 연동
**현재 문제:** `MOCK_STATS` 하드코딩
```typescript
// 현재 (page.tsx)
const MOCK_STATS = {
  level: 4,
  xp: 1250,
  nextLevelXp: 2000,
  streak: 7,
  completedDreams: 12,
  activeDreams: 5
}
```

**해결 방안:**
```typescript
// 서버에서 계산
async function getUserStats(userId: string) {
  const { data: buckets } = await supabase
    .from('buckets')
    .select('status, created_at')
    .eq('user_id', userId)

  const completed = buckets?.filter(b => b.status === 'ACHIEVED').length || 0
  const active = buckets?.filter(b => b.status === 'ACTIVE').length || 0

  // XP 계산: 완료 1개당 100XP
  const xp = completed * 100

  // 레벨 계산: 500XP마다 레벨업
  const level = Math.floor(xp / 500) + 1

  // 스트릭: 연속 활동 일수 계산 필요 (별도 테이블 또는 로직)

  return { level, xp, nextLevelXp: level * 500, completedDreams: completed, activeDreams: active }
}
```

**작업 항목:**
- [x] `getUserStats` 함수 구현 ([actions.ts](../src/app/archive/actions.ts))
- [x] users 테이블에 `xp`, `level`, `last_active_at` 컬럼 추가
- [x] 스트릭 계산 로직 구현

---

#### 2. Quest System 백엔드 구현
**현재 문제:** UI만 있고 데이터 없음

**필요한 작업:**

```sql
-- 1. quests 테이블 생성
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL')),
  title VARCHAR(200) NOT NULL,
  title_ko VARCHAR(200),
  description TEXT,
  xp_reward INTEGER DEFAULT 0,
  badge_reward VARCHAR(50),
  requirement_type VARCHAR(50) NOT NULL, -- 'CREATE_BUCKET', 'COMPLETE_BUCKET', 'ADD_MEMORY', etc.
  requirement_count INTEGER DEFAULT 1,
  category_filter VARCHAR(50), -- NULL = any category
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. user_quests 테이블
CREATE TABLE user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CLAIMED', 'EXPIRED')),
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- 3. 기본 퀘스트 데이터
INSERT INTO quests (type, title, title_ko, description, xp_reward, requirement_type, requirement_count) VALUES
('DAILY', 'First Frame', '첫 프레임', '오늘 새로운 버킷을 1개 추가하세요', 50, 'CREATE_BUCKET', 1),
('DAILY', 'Memory Keeper', '기억 수집가', '체크인 샷을 1개 업로드하세요', 30, 'ADD_MEMORY', 1),
('WEEKLY', 'Director\'s Cut', '감독판', '이번 주 버킷 2개를 완료하세요', 200, 'COMPLETE_BUCKET', 2),
('WEEKLY', 'Storyteller', '이야기꾼', '5개의 체크인 샷을 업로드하세요', 150, 'ADD_MEMORY', 5),
('MONTHLY', 'Blockbuster', '블록버스터', '이번 달 5개의 버킷을 완료하세요', 500, 'COMPLETE_BUCKET', 5);
```

**작업 항목:**
- [x] DB 마이그레이션 스크립트 실행
- [x] `getActiveQuests`, `updateQuestProgress`, `claimQuestReward` 서버 액션 구현
- [x] QuestList 컴포넌트 실제 데이터 연동
- [x] 버킷 생성/완료 시 퀘스트 진행률 자동 업데이트

---

#### 3. 메모리 메타데이터 자동 추출
**현재 문제:** 사진 업로드 시 EXIF 데이터 미추출

**해결 방안:**
```typescript
// exif-js 또는 piexifjs 라이브러리 사용
import EXIF from 'exif-js'

async function extractImageMetadata(file: File) {
  return new Promise((resolve) => {
    EXIF.getData(file as any, function() {
      const lat = EXIF.getTag(this, 'GPSLatitude')
      const lng = EXIF.getTag(this, 'GPSLongitude')
      const dateTime = EXIF.getTag(this, 'DateTimeOriginal')

      resolve({
        location_lat: lat ? convertDMSToDD(lat) : null,
        location_lng: lng ? convertDMSToDD(lng) : null,
        captured_at: dateTime ? parseExifDate(dateTime) : null,
      })
    })
  })
}
```

**작업 항목:**
- [x] `exif-js` 패키지 설치
- [x] 메타데이터 추출 유틸 함수 작성
- [x] AddRecordModal에서 자동 추출 후 폼에 반영
- [x] memories 테이블에 location 컬럼 추가

---

### 2.2 🟡 Important (1-2주 내 구현 권장)

#### 4. 동영상 지원
**현재:** 이미지만 업로드 가능
**기획:** 1분 이내 동영상 지원

**작업 항목:**
- [ ] memories 테이블 `media_type` 컬럼 추가 (IMAGE | VIDEO)
- [ ] Supabase Storage 동영상 업로드 설정
- [ ] 프론트엔드 비디오 플레이어 컴포넌트
- [ ] 썸네일 자동 생성 (FFmpeg 또는 서버리스 함수)

---

#### 5. 검색 & 필터 고급화
**현재:** 카테고리별 필터만 존재
**필요:** 전체 텍스트 검색, 날짜 범위, 태그 필터

```typescript
// 검색 쿼리 예시
const { data } = await supabase
  .from('buckets')
  .select('*')
  .eq('user_id', userId)
  .textSearch('title', searchQuery, { type: 'websearch' })
  .gte('created_at', startDate)
  .lte('created_at', endDate)
  .contains('tags', [selectedTag])
  .order('created_at', { ascending: false })
```

**작업 항목:**
- [ ] 검색바 UI 컴포넌트 추가
- [ ] 필터 드로어/모달 구현
- [ ] Full-text search 인덱스 생성 (PostgreSQL)
- [ ] URL 파라미터로 필터 상태 유지

---

#### 6. 알림 시스템 기초
**현재:** 알림 없음
**필요:** Letter 오픈 알림, 퀘스트 완료 알림

**작업 항목:**
- [ ] `notifications` 테이블 생성
- [ ] 인앱 알림 UI (벨 아이콘 + 드롭다운)
- [ ] PWA 푸시 알림 설정 (선택)

---

#### 7. 데이터 내보내기
**현재:** 없음
**필요:** JSON/CSV 내보내기, 백업 다운로드

```typescript
// 내보내기 서버 액션
export async function exportUserData(userId: string) {
  const { data: buckets } = await supabase
    .from('buckets')
    .select('*, memories(*), letters(*)')
    .eq('user_id', userId)

  return {
    exported_at: new Date().toISOString(),
    buckets,
  }
}
```

**작업 항목:**
- [ ] 설정 페이지에 내보내기 버튼 추가
- [ ] JSON 다운로드 기능
- [ ] (선택) PDF 보고서 생성

---

### 2.3 🟢 Nice-to-Have (향후 구현)

#### 8. Casting (동행 매칭)
**상태:** 미착수
**복잡도:** 높음

**필요한 구성요소:**
- 매칭 알고리즘 (유사 버킷리스트 점수화)
- 익명 프로필 시스템
- 실시간 채팅 (Supabase Realtime)
- Flash 수락/거절 UI

---

#### 9. Yearly Recap 영상 생성
**상태:** 미착수
**복잡도:** 매우 높음

**필요한 기술:**
- FFmpeg 서버 또는 Cloudflare Workers
- 템플릿 기반 동영상 생성
- 음악 라이선스 (로열티 프리)
- 렌더링 큐 시스템

---

#### 10. Inspiration Feed
**상태:** UI 일부 구현 (`/explore`)
**필요한 작업:**
- 공개 버킷 옵트인 시스템
- 익명 통계 집계
- 큐레이션 컬렉션 관리 어드민

---

## Part 3: 기술 부채 & 코드 품질

### 3.1 즉시 수정 필요

#### 1. TypeScript 타입 개선
```typescript
// 현재: 일부 any 타입 사용
// types/index.ts 보완 필요

export interface UserStats {
  level: number
  xp: number
  nextLevelXp: number
  streak: number
  completedDreams: number
  activeDreams: number
}

export interface Quest {
  id: string
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIAL'
  title: string
  title_ko?: string
  description: string
  xp_reward: number
  progress: number
  requirement_count: number
  is_completed: boolean
  expires_at?: string
}
```

#### 2. 에러 핸들링 일관성
```typescript
// 현재: 일부 액션에서 에러 throw, 일부는 console.error만
// 모든 서버 액션에 일관된 에러 처리 패턴 적용 필요

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createBucket(formData: FormData): Promise<ActionResult<Bucket>> {
  try {
    // ... 로직
    return { success: true, data: bucket }
  } catch (error) {
    console.error('createBucket error:', error)
    return { success: false, error: '버킷 생성에 실패했습니다.' }
  }
}
```

#### 3. 컴포넌트 분리
- `BucketDetailClient.tsx` - 500줄 이상, 분리 필요
- 모달 컴포넌트들 공통 래퍼로 추출
- 훅 분리: `useQuests`, `useUserStats` 등

---

### 3.2 성능 최적화

#### 1. 이미지 최적화
```typescript
// next.config.js 설정 확인
const nextConfig = {
  images: {
    domains: ['phfaqyxhcrnieujigbwh.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
}
```
- [ ] 모든 `<img>` → `<Image>` 변환
- [ ] Supabase Storage Transform 활용 (썸네일 자동 생성)

#### 2. 번들 사이즈
- [ ] `@next/bundle-analyzer` 설치 및 분석
- [ ] framer-motion 트리쉐이킹 확인
- [ ] 동적 임포트 적용 (모달, 에디터 등)

#### 3. 데이터 페칭
- [ ] React Query 또는 SWR 도입 검토
- [ ] 무한 스크롤 구현 (Archive 페이지)
- [ ] Skeleton 로딩 개선

---

## Part 4: 추가 기능 제안

### 4.1 단기 (1-2주)

#### 1. 프로필 페이지
```
/profile
├── 사용자 정보 (닉네임, 프로필 사진)
├── 통계 요약 (레벨, XP, 완료 수)
├── 설정
│   ├── 테마 (다크/라이트 - 현재 다크 고정)
│   ├── 언어 (한국어/영어)
│   └── 알림 설정
└── 데이터 내보내기
```

#### 2. 온보딩 플로우
```
신규 유저 → 웰컴 화면
        ↓
관심 카테고리 선택 (3개)
        ↓
첫 버킷 생성 유도
        ↓
튜토리얼 툴팁
```

#### 3. 공유 기능
- 완료된 버킷을 SNS 공유 (이미지 카드 생성)
- 공유 링크로 버킷 보기 (읽기 전용)

---

### 4.2 중기 (1-2개월)

#### 1. 반복 목표 지원
```typescript
interface RecurringBucket {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  streak_count: number
  last_completed_at: Date
}
```

#### 2. 목표 템플릿
- 인기 버킷리스트 템플릿 제공
- "30 before 30", "여행 버킷리스트" 등
- 한 번에 여러 목표 추가

#### 3. 통계 대시보드 확장
- 카테고리별 완료율 차트
- 월별 활동 히트맵 (GitHub 스타일)
- 평균 완료 소요 시간

---

### 4.3 장기 (3개월+)

#### 1. AI 기능 확장
- 대화형 AI 코칭 (채팅 UI)
- 날씨/위치 기반 추천
- 자동 목표 제안

#### 2. 소셜 기능
- 친구 추가/팔로우
- 친구 활동 피드
- 함께하기 초대

#### 3. 위젯 & 확장
- iOS/Android 홈 화면 위젯
- Chrome 확장 프로그램
- Apple Watch 연동

---

## Part 5: 우선순위 로드맵

### Phase 6: Core Completion (2주)
| 작업 | 담당 | 예상 시간 |
|------|------|----------|
| Dashboard 실제 데이터 연동 | Backend | ✅ |
| Quest System DB + 백엔드 | Backend | ✅ |
| 메모리 EXIF 추출 | Frontend | ✅ |
| 타입 정리 및 에러 핸들링 | Full | ✅ |
| 프로필 페이지 | Full | ✅ |

### Phase 7: Polish & UX (2주)
| 작업 | 담당 | 예상 시간 |
|------|------|----------|
| 검색 & 필터 고급화 | Full | 6h |
| 온보딩 플로우 | Frontend | 8h |
| 공유 기능 | Full | 4h |
| 알림 시스템 기초 | Full | 6h |
| 성능 최적화 | Frontend | 4h |

### Phase 8: Growth (3주)
| 작업 | 담당 | 예상 시간 |
|------|------|----------|
| 동영상 지원 | Full | 12h |
| 반복 목표 | Backend | 8h |
| 통계 대시보드 확장 | Frontend | 8h |
| 데이터 내보내기 | Backend | 4h |
| Inspiration Feed 완성 | Full | 10h |

---

## Part 6: 결론 및 권장사항

### 현재 상태 요약
- **Core 기능:** 85% 완성
- **UI/UX:** 90% 완성 (Neo-Cinematic 디자인 적용됨)
- **백엔드 로직:** 70% 완성 (Mock 데이터 실제 연동 필요)
- **추가 기능:** 40% 완성 (Quest, Inspiration 등)

### 즉시 실행 권장 항목
1. ✅ Dashboard 실제 데이터 연동 (Mock → Real)
2. ✅ Quest System 백엔드 구현
3. ✅ 프로필 페이지 추가
4. ✅ 기본 알림 시스템

### 핵심 성공 지표
| 지표 | 현재 (추정) | 목표 |
|------|------------|------|
| 일일 활성 사용자 (DAU) | - | 100명 |
| 평균 세션 시간 | 2분 | 5분 |
| 7일 리텐션 | 15% | 35% |
| 월 평균 버킷 완료 | 0.5개 | 2개 |

---

> "A film is never really good unless the camera is an eye in the head of a poet."
> — Orson Welles

EPOCH FILM은 사용자의 인생을 시적으로 기록하는 도구입니다.
기술적 완성도를 넘어, 감정적 연결을 만드는 것이 최종 목표입니다.
