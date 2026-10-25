'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/components/ProjectCard';
import type { QuickMedia, QuickScreen, QuickSlide } from '@/data/quickViews';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { EndOfSessionFlow } from '@/components/case-study/EndOfSessionFlow';

/** How far a finger has to travel before a swipe turns the slide */
const SWIPE_PX = 48;

/** Something the full-screen viewer can show */
type ZoomItem =
  | { kind: 'image'; src: string; alt: string; caption?: string }
  | { kind: 'page'; src: string; alt: string; width: number; height: number; caption?: string }
  | { kind: 'demo'; name: DemoName; caption?: string };

/** Opens the full-screen viewer on a set of items, starting at one of them */
const ZoomContext = createContext<(items: ZoomItem[], start?: number) => void>(() => {});
const isGif = (src: string) => src.endsWith('.gif');

/** Neighbouring slides that share a label, as one step in the progress bar */
function sectionsOf(slides: QuickSlide[]) {
  const sections: { label: string; start: number; count: number }[] = [];
  slides.forEach((s, i) => {
    const last = sections[sections.length - 1];
    if (last && last.label === s.label) last.count += 1;
    else sections.push({ label: s.label, start: i, count: 1 });
  });
  return sections;
}

/**
 * A case study as a short slide deck: overview, problem, research, solution,
 * the key decisions with the screens they produced, and outcomes. Arrow keys,
 * swipes, and the progress bar all move through it, and the last slide hands
 * off to the full case study.
 *
 * Every slide stays mounted in one grid cell and crossfades, so turning a slide
 * never re-fetches its images and the panel never changes height.
 */
