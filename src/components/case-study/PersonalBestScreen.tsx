'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

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

function PersonalBestRocket() {
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/case-studies/focus-coach-achievements/personal-best-rocket.svg?v=2')
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
    return <div style={{ width: 196, height: 283 }} aria-hidden />;
  }

  return (
    <div
      className="pb-rocket-svg"
      // SVG includes its own flame keyframe animations
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/**
 * Live Personal Best achievement screen ported from the Focus Coach HTML prototype.
 * Loops: rocket entrance → label → title → previous/new compare → hold → restart.
 */
export function PersonalBestScreen() {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);
  const [run, setRun] = useState(0);
  const [rocketEntering, setRocketEntering] = useState(false);
  const [rocketVisible, setRocketVisible] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

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
      setRocketEntering(false);
      setRocketVisible(false);
      setShowLabel(false);
      setShowTitle(false);
      setShowCompare(false);
      setShowContinue(false);
    }, 0);

    const t = (ms: number) => Math.round(ms * 1.1);

    later(() => setRocketEntering(true), t(120));
    later(() => {
      setRocketEntering(false);
      setRocketVisible(true);
    }, t(940));
    later(() => setShowLabel(true), t(940));
    later(() => setShowTitle(true), t(1050));
    later(() => setShowCompare(true), t(1210));
    later(() => setShowContinue(true), t(1610));
    later(() => setRun((v) => v + 1), t(5200));

    return () => timers.forEach(clearTimeout);
  }, [run, inView]);

  return (
    <div ref={ref} className="w-full flex justify-center">
      <div
        className="relative w-full overflow-hidden rounded-[16px] bg-[#f7f8fa]"
        style={{ minHeight: 620 }}
        aria-label="Personal Best achievement screen — longest session"
      >
        <div className="flex w-full flex-col items-center px-4 py-10 sm:px-8 sm:py-12">
          <div
            className={[
              'pb-rocket-wrap',
              rocketEntering ? 'entering' : '',
              rocketVisible ? 'visible' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <PersonalBestRocket />
          </div>

          <p className={`pb-label ${showLabel ? 'show' : ''}`}>Personal Best</p>
          <p className={`pb-title ${showTitle ? 'show' : ''}`}>Longest Session</p>

          <div className={`pb-compare ${showCompare ? 'show' : ''}`}>
            <div className="pb-box">
              <span className="pb-box-label">Previous</span>
              <span className="pb-box-value">35 min</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M2 8H14M9 3L14 8L9 13"
                stroke="#000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="pb-box pb-new">
              <span className="pb-box-label">New Best</span>
              <span className="pb-box-value">40 min</span>
            </div>
          </div>

          <button
            type="button"
            tabIndex={-1}
            className={`pb-continue ${showContinue ? 'show' : ''}`}
            aria-hidden
          >
            Continue
          </button>
        </div>
      </div>

      <style jsx>{`
        .pb-rocket-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          flex-shrink: 0;
        }
        .pb-rocket-wrap.entering {
          animation: pb-mountain-in 0.78s cubic-bezier(0.34, 1.1, 0.64, 1) forwards;
        }
        .pb-rocket-wrap.visible {
          opacity: 1;
        }
        .pb-rocket-svg :global(svg) {
          display: block;
          width: 196px;
          height: auto;
        }
        .pb-label {
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
        .pb-label.show {
          opacity: 1;
          transform: translateY(0);
        }
        .pb-title {
          margin-top: 4px;
          font-size: 20px;
          font-weight: 700;
          color: #000;
          text-align: center;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
        }
        .pb-title.show {
          opacity: 1;
          transform: translateY(0);
        }
        .pb-compare {
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1);
        }
        .pb-compare.show {
          opacity: 1;
          transform: translateY(0);
        }
        .pb-box {
          width: 132px;
          background: #eeeeee;
          border-radius: 8px;
          padding: 12px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          box-shadow: 0 0 0 2px #666666;
        }
        .pb-box.pb-new {
          background: #f1f7fb;
          box-shadow: 0 0 0 2px #4fa0e6;
        }
        .pb-box-label {
          font-size: 14px;
          font-weight: 400;
          color: #666666;
          text-align: center;
        }
        .pb-box-value {
          font-size: 16px;
          font-weight: 700;
          color: #666666;
          text-align: center;
        }
        .pb-box.pb-new .pb-box-label,
        .pb-box.pb-new .pb-box-value {
          color: #4fa0e6;
        }
        .pb-continue {
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
        .pb-continue.show {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes pb-mountain-in {
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
      `}</style>
    </div>
  );
}
