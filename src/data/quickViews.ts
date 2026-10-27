/**
 * The Quick view decks: a 90-second pass through each case study, one idea per
 * slide, built to be talked over in an interview as much as read alone. Each
 * design decision gets the screen it produced. Every number and claim is lifted
 * from the case study itself — if one changes there, change it here.
 */

/** `ratio` is width ÷ height, so screens in a row can share one height */
export type QuickScreen = { src: string; alt: string; ratio: number; caption?: string };

export type QuickMedia =
  /** The card's own artwork, so the deck opens on what was just clicked */
  | { kind: 'thumbnail' }
  /** `fixed` keeps it out of the full-screen viewer, for a diagram that gains nothing from being bigger */
  | { kind: 'image'; src: string; alt: string; fit?: 'contain' | 'cover'; fixed?: boolean }
  /** A live HTML prototype in a frame, scaled to fit; it starts over each time its slide opens */
  | { kind: 'prototype'; src: string; title: string; width: number; height: number }
  /** A row of screens; more than one set adds tabs to switch between them */
  | { kind: 'gallery'; sets: { label?: string; screens: QuickScreen[] }[] }
  /** Labelled groups of screens side by side — a flow when `arrows` is set, a before/after when not */
  | {
      kind: 'groups';
      arrows?: boolean;
      groups: {
        label: string;
        tag?: string;
        dashed?: boolean;
        screens?: QuickScreen[];
        /** A live, looping demo in place of screens — see DEMOS in QuickView */
        demo?: 'end-of-session';
      }[];
    }
  /** Whole pages too tall to show at once, each scrolling in its own window */
  /** `hint` is a one-time tip on the page's window, gone once the reader scrolls it */
  | {
      kind: 'pages';
      pages: { label: string; src: string; alt: string; width: number; height: number; hint?: string }[];
    };

export interface QuickSlide {
  /** Names the slide's section in the progress bar; neighbours that share one form a section */
  label: string;
  headline: string;
  body?: string;
  /** Adds the case study's role, timeline, and team */
  facts?: boolean;
  stats?: { value: string; label: string }[];
  /** `verdict` marks options weighed against each other: the one chosen and the ones ruled out */
  points?: { title: string; body: string; verdict?: 'chosen' | 'ruled-out' }[];
  quote?: { text: string; source: string };
  /** The alternatives weighed for a decision, as wireframes, with the one chosen marked */
  options?: { label: string; src: string; chosen?: boolean }[];
  media?: QuickMedia;
  /** A line under the media */
  caption?: string;
  /** Overrides the layout the media would pick on its own */
  layout?: 'split' | 'stack';
}

const FC = '/case-studies/focus-coach-achievements';
const AI = '/case-studies/finding-focus-ai-assistant';
const LP = '/case-studies/landing-page';

/** Phone exports, all at 1258 × 2550 (and the same shape at smaller sizes) */
const PHONE = 1258 / 2550;
const fcPhone = (name: string, alt: string, caption?: string): QuickScreen => ({
  src: `${FC}/mobile-${name}.webp`,
  alt,
  ratio: PHONE,
  caption,
});

