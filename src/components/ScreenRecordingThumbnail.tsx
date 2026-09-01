'use client';

import { useRef } from 'react';
import { useVideoWhenVisible } from '@/hooks/useVideoWhenVisible';

/**
 * A card thumbnail for landscape screen-recorded work. Muted H.264 with a
 * poster frame, playing only while it is on screen in a tab someone is looking
 * at — the same treatment as the Discc video.
 *
 * Full-bleed: the recording is the card, cropped to fill it, rather than a
 * scaled-down screen floating on a background. A wide capture inset into a
 * squarer card leaves most of the card empty and the work too small to read.
 */

/** Shows only until the poster paints, and behind any letterboxed edge. */
const STAGE = 'rgba(220, 232, 248, 0.45)';

export function ScreenRecordingThumbnail({
  src,
  poster,
  objectPosition = 'top center',
}: {
  src: string;
  poster: string;
  /** Which part of the capture survives the crop. */
  objectPosition?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoWhenVisible(videoRef);

  return (
    <div
      style={{
        position: 'absolute',
        // ProjectCard's inner container already supplies the white fill and the
        // black border, so insetting here would show a second ring.
        inset: 0,
        borderRadius: '10px',
        overflow: 'hidden',
        background: STAGE,
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition,
          display: 'block',
        }}
      />
    </div>
  );
}
