'use client';

import { useRef } from 'react';
import { useVideoWhenVisible } from '@/hooks/useVideoWhenVisible';

/**
 * Home page card thumbnail for the Discc case study.
 *
 * Two layers with distinct jobs: the leather texture is the *stage* — it fills
 * the card edge to edge and never moves — and the phone bezel is the *subject*,
 * floating above it on its own shadow.
 *
 * The bezel is a muted video rather than the GIF it was cut from. A GIF cannot
 * be paused — it animates from the moment it decodes until the tab closes — and
 * at 6MB it arrived only once you had already scrolled to it. The same footage
 * as H.264 is ~430KB at twice the resolution and twice the frame rate, small
 * enough to fetch eagerly while the BRYCE splash plays, and it can be stopped
 * when nobody is looking at it.
 */

const BEZEL_SRC = '/case-studies/discc/phone-bezel.mp4';
const BEZEL_POSTER = '/case-studies/discc/phone-bezel-poster.webp';

/** Intrinsic video dimensions — the device fills the frame with a small margin. */
const BEZEL_RATIO = '540 / 1104';

/**
 * The footage has opaque black corners, not transparent ones, so they'd read as
 * a dark rectangle behind the device. Clipping to the phone's own corner radius
 * removes them. Expressed as a horizontal/vertical percentage pair so the
 * ellipse stays circular in absolute terms at every card size — and, being
 * relative, it holds regardless of what resolution the asset is encoded at.
 */
const BEZEL_RADIUS = '18.1% / 8.8%';

/**
 * Sizing, all relative to the artwork box so it holds at every breakpoint:
 * the device stands 103% of the card's height and is nudged down by 6.8% of
 * its own height, which leaves ~4% headroom at the top and bleeds ~7% off the
 * bottom edge (≈33px on a full-width card) — a device propped in a sleeve,
 * running past the frame rather than sitting inside it.
 */
const BEZEL_HEIGHT = '103%';
const BEZEL_DROP = 'translateY(6.8%)';

export function DisccThumbnail() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoWhenVisible(videoRef);

  return (
    <div
      style={{
        position: 'absolute',
        // Full-bleed: ProjectCard's inner container already supplies the white
        // fill and black border. Insetting here would expose that white as a
        // second ring inside the card's own padding ring.
        inset: 0,
        borderRadius: '10px',
        overflow: 'hidden',
        // Leather stage
        backgroundImage: 'url(/case-studies/discc/case-background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Pool of light behind the device so it doesn't sit flat on the leather */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 55% 60% at 50% 55%, rgba(255,255,255,0.18), rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <video
        ref={videoRef}
        // No `autoPlay`: the observer above owns playback, so the video never
        // runs while it is off screen. `preload="auto"` still fetches it right
        // away — the card mounts behind the splash, which is the point.
        preload="auto"
        poster={BEZEL_POSTER}
        muted
        loop
        playsInline
        disablePictureInPicture
        aria-hidden
        style={{
          position: 'relative',
          display: 'block',
          height: BEZEL_HEIGHT,
          width: 'auto',
          aspectRatio: BEZEL_RATIO,
          objectFit: 'cover',
          transform: BEZEL_DROP,
          borderRadius: BEZEL_RADIUS,
          boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
        }}
      >
        <source src={BEZEL_SRC} type="video/mp4" />
      </video>
    </div>
  );
}

export default DisccThumbnail;
