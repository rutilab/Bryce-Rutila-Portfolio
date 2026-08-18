'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

/**
 * Pixel-art footer scene: caterpillars crawl along ink branches; click one to
 * cocoon it, click the cocoon to hatch a BR fly (the same SVGs used in the hero).
 * Canvas is transparent so the halftone background shows through.
 */

const S = 3; // 1 art pixel = 3 screen pixels
const SCENE_AH = 56; // scene art height → 168px tall

/**
 * Motion is expressed per "reference frame" and scaled by real elapsed time, so the
 * scene runs at the same speed on 60Hz, 120Hz and everything between. The reference
 * is 120fps because the speeds here were tuned on a 120Hz display.
 */
const REF_FRAME_MS = 1000 / 120;
/** Cap the catch-up after a stall (background tab, slow paint) so nothing teleports */
const MAX_STEP = 4;

const LINKEDIN_URL = 'https://www.linkedin.com/in/brycerutila/';
const EMAIL = 'rutilab@gmail.com';

/** Hatch order cycles the five BRYCE block colors (B-R-E-C-Y) — green sits
 *  fourth so it lands inside the initial four caterpillars, not the refill */
const FLY_PALETTE = [
  // `dark`/`mid`/`tip` are the caterpillar's shades: a grub wears the colour of
  // the butterfly it is going to become, so the scene telegraphs the payoff.
  { base: '#FF9C12', light: '#FFC46B', dark: '#c26a00', mid: '#e08600', tip: '#FF12F7' }, // B
  { base: '#12B4FF', light: '#8ADCFF', dark: '#0077c2', mid: '#0f9ce0', tip: '#FF12F7' }, // R
  { base: '#31E300', light: '#8DFF62', dark: '#1f9e00', mid: '#2bc700', tip: '#FF12F7' }, // E
  { base: '#FF12F7', light: '#FF8AFA', dark: '#c200bb', mid: '#e000d8', tip: '#12B4FF' }, // C
  { base: '#FFF712', light: '#FFFB8F', dark: '#c2b800', mid: '#e0d900', tip: '#FF12F7' }, // Y
] as const;

/**
 * Butterfly sprite on the same art grid as the caterpillars, so it reads as the
 * same hand. `#` wing, `L` highlight, `B` body, `A` antenna, `T` antenna tip.
 * The black keyline is derived, not drawn: any wing cell touching empty space
 * becomes outline, which is what gives the caterpillars their sticker edge.
 */
const BUTTERFLY_ART = [
  '....T.....T....',
  '.....A...A.....',
  '......A.A......',
  '..#####B#####..',
  '##LL###B###LL##',
  '###L###B###L###',
  '.######B######.',
  '...####B####...',
  '..##L##B##L##..',
  '..#####B#####..',
  '...####B####...',
  '....###B###....',
  '.....##B##.....',
  '.......B.......',
] as const;

const FLY_W = BUTTERFLY_ART[0].length * S; // 45px
const FLY_H = BUTTERFLY_ART.length * S; // 42px

/** Open sky above the branches for the butterflies to climb into */
const FLY_CEILING = 104;
/** Butterflies on the wing at once; hatching a new one sends the oldest away */
const MAX_FLIES = 4;

// BRYCE palette
const INK = '#141510';
/* The footer band is INK, so the scene can no longer use INK as its keyline —
   every silhouette would sink into the background. Two tokens take over:
   BARK gives the limb its own material instead of a black cutout, and OUTLINE
   is the light keyline that lifts each sprite off the dark. INK stays only
   where a dark mark still reads: the eye pupil, and the butterflies' internal
   linework, which sits inside bright wings rather than against the backdrop. */
const BARK = '#7a5230';
const BARK_LIT = '#a97b4a';
const OUTLINE = '#faf7f2';
const GREEN = '#31E300';
const GREEN_DARK = '#1f9e00';
const ORANGE = '#FF9C12';
const ORANGE_DARK = '#c26a00';
const ORANGE_LIGHT = '#ffb44d';
const YELLOW = '#FFF712';
const SPARKLE_COLORS = ['#FF9C12', '#12B4FF', '#FF12F7', '#31E300', '#FFF712'] as const;

const CAT_W = 15; // caterpillar art width

type BugState = 'crawl' | 'cocoon';

interface Branch {
  x: number; // art coords
  y: number;
  w: number;
  dir: 1 | -1; // 1 = attached to left edge (tip points right)
}

interface Bug {
  id: number;
  branchIdx: number;
  ax: number;
  dir: 1 | -1;
  tick: number;
  state: BugState;
  /** Base crawl rate, eased up and down by its own slow cycle */
  speed: number;
  speedRate: number;
  speedPhase: number;
  /** Index into FLY_PALETTE — worn now as a caterpillar, flown later as a fly */
  colorIdx: number;
}

interface Sparkle {
  fx: number; // fraction of width
  ay: number;
  color: string;
  big: boolean;
  life: number; // frames elapsed in the current appearance
  span: number; // how long this appearance lasts
  wait: number; // frames left before it returns somewhere new (0 = on screen)
}