export const FOCUS_COACH_DECK: QuickSlide[] = [
  {
    label: 'Overview',
    headline: 'Focus Coach End-of-Session Flow',
    body: "The Focus Coach is Finding Focus's guided study timer. It keeps students on task by checking in on them during a session. I redesigned what happens when a session ends, to celebrate progress and bring first-time users back.",
    facts: true,
    media: { kind: 'image', src: `${FC}/focus-coach-check-in.gif`, alt: 'A check-in during a Focus Session' },
    caption: 'A check-in during a Focus Session',
  },
  {
    label: 'Problem',
    headline: 'Students tried it once and never came back.',
    body: 'Our hypothesis was that the end of a session was where we lost them. Every session ended with a reflection slider and a check-in graph that sat empty for most students.',
    stats: [
      { value: '39%', label: 'of students who finished a session never started a second' },
      { value: '55%', label: 'of all sessions came from the top 1% of users' },
    ],
    media: { kind: 'image', src: `${FC}/old-session-flow.gif`, alt: 'The old end of session flow' },
    caption: 'The old end of session',
  },
  {
    label: 'Research',
    headline: 'Students asked for badges. We decided against them.',
    body: 'A survey and an audit of six timer apps both pointed toward gamification. But Finding Focus exists to build real focus, and once a badge becomes the reason to start a session, the tool has failed at its job.',
    stats: [
      { value: '84%', label: 'of 89 students said yes or maybe to earning badges and levels' },
      { value: '100s', label: "of one-minute sessions logged by one student to win a teacher's prize" },
    ],
  },
  {
    label: 'Solution',
    headline: 'A guided end of session that highlights everything students accomplished.',
    body: 'I designed a short guided flow for the end of every session. Students always reflect and see their progress, and an achievement screen appears only when they’ve earned one.',
    media: {
      kind: 'groups',
      arrows: true,
      groups: [
        { label: 'Reflection', tag: 'Always', screens: [fcPhone('lm-reflection', 'Reflection screen', 'Rate your focus')] },
        {
          label: 'Achievement',
          tag: 'Only when earned',
          dashed: true,
          screens: [
            fcPhone('lm-milestone', 'Milestone screen', 'Milestone'),
            fcPhone('lm-streak', 'Focus Streak screen', 'Focus Streak'),
            fcPhone('lm-personal-best', 'Personal best screen', 'Personal best'),
          ],
        },
        {
          label: 'Completion',
          tag: 'Always',
          screens: [
            fcPhone('lm-completion-streak', 'Completion screen with the week tracker', '1st session of the day'),
            fcPhone('lm-completion-quote', 'Completion screen with a course quote', 'Later sessions'),
          ],
        },
      ],
    },
  },
  {
    label: 'Key decisions',
    headline: 'Focus Streaks are earned, never lost.',
    body: 'Classic streaks push students to come back just to keep a number alive, a loss-aversion dark pattern we refused to use on K-12 students. A Focus Streak is earned with a session every weekday, and once it’s yours, it can’t be taken away.',
    layout: 'split',
    media: {
      kind: 'gallery',
      sets: [
        {
          screens: [
            fcPhone('dm-streak', 'Focus Streak earned', 'Streak earned'),
            fcPhone('dm-completion-streak', 'Week tracker on the completion screen', 'Week tracker'),
          ],
        },
      ],
    },
  },
  {
    label: 'Key decisions',
    headline: 'A guided flow beat one busy page.',
    body: 'My first concept rotated content through a single completion page. In mockups it felt cluttered and nothing stood out, so each achievement got its own screen and its own animated illustration.',
    media: {
      kind: 'groups',
      groups: [
        {
          label: 'Early concept',
          dashed: true,
          screens: [
            { src: `${FC}/early-milestone-mockup.png`, alt: 'Early milestone mockup', ratio: 800 / 1622 },
            { src: `${FC}/early-personal-best-mockup.png`, alt: 'Early personal best mockup', ratio: 800 / 1622 },
            { src: `${FC}/early-quote-mockup.png`, alt: 'Early quote mockup', ratio: 800 / 1622 },
          ],
        },
        { label: 'Final', tag: 'Shipped', demo: 'end-of-session' },
      ],
    },
    caption: 'The final flow after a first session of the day: reflection, a milestone, then completion',
  },
  {
    label: 'Outcomes',
    headline: 'Shipped July 2026. Now measuring against fall goals.',
    body: 'Early retention signals are promising, but summer is our quietest season, so the real test is the fall semester.',
    stats: [
      { value: '75%', label: 'Goal: students returning for a second session, up from 61%' },
      { value: '30%', label: 'Goal: share of all sessions from the top 1% of users, down from 55%' },
      { value: '15%', label: 'Goal: students completing 10+ sessions in 30 days, up from 6%' },
    ],
  },
];

const wireframe = (name: string) => `${AI}/ideation-${name}-wireframe.png`;
const aiGif = (name: string, alt: string) => ({ kind: 'image' as const, src: `${AI}/GIFs/${name}.gif`, alt });

