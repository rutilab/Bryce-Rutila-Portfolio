'use client';

import { AIAssistantThumbnail } from '@/components/AIAssistantThumbnail';
import { MilestoneThumbnail } from '@/components/MilestoneThumbnail';
import { DisccThumbnail } from '@/components/DisccThumbnail';
import { ScreenRecordingThumbnail } from '@/components/ScreenRecordingThumbnail';
import type { Project } from '@/components/ProjectCard';

/**
 * Every project on the site, in the order the home page lists them. The folder
 * pages filter this rather than restating it, so a thumbnail swapped here shows
 * up everywhere the project appears.
 */
export const PROJECTS: Project[] = [
  {
    title: 'Focus Coach End-of-Session Flow',
    eyebrow: 'FINDING FOCUS • 2026',
    description:
      "Redesigning a study tool's end-of-session flow to celebrate progress and turn first-time users into daily habit-builders.",
    tags: ['UX DESIGN', 'GAMIFICATION', 'ANIMATION'],
    readTime: '10-12 MIN READ',
    cardColor: '#31e300',
    folder: 'finding-focus',
    href: '/case-studies/focus-coach-achievements',
    thumbnailContent: <MilestoneThumbnail />,
  },
  {
    title: 'Finding Focus AI Assistant',
    eyebrow: 'FINDING FOCUS • 2024',
    description:
      "Leveraging OpenAI's Chat Completions API to build an AI Assistant that scales 1:1 support across our entire teacher base.",
    tags: ['AI', 'UX DESIGN', 'UX RESEARCH'],
    readTime: '12-15 MIN READ',
    cardColor: '#ff9c12',
    folder: 'finding-focus',
    href: '/case-studies/finding-focus-ai-assistant',
    thumbnailContent: <AIAssistantThumbnail />,
  },
  {
    title: 'Landing Page Redesign',
    eyebrow: 'FINDING FOCUS • 2026',
    description:
      "Redesigning the Finding Focus marketing site to improve conversion and communicate value across teacher and student personas",
    tags: ['UX DESIGN', 'VISUAL DESIGN', 'MARKETING'],
    readTime: '8 MIN READ',
    cardColor: '#12b4ff',
    folder: 'finding-focus',
    href: '/case-studies/finding-focus-landing-page',
    thumbnailContent: (
      <img src="/case-studies/landing-page/header-and-hero.png" alt="" style={{
        position: 'absolute', inset: '8px',
        width: 'calc(100% - 16px)', height: 'calc(100% - 16px)',
        objectFit: 'cover', objectPosition: 'top center',
        display: 'block',
        borderRadius: '5px',
      }} />
    ),
  },
  {
    title: 'Program Search & Selection',
    eyebrow: 'LASTINGER CENTER',
    description:
      'Redesigned the program pages with intuitive filtering and context-rich cards to help educators quickly find and evaluate professional learning options.',
    tags: ['UX DESIGN', 'INFORMATION ARCHITECTURE', 'SEARCH'],
    readTime: 'COMING SOON',
    cardColor: '#12b4ff',
    folder: 'lastinger',
    thumbnailContent: (
      <ScreenRecordingThumbnail
        src="/case-studies/lastinger/program-search.mp4"
        poster="/case-studies/lastinger/program-search-poster.webp"
      />
    ),
    comingSoon: true,
  },
  {
    title: 'Course Onboarding',
    eyebrow: 'LASTINGER CENTER',
    description:
      'Simplified the onboarding flow for educators to effortlessly enter join codes and unlock instant access to their courses.',
    tags: ['UX DESIGN', 'ONBOARDING'],
    readTime: 'COMING SOON',
    cardColor: '#31e300',
    folder: 'lastinger',
    thumbnailContent: (
      <ScreenRecordingThumbnail
        src="/case-studies/lastinger/course-onboarding.mp4"
        poster="/case-studies/lastinger/course-onboarding-poster.webp"
        // This capture is wider than the card and its content hugs the left
        // edge, so centring the crop cuts the logo and the headline in half.
        objectPosition="top left"
      />
    ),
    comingSoon: true,
  },
  {
    title: 'Discc',
    eyebrow: 'PERSONAL PROJECT • 2026',
    description:
      'Building a collectible library for curating, showing off, and sharing Spotify listening history',
    // 'iOS' keeps its proper-noun casing — the tags carry no text-transform, and
    // 'IOS' among the all-caps neighbours reads as a typo rather than a platform.
    tags: ['PRODUCT DESIGN', 'iOS', 'SOCIAL'],
    readTime: 'COMING SOON',
    folder: 'personal',
    cardColor: '#ff12f7',
    thumbnailContent: <DisccThumbnail />,
    comingSoon: true,
  },
];

/**
 * Grouped by the explicit `folder` field rather than by pattern-matching hrefs.
 * A slug that didn't match the guessed shape would have gone quietly missing
 * from its folder, which is the class of drift this file exists to end.
 */
export const FINDING_FOCUS_PROJECTS = PROJECTS.filter(p => p.folder === 'finding-focus');
export const PERSONAL_PROJECTS = PROJECTS.filter(p => p.folder === 'personal');
export const LASTINGER_PROJECTS = PROJECTS.filter(p => p.folder === 'lastinger');