interface Scene {
  branches: Branch[];
  bugs: Bug[];
  sparkles: Sparkle[];
  tick: number;
  hoverId: number | null;
  nextId: number;
  /** Cycles the five BRYCE colours across caterpillars as they appear */
  spawnCount: number;
}

interface HatchedFly {
  id: number;
  colorIdx: number;
}

/** A caught butterfly's parting burst — fixed to the viewport, portaled to body */
interface Burst {
  id: number;
  x: number;
  y: number;
  colors: readonly string[];
}

/** Confetti pieces per catch, and how long they live (matches confetti-burst) */
const BURST_PIECES = 16;
const BURST_MS = 1000;

/** Per-fly flight physics, driven from the rAF loop (CSS px) */
interface FlyPhys {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number; // desync the sine bob between flies
  /** Pace multiplier oscillates smoothly through [mid-amp, mid+amp] ⊂ [0.75, 1] */
  speedMid: number;
  speedAmp: number;
  speedRate: number;
  speedPhase: number;
  speedMul: number; // current value, reused for banking
  whim: number; // reference-frames until the next change of heart
  departing: boolean; // will slip out the next time it reaches a side
  exited: boolean; // past the edge, on its way out of the scene
  el: HTMLDivElement | null;
}

/** Velocity ceilings — the pace multiplier only ever scales down from here */
const FLY_MAX_VX = 1.5;
const FLY_MAX_VY = 0.9;

/** Global trim on cruising speed — scales the whole band, keeping each fly's spread */
const FLY_SPEED_SCALE = 0.85;

/** Each butterfly gets its own cruising range, never faster than the ceiling */
function makeFlyPace() {
  const hi = 0.86 + Math.random() * 0.14; // 0.86 – 1.00 of the ceiling
  const lo = Math.max(0.75, hi - (0.07 + Math.random() * 0.11));
  const speedMid = ((hi + lo) / 2) * FLY_SPEED_SCALE;
  return {
    speedMid,
    speedAmp: ((hi - lo) / 2) * FLY_SPEED_SCALE,
    speedRate: 0.005 + Math.random() * 0.005, // full ease cycle ≈ 10–21s
    speedPhase: Math.random() * Math.PI * 2,
    speedMul: speedMid,
  };
}

/** Returns true once the butterfly is clear of the scene and can be dropped. */
function stepFly(p: FlyPhys, boundsW: number, step: number): boolean {
  // gentle, continuous ease between this fly's own slowest and fastest pace
  p.speedPhase += p.speedRate * step;
  p.speedMul = p.speedMid + p.speedAmp * Math.sin(p.speedPhase);

  p.x += p.vx * p.speedMul * step;
  p.y += p.vy * p.speedMul * step;

  // the ceiling and the branches always turn it back
  const maxY = FLY_CEILING + SCENE_AH * S - FLY_H - 8;
  if (p.y < 2) { p.y = 2; p.vy = Math.abs(p.vy); }
  if (p.y > maxY) { p.y = maxY; p.vy = -Math.abs(p.vy); }

  if (!p.exited) {
    const maxX = Math.max(4, boundsW - FLY_W - 4);
    if (p.x < 4 || p.x > maxX) {
      if (p.departing) {
        p.exited = true; // wandered to the edge on its own — let it carry on out
      } else if (p.x < 4) {
        p.x = 4; p.vx = Math.abs(p.vx);
      } else {
        p.x = maxX; p.vx = -Math.abs(p.vx);
      }
    }
  }

  if (p.exited) {
    return p.x < -FLY_W * 1.5 || p.x > boundsW + FLY_W * 1.5;
  }

  // occasional whims, like the caterpillar prototype's butterflies
  p.whim -= step;
  if (p.whim <= 0) {
    p.vx += (Math.random() - 0.5) * 0.7;
    p.vy += (Math.random() - 0.5) * 0.5;
    p.whim = 80 + Math.random() * 40;
  }
  p.vx = Math.max(-FLY_MAX_VX, Math.min(FLY_MAX_VX, p.vx));
  p.vy = Math.max(-FLY_MAX_VY, Math.min(FLY_MAX_VY, p.vy));
  // never stall out horizontally
  if (Math.abs(p.vx) < 0.25) p.vx = p.vx < 0 ? -0.25 : 0.25;
  return false;
}

function applyFlyTransform(p: FlyPhys, tick: number) {
  if (!p.el) return;
  const bobY = Math.sin(tick * 0.09 + p.phase) * 3 * p.speedMul;
  const bank = Math.max(-14, Math.min(14, p.vx * p.speedMul * 9));
  p.el.style.transform = `translate3d(${p.x}px, ${p.y + bobY}px, 0) rotate(${bank}deg)`;
}

// ── Butterfly sprite ─────────────────────────────────────────────────────────

type Cell = 'ink' | 'base' | 'light' | null;

