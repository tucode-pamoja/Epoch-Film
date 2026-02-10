# EPOCH FILM: Project Bible & Source of Truth (Version 2.0)
> This document is the definitive consolidated reference for AI analysis (NotebookLM). It defines the project's philosophy, architecture, business logic, design direction, and the living development roadmap.

---

## 1. Project Philosophy & Vision (The "Cinematic" Core)

**Project Name:** EPOCH FILM (에포크 필름)
**Slogan:** "Capture your epoch, Develop your dream."

### 1.1 Core Values
- **Romanticism (낭만)**: Treating mundane life goals as significant "Cinematic Scenes." Every achievement is a shot in a lifetime movie.
- **Archiving (기록)**: Preserving memories with cinematic metadata (Date, Location, Technique) rather than just flat data.
- **Connection (연결)**: Interaction between users is defined as "Collaboration between Directors" or "Audience appreciation."

### 1.2 The Cinematic Metaphors
- **Bucket List Item** = **Script / Production**: A planned project.
- **Individual Memory** = **Frame / Scene**: A captured moment within a production.
- **Yearly Goals** = **Sequences**: A series of related scenes.
- **Lifetime** = **Epoch**: The grand collection of all sequences.
- **Followers** = **Audience/Fans**: People watching your filmography.

---

## 2. Architecture & Technical Stack

**Framework:** Next.js 14+ (App Router)
**Database & Auth:** Supabase (PostgreSQL, Auth, Storage)
**Styling:** Tailwind CSS + Framer Motion (Cinematic Animations)
**AI Engine:** Multi-provider (Primary: Groq Llama-3, Backup: Gemini-2.0 Flash)

### 2.1 Technical Pillars
- **Cinematic Image Pipeline**: Automatic conversion (HEIC/HEIF -> WebP), resizing, and EXIF metadata extraction (GPS/Time).
- **Server Action Architecture**: 100% of business logic resides in `src/app/archive/actions.ts` for unified state management and revalidation.
- **Smart Revalidation**: Using Next.js `revalidatePath` to ensure instant consistency across Feed, Archive, and Profile.

---

## 3. Business Logic & Systems (The Rules)

### 3.1 Director Network (Social)
- **Following**: Users "Subscribe" to other directors' filmographies.
- **Mutuals**: Directors who follow each other are "Mutual Collaborators."
- **Casting (Invites)**: Owners can invite other directors to join their production (Casting Call).

### 3.2 Interaction Economy (Tickets & Comments)
- **Tickets**: Appreciative currency (like 'Likes'). Issuing a ticket rewards both the issuer (+5 XP) and the receiver (+20 XP).
- **Comments**: Scene-specific feedback. Rewards both parties with XP.
- **Notifications**: Real-time updates for new followers, tickets, comments, and casting calls.

### 3.3 Production Routines
- **Recurring Buckets**: Projects can be set as DAILY, WEEKLY, or MONTHLY.
- **Production Schedule**: For weekly routines, directors specify the exact production days (e.g., Mon, Wed, Fri).

### 3.4 Gamification (The Director's Level)
- **XP (Experience Points)**: Gained via creating buckets, adding memories, interacting, and completing quests.
- **Level Formula**: `Math.floor(totalXp / 500) + 1`. Next Level targets multiples of 500 XP.
- **Quests**: Daily, Weekly, Monthly, and Special missions that guide users to be better "Directors."

---

## 4. Design Language: "Neo-Cinematic"

### 4.1 Visual Mood
- **Base**: `Void` (#0A0908) & `Darkroom` (#141210).
- **Accents**: `Gold Film` (#C9A227), `Cyan Film` (#4ECDC4).
- **Texture**: Dynamic grain overlays, star-field backgrounds, light-leak gradients.
- **Typography**: Display fonts for titles (cinematic feel), Monospaced fonts for technical data (technical mono).

### 4.2 Key Interactions
- **Focus Pulling**: Subtle blur-to-clear transitions during navigation.
- **Flash Bulb**: Bright white flash animation on successful captures.
- **Sprocket View**: Progress bars and cards resembling 35mm film strips.

---

## 5. Consolidated Changes & Evolutions (V1 -> V2)

| Feature | Change Description |
| :--- | :--- |
| **Navigation** | Shifted from hardcoded links to **Context-aware routing** (`router.back()`) to preserve user exploration state. |
| **Routines** | Added support for **recurring production cycles** (Daily/Weekly/Monthly) with specific day scheduling. |
| **Social** | Transitioned from a simple feed to a **Director Network** with Follow/Follower and Mutual support. |
| **Collaboration** | Implemented **Casting Calls (invites)** to allow multiple users to collaborate on a single bucket. |
| **Gamification** | Rebuilt the **Quest System** with schema-validated daily/weekly/special types. |
| **Production Scraps** | Implemented secure **Film Scrapping (Deletion)** with ownership verification and lineage badges for remakes. |
| **AI Roadmap** | Multi-provider integration (Groq/Gemini) for high-speed planning and fallback. |

---

## 6. Living Roadmap

### 6.1 Short-term (The Shooting Phase)
- [ ] **Collaborative Editing**: Full multi-user memory additions for casted members.
- [ ] **Activity Feed (Timeline)**: A unified global timeline of all followed directors' actions.
- [ ] **Enhanced Roadmap**: AI-generated cost calculation and local place recommendations.

### 6.2 Long-term (The Premiere)
- [ ] **Season Awards**: Monthly "Film Festivals" (Hall of Fame winners).
- [ ] **Premium Reels**: Support for short-form cinematic video memories.
- [ ] **Director Portfolios**: Public profile URLs for sharing filmographies externally.

---
*Created by Antigravity (Advanced Agentic AI) for the High Imperial Chancellor.*
