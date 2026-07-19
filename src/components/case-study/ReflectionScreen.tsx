'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

const OPTIONS = [
  { id: '1', label: 'Really Distracted' },
  { id: '2', label: 'Pretty Distracted' },
  { id: '3', label: 'Mostly Focused' },
  { id: '4', label: 'Fully Locked In' },
] as const;

function useInView<T extends Element>(threshold = 0.3): [RefObject<T | null>, boolean] {
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

export type ReflectionScreenProps = {
  /** Play once and call onComplete instead of looping. */
  playOnce?: boolean;
  /** Auto-confirm this option index after buttons enter (0–3). */
  autoSelectIndex?: number;
  onComplete?: () => void;
  /** Fill parent without outer rounded card chrome (for continuous flows). */
  embedded?: boolean;
};

/**
 * Live personal reflection screen ported from the Focus Coach HTML prototype.
 * Loops the session-complete → stats → reflection entrance while in view.
 */
export function ReflectionScreen({
  playOnce = false,
  autoSelectIndex,
  onComplete,
  embedded = false,
}: ReflectionScreenProps = {}) {
  const [ref, inViewObserved] = useInView<HTMLDivElement>(0.25);
  const inView = playOnce || inViewObserved;
  const [run, setRun] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [circleFill, setCircleFill] = useState(false);
  const [circleSmall, setCircleSmall] = useState(false);
  const [checkDrawn, setCheckDrawn] = useState(false);
  const [titleShow, setTitleShow] = useState(false);
  const [titleSmall, setTitleSmall] = useState(false);
  const [statsShow, setStatsShow] = useState(false);
  const [stat1Pop, setStat1Pop] = useState(false);
  const [pipeShow, setPipeShow] = useState(false);
  const [stat2Pop, setStat2Pop] = useState(false);
  const [dividerShow, setDividerShow] = useState(false);
  const [reflShow, setReflShow] = useState(false);
  const [btnEntered, setBtnEntered] = useState([false, false, false, false]);
  const [confirming, setConfirming] = useState<number | null>(null);

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
      setCircleFill(false);
      setCircleSmall(false);
      setCheckDrawn(false);
      setTitleShow(false);
      setTitleSmall(false);
      setStatsShow(false);
      setStat1Pop(false);
      setPipeShow(false);
      setStat2Pop(false);
      setDividerShow(false);
      setReflShow(false);
      setBtnEntered([false, false, false, false]);
      setConfirming(null);
    }, 0);

    // Entrance ~40% slower; longer dwell before auto-select
    const t = (ms: number) => Math.round(ms * 1.4);

    later(() => setCircleFill(true), t(220));
    later(() => setCheckDrawn(true), t(880));
    later(() => setTitleShow(true), t(1240));
    later(() => {
      setCircleSmall(true);
      setTitleSmall(true);
    }, t(2060));
    later(() => setStatsShow(true), t(2400));
    later(() => setStat1Pop(true), t(2490));
    later(() => {
      setPipeShow(true);
      setStat2Pop(true);
    }, t(2700));
    later(() => setDividerShow(true), t(3200));
    later(() => setReflShow(true), t(3620));
    later(() => setBtnEntered([true, false, false, false]), t(4200));
    later(() => setBtnEntered([true, true, false, false]), t(4360));
    later(() => setBtnEntered([true, true, true, false]), t(4520));
    const buttonsIn = t(4680);
    later(() => setBtnEntered([true, true, true, true]), buttonsIn);

    if (playOnce && autoSelectIndex != null) {
      // Pause on the full options before confirming
      const confirmAt = buttonsIn + 2000;
      later(() => setConfirming(autoSelectIndex), confirmAt);
      later(() => onCompleteRef.current?.(), confirmAt + 900);
    } else if (playOnce) {
      later(() => onCompleteRef.current?.(), buttonsIn + 3200);
    } else {
      later(() => setRun((v) => v + 1), buttonsIn + 3600);
    }

    return () => timers.forEach(clearTimeout);
  }, [run, inView, playOnce, autoSelectIndex]);

  function onOptionClick(index: number) {
    if (!btnEntered[index] || confirming !== null) return;
    setConfirming(index);
    // After fill animation (~700ms), clear and let the loop continue
    window.setTimeout(() => setConfirming(null), 900);
  }

  const contentExpanded = titleShow || statsShow || reflShow;

  return (
    <div
      ref={ref}
      className={embedded ? 'absolute inset-0' : 'w-full flex justify-center'}
    >
      <div
        className={[
          'refl-stage relative w-full overflow-hidden bg-[#f7f8fa]',
          embedded ? 'h-full' : 'rounded-[16px]',
        ].join(' ')}
        style={embedded ? undefined : { height: 640 }}
        aria-label="Redesigned personal reflection screen"
      >
        <div
          className={[
            'refl-content refl-content-handoff flex w-full flex-col items-center px-4 sm:px-8',
            contentExpanded ? 'refl-content-expanded' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* Hero: checkmark + title */}
          <div className={`flex flex-col items-center ${titleShow ? 'gap-5 sm:gap-6' : 'gap-0'}`}>
            <div
              className={[
                'refl-circle',
                'handoff',
                circleFill ? 'fill' : '',
                circleSmall ? 'small' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <svg className="refl-check-svg" viewBox="0 0 100 100" aria-hidden>
                <path
                  className={`refl-check-path ${checkDrawn ? 'drawn' : ''}`}
                  pathLength={100}
                  d="M 21 52 L 41 70 L 79 32"
                />
              </svg>
            </div>
            <h2
              className={[
                'refl-session-title',
                titleShow ? 'show' : '',
                titleSmall ? 'small' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              Session Complete
            </h2>
          </div>

          {/* Stats */}
          <div className={`refl-stats-cloak ${statsShow ? 'show' : ''}`}>
            <div className="refl-stats">
              <div className={`refl-stat ${stat1Pop ? 'pop' : ''}`}>
                <span className="refl-stat-n">25</span>
                <span className="refl-stat-l">Min</span>
              </div>
              <div className={`refl-stat-pipe ${pipeShow ? 'show' : ''}`} />
              <div className={`refl-stat ${stat2Pop ? 'pop' : ''}`}>
                <span className="refl-stat-n">5</span>
                <span className="refl-stat-l">Check-Ins</span>
              </div>
            </div>
          </div>

          <div className={`refl-divider ${dividerShow ? 'show' : ''}`} />

          {/* Reflection */}
          <div className={`refl-cloak ${reflShow ? 'show' : ''}`}>
            <div className="refl-body">
              <p className="refl-question">During that session, how focused were you?</p>
              <div className="refl-btn-row">
                {OPTIONS.map((opt, index) => (
                  <button
                    key={`${run}-${opt.id}`}
                    type="button"
                    className={[
                      'refl-fbtn',
                      btnEntered[index] ? 'entered' : '',
                      confirming === index ? 'confirming' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onOptionClick(index)}
                    style={
                      btnEntered[index]
                        ? undefined
                        : { opacity: 0, transform: 'translateY(20px) scale(0.84)' }
                    }
                  >
                    <span className="refl-badge">{opt.id}</span>
                    <span className="refl-btn-label">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="refl-skip" tabIndex={-1}>
                skip &amp; discard
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Handoff layout: 190px ring starts dead-center, then content expands upward */
        .refl-content-handoff {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          max-width: 100%;
          padding-top: 0;
          padding-bottom: 0;
          transition:
            top 0.7s cubic-bezier(0.34, 1.42, 0.64, 1),
            transform 0.7s cubic-bezier(0.34, 1.42, 0.64, 1);
        }
        .refl-content-handoff.refl-content-expanded {
          top: 40px;
          transform: translate(-50%, 0);
          padding-bottom: 32px;
          max-height: calc(100% - 40px);
          overflow-y: auto;
        }
        .refl-circle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: transparent;
          border: 5px solid #76bffe;
          box-shadow: none;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition:
            background 0.6s ease,
            border-color 0.6s ease,
            box-shadow 0.65s ease,
            width 0.7s cubic-bezier(0.34, 1.42, 0.64, 1),
            height 0.7s cubic-bezier(0.34, 1.42, 0.64, 1);
        }
        /* Match the session timer ring exactly for the seamless handoff */
        .refl-circle.handoff {
          width: 190px;
          height: 190px;
        }
        .refl-circle.fill {
          background: #76bffe;
          border-color: #76bffe;
          box-shadow: 0 0 64px 10px rgba(118, 191, 254, 0.38);
        }
        .refl-circle.small {
          width: 104px;
          height: 104px;
          border-width: 0;
          box-shadow: 0 0 28px 5px rgba(118, 191, 254, 0.32);
        }
        .refl-circle.handoff.small {
          width: 128px;
          height: 128px;
        }
        .refl-check-svg {
          width: 52%;
          height: 52%;
          overflow: visible;
        }
        .refl-check-path {
          fill: none;
          stroke: #fff;
          stroke-width: 8;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          transition: stroke-dashoffset 0.56s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .refl-check-path.drawn {
          stroke-dashoffset: 0;
        }
        .refl-session-title {
          margin: 0;
          font-size: 40px;
          font-weight: 700;
          color: #0d0d0d;
          white-space: nowrap;
          opacity: 0;
          transform: translateY(10px);
          /* Keep out of layout until shown so the ring stays dead-center on handoff */
          max-height: 0;
          overflow: hidden;
          pointer-events: none;
          transition:
            opacity 0.5s ease,
            transform 0.5s ease,
            font-size 0.7s cubic-bezier(0.34, 1.42, 0.64, 1),
            max-height 0.5s ease;
        }
        .refl-session-title.show {
          opacity: 1;
          transform: translateY(0);
          max-height: 60px;
          pointer-events: auto;
        }
        .refl-session-title.small {
          font-size: 34px;
        }
        .refl-stats-cloak {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          transition: max-height 0.55s ease, opacity 0.45s ease;
        }
        .refl-stats-cloak.show {
          max-height: 90px;
          opacity: 1;
        }
        .refl-stats {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 0 4px;
        }
        .refl-stat {
          display: flex;
          align-items: baseline;
          gap: 6px;
          opacity: 0;
          transform: translateY(16px) scale(0.8);
        }
        .refl-stat.pop {
          animation: refl-stat-in 0.58s cubic-bezier(0.34, 1.62, 0.64, 1) forwards;
        }
        .refl-stat-n {
          font-size: 28px;
          font-weight: 800;
          color: #76bffe;
          line-height: 1;
        }
        .refl-stat-l {
          font-size: 14px;
          font-weight: 600;
          color: #5b5b5b;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .refl-stat-pipe {
          width: 1px;
          height: 26px;
          background: #5b5b5b;
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.28s ease;
        }
        .refl-stat-pipe.show {
          opacity: 1;
        }
        .refl-divider {
          height: 1px;
          background: #d8d8d8;
          width: min(570px, 100%);
          margin-top: 32px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .refl-divider.show {
          transform: scaleX(1);
        }
        .refl-cloak {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          transition: max-height 0.75s ease, opacity 0.55s ease;
        }
        .refl-cloak.show {
          max-height: 480px;
          opacity: 1;
        }
        .refl-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding-top: 32px;
          width: 100%;
        }
        .refl-question {
          margin: 0;
          font-size: 20px;
          font-weight: 500;
          color: #111;
          text-align: center;
        }
        .refl-btn-row {
          display: flex;
          gap: 12px;
          padding: 8px 4px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }
        .refl-fbtn {
          position: relative;
          width: 148px;
          background: #fff;
          border: 1.5px solid #d8d8d8;
          border-radius: 10px;
          box-shadow: 0 2px 0 0 #d8d8d8;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          color: #222;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 28px 12px;
          line-height: 1.35;
          outline: none;
        }
        .refl-fbtn.entered {
          opacity: 1;
          transform: scale(1);
          animation: refl-btn-pop 0.58s cubic-bezier(0.34, 1.62, 0.64, 1) forwards;
          transition:
            transform 0.2s cubic-bezier(0.34, 1.5, 0.64, 1),
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }
        .refl-fbtn.entered:hover:not(.confirming) {
          transform: scale(1.045);
          border-color: #b5b5b5;
          box-shadow: 0 3px 0 0 #c0c0c0, 0 5px 16px rgba(0, 0, 0, 0.07);
        }
        .refl-fbtn.entered.confirming {
          transform: scale(1) !important;
          border-color: #76bffe;
          box-shadow: 0 2px 0 0 #5aabf0;
          cursor: default;
        }
        .refl-fbtn::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 0;
          background: #76bffe;
          border-radius: 8.5px;
          transition: height 0.7s linear;
          z-index: 0;
          pointer-events: none;
        }
        .refl-fbtn.confirming::after {
          height: 100%;
        }
        .refl-btn-label {
          position: relative;
          z-index: 1;
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .refl-fbtn.confirming .refl-btn-label {
          color: #fff;
        }
        .refl-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid #d8d8d8;
          font-size: 14px;
          font-weight: 600;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          z-index: 3;
        }
        .refl-skip {
          background: none;
          border: none;
          font-size: 14px;
          font-weight: 500;
          color: #5b5b5b;
          cursor: default;
          padding: 2px 0;
        }
        @keyframes refl-stat-in {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes refl-btn-pop {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.84);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (max-width: 640px) {
          .refl-session-title {
            font-size: 28px;
          }
          .refl-session-title.small {
            font-size: 24px;
          }
          .refl-circle {
            width: 120px;
            height: 120px;
          }
          .refl-circle.small {
            width: 88px;
            height: 88px;
          }
          .refl-fbtn {
            width: auto;
            flex: 1 1 calc(50% - 6px);
            max-width: 200px;
            font-size: 13px;
            padding: 22px 10px;
          }
          .refl-question {
            font-size: 17px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .refl-circle,
          .refl-check-path,
          .refl-session-title,
          .refl-stats-cloak,
          .refl-stat,
          .refl-divider,
          .refl-cloak,
          .refl-fbtn {
            animation: none !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