/** Resolve the art map once, deriving the keyline from the silhouette */
const BUTTERFLY_CELLS: Cell[][] = (() => {
  const h = BUTTERFLY_ART.length;
  const w = BUTTERFLY_ART[0].length;
  const at = (x: number, y: number) =>
    y < 0 || y >= h || x < 0 || x >= w ? '.' : BUTTERFLY_ART[y][x];
  return BUTTERFLY_ART.map((row, y) =>
    [...row].map((ch, x): Cell => {
      if (ch === '.') return null;
      if (ch === 'B' || ch === 'A') return 'ink';
      if (ch === 'T') return 'light';
      const onEdge =
        at(x - 1, y) === '.' || at(x + 1, y) === '.' ||
        at(x, y - 1) === '.' || at(x, y + 1) === '.';
      return onEdge ? 'ink' : ch === 'L' ? 'light' : 'base';
    }),
  );
})();

/** Draws the sprite as merged horizontal runs — ~40 rects instead of 210 */
function PixelButterfly({ base, light }: { base: string; light: string }) {
  const h = BUTTERFLY_CELLS.length;
  const w = BUTTERFLY_CELLS[0].length;
  const rects: React.ReactElement[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const cell = BUTTERFLY_CELLS[y][x];
      if (!cell) { x++; continue; }
      let run = 1;
      while (x + run < w && BUTTERFLY_CELLS[y][x + run] === cell) run++;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={run}
          height={1}
          fill={cell === 'ink' ? INK : cell === 'light' ? light : base}
        />,
      );
      x += run;
    }
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={FLY_W}
      height={FLY_H}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}

// ── Scene state ──────────────────────────────────────────────────────────────

function computeBranches(aw: number): Branch[] {
  const w = Math.min(aw * 0.46, 150);
  return [
    { x: 0, y: 14, w, dir: 1 },
    { x: aw - w, y: 32, w, dir: -1 },
  ];
}

/* Sparkles are slots, not fixed stars: each one fades up somewhere, fades out,
   waits in the dark, then returns at a fresh spot. With the gap running longer
   than the appearance, only a third of the slots are lit at any moment — so 14
   slots read as roughly four or five stars on screen, drifting around the scene
   rather than blinking on and off in place. */
const SPARKLE_COUNT = 14;
const SPARKLE_SPAN_MIN = 85; // visible frames, fade-in through fade-out
const SPARKLE_SPAN_MAX = 150;
const SPARKLE_GAP_MIN = 150; // dark frames before it reappears elsewhere
const SPARKLE_GAP_MAX = 430;
const SPARKLE_MIN_DIST = 16; // art px between two lit sparkles

const randRange = (a: number, b: number) => a + Math.random() * (b - a);

/** Send a sparkle to a fresh spot, clear of the ones currently lit. */
function relocateSparkle(sp: Sparkle, aw: number, others: Sparkle[]) {
  const yMin = 2;
  const ySpan = SCENE_AH - 5; // full canvas height, less room for the star arms
  let ax = aw / 2;
  let ay = yMin + ySpan / 2;
  for (let attempt = 0; attempt < 24; attempt++) {
    ax = 3 + Math.random() * Math.max(1, aw - 6);
    ay = yMin + Math.random() * ySpan;
    const clear = others.every((o) => {
      if (o === sp || o.wait > 0) return true; // only dodge the ones on screen
      const dx = o.fx * aw - ax;
      const dy = o.ay - ay;
      return dx * dx + dy * dy >= SPARKLE_MIN_DIST * SPARKLE_MIN_DIST;
    });
    if (clear) break;
  }
  sp.fx = ax / aw;
  sp.ay = ay;
  sp.color = SPARKLE_COLORS[(Math.random() * SPARKLE_COLORS.length) | 0];
  sp.big = Math.random() < 0.3;
  sp.life = 0;
  sp.span = randRange(SPARKLE_SPAN_MIN, SPARKLE_SPAN_MAX);
  sp.wait = 0;
}

function makeSparkles(aw: number): Sparkle[] {
  const out: Sparkle[] = [];
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    const sp: Sparkle = {
      fx: 0, ay: 0, color: '', big: false, life: 0, span: 0, wait: 0,
    };
    relocateSparkle(sp, aw, out);
    // stagger the opening state so they don't all bloom together on first paint
    if (Math.random() < 0.35) sp.life = Math.random() * sp.span;
    else sp.wait = Math.random() * SPARKLE_GAP_MAX;
    out.push(sp);
  }
  return out;
}

function spawnBug(scene: Scene, branchIdx: number, fromEdge: boolean) {
  const branch = scene.branches[branchIdx];
  if (!branch) return;
  const minAx = branch.x + 2;
  const maxAx = branch.x + branch.w - CAT_W - 3;
  if (maxAx <= minAx) return;
  let ax: number;
  let dir: 1 | -1;
  if (fromEdge) {
    // crawl in from the attached (screen-edge) end of the branch
    ax = branch.dir === 1 ? minAx : maxAx;
    dir = branch.dir;
  } else {
    ax = minAx + Math.random() * (maxAx - minAx);
    dir = Math.random() < 0.5 ? 1 : -1;
  }
  scene.bugs.push({
    id: scene.nextId++,
    branchIdx,
    ax,
    dir,
    tick: Math.floor(Math.random() * 400),
    state: 'crawl',
    speed: 0.042 + Math.random() * 0.03,
    speedRate: 0.006 + Math.random() * 0.007,
    speedPhase: Math.random() * Math.PI * 2,
    colorIdx: scene.spawnCount++ % FLY_PALETTE.length,
  });
}

