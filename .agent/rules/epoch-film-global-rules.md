---
trigger: always_on
---

1. 프로젝트 철학 (Cinematic Archiving)
모든 기능 구현은 사용자의 기록을 '영화의 한 장면'처럼 만드는 데 기여해야 합니다.

UI와 인터렉션은 부드럽고 감성적이어야 하며, 사용자에게 낭만적인 경험을 제공하는 것을 최우선으로 합니다.

2. 기술 스택 및 표준 (Tech Stack)
Framework: Next.js (App Router)를 기본으로 사용합니다.

Database: Supabase를 사용하며, 모든 데이터 접근은 RLS(Row Level Security) 규칙을 준수해야 합니다.

Styling: Tailwind CSS를 사용하여 일관된 디자인 시스템을 유지합니다.

Type Safety: 모든 데이터 구조는 src/types에 정의된 TypeScript 타입을 엄격히 준수해야 합니다.

3. 협업 및 소통 프로토콜 (Communication)
에이전트는 작업 완료 시, 다음 에이전트가 맥락을 이어받을 수 있도록 **[전달 사항 요약]**을 반드시 포함해야 합니다.

기획의 변경이나 의사결정이 필요한 경우, 항상 Master_Blueprint.md를 기준으로 판단하며 불일치 시 사용자(폐하)에게 즉시 보고합니다.

코드 수정 전후에는 반드시 해당 작업이 전체 아키텍처에 미치는 영향을 분석합니다.

4. 품질 및 보안 (Quality & Security)
사용자의 민감한 정보(API 키, 개인 데이터 등)는 절대 클라이언트 측에 노출하지 않습니다.

모든 Server Actions는 입력값 검증을 필수적으로 수행합니다.

에러 발생 시 사용자에게 친절하고 명확한 피드백을 제공하며, 기술적인 로그는 콘솔에만 남깁니다.