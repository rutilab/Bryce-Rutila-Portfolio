'use client';

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

type NodeState = 'done' | 'next' | 'future';

const NODES: { label: string; left: number }[] = [
  { label: '1', left: 12 },
  { label: '5', left: 106 },
  { label: '10', left: 200 },
  { label: '25', left: 294 },
  { label: '50', left: 388 },
];

const SPARKLES = [
  { x: -24, y: -24, color: '#ff6a00', size: 5 },
  { x: 24, y: -24, color: '#ffb830', size: 6 },
  { x: -28, y: 6, color: '#ffd700', size: 4 },
  { x: 28, y: 6, color: '#ff6a00', size: 5 },
  { x: 0, y: -32, color: '#fe9f00', size: 4 },
  { x: 14, y: -28, color: '#ffd700', size: 3 },
];

function useInView<T extends Element>(threshold = 0.35): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function MilestoneMountain() {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/case-studies/focus-coach-achievements/milestone-mountain.svg')
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled) setSvg(text);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!svg) {
    return <div style={{ width: 264, height: 210 }} aria-hidden />;
  }

  return (
    <div
      className="ms-mountain-svg"
      // SVG includes its own cloud/flag keyframe animations
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export type MilestoneHeroScreenProps = {
  playOnce?: boolean;
  onComplete?: () => void;
  embedded?: boolean;
};

/**
 * Live Milestone achievement screen ported from the Focus Coach HTML prototype.
 * Loops while in view: mountain entrance → copy → progress fill → node 25 check → hold → restart.
 */
export function MilestoneHeroScreen({
  playOnce = false,
  onComplete,
  embedded = false,
}: MilestoneHeroScreenProps = {}) {
  const [ref, inViewObserved] = useInView<HTMLDivElement>(0.25);
  const inView = playOnce || inViewObserved;
  const [run, setRun] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const [mountainIn, setMountainIn] = useState(false);
  const [mountainVisible, setMountainVisible] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [fillWidth, setFillWidth] = useState(200);
  const [highlightWidth, setHighlightWidth] = useState(188);
  const [node25, setNode25] = useState<NodeState>('next');
  const [node50, setNode50] = useState<NodeState>('future');
  const [node25Pop, setNode25Pop] = useState(false);
  const [node25Check, setNode25Check] = useState(false);
  const [showSparks, setShowSparks] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [continuePressing, setContinuePressing] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setRun((v) => v + 1), 0);
    return () => clearTimeout(timer);
  }, [inView]);

  useEffect(() => {
    if (run === 0 || !inView) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (cb: () => void, delay: number) => {
      timers.push(setTimeout(cb, delay));
    };

    later(() => {
      setMountainIn(false);
      setMountainVisible(false);
      setShowLabel(false);
      setShowTitle(false);
      setShowProgress(false);
      setFillWidth(200);
      setHighlightWidth(188);
      setNode25('next');
      setNode50('future');
      setNode25Pop(false);
      setNode25Check(false);
      setShowSparks(false);
      setShowContinue(false);
      setContinuePressing(false);
    }, 0);

    // Mountain SVG entrance — keep original pace
    later(() => setMountainIn(true), 120);
    later(() => {
      setMountainIn(false);
      setMountainVisible(true);
    }, 776);

    // Non-SVG assets ~50% slower so the sequence can breathe
    const s = (ms: number) => Math.round(ms * 1.5);
    later(() => setShowLabel(true), s(776));
    later(() => setShowTitle(true), s(886));
    later(() => setShowProgress(true), s(1186));
    later(() => {
      setFillWidth(294);
      setHighlightWidth(282);
    }, s(1266));
    later(() => {
      setNode25('done');
      setNode25Pop(true);
    }, s(2386));
    later(() => {
      setNode25Check(true);
      setShowSparks(true);
    }, s(2586));
    later(() => {
      setNode50('next');
    }, s(2936));
    const continueAt = s(3336);
    later(() => setShowContinue(true), continueAt);
    if (playOnce) {
      later(() => setContinuePressing(true), continueAt + 1600);
      later(() => onCompleteRef.current?.(), continueAt + 1600 + 190);
    } else {
      later(() => setRun((v) => v + 1), continueAt + 2800);
    }

    return () => timers.forEach(clearTimeout);
  }, [run, inView, playOnce]);

  const nodeState = (index: number): NodeState => {
    if (index < 3) return 'done';
    if (index === 3) return node25;
    return node50;
  };

  return (
    <div
      ref={ref}
      className={embedded ? 'absolute inset-0 overflow-y-auto' : 'w-full flex justify-center'}
    >
      <div
        className={[
          'relative w-full overflow-hidden bg-[#f0f1f2]',
          embedded ? 'h-full max-w-none' : 'max-w-[960px] rounded-[24px]',
        ].join(' ')}
        style={embedded ? undefined : { minHeight: 560 }}
        aria-label="Milestone achievement screen — 25 sessions completed"
      >
        <div
          className={[
            'flex flex-col items-center px-6',
            embedded ? 'pt-10 pb-[100px] sm:pt-12' : 'py-12 sm:py-16',
          ].join(' ')}
        >
          <div
            className={`ms-mountain-wrap ${mountainIn ? 'ms-entering' : ''} ${mountainVisible ? 'ms-visible' : ''}`}
          >
            <MilestoneMountain />
          </div>

          <p className={`ms-label ${showLabel ? 'ms-show' : ''}`}>Milestone</p>
          <p className={`ms-title ${showTitle ? 'ms-show' : ''}`}>25 Sessions Completed</p>

          <div className={`ms-progress-wrap ${showProgress ? 'ms-show' : ''}`}>
            <div className="ms-progress-meter">
              <div className="ms-track">
                <div className="ms-track-fill" style={{ width: fillWidth }} />
                <div className="ms-track-highlight" style={{ width: highlightWidth }} />
              </div>
              {NODES.map((node, index) => {
                const state = nodeState(index);
                const isPopping = index === 3 && node25Pop;
                const isChecked = index < 3 || (index === 3 && node25Check);
                return (
                  <div
                    key={node.label}
                    className={[
                      'ms-node',
                      state === 'done' ? 'ms-node-done' : '',
                      state === 'next' ? 'ms-node-next' : '',
                      state === 'future' ? 'ms-node-future' : '',
                      isPopping ? 'ms-node-pop' : '',
                      isChecked ? 'ms-check-drawn' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ left: node.left }}
                  >
                    {state === 'next' ? <div className="ms-node-next-ring" /> : null}
                    {state === 'done' ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <polyline
                          className="ms-check-path"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="3.5 8.5 6.5 11.5 12.5 4.5"
                        />
                      </svg>
                    ) : null}
                    <span
                      className={`ms-node-label ${
                        state === 'future' ? 'ms-node-label-future' : 'ms-node-label-done'
                      }`}
                    >
                      {node.label}
                    </span>
                    {index === 3 && showSparks
                      ? SPARKLES.map((sparkle, i) => (
                          <span
                            key={`${run}-${i}`}
                            className="ms-sparkle"
                            style={
                              {
                                width: sparkle.size * 2,
                                height: sparkle.size * 2,
                                background: sparkle.color,
                                '--spark-x': `${sparkle.x}px`,
                                '--spark-y': `${sparkle.y}px`,
                                animationDelay: `${i * 28}ms`,
                              } as CSSProperties
                            }
                          />
                        ))
                      : null}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            tabIndex={-1}
            className={[
              'ms-continue',
              embedded ? 'ms-continue-docked' : '',
              showContinue ? 'ms-show' : '',
              continuePressing ? 'ms-pressing' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden
          >
            Continue
          </button>
        </div>
      </div>

      <style jsx>{`
        .ms-mountain-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
        }
        .ms-mountain-wrap.ms-entering {
          animation: ms-mountain-in 0.624s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
        }
        .ms-mountain-wrap.ms-visible {
          opacity: 1;
        }
        .ms-mountain-svg :global(svg) {
          display: block;
          width: 264px;
          height: auto;
        }
        .ms-label {
          margin-top: 32px;
          font-size: 16px;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: #4fa0e6;
          text-transform: uppercase;
          text-align: center;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .ms-title {
          margin-top: 4px;
          font-size: 20px;
          font-weight: 700;
          color: #000;
          text-align: center;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .ms-label.ms-show,
        .ms-title.ms-show,
        .ms-progress-wrap.ms-show {
          opacity: 1;
          transform: translateY(0);
        }
        .ms-progress-wrap {
          margin-top: 24px;
          position: relative;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .ms-progress-meter {
          position: relative;
          width: 400px;
          height: 47px;
        }
        @media (max-width: 480px) {
          .ms-progress-wrap {
            transform: scale(0.82);
            transform-origin: top center;
          }
          .ms-progress-wrap.ms-show {
            transform: scale(0.82) translateY(0);
          }
        }
        .ms-track {
          position: absolute;
          top: 4px;
          left: 0;
          width: 100%;
          height: 16px;
          background: #e5e5e5;
          border-radius: 8px;
        }
        .ms-track-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: #76bffe;
          border-radius: 8px;
          transition: width 1.1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ms-track-highlight {
          position: absolute;
          top: 2px;
          left: 4px;
          height: 2px;
          background: #9ed2ff;
          border-radius: 1px;
          transition: width 1.1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ms-node {
          position: absolute;
          top: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateX(-12px);
          box-sizing: border-box;
          z-index: 2;
        }
        .ms-node-done {
          background: #4fa0e6;
        }
        .ms-node-next {
          background: #f2f2f2;
        }
        .ms-node-future {
          background: #f2f2f2;
          border: 1px solid #e5e5e5;
        }
        .ms-node-next-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px dashed #76bffe;
          box-sizing: border-box;
        }
        .ms-node-label {
          position: absolute;
          top: 30px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.33px;
          text-align: center;
          white-space: nowrap;
        }
        .ms-node-label-done {
          color: #4fa0e6;
        }
        .ms-node-label-future {
          color: #d8d8d8;
        }
        .ms-check-path {
          stroke-dasharray: 20;
          stroke-dashoffset: 20;
        }
        .ms-check-drawn .ms-check-path {
          animation: ms-check-draw 0.35s ease forwards;
        }
        .ms-node-pop {
          animation: ms-node-pop 0.45s cubic-bezier(0.34, 1.5, 0.64, 1) forwards;
        }
        .ms-sparkle {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 3;
          border-radius: 999px;
          pointer-events: none;
          animation: ms-sparkle 0.62s cubic-bezier(0, 0.9, 0.57, 1) forwards;
        }
        .ms-continue {
          margin-top: 40px;
          width: min(408px, 86vw);
          height: 48px;
          border: none;
          border-radius: 12px;
          background: #76bffe;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
          transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .ms-continue.ms-continue-docked {
          position: absolute;
          left: 50%;
          bottom: 40px;
          margin-top: 0;
          transform: translateX(-50%) translateY(10px);
          z-index: 5;
        }
        .ms-continue.ms-show {
          opacity: 1;
          transform: translateY(0);
        }
        .ms-continue.ms-continue-docked.ms-show {
          transform: translateX(-50%) translateY(0);
        }
        .ms-continue.ms-pressing {
          filter: brightness(0.92);
          transition: transform 0.12s ease, filter 0.12s ease;
        }
        .ms-continue.ms-continue-docked.ms-pressing {
          transform: translateX(-50%) translateY(0) scale(0.96);
        }
        .ms-continue:not(.ms-continue-docked).ms-pressing {
          transform: translateY(0) scale(0.96);
        }
        @keyframes ms-mountain-in {
          0% {
            opacity: 0;
            transform: scale(0.82) translateY(20px);
          }
          55% {
            opacity: 1;
          }
          75% {
            transform: scale(1.05) translateY(-5px);
          }
          90% {
            transform: scale(0.97) translateY(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes ms-node-pop {
          0% {
            transform: translateX(-12px) scale(1);
          }
          40% {
            transform: translateX(-12px) scale(1.3);
          }
          70% {
            transform: translateX(-12px) scale(0.92);
          }
          100% {
            transform: translateX(-12px) scale(1);
          }
        }
        @keyframes ms-check-draw {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes ms-sparkle {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(calc(-50% + var(--spark-x)), calc(-50% + var(--spark-y))) scale(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ms-mountain-wrap,
          .ms-label,
          .ms-title,
          .ms-progress-wrap,
          .ms-track-fill,
          .ms-track-highlight,
          .ms-node,
          .ms-sparkle,
          .ms-continue {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
