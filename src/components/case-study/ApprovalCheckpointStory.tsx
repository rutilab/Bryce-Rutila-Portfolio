'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

const INK = '#272727';
const BLUE = '#73B9EA';
const BACKGROUND = '#EDF4FC';

type TeacherCardProps = {
  x: number;
  y: number;
  className?: string;
  approval?: boolean;
  style?: CSSProperties;
};

function TeacherCard({ x, y, className, approval = false, style }: TeacherCardProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className} style={style}>
        <rect width="60" height="72" rx="14" fill="#FFFFFF" stroke={INK} strokeWidth="4" vectorEffect="non-scaling-stroke" />
        {approval && <rect className="ia-selected-fill" width="60" height="72" rx="14" fill={BLUE} />}

        <g className={approval ? 'ia-selected-person' : undefined}>
          <circle cx="30" cy="25" r="8" fill="none" stroke={INK} strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
          <path
            d="M16 52C18.5 42.5 41.5 42.5 44 52"
            fill="none"
            stroke={INK}
            strokeWidth="3.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>

        {approval && (
          <path
            className="ia-selected-check"
            d="M16 37L26.5 47.5L45 26"
            fill="none"
            stroke={INK}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </g>
    </g>
  );
}

const waitingCards = [
  { x: 512, y: 210, shiftX: 75, shiftY: 0 },
  { x: 587, y: 210, shiftX: 75, shiftY: 0 },
  { x: 474, y: 305, shiftX: 38, shiftY: -95 },
  { x: 549, y: 305, shiftX: -75, shiftY: 0 },
  { x: 624, y: 305, shiftX: -75, shiftY: 0 },
  { x: 699, y: 305, shiftX: -75, shiftY: 0 },
] as const;

