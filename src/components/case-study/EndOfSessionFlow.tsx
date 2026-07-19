'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { CompletionWeekTrackerScreen } from './CompletionScreen';
import { MilestoneHeroScreen } from './MilestoneHeroScreen';
import { ReflectionScreen } from './ReflectionScreen';

type Phase = 'session' | 'reflection' | 'milestone' | 'completion';
type ExitStyle = 'none' | 'crossfade' | 'exit-up' | 'exit-continue';

type Layer = {
  id: number;
  phase: Phase;
  exiting: boolean;
  exitStyle: ExitStyle;
  /** Incoming crossfade layer — starts at opacity 0 until revealed. */
  fadeIn: boolean;
};

const PHASES: Phase[] = ['session', 'reflection', 'milestone', 'completion'];

const TOTAL_SECONDS = 25 * 60;
const CIRCUMFERENCE = 578.0530482605219;
const DEMO_REMAINING = 5;

const CROSSFADE_MS = 300;
const EXIT_UP_MS = 430;
const EXIT_CONTINUE_MS = 380;

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

function fmtTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function nextPhase(phase: Phase): Phase {
  return PHASES[(PHASES.indexOf(phase) + 1) % PHASES.length];
}

function SessionPlayerPhase({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete: () => void;
}) {
  const [remaining, setRemaining] = useState(DEMO_REMAINING);
  const [ringDone, setRingDone] = useState(false);
  const finished = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      finished.current = false;
      setRingDone(false);
      return;
    }
    finished.current = false;
    setRingDone(false);
    setRemaining(DEMO_REMAINING);
    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          // Snap ring to a true full fill, hold a beat, then advance
          setRingDone(true);
          if (!finished.current) {
            finished.current = true;
            window.setTimeout(() => onCompleteRef.current(), 480);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const elapsed = TOTAL_SECONDS - remaining;
  // Force a complete offset at 00:00 so no dark sliver remains (CSS transition
  // would otherwise still be catching up when we leave the screen).
  const dashOffset = ringDone ? CIRCUMFERENCE : (elapsed / TOTAL_SECONDS) * CIRCUMFERENCE;

  return (
    <div className="eos-session absolute inset-0 flex flex-col items-center justify-center bg-[rgb(2,1,1)] select-none">
      <div
        className="eos-music absolute top-8 left-1/2 -translate-x-1/2 flex h-14 items-center rounded-xl border border-[rgb(38,39,41)] px-4"
        style={{
          background: 'linear-gradient(215deg, rgba(140,140,140,0.2) 0%, rgba(43,43,43,0.2) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <svg className="shrink-0 fill-white" width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 3c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z" />
        </svg>
        <span className="mx-2 whitespace-nowrap text-[14px] font-medium text-white">Wandering Breeze</span>
        <svg className="shrink-0 fill-[rgb(160,160,160)]" width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>

      <div className="relative flex h-[190px] w-[190px] items-center justify-center">
        <svg viewBox="0 0 190 190" width="190" height="190" aria-hidden>
          <path
            d="m 95,3 a 92,92 0 1,0 0,184 a 92,92 0 1,0 0,-184"
            fill="none"
            stroke="#76BFFE"
            strokeWidth="5"
          />
          <path
            d="m 95,3 a 92,92 0 1,0 0,184 a 92,92 0 1,0 0,-184"
            fill="none"
            stroke="#39393d"
            strokeLinecap="square"
            strokeWidth="6"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: ringDone ? 'none' : 'stroke-dashoffset 0.9s linear',
            }}
          />
        </svg>
        <span className="absolute z-[1] text-center text-[36px] font-medium text-white">
          {fmtTime(remaining)}
        </span>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-5 pb-8 pt-5"
        style={{
          backgroundColor: 'rgba(5,3,3,0.8)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      >
        <div
          className="eos-sbtn flex h-12 w-[114px] items-center justify-center gap-1 rounded-full border border-[rgb(38,39,41)] text-[15px] font-medium text-white"
          style={{ backgroundImage: 'linear-gradient(215deg, rgb(26,26,26) 0%, rgb(9,9,9) 100%)' }}
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" className="fill-white" aria-hidden>
            <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z" />
          </svg>
          Pause
        </div>
        <div
          className="eos-sbtn flex h-12 w-[114px] items-center justify-center gap-1 rounded-full border border-[rgb(38,39,41)] text-[15px] font-medium text-white"
          style={{ backgroundImage: 'linear-gradient(215deg, rgb(26,26,26) 0%, rgb(9,9,9) 100%)' }}
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" className="fill-white" aria-hidden>
            <path d="M9 16.17 5.53 12.7a.9959.9959 0 0 0-1.41 0c-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41a.9959.9959 0 0 0-1.41 0L9 16.17z" />
          </svg>
          Finish
        </div>
      </div>
    </div>
  );
}

/**
 * Continuous end-of-session flow matching the HTML prototype milestone path.
 * Stable layer ids keep screens mounted through their exit transitions.
 */
export function EndOfSessionFlow() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const idRef = useRef(1);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 1, phase: 'session', exiting: false, exitStyle: 'none', fadeIn: false },
  ]);
  const [crossfadeReveal, setCrossfadeReveal] = useState(false);
  const advancing = useRef(false);
  const layersRef = useRef(layers);
  layersRef.current = layers;

  const resetToSession = useCallback(() => {
    advancing.current = false;
    setCrossfadeReveal(false);
    idRef.current += 1;
    setLayers([
      {
        id: idRef.current,
        phase: 'session',
        exiting: false,
        exitStyle: 'none',
        fadeIn: false,
      },
    ]);
  }, []);

  useEffect(() => {
    resetToSession();
  }, [inView, resetToSession]);

  const advance = useCallback(() => {
    if (!inView || advancing.current) return;
    const current = layersRef.current.find((l) => !l.exiting);
    if (!current) return;
    advancing.current = true;

    const from = current.phase;
    const to = nextPhase(from);

    // Session → reflection: overlapping ring crossfade (timer becomes check ring)
    if (from === 'session' && to === 'reflection') {
      idRef.current += 1;
      setCrossfadeReveal(false);
      setLayers([
        { ...current, exitStyle: 'crossfade', exiting: false, fadeIn: false },
        {
          id: idRef.current,
          phase: 'reflection',
          exiting: false,
          exitStyle: 'crossfade',
          fadeIn: true,
        },
      ]);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLayers((prev) =>
            prev.map((l) => (l.phase === 'session' ? { ...l, exiting: true } : l)),
          );
          setCrossfadeReveal(true);
        });
      });
      window.setTimeout(() => {
        setLayers((prev) =>
          prev
            .filter((l) => l.phase !== 'session')
            .map((l) =>
              l.phase === 'reflection'
                ? { ...l, exitStyle: 'none' as const, fadeIn: false, exiting: false }
                : l,
            ),
        );
        setCrossfadeReveal(false);
        advancing.current = false;
      }, CROSSFADE_MS + 40);
      return;
    }

    // Reflection → milestone: confirmed choice exits upward, then milestone enters
    if (from === 'reflection' && to === 'milestone') {
      setLayers((prev) =>
        prev.map((l) =>
          l.id === current.id ? { ...l, exiting: true, exitStyle: 'exit-up' } : l,
        ),
      );
      window.setTimeout(() => {
        idRef.current += 1;
        setLayers([
          {
            id: idRef.current,
            phase: 'milestone',
            exiting: false,
            exitStyle: 'none',
            fadeIn: false,
          },
        ]);
        advancing.current = false;
      }, EXIT_UP_MS);
      return;
    }

    // Milestone → completion / completion → session: Continue press, then slide up
    setLayers((prev) =>
      prev.map((l) =>
        l.id === current.id ? { ...l, exiting: true, exitStyle: 'exit-continue' } : l,
      ),
    );
    window.setTimeout(() => {
      idRef.current += 1;
      setLayers([
        {
          id: idRef.current,
          phase: to,
          exiting: false,
          exitStyle: 'none',
          fadeIn: false,
        },
      ]);
      advancing.current = false;
    }, EXIT_CONTINUE_MS);
  }, [inView]);

  const live = layers.find((l) => !l.exiting);
  const bgDark = live?.phase === 'session';

  return (
    <div ref={ref} className="w-full">
      <div
        className="eos-stage relative w-full overflow-hidden rounded-[16px]"
        style={{
          height: 680,
          background: bgDark ? 'rgb(2,1,1)' : '#f2f2f2',
          transition: `background ${CROSSFADE_MS}ms ease`,
        }}
        aria-label="Complete end of session flow — session player through completion"
      >
        {inView &&
          layers.map((layer, index) => {
            const isLive = live?.id === layer.id;
            let opacity = 1;
            let transform: string | undefined;
            let transition = 'none';

            if (layer.exitStyle === 'crossfade') {
              opacity = layer.fadeIn
                ? crossfadeReveal
                  ? 1
                  : 0
                : layer.exiting
                  ? 0
                  : 1;
              transition = `opacity ${CROSSFADE_MS}ms ease`;
            } else if (layer.exitStyle === 'exit-up') {
              opacity = layer.exiting ? 0 : 1;
              transform = layer.exiting ? 'translateY(-70px)' : 'translateY(0)';
              transition = layer.exiting
                ? 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.4, 0, 1, 1)'
                : 'none';
            } else if (layer.exitStyle === 'exit-continue') {
              opacity = layer.exiting ? 0 : 1;
              transform = layer.exiting ? 'translateY(-40px)' : 'translateY(0)';
              transition = layer.exiting
                ? `opacity ${EXIT_CONTINUE_MS}ms ease, transform ${EXIT_CONTINUE_MS}ms ease`
                : 'none';
            }

            return (
              <div
                key={layer.id}
                className="absolute inset-0"
                style={{
                  zIndex: index + 1,
                  opacity,
                  transform,
                  transition,
                  pointerEvents: 'none',
                }}
              >
                {layer.phase === 'session' ? (
                  <SessionPlayerPhase active={isLive && inView} onComplete={advance} />
                ) : null}
                {layer.phase === 'reflection' ? (
                  <ReflectionScreen
                    playOnce
                    embedded
                    autoSelectIndex={3}
                    onComplete={advance}
                  />
                ) : null}
                {layer.phase === 'milestone' ? (
                  <MilestoneHeroScreen playOnce embedded onComplete={advance} />
                ) : null}
                {layer.phase === 'completion' ? (
                  <CompletionWeekTrackerScreen playOnce embedded onComplete={advance} />
                ) : null}
              </div>
            );
          })}
      </div>
    </div>
  );
}
