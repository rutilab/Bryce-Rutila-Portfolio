'use client';

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

const DAYS = ['M', 'Tu', 'W', 'Th', 'F'] as const;

const SPARKLES = [
  { x: -24, y: -24, color: '#ff6a00', size: 5 },
  { x: 24, y: -24, color: '#ffb830', size: 6 },
  { x: -28, y: 6, color: '#ffd700', size: 4 },
  { x: 28, y: 6, color: '#ff6a00', size: 5 },
  { x: 0, y: -32, color: '#fe9f00', size: 4 },
  { x: 14, y: -28, color: '#ffd700', size: 3 },
];

function useInView<T extends Element>(threshold = 0.25): [RefObject<T | null>, boolean] {
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

/**
 * Live Focus Streak achievement screen ported from the Focus Coach HTML prototype.
 * Loops: flaming calendar → title → week card → Friday flame → expand → continue → restart.
 */
export function FocusStreakScreen() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  const [run, setRun] = useState(0);
  const [calendarHtml, setCalendarHtml] = useState('');
  const [calendarCss, setCalendarCss] = useState('');
  const [calEntering, setCalEntering] = useState(false);
  const [calVisible, setCalVisible] = useState(false);
  const [titleShow, setTitleShow] = useState(false);
  const [cardIn, setCardIn] = useState(false);
  const [flamePhase, setFlamePhase] = useState<'idle' | 'pop' | 'spin' | 'slam'>('idle');
  const [completedDays, setCompletedDays] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [calNonce, setCalNonce] = useState(0);

  // Exact copy of Flaming Calendar Updated.html — markup + CSS, not rebuilt
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/case-studies/focus-coach-achievements/focus-streak-calendar.html?v=4').then((r) => r.text()),
      fetch('/case-studies/focus-coach-achievements/focus-streak-calendar.css?v=4').then((r) => r.text()),
    ])
      .then(([html, css]) => {
        if (cancelled) return;
        setCalendarHtml(html);
        setCalendarCss(css);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
      setCalEntering(false);
      setCalVisible(false);
      setTitleShow(false);
      setCardIn(false);
      setFlamePhase('idle');
      setCompletedDays(0);
      setExpanded(false);
      setShowContinue(false);
      setCalNonce((n) => n + 1);
    }, 0);

    const t = (ms: number) => Math.round(ms * 1.1);

    later(() => setCalEntering(true), t(200));
    later(() => {
      setCalEntering(false);
      setCalVisible(true);
    }, t(1020));
    later(() => setTitleShow(true), t(1100));
    later(() => setCardIn(true), t(1320));
    later(() => setFlamePhase('pop'), t(1820));
    later(() => setFlamePhase('spin'), t(2040));
    later(() => setFlamePhase('slam'), t(2740));
    later(() => {
      for (let day = 1; day <= 5; day += 1) {
        later(() => setCompletedDays(day), (day - 1) * t(112));
      }
    }, t(2880));
    later(() => setFlamePhase('idle'), t(3160));
    later(() => setExpanded(true), t(3540));
    later(() => setShowContinue(true), t(3740));
    later(() => setRun((v) => v + 1), t(6800));

    return () => timers.forEach(clearTimeout);
  }, [run, inView]);

  return (
    <div ref={ref} className="w-full flex justify-center">
      <div
        className="relative w-full overflow-hidden rounded-[16px] bg-[#f7f8fa]"
        style={{ minHeight: 680 }}
        aria-label="Focus Streak achievement screen"
      >
        <div className="flex w-full flex-col items-center gap-6 px-4 py-10 sm:px-8 sm:py-12">
          <div
            className={[
              'fs-cal-wrap',
              calEntering ? 'entering' : '',
              calVisible ? 'visible' : '',
              calVisible ? 'flames-on' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="relative flex items-center justify-center" style={{ width: 210, height: 254 }}>
              {/* Exact Flaming Calendar Updated.html fragment, scaled like the session-player prototype */}
              <div style={{ transform: 'scale(1.46)', transformOrigin: 'center center' }}>
                {calendarCss ? <style>{calendarCss}</style> : null}
                {calendarHtml ? (
                  <div key={calNonce} dangerouslySetInnerHTML={{ __html: calendarHtml }} />
                ) : (
                  <div style={{ width: 144, height: 174 }} aria-hidden />
                )}
              </div>
            </div>
          </div>

          <p className={`fs-title ${titleShow ? 'show' : ''}`}>You completed a focus streak!</p>

          <div className="relative flex w-full max-w-[408px] items-start justify-center" style={{ height: 180 }}>
            <div
              className={[
                'fs-week-card',
                cardIn ? 'in' : '',
                expanded ? 'expanded' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="flex h-[96px] items-center justify-center">
                <div className="flex items-center gap-3">
                  {DAYS.map((day, index) => {
                    const wasDone = index < 4;
                    const impacted = index < completedDays;
                    const isFriday = index === 4;
                    return (
                      <div key={day} className="flex flex-col items-center gap-1.5">
                        <span
                          className="text-[14px] font-bold transition-colors duration-300"
                          style={{ color: impacted ? '#ff6a00' : wasDone ? '#76bffe' : '#c0c0c0' }}
                        >
                          {day}
                        </span>
                        <div
                          className={`relative flex size-10 shrink-0 items-center justify-center rounded-full ${
                            impacted ? 'fs-impact' : ''
                          }`}
                          style={{
                            background: impacted ? '#ff6a00' : wasDone ? '#76bffe' : '#d8d8d8',
                            transition: 'background 0.3s ease',
                          }}
                        >
                          {isFriday && !impacted ? (
                            <span className={`fs-flame fs-flame-${flamePhase}`}>
                              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                                <path
                                  d="M12,3 C12.6666667,5.66666667 14,7.83333333 16,9.5 C18,11.1666667 19,13 19,15 C19,18.8659932 15.8659932,22 12,22 C8.13400679,22 5,18.8659932 5,15 C5,13.9181489 5.35088936,12.8654809 6,12 C6,13.3807119 7.11928813,14.5 8.5,14.5 C9.88071187,14.5 11,13.3807119 11,12 C11,10 9.5,9 9.5,7 C9.5,5.66666667 10.3333333,4.33333333 12,3"
                                  fill={flamePhase === 'idle' ? 'none' : '#ff6a00'}
                                  stroke="#fff"
                                  strokeWidth="1.5"
                                  strokeOpacity={flamePhase === 'idle' ? 0.8 : 0}
                                />
                              </svg>
                            </span>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <polyline
                                stroke="#fff"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points="20 6 9 17 4 12"
                              />
                            </svg>
                          )}
                          {impacted
                            ? SPARKLES.map((sparkle, i) => (
                                <span
                                  key={`${run}-${day}-${i}`}
                                  className="fs-sparkle"
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
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-stretch">
                <svg width="100%" height="12" viewBox="0 0 404 12" fill="none" preserveAspectRatio="none">
                  <path
                    d="M 0 11 L 291 11 L 306 1 L 321 11 L 404 11"
                    stroke="#d8d8d8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex items-center justify-center px-5 py-4">
                  <p className="w-[249px] text-center text-[14px] font-semibold leading-[1.4] text-[#666]">
                    Nice job completing a session every day this week!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            tabIndex={-1}
            className={`fs-continue ${showContinue ? 'show' : ''}`}
            aria-hidden
          >
            Continue
          </button>
        </div>
      </div>

      <style jsx>{`
        .fs-cal-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
        }
        .fs-cal-wrap.entering {
          animation: fs-mountain-in 0.78s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
        }
        .fs-cal-wrap.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        /* Pause flame/ember transforms during entrance so they don't fight the wrap's scale animation */
        .fs-cal-wrap:not(.flames-on) :global(#flame-peaks),
        .fs-cal-wrap:not(.flames-on) :global(#flame-yellow),
        .fs-cal-wrap:not(.flames-on) :global(.ember) {
          animation-play-state: paused !important;
        }
        .fs-title {
          font-size: 20px;
          font-weight: 600;
          color: #000;
          text-align: center;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .fs-title.show {
          opacity: 1;
          transform: translateY(0);
        }
        .fs-week-card {
          width: 100%;
          max-width: 408px;
          background: #fff;
          border: 2px solid #d8d8d8;
          border-radius: 16px 16px 0 0;
          overflow: hidden;
          height: 96px;
          position: relative;
          opacity: 0;
          transform: translateY(16px);
          transition:
            height 0.55s cubic-bezier(0.4, 0, 0.2, 1),
            border-radius 0.55s ease,
            opacity 0.45s ease,
            transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .fs-week-card.in {
          opacity: 1;
          transform: translateY(0);
        }
        .fs-week-card.expanded {
          height: 180px;
          border-radius: 16px;
        }
        .fs-flame {
          display: flex;
          width: 24px;
          height: 24px;
          align-items: center;
          justify-content: center;
          transform-origin: center;
        }
        .fs-flame-pop {
          animation: fs-flame-pop 0.22s cubic-bezier(0.34, 1.8, 0.64, 1) forwards;
        }
        .fs-flame-spin {
          animation: fs-flame-spin 0.7s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
        }
        .fs-flame-slam {
          animation: fs-flame-slam 0.28s cubic-bezier(0.34, 1.5, 0.64, 1) forwards;
        }
        .fs-impact {
          animation: fs-impact 0.45s cubic-bezier(0.34, 1, 0.64, 1) forwards;
        }
        .fs-sparkle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          left: 50%;
          top: 50%;
          animation: fs-spark 0.62s cubic-bezier(0, 0.9, 0.57, 1) forwards;
        }
        .fs-continue {
          margin-top: 8px;
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
        .fs-continue.show {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes fs-mountain-in {
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
        @keyframes fs-flame-pop {
          0% {
            transform: scale(1) translateY(0);
          }
          100% {
            transform: scale(1.35) translateY(-8px);
          }
        }
        @keyframes fs-flame-spin {
          0% {
            transform: scale(1.35) translateY(-8px) perspective(120px) rotateY(0deg);
          }
          100% {
            transform: scale(1.35) translateY(-8px) perspective(120px) rotateY(720deg);
          }
        }
        @keyframes fs-flame-slam {
          0% {
            transform: scale(1.35) translateY(-8px);
          }
          50% {
            transform: scale(0.88) translateY(3px);
          }
          78% {
            transform: scale(1.07) translateY(-1px);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fs-impact {
          0% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.42);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes fs-spark {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--spark-x)), calc(-50% + var(--spark-y))) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
