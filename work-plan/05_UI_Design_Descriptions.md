# 05. UI/UX 디자인 가이드 (UI/UX Design Descriptions)

> **Note:** 이미지 생성 서비스의 일시적인 문제로 인해 텍스트 기반의 상세 묘사로 디자인 시안을 대체합니다.

## 1. 디자인 키워드

- **Mood:** Cinematic, Nostalgic, Premium, Dark Mode
- **Colors:**
  - Background: `#1A1A1A` (Deep Dark Gray)
  - Primary: `#191970` (Midnight Blue - 깊은 밤하늘)
  - Accent: `#FFD700` (Gold - 별, 조명, 영광)
  - Text: `#F5F5F5` (Off-White - 스크린 자막)
- **Motifs:** Film Stock, LP Records, Cinema Tickets, Darkroom

## 2. 주요 화면 구성

### 2.1 홈 (Main Dashboard)

- **Hero Section:**
  - 상단에 현재 '올해의 시퀀스' 진행률이 영화 필름 릴(Reel)이 감기는 애니메이션으로 표현됨.
  - "Scene 2026: 34% Captured"와 같은 문구 표시.
- **Selected Sequence:**
  - 가로 스크롤 가능한 카드 UI. 각 카드는 영화 티켓 모양.
  - 미완료 버킷은 흑백/흐림 처리, 완료 시 컬러 활성화.

### 2.2 저장소 (The Archive)

- **Layout:**
  - 세로 리형태, 각 아이템은 필름 스트립의 한 컷처럼 디자인.
  - 좌측에는 타임스탬프(작성일) 또는 중요도 별점이 배치.
  - 우측에는 버킷 제목과 상태 뱃지 위치.
- **Interaction:**
  - 리스트 항목을 길게 누르면 드래그 앤 드롭으로 순서 변경 가능.
  - 오른쪽으로 스와이프하면 '완료(Check-in)' 모드로 진입.

### 2.3 체크인 샷 (Check-in Shot)

- **Upload View:**
  - 화면 중앙에 4:3 비율의 뷰파인더 프레임.
  - 사진 업로드 시 실제 필름 현상되듯 서서히 이미지가 나타나는 효과(Fade-in).
- **Metadata Input:**
  - 하단에 'Location', 'Date', 'Caption' 입력 필드가 미니멀하게 배치.
  - 'Digital LP' 아이콘을 눌러 배경음악 선택 가능.

### 2.4 마이 페이지 (Profile)

- **Design:**
  - 프로필 사진은 원형이 아닌 LP판 모양으로 회전.
  - 하단에 'Hall of Fame' 섹션이 있어 획득한 배지들이 포스터처럼 그리드로 나열됨.