export const AI_ASSISTANT_DECK: QuickSlide[] = [
  {
    label: 'Overview',
    headline: 'Finding Focus AI Assistant',
    body: 'Teachers who got one-on-one help from our team were our most successful, but almost none of them got it. I led the UX for an LLM-powered assistant that gives every teacher that help, on demand.',
    facts: true,
    media: { kind: 'thumbnail' },
  },
  {
    label: 'Problem',
    headline: "Hands-on support worked. It just didn't scale.",
    body: "Our team's bandwidth was limited, and teachers didn't know how to reach us. The only self-serve option was a dense help center that busy teachers rarely searched.",
    stats: [{ value: '<5%', label: 'of sign ups ever received one-on-one support' }],
    // The same diagram the case study uses
    media: { kind: 'image', fixed: true, src: `${AI}/teacher%20reach%20diagram.png`, alt: 'Diagram: of every teacher who signs up, only a few get one-on-one support' },
  },
  {
    label: 'Research',
    headline: 'Teachers had been burned by chatbots before.',
    body: '6 of the 10 teachers I interviewed were wary of an in-product chatbot, mostly because past chatbots couldn’t answer their questions. Ours had to handle the questions nobody scripted.',
    points: [
      {
        title: 'Rule-based chatbot',
        body: 'Fast and predictable, but robotic, and stuck the moment a question goes off script.',
        verdict: 'ruled-out',
      },
      {
        title: 'LLM-powered chatbot',
        body: 'Natural and aware of context. The trade-off is cost, and hallucinations we’d have to manage.',
        verdict: 'chosen',
      },
    ],
  },
  {
    label: 'Solution',
    headline: 'An assistant that feels like the AI tools teachers already use.',
    body: 'I studied ChatGPT, Gemini, Claude, and Meta AI, and built in the three patterns that made chatting feel effortless.',
    points: [
      { title: 'Letter-by-letter streaming', body: 'Immediate feedback that makes replies feel fast.' },
      { title: 'Distinct message styles', body: 'Teacher messages in bubbles, so the conversation is easy to follow.' },
      { title: 'Auto-scroll and anchor', body: 'The layout stays steady while a reply streams in.' },
    ],
    // The live prototype from the case study's Final Design section
    media: {
      kind: 'prototype',
      src: `${AI}/prototype/index.html?embed=1`,
      title: 'Finding Focus AI Assistant interactive prototype',
      // The prototype's frame at its largest (0.7 of 725×928), plus its 20px margin
      width: 548,
      height: 690,
    },
  },
  {
    label: 'Key decisions',
    headline: 'Always one click away.',
    body: 'A floating button keeps the assistant reachable from any page without pulling teachers out of their work. A callout introduces it the first time.',
    options: [
      { label: 'Floating button', src: wireframe('fab'), chosen: true },
      { label: 'Nav drawer tab', src: wireframe('nav-drawer') },
    ],
    media: aiGif('Always Visible', 'The floating assistant button and its callout'),
  },
  {
    label: 'Key decisions',
    headline: 'Room to talk, without losing your place.',
    body: 'A modal anchored to the side gives the conversation space while the page stays visible behind it.',
    options: [
      { label: 'Anchored modal', src: wireframe('display-anchored'), chosen: true },
      { label: 'Split view', src: wireframe('display-split') },
      { label: 'Full screen', src: wireframe('display-fullscreen') },
    ],
    media: aiGif('Opening Chat Interface', 'The assistant opening as an anchored modal'),
  },
  {
    label: 'Key decisions',
    headline: 'Suggested questions beat a blank box.',
    body: 'Question tiles give teachers a starting point, and show what the assistant can actually answer.',
    options: [
      { label: 'Suggested questions', src: wireframe('empty-tiles'), chosen: true },
      { label: 'Proactive greeting', src: wireframe('empty-proactive') },
      { label: 'Blank input', src: wireframe('empty-blank') },
    ],
    media: aiGif('Empty State Example Question', 'A teacher picking a suggested question'),
  },
  {
    label: 'Accuracy',
    headline: 'A great design can’t save a wrong answer.',
    body: 'In testing, the assistant often skipped our docs and answered from general knowledge. We required a knowledge base search on every question, and split our docs into small, single-topic chunks.',
    stats: [
      { value: '42%', label: 'response accuracy before retrieval tuning' },
      { value: '88%', label: 'response accuracy after, on the same 100 test questions' },
    ],
  },
  {
    label: 'Screens',
    headline: 'The final design, including when things go wrong.',
    media: {
      kind: 'gallery',
      sets: [
        {
          label: 'Desktop & mobile',
          screens: [
            { src: `${AI}/imac-mockup.webp`, alt: 'The assistant on desktop', ratio: 4760 / 4040 },
            { src: `${AI}/iphone-mockup.webp`, alt: 'The assistant on mobile', ratio: PHONE },
          ],
        },
        {
          label: 'Error states',
          screens: [
            { src: `${AI}/error-network.png`, alt: 'Network error', ratio: 791 / 1012, caption: 'Network error' },
            { src: `${AI}/error-api-connection.png`, alt: 'API connection error', ratio: 791 / 1012, caption: 'API connection error' },
            { src: `${AI}/error-unable-to-respond.png`, alt: 'Query refusal', ratio: 791 / 1012, caption: 'Query refusal' },
          ],
        },
      ],
    },
  },
  {
    label: 'Outcomes',
    headline: 'Shipped in 2024. Support tickets went down.',
    stats: [
      { value: '18%', label: 'of first-time users clicked into the assistant' },
      { value: '62%', label: 'of those who opened it asked a question' },
      { value: '12%', label: 'fewer support tickets year over year' },
    ],
    quote: {
      text: 'It was a lot more convenient than emailing support and waiting for a response.',
      source: 'Caro Middle School teacher',
    },
  },
];

