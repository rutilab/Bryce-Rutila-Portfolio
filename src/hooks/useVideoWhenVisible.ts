'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Plays a muted card video only while it is worth playing: on screen, and in a
 * tab someone is actually looking at. Everything else is a paused first frame.
 *
 * Lifted out of DisccThumbnail when a second and third video card arrived —
 * three copies of an IntersectionObserver is three chances for one of them to
 * quietly stop pausing.
 */
export function useVideoWhenVisible(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Someone who has asked for less motion gets the poster frame and nothing
    // more — the card still reads, it just doesn't move.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /** True only while the card is on screen AND the tab is frontmost. */
    let onScreen = false;

    const sync = () => {
      if (onScreen && !document.hidden) {
        // Rejects if the browser declines autoplay; muted + playsInline should
        // satisfy every current policy, and the poster covers us if not.
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      // Any sliver on screen counts — the card is tall, and waiting for a
      // fraction of it would leave the video frozen through the scroll in.
      { threshold: 0 },
    );
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [ref]);
}
