# Focus Coach Achievements — Agent Context

> Working notes for future Cursor sessions. Pair with `focus-coach-case-study-copy.md` (page copy 1:1) and the live page.
>
> **Branch:** `main` (as of 2026-07-30)  
> **Page:** `src/app/case-studies/focus-coach-achievements/page.tsx`  
> **Route:** `/case-studies/focus-coach-achievements`  
> **Assets:** `public/case-studies/focus-coach-achievements/`  
> **Copy doc:** `focus-coach-case-study-copy.md`

---

## What this case study is

Portfolio write-up for Bryce’s Finding Focus work: redesigning the Focus Coach **end-of-session** experience into Reflection → (optional Achievement) → Completion, with ethical “Focus Streaks” instead of loss-aversion streaks.

Accent blue sitewide for Finding Focus: `#006efe` / `#0057c2`. Frosted visual blocks: `rgba(220, 232, 248, 0.45)`.

---

## Session work log (through 2026-07-30)

High-signal changes completed across recent sessions (not exhaustive of every polish pass):

### Copy & narrative
- Page copy synced from / to `focus-coach-case-study-copy.md` (TL;DR, captions, competitive audit, gamification, streaks, realization, flow logic, reflection anatomy, completion, outcomes).
- **Team Presentation section removed** from the page (asset `team-meeting-huddle.png` kept in public, unused).

### Content Ideas
- Slack-spec carousel via local `ImageViewer` (Personal Best → Streaks → Milestone specs).
- Click opens lightbox with prev/next; caption under carousel updates with active slide.

### End of Session Logic diagram
- Four scenarios (including “sessions after the first of the day → quote”).
- Node colors: Reflection `#006efe` · Achievement `#ea580c` · Completion `#0d9488` (match Realization cards).
- Achievement sublabels black.
- Neutral gray `(i)` tips with portal tooltips (`FlowInfoTip` + `useBodyScrollLock`); tip copy is in the copy doc and `FLOW_SCENARIOS` in the page.

### Live achievement / completion screens
- SegmentedMedia tabs for Milestone / Focus Streak / Personal Best and Week Tracker / Course Quote.
- CSS-keyframe animations (Claude Code assisted) for illustrations.

### Mobile dark + light mocks
- Six dark (`mobile-dm-*`) and six light (`mobile-lm-*`) phone screens.
- Three containers after Final Design, each with **independent** light/dark state:
  1. Personal reflection (single image)
  2. Achievements (gallery of 3)
  3. Completion (gallery of 2)
- `ThemedVisualCard` + `ThemeModeToggle` in page.tsx:
  - Toggle **top-right**, inset past 24px radius (`top-5 right-5` / `sm:top-6 sm:right-6`).
  - Filled soft-blue pill (no outline border); hover darkens fill.
  - Moon when light → go dark; sun when dark → go light.
  - Default mode: **dark**.
  - Helper `mobileSrc(name, mode)` builds `/case-studies/focus-coach-achievements/mobile-{lm|dm}-{name}.png?v=…`.
- LM PNGs had opaque black canvas outside the device; flood-fill knockout to transparent RGBA (same class of fix as earlier DM completion-streak black-box). Prefer RGBA exports from Figma going forward.

### Outcomes
- Honest launch-status framing (shipped summer; measure in fall).
- Signal cards + early “reflection −22%” result callout.

---

## Key UI patterns on this page (local to page.tsx unless noted)

| Pattern | Role |
|---|---|
| `VisualCard` | Frosted rounded container + optional caption |
| `ThemedVisualCard` | Same + sun/moon toggle; children render-prop `(mode) => …` |
| `ThemeModeToggle` | Filled accent circle; MUI `LightMode` / `DarkMode` icons |
| `ImageViewer` | Spec carousel + lightbox |
| `SegmentedMedia` | Pill tabs swapping live screens + captions |
| `CaseStudyMedia` / `CaseStudyMediaGallery` | From `@/components/case-study` — zoom lightbox |
| `FlowInfoTip` | `(i)` tip with `createPortal` tooltip |
| `EndOfSessionFlowDiagram` | Scenario rows for flow logic |
| `FlowStepCards` | Realization 1→2→3 cards |

Do **not** put the theme toggle on every VisualCard — only the three mobile mockup containers.

---

## Asset inventory

All under `public/case-studies/focus-coach-achievements/`:

**GIFs / motion:** `focus-coach-check-in.gif`, `old-session-flow.gif`, `active-focus-coach-session.gif`, `milestone-animated-screen.gif`

**Specs (Content Ideas carousel):** `personal-best-spec.png`, `streaks-logic-spec.png`, `milestone-logic-spec.png`

**Early mockups:** `early-milestone-mockup.png`, `early-personal-best-mockup.png`, `early-quote-mockup.png`

**Mobile DM/LM pairs:** see table in `focus-coach-case-study-copy.md`

**Vectors / prototype:** `milestone-mountain.svg`, `personal-best-rocket.svg`, `focus-streak-*.svg/css/html`, `session-complete-prototype.html`, `macbook-bezel.png`

**Unused on page:** `team-meeting-huddle.png` (Team Presentation removed)

---

## Do / don’t for future edits

- Prefer editing **page.tsx first**, then re-sync `focus-coach-case-study-copy.md` so the MD stays a faithful export.
- Keep Finding Focus accent `#006efe`; avoid inventing a second blue for chrome unless matching an existing token.
- Mobile LM/DM swaps: change both files or update `mobileSrc` cache `?v=` when replacing binaries.
- Do not re-add Team Presentation unless the user asks.
- Large `chrome/` Google Chrome for Testing tree in the repo root is unrelated tooling — do not commit unless explicitly requested.
- Uncommitted work often lives on `main`; confirm branch before PRs.

---

## Related case studies

- Finding Focus AI Assistant: `src/app/case-studies/finding-focus-ai-assistant/`
- Finding Focus Landing: `src/app/case-studies/finding-focus-landing-page/`

Shared media helpers: `src/components/case-study/`
