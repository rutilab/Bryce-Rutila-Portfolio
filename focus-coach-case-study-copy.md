# Focus Coach Achievements — Case Study Copy

> Faithful 1:1 export of all text on the `/case-studies/focus-coach-achievements` page (`main` branch), in page order. Nothing has been rewritten.
>
> **Last synced:** 2026-07-30 (includes light/dark mobile toggles, Content Ideas carousel, End of Session Logic tips, Team Presentation removed).
>
> Media markers:
> - `[LIVE: …]` — interactive React screen ported from the HTML prototype
> - `[IMAGE: …]` / `[GIF: …]` — static uploaded assets under `public/case-studies/focus-coach-achievements/`
> - `[CHART: …]` — in-page chart component
> - Captions appear in _italics_ beneath their media
>
> Italicized words within headings reflect the emphasis shown on the page (`<Em>`).
>
> For implementation notes, asset inventory, and session decisions, see `focus-coach-achievements-context.md`.

---

## Intro (Hero)

**Eyebrow:** Finding Focus • Edtech • Product Design

# Rebuilding the Focus Coach's End of Session Experience

[LIVE: Milestone achievement hero screen with animated summit illustration]

**Meta row**

- **Team:** Mike Mrazek, Co-founder / Thomas Kennedy, SWE
- **Timeline:** Jan – Jul 2026
- **My Role:** Sole Product Designer

### TL;DR

Students weren't coming back to the Focus Coach — and the end of a session was where we lost them. I redesigned it into a guided flow with a simpler reflection, celebratory achievements, and a brand-new completion screen, built to motivate without manipulative gamification.

**Stats**

- **89** — students surveyed on rewards and motivation
- **3** — achievement types, each with its own animated screen
- **↓ 22%** — less time spent rating focus at the end of a session

---

## Overview

### Context *(eyebrow)*

## The Focus Coach is the flagship tool from Finding Focus, an edtech company building attention training tools for classrooms.

It's a guided study timer that helps students stay on task while doing their work by periodically checking in on them.

[GIF: focus-coach-check-in.gif — What a check-in looks like during a Focus Session]

_What a check-in looks like during a Focus Session_

### The Problem *(eyebrow)*

## Users were not coming back to the Focus Coach.

39.3% of our users were one and done after completing their first session – meaning almost 2 in 5 of our users completed a single Focus Session and then abandoned the tool.

**Stats**

- **39.3%** — of users only ever completed one Focus Session
- **54.6%** — of all sessions were completed by the top 1% of users

### Hypothesis *(eyebrow)*

## The end of session experience was where we lost users.

Every session ended with a brief "session complete" animation, a 1–100 reflection slider, and an MVP-state completion screen built around a check-in graph. We'd assumed students would rack up check-ins, but most sessions only had one or two, which meant the graph had little value.

[GIF: old-session-flow.gif — The original end of session flow, including the focus rating and completion screen]

_This is what the previous end of session flow looked like. If students did not have a check-in the graph provided no value_

### Project Goals *(eyebrow)*

## Before designing anything, I mapped out what the end of session should be _for_.

**Goal cards**

- **01 — Feeling seen**
  The end of a session should acknowledge the effort users put in.
- **02 — Celebrating real progress**
  Sessions should acknowledge real progress users have built up, not empty praise.
- **03 — Quick honest reflection**
  Taking a moment to look back on how a session went shouldn't require a lot of cognitive effort.

**North Star** *(centered statement)*

Turn the end of every session into an opportunity to delight and engage users

---

## Research

### Student Signal *(eyebrow)*

## Students told us rewards would bring them back.

A survey we sent out to students asked: "If you could earn badges or unlock levels by completing more sessions, would that make you want to use the Focus Coach more?" Roughly half said yes and another third said maybe.

[CHART: Survey responses — Would badges or levels make you use Focus Coach more? · n = 89 students]

