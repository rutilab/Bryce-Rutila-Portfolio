# TASK.md

## Case Study: Focus Coach Achievements

**Page:** `/case-studies/focus-coach-achievements` · **Branch:** `main`  
**Docs:** `focus-coach-case-study-copy.md` (copy 1:1) · `focus-coach-achievements-context.md` (agent context)

### Completed (through 2026-07-30)
- [x] Case study page built and linked from homepage / case-studies index
- [x] Copy synced with live page (`focus-coach-case-study-copy.md`)
- [x] Student Signal survey chart (Yes / Maybe / No, n = 89)
- [x] Content Ideas Slack-spec carousel (`ImageViewer` + lightbox)
- [x] End of Session Logic diagram (4 scenarios, colored nodes, `(i)` tip tooltips)
- [x] Live animated screens: Milestone, Focus Streak, Personal Best, Completion Week Tracker / Quote
- [x] Mobile dark-mode mockups (reflection, 3 achievements, 2 completion)
- [x] Mobile light-mode mockups + per-container sun/moon toggle (`ThemedVisualCard`)
- [x] Transparent knockout for LM (and prior DM streak) phone canvases
- [x] Team Presentation section removed (asset retained unused)
- [x] Outcomes: launch status, signal cards, early −22% reflection result
- [x] Closing CTA → interactive prototype modal

### Remaining / polish (optional)
- [ ] Commit Focus Coach changes on a feature branch (currently uncommitted on `main`)
- [ ] Sync Figma Bryce Active frame to latest page copy if still divergent
- [ ] Decide whether to delete unused `team-meeting-huddle.png`
- [ ] Ensure `chrome/` (Chrome for Testing) stays out of git commits

---

## Case Study: Finding Focus AI Assistant

### Design Implementation (from Figma)
- [ ] Refine Context section to match Figma design
- [ ] Refine Problem section to match Figma design
- [ ] Refine Challenge/Objectives section to match Figma design
- [ ] Refine Research Phase section to match Figma design
- [ ] Refine Design Phase section to match Figma design
- [ ] Download and organize all case study images to `/public/images/case-studies/`
- [ ] Replace Figma asset URLs with local image paths

### Content
- [ ] Add actual case study images (screenshots, GIFs, videos)
- [ ] Review and finalize copy for all sections
- [ ] Add Case Study #2 (placeholder currently) — *partially superseded by Focus Coach Achievements*
- [ ] Add Case Study #3 (placeholder currently)

---

## Chat Integration
- [ ] Test chat functionality with various user queries
- [ ] Refine system prompt for Bryce's personality
- [ ] Add knowledge base content for better responses
- [ ] Handle edge cases and error states

---

## Design System
- [ ] Document reusable components
- [ ] Ensure consistent spacing/typography across pages
- [ ] Mobile responsiveness audit
- [ ] Accessibility audit (contrast, focus states, etc.)

---

## Pages
- [ ] Review and refine Home page
- [ ] Review and refine About page
- [ ] Review and refine Case Studies listing page

---

## Infrastructure
- [ ] Set up proper image optimization
- [ ] Configure deployment (Vercel or other)
- [ ] Set up environment variables for production

---

## Completed Work

### 2026-07-30 — Focus Coach Achievements
- [x] Light-mode mobile assets (`mobile-lm-*.png`) + dark/light sun/moon toggles on three containers
- [x] Toggle UI: filled soft-blue pill, hover state, corner inset so radius doesn’t clip
- [x] Agent/context markdown updated (`focus-coach-achievements-context.md`, copy doc, this file)

### 2026-01-27
- [x] Updated Header section to match Figma design (1200px max-width, 120px padding, gradient background)
- [x] Updated Role and Overview section to match Figma design (flex layout, 64px gap, 80px padding)
- [x] Updated Highlights section to match Figma design (radial gradient, 40px gap, proper icon)
- [x] Set up image folder structure (`/public/images/case-studies/`)
- [x] Copied highlights icon to local images
- [x] Standardized page layout (max-width 1200px, 80px horizontal padding = 1040px content)
- [x] Created ImageCard component with proper gradient and caption styling
- [x] LLM chat integration with OpenAI API (completed in previous session)
- [x] Created PLANNING.md and TASK.md for project documentation
