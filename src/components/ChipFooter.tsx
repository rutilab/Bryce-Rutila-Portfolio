'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import FooterOverscroll from '@/components/FooterOverscroll';

/**
 * Footer scene after the Four Tet stage show: one big BRYCE chip that pumps on
 * the beat, wired out to the edges of the band by a board of traces.
 *
 * Same parts vocabulary as the home page board (CircuitBackground) — pins with
 * solder feet, rings, pads, vias, banded resistors, sparks — inverted for the
 * ink band: traces in pastel BRYCE colours, signals in the full neon.
 *
 * Every beat the lid kicks (harder on the downbeat), a ring swells off it and
 * the status light blinks; signals leave the pins on the beat and run the
 * traces out. All timing is SMIL on the svg's own clock, so the kick, the
 * rings and the signals never drift apart, and the whole board can be paused
 * in one call when it's offscreen.
 *
 * The chip lifts out of its socket: drag it away and the board loses power,
 * the colour draining out from the socket to the edges and the beat stopping.
 * Let go and it springs back into the socket and the colour floods back.
 */

const LINKEDIN_URL = 'https://www.linkedin.com/in/brycerutila/';
const EMAIL = 'rutilab@gmail.com';

const BRAND = ['#12B4FF', '#FF12F7', '#31E300', '#FF9C12', '#FFF712'] as const;
const SPARK_OUTER = 'M8 0L10.1607 5.83927L16 8L10.1607 10.1607L8 16L5.83927 10.1607L0 8L5.83927 5.83927L8 0Z';
const SPARK_INNER = 'M8 4L9.08036 6.91964L12 8L9.08036 9.08036L8 12L6.91964 9.08036L4 8L6.91964 6.91964L8 4Z';

const G = 16; // routing grid, px
const BEAT = 0.5; // s — 120 BPM
const BAR = BEAT * 4;
const SPEED = 280; // px/s a signal runs
const COMET = 44; // px, length of a signal's lit tail
const UNPLUG_AT = 20; // px the chip has to leave its socket to cut the power
const EDGE_FADE = 56; // px the board fades out over at top and bottom (.chip-board's mask)

type Pt = [number, number];
type Dir = 0 | 1 | 2 | 3; // up, right, down, left
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

type EndKind = 'ring' | 'pad' | 'dot' | 'via' | 'square' | 'arrow';
type End = { x: number; y: number; kind: EndKind; angle: number };
type Res = { x: number; y: number; vertical: boolean };
type Signal = { d: string; len: number; dur: number; begin: number; travel: number };
/** `k`: how far out from the chip it starts, 0–1, so power drains and returns outward */
type Trace = { color: string; d: string; ends: End[]; res: Res[]; juncs: Pt[]; signal?: Signal; delay: number; k: number };
type Pin = { x1: number; y1: number; x2: number; y2: number };
type Star = { x: number; y: number; size: number; color: string; dur: number; delay: number; k: number };
type Chip = { x: number; y: number; w: number; h: number };
type Board = { w: number; h: number; chip: Chip; pins: Pin[]; traces: Trace[]; stars: Star[] };

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toPath = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('');
const pathLen = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

