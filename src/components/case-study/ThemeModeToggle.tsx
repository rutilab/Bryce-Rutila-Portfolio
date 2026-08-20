'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DarkMode from '@mui/icons-material/DarkMode';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightMode from '@mui/icons-material/LightMode';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';

export type ThemeMode = 'light' | 'dark';

/** Finding Focus blue — the accent used across all Finding Focus case studies */
const ACCENT = '#006efe';

/** Remembers, across visits and case studies, that the callout has done its job. */
const CALLOUT_STORAGE_KEY = 'bar9000:theme-toggle-callout-seen';

/**
 * A page can hold several toggles (one per themed card). The callout is a
 * first-visit introduction to the control, not a per-card label, so the first
 * toggle to scroll into view claims it and the rest stay quiet.
 */
let calloutClaimed = false;

function calloutAlreadySeen() {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(CALLOUT_STORAGE_KEY) === '1';
  } catch {
    // private mode / storage disabled: show it this session rather than never
    return false;
  }
}

function rememberCalloutSeen() {
  try {
    window.localStorage.setItem(CALLOUT_STORAGE_KEY, '1');
  } catch {
    /* nothing to remember it with — fine, it stays dismissed for this session */
  }
}

/**
 * First-visit feature callout for the light/dark control.
 *
 * Shows once, ever: the first time any theme toggle — on this case study or any
 * future one — scrolls into view. It leaves for good on the X, on scrolling past
 * the button, or as soon as the reader uses the toggle themselves, since at that
 * point it has nothing left to point out.
 */
function useThemeToggleCallout(anchorRef: React.RefObject<HTMLElement | null>) {
  const [showCallout, setShowCallout] = useState(false);
  const [entered, setEntered] = useState(false);
  /** Guards against re-showing after dismissal while the observer is still live. */
  const doneRef = useRef(false);

  const dismissCallout = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    rememberCalloutSeen();
    setEntered(false);
    // let the fade finish before the bubble leaves the tree
    window.setTimeout(() => setShowCallout(false), 200);
  }, []);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el || calloutClaimed || calloutAlreadySeen()) return;

    calloutClaimed = true;
    let shown = false;
    let enterTimer = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (doneRef.current) return;
        if (entry.isIntersecting) {
          if (shown) return;
          shown = true;
          setShowCallout(true);
          // one frame at the start position, so the transition has something to run from
          enterTimer = window.setTimeout(() => setEntered(true), 60);
        } else if (shown) {
          // scrolled past (either direction) — it had its chance
          dismissCallout();
        }
      },
      { threshold: 0.9 },
    );

    io.observe(el);
    return () => {
      window.clearTimeout(enterTimer);
      io.disconnect();
      // let a remount (route change, HMR) claim it again if it never showed
      if (!shown) calloutClaimed = false;
    };
  }, [anchorRef, dismissCallout]);

  return { showCallout, calloutEntered: entered, dismissCallout };
}

/**
 * Sun/moon control that swaps the card's assets between modes.
 * Shows an outline icon of the mode you'll switch *to*, fills it on hover/focus,
 * and reveals a matching tooltip. Matches the white media-control chrome used by
 * the ImageViewer arrows elsewhere on the page.
 */
export function ThemeModeToggle({
  mode,
  onToggle,
}: {
  mode: ThemeMode;
  onToggle: () => void;
}) {
  const [active, setActive] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { showCallout, calloutEntered, dismissCallout } = useThemeToggleCallout(wrapRef);
  const goingDark = mode === 'light';
  const label = goingDark ? 'View dark mode' : 'View light mode';
  const OutlineIcon = goingDark ? DarkModeOutlined : LightModeOutlined;
  const FilledIcon = goingDark ? DarkMode : LightMode;

  return (
    <div className="relative flex justify-end" ref={wrapRef}>
      <button
        type="button"
        onClick={() => {
          dismissCallout();
          onToggle();
        }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        aria-label={label}
        className="inline-flex items-center justify-center rounded-full focus-visible:outline-none"
        style={{
          padding: 4,
          /* same subtle ink wash the pill toggles use on hover */
          background: active ? '#f0f1f3' : '#ffffff',
          border: `1px solid ${active ? 'rgba(0,110,254,0.35)' : 'rgba(0,0,0,0.08)'}`,
          boxShadow: active ? '0 3px 12px rgba(0,110,254,0.20)' : '0 1px 4px rgba(0,0,0,0.10)',
          color: active ? ACCENT : '#555555',
          transform: active ? 'scale(1.06)' : 'scale(1)',
          transition:
            'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease',
        }}
      >
        {/* Crossfade outline → filled without shifting layout */}
        <span className="relative inline-flex" style={{ width: 18, height: 18 }}>
          <OutlineIcon
            sx={{ fontSize: 18, position: 'absolute', inset: 0, opacity: active ? 0 : 1, transition: 'opacity 0.18s ease' }}
          />
          <FilledIcon
            sx={{ fontSize: 18, position: 'absolute', inset: 0, opacity: active ? 1 : 0, transition: 'opacity 0.18s ease' }}
          />
        </span>
      </button>

      <span
        role="tooltip"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          whiteSpace: 'nowrap',
          background: '#111113',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 1,
          padding: '6px 9px',
          borderRadius: 7,
          pointerEvents: 'none',
          boxShadow: '0 6px 18px rgba(0,0,0,0.20)',
          // the callout owns this spot while it's up, so the two never stack
          opacity: active && !showCallout ? 1 : 0,
          transform: active ? 'translateY(0)' : 'translateY(-3px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          zIndex: 20,
        }}
      >
        {label}
      </span>

      {showCallout && (
        <div
          role="status"
          className="theme-toggle-callout"
          data-entered={calloutEntered}
          style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, zIndex: 30 }}
        >
          {/* caret, tucked under the button it points at */}
          <span className="theme-toggle-callout-caret" aria-hidden />
          <p className="theme-toggle-callout-copy">
            See these screens in light or dark mode
          </p>
          <button
            type="button"
            onClick={dismissCallout}
            aria-label="Dismiss tip"
            className="theme-toggle-callout-close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path
                d="M1 1l8 8M9 1l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
