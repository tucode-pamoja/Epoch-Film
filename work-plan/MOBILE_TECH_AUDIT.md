# 🔍 기술 감사 보고서: 모바일 성능 및 오프라인 전략

## 1. 성능 측정 설계 (Performance Measurement Design)

저사양 기기에서 시네마틱 효과(StarField, BlurView)의 부드러움을 보장하기 위해 다음과 같은 측정 지표를 도입합니다.

### 🧪 FPS(Frames Per Second) 감시
- **목표**: 60 FPS 유지 (최소 30 FPS 방어)
- **도구**: `react-native-performance` 및 `FlashMessage`를 통한 런타임 경고 시스템.
- **측정 시나리오**: 
  1. `StarField` 애니메이션 활성 상태에서의 타임라인 스와이프.
  2. 고해상도 이미지 업로드 및 `BlurView` 모달 노출 시.

### 📉 최적화 기폭제 (Optimization Tiers)
기기의 성능에 따라 시각 효과를 동적으로 조절합니다.
- **Tier 1 (High)**: 모든 스타 필드 파티클(100+) 및 실시간 Gaussian Blur 활성화.
- **Tier 2 (Mid)**: 파티클 수 감소(30), 정적 블러 이미지 오버레이 사용.
- **Tier 3 (Low)**: 애니메이션 정지, 단색 배경 및 투명도 조절로 대체.

## 2. 오프라인 캐싱 전략 (Offline & Sync Strategy)

네트워크 불안정 시에도 사용자의 기록 유실을 방지하기 위한 아키텍처입니다.

### 📦 아키텍처: React Query + `@react-native-async-storage/async-storage`
1. **낙관적 업데이트 (Optimistic Updates)**: 
   - 기록 작성 시 로컬 캐시(React Query)에 즉시 반영.
   - 서버 응답 전까지 'Developing...' (현상 중) 상태 표시.
2. **영속성 캐시 (Persistence)**:
   - `persistQueryClient`를 사용하여 앱 종료 시에도 캐시 유지.
3. **재시도 메커니즘 (Retry & Queue)**:
   - 네트워크 연결 회복 시(NetInfo 연동) 실패한 요청 자동 재전송.
   - 실패 횟수가 임계치를 넘으면 'Draft' 폴더로 이관하여 수동 업로드 지원.

## 3. 검증 항목 (Checklist)
- [ ] `BlurView` 중첩 시 GPU 사용량 급증 여부 확인.
- [ ] 오프라인 상태에서 작성된 `Memory`가 재연결 시 EXIF 데이터 포함하여 정상 업로드되는지 확인.
- [ ] 저사양 기기(Android Go 등)에서의 초기 로딩 시간(TTI) 3초 이내 달성 여부.

---
*Last updated: 2026-02-22 (Technical Inspector)*