function initScene(aw: number): Scene {
  const scene: Scene = {
    branches: computeBranches(aw),
    bugs: [],
    sparkles: makeSparkles(aw),
    tick: 0,
    hoverId: null,
    nextId: 0,
    spawnCount: 0,
  };
  const perBranch = aw < 150 ? 1 : 2;
  for (let b = 0; b < scene.branches.length; b++) {
    for (let i = 0; i < perBranch; i++) spawnBug(scene, b, false);
  }
  // spread same-branch bugs apart so they don't stack
  const seen = new Map<number, number>();
  for (const bug of scene.bugs) {
    const n = seen.get(bug.branchIdx) ?? 0;
    const branch = scene.branches[bug.branchIdx];
    if (n > 0) {
      const span = branch.w - CAT_W - 5;
      bug.ax = Math.min(branch.x + 2 + span * 0.68, branch.x + branch.w - CAT_W - 3);
    }
    seen.set(bug.branchIdx, n + 1);
  }
  return scene;
}

function reflowScene(scene: Scene, aw: number) {
  scene.branches = computeBranches(aw);
  for (const bug of scene.bugs) {
    const b = scene.branches[bug.branchIdx];
    if (!b) continue;
    bug.ax = Math.max(b.x + 2, Math.min(bug.ax, b.x + b.w - CAT_W - 3));
  }
}

// ── Pixel drawing ────────────────────────────────────────────────────────────

function fillPx(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(ax * S), Math.round(ay * S), Math.round(aw * S), Math.round(ah * S));
}

function drawSparkles(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  aw: number,
  step: number,
) {
  for (const sp of scene.sparkles) {
    if (sp.wait > 0) {
      sp.wait -= step;
      continue;
    }
    sp.life += step;
    if (sp.life >= sp.span) {
      // it has already faded to nothing — move it on and rest it in the dark
      relocateSparkle(sp, aw, scene.sparkles);
      sp.wait = randRange(SPARKLE_GAP_MIN, SPARKLE_GAP_MAX);
      continue;
    }
    const x = Math.round(sp.fx * aw);
    // one clean swell across the appearance: nothing → bright → nothing
    const bright = Math.sin((sp.life / sp.span) * Math.PI);
    ctx.globalAlpha = Math.max(0, bright) * 0.62;
    const arm = sp.big ? 2 : 1;
    ctx.fillStyle = sp.color;
    ctx.fillRect((x - arm) * S, sp.ay * S, (arm * 2 + 1) * S, S);
    ctx.fillRect(x * S, (sp.ay - arm) * S, S, (arm * 2 + 1) * S);
    ctx.globalAlpha = 1;
  }
}

function drawBranch(ctx: CanvasRenderingContext2D, b: Branch) {
  const tipX = b.dir === 1 ? b.x + b.w - 6 : b.x;
  const bodyX = b.dir === 1 ? b.x : b.x + 6;
  const bodyW = b.w - 6;
  // limb + tapered tip, lit along the top edge so it reads as bark not cutout
  fillPx(ctx, bodyX, b.y, bodyW, 3.5, BARK);
  fillPx(ctx, bodyX, b.y, bodyW, 0.9, BARK_LIT);
  fillPx(ctx, tipX, b.y + 0.75, 6, 2, BARK);
  fillPx(ctx, b.dir === 1 ? tipX + 5 : tipX, b.y + 1.1, 1.5, 1.3, BARK);
  // leaves along the top, with a couple of twigs
  for (let i = 8; i < bodyW - 4; i += 14) {
    const lx = bodyX + i;
    fillPx(ctx, lx, b.y - 2, 2.2, 2.2, GREEN);
    fillPx(ctx, lx + 0.6, b.y - 1.4, 1, 1, GREEN_DARK);
  }
  for (let i = 16; i < bodyW - 6; i += 30) {
    const tx = bodyX + i;
    fillPx(ctx, tx, b.y - 4, 1, 4, BARK);
    fillPx(ctx, tx - 0.6, b.y - 5.6, 2.2, 2.2, GREEN);
  }
}