- **Yes** — 49.4% · n = 44
- **Maybe** — 34.8% · n = 31
- **No** — 15.7% · n = 14

### Competitive Audit *(eyebrow)*

## Strong completions _celebrate_. Ours _reported_.

I audited the end-of-session experiences for six of the biggest mindfulness and timer apps. The best experiences used the end of a session as an opportunity to celebrate the user and promote future engagement. Something ours failed to do.

[IMAGE: Comparison table of Finding Focus versus other apps]

### Gamification Question *(eyebrow)*

## We considered XP, badges, and collectibles.
## We decided _against_ all of them.

Our survey showed that students supported the idea of badges and rewards, and the competitive audit found that similar applications used gamification. But despite that, full gamification wasn't something I recommended: Finding Focus exists to help students genuinely improve their focus, not to collect rewards. The moment a badge becomes the reason a student starts a session, the tool is failing at its actual job.

**Callout — Behavioral Insight**

- **Heading:** One student completed hundreds of one-minute sessions to win a teacher's prize.
- **Body:** This was a clear signal that attaching rewards to usage can lead to users gaming the system.

---

## Design

### Content Ideas *(eyebrow)*

## I started by defining everything the completion page could include.

Without wanting to lean too heavily into gamification, I proposed four kinds of content we could show: cumulative milestones, personal bests, streaks, and course quotes.

My team was in full support so I got to work creating designs and a spec sheet of the full system – trigger logic, thresholds, priority rules, and the copy.

[IMAGE carousel — arrow to cycle]
1. personal-best-spec.png — Screenshot from a Slack canvas documenting Personal Best criteria — trigger logic, thresholds, and copy.
2. streaks-logic-spec.png — Screenshot from a Slack canvas documenting Focus Streak logic — how full weeks are tracked and celebrated.
3. milestone-logic-spec.png — Screenshot from a Slack canvas proposing milestone thresholds and rotating copy options across Sessions, Hours, and Check-ins.

_Caption updates with the active image in the carousel._

### Streaks Behavior *(eyebrow)*

## Traditional streaks employ a dark pattern.

The idea of streaks was something that we as a team had long toyed with. The reason we never implemented streaks was our opinion that they tend to make users return solely for the purpose of not losing their streak. It was a dark pattern that we wanted to avoid, especially since our target demographic is K-12 students.

**Callout — Dark Pattern**

- **Heading:** Streak Maintenance
- **Body:** Streaks can often be manipulative; exploiting psychological biases like loss aversion to coerce users into daily engagement.

## Enter Focus Streaks: a more ethical take on streaks.

My solution to the streaks dilemma was to make it something that users earned rather than maintained. As long as a user completed at least one session each weekday (Monday - Friday) they were able to earn a Focus Streak for that week. Once users earned one there was no risk of losing it, and they could earn as many as they wanted.

[LIVE: Focus Streak week container animation — flame slam, weekday checkmarks, expand copy]

_A custom animation I created that plays when users earn a Focus Streak_

### Early Mockups *(eyebrow)*

## Now that we had Focus Streaks we had to think through how to show the rest of the content.

The original idea was to rotate through different content on the completion screen and show whatever was relevant to the session a user just completed, so the page always had something fresh to show.

[IMAGE gallery: early-milestone-mockup.png · early-personal-best-mockup.png · early-quote-mockup.png]

_Early rotating-content concepts for Milestones, Personal Bests, and Quotes_

- Early Milestone mockup
- Early Personal Best mockup
- Early Quote mockup

### The Realization *(eyebrow)*

## A guided experience is more engaging than a single page full of content.

The idea for a completion page that rotated through different content worked in theory, but once I began creating mockups it became clear that the design wasn't working.

That's when I realized the best experience would be a guided end-of-session flow where each piece of content - if it was triggered - had its own dedicated screen and a purposeful animation.

**Flow step cards**

- **1 — Reflection** · Always Shown
  Confirms the session ended, shows its stats, and asks users to rate their focus.