export const LANDING_PAGE_DECK: QuickSlide[] = [
  {
    label: 'Overview',
    headline: 'Landing Page Redesign',
    body: 'The Finding Focus landing page was built for students, but teachers are the ones who bring it into the classroom. I redesigned it to speak to teachers, look like a mature product, and earn their trust.',
    facts: true,
    media: { kind: 'thumbnail' },
  },
  {
    label: 'Problem',
    headline: 'Our page was talking to the wrong audience.',
    body: 'Teachers decide whether Finding Focus gets used, but the original page centered the student experience. It also looked dated, and had no testimonials or social proof.',
    media: {
      kind: 'pages',
      pages: [
        {
          label: 'Original page',
          src: `${LP}/old-full-page.webp`,
          alt: 'The original, student-first landing page',
          width: 1755,
          height: 5904,
          hint: 'Scroll over this image to see the full original page',
        },
      ],
    },
  },
  {
    label: 'Approach',
    headline: 'Before designing, we got clear on look, voice, and story.',
    body: "I audited other edtech landing pages, aligned the team on a visual identity, and mapped the teacher's story: their goals, their frustrations, and what it would take to trust us.",
    media: {
      kind: 'gallery',
      sets: [
        {
          screens: [
            { src: `${LP}/approach-competitive-research-board.png`, alt: 'Competitive audit board in FigJam', ratio: 1024 / 462, caption: 'Competitive audit' },
            { src: `${LP}/vi-04-glassmorphism-broad.png`, alt: 'Glassmorphism style exploration', ratio: 1024 / 798, caption: 'Visual identity' },
            { src: `${LP}/messaging-storybrand-teacher-doc.png`, alt: "Doc mapping the teacher's story", ratio: 1024 / 650, caption: 'Teacher story' },
          ],
        },
      ],
    },
  },
  {
    label: 'Key decisions',
    headline: 'Lead with what teachers care about.',
    body: 'The hero frames Finding Focus around teacher outcomes, hints at its credibility, and puts sign up front and center.',
    media: { kind: 'image', src: `${LP}/header-and-hero.webp`, alt: 'The new hero section' },
  },
  {
    label: 'Key decisions',
    headline: 'Trust before they go looking.',
    body: 'Right under the hero, a credibility strip calls out university backing, educator involvement, and US Department of Education funding, with custom icons.',
    media: { kind: 'image', src: `${LP}/social-proof-strip.webp`, alt: 'The credibility strip' },
  },
  {
    label: 'Key decisions',
    headline: 'Show the product, don’t just describe it.',
    body: 'The old page never showed what Finding Focus includes. I made simplified, animated versions of each part of the platform.',
    media: {
      kind: 'gallery',
      sets: [
        {
          screens: [
            { src: `${LP}/anim-10-day-course.gif`, alt: '10-Day Course illustration', ratio: 800 / 728, caption: '10-Day Course' },
            { src: `${LP}/anim-focus-coach.gif`, alt: 'Focus Coach illustration', ratio: 800 / 728, caption: 'Focus Coach' },
            { src: `${LP}/anim-teacher-interface.gif`, alt: 'Teacher interface illustration', ratio: 800 / 728, caption: 'Teacher interface' },
          ],
        },
      ],
    },
  },
  {
    label: 'Key decisions',
    headline: 'Let research and real voices make the case.',
    body: "Glassmorphic cards surface Finding Focus's measured outcomes, and testimonials from teachers and students show it working in real classrooms.",
    media: {
      kind: 'gallery',
      sets: [
        {
          screens: [
            { src: `${LP}/research-section.webp`, alt: 'Research outcomes section', ratio: 2560 / 1308, caption: 'Research' },
            { src: `${LP}/testimonial-section.webp`, alt: 'Testimonials section', ratio: 2152 / 2366, caption: 'Testimonials' },
          ],
        },
      ],
    },
  },
  {
    label: 'Screens',
    headline: 'The whole page, before and after.',
    media: {
      kind: 'pages',
      pages: [
        { label: 'Before', src: `${LP}/old-full-page.webp`, alt: 'The original landing page', width: 1755, height: 5904 },
        { label: 'After', src: `${LP}/new-full-page.webp`, alt: 'The redesigned landing page', width: 2560, height: 15680 },
      ],
    },
    caption: 'Scroll each page',
  },
  {
    label: 'Outcomes',
    headline: 'Live at findingfocus.app.',
    body: "The page now speaks to teachers, looks like the mature product it is, and puts proof up front. As the team's only designer, it also pushed me into brand and marketing work.",
    media: { kind: 'image', src: `${LP}/mobile-mockup.webp`, alt: 'The new landing page on mobile' },
  },
];
