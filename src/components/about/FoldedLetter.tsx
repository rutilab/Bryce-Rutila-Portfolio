'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FlyIcon } from '@/components/icons/FlyIcon';

const BIO = [
  <>
    Growing up I was always curious about how things in the world worked and why they worked the
    way they do. A lot of that curiosity had to do with my parents being teachers. As teachers tend
    to do, they encouraged me to ask a lot of questions and seek out answers. I often directed that
    curiosity toward questioning why certain things felt effortless while others felt unnecessarily
    difficult. When I discovered the world of UX through <em>The Design of Everyday Things</em>,
    something clicked. It felt less like discovering a new career and more like finding a framework
    for how I already saw the world.
  </>,
  <>
    At the time, I was working toward my B.S. in Psychology at the University of Florida,
    specializing in behavior analysis. That background continues to shape how I approach design and
    research. My curiosity is alive and well, focused on understanding what motivates people and
    what we can learn from the gap between what users say and what they actually do.
  </>,
  <>
    Today, as the Lead UX Researcher and Designer at Finding Focus, I get to combine that curiosity
    with my love of untangling complex problems. Working on a multi-role platform, I dig into the
    “why” behind a problem, map how it lives within the broader system, and define which solutions
    are worth pursuing. I’ve had the privilege of taking products from 0→1 with true end-to-end
    ownership, leading research, shaping strategy, and bringing ideas to life through design. And it
    all still starts the same way it always has: asking a lot of questions and seeking out answers.
  </>,
];

/** Unfolds between these two fractions of the viewport height. */
const START_AT = 0.85;
const END_AT = 0.25;

/**
 * One printing of the letter. All three slices render the same sheet; the clips
 * decide which third of it you see. Hoisted out of the component so React keeps
 * the same element type across renders rather than remounting the subtree.
 *
 * Every copy renders the same elements — the slices only line up because the
 * three sheets are identical, so the flags below change attributes only, never
 * structure.
 */
