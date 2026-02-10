# 🎬 EPOCH FILM (에포크 필름)
> **"Capture your epoch, Develop your dream."**

EPOCH FILM은 당신의 인생 목표(버킷 리스트)를 영화 제작 공정처럼 관리하고 기록하는 **시네마틱 아카이빙 플랫폼**입니다. 단순한 리스트를 넘어, 당신의 삶을 하나의 위대한 에포크(Epoch)로 기록하세요.

---

## ✨ 핵심 컨셉 (Core Concepts)

- **Script to Scene**: 꿈을 시나리오(Bucket)로 작성하고, 실천의 순간을 필름 조각(Memory)으로 남깁니다.
- **AI Director**: AI가 당신의 목표를 위한 정교한 촬영 로드맵(단계별 계획)을 제안합니다.
- **Director Network**: 다른 감독들의 필름 구성을 리메이크하거나, 함께 제작하도록 초대(Casting)할 수 있습니다.
- **Production Aesthetic**: 현상소(Darkroom) 감성의 UI, 35mm 필름 타임라인, 별이 쏟아지는 배경 등 압도적인 시각적 경험을 제공합니다.

## 🛠 기술 스택 (Tech Stack)

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Real-time, Auth, Storage)
- **AI**: Groq (Llama-3), Google Gemini (Roadmap Generation)
- **Processing**: Sharp (Image Optimization), heic-convert (iOS Photos Support)

## 🎞 핵심 기능 (Features)

- **시네마틱 아카이빙**: 고화질 이미지 처리 및 EXIF(위치/시간) 기반 자동 기록.
- **제작 루틴**: 매일, 매주 반복되는 창작 활동을 정기 상영(Routine)으로 관리.
- **감독 네트워크**: 팔로우/팔로워 시스템을 통한 감독 간 영감 공유 및 캐스팅 콜.
- **게이미피케이션**: 챌린지 퀘스트, 관객 티켓(응원), 레벨업 시스템.
- **홀 오브 페임**: 가장 많은 관객을 동원한 올해의 명작 버킷 리스트 전시.

## 🚀 시작하기 (Getting Started)

1. **환경 변수 설정**: `.env.local` 파일에 다음 항목을 설정합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY` or `GEMINI_API_KEY`

2. **의존성 설치**:
   ```bash
   npm install
   ```

3. **개발 서버 실행**:
   ```bash
   npm run dev
   ```

---

## 🏛 프로젝트 바이블 (Project Bible)

프로젝트의 철학, 비즈니스 로직, 상세 설계 사양은 [Epoch_Film_Bible_for_NotebookLM.md](./Epoch_Film_Bible_for_NotebookLM.md)에서 확인하실 수 있습니다. 이 파일은 AI 에이전트와 노트북LM의 일관된 협업을 위한 **Source of Truth** 역할을 합니다.

---
*Developed with Passion & Cinematic Vision.*
