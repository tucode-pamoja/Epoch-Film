# EPOCH FILM: Project Bible & Source of Truth
> This document is a consolidated reference for AI analysis (NotebookLM). It contains the project's philosophy, architecture, logic, design direction, and future plans.

---

## 1. Project Overview & Philosophy (The Vision)

**Project Name:** EPOCH FILM (에포크 필름)
**Slogan:** "Capture your epoch, Develop your dream."

### Core Values
- **Romanticism (낭만)**: Treating life events as cinematic scenes.
- **Achievement (성취)**: Visualizing progress towards dreams.
- **Archive (기록)**: Preserving memories with metadata (location, time) like a film roll.

### Brand Concept
- **Film Context**: A bucket list item is a 'Frame'. A year is a 'Sequence'. Life is an 'Epoch'.
- **Visual Mood**: Darkroom aesthetic, film grain, neo-cinematic warm tones, gold/amber highlights.

---

## 2. Architecture Blueprint (The System)

**Tech Stack:**
- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS (Cinematic Dark Mode)
- **AI**: Google Gemini / Groq for Roadmap Generation

### Core Workflow
1.  **Drafting**: User creates a "Bucket" (Script).
2.  **Shooting**: User adds "Memories" (Frames) with photos/videos.
    - *Technical*: Images are processed (HEIC -> WebP), EXIF data extracted (Location/Time), and stored in Supabase.
3.  **Screening**: Users view each other's buckets and interact via "Tickets" (Likes) and "Comments".
4.  **Premiere**: Completed buckets become part of the "Hall of Fame".

---

## 3. Core Business Logic (The Rules)

### Data Models
- **Profile**: User stats (XP, Level, Streak).
- **Bucket**: The main goal unit. Has statuses: `DRAFT`, `ACTIVE`, `ACHIEVED`.
- **Memory**: Individual updates within a bucket. Contains media URL and metadata.
- **Quest**: Gamification elements (Daily/Weekly tasks).

### Gamification (The Economy)
- **Tickets (Interaction Currency)**:
    - Users get 5 daily tickets.
    - Issuing a ticket to someone else: Issuer gets +5 XP, Receiver gets +20 XP.
- **Experience (XP)**:
    - Gained by adding memories, completing buckets, and social interaction.
    - Level = `Math.floor(totalXp / 500) + 1`.

### AI Director
- Generates a step-by-step roadmap for any bucket list item.
- Suggests local activities, travel tips, and preparatory steps.

---

## 4. Design Direction: "Neo-Cinematic" (The Look)

**Critique of Old Design**: Generic dark mode, cold colors (#000000), lack of texture.
**New Direction**:
- **Warmth**: Use of warm blacks (#0D0B0A), deep browns, and gold (#C9A227).
- **Texture**: Film grain overlays, light leaks, vignette.
- **Typography**: Playfair Display (Headlines) + DM Sans (Body) + JetBrains Mono (Data).
- **Metaphor**: UI elements resembling film strips, sprockets, and projector lenses.

---

## 5. Future Enhancements (The Roadmap)

### Short-term
- **Social**: Comments system, Deep links for sharing.
- **UI**: Infinite scroll, Optimistic UI updates.

### Long-term
- **Video Memories**: Short-form video support (Reels).
- **Collaboration**: "Join Project" (Multi-user buckets).
- **Mobile Native**: Potential React Native / Capacitor migration.
- **Season System**: Monthly/Yearly "Awards" (Hall of Fame).

---

## 6. Current Implementation Status (Checklist)

- [x] **Project Structure**: Next.js App Router, Supabase setup.
- [x] **Database**: Schemas for Users, Buckets, Memories, Tickets.
- [x] **Auth**: Supabase Auth (Google/Kakao).
- [x] **Core Features**: Create Bucket, Add Memory (Image Upload), Toggle Pin.
- [x] **Image Pipeline**: HEIC support, Resizing, Metadata extraction.
- [x] **UI Foundation**: StarField background, Cinematic Timeline.
- [ ] **AI Roadmap**: Backend connected, frontend integration pending.
- [ ] **Comments**: Schema exists, UI pending.
