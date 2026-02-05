# EPOCH FILM - Development Checklist

**최종 업데이트:** 2026-02-05
**목적:** 전체 개발 작업 현황 및 우선순위 체크리스트

---

## 🔥 최우선 과제 (P0)

### iPhone 사진 미리보기 및 업로드 문제 해결
> **상태:** ✅ 완료

#### 해결된 문제
- HEIC 포맷 클라이언트 변환 실패 시 미리보기 불가 → 서버 사이드 fallback 추가
- 일부 브라우저에서 heic2any 라이브러리 동작 불안정 → 2단계 변환 체인 구현

#### 구현 내용
- [x] 서버 사이드 이미지 변환 API (`/api/preview`) - sharp + heic-convert
- [x] 클라이언트 → 서버 fallback 체인 구현
- [x] 미리보기 실패 시 플레이스홀더 UI ("iPhone Photo Ready")
- [x] 에러 메시지 스타일 개선 (경고 → 정보성)

---

## ✅ 완료된 작업

### Phase 1-5: 코어 기능 (완료)
- [x] 인증 시스템 (이메일/비밀번호)
- [x] Archive CRUD (버킷 생성/수정/삭제)
- [x] Selected Sequence (최대 10개 핀)
- [x] Check-in Shot (사진 업로드 + 캡션)
- [x] AI Director (로드맵 생성 - Groq + Gemini 이중화)
- [x] Hall of Fame (뱃지 시스템)
- [x] Letter to Future (타임캡슐 편지)
- [x] Life Dashboard (통계/레벨/스트릭)
- [x] Quest System (일간/주간 퀘스트)
- [x] Cinematic Timeline (수평 타임라인)

### Phase 6: 데이터 통합 (완료)
- [x] Dashboard 실제 데이터 연동 (Mock → Real)
- [x] Quest System 백엔드 구현
- [x] 메모리 EXIF 추출 구현
- [x] users 테이블 xp, level, last_active_at 컬럼 추가
- [x] 스트릭 계산 로직 구현
- [x] 프로필 페이지 구현

### Phase 7: 소셜 로그인 (완료)
- [x] `signInWithGoogle` 함수 구현
- [x] `signInWithKakao` 함수 구현
- [x] OAuth Callback Route (`/auth/callback`) 생성
- [x] 로그인 페이지에 소셜 버튼 추가

#### 외부 설정 필요 (사용자 진행)
- [ ] Google Cloud Console OAuth 설정
- [ ] Kakao Developers 앱 설정
- [ ] Supabase Provider 설정

### Phase 8: 소셜 & 인터랙션 (완료)
- [x] 댓글 시스템 (DB + API + UI)
  - [x] `comments` 테이블 생성
  - [x] `getComments`, `createComment`, `deleteComment` 구현
  - [x] `CommentList`, `CommentItem`, `CommentForm` 컴포넌트
- [x] 공유 기능 (OG Image + Share)
  - [x] `/api/og` 라우트 생성 (Vercel OG)
  - [x] Web Share API + 클립보드 fallback
  - [x] ShareButton 컴포넌트
  - [x] 동적 메타태그 생성
- [x] 알림 시스템 기초
  - [x] `notifications` 테이블 생성
  - [x] 댓글 작성 시 알림 트리거
  - [x] NotificationBell 컴포넌트
  - [x] Supabase Realtime 연동

### Phase 9: UI/UX 개선 (부분 완료)
- [x] 무한 스크롤 (`/explore` 적용)
- [x] useInfiniteScroll 커스텀 훅
- [x] 카테고리별 필터링
- [x] 검색 UI (HUD 스타일)

---

## 📋 진행 중 / 예정 작업

### 단기 과제 (1-2주)

#### UI/UX 개선
- [ ] 무한 스크롤 확장
  - [ ] `/archive` (내 메인 보관함)
  - [ ] `/hall-of-fame` (명예의 전당)
