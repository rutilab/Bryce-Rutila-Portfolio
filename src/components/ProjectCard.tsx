'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Toast } from '@/components/Toast';
import { useCanPrimaryHover } from '@/hooks/useCanPrimaryHover';

/**
 * The portfolio's project card, and the only one. It started life inside the
 * home page; the folder pages grew their own quieter version, which promptly
 * drifted — different thumbnails, different copy, a placeholder that outlived
 * its replacement. One component and one list (see `@/data/projects`) is what
 * stops that happening again.
 */

// ── Blend a hex color at given opacity onto a solid background ─────────────
function solidHighlight(hex: string, alpha: number, bg = '#faf7f2'): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [fr, fg, fb] = parse(hex);
  const [br, bg_g, bb] = parse(bg);
  const blend = (f: number, b: number) => Math.round(b * (1 - alpha) + f * alpha);
  return `#${[blend(fr, br), blend(fg, bg_g), blend(fb, bb)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

/** BRYCE hover wash — shared across all project cards so colors rotate in order */
const PROJECT_HOVER_COLORS = [
  '#FF9C12', // orange
  '#12B4FF', // blue
  '#FFF712', // yellow
  '#FF12F7', // pink
  '#31E300', // green
] as const;

/** Last color index shown on any card; -1 so the first hover starts at orange */
let lastProjectHoverColorIdx = -1;

function nextProjectHoverColor(): string {
  lastProjectHoverColorIdx =
    (lastProjectHoverColorIdx + 1) % PROJECT_HOVER_COLORS.length;
  return PROJECT_HOVER_COLORS[lastProjectHoverColorIdx];
}

export interface Project {
  title: string;
  /** Which folder on /case-studies this belongs in. */
  folder: 'finding-focus' | 'personal' | 'lastinger';
  /**
   * Keeps a project out of the home page's featured row while leaving it in
   * its folder. The home page is a selection, not an index.
   */
  hideFromHome?: boolean;
  eyebrow?: string;
  description: string;
  tags: string[];
  readTime: string;
  cardColor: string;
  /** Omitted for projects with nothing to link to yet — see `comingSoon`. */
  href?: string;
  thumbnailContent: React.ReactNode;
  /**
   * Marks a card with no case study behind it. Such a card drops every hover
   * affordance — it must not look pressable — and says so on contact instead:
   * a tag on the cursor where there is a pointer, a toast on tap where there
   * isn't.
   */
  comingSoon?: boolean;
}

/** Shown by the cursor tag and the touch toast alike, so both say one thing. */
const COMING_SOON_LABEL = 'Coming Soon 👀';

function Tag({ label, hovered, cardColor }: { label: string; hovered: boolean; cardColor: string }) {
  const highlightBg = solidHighlight(cardColor, 0.38);
  return (
    <span
      style={{
        fontFamily: "var(--font-ibm-plex-mono), monospace",
        fontSize: '14px',
        lineHeight: '24px',
        letterSpacing: '-0.012em',
        color: '#141510',
        backgroundColor: hovered ? highlightBg : 'transparent',
        border: `1px ${hovered ? 'solid' : 'dashed'} ${hovered ? cardColor : '#141510'}`,
        borderRadius: '4px',
        padding: '4px 8px',
        whiteSpace: 'nowrap',
        display: 'inline-block',
        transition: 'color 0.18s ease, background-color 0.18s ease, border-color 0.18s ease',
      }}
    >
      {label}
    </span>
  );
}

// ── Clock icon ─────────────────────────────────────────────────────────────
function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="10" cy="10" r="8.25" stroke="#757575" strokeWidth="1.25" strokeDasharray="3.2 1.4" strokeLinecap="round" />
      <path d="M10 6v4l2.5 1.5" stroke="#757575" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Project card ───────────────────────────────────────────────────────────
export function ProjectCard({ title, eyebrow, description, tags, readTime, href, thumbnailContent, comingSoon }: Project) {
  /** Mirrors `hovered` for the handlers, which run outside React's render pass. */
  const hoveredRef = useRef(false);
  /** Pending un-hover, cancelled if the pointer lands on the card's other half. */
  const leaveTimer = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [hoverColor, setHoverColor] = useState<string>(PROJECT_HOVER_COLORS[0]);
  const [toastOpen, setToastOpen] = useState(false);
  const canHover = useCanPrimaryHover();
  const highlightBg = solidHighlight(hoverColor, 0.38);

  useEffect(() => () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
  }, []);

  const enter = () => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = 0;
    }
    // Only advance the colour on a fresh hover, never when crossing between the
    // artwork and the copy — a re-roll mid-card is the flicker this avoids.
    if (hoveredRef.current) return;
    hoveredRef.current = true;
    setHoverColor(nextProjectHoverColor());
    setHovered(true);
  };
  const leave = () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    // Deferred by a beat: leaving one half fires before entering the other, so an
    // immediate un-hover would blink the highlight off between them.
    leaveTimer.current = window.setTimeout(() => {
      leaveTimer.current = 0;
      hoveredRef.current = false;
      setHovered(false);
    }, 90);
  };

  // A coming-soon card is inert: no navigation, and none of the hover wiring
  // below, so `hovered` stays false and every hover style resolves to its
  // resting value. The tag on the cursor is what tells you where you are.
  const hoverProps = comingSoon ? {} : { onMouseEnter: enter, onMouseLeave: leave };

  /**
   * The artwork alone answers for a coming-soon card. The copy beneath it is
   * plain text — no tag on the cursor, no toast on tap — so nothing below the
   * card behaves like a link.
   */
  const comingSoonProps = comingSoon
    ? {
        'data-cursor-label': COMING_SOON_LABEL,
        // Touch has no hover to read the tag, so the same message arrives after
        // the tap instead. On a mouse the tag has already said it.
        onClick: canHover ? undefined : () => setToastOpen(true),
      }
    : {};

  const body = (
    <>
      {/* Outer card — white by default, fills with rotating BRYCE color on hover */}
      <div
        className="project-card-outer"
        {...hoverProps}
        {...comingSoonProps}
        style={{
          pointerEvents: 'auto',
          backgroundColor: hovered ? hoverColor : '#fdfbf9',
          transform: hovered ? 'scale(1.025)' : 'scale(1)',
          boxShadow: hovered
            ? '0px 6px 24px 0px rgba(0, 0, 0, 0.28)'
            : '0px 2px 12px 0px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '2px solid #000',
          overflow: 'hidden',
        }}>
          {thumbnailContent}
        </div>
      </div>

      {/* Text */}
      <div className="project-card-text">
        <div className="project-card-copy" {...hoverProps} style={{ pointerEvents: 'auto' }}>
          {eyebrow && (
            <p style={{
              fontFamily: "var(--font-battambang), sans-serif",
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: 'normal',
              letterSpacing: '-0.168px',
              color: '#141510',
              margin: '0 0 8px 0',
            }}>
              <span style={{
                backgroundColor: hovered ? highlightBg : 'transparent',
                borderRadius: '3px',
                padding: '0 2px',
                transition: 'background-color 0.18s ease',
              }}>
                {eyebrow}
              </span>
            </p>
          )}
          <h3 style={{
            fontFamily: "var(--font-battambang), sans-serif",
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '28px',
            letterSpacing: '-0.04em',
            color: '#000',
            margin: '0 0 8px 0',
          }}>
            <span style={{
              backgroundColor: hovered ? highlightBg : 'transparent',
              borderRadius: '3px',
              padding: '0 2px',
              transition: 'background-color 0.18s ease',
            }}>
              {title}
            </span>
          </h3>
          <p style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            letterSpacing: '-0.03em',
            color: '#141510',
            margin: '0 0 16px 0',
          }}>
            <span style={{
              backgroundColor: hovered ? highlightBg : 'transparent',
              borderRadius: '3px',
              transition: 'background-color 0.18s ease',
            }}>
              {description}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {tags.map(tag => (
            <Tag key={tag} label={tag} hovered={hovered} cardColor={hoverColor} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClockIcon />
          <span style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '18px',
            color: '#757575',
          }}>
            {readTime}
          </span>
        </div>
      </div>
    </>
  );

  if (comingSoon) {
    return (
      <>
        <div className="project-card-pair" style={{ pointerEvents: 'none' }}>
          {body}
        </div>
        <Toast
          message={COMING_SOON_LABEL}
          open={toastOpen}
          onDismiss={() => setToastOpen(false)}
        />
      </>
    );
  }

  return (
    <Link
      href={href ?? '#'}
      className="project-card-pair"
      style={{ textDecoration: 'none', pointerEvents: 'none' }}
    >
      {body}
    </Link>
  );
}
