# 04. API 설계 (API Design)

## 1. 개요

Next.js의 Route Handlers 또는 Supabase Edge Functions를 통해 구현할 API의 명세이다.
모든 API 요청은 인증된 사용자(Bearer Token)에 한해 처리된다.

## 2. Endpoints

### 2.1 Buckets

|  Method  | Endpoint           | Description                        | Request Body                                   |
| :------: | :----------------- | :--------------------------------- | :--------------------------------------------- |
|  `GET`   | `/api/buckets`     | 버킷리스트 전체 조회 (필터링 가능) | `?status=ACTIVE&category=TRAVEL`               |
|  `POST`  | `/api/buckets`     | 새 버킷 생성                       | `{ title, description, category, importance }` |
|  `GET`   | `/api/buckets/:id` | 특정 버킷 상세 조회                | -                                              |
| `PATCH`  | `/api/buckets/:id` | 버킷 수정 (내용, 상태 등)          | `{ status: "ACHIEVED", is_pinned: true }`      |
| `DELETE` | `/api/buckets/:id` | 버킷 삭제                          | -                                              |

### 2.2 Memories (Log)

| Method | Endpoint                    | Description            | Request Body                                  |
| :----: | :-------------------------- | :--------------------- | :-------------------------------------------- |
| `POST` | `/api/memories`             | 체크인 샷(기록) 업로드 | `{ bucket_id, media_url, caption, lat, lng }` |
| `GET`  | `/api/memories`             | 전체 기록(갤러리) 조회 | `?year=2026`                                  |
| `GET`  | `/api/buckets/:id/memories` | 특정 버킷의 기록 목록  | -                                             |

### 2.3 Letters

| Method | Endpoint       | Description        | Request Body             |
| :----: | :------------- | :----------------- | :----------------------- |
| `POST` | `/api/letters` | 타임캡슐 편지 작성 | `{ content, open_date }` |
| `GET`  | `/api/letters` | 내 편지함 조회     | -                        |

### 2.4 User & Profile

| Method  | Endpoint  | Description         | Request Body         |
| :-----: | :-------- | :------------------ | :------------------- |
|  `GET`  | `/api/me` | 내 프로필 정보 조회 | -                    |
| `PATCH` | `/api/me` | 프로필 업데이트     | `{ nickname, mbti }` |

## 3. Error Handling

- **400 Bad Request:** 필수 파라미터 누락 또는 유효성 검사 실패
- **401 Unauthorized:** 인증 토큰 없음 또는 만료
- **403 Forbidden:** 타인의 리소스 접근
- **404 Not Found:** 존재하지 않는 리소스
- **500 Internal Server Error:** 서버 내부 오류