- [ ] 검색 및 필터 고도화
  - [ ] 상태 필터 (전체, 진행 중, 완료)
  - [ ] 정렬 (최신순, 인기순, 티켓순)
  - [ ] 기간 필터 (이번 주, 이번 달, 올해)
  - [ ] URL 쿼리 파라미터 필터 상태 유지
- [ ] Optimistic UI 적용
  - [ ] 티켓 발행 버튼
  - [ ] 핀(즐겨찾기) 토글
  - [ ] 댓글 작성/삭제

#### 알림 시스템 확장
- [ ] 티켓 발행 시 알림 트리거
- [ ] `getUnreadNotifications` 함수 구현
- [ ] `markAsRead`, `markAllAsRead` 함수 구현
- [ ] 미읽은 알림 카운트 뱃지

---

### 중기 과제 (3-4주)

#### 비디오 메모리 지원
- [ ] memories 테이블 `media_type` 컬럼 확인
- [ ] Supabase Storage 동영상 업로드 설정 (max 50MB)
- [ ] 비디오 플레이어 컴포넌트
- [ ] 썸네일 자동 생성 (FFmpeg 또는 서버리스)
- [ ] 재생 시간 제한 (1분)

#### 성능 최적화
- [ ] 이미지 최적화 (`<img>` → `<Image>` 전환)
- [ ] 번들 사이즈 분석 (@next/bundle-analyzer)
- [ ] 동적 임포트 적용 (모달, 에디터 등)

---

### 장기 과제 (1-2개월)

#### 시즌제 명예의 전당
- [ ] `hall_of_fame_seasons` 테이블
- [ ] `season_awards` 테이블
- [ ] 월간/연간 시상식 페이지
- [ ] 시즌별 랭킹 집계 로직
- [ ] 수상작 전용 배지

#### 협업 제작 (Join Project)
- [ ] `bucket_collaborators` 테이블
- [ ] 협업 초대 시스템
- [ ] 협업자 목록 UI
- [ ] 권한 관리
- [ ] 공동 메모리 타임라인

#### 모바일 앱 전환
- [ ] PWA 구현
  - [ ] `manifest.json` 생성
  - [ ] Service Worker 설정
  - [ ] 오프라인 캐싱
  - [ ] 홈 화면 추가 프롬프트
- [ ] (선택) Capacitor / React Native 검토

---

## 🎨 UI/UX 완성도

| 요소 | 상태 | 완성도 |
|------|------|--------|
| Neo-Cinematic 컬러 | ✅ 적용 | 100% |
| Film Grain Effect | ✅ 적용 | 90% |
| Film Border (Sprocket) | ✅ 적용 | 100% |
| Light Leak Effect | ✅ 적용 | 90% |
| 3D Card Tilt | ✅ 적용 | 100% |
| 영화 포스터 스타일 카드 | ✅ 적용 | 95% |
| Display 폰트 (고운 바탕) | ✅ 적용 | 100% |
| Bottom Navigation | ✅ 구현 | 95% |

---

## 📊 전체 진행률

| 영역 | 완성도 |
|------|--------|
| Core 기능 | 95% |
| UI/UX | 90% |
| 백엔드 로직 | 85% |
| 소셜 기능 | 75% |
| 추가 기능 | 50% |

---

## 🔗 관련 문서

- [01_프로젝트_기획서](./01_EPOCH_FILM_프로젝트_기획서_2026-02-02.md)
- [02_기능_명세서](./02_Functional_Specifications.md)
- [03_데이터베이스_스키마](./03_Database_Schema.md)
- [08_구현_리뷰](./08_Implementation_Review_2026-02-04.md)
- [09_실시간_데이터_통합](./09_Live_Data_Integration_Summary.md)
- [10_향후_개선사항](./10_Future_Enhancements.md)

---

> "Every frame counts. Every moment matters."
> — EPOCH FILM
