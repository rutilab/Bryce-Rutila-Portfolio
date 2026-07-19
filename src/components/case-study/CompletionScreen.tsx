'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

type Variant = 'week' | 'quote';

const ODO_CONFIGS = [
  { label: 'Sessions', start: 24, end: 25 },
  { label: 'Min', start: 83, end: 108 },
  { label: 'Check-ins', start: 57, end: 62 },
] as const;

const QUOTE =
  'The harder you try to prevent a thought, the more likely it is to pop into your head';

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

function digitColumns(startVal: number, endVal: number): number[][] {
  const startStr = String(startVal);
  const endStr = String(endVal);
  const len = Math.max(startStr.length, endStr.length);
  const paddedStart = startStr.padStart(len, '0');
  const paddedEnd = endStr.padStart(len, '0');

  return paddedEnd.split('').map((endDigit, colIdx) => {
    const startDigit = parseInt(paddedStart[colIdx] || '0', 10);
    const target = parseInt(endDigit, 10);
    const digits: number[] = [];
    for (let i = target; ; i -= 1) {
      if (i < 0) i = 9;
      digits.push(i);
      if (i === startDigit && digits.length > 1) break;
      if (digits.length > 14) break;
    }
    return digits;
  });
}

function QuoteIcon({ flipped }: { flipped?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        flexShrink: 0,
        marginBottom: flipped ? 0 : 12,
        marginTop: flipped ? 12 : 0,
        transform: flipped ? 'rotate(180deg)' : undefined,
      }}
    >
      <g transform="translate(2,2)" fill="#000">
        <path d="M8.66666667,0 C7.930287,0 7.33333333,0.596953667 7.33333333,1.33333333 L7.33333333,5.33333333 C7.33333333,6.069713 7.930287,6.66666667 8.66666667,6.66666667 C9.0348565,6.66666667 9.33333333,6.9651435 9.33333333,7.33333333 L9.33333333,8 C9.33333333,8.73637967 8.73637967,9.33333333 8,9.33333333 C7.63181017,9.33333333 7.33333333,9.63181017 7.33333333,10 L7.33333333,11.3333333 C7.33333333,11.7015232 7.63181017,12 8,12 C10.209139,12 12,10.209139 12,8 L12,1.33333333 C12,0.596953667 11.4030463,0 10.6666667,0 L8.66666667,0 Z" />
        <path d="M1.33333333,0 C0.596953667,0 0,0.596953667 0,1.33333333 L0,5.33333333 C0,6.069713 0.596953667,6.66666667 1.33333333,6.66666667 C1.70152317,6.66666667 2,6.9651435 2,7.33333333 L2,8 C2,8.73637967 1.40304633,9.33333333 0.666666667,9.33333333 C0.298476833,9.33333333 0,9.63181017 0,10 L0,11.3333333 C0,11.7015232 0.298476833,12 0.666666667,12 C2.87580567,12 4.66666667,10.209139 4.66666667,8 L4.66666667,1.33333333 C4.66666667,0.596953667 4.069713,0 3.33333333,0 L1.33333333,0 Z" />
      </g>
    </svg>
  );
}

export type CompletionScreenProps = {
  playOnce?: boolean;
  onComplete?: () => void;
  embedded?: boolean;
};

