'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';
import HalftoneCanvas from '@/components/HalftoneCanvas';
import { AIAssistantThumbnail } from '@/components/AIAssistantThumbnail';
import { MilestoneThumbnail } from '@/components/MilestoneThumbnail';
import { DisccThumbnail } from '@/components/DisccThumbnail';
import { ScreenRecordingThumbnail } from '@/components/ScreenRecordingThumbnail';

// ── SVG path constants ────────────────────────────────────────────────────────

// Dark blue folder silhouette — static, same for both states
const FOLDER_BACK = `M89.25 0C94.0999 0 98.4733 2.9193 100.333 7.39844L105.979 21H381.5C394.755 21 405.501 31.7452 405.501 45V237C405.501 250.255 394.755 261 381.5 261H29.501C16.2461 261 5.50098 250.255 5.50098 237V45C5.50098 44.9867 5.50195 44.9733 5.50195 44.96C5.50195 44.9486 5.50098 44.9371 5.50098 44.9258V12C5.50098 5.37258 10.8736 0 17.501 0H89.25Z`;

// Light blue front face — CLOSED: flat rectangle (M C H C L C H C L Z — matches OPEN exactly)
const BODY_CLOSED = `M5.5 57C5.5 33 5.5 33 29.5 33H416C440 33 440 33 440 57L440 237C440 261 440 261 416 261H29.5C5.5 261 5.5 261 5.5 237L5.5 57Z`;

// Light blue front face — OPEN: tilted parallelogram (identical command structure to CLOSED)
const BODY_OPEN = `M40.087 64.2095C42.3641 53.0308 52.1958 45 63.604 45H416.213C431.197 45 442.517 58.5781 439.822 73.3172L409.1 241.318C407.015 252.718 397.081 261 385.491 261H29.3818C14.2018 261 2.83473 247.084 5.86472 232.21L40.087 64.2095Z`;

// ── Mini card ─────────────────────────────────────────────────────────────────
function MiniCard({
  title,
  subtitle,
  thumbnailContent,
}: {
  title: string;
  subtitle: string;
  thumbnailContent: React.ReactNode;
}) {
  return (
    <div style={{
      width: '100%',
      background: '#fcfcfc',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
      border: '1.5px solid rgba(255,255,255,0.6)',
    }}>
      {/* Thumbnail strip */}
      <div style={{
        height: '72px',
        background: 'rgba(220, 232, 248, 0.45)',
        overflow: 'hidden',
        position: 'relative',
        padding: '8px',
        boxSizing: 'border-box',
      }}>
        {thumbnailContent}
      </div>
      {/* Text */}
      <div style={{ padding: '7px 9px 9px' }}>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '6px',
          fontWeight: 500,
          color: '#aaa',
          letterSpacing: '0.08em',
          marginBottom: '3px',
          textTransform: 'uppercase',
        }}>
          Case Study
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '8.5px',
          fontWeight: 600,
          color: '#141510',
          lineHeight: '12px',
          marginBottom: '2px',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '7px',
          fontWeight: 400,
          color: '#666',
          lineHeight: '10px',
        }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

// ── Thumbnail contents ───────────────────────────────────────────────────────
// The same artwork the real project cards carry, not lookalikes of it. Each of
// these scales itself to whatever box it is handed, so the mini card gets the
// genuine article at folder size.
const AI_ASSISTANT_THUMBNAIL = <AIAssistantThumbnail />;

const ACHIEVEMENTS_THUMBNAIL = <MilestoneThumbnail />;

const DISCC_THUMBNAIL = <DisccThumbnail />;

const PROGRAM_SEARCH_THUMBNAIL = (
  <ScreenRecordingThumbnail
    src="/case-studies/lastinger/program-search.mp4"
    poster="/case-studies/lastinger/program-search-poster.webp"
  />
);

const COURSE_ONBOARDING_THUMBNAIL = (
  <ScreenRecordingThumbnail
    src="/case-studies/lastinger/course-onboarding.mp4"
    poster="/case-studies/lastinger/course-onboarding-poster.webp"
    // This capture is wider than the card and its content hugs the left edge,
    // so centring the crop cuts the logo and the headline in half.
    objectPosition="top left"
  />
);