function drawCaterpillar(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  tick: number,
  dir: 1 | -1,
  hovered: boolean,
  colorIdx: number,
) {
  const t = tick * 0.1;
  const pal = FLY_PALETTE[colorIdx % FLY_PALETTE.length];
  ctx.save();
  if (dir === -1) {
    ctx.translate((ax + CAT_W) * S, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(ax * S, 0);
  }
  const ld = (lax: number, lay: number, law: number, lah: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(lax * S), Math.round(lay * S), Math.round(law * S), Math.round(lah * S));
  };

  const by = ay - 5;

  if (hovered) {
    ctx.globalAlpha = 0.3;
    ld(-1, by - 4.5, 17.5, 12.5, YELLOW);
    ctx.globalAlpha = 1;
  }

  // Legs
  for (let i = 0; i < 5; i++) {
    const lx = 1.2 + i * 2.5;
    const wave = Math.sin(t * 2.2 + i * 1.35) * 0.55;
    ld(lx, ay - 0.8 + Math.abs(wave) * 0.3, 0.8, 1.6 - Math.abs(wave) * 0.2, OUTLINE);
  }

  // Antennae behind head (light stems, pink tips)
  const hx = 11.2;
  const hy = by + Math.sin(t) * 0.28;
  const a1 = Math.sin(t * 0.75) * 0.55;
  const a2 = Math.cos(t * 0.75) * 0.55;
  ld(hx + 0.4 + a1, hy - 2.5, 0.55, 2.2, OUTLINE);
  ld(hx + 1.35 + a2, hy - 2.5, 0.55, 2.2, OUTLINE);
  ld(hx + 0.05 + a1, hy - 3.4, 1.05, 1.05, OUTLINE);
  ld(hx + 1 + a2, hy - 3.4, 1.05, 1.05, OUTLINE);
  ld(hx + 0.2 + a1, hy - 3.25, 0.75, 0.75, pal.tip);
  ld(hx + 1.15 + a2, hy - 3.25, 0.75, 0.75, pal.tip);

  // Body: outline pass, then fills (sticker style)
  for (let i = 0; i <= 4; i++) {
    const sx = 0.8 + i * 2.6;
    const wob = Math.sin(t + i * 0.95) * 0.28;
    ld(sx - 0.45, by + wob - 0.45, 3, 3.4, OUTLINE);
  }
  for (let i = 0; i <= 4; i++) {
    const sx = 0.8 + i * 2.6;
    const wob = Math.sin(t + i * 0.95) * 0.28;
    const sy = by + wob;
    const isHead = i === 4;
    ld(sx, sy, 2.1, 2.5, isHead ? pal.dark : i % 2 === 0 ? pal.base : pal.mid);
    ld(sx + 0.3, sy + 0.25, 0.8, 0.7, pal.light);
    if (isHead) {
      ld(sx + 0.85, sy + 0.65, 0.9, 0.9, '#ffffff');
      ld(sx + 1.1, sy + 0.85, 0.55, 0.55, INK);
    }
  }
  ctx.restore();
}

/**
 * Chrysalis silhouette as [x offset, width] per row, top → bottom: a rounded
 * shoulder near the top tapering to a point at the bottom. The taper is what
 * separates a chrysalis from a barrel — straight sides with rings read as a hive.
 */
const COCOON_POD: readonly (readonly [number, number])[] = [
  [2, 4], // rounded crown
  [1, 6],
  [0.5, 7], // shoulder — widest
  [0.5, 7],
  [0.5, 7],
  [0.5, 7],
  [1, 6],
  [1.5, 5],
  [2, 4], // short taper to a stubby cremaster
  [3, 2],
];

function drawCocoon(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  tick: number,
  hovered: boolean,
) {
  // hangs below the branch (branch is 3.5 art px tall)
  const cy = ay + 3.5;
  const glow = (Math.sin(tick * 0.045) + 1) / 2;
  const sway = Math.sin(tick * 0.03) * 0.35;
  const x = ax + sway;
  const top = cy + 3;

  if (hovered) {
    ctx.globalAlpha = 0.3;
    fillPx(ctx, x - 0.5, cy + 1.5, 9, 15, YELLOW);
    ctx.globalAlpha = 1;
  }

  // silk stem, anchoring it to the branch
  fillPx(ctx, x + 3.6 + sway * 0.4, cy, 0.7, 3.4, OUTLINE);

  // outline pass — each row slightly proud of the fill beneath it
  for (let i = 0; i < COCOON_POD.length; i++) {
    const [ox, w] = COCOON_POD[i];
    fillPx(ctx, x + ox - 0.5, top + i - 0.5, w + 1, 2, OUTLINE);
  }

  // body
  for (let i = 0; i < COCOON_POD.length; i++) {
    const [ox, w] = COCOON_POD[i];
    fillPx(ctx, x + ox, top + i, w, 1, ORANGE);
  }

  // form: lit from the upper left, shadowed down the right flank
  for (let i = 1; i < 7; i++) {
    const [ox] = COCOON_POD[i];
    fillPx(ctx, x + ox + 0.6, top + i, 1.1, 1, ORANGE_LIGHT);
  }
  for (let i = 2; i < COCOON_POD.length - 1; i++) {
    const [ox, w] = COCOON_POD[i];
    fillPx(ctx, x + ox + w - 1, top + i, 1, 1, ORANGE_DARK);
  }

  // the monarch's gold crown — the detail that says chrysalis, not hive
  fillPx(ctx, x + 1.9, top + 1.9, 0.8, 0.8, YELLOW);
  fillPx(ctx, x + 3.6, top + 1.6, 0.8, 0.8, YELLOW);
  fillPx(ctx, x + 5.3, top + 1.9, 0.8, 0.8, YELLOW);
  fillPx(ctx, x + 3.6, top + 4.4, 0.7, 0.7, YELLOW);

  // heartbeat glow — something alive in there
  ctx.globalAlpha = 0.1 + glow * 0.28;
  for (let i = 0; i < COCOON_POD.length; i++) {
    const [ox, w] = COCOON_POD[i];
    fillPx(ctx, x + ox, top + i, w, 1, YELLOW);
  }
  ctx.globalAlpha = 1;
}