function LetterSheet({
  innerRef,
  hideText = false,
  flyControl = false,
}: {
  innerRef?: React.Ref<HTMLElement>;
  /** Clone sheets repeat the copy visually; only one should be read aloud. */
  hideText?: boolean;
  /** The fly is only visible in the bottom slice, so only that one is a control. */
  flyControl?: boolean;
}) {
  const [spinning, setSpinning] = useState(false);

  return (
    <article
      ref={innerRef}
      className="w-[640px] max-w-full rounded-[8px] px-4 pt-10 pb-6 shadow-[0_2px_4px_rgba(0,0,0,0.25)] sm:px-10"
      style={{
        backgroundImage: 'url(/about/paper-texture.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Hidden on the clones rather than on the whole article, so the fly in the
          bottom slice can still be a real control. */}
      <div aria-hidden={hideText || undefined}>
        <h1
          className="text-[18px] leading-[26px] tracking-[-0.04em] text-black sm:text-[20px] sm:leading-[28px]"
          style={{ fontFamily: 'var(--font-battambang), sans-serif', fontWeight: 700 }}
        >
          A little bit about me...
        </h1>

        <div
          className="mt-4 flex flex-col gap-6 text-[14px] leading-[22px] tracking-[-0.03em] text-[#141510] sm:text-[16px] sm:leading-[24px]"
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          {BIO.map((paragraph, i) => (
            // Fixed, ordered copy — the index is a stable identity here.
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Rule, fly, rule — the sign-off at the foot of the page */}
      <div className="mt-10 flex h-6 items-center gap-2">
        <span className="h-px flex-1 bg-[#201006]" />
        <button
          type="button"
          onClick={() => {
            // Without an animation there is no animationend to clear the flag,
            // so don't raise it in the first place.
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            setSpinning(true);
          }}
          onAnimationEnd={() => setSpinning(false)}
          // Only the fly in the bottom slice is on screen. The other two are
          // clipped away, so they are inert — focusing one would put the caret
          // on a control nobody can see.
          aria-hidden={!flyControl || undefined}
          tabIndex={flyControl ? 0 : -1}
          aria-label="Spin the fly"
          className={`letter-fly shrink-0 text-[#201006]${spinning ? ' letter-fly-spinning' : ''}`}
        >
          <FlyIcon active width={22.68} height={21.06} />
        </button>
        <span className="h-px flex-1 bg-[#201006]" />
      </div>
    </article>
  );
}

/**
 * The bio card as a letter that unfolds down the page.
 *
 * Three joints nested inside one another, each hinged at its top edge, so the
 * rotations compound the way a real accordion fold does — a flat row of
 * siblings just separates, because transforms don't move the next element.
 * Each joint keeps its 3D transform on its own node and does its clipping one
 * level down, since `overflow: hidden` forces `transform-style` back to flat.
 */
export function FoldedLetter() {
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);

  // Slice geometry follows the real card, which reflows with the viewport.
  useEffect(() => {
    const sheet = sheetRef.current;
    const stage = stageRef.current;
    if (!sheet || !stage) return;

    const apply = (fullHeight: number) => {
      if (!fullHeight) return;
      const slice = fullHeight / 3;
      stage.style.setProperty('--full-h', `${fullHeight}px`);
      stage.style.setProperty('--slice-h', `${slice}px`);
      stage.style.setProperty('--offset-mid', `${-slice}px`);
      stage.style.setProperty('--offset-bot', `${-slice * 2}px`);
    };

    const observer = new ResizeObserver(([entry]) => {
      // borderBoxSize is the padded height we actually slice; fall back for
      // engines that only give contentRect.
      const box = entry.borderBoxSize?.[0];
      apply(box ? box.blockSize : (entry.target as HTMLElement).offsetHeight);
    });

    observer.observe(sheet);
    apply(sheet.offsetHeight);
    return () => observer.disconnect();
  }, []);

  // Scroll driver: one rAF per frame at most, no animation library.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stage.style.setProperty('--fold-progress', '1');
      return;
    }

    let frame = 0;
    let ticking = false;

    const measure = () => {
      ticking = false;
      const top = stage.getBoundingClientRect().top;
      /**
       * Where the letter sits in the document, which never changes. On a tall
       * viewport the card is already well up the screen at scroll 0, so a plain
       * viewport fraction would start it half-open — clamping the start to this
       * guarantees it is folded on arrival, whatever the window height.
       */
      const docTop = top + window.scrollY;
      const start = Math.min(window.innerHeight * START_AT, docTop);
      const end = window.innerHeight * END_AT;
      const span = Math.max(start - end, 1);
      const progress = Math.max(0, Math.min(1, (start - top) / span));
      stage.style.setProperty('--fold-progress', progress.toFixed(4));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    measure();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="about-section mt-6">
      <div
        ref={stageRef}
        className="letter-3d-stage mx-auto w-[640px] max-w-full"
        style={
          {
            '--fold-progress': '0',
            // Design-size seeds; the ResizeObserver overwrites them on mount.
            '--full-h': '748px',
            '--slice-h': '249.333px',
            '--offset-mid': '-249.333px',
            '--offset-bot': '-498.667px',
          } as CSSProperties
        }
      >
        <div className="fold-joint top-joint">
          <div className="fold-clip">
            <div className="fold-sheet">
              <LetterSheet innerRef={sheetRef} />
            </div>
          </div>

          <div className="fold-joint middle-joint">
            <div className="fold-clip">
              <div className="fold-sheet" style={{ transform: 'translateY(var(--offset-mid))' }}>
                <LetterSheet hideText />
              </div>
            </div>

            <div className="fold-joint bottom-joint">
              <div className="fold-clip">
                <div className="fold-sheet" style={{ transform: 'translateY(var(--offset-bot))' }}>
                  <LetterSheet hideText flyControl />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