function buildBoard(w: number, h: number): Board {
  const r = rng(9000);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const between = (a: number, b: number) => a + r() * (b - a);

  // Grid points, centred in the band
  const cols = Math.floor(w / G);
  const rows = Math.floor(h / G);
  const ox = (w - cols * G) / 2;
  const oy = (h - rows * G) / 2;
  const P = ([c, rw]: Pt): Pt => [ox + c * G, oy + rw * G];
  const inGrid = (c: number, rw: number) => c >= 0 && rw >= 0 && c <= cols && rw <= rows;
  const used = new Uint8Array((cols + 1) * (rows + 1));
  const at = (c: number, rw: number) => rw * (cols + 1) + c;

  // The chip: an even number of cells each way so pins land symmetric
  const narrow = w < 800;
  const chipPx = Math.min(624, Math.max(224, w * (narrow ? 0.68 : 0.46)));
  const cw = Math.max(12, Math.round(chipPx / G / 2) * 2);
  const ch = Math.max(6, Math.round(((chipPx - 4 * G) / 3.2) * 1.55 / G / 2) * 2);
  const c0 = Math.floor((cols - cw) / 2);
  const c1 = c0 + cw;
  const r0 = Math.floor((rows - ch) / 2);
  const r1 = r0 + ch;
  const [chipX, chipY] = P([c0, r0]);
  const chip = { x: chipX, y: chipY, w: cw * G, h: ch * G };
  const reach = Math.hypot(w / 2, h / 2);
  const kOf = ([x, y]: Pt) => Math.min(1, Math.hypot(x - (chip.x + chip.w / 2), y - (chip.y + chip.h / 2)) / reach);
  // The chip and the ring of points around it are off limits to routing
  for (let c = c0 - 1; c <= c1 + 1; c++) for (let rw = r0 - 1; rw <= r1 + 1; rw++) if (inGrid(c, rw)) used[at(c, rw)] = 1;

  /** A walk across the grid that only ever turns 90°, never doubles back on `forbid`, and never crosses another trace */
  const walk = (start: Pt, dir: Dir, forbid: number, maxLen: number, firstRun: number) => {
    let [c, rw] = start;
    let d = dir;
    let runLeft = firstRun;
    let steps = 0;
    let stuck = 0;
    let exited = false;
    const corners: Pt[] = [[c, rw]];
    const cells: Pt[] = [];
    const canStep = (t: number) => {
      const nc = c + DX[t];
      const nr = rw + DY[t];
      return !inGrid(nc, nr) || !used[at(nc, nr)];
    };
    while (steps < maxLen) {
      if (runLeft <= 0) {
        const turns = (r() < 0.5 ? [1, 3] : [3, 1]).map((k) => (d + k) % 4).filter((t) => t !== forbid);
        if (r() < 0.2) turns.unshift(d);
        const t = turns.find((t) => t !== (d + 2) % 4 && canStep(t));
        if (t === undefined) break;
        if (t !== d) corners.push([c, rw]);
        d = t as Dir;
        runLeft = 2 + Math.floor(r() * 6);
      }
      const nc = c + DX[d];
      const nr = rw + DY[d];
      if (!inGrid(nc, nr)) {
        // Run off the edge of the band, as if it carries on beyond
        c = nc + DX[d] * 3;
        rw = nr + DY[d] * 3;
        exited = true;
        break;
      }
      if (used[at(nc, nr)]) {
        if (stuck++ > 0) break;
        runLeft = 0;
        continue;
      }
      stuck = 0;
      c = nc;
      rw = nr;
      used[at(c, rw)] = 1;
      cells.push([c, rw]);
      steps++;
      runLeft--;
    }
    corners.push([c, rw]);
    const pts = corners.filter((p, i) => !i || p[0] !== corners[i - 1][0] || p[1] !== corners[i - 1][1]);
    return { pts, cells, steps, exited, dir: d };
  };

  const endKind = (): EndKind => pick(['ring', 'ring', 'pad', 'dot', 'dot', 'via', 'square', 'arrow'] as const);
  const angleOf = (d: number) => [-90, 0, 90, 180][d];

  /** One banded resistor on the first long enough straight run, now and then */
  const resistorOn = (pts: Pt[]): Res[] => {
    if (r() > 0.4) return [];
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = [pts[i - 1], pts[i]];
      const L = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
      if (L >= 4 && L < 40) {
        const k = Math.floor(L / 2);
        const sx = Math.sign(b[0] - a[0]);
        const sy = Math.sign(b[1] - a[1]);
        const [x, y] = P([a[0] + sx * k, a[1] + sy * k]);
        return [{ x, y, vertical: sx === 0 }];
      }
    }
    return [];
  };

  const traces: Trace[] = [];

  // Pins every other point round the chip, each with its foot reserved before
  // any routing so no trace can run across another's pin
  type Foot = { foot: Pt; edge: Pt; dir: Dir };
  const feet: Foot[] = [];
  for (let c = c0 + 2; c <= c1 - 2; c += 2) {
    feet.push({ foot: [c, r0 - 1], edge: [c, r0], dir: 0 });
    feet.push({ foot: [c, r1 + 1], edge: [c, r1], dir: 2 });
  }
  for (let rw = r0 + 2; rw <= r1 - 2; rw += 2) {
    feet.push({ foot: [c0 - 1, rw], edge: [c0, rw], dir: 3 });
    feet.push({ foot: [c1 + 1, rw], edge: [c1, rw], dir: 1 });
  }
  const pins: Pin[] = feet.map(({ foot, edge }) => {
    const [x1, y1] = P(edge);
    const [x2, y2] = P(foot);
    return { x1, y1, x2, y2 };
  });
  for (let i = feet.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [feet[i], feet[j]] = [feet[j], feet[i]];
  }

  for (const { foot, edge, dir } of feet) {
    const color = pick(BRAND);
    const forbid = (dir + 2) % 4;
    const m = walk(foot, dir, forbid, Math.floor(between(14, 56)), 1 + Math.floor(r() * 5));
    const px = m.pts.map(P);
    const ends: End[] = [];
    if (!m.exited) {
      const [x, y] = px[px.length - 1];
      ends.push({ x, y, kind: endKind(), angle: angleOf(m.dir) });
    }
    const t: Trace = { color, d: toPath(px), ends, res: resistorOn(m.pts), juncs: [], delay: between(0, 0.35), k: kOf(px[0]) };

    // The signal runs from the lid itself, out along the whole trace
    if (m.steps >= 3) {
      const run = [P(edge), ...px];
      const len = pathLen(run);
      const travel = len / SPEED;
      const beats = Math.ceil(travel / BEAT) + 2 + Math.floor(r() * 10);
      t.signal = { d: toPath(run), len, dur: beats * BEAT, begin: Math.floor(r() * 8) * BEAT, travel };
    }
    traces.push(t);

    // A side branch off a longer trace, tapped with a junction dot
    if (m.cells.length >= 6 && r() < 0.45) {
      const from = m.cells[2 + Math.floor(r() * (m.cells.length - 4))];
      const side = ((dir + (r() < 0.5 ? 1 : 3)) % 4) as Dir;
      const b = walk(from, side, forbid, Math.floor(between(2, 9)), 2 + Math.floor(r() * 3));
      if (b.steps >= 2) {
        const bpx = b.pts.map(P);
        const [x, y] = bpx[bpx.length - 1];
        traces.push({
          color,
          d: toPath(bpx),
          ends: b.exited ? [] : [{ x, y, kind: endKind(), angle: angleOf(b.dir) }],
          res: [],
          juncs: [P(from)],
          delay: t.delay + 0.4,
          k: kOf(P(from)),
        });
      }
    }
  }

  // Loose little circuits in whatever space is left, like the stage board's
  const tries = Math.floor(((cols + 1) * (rows + 1)) / 45);
  for (let i = 0; i < tries; i++) {
    const s: Pt = [Math.floor(r() * (cols + 1)), Math.floor(r() * (rows + 1))];
    if (used[at(s[0], s[1])]) continue;
    const near = [0, 1, 2, 3].filter((k) => inGrid(s[0] + DX[k], s[1] + DY[k]) && used[at(s[0] + DX[k], s[1] + DY[k])]).length;
    if (near) continue;
    used[at(s[0], s[1])] = 1;
    const m = walk(s, Math.floor(r() * 4) as Dir, -1, Math.floor(between(3, 11)), 2 + Math.floor(r() * 4));
    if (m.steps < 3) continue;
    const px = m.pts.map(P);
    const [sx, sy] = px[0];
    const ends: End[] = [{ x: sx, y: sy, kind: pick(['ring', 'dot', 'pad'] as const), angle: 0 }];
    if (!m.exited) {
      const [x, y] = px[px.length - 1];
      ends.push({ x, y, kind: endKind(), angle: angleOf(m.dir) });
    }
    traces.push({ color: pick(BRAND), d: toPath(px), ends, res: resistorOn(m.pts), juncs: [], delay: between(0.5, 1), k: kOf(px[0]) });
  }

  // Sparks blinking in the gaps
  const stars: Star[] = [];
  const starCount = Math.floor((w * h) / 26000);
  for (let i = 0, guard = 0; i < starCount && guard < 400; guard++) {
    const s: Pt = [1 + Math.floor(r() * (cols - 1)), 1 + Math.floor(r() * (rows - 1))];
    if ([0, 1, 2, 3, -1].some((k) => (k < 0 ? used[at(s[0], s[1])] : used[at(s[0] + DX[k], s[1] + DY[k])]))) continue;
    const [x, y] = P(s);
    const dur = between(5, 11);
    stars.push({ x: x + G / 2, y: y + G / 2, size: between(10, 18), color: r() < 0.5 ? '#faf7f2' : pick(BRAND), dur, delay: -between(0, dur), k: kOf([x, y]) });
    i++;
  }

  return { w, h, chip, pins, traces, stars };
}

