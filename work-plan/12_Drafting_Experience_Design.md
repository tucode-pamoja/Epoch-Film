# 12. Drafting Experience Design: The Screenplay & The Slate

> Based on NotebookLM insights, this document defines the UX/UI for the Bucket Creation (Drafting) process. The goal is to make the user feel like a Director writing a movie script.

## 1. Concept: "The Screenplay" (Input Experience)

**Core Metaphor**: The user is writing a script, not filling a form.

### Visual Style
- **Background**: Dark, slightly textured paper (or standard app background with focused overlay).
- **Typography**: `JetBrains Mono` for inputs (Typewriter aesthetic).
- **Caret**: Blinking Gold (`#C9A227_film`) cursor.
- **Borders**: Minimal or no borders. Underlines appear on focus.

### Copywriting Mapping
| Standard Label | Cinematic Label | Placeholder |
| :--- | :--- | :--- |
| **Title** | **SCENE HEADING** | "EXT. PARIS - MIDNIGHT" (Contextual examples) |
| **Description** | **ACTION LINES** | "The protagonist (you) experiences..." |
| **Target Date** | **SHOOTING SCHEDULE** | "YYYY-MM-DD" |
| **Category** | **GENRE** | Travel → Road Movie, Skill → Training Montage |

### Micro-interactions
- **Typewriter Echo**: Subtle text shadow or slight layout shift when typing (optional sound).
- **Auto-Format**: Pressing Enter on Title automatically moves focus to Description with a fade-in effect.

---

## 2. Concept: "The Viewfinder" (Selection Experience)

**Core Metaphor**: Adjusting camera settings (Lens, Focus).

### Category Selection (Genre)
- **UI**: Instead of a dropdown, use a horizontal scroll or a radial dial (Zoom Ring style).
- **Feedback**: Haptic tick (if mobile) or mechanical click sound on change.

### Importance (Focus Depth)
- **UI**: A slider resembling a focus ring.
- **Effect**: As importance increases (High Priority), the background `StarField` or preview image becomes deeper/sharper. Low priority = Bokeh effect.

---

## 3. Concept: "The Slate Clap" (Submission Experience)

**Core Metaphor**: Signaling the start of filming.

### Actions
- **Create Button**: **"ACTION!"** (Icon: Clapperboard)
    - **Animation**: On click, a clapperboard top bar descends. The screen momentarily fades to black (Cut) and then resolves to the new bucket (Develop).
- **Cancel Button**: **"CUT"**
- **AI Option**: **"HIRE AD"** (Assistant Director) - "Generate Roadmap"

---

## 4. Implementation Plan

### Phase 1: Visuals (Visual Master)
- Define `font-mono` class usage for inputs.
- Create SVG assets for the Clapperboard icon and "Focus Ring" slider.
- Define CSS animations for the "Slate Clap".

### Phase 2: Logic (Frontend Master)
- Refactor `CreateBucketModal` (or equivalent) to use these new labels and styles.
- Implement the "Focus Pulling" effect using CSS filters (`blur()`) linked to state.
- Map Categories to Genres in the UI layer.

### Phase 3: Backend (Backend Wizard)
- Ensure API accepts standard data but Frontend displays "Cinematic" labels.
- No schema changes required immediately, just mapping.