- **2 — Achievement** · Conditional
  A full-screen celebration when a streak, milestone, or personal best is reached.
- **3 — Completion** · Always Shown
  All-time stats plus either the week tracker or a course quote.

### End of Session Logic *(eyebrow)*

## A few rules decide which screens are shown at the end of a session.

**Flow diagram** — node colors match Realization cards (blue Reflection / orange Achievement / teal Completion). Achievement sublabels are black. Each scenario row has a neutral gray `(i)` tip with portal tooltip:

1. **First session of the day (no achievement)**
   Reflection → Completion (week tracker)
   - **Tip:** The first session of the day will always show a week tracker component on the completion page, unless they earned a streak.
2. **Sessions after the first of the day (no achievement)**
   Reflection → Completion (quote)
   - **Tip:** All subsequent sessions completed in a day will show a quote container on the completion page.
3. **Achievement session (e.g. milestone reached)**
   Reflection → Achievement (milestone) → Completion (week tracker / quote)
   - **Tip:** When users trigger a milestone, there will be a screen dedicated to that milestone that appears in between the reflection and completion screens.
4. **Streak completed session**
   Reflection → Achievement (streak) → Completion (quote)
   - **Tip:** When users earn a streak, the completion page will always show the quote container.

_The flow adapts to each session — the achievement screen only appears when one is earned, which is what makes it a special moment_

### Personal Reflection *(eyebrow)*

## With the flow defined, I started re-designing the personal reflection screen.

The redesign does three jobs: acknowledge the session has ended, provide context on what was accomplished, and allow users to quickly reflect.

**Anatomy cards**

- **1 — Acknowledge**
  A persistent checkmark and "Session Complete" title signal the end of the session.
- **2 — Contextualize**
  Session stats show what was just accomplished: how long the session was and number of check-ins.
- **3 — Reflect**
  One question about their focus, four options, less cognitive load.

[LIVE: Redesigned personal reflection screen]

_The new design showed users more clearly that their session had ended and allowed them to quickly reflect on it._

### Achievement Screens *(eyebrow)*

## Designing three kinds of achievements, each with its own unique animated illustration.

In order to elevate the experience I created three different vector illustrations to distinguish the three different achievements. I was then able to animate the illustrations using CSS Keyframes with the help of Claude Code.

**Segmented tabs**

- **Milestone**
  [LIVE: Milestone achievement screen with animated summit illustration]
  _Milestones — one of three tracks users progress towards: total sessions, total time focused, and total check-ins answered_
- **Focus Streak**
  [LIVE: Focus Streak achievement screen with flaming calendar and week tracker]
  _Focus Streaks — shown when a user completes at least one session each weekday during a week_
- **Personal Best**
  [LIVE: Personal Best achievement screen with rocket illustration]
  _Personal Best — celebrates users beating their longest session record_

### The Completion Screen *(eyebrow)*

## A completion screen with progress you can see, and a nudge to come back.

All-time stats count up odometer style, showing users how this session added to their all-time progress. Below the stats container sits one of two containers: a week tracker or a course quote. If it is the first session of the day then the week tracker is shown, if not then the course quote container is shown.

**Segmented tabs**

- **Week Tracker**
  [LIVE: Completion screen with week tracker]
  _Week Tracker — shown after the first session of the day, gently encouraging a session every weekday_
- **Course Quote**
  [LIVE: Completion screen with course quote]
  _Course Quote — a rotating dose of motivation for every session after the first each day_

### Final Design *(eyebrow)*

## The complete end of session flow – all together.

[LIVE: End of session flow — session player → reflection → milestone → completion week tracker → loop]

_The end of session flow users see after completing their first session_

### Mobile screens *(no section eyebrow / heading / body — visuals only)*