export function QuickView({ project, onClose }: { project: Project; onClose: () => void }) {
  const { title, eyebrow, href, quickView: slides = [] } = project;
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ items: ZoomItem[]; index: number } | null>(null);
  // The key handler reads it here, so it isn't rebound every time the viewer opens or turns
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  const openZoom = (items: ZoomItem[], start = 0) => setZoom({ items, index: start });
  const closeRef = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  useBodyScrollLock(true);

  const last = slides.length - 1;
  const go = useCallback((i: number) => setIndex(Math.max(0, Math.min(last, i))), [last]);
  const sections = sectionsOf(slides);
  const keysTip = useOnceTip(KEYS_TIP_KEY, useHasKeyboard());
  const dismissKeysTip = keysTip.dismiss;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      // While the viewer is open, keys belong to it: Escape closes it, arrows page through it
      const z = zoomRef.current;
      if (z) {
        if (e.key === 'Escape') setZoom(null);
        else if (e.key === 'ArrowRight') setZoom({ ...z, index: Math.min(z.items.length - 1, z.index + 1) });
        else if (e.key === 'ArrowLeft') setZoom({ ...z, index: Math.max(0, z.index - 1) });
        return;
      }
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        // They've found the keys, so the tip has done its job
        dismissKeysTip();
        setIndex((i) => (e.key === 'ArrowRight' ? Math.min(last, i + 1) : Math.max(0, i - 1)));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [onClose, last, dismissKeysTip]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') swipeStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    // Mostly sideways, so a vertical scroll through a tall slide doesn't turn it
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(e.clientY - start.y)) return;
    go(index + (dx < 0 ? 1 : -1));
  };

  const next = slides[index + 1];

  return createPortal(
    <>
    <div className="quick-backdrop" onClick={onClose}>
      <div
        className="qv-panel"
        role="dialog"
        aria-modal="true"
        aria-roledescription="slide deck"
        aria-label={`${title}, quick view`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="qv-head">
          <p className="qv-kicker">
            {eyebrow && <span>{eyebrow}</span>}
            <span className="qv-kicker-time">90-second overview</span>
          </p>
          <button ref={closeRef} type="button" className="quick-close qv-close" onClick={onClose} aria-label="Close">
            ×
          </button>
          <nav className="qv-progress" aria-label="Sections">
            {sections.map((sec) => {
              const current = index >= sec.start && index < sec.start + sec.count;
              return (
                <button
                  key={sec.start}
                  type="button"
                  className="qv-progress-step"
                  data-current={current}
                  aria-current={current ? 'step' : undefined}
                  style={{ flexGrow: sec.count }}
                  onClick={() => go(sec.start)}
                >
                  <span className="qv-progress-bars">
                    {Array.from({ length: sec.count }, (_, k) => (
                      <span key={k} className="qv-progress-bar" data-filled={sec.start + k <= index} />
                    ))}
                  </span>
                  <span className="qv-progress-label">{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        <div className="qv-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <ZoomContext.Provider value={openZoom}>
            {slides.map((s, i) => (
              <Slide key={i} slide={s} project={project} active={i === index} position={i - index} />
            ))}
          </ZoomContext.Provider>
        </div>

        <footer className="qv-foot">
          <p className="qv-count" aria-live="polite">
            <span className="qv-count-now">{String(index + 1).padStart(2, '0')}</span> / {String(slides.length).padStart(2, '0')}
          </p>
          <div className="qv-nav">
            {keysTip.show && (
              <Tip placement="above" entered={keysTip.entered} onDismiss={keysTip.dismiss}>
                Use the <kbd className="qv-kbd">←</kbd> <kbd className="qv-kbd">→</kbd> keys to move between slides
              </Tip>
            )}
            <button type="button" className="qv-prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide">
              ←
            </button>
            {next ? (
              <button type="button" className="qv-next" onClick={() => go(index + 1)}>
                {next.label === slides[index].label ? (
                  'Next'
                ) : (
                  <span>
                    <span className="qv-next-label">Next: </span>
                    {next.label}
                  </span>
                )}{' '}
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              href && (
                <Link href={href} className="quick-cta qv-next">
                  <span className="qv-cta-long">Read the full case study</span>
                  <span className="qv-cta-short">Full case study</span> <span aria-hidden="true">→</span>
                </Link>
              )
            )}
          </div>
        </footer>
      </div>
    </div>
    {zoom && (
      <Lightbox
        items={zoom.items}
        index={zoom.index}
        onIndex={(i) => setZoom({ ...zoom, index: i })}
        onClose={() => setZoom(null)}
      />
    )}
    </>,
    document.body,
  );
}

function Slide({
  slide,
  project,
  active,
  position,
}: {
  slide: QuickSlide;
  project: Project;
  active: boolean;
  position: number;
}) {
  const { label, headline, body, facts, stats, points, quote, options, media, caption } = slide;
  // A single visual sits beside the copy; rows of screens get the full width under the headline
  const layout =
    slide.layout ??
    (!media
      ? 'text'
      : media.kind === 'image' || media.kind === 'thumbnail' || media.kind === 'prototype' || (media.kind === 'pages' && media.pages.length === 1)
        ? 'split'
        : 'stack');
  const Heading = facts ? 'h2' : 'h3';

  const factRows = facts
    ? [
        { label: 'Role', value: project.role },
        { label: 'Timeline', value: project.timeline },
        { label: 'Team', value: project.team?.join('\n') },
      ].filter((f) => f.value)
    : [];

  return (
    <section
      className={`qv-slide qv-slide--${layout}`}
      data-active={active}
      // Which side it waits on decides which way it slides in
      data-side={position < 0 ? 'before' : position > 0 ? 'after' : undefined}
      aria-roledescription="slide"
      aria-label={label}
      aria-hidden={!active}
      inert={!active}
    >
      <div className="qv-copy">
        <p className="qv-label">{label}</p>
        <Heading className={`qv-headline${facts ? ' qv-headline--title' : ''}`}>{headline}</Heading>
        {body && <p className="qv-body">{body}</p>}

        {factRows.length > 0 && (
          <dl className="qv-facts">
            {factRows.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {stats && (
          <ul className="qv-stats" data-count={stats.length}>
            {stats.map((s) => (
              <li key={s.label}>
                <span className="qv-stat-value">{s.value}</span>
                <span className="qv-stat-label">{s.label}</span>
              </li>
            ))}
          </ul>
        )}

        {points && (
          <ol className="qv-points" data-count={points.length}>
            {points.map((p, i) => (
              <li key={p.title} data-verdict={p.verdict}>
                {p.verdict ? (
                  <span className="qv-point-verdict">{p.verdict === 'chosen' ? 'Our pick' : 'Ruled out'}</span>
                ) : (
                  <span className="qv-point-num">{String(i + 1).padStart(2, '0')}</span>
                )}
                <h4 className="qv-point-title">{p.title}</h4>
                <p className="qv-point-body">{p.body}</p>
              </li>
            ))}
          </ol>
        )}

        {options && (
          <div className="qv-options">
            <p className="qv-options-label">Options explored</p>
            <ul>
              {options.map((o) => (
                <li key={o.label} data-chosen={o.chosen || undefined}>
                  <span className="qv-option-img">
                    <Image src={o.src} alt="" fill sizes="120px" style={{ objectFit: 'contain' }} />
                    {o.chosen && <span className="qv-option-badge">Chosen</span>}
                  </span>
                  <span className="qv-option-name">{o.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {quote && (
          <blockquote className="qv-quote">
            <p>“{quote.text}”</p>
            <footer>— {quote.source}</footer>
          </blockquote>
        )}
      </div>

      {media && (
        <figure className="qv-visual">
          <Media media={media} project={project} active={active} />
          {caption && <figcaption className="qv-caption">{caption}</figcaption>}
        </figure>
      )}
    </section>
  );
}

function Media({ media, project, active }: { media: QuickMedia; project: Project; active: boolean }) {
  const zoom = useContext(ZoomContext);
  switch (media.kind) {
    case 'thumbnail':
      return (
        <div className="qv-box qv-box--thumb">
          <div className="work-thumb-screen">{project.thumbnailContent}</div>
        </div>
      );
    case 'image': {
      const open = media.fixed ? undefined : () => zoom([{ kind: 'image', src: media.src, alt: media.alt }]);
      return (
        <div className={`qv-box qv-box--image${open ? ' qv-zoomable' : ''}`} onClick={open}>
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(max-width: 799px) 100vw, 560px"
            // GIFs would lose their animation to the optimizer
            unoptimized={isGif(media.src)}
            style={{ objectFit: media.fit ?? 'contain' }}
          />
          {open && <ZoomButton onClick={open} />}
        </div>
      );
    }
    case 'gallery':
      return <Gallery sets={media.sets} />;
    case 'groups': {
      // Every screen and demo across the groups, so the viewer can page from one group into the next
      const items: ZoomItem[] = media.groups.flatMap((g): ZoomItem[] =>
        g.demo
          ? [{ kind: 'demo', name: g.demo, caption: g.label }]
          : (g.screens ?? []).map((s) => ({ ...screenItem(s), caption: s.caption ? `${g.label} · ${s.caption}` : g.label })),
      );
      // Where each group's first item sits in that list
      const sizes = media.groups.map((g) => (g.demo ? 1 : (g.screens?.length ?? 0)));
      const starts = sizes.map((_, i) => sizes.slice(0, i).reduce((a, b) => a + b, 0));
      return (
        <div className="qv-box qv-groups">
          {media.groups.map((g, i) => {
            const start = starts[i];
            return (
              <Fragment key={g.label}>
                {i > 0 && media.arrows && (
                  <span className="qv-arrow" aria-hidden="true">
                    →
                  </span>
                )}
                <div
                  className="qv-group"
                  data-dashed={g.dashed || undefined}
                  style={
                    {
                      // A demo is a touch wider than a phone at the same height
                      '--sum': g.demo ? 0.75 : (g.screens ?? []).reduce((sum, s) => sum + s.ratio, 0),
                      '--n': g.screens?.length ?? 1,
                    } as React.CSSProperties
                  }
                >
                  <p className="qv-group-head">
                    <span className="qv-group-label">{g.label}</span>
                    {g.tag && <span className="qv-group-tag">{g.tag}</span>}
                  </p>
                  {g.demo ? (
                    <div className="qv-demo-wrap">
                      <Demo name={g.demo} active={active} />
                      <ZoomButton onClick={() => zoom(items, start)} />
                    </div>
                  ) : (
                    g.screens && <ScreenRow screens={g.screens} onOpen={(k) => zoom(items, start + k)} />
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      );
    }
    case 'prototype':
      return <Prototype media={media} active={active} />;
    case 'pages': {
      const items: ZoomItem[] = media.pages.map((p) => ({ kind: 'page', ...p, caption: p.label }));
      return (
        <div className="qv-box qv-pages">
          {media.pages.map((p, i) => (
            <PageWindow key={p.label} page={p} active={active} onZoom={() => zoom(items, i)} />
          ))}
        </div>
      );
    }
  }
}

type QuickPage = Extract<QuickMedia, { kind: 'pages' }>['pages'][number];

/** How far into a page counts as having found the scroll */
const SCROLLED_PX = 40;

/** A whole page in a scrolling window, with its one-time scroll tip when it has one */
function PageWindow({ page, active, onZoom }: { page: QuickPage; active: boolean; onZoom: () => void }) {
  const tip = useOnceTip(SCROLL_TIP_KEY, active && !!page.hint);
  return (
    <div className="qv-page">
      <span className="qv-page-label">{page.label}</span>
      <div className="qv-page-window">
        <div
          className="qv-page-scroll"
          tabIndex={0}
          aria-label={`${page.label}, scrollable`}
          onScroll={(e) => e.currentTarget.scrollTop > SCROLLED_PX && tip.dismiss()}
        >
          <Image
            src={page.src}
            alt={page.alt}
            width={page.width}
            height={page.height}
            sizes="(max-width: 799px) 90vw, 480px"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        <ZoomButton onClick={onZoom} />
        {tip.show && (
          <div className="qv-page-tip">
            <Tip placement="inside" entered={tip.entered} onDismiss={tip.dismiss}>
              <span aria-hidden="true">↓ </span>
              {page.hint}
            </Tip>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── One-time tips ─────────────────────────────────────────────────────────
   In the style of the light/dark toggle's callout (see ThemeModeToggle), and
   like it, each shows once ever: it's remembered the moment it appears, and
   leaves on its X or as soon as the reader does the thing it points out. */
const KEYS_TIP_KEY = 'bar9000:quick-view-keys-tip-seen';
const SCROLL_TIP_KEY = 'bar9000:quick-view-scroll-tip-seen';
/** Lets the deck finish opening before a tip arrives */
const TIP_DELAY_MS = 700;

function tipSeen(key: string) {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    // private mode / storage disabled: show it this session rather than never
    return false;
  }
}

function rememberTip(key: string) {
  try {
    window.localStorage.setItem(key, '1');
  } catch {
    /* nothing to remember it with — it stays dismissed for this session */
  }
}

/** Shows a tip while `ready`, unless it's been seen before; hides it again if `ready` lapses first */
function useOnceTip(key: string, ready: boolean) {
  const [state, setState] = useState<'hidden' | 'shown' | 'entered'>('hidden');
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current || tipSeen(key)) return;
    const show = window.setTimeout(() => {
      rememberTip(key);
      setState('shown');
    }, TIP_DELAY_MS);
    // one frame at the start position, so the transition has something to run from
    const enter = window.setTimeout(() => setState('entered'), TIP_DELAY_MS + 60);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(enter);
      setState('hidden');
    };
  }, [key, ready]);

  const dismiss = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setState((s) => (s === 'hidden' ? s : 'shown'));
    // let the fade finish before the bubble leaves the tree
    window.setTimeout(() => setState('hidden'), 200);
  }, []);

  return { show: state !== 'hidden', entered: state === 'entered', dismiss };
}

/** True on a device with a mouse or trackpad, where there's a keyboard to point out */
function useHasKeyboard() {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHas(mq.matches);
    const t = window.setTimeout(update, 0);
    mq.addEventListener('change', update);
    return () => {
      window.clearTimeout(t);
      mq.removeEventListener('change', update);
    };
  }, []);
  return has;
}

function Tip({
  placement,
  entered,
  onDismiss,
  children,
}: {
  placement: 'above' | 'inside';
  entered: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  return (
    <div role="status" className="theme-toggle-callout qv-tip" data-placement={placement} data-entered={entered}>
      {placement === 'above' && <span className="theme-toggle-callout-caret" aria-hidden />}
      <p className="theme-toggle-callout-copy">{children}</p>
      <button type="button" onClick={onDismiss} aria-label="Dismiss tip" className="theme-toggle-callout-close">
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      </button>
    </div>
  );
}

const screenItem = (s: QuickScreen): ZoomItem => ({ kind: 'image', src: s.src, alt: s.alt, caption: s.caption });

/** The corner button that opens the full-screen viewer */
function ZoomButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="qv-zoom"
      aria-label="View full screen"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M10 2h4v4M6 14H2v-4M14 2 9.5 6.5M2 14l4.5-4.5" />
      </svg>
    </button>
  );
}

/** Screens at one shared height, captioned underneath; each opens full screen when `onOpen` is given */
function ScreenRow({ screens, onOpen }: { screens: QuickScreen[]; onOpen?: (index: number) => void }) {
  // A row more than twice as wide as it is tall shrinks to slivers on a phone, so it stacks there instead
  const wide = screens.reduce((sum, s) => sum + s.ratio, 0) > 2;
  return (
    <div className="qv-row" data-wide={wide || undefined}>
      {screens.map((s, i) => {
        const image = (
          <Image
            src={s.src}
            alt={s.alt}
            fill
            sizes="(max-width: 799px) 50vw, 360px"
            unoptimized={isGif(s.src)}
            style={{ objectFit: 'contain' }}
          />
        );
        return (
          <div key={s.src} className="qv-shot" style={{ '--ratio': s.ratio } as React.CSSProperties}>
            {onOpen ? (
              <button type="button" className="qv-shot-img qv-zoomable" onClick={() => onOpen(i)} aria-label={`${s.alt}, view full screen`}>
                {image}
              </button>
            ) : (
              <div className="qv-shot-img">{image}</div>
            )}
            {s.caption && <span className="qv-shot-cap">{s.caption}</span>}
          </div>
        );
      })}
    </div>
  );
}

function Gallery({ sets }: { sets: Extract<QuickMedia, { kind: 'gallery' }>['sets'] }) {
  const [active, setActive] = useState(0);
  const zoom = useContext(ZoomContext);
  const items = sets[active].screens.map(screenItem);
  return (
    <div className="qv-gallery">
      {sets.length > 1 && (
        <div className="qv-tabs" role="tablist">
          {sets.map((s, i) => (
            <button
              key={s.label}
              type="button"
              role="tab"
              aria-selected={i === active}
              className="qv-tab"
              onClick={() => setActive(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div className="qv-box qv-box--row">
        <ScreenRow screens={sets[active].screens} onOpen={(i) => zoom(items, i)} />
        <ZoomButton onClick={() => zoom(items)} />
      </div>
    </div>
  );
}

/** Live demos a deck can show in place of screens, at the width they were designed for */
const DEMOS = {
  'end-of-session': { Component: EndOfSessionFlow, width: 408 },
} as const;

/**
 * A live demo from the case study, laid out at its own width and scaled to fit
 * the slide. It only runs while its slide is showing, and starts over each time
 * it comes back, so it never plays out unseen.
 */
function Demo({ name, active }: { name: keyof typeof DEMOS; active: boolean }) {
  const { Component, width } = DEMOS[name];
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!active || !box || !inner) return;
    const measure = () => {
      const height = inner.offsetHeight;
      if (!height) return;
      const scale = Math.min(box.clientWidth / width, box.clientHeight / height);
      setFit({ scale, x: (box.clientWidth - width * scale) / 2, y: (box.clientHeight - height * scale) / 2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [active, width]);

  return (
    <div ref={boxRef} className="qv-demo">
      {active && (
        <div
          ref={innerRef}
          className="qv-demo-inner"
          style={{
            width,
            transform: fit ? `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})` : undefined,
            visibility: fit ? 'visible' : 'hidden',
          }}
        >
          <Component />
        </div>
      )}
    </div>
  );
}

type DemoName = keyof typeof DEMOS;

/**
 * A live HTML prototype, framed at its own size and scaled to fit the box.
 * Like the demos it only exists while its slide is open, so it starts over
 * each visit and its opening reply is never missed.
 */
function Prototype({ media, active }: { media: Extract<QuickMedia, { kind: 'prototype' }>; active: boolean }) {
  const { src, title, width, height } = media;
  const boxRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!active || !box) return;
    const measure = () => {
      const scale = Math.min(box.clientWidth / width, box.clientHeight / height);
      setFit({ scale, x: (box.clientWidth - width * scale) / 2, y: (box.clientHeight - height * scale) / 2 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [active, width, height]);

  return (
    <div ref={boxRef} className="qv-box qv-box--prototype">
      {active && (
        <iframe
          src={src}
          title={title}
          scrolling="no"
          className="qv-prototype"
          style={{
            width,
            height,
            transform: fit ? `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})` : undefined,
            visibility: fit ? 'visible' : 'hidden',
          }}
        />
      )}
    </div>
  );
}

/**
 * The full-screen viewer. It sits above the deck rather than inside it, so a
 * click on its backdrop closes just the viewer and leaves the deck open.
 */
function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: ZoomItem[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];
  const many = items.length > 1;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => prev?.focus();
  }, []);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="qv-lightbox" role="dialog" aria-modal="true" aria-label="Full screen view" onClick={onClose}>
      <div className="qv-lb-bar" onClick={stop}>
        <p className="qv-lb-caption">{item.caption ?? (item.kind === 'demo' ? '' : item.alt)}</p>
        {many && (
          <span className="qv-lb-count">
            {index + 1} / {items.length}
          </span>
        )}
        <button ref={closeRef} type="button" className="qv-lb-close" onClick={onClose} aria-label="Close full screen view">
          ×
        </button>
      </div>

      <div className="qv-lb-stage">
        {item.kind === 'image' && (
          <div className="qv-lb-image">
            <Image key={item.src} src={item.src} alt={item.alt} fill sizes="100vw" unoptimized={isGif(item.src)} style={{ objectFit: 'contain' }} />
          </div>
        )}
        {item.kind === 'page' && (
          <div className="qv-lb-page" onClick={stop} tabIndex={0}>
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(max-width: 1100px) 100vw, 1100px"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        )}
        {item.kind === 'demo' && (
          <div className="qv-lb-demo" onClick={stop}>
            <Demo name={item.name} active />
          </div>
        )}
      </div>

      {many && (
        <>
          <button
            type="button"
            className="qv-lb-nav qv-lb-nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              onIndex(index - 1);
            }}
            disabled={index === 0}
            aria-label="Previous"
          >
            ←
          </button>
          <button
            type="button"
            className="qv-lb-nav qv-lb-nav--next"
            onClick={(e) => {
              e.stopPropagation();
              onIndex(index + 1);
            }}
            disabled={index === items.length - 1}
            aria-label="Next"
          >
            →
          </button>
        </>
      )}
    </div>
  );
}
