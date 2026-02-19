# 📱 Epoch-Film Mobile Migration Plan (React Native / Expo)

본 문서는 Epoch-Film의 시네마틱 아카이빙 경험을 모바일 네이티브 환경(iOS/Android)으로 확장하기 위한 기술적 이주 계획을 담고 있습니다.

## 🎯 목표 (Objectives)
- **전술적 이점**: React Native (Expo)를 사용하여 기존 웹 로직의 90% 이상을 재사용.
- **가이드라인**: [모바일 전용 에이전트 구현 지침](mobile-instructions.md) 숙지 및 준수.
- **사용자 경험**: 모바일 전용 UI/UX(제스처, 푸시 알림, 고해상도 카메라 연동) 제공.
- **배포**: App Store 및 Google Play Store 정식 등록.

---

## 🛠️ Phase 1: 기반 인프라 구축 (Infrastructure)
- [ ] **Expo 프로젝트 초기화**: `npx create-expo-app@latest`를 통한 기본 골격 생성.
- [ ] **디자인 시스템 이식**: `NativeWind` 설치 및 현재 `globals.css`의 시네마틱 컬러 팔레트/디자인 토큰 이적.
- [ ] **폰트 및 에셋 포팅**: 'Gowun Batang', 'JetBrains Mono' 등 폰트 파일 및 필름 그레인 텍스처 최적화.
- [ ] **네비게이션 설계**: `Expo Router`를 사용하여 현재 웹의 URL 구조와 매칭되는 탭 바(BottomNav) 및 스택 구조 설계.

## 🧙‍♂️ Phase 2: 핵심 로직 및 보안 이식 (Core Logic & Auth)
- [ ] **Supabase Mobile SDK 설정**: `@supabase/supabase-js` 및 보안 저장소(`expo-secure-store`) 연동.
- [ ] **소셜 로그인 연동**: iOS(Apple Login), Android(Google Login) 네이티브 연동 처리.
- [ ] **Server Actions -> Services 전환**: 비즈니스 로직을 `src/services`로 통합하여 웹/모바일 공용화.
- [ ] **타입 공유**: `src/types/index.ts`를 모바일 프로젝트와 공유하거나 동기화 설정.

## 🎨 Phase 3: 시네마틱 UI/UX 전환 (UI Transformation)
- [ ] **필름 레이아웃 변환**: `div`, `span` 등 웹 태그를 `View`, `Text` 네이티브 컴포넌트로 전수 교체.
- [ ] **시네마틱 애니메이션**: Framer Motion을 `Moti` 또는 `React Native Reanimated`로 전환하여 부드러운 트랜지션 구현.
- [ ] **반응형 최적화**: 다양한 모바일 기기 해상도(iPhone 15, Galaxy S24 등)에 대응하는 유연한 레이아웃 적용.
- [ ] **다크/라이트 테마**: 현재 구축된 테마 변수 시스템을 네이티브 외관 모드와 연동.

## ⚙️ Phase 4: 네이티브 기능 고도화 (Native Features)
- [ ] **고급 카메라 연동**: 사진 촬영 및 이미지 업로드 시 모바일 전용 EXIF 처리 모듈 연동.
- [ ] **실시간 푸시 알림 인프라**: Supabase `send-push` Edge Function 배포 및 `bucket_casts/quests` 테이블 Database Webhook 설정.
- [ ] **오프라인 모드 및 동기화**: `expo-sqlite` 등을 활용한 로컬 저장 및 오프라인-온라인 데이터 싱크 로직 구현.
- [ ] **제스처 및 성능 최적화**: 복합 오버레이 성능 최적화 및 필름 넘기기 스와이프 인터랙션 완성.
- [ ] **모바일 EXIF 엔진**: 사진 업로드 시 모바일 클라이언트 측 이미지 메타데이터 자동 추출 로직 보완.

## 🚀 Phase 5: 빌드 및 스토어 제출 (Deployment)
- [ ] **EAS Build 설정**: iOS(`.ipa`) 및 Android(`.aab`) 빌드 파이프라인 구축.
- [ ] **스토어 자산 제작**: 앱 아이콘, 스플래시 스크린(Splash Screen), 스토어 스크린샷 디자인.
- [ ] **베타 테스트**: TestFlight 및 Google Play Console 내부 테스트 공유.
- [ ] **정식 심사 요청**: App Store 및 Play Store 최종 제출.

---

## 📝 특이 사항 (Notes)
- **아키텍처**: 비즈니스 로직은 `src/services`에 위치하며, 웹은 Actions에서, 모바일은 API Route를 통해 호출하는 구조 권장.
- **이미지 최적화**: 모바일 네트워크 환경을 고려하여 업로드 시 클라이언트 측에서 1차 리사이징 수행.
- **보안**: 모바일 SDK 연동 시 `EXPO_PUBLIC_` 접두사를 사용하여 환경 변수 보호 필수.


*Last updated: 2026-02-19 (Grand Chancellor's Decree)*