Three `ThemedVisualCard` containers after Final Design. Each has an independent sun/moon toggle in the **top-right corner** (filled soft-blue pill matching anatomy badges: `rgba(0,110,254,0.12)` → hover `0.22`; inset `top/right 20–24px` so the 24px radius does not clip it). Default theme is **dark**. Moon icon when light (switch to dark); sun icon when dark (switch to light). Captions update with the active mode.

**Intentionally omitted:** Team Presentation section (asset `team-meeting-huddle.png` remains in `public/` but is not shown on the page).

[IMAGE: mobile-dm-reflection.png ↔ mobile-lm-reflection.png]

_Personal reflection — mobile, {dark|light} mode_

[IMAGE gallery ×3: milestone · streak · personal-best — each dm ↔ lm]

_Achievement screens — mobile, {dark|light} mode_

- Milestone — mobile, {dark|light} mode
- Focus Streak — mobile, {dark|light} mode
- Personal Best — mobile, {dark|light} mode

[IMAGE gallery ×2: completion-streak · completion-quote — each dm ↔ lm]

_Completion screens — mobile, {dark|light} mode_

- Week Tracker — mobile, {dark|light} mode
- Course Quote — mobile, {dark|light} mode

**Asset paths** (under `public/case-studies/focus-coach-achievements/`):

| Screen | Dark | Light |
|---|---|---|
| Reflection | `mobile-dm-reflection.png` | `mobile-lm-reflection.png` |
| Milestone | `mobile-dm-milestone.png` | `mobile-lm-milestone.png` |
| Focus Streak | `mobile-dm-streak.png` | `mobile-lm-streak.png` |
| Personal Best | `mobile-dm-personal-best.png` | `mobile-lm-personal-best.png` |
| Completion · Week Tracker | `mobile-dm-completion-streak.png` | `mobile-lm-completion-streak.png` |
| Completion · Quote | `mobile-dm-completion-quote.png` | `mobile-lm-completion-quote.png` |

LM uploads originally had opaque black canvases; black flood-fill outside the phone bezel was knocked out to transparent RGBA so they sit cleanly on the frosted `VisualCard` background (same treatment used earlier for DM completion-streak).

---

## Outcomes

### Launch Status *(eyebrow)*

## It shipped during the summer. We'll measure the impact this fall.

The new experience launched in July, when most students are out of school and classroom usage is naturally lower. We haven't collected enough post-launch data to draw conclusions yet. When students return this fall, we'll monitor whether more first-time users come back and whether usage becomes less concentrated among a small group of students.

**Signal cards**

- **01 — Second-session conversion**
  The percentage of first-time students who return for another Focus Session within 7 days.
- **02 — Consecutive-day usage**
  Whether more students complete sessions on consecutive weekdays and work toward a full Focus Streak.
- **03 — Usage concentration**
  Whether the top 1% account for a smaller share of sessions as more students return.

**Callout — Early Result**

- **Heading:** Reflection response time is already down 22%.
- **Body:** Students are answering the redesigned reflection question faster — an early signal that simplifying the screen is reducing friction.

---

## Takeaways

- **Restraint**
  **The strongest product decision was what we chose not to ship.**
  Students asked for badges and levels, but a rewards economy would have made collecting the point. Streaks, milestones, and personal bests gave us celebration without turning focus into a currency.

- **Designing for context**
  **An ethical mechanic starts with the reality of the people using it.**
  Students often do not control when classroom sessions happen. Focus Streaks are earned across a school week and never lost, replacing daily loss aversion with progress that fits their lives.

- **Changing my mind**
  **A principle is useful until the work proves it wrong.**
  I began convinced that one completion page meant less friction. The milestone mockups showed that compression was underselling the moment, so I traded that principle for a guided flow where every screen earns its place.

---

## Closing CTA

**Try the end of session experience yourself**

Shipped to production in July 2026 — live at [findingfocus.app](https://findingfocus.app)

**Button:** Try the Prototype

_(Opens modal — Interactive prototype / End of session flow — with iframe of `session-complete-prototype.html`)_
