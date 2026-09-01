'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Scroll far enough to be a real intent, not a trackpad twitch or a bounce. */
const DISMISS_AT = 48;
/** Let the hero land first — the cue is an afterthought, not part of the entrance. */
const ENTER_DELAY = 1100;

/**
 * "There's more below" for the top of a case study.
 *
 * The heroes fill the fold with a single large media card, which reads as a
 * finished screen rather than the first of many — so the cue says out loud what
 * the layout doesn't. It arrives a beat after the page settles, and leaves for
 * good the moment the reader scrolls, having done its one job. Clicking it
 * scrolls too, for anyone who takes it as a button.
 *
 * The bookend to BackToTopButton, and gated the same way: mounted once for every
 * case-study route, and `#section-intro` is what marks a page as a case study
 * with a hero. Routes without one — the index, personal projects — never see it.
 *
 * Pages that mount it themselves rather than through the layout have already
 * decided they want it, so they pass `gateId={null}` and skip the check.
 */
export function ScrollCue({ gateId = 'section-intro' }: { gateId?: string | null } = {}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  /** Once the reader scrolls, the cue is spent — this keeps it from coming back. */
  const doneRef = useRef(false);

  useEffect(() => {
    if (gateId && !document.getElementById(gateId)) return;
    // Landing mid-page (a refresh, a #section link) means the reader is already
    // past the point of needing to be told, so the cue never shows at all.
    if (window.scrollY > DISMISS_AT) return;

    // Mount hidden first, then reveal on the next frame. Both steps have to be
    // async — a synchronous mount would leave nothing for the fade to start
    // from, and the cue would appear in one hard cut instead of rising in.
    let frame = 0;
    const timer = window.setTimeout(() => {
      if (doneRef.current) return;
      setMounted(true);
      frame = window.requestAnimationFrame(() => {
        if (!doneRef.current) setVisible(true);
      });
    }, ENTER_DELAY);

    const onScroll = () => {
      if (window.scrollY <= DISMISS_AT) return;
      doneRef.current = true;
      setVisible(false);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [gateId]);

  const scrollDown = useCallback(() => {
    doneRef.current = true;
    setVisible(false);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollBy({ top: window.innerHeight * 0.9, behavior: reduced ? 'auto' : 'smooth' });
  }, []);

  if (!mounted) return null;

  return (
    <div className="cs-scroll-cue-anchor">
      <button
        type="button"
        onClick={scrollDown}
        aria-label="Scroll down"
        className="cs-scroll-cue"
        data-visible={visible}
        tabIndex={visible ? 0 : -1}
      >
        <span className="cs-scroll-cue-label">Scroll</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="cs-scroll-cue-arrow">
          <path
            d="M7 2v10M7 12l-4-4M7 12l4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