export function ApprovalCheckpointStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="ia-story" data-active={isActive}>
      <style>{`
        .ia-story {
          --ia-duration: 16s;
          background: ${BACKGROUND};
        }

        .ia-story svg {
          display: block;
          width: 100%;
          height: auto;
        }

        .ia-stage-label {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          font-size: 15px;
          font-weight: 650;
          letter-spacing: 2.4px;
          fill: ${INK};
          text-anchor: middle;
        }

        @media (max-width: 767px) {
          .ia-story [vector-effect='non-scaling-stroke'] {
            vector-effect: none;
          }

          .ia-stage-label {
            font-size: 24px;
            letter-spacing: 3.6px;
          }
        }

        @media (max-width: 480px) {
          .ia-stage-label {
            font-size: 40px;
            letter-spacing: 5px;
          }
        }

        .ia-manual-label,
        .ia-approved-label,
        .ia-review-tool,
        .ia-gate,
        .ia-selected-card,
        .ia-selected-fill,
        .ia-selected-check {
          opacity: 0;
        }

        .ia-queue-card,
        .ia-queue-front,
        .ia-queue-new,
        .ia-selected-card,
        .ia-review-tool,
        .ia-gate,
        .ia-gate-arm {
          transform-box: fill-box;
        }

        .ia-queue-card,
        .ia-queue-front,
        .ia-queue-new,
        .ia-selected-card,
        .ia-review-tool {
          transform-origin: center;
        }

        .ia-gate-arm {
          transform-origin: left center;
        }

        .ia-selected-check {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          visibility: hidden;
        }

        .ia-story[data-active='true'] .ia-queue-card {
          animation: ia-queue-advance var(--ia-duration) cubic-bezier(.45, .05, .2, 1) infinite both;
        }

        .ia-story[data-active='true'] .ia-queue-front {
          animation: ia-queue-front var(--ia-duration) cubic-bezier(.45, .05, .2, 1) infinite both;
        }

        .ia-story[data-active='true'] .ia-queue-new {
          animation: ia-queue-new var(--ia-duration) cubic-bezier(.45, .05, .2, 1) infinite both;
        }

        .ia-story[data-active='true'] .ia-selected-card {
          animation: ia-selected-card var(--ia-duration) cubic-bezier(.45, .05, .2, 1) infinite both;
          will-change: transform, opacity;
        }

        .ia-story[data-active='true'] .ia-waiting-label {
          animation: ia-waiting-label var(--ia-duration) ease-in-out infinite both;
        }

        .ia-story[data-active='true'] .ia-manual-label {
          animation: ia-manual-label var(--ia-duration) ease-in-out infinite both;
        }

        .ia-story[data-active='true'] .ia-approved-label {
          animation: ia-approved-label var(--ia-duration) ease-in-out infinite both;
        }

        .ia-story[data-active='true'] .ia-review-tool {
          animation: ia-review-tool var(--ia-duration) ease-in-out infinite both;
          will-change: transform, opacity;
        }

        .ia-story[data-active='true'] .ia-gate {
          animation: ia-gate var(--ia-duration) ease-in-out infinite both;
          will-change: transform, opacity;
        }

        .ia-story[data-active='true'] .ia-gate-arm {
          animation: ia-gate-arm var(--ia-duration) cubic-bezier(.34, 1.2, .64, 1) infinite both;
          will-change: transform;
        }

        .ia-story[data-active='true'] .ia-selected-fill {
          animation: ia-selected-fill var(--ia-duration) ease-in-out infinite both;
        }

        .ia-story[data-active='true'] .ia-selected-person {
          animation: ia-selected-person var(--ia-duration) ease-in-out infinite both;
        }

        .ia-story[data-active='true'] .ia-selected-check {
          animation: ia-selected-check var(--ia-duration) ease-out infinite both;
        }

        @keyframes ia-queue-advance {
          0%, 4% { opacity: 1; transform: translate(0, 0); }
          12%, 20% { opacity: 1; transform: translate(var(--ia-shift-x), var(--ia-shift-y)); }
          26%, 97% { opacity: 0; transform: translate(var(--ia-shift-x), var(--ia-shift-y)); }
          98% { opacity: 0; transform: translate(0, 0); }
          100% { opacity: 1; transform: translate(0, 0); }
        }

        @keyframes ia-queue-front {
          0%, 4% { opacity: 1; transform: translate(0, 0); }
          12%, 14% { opacity: 1; transform: translate(75px, 0); }
          17%, 97% { opacity: 0; transform: translate(75px, 0); }
          98% { opacity: 0; transform: translate(0, 0); }
          100% { opacity: 1; transform: translate(0, 0); }
        }

        @keyframes ia-queue-new {
          0%, 4% { opacity: 0; transform: translate(75px, 0); }
          12%, 20% { opacity: 1; transform: translate(0, 0); }
          26%, 97% { opacity: 0; transform: translate(0, 0); }
          98%, 100% { opacity: 0; transform: translate(75px, 0); }
        }

        @keyframes ia-selected-card {
          0%, 12% { opacity: 0; transform: translate(0, 0) scale(1); }
          15%, 18% { opacity: 1; transform: translate(0, 0) scale(1); }
          22% { opacity: 1; transform: translate(0, 0) scale(1.2); }
          32%, 48% { opacity: 1; transform: translate(-167px, 84px) scale(1.6); }
          56%, 70% { opacity: 1; transform: translate(-287px, 84px) scale(1.45); }
          80% { opacity: 1; transform: translate(-27px, 84px) scale(1.35); }
          86%, 98% { opacity: 1; transform: translate(-167px, 84px) scale(1.6); }
          100% { opacity: 0; transform: translate(-167px, 84px) scale(1.6); }
        }

        @keyframes ia-waiting-label {
          0%, 18% { opacity: 1; transform: translateY(0); }
          24%, 98% { opacity: 0; transform: translateY(-5px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes ia-manual-label {
          0%, 20% { opacity: 0; transform: translateY(5px); }
          26%, 58% { opacity: 1; transform: translateY(0); }
          64%, 100% { opacity: 0; transform: translateY(-5px); }
        }

        @keyframes ia-approved-label {
          0%, 83% { opacity: 0; transform: translateY(5px); }
          86%, 98% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }

        @keyframes ia-review-tool {
          0%, 29% { opacity: 0; transform: translate(-10px, 5px) scale(.82); }
          34% { opacity: 1; transform: translate(-10px, 0) scale(1); }
          39% { opacity: 1; transform: translate(11px, 0) scale(1); }
          44% { opacity: 1; transform: translate(-5px, 0) scale(1); }
          49% { opacity: 1; transform: translate(8px, 0) scale(1); }
          55% { opacity: 0; transform: translate(8px, 3px) scale(.92); }
          100% { opacity: 0; transform: translate(-10px, 5px) scale(.82); }
        }

        @keyframes ia-gate {
          0%, 60% { opacity: 0; transform: translateY(8px); }
          64%, 80% { opacity: 1; transform: translateY(0); }
          86%, 100% { opacity: 0; transform: translateY(0); }
        }

        @keyframes ia-gate-arm {
          0%, 68% { transform: rotate(0deg); }
          76% { transform: rotate(-59deg); }
          79%, 86% { transform: rotate(-54deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes ia-selected-fill {
          0%, 72% { opacity: 0; }
          80%, 100% { opacity: 1; }
        }

        @keyframes ia-selected-person {
          0%, 86% { opacity: 1; }
          90%, 100% { opacity: 0; }
        }

        @keyframes ia-selected-check {
          0%, 88% { opacity: 0; stroke-dashoffset: 100; visibility: hidden; }
          89% { opacity: 0; stroke-dashoffset: 100; visibility: visible; }
          90% { opacity: 1; stroke-dashoffset: 100; visibility: visible; }
          93%, 98% { opacity: 1; stroke-dashoffset: 0; visibility: visible; }
          100% { opacity: 0; stroke-dashoffset: 0; visibility: hidden; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ia-story * { animation: none !important; }
          .ia-queue-card,
          .ia-queue-front,
          .ia-queue-new,
          .ia-selected-card,
          .ia-waiting-label,
          .ia-manual-label,
          .ia-review-tool,
          .ia-gate { opacity: 0; }
          .ia-approved-label { opacity: 1; }
          .ia-selected-card { opacity: 1; transform: translate(-167px, 84px) scale(1.6); }
          .ia-selected-fill { opacity: 1; }
          .ia-selected-person { opacity: 0; }
          .ia-selected-check { opacity: 1; stroke-dashoffset: 0; visibility: visible; }
        }
      `}</style>

      <svg viewBox="0 0 1200 600" role="img" aria-labelledby="approval-story-title approval-story-description">
        <title id="approval-story-title">A teacher request moving through manual account approval</title>
        <desc id="approval-story-description">
          Seven teachers wait in line. A new teacher joins at the back as the line advances, then the first request is
          enlarged and reviewed with a magnifying glass. The approval gate opens, and the teacher card turns blue with
          a checkmark before the next line begins.
        </desc>

        <rect width="1200" height="600" fill={BACKGROUND} />

        <text className="ia-stage-label ia-waiting-label" x="600" y="108">TEACHERS WAITING</text>
        <text className="ia-stage-label ia-manual-label" x="600" y="108">MANUAL REVIEW</text>
        <text className="ia-stage-label ia-approved-label" x="600" y="108">ACCOUNT APPROVED</text>

        {waitingCards.map(({ x, y, shiftX, shiftY }) => (
          <TeacherCard
            key={`${x}-${y}`}
            x={x}
            y={y}
            className="ia-queue-card"
            style={{
              '--ia-shift-x': `${shiftX}px`,
              '--ia-shift-y': `${shiftY}px`,
            } as CSSProperties}
          />
        ))}

        <TeacherCard x={662} y={210} className="ia-queue-front" />
        <TeacherCard x={699} y={305} className="ia-queue-new" />
        <TeacherCard x={737} y={210} className="ia-selected-card" approval />

        <g transform="translate(546 238)">
          <g className="ia-review-tool">
            <circle cx="54" cy="54" r="37" fill="none" stroke={INK} strokeWidth="6" vectorEffect="non-scaling-stroke" />
            <path d="M81 81L111 111" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </g>
        </g>

        <g transform="translate(590 286)">
          <g className="ia-gate">
            <rect x="0" y="54" width="50" height="116" rx="12" fill="#FFFFFF" stroke={INK} strokeWidth="5" vectorEffect="non-scaling-stroke" />
            <circle cx="25" cy="72" r="12" fill={BLUE} stroke={INK} strokeWidth="4" vectorEffect="non-scaling-stroke" />

            <g className="ia-gate-arm">
              <rect x="25" y="57" width="190" height="30" rx="8" fill="#FFFFFF" stroke={INK} strokeWidth="5" vectorEffect="non-scaling-stroke" />
              <path d="M62 58L78 86M111 58L127 86M160 58L176 86" fill="none" stroke={INK} strokeWidth="4" vectorEffect="non-scaling-stroke" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