function CompletionScreen({
  variant,
  playOnce = false,
  onComplete,
  embedded = false,
}: { variant: Variant } & CompletionScreenProps) {
  const [ref, inViewObserved] = useInView<HTMLDivElement>(0.25);
  const inView = playOnce || inViewObserved;
  const [run, setRun] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [statsIn, setStatsIn] = useState(false);
  const [odoRolling, setOdoRolling] = useState([false, false, false]);
  const [weekIn, setWeekIn] = useState(false);
  const [mondayDone, setMondayDone] = useState(false);
  const [checkDrawn, setCheckDrawn] = useState(false);
  const [weekExpanded, setWeekExpanded] = useState(false);
  const [quoteIn, setQuoteIn] = useState(false);
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
      setStatsIn(false);
      setOdoRolling([false, false, false]);
      setWeekIn(false);
      setMondayDone(false);
      setCheckDrawn(false);
      setWeekExpanded(false);
      setQuoteIn(false);
      setShowContinue(false);
      setContinuePressing(false);
    }, 0);

    // Entrance timings ~10% slower
    const t = (ms: number) => Math.round(ms * 1.1);

    later(() => setStatsIn(true), t(100));
    const odoBase = t(300);
    later(() => setOdoRolling([true, false, false]), odoBase + t(60));
    later(() => setOdoRolling([true, true, false]), odoBase + t(400));
    later(() => setOdoRolling([true, true, true]), odoBase + t(740));

    const afterOdo = odoBase + t(740) + t(1500);
    const afterGap = afterOdo + t(300);

    if (variant === 'week') {
      later(() => setWeekIn(true), afterGap);
      later(() => setMondayDone(true), afterGap + t(350));
      later(() => setCheckDrawn(true), afterGap + t(430));
      later(() => setWeekExpanded(true), afterGap + t(930));
      const continueAt = afterGap + t(930) + t(640);
      later(() => setShowContinue(true), continueAt);
      if (playOnce) {
        later(() => setContinuePressing(true), continueAt + 1320);
        later(() => onCompleteRef.current?.(), continueAt + 1320 + 190);
      } else {
        later(() => setRun((v) => v + 1), continueAt + 2200);
      }
    } else {
      later(() => setQuoteIn(true), afterGap);
      const continueAt = afterGap + t(520);
      later(() => setShowContinue(true), continueAt);
      if (playOnce) {
        later(() => setContinuePressing(true), continueAt + 1320);
        later(() => onCompleteRef.current?.(), continueAt + 1320 + 190);
      } else {
        later(() => setRun((v) => v + 1), continueAt + 2200);
      }
    }

    return () => timers.forEach(clearTimeout);
  }, [run, inView, variant, playOnce]);

  return (
    <div
      ref={ref}
      className={embedded ? 'absolute inset-0 overflow-y-auto' : 'w-full flex justify-center'}
    >
      <div
        className={[
          'relative w-full overflow-hidden bg-[#f7f8fa]',
          embedded ? 'h-full' : 'rounded-[16px]',
        ].join(' ')}
        style={embedded ? undefined : { minHeight: variant === 'week' ? 520 : 480 }}
        aria-label={
          variant === 'week'
            ? 'Completion screen — week tracker variant'
            : 'Completion screen — course quote variant'
        }
      >
        <div
          className={[
            'rv-content flex w-full flex-col items-center justify-center gap-8 px-4',
            embedded
              ? 'rv-content-embedded sm:px-8'
              : 'sm:px-8',
          ].join(' ')}
          style={
            embedded
              ? undefined
              : { minHeight: variant === 'week' ? 520 : 480, paddingTop: 40, paddingBottom: 40 }
          }
        >
          {/* All Time Stats */}
          <div className={`rv-stats-card ${statsIn ? 'in' : ''}`}>
            <p className="rv-stats-header">All Time Stats</p>
            <div className="rv-stats-row">
              {ODO_CONFIGS.map((cfg, i) => {
                const columns = digitColumns(cfg.start, cfg.end);
                return (
                  <div key={cfg.label} style={{ display: 'contents' }}>
                    {i > 0 ? <div className="rv-divider" /> : null}
                    <div className="rv-stat">
                      <div className="rv-stat-ticker">
                        {columns.map((digits, colIdx) => (
                          <div key={`${run}-${cfg.label}-${colIdx}`} className="rv-odo-col">
                            <div
                              className="rv-odo-strip"
                              style={{
                                transform: odoRolling[i]
                                  ? 'translateY(0)'
                                  : `translateY(${-(digits.length - 1) * 1.05}em)`,
                                transition: odoRolling[i]
                                  ? 'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)'
                                  : 'none',
                              }}
                            >
                              {digits.map((d, di) => (
                                <span key={`${d}-${di}`} className="rv-odo-digit">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <span className="rv-stat-l">{cfg.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {variant === 'week' ? (
            <div className="relative w-full max-w-[408px]" style={{ height: 180 }}>
              <div
                className={[
                  'rv-week-card',
                  weekIn ? 'in' : '',
                  weekExpanded ? 'expanded' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="rv-week-card-top">
                  <div className="rv-days-row">
                    {(['M', 'Tu', 'W', 'Th', 'F'] as const).map((day, index) => {
                      const isMonday = index === 0;
                      const done = isMonday && mondayDone;
                      return (
                        <div key={day} className="rv-day-col">
                          <span
                            className="rv-day-lbl"
                            style={{ color: done ? '#76bffe' : '#c0c0c0' }}
                          >
                            {day}
                          </span>
                          <div
                            className="rv-day-circ"
                            style={{
                              background: done ? '#76bffe' : '#e5e5e5',
                            }}
                          >
                            {isMonday ? (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <polyline
                                  className={`rv-m-check ${checkDrawn ? 'drawn' : ''}`}
                                  points="20 6 9 17 4 12"
                                />
                              </svg>
                            ) : index === 4 ? (
                              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                                <path
                                  d="M12,3 C12.6666667,5.66666667 14,7.83333333 16,9.5 C18,11.1666667 19,13 19,15 C19,18.8659932 15.8659932,22 12,22 C8.13400679,22 5,18.8659932 5,15 C5,13.9181489 5.35088936,12.8654809 6,12 C6,13.3807119 7.11928813,14.5 8.5,14.5 C9.88071187,14.5 11,13.3807119 11,12 C11,10 9.5,9 9.5,7 C9.5,5.66666667 10.3333333,4.33333333 12,3"
                                  fill="none"
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                  strokeOpacity="0.8"
                                />
                              </svg>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="rv-week-card-bottom">
                  <svg width="100%" height="12" viewBox="0 0 404 12" fill="none" preserveAspectRatio="none">
                    <path
                      d="M 0 11 L 291 11 L 306 1 L 321 11 L 404 11"
                      stroke="#d8d8d8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="rv-week-msg-wrap">
                    <p className="rv-week-msg">Complete a session every day this week to earn a streak!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rv-quote-card ${quoteIn ? 'in' : ''}`}>
              <QuoteIcon />
              <p className="rv-quote-text">{QUOTE}</p>
              <QuoteIcon flipped />
            </div>
          )}

          {!embedded ? (
            <button
              type="button"
              tabIndex={-1}
              className={[
                'rv-continue',
                showContinue ? 'show' : '',
                continuePressing ? 'pressing' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden
            >
              Close Session
            </button>
          ) : null}
        </div>

        {embedded ? (
          <button
            type="button"
            tabIndex={-1}
            className={[
              'rv-continue',
              'rv-continue-docked',
              showContinue ? 'show' : '',
              continuePressing ? 'pressing' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden
          >
            Close Session
          </button>
        ) : null}
      </div>

      <style jsx>{`
        .rv-content-embedded {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          justify-content: center;
          padding-top: 24px;
          padding-bottom: 100px; /* clear docked Continue */
          box-sizing: border-box;
          overflow-y: auto;
        }
        .rv-stats-card {
          width: 100%;
          max-width: 408px;
          background: #fff;
          border: 2px solid #d8d8d8;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 0 20px;
          gap: 10px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.55s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .rv-stats-card.in {
          opacity: 1;
          transform: translateY(0);
        }
        .rv-stats-header {
          font-size: 12px;
          font-weight: 500;
          color: #000;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-align: center;
        }
        .rv-stats-row {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .rv-stat {
          display: flex;
          align-items: baseline;
          gap: 6px;
          padding: 0 12px;
        }
        .rv-stat-ticker {
          display: inline-flex;
          overflow: hidden;
          height: 1.05em;
          align-items: flex-start;
          font-size: 24px;
          font-weight: 800;
          color: #76bffe;
          line-height: 1.05;
        }
        .rv-odo-col {
          position: relative;
          overflow: hidden;
          height: 1.05em;
          width: 0.65em;
        }
        .rv-odo-strip {
          display: flex;
          flex-direction: column;
        }
        .rv-odo-digit {
          display: block;
          height: 1.05em;
          line-height: 1.05;
          text-align: center;
        }
        .rv-stat-l {
          font-size: 12px;
          font-weight: 600;
          color: #5b5b5b;
          letter-spacing: 0.29px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .rv-divider {
          width: 2px;
          height: 21px;
          background: #d8d8d8;
          flex-shrink: 0;
        }
        .rv-week-card {
          width: 100%;
          max-width: 408px;
          background: #fff;
          border: 2px solid #d8d8d8;
          border-radius: 16px 16px 0 0;
          overflow: hidden;
          height: 96px;
          position: relative;
          opacity: 0;
          transform: translateY(20px);
          transition:
            height 0.55s cubic-bezier(0.4, 0, 0.2, 1),
            border-radius 0.55s ease,
            opacity 0.45s ease,
            transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .rv-week-card.in {
          opacity: 1;
          transform: translateY(0);
        }
        .rv-week-card.expanded {
          height: 180px;
          border-radius: 16px;
        }
        .rv-week-card-top {
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rv-week-card-bottom {
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }
        .rv-days-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rv-day-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .rv-day-lbl {
          font-size: 14px;
          font-weight: 700;
          transition: color 0.3s ease;
        }
        .rv-day-circ {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.3s ease;
        }
        .rv-m-check {
          fill: none;
          stroke: #fff;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          transition: stroke-dashoffset 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .rv-m-check.drawn {
          stroke-dashoffset: 0;
        }
        .rv-week-msg-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 0;
        }
        .rv-week-msg {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          text-align: center;
          width: 249px;
          line-height: 1.4;
        }
        .rv-quote-card {
          width: 100%;
          max-width: 408px;
          background: #fff;
          border: 2px solid #d8d8d8;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 0;
          opacity: 0;
          transform: translateY(28px) scale(0.96);
          transition: opacity 0.6s ease, transform 0.7s cubic-bezier(0.34, 1.55, 0.64, 1);
        }
        .rv-quote-card.in {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .rv-quote-text {
          width: 296px;
          max-width: 90%;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.43px;
          line-height: 24px;
          color: #666;
          text-align: center;
        }
        .rv-continue {
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
        .rv-continue.rv-continue-docked {
          position: absolute;
          left: 50%;
          bottom: 40px;
          margin-top: 0;
          transform: translateX(-50%) translateY(10px);
          z-index: 5;
        }
        .rv-continue.show {
          opacity: 1;
          transform: translateY(0);
        }
        .rv-continue.rv-continue-docked.show {
          transform: translateX(-50%) translateY(0);
        }
        .rv-continue.pressing {
          filter: brightness(0.92);
          transition: transform 0.12s ease, filter 0.12s ease;
        }
        .rv-continue.rv-continue-docked.pressing {
          transform: translateX(-50%) translateY(0) scale(0.96);
        }
        .rv-continue:not(.rv-continue-docked).pressing {
          transform: translateY(0) scale(0.96);
        }
      `}</style>
    </div>
  );
}

/** Completion screen — week tracker variant (from the Focus Coach HTML prototype). */
export function CompletionWeekTrackerScreen(props: CompletionScreenProps = {}) {
  return <CompletionScreen variant="week" {...props} />;
}

/** Completion screen — course quote variant (from the Focus Coach HTML prototype). */
export function CompletionQuoteScreen(props: CompletionScreenProps = {}) {
  return <CompletionScreen variant="quote" {...props} />;
}
