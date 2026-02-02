# 03. 데이터베이스 스키마 정의 (Database Schema)

## 1. 개요

본 문서는 EPOCH FILM 서비스를 위한 PostgreSQL 기반의 데이터베이스 스키마를 정의한다.
Supabase를 백엔드 서비스로 사용함을 가정한다.

## 2. ERD 개괄

- **Users**: 사용자 정보
- **Buckets**: 버킷리스트 아이템
- **Memories**: 버킷 달성 기록 (체크인 샷)
- **Achievements**: 배지 및 업적
- **Letters**: 미래로 보내는 편지

## 3. 테이블 상세 정의

### 3.1 users (사용자)

가입한 사용자 정보를 저장한다.

- `id`: UUID (PK, Supabase Auth.uid()와 연동)
- `email`: VARCHAR(255) (Unique)
- `nickname`: VARCHAR(50)
- `profile_image_url`: TEXT
- `provider`: VARCHAR(20) (google, kakao, apple)
- `mbti`: VARCHAR(4) (Optional)
- `created_at`: TIMESTAMP (Default: now())
- `updated_at`: TIMESTAMP

### 3.2 buckets (버킷리스트)

사용자의 버킷리스트 아이템을 저장한다.

- `id`: UUID (PK)
- `user_id`: UUID (FK -> users.id)
- `title`: VARCHAR(255) (Not Null)
- `description`: TEXT
- `category`: VARCHAR(50) (여행, 음식, 성장 등)
- `status`: VARCHAR(20) (DRAFT, ACTIVE, ACHIEVED)
- `is_pinned`: BOOLEAN (올해의 시퀀스 선정 여부, Default: false)
- `target_date`: DATE (목표 달성일)
- `importance`: INTEGER (1~5)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 3.3 memories (기록/추억)

버킷리스트 달성 시 업로드하는 체크인 샷(사진/영상)과 메타데이터.

- `id`: UUID (PK)
- `bucket_id`: UUID (FK -> buckets.id)
- `user_id`: UUID (FK -> users.id)
- `media_type`: VARCHAR(10) (IMAGE, VIDEO)
- `media_url`: TEXT (S3/Storage URL)
- `caption`: TEXT (감상평)
- `location_name`: VARCHAR(100)
- `latitude`: DOUBLE PRECISION
- `longitude`: DOUBLE PRECISION
- `captured_at`: TIMESTAMP (촬영 일시)
- `created_at`: TIMESTAMP

### 3.4 achievements (업적)

사용자가 획득한 배지 정보.

- `id`: UUID (PK)
- `user_id`: UUID (FK -> users.id)
- `badge_type`: VARCHAR(50) (EARLY_BIRD, TRAVELER_10, etc.)
- `acquired_at`: TIMESTAMP
- `metadata`: JSONB (추가 정보)

### 3.5 letters (타임캡슐)

미래의 나에게 보내는 편지.

- `id`: UUID (PK)
- `user_id`: UUID (FK -> users.id)
- `bucket_id`: UUID (FK -> buckets.id, Optional)
- `content`: TEXT
- `open_date`: DATE (공개일)
- `is_opened`: BOOLEAN (Default: false)
- `created_at`: TIMESTAMP

## 4. 인덱스 및 정책 (RLS)

- **RLS (Row Level Security):** 모든 테이블은 `user_id`를 기준으로 본인 데이터만 CRUD 가능하도록 정책 설정.
- **Index:**
  - `buckets(user_id, is_pinned)`: 올해의 시퀀스 조회 최적화
  - `memories(bucket_id)`: 특정 버킷의 추억 조회