/** The lid's kick across one bar: a fixed swell in px on every side, harder on the downbeat */
function pumpAnim(chip: Chip) {
  const kicks = [7, 3.5, 4.5, 3.5];
  const values: string[] = [];
  const times: number[] = [];
  const splines: string[] = [];
  kicks.forEach((g, k) => {
    const t0 = k / 4;
    values.push('1 1', `${(1 + (2 * g) / chip.w).toFixed(4)} ${(1 + (2 * g) / chip.h).toFixed(4)}`, '1 1');
    times.push(t0, t0 + 0.025, t0 + 0.2);
    splines.push('0 0 0.58 1', '0.25 0.6 0.4 1', '0 0 1 1');
  });
  values.push('1 1');
  times.push(1);
  return { values: values.join(';'), keyTimes: times.map((t) => +t.toFixed(3)).join(';'), keySplines: splines.join(';') };
}

function EndShape({ e }: { e: End }) {
  switch (e.kind) {
    case 'pad':
      return (
        <g>
          <circle className="chip-part" cx={e.x} cy={e.y} r={5} />
          <circle className="chip-hole" cx={e.x} cy={e.y} r={2} />
        </g>
      );
    case 'dot':
      return <circle className="chip-part" cx={e.x} cy={e.y} r={3.5} />;
    case 'via':
      return (
        <g>
          <circle className="chip-part" cx={e.x} cy={e.y} r={4.25} />
          <circle className="chip-hole" cx={e.x} cy={e.y} r={1.9} />
        </g>
      );
    case 'square':
      return <rect className="chip-part" x={e.x - 4} y={e.y - 4} width={8} height={8} />;
    case 'arrow':
      return <polygon className="chip-part" points="6,0 -5,-5.5 -5,5.5" transform={`translate(${e.x} ${e.y}) rotate(${e.angle})`} />;
    default:
      return (
        <g>
          <circle className="chip-ring" cx={e.x} cy={e.y} r={4.75} />
          <circle className="chip-part" cx={e.x} cy={e.y} r={1.75} />
        </g>
      );
  }
}

