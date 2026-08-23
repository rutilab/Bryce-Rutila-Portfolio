'use client';

/**
 * Home page card thumbnail for the Discc case study.
 *
 * Two layers with distinct jobs: the leather texture is the *stage* — it fills
 * the card edge to edge and never moves — and the phone bezel GIF is the
 * *subject*, floating above it on its own shadow.
 */

const BEZEL_SRC = '/case-studies/discc/phone-bezel.gif';

/** Intrinsic GIF dimensions — the device fills the canvas with a ~5px margin. */
const BEZEL_RATIO = '260 / 532';

/**
 * The GIF's corners are opaque black, not transparent, so they'd read as a dark
 * rectangle behind the device. Clipping to the phone's own corner radius (~47px
 * at 260px wide) removes them. Expressed as a horizontal/vertical percentage
 * pair — 47/260 and 47/532 — so the ellipse stays circular in absolute terms at
 * every card size.
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

      <img
        src={BEZEL_SRC}
        alt=""
        loading="lazy"
        style={{
          position: 'relative',
          display: 'block',
          height: BEZEL_HEIGHT,
          width: 'auto',
          aspectRatio: BEZEL_RATIO,
          transform: BEZEL_DROP,
          borderRadius: BEZEL_RADIUS,
          boxShadow: '0 18px 40px rgba(0,0,0,0.6)',
        }}
      />
    </div>
  );
}

export default DisccThumbnail;