function renderScene(canvas: HTMLCanvasElement, scene: Scene, step: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  const aw = canvas.width / S;
  scene.tick += step;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSparkles(ctx, scene, aw, step);
  for (const b of scene.branches) drawBranch(ctx, b);

  for (const bug of scene.bugs) {
    const branch = scene.branches[bug.branchIdx];
    if (!branch) continue;
    const hovered = scene.hoverId === bug.id;
    if (bug.state === 'crawl') {
      if (step > 0) {
        bug.speedPhase += bug.speedRate * step;
        const pace = bug.speed * (1 + 0.28 * Math.sin(bug.speedPhase));
        bug.ax += bug.dir * pace * step;
        // legs and body wobble keep step with how fast it's actually moving
        bug.tick += Math.max(0.5, Math.min(1.4, pace / 0.057)) * step;
        const minAx = branch.x + 2;
        const maxAx = branch.x + branch.w - CAT_W - 3;
        if (bug.ax < minAx) { bug.ax = minAx; bug.dir = 1; }
        if (bug.ax > maxAx) { bug.ax = maxAx; bug.dir = -1; }
      }
      drawCaterpillar(ctx, bug.ax, branch.y, bug.tick, bug.dir, hovered, bug.colorIdx);
    } else {
      bug.tick += step;
      drawCocoon(ctx, bug.ax + 4, branch.y, bug.tick, hovered);
    }
  }
}

