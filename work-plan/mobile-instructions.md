# 📜 Epoch-Film Mobile Implementation Instructions

이 문서는 에포크 필름의 모바일 제국 확장을 위해 각 에이전트가 준수해야 할 **특수 지침(Prompts)** 및 **디자인 가이드라인**을 집대성한 기록입니다. 모든 에이전트는 작업 착수 전 이 문서를 숙지해야 합니다.

---

## 🏛️ 1. 에이전트별 특수 지침 (Special Prompts)

### 🎨 비주얼 마스터 (Visual Master)
- **미션**: 웹의 시네마틱 감성을 모바일에서 1%의 손실 없이 구현하라.
- **핵심 작업**:
    - **NativeWind 테마**: `tailwind.config.ts`에 시네마틱 디자인 토큰 정의.
    - **모바일 애니메이션**: `Moti` & `Reanimated`를 활용한 부드러운 트랜지션 설계.
    - **시네마틱 제스처**: 스와이프 및 햅틱 피드백을 활용한 인터랙션 가이드 제작.

### 💻 프론트엔드 장인 (Frontend Master)
- **미션**: 웹 태그를 네이티브 컴포넌트로 완벽히 이식하여 Seamless UI를 완성하라.
- **핵심 작업**:
    - **Expo Router**: 웹의 App Router 구조를 모바일 스택으로 변환.
    - **네이티브화**: `div/span/img` 등 웹 요소를 `View/Text/Image/BlurView`로 교체.
    - **반응형**: 모든 모바일 해상도에서 시네마틱 비율 유지.

### 🛠️ 백엔드 마법사 (Backend Wizard)
- **미션**: 모바일에서도 데이터의 성벽이 견고하게 작동하도록 API 및 보안을 설계하라.
- **핵심 작업**:
    - **Architecture**: 비즈니스 로직을 `src/services`로 이전하여 웹(Actions)과 모바일(API)이 공용하도록 하라.
    - **Push Notifications**: Supabase Database Webhook을 설정하여 `bucket_casts/quests` 변화 시 `send-push` 함수를 호출하라.
    - **Security**: 모바일 환경 변수 설정 시 반드시 `EXPO_PUBLIC_` 접두사를 사용하라.

### 🔍 기술 감사관 (Technical Inspector)
- **미션**: 모바일 특유의 성능 저하와 오프라인 예외 상황을 철저히 감시하라.
- **핵심 작업**:
    - **성능 최적화**: 복합 오버레이(Canvas/Blur) 사용 시 저사양 기기 프레임 드랍을 방지하라.
    - **데이터 정합성**: 오프라인 상태에서 작성된 기록이 유실되지 않도록 로컬 저장 및 동기화 로직을 검증하라.
    - **이미지 정밀도**: 모바일 클라이언트 측의 EXIF 자동 추출 로직이 누락되지 않았는지 점검하라.

---

## 🎨 2. 모바일 디자인 & 인터랙션 가이드

### 📍 NativeWind 디자인 토큰 (Palette)
- **Primary**: `gold-film: #C9A227`, `gold-warm: #E8D5A3`
- **Background**: `void: #0A0908`, `darkroom: #141210` (Elevation용)
- **Typography**: `display: Gowun Batang`, `body: Pretendard`, `mono: JetBrains Mono`

### 🎞️ 애니메이션 & 트랜지션
- **Optical Flash**: 화면 전환 시 불투명도와 대비를 순간적으로 조절하여 시네마틱한 전환 연출.
- **Spring Physics**: HUD 요소 등장 시 `withSpring`을 통한 생동감 있는 인터랙션.
- **Dynamic Blur**: `BlurView`를 활용한 레이어 깊이감 표현.

### 🖐️ 시네마틱 제스처 & 햅틱 (Haptics)
| 제스처 | 동작 | 햅틱 피드백 |
| :--- | :--- | :--- |
| **Horizontal Swipe** | 타임라인 이동 | 필름 릴 소생 (Selection Haptic 반복) |
| **Long Press** | EXIF/HUD 노출 | 정보 인쇄 (Impact Medium) |
| **Pull to Develop** | 새로고침 | 암실 인화 연출 (Success Haptic) |
| **Double Tap** | 티켓 발행 | 기계식 스탬프 (Impact Heavy) |

---

*Last updated: 2026-02-19 (Grand Chancellor's Decree)*