function Resistor({ p }: { p: Res }) {
  const [w, h] = p.vertical ? [10, 22] : [22, 10];
  const bands = [-5, 0, 5].map((o) => (p.vertical ? `M${p.x - 5} ${p.y + o}H${p.x + 5}` : `M${p.x + o} ${p.y - 5}V${p.y + 5}`));
  return (
    <g>
      <rect className="chip-part" x={p.x - w / 2} y={p.y - h / 2} width={w} height={h} rx={2.5} />
      <path className="chip-band" d={bands.join('')} />
    </g>
  );
}

export default function ChipFooter() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wordRef = useRef<SVGTextElement>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [live, setLive] = useState(false);
  const [wordSize, setWordSize] = useState(0);
  const [plugged, setPlugged] = useState(true);
  const [dragging, setDragging] = useState(false);
  const liftRef = useRef<SVGGElement>(null);
  const offset = useRef<Pt>([0, 0]);
  const grab = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  // Rebuild the board to the band's real width, in page pixels
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    let lastW = 0;
    const build = () => {
      const w = Math.round(el.clientWidth);
      if (!w || w === lastW) return;
      lastW = w;
      // A new board puts the chip back in its socket
      offset.current = [0, 0];
      setPlugged(true);
      setBoard(buildBoard(w, w < 800 ? 360 : 480));
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw in the first time it's seen; only run the music while it's on screen,
  // and not at all for reduced motion
  useEffect(() => {
    const el = sceneRef.current;
    const svg = svgRef.current;
    if (!el || !svg || !board) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      svg.pauseAnimations();
      svg.setCurrentTime(0);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLive(true);
          if (!still) svg.unpauseAnimations();
        } else {
          svg.pauseAnimations();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [board]);

  // Fit BRYCE to the lid once the headline face has loaded
  useEffect(() => {
    if (!board) return;
    const fit = () => {
      const t = wordRef.current;
      if (!t) return;
      // clear of the corner dot and the status light
      const target = board.chip.w - 2 * 40;
      const probe = 100;
      const was = t.style.fontSize;
      t.style.fontSize = `${probe}px`;
      const len = t.getComputedTextLength();
      t.style.fontSize = was;
      if (len) setWordSize(Math.min((probe * target) / len, board.chip.h * 0.72));
    };
    fit();
    document.fonts?.ready.then(fit);
  }, [board]);

  /** Where the chip sits relative to its socket; `ease` springs it there */
  const moveLift = (dx: number, dy: number, ease = false) => {
    offset.current = [dx, dy];
    const g = liftRef.current;
    if (!g) return;
    g.style.transition = ease ? 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none';
    g.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const onGrab = (e: React.PointerEvent<SVGGElement>) => {
    if (!board) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = { px: e.clientX, py: e.clientY, ox: offset.current[0], oy: offset.current[1] };
    setDragging(true);
  };
  const onDrag = (e: React.PointerEvent<SVGGElement>) => {
    const g0 = grab.current;
    if (!g0 || !board) return;
    const { chip: c, w, h } = board;
    // Keep the lid on the board, pins and all, and out of the fade at its top and bottom edges
    const edge = EDGE_FADE + G;
    const dx = Math.max(G - c.x, Math.min(w - G - c.x - c.w, g0.ox + e.clientX - g0.px));
    const dy = Math.max(edge - c.y, Math.min(h - edge - c.y - c.h, g0.oy + e.clientY - g0.py));
    moveLift(dx, dy);
    if (Math.hypot(dx, dy) > UNPLUG_AT) setPlugged(false);
  };
  const onDrop = () => {
    if (!grab.current) return;
    grab.current = null;
    setDragging(false);
    // Wherever it's let go, it springs home
    moveLift(0, 0, true);
    setPlugged(true);
  };

  const chip = board?.chip;
  const cx = chip ? chip.x + chip.w / 2 : 0;
  const cy = chip ? chip.y + chip.h / 2 : 0;
  const pump = chip ? pumpAnim(chip) : null;
  const ringColors = [BRAND[0], BRAND[1], BRAND[2], BRAND[4]];

  return (
    <footer className="landing-footer">
      {/* ── Footer info ── */}
      <div className="footer-content">
        <p className="footer-tagline">Good design connects the whole product.</p>
        {/* the two link columns travel together as one right-hand group, so
            EXPLORE can't drift into the middle as the viewport widens */}
        <div className="footer-links">
          <nav className="footer-col" aria-label="Footer navigation">
            <span className="footer-col-label">EXPLORE</span>
            <Link href="/" className="footer-link">HOME</Link>
            <Link href="/#work" className="footer-link">WORK</Link>
            <Link href="/about" className="footer-link">ABOUT ME</Link>
          </nav>
          <div className="footer-col">
            <span className="footer-col-label">CONNECT</span>
            <a href={`mailto:${EMAIL}`} className="footer-link">EMAIL</a>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="footer-link">
              LINKEDIN
            </a>
          </div>
        </div>
      </div>

      {/* ── The BRYCE chip ── */}
      <div className="chip-scene" ref={sceneRef}>
        <svg
          ref={svgRef}
          className={`chip-board${live ? ' is-live' : ''}${plugged ? '' : ' is-unplugged'}`}
          width={board?.w}
          height={board?.h}
          viewBox={board ? `0 0 ${board.w} ${board.h}` : undefined}
          aria-hidden="true"
        >
          {board?.traces.map((t, i) => (
            <g
              key={i}
              className="chip-circuit"
              style={{ '--c': t.color, '--d': `${t.delay.toFixed(2)}s`, '--k': t.k.toFixed(3) } as React.CSSProperties}
            >
              <path className="chip-trace" d={t.d} pathLength={1} />
              {t.res.map((p, k) => (
                <Resistor key={k} p={p} />
              ))}
              {t.juncs.map(([x, y], k) => (
                <circle key={k} className="chip-part" cx={x} cy={y} r={3} />
              ))}
              {t.ends.map((e, k) => (
                <EndShape key={k} e={e} />
              ))}
              {/* A signal leaves the lid on the beat, runs out, then rests */}
              {t.signal && (
                <path
                  className="chip-signal"
                  d={t.signal.d}
                  strokeDasharray={`${COMET} ${t.signal.len + COMET}`}
                  strokeDashoffset={COMET}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values={`${COMET};${-t.signal.len};${-t.signal.len}`}
                    keyTimes={`0;${(t.signal.travel / t.signal.dur).toFixed(3)};1`}
                    dur={`${t.signal.dur}s`}
                    begin={`${t.signal.begin}s`}
                    repeatCount="indefinite"
                  />
                </path>
              )}
            </g>
          ))}

          {board?.stars.map((s, i) => (
            <g key={i} transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`}>
              <g className="chip-star" style={{ '--c': s.color, '--k': s.k.toFixed(3), animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` } as React.CSSProperties}>
                <g transform={`scale(${(s.size / 16).toFixed(3)}) translate(-8 -8)`}>
                  <path className="chip-star-outer" d={SPARK_OUTER} />
                  <path className="chip-star-inner" d={SPARK_INNER} />
                </g>
              </g>
            </g>
          ))}

          {chip && pump && (
            <g className="chip-lid">
              {/* The socket stays on the board: its solder pads, and an outline
                  of the lid that only shows once the chip is out */}
              <rect className="chip-socket" x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={14} />
              {board.pins.map((p, k) => (
                <rect key={k} className="chip-foot" x={p.x2 - 3} y={p.y2 - 3} width={6} height={6} />
              ))}

              {/* Everything that lifts out with the chip */}
              <g
                ref={liftRef}
                className={`chip-lift${dragging ? ' is-dragging' : ''}`}
                onPointerDown={onGrab}
                onPointerMove={onDrag}
                onPointerUp={onDrop}
                onPointerCancel={onDrop}
              >
                <path className="chip-pins" d={board.pins.map((p) => `M${p.x1} ${p.y1}L${p.x2} ${p.y2}`).join('')} />

                {/* A ring swells off the lid on every beat, a colour per beat */}
                {ringColors.map((color, k) => (
                  <rect key={k} className="chip-ring-fx" stroke={color} x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={14} opacity={0}>
                    <animate attributeName="opacity" values="0.95;0;0" keyTimes="0;0.2;1" dur={`${BAR}s`} begin={`${k * BEAT}s`} repeatCount="indefinite" />
                    <animate attributeName="x" values={`${chip.x};${chip.x - 22};${chip.x - 22}`} keyTimes="0;0.2;1" dur={`${BAR}s`} begin={`${k * BEAT}s`} repeatCount="indefinite" />
                    <animate attributeName="y" values={`${chip.y};${chip.y - 22};${chip.y - 22}`} keyTimes="0;0.2;1" dur={`${BAR}s`} begin={`${k * BEAT}s`} repeatCount="indefinite" />
                    <animate attributeName="width" values={`${chip.w};${chip.w + 44};${chip.w + 44}`} keyTimes="0;0.2;1" dur={`${BAR}s`} begin={`${k * BEAT}s`} repeatCount="indefinite" />
                    <animate attributeName="height" values={`${chip.h};${chip.h + 44};${chip.h + 44}`} keyTimes="0;0.2;1" dur={`${BAR}s`} begin={`${k * BEAT}s`} repeatCount="indefinite" />
                  </rect>
                ))}

                {/* The lid kicks about its centre; the pins stay put */}
                <g transform={`translate(${cx} ${cy})`}>
                  <g>
                    {/* No power, no beat; put back, it picks the beat up in step */}
                    {plugged && (
                      <animateTransform
                        attributeName="transform"
                        type="scale"
                        values={pump.values}
                        keyTimes={pump.keyTimes}
                        keySplines={pump.keySplines}
                        calcMode="spline"
                        dur={`${BAR}s`}
                        repeatCount="indefinite"
                      />
                    )}
                    <g transform={`translate(${-cx} ${-cy})`}>
                      <rect className="chip-slab" x={chip.x} y={chip.y + 12} width={chip.w} height={chip.h} rx={14} />
                      <rect className="chip-body" x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={14} />
                      <rect className="chip-flush" x={chip.x} y={chip.y} width={chip.w} height={chip.h} rx={14} opacity={0}>
                        <animate attributeName="opacity" values="0.45;0;0" keyTimes="0;0.12;1" dur={`${BAR}s`} repeatCount="indefinite" />
                      </rect>
                      <rect className="chip-die" x={chip.x + 10} y={chip.y + 10} width={chip.w - 20} height={chip.h - 20} rx={6} />
                      <circle className="chip-dot" cx={chip.x + 22} cy={chip.y + 22} r={5} />
                      <circle className="chip-led" cx={chip.x + chip.w - 22} cy={chip.y + 22} r={4.5} />
                      {ringColors.map((color, k) => (
                        <circle key={k} className="chip-led-fx" style={{ fill: color }} cx={chip.x + chip.w - 22} cy={chip.y + 22} r={4.5} opacity={0}>
                          <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.08;0.14;1" dur={`${BAR}s`} begin={`${k * BEAT}s`} repeatCount="indefinite" />
                        </circle>
                      ))}
                      <text
                        ref={wordRef}
                        className="chip-word"
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={wordSize ? { fontSize: `${wordSize}px` } : undefined}
                      >
                        BRYCE
                      </text>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          )}
        </svg>
      </div>

      <div className="footer-bottom">
        <span>© 2026 BRYCE RUTILA</span>
        <span className="footer-bottom-note">No chips were fried in the making of this site</span>
      </div>
      <FooterOverscroll />
    </footer>
  );
}