function hitTest(scene: Scene, bug: Bug, ax: number, ay: number): boolean {
  const branch = scene.branches[bug.branchIdx];
  if (!branch) return false;
  if (bug.state === 'crawl') {
    return (
      ax >= bug.ax - 2 && ax <= bug.ax + CAT_W + 3 &&
      ay >= branch.y - 10 && ay <= branch.y + 2
    );
  }
  // the pod is drawn from bug.ax + 4, hanging below the branch
  return (
    ax >= bug.ax + 3.5 && ax <= bug.ax + 12.5 &&
    ay >= branch.y + 2 && ay <= branch.y + 19.5
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CaterpillarFooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const flyPhysRef = useRef<Map<number, FlyPhys>>(new Map());
  /** The scene box — a element that never moves, so it can own the cursor */
  const sceneRef2 = useRef<HTMLDivElement>(null);
  /** Last pointer position in scene coords, or null when the pointer is away */
  const pointerRef = useRef<[number, number] | null>(null);
  /** Which butterfly the pointer is currently over, re-tested every frame */
  const hoverFlyRef = useRef<number | null>(null);
  const sceneWRef = useRef(0);
  const rafRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const reducedRef = useRef(false);
  /* undefined = "no inline cursor". The home page's blanket
     `body[data-magnet-cursor] *` rule then hides the OS pointer so the magnet dot
     can lead; pages without that attribute keep their normal arrow. Hard-coding
     'none' here would blank the pointer on every page that draws no cursor. */
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [flies, setFlies] = useState<HatchedFly[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [hint, setHint] = useState<'crawl' | 'hatched' | 'off'>('crawl');
  // SSR renders Click; suppressHydrationWarning on the hint covers the touch case
  const [verb] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
      ? 'Tap'
      : 'Click',
  );

  // fade the "metamorphosis complete" hint out after a moment
  useEffect(() => {
    if (hint !== 'hatched') return;
    const t = window.setTimeout(() => setHint('off'), 3500);
    return () => window.clearTimeout(t);
  }, [hint]);

  // ── Mount / resize / render loop ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const timeouts = timeoutsRef.current;
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setup = () => {
      const w = canvas.offsetWidth || window.innerWidth;
      sceneWRef.current = w;
      canvas.width = w;
      canvas.height = SCENE_AH * S;
      if (sceneRef.current) {
        reflowScene(sceneRef.current, w / S);
      } else {
        sceneRef.current = initScene(w / S);
      }
      if (reducedRef.current) renderScene(canvas, sceneRef.current, 0);
    };

    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(canvas);

    if (!reducedRef.current) {
      let lastTs = performance.now();
      const loop = (ts: number) => {
        const step = Math.min(MAX_STEP, (ts - lastTs) / REF_FRAME_MS);
        lastTs = ts;
        const scene = sceneRef.current;
        if (scene) {
          renderScene(canvas, scene, step);
          let gone: number[] | null = null;
          for (const [id, p] of flyPhysRef.current) {
            const clear = stepFly(p, sceneWRef.current, step);
            applyFlyTransform(p, scene.tick);
            if (clear) (gone ||= []).push(id);
          }
          if (gone) {
            const removed = gone;
            for (const id of removed) flyPhysRef.current.delete(id);
            setFlies((prev) => prev.filter((f) => !removed.includes(f.id)));
          }
          // The butterflies move under the pointer, so hover can change without
          // any mouse event. Re-test each frame — the browser will not repaint
          // the cursor on its own when the target moves and the mouse does not.
          if (pointerRef.current) applyCursorRef.current();
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      for (const t of timeouts) window.clearTimeout(t);
    };
  }, []);

  // ── Interaction (plain handlers — they only touch refs and setState) ─────
  const toArtCoords = (e: React.MouseEvent<HTMLElement>): [number, number] => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) * (canvas.width / rect.width)) / S,
      ((e.clientY - rect.top) * (canvas.height / rect.height)) / S,
    ];
  };

  /** Pointer in scene-box coords — the frame the flies are positioned in */
  const toSceneCoords = (e: React.MouseEvent<HTMLElement>): [number, number] => {
    const rect = sceneRef2.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const scene = sceneRef.current;
    if (!scene) return;
    pointerRef.current = toSceneCoords(e);

    const [ax, ay] = toArtCoords(e);
    const hit = scene.bugs.find((b) => hitTest(scene, b, ax, ay)) ?? null;
    const newId = hit ? hit.id : null;
    if (newId !== scene.hoverId) {
      scene.hoverId = newId;
      if (reducedRef.current && canvasRef.current) {
        renderScene(canvasRef.current, scene, 0);
      }
    }
    applyCursor();
  };

  const handleMouseLeave = () => {
    const scene = sceneRef.current;
    if (scene) scene.hoverId = null;
    pointerRef.current = null;
    hoverFlyRef.current = null;
    setCursor(undefined);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    if (!canvas || !scene) return;

    // a butterfly under the pointer takes the click before the branch does
    pointerRef.current = toSceneCoords(e);
    const caught = flyUnderPointer();
    if (caught) {
      handleCatchFly(caught);
      return;
    }

    const [ax, ay] = toArtCoords(e);
    const bug = scene.bugs.find((b) => hitTest(scene, b, ax, ay));
    if (!bug) return;
    const branch = scene.branches[bug.branchIdx];

    if (bug.state === 'crawl') {
      bug.state = 'cocoon';
      // keep the cocoon fully on the branch
      bug.ax = Math.max(branch.x + 2, Math.min(bug.ax, branch.x + branch.w - 12));
    } else {
      // hatch: the butterfly arrives in the colour the caterpillar was wearing
      const colorIdx = bug.colorIdx;
      scene.bugs = scene.bugs.filter((b) => b.id !== bug.id);
      scene.hoverId = null;
      setCursor(undefined);
      // At capacity, the longest-resident butterfly takes its leave — it keeps
      // flying as normal and slips out whenever it next drifts to a side.
      // Map preserves insertion order, so the first non-departing entry is the oldest.
      const resident = [...flyPhysRef.current.values()].filter((p) => !p.departing);
      if (resident.length >= MAX_FLIES) {
        resident[0].departing = true;
      }

      const flyId = scene.nextId++;
      const spawnX = Math.max(4, Math.min((bug.ax + 7.5) * S - FLY_W / 2, canvas.width - FLY_W - 4));
      const spawnY = Math.max(2, FLY_CEILING + (branch.y - 8) * S);
      flyPhysRef.current.set(flyId, {
        x: spawnX,
        y: spawnY,
        vx: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.6),
        vy: -(0.5 + Math.random() * 0.35),
        phase: Math.random() * Math.PI * 2,
        ...makeFlyPace(),
        whim: 80 + Math.random() * 40,
        departing: false,
        exited: false,
        el: null,
      });
      setFlies((prev) => [...prev, { id: flyId, colorIdx }]);
      setHint((h) => (h === 'crawl' ? 'hatched' : h));
      // a new caterpillar wanders in from the edge after a bit
      const branchIdx = bug.branchIdx;
      timeoutsRef.current.push(
        window.setTimeout(() => {
          const s = sceneRef.current;
          if (!s) return;
          spawnBug(s, branchIdx, true);
          if (reducedRef.current && canvasRef.current) renderScene(canvasRef.current, s, 0);
        }, 6500),
      );
    }
    if (reducedRef.current) renderScene(canvas, scene, 0);
  };

  /**
   * Which butterfly is under the pointer, tested against the flight physics
   * rather than the DOM. The wrappers bank up to 14°, so the browser's own hit
   * test misses the corners of what looks like a solid sprite; and because this
   * runs from the rAF loop it also catches a butterfly drifting into a pointer
   * that is holding still, which `:hover` alone will not repaint for.
   */
  const flyUnderPointer = (): HatchedFly | null => {
    const p = pointerRef.current;
    const scene = sceneRef.current;
    if (!p || !scene) return null;
    const [px, py] = p;
    // topmost first: later flies are painted over earlier ones
    for (let i = flies.length - 1; i >= 0; i--) {
      const fly = flies[i];
      const phys = flyPhysRef.current.get(fly.id);
      if (!phys) continue;
      const bobY = Math.sin(scene.tick * 0.09 + phys.phase) * 3 * phys.speedMul;
      const y = phys.y + bobY;
      if (px >= phys.x && px <= phys.x + FLY_W && py >= y && py <= y + FLY_H) return fly;
    }
    return null;
  };

  /** Net over a butterfly, wand over a caterpillar, nothing over bare scene */
  const applyCursor = () => {
    const fly = flyUnderPointer();
    hoverFlyRef.current = fly ? fly.id : null;
    if (fly) {
      setCursor('url(/cursors/butterfly-net-32.png) 11 7, pointer');
    } else if (sceneRef.current?.hoverId != null) {
      setCursor('url(/cursors/magic-wand-32.png) 2 2, pointer');
    } else {
      setCursor(undefined);
    }
  };
  const applyCursorRef = useRef(applyCursor);
  applyCursorRef.current = applyCursor;

  /** Net a butterfly out of the air: it pops into confetti in its own colours. */
  const handleCatchFly = (fly: HatchedFly) => {
    const phys = flyPhysRef.current.get(fly.id);
    const sceneRect = sceneRef2.current?.getBoundingClientRect();
    flyPhysRef.current.delete(fly.id);
    setFlies((prev) => prev.filter((f) => f.id !== fly.id));
    hoverFlyRef.current = null;
    setCursor(undefined);

    // reduced motion: the catch still lands, it just doesn't throw confetti
    if (reducedRef.current || !phys || !sceneRect) return;
    const pal = FLY_PALETTE[fly.colorIdx];
    const burstId = fly.id;
    setBursts((prev) => [
      ...prev,
      {
        id: burstId,
        x: sceneRect.left + phys.x + FLY_W / 2,
        y: sceneRect.top + phys.y + FLY_H / 2,
        // led by the butterfly's own two shades, so the burst reads as *it*
        colors: [pal.base, pal.light, ...SPARKLE_COLORS],
      },
    ]);
    timeoutsRef.current.push(
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, BURST_MS),
    );
  };

  const hintText = hint === 'crawl' ? `${verb} on a caterpillar` : 'Metamorphosis complete';

  return (
    <footer className="landing-footer">
      {/* ── Footer info ── */}
      <div className="footer-content">
        <p className="footer-tagline">
          Helping products grow from caterpillars into butterflies.
        </p>

        {/* the two link columns travel together as one right-hand group, so
            EXPLORE can't drift into the middle as the viewport widens */}
        <div className="footer-links">
          <nav className="footer-col" aria-label="Footer navigation">
            <span className="footer-col-label">EXPLORE</span>
            <Link href="/" className="footer-link">HOME</Link>
            <Link href="/case-studies" className="footer-link">PROJECTS</Link>
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

      {/* ── Interactive branch scene ── */}
      {/* The scene box owns the pointer: it covers the branches AND the airspace
          the butterflies fly in, and unlike the sprites it never moves, so the
          cursor it carries repaints reliably. */}
      <div
        className="footer-scene"
        ref={sceneRef2}
        style={{ paddingTop: FLY_CEILING, cursor }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* The canvas carries the same cursor as its parent. It cannot simply
            inherit it: `body[data-magnet-cursor] *` sets `cursor: none` on every
            descendant, and a directly-matched rule beats an inherited value, so
            the branch half of the scene would drop the wand and the net. An
            inline value outranks that blanket rule, as its comment intends. */}
        <canvas
          ref={canvasRef}
          style={{ cursor }}
          aria-label="Interactive scene: click the caterpillars to watch them become butterflies"
          role="img"
        />
        {flies.map((fly) => (
          <div
            key={fly.id}
            className="footer-br-fly"
            ref={(el) => {
              const p = flyPhysRef.current.get(fly.id);
              if (p && el) {
                p.el = el;
                // place immediately so the pop-in happens at the cocoon, not at 0,0
                el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
              }
            }}
          >
            <PixelButterfly
              base={FLY_PALETTE[fly.colorIdx].base}
              light={FLY_PALETTE[fly.colorIdx].light}
            />
          </div>
        ))}
        {hint !== 'off' && (
          <span
            suppressHydrationWarning
            className={`footer-hint${hint === 'hatched' ? ' footer-hint-done' : ''}`}
          >
            {hintText}
          </span>
        )}

        {/* Catch confetti — portaled to body so the scene's `overflow: clip`
            can't crop the burst at the footer's edges */}
        {bursts.map((burst) =>
          createPortal(
            <div
              key={burst.id}
              className="confetti-container"
              style={{ left: burst.x, top: burst.y }}
            >
              {Array.from({ length: BURST_PIECES }, (_, i) => {
                const angle = (i / BURST_PIECES) * Math.PI * 2 + Math.random() * 0.5;
                const dist = 40 + Math.random() * 60;
                return (
                  <span
                    key={i}
                    className="confetti-piece"
                    style={
                      {
                        backgroundColor: burst.colors[i % burst.colors.length],
                        '--cx': `${Math.cos(angle) * dist}px`,
                        '--cy': `${Math.sin(angle) * dist - 30}px`,
                        '--cr': `${Math.random() * 720 - 360}deg`,
                        animationDelay: `${Math.random() * 0.1}s`,
                      } as React.CSSProperties
                    }
                  />
                );
              })}
            </div>,
            document.body,
          ),
        )}
      </div>

      <div className="footer-bottom">
        <span>© 2026 BRYCE RUTILA</span>
        <span className="footer-bottom-note">
          No butterflies were harmed in the making of this site
        </span>
      </div>
    </footer>
  );
}