const LANDING_PAGE_THUMBNAIL = (
  <img src="/case-studies/landing-page/header-and-hero.png" alt="" style={{
    position: 'absolute', inset: '8px',
    width: 'calc(100% - 16px)', height: 'calc(100% - 16px)',
    objectFit: 'cover', objectPosition: 'top center',
    display: 'block',
    borderRadius: '5px',
  }} />
);

// ── Folder with clamshell open + cards rising from within ─────────────────────
function FolderItem({
  href,
  label,
  dates,
  cards,
  folderWidth,
  canHover,
}: {
  href: string;
  label: string;
  /** When the work in this folder happened — sits under the folder's name. */
  dates: string;
  folderWidth: string;
  canHover: boolean;
  cards: {
    title: string;
    subtitle: string;
    thumbnailContent: React.ReactNode;
    rotation: number;
    leftPct: string;
  }[];
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
    >
      <div
        style={{
          position: 'relative',
          width: folderWidth,
          transition: 'transform 0.22s ease',
          transform: hovered ? 'scale(1.035) translateY(-4px)' : 'scale(1) translateY(0px)',
        }}
        onMouseEnter={() => canHover && setHovered(true)}
        onMouseLeave={() => canHover && setHovered(false)}
      >

        {/* ── Layer 1: Dark blue folder back (sets container height) ── */}
        <svg
          viewBox="0 0 445 261"
          style={{ display: 'block', width: '100%', height: 'auto' }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={FOLDER_BACK} fill="#4495CC" />
        </svg>

        {/* ── Layer 2: Mini cards — rise from within the folder ── */}
        {/* clip-path allows unlimited overflow above (pop-out) but clips at the folder bottom */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          clipPath: 'inset(-300px -30px 0px -30px)',
          pointerEvents: 'none',
        }}>
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: card.leftPct,
                top: '44%',
                width: '43%',
                minWidth: '120px',
                transform: hovered ? 'translateY(-130px)' : 'translateY(0px)',
                transition: `transform ${0.36 + i * 0.06}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
              }}
            >
              <div style={{ transform: `rotate(${card.rotation}deg)` }}>
                <MiniCard
                  title={card.title}
                  subtitle={card.subtitle}
                  thumbnailContent={card.thumbnailContent}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Layer 3: Light blue folder front face (covers cards until open) ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          <svg
            viewBox="0 0 445 261"
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(0 -3px 4px rgba(0,0,0,0.12))',
            }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={hovered ? BODY_OPEN : BODY_CLOSED}
              fill="#73C7F7"
              style={{ transition: 'd 0.42s cubic-bezier(0.34, 1.56, 0.64, 1)' } as React.CSSProperties}
            />
          </svg>
        </div>

      </div>

      {/* Label */}
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '18px',
        fontWeight: 500,
        lineHeight: '28px',
        color: '#000000',
        marginTop: '24px',
        paddingLeft: '8px',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>

      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        color: '#757575',
        marginTop: '2px',
        paddingLeft: '8px',
        whiteSpace: 'nowrap',
      }}>
        {dates}
      </span>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CaseStudies() {
  const [chatOpen, setChatOpen] = useState(false);
  /** Three folders across, or one under the other. There is no middle. */
  const [stacked, setStacked] = useState(false);
  const canHover = useCanPrimaryHover();

  useEffect(() => {
    /**
     * The row holds all three down to 940px, where each folder is still ~260px
     * — wide enough for "Lastinger Center for Learning" to sit under it. Below
     * that they go straight to a single column rather than passing through a
     * two-across step: two folders side by side with a third alone underneath
     * reads as a mistake, not a layout.
     */
    const check = () => setStacked(window.innerWidth < 940);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Holds 400px until 40px margins remain on each side, then scales down.
  // formula: (100vw - gaps - 80px margins) / columns
  const folderWidth = stacked
    ? 'min(400px, calc(100vw - 80px))'
    : 'min(400px, calc((100vw - 160px) / 3))';

  return (
    <>
      <HalftoneCanvas />
      {/* Page layer — in flow (not fixed) so the footer can follow it */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'transparent',
        transition: 'opacity 0.45s ease, visibility 0.45s ease',
        opacity: chatOpen ? 0 : 1,
        visibility: chatOpen ? 'hidden' : 'visible',
      }}>

        {/* Fills the viewport and centres in it; the document does the
            scrolling now, so the footer is reachable below the fold */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '100px',
          paddingBottom: '120px',
          minHeight: '100dvh',
          boxSizing: 'border-box',
        }}>

        {/* ── Folders ── */}
        <div style={{
          display: 'flex',
          flexDirection: stacked ? 'column' : 'row',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          alignItems: stacked ? 'center' : 'flex-start',
          columnGap: '40px',
          /* Cards rise ~130px out of a folder, well past its own top edge, so a
             stacked folder would open straight over the label of the one above
             it. The extra row gap is only owed where folders actually open — a
             touch device never hovers, and would just be scrolling past dead
             space. */
          rowGap: canHover ? '150px' : '40px',
        }}>

          <FolderItem
            href="/case-studies/finding-focus"
            label="Finding Focus"
            dates="2022 – 2026"
            folderWidth={folderWidth}
            canHover={canHover}
            cards={[
              {
                title: 'Finding Focus AI Assistant',
                subtitle: 'LLM-powered educator support',
                thumbnailContent: AI_ASSISTANT_THUMBNAIL,
                rotation: -9,
                leftPct: '6%',
              },
              {
                title: 'Landing Page Redesign',
                subtitle: 'Teacher-first marketing',
                thumbnailContent: LANDING_PAGE_THUMBNAIL,
                rotation: 9,
                leftPct: '51%',
              },
              {
                title: 'Focus Coach End-of-Session Flow',
                subtitle: 'Session completion redesign',
                thumbnailContent: ACHIEVEMENTS_THUMBNAIL,
                rotation: 2,
                leftPct: '28.5%',
              },
            ]}
          />

          <FolderItem
            href="/case-studies/personal-projects"
            label="Personal Projects"
            dates="2026"
            folderWidth={folderWidth}
            canHover={canHover}
            cards={[
              {
                title: 'Discc',
                subtitle: 'A collectible Spotify library',
                thumbnailContent: DISCC_THUMBNAIL,
                // One card, so it rises from the middle of the folder and sits
                // straight — the tilt is what makes a pile read as a pile, and
                // there is no pile here yet.
                rotation: 0,
                leftPct: '28.5%',
              },
            ]}
          />

          <FolderItem
            href="/case-studies/lastinger-center"
            label="Lastinger Center for Learning"
            dates="2020 – 2022"
            folderWidth={folderWidth}
            canHover={canHover}
            cards={[
              {
                title: 'Program Search & Selection',
                subtitle: 'Filtering and context-rich cards',
                thumbnailContent: PROGRAM_SEARCH_THUMBNAIL,
                rotation: -9,
                leftPct: '6%',
              },
              {
                title: 'Course Onboarding',
                subtitle: 'Join codes and instant access',
                thumbnailContent: COURSE_ONBOARDING_THUMBNAIL,
                rotation: 9,
                leftPct: '51%',
              },
            ]}
          />

        </div>

        </div>{/* end scroll container */}

        {/* ── Chat bar — pinned, does not scroll ── */}
        {/* <button
          onClick={() => setChatOpen(true)}
          aria-label="Open chat with BAR 9000"
          style={{
            position: 'absolute',
            bottom: '9.4%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(280px, 38.9vw, 560px)',
            height: '48px',
            background: '#0f0f0e',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'text',
            display: 'flex',
            alignItems: 'center',
            padding: '0 22px',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span style={{
            color: 'rgba(255, 255, 255, 0.42)',
            fontSize: '15px',
            fontFamily: 'var(--font-sf-pro)',
            letterSpacing: '-0.15px',
            userSelect: 'none',
          }}>
            Ask BAR 9000 about my work...
          </span>
        </button> */}

      </div>

      {/* {chatOpen && (
        <ChatContainer disclaimerVisible={false} disclaimerHeight={0} />
      )} */}
    </>
  );
}
