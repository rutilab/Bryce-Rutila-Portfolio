'use client';

import { useEffect, useRef, useState } from 'react';
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

// TODO: replace with your real LinkedIn profile URL
const LINKEDIN_URL = 'https://www.linkedin.com/in/';
const EMAIL = 'rutilab@gmail.com';

/**
 * Hatch order cycles the five BRYCE block colors (B-R-Y-C-E). Each is one of the
 * three hero fly shapes recolored, so shape varies alongside color.
 */
const BR_FLY_SRCS = [
  '/butterflies/footer/fly-orange.svg',
  '/butterflies/footer/fly-blue.svg',
  '/butterflies/footer/fly-yellow.svg',
  '/butterflies/footer/fly-pink.svg',
  '/butterflies/footer/fly-green.svg',
] as const;

/** Open sky above the branches for the butterflies to climb into */
const FLY_CEILING = 104;
/** Butterflies on the wing at once; hatching a new one sends the oldest away */
const MAX_FLIES = 4;

// BRYCE palette
const INK = '#141510';
const GREEN = '#31E300';
const GREEN_DARK = '#1f9e00';
const GREEN_LIGHT = '#8dff62';
const ORANGE = '#FF9C12';
const ORANGE_DARK = '#c26a00';
const ORANGE_LIGHT = '#ffb44d';
const YELLOW = '#FFF712';
const PINK = '#FF12F7';
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
}

interface Sparkle {
  fx: number; // fraction of width
  ay: number;
  color: string;
  phase: number;
  big: boolean;
}

interface Scene {
  branches: Branch[];
  bugs: Bug[];
  sparkles: Sparkle[];
  tick: number;
  hoverId: number | null;
  nextId: number;
  hatchCount: number;
}

interface HatchedFly {
  id: number;
  src: string;
}

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

const FLY_SIZE = 56;
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
  const maxY = FLY_CEILING + SCENE_AH * S - FLY_SIZE - 8;
  if (p.y < 2) { p.y = 2; p.vy = Math.abs(p.vy); }
  if (p.y > maxY) { p.y = maxY; p.vy = -Math.abs(p.vy); }

  if (!p.exited) {
    const maxX = Math.max(4, boundsW - FLY_SIZE - 4);
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
    return p.x < -FLY_SIZE * 1.5 || p.x > boundsW + FLY_SIZE * 1.5;
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

// ── Scene state ──────────────────────────────────────────────────────────────

function computeBranches(aw: number): Branch[] {
  const w = Math.min(aw * 0.46, 150);
  return [
    { x: 0, y: 14, w, dir: 1 },
    { x: aw - w, y: 32, w, dir: -1 },
  ];
}

function makeSparkles(): Sparkle[] {
  const out: Sparkle[] = [];
  for (let i = 0; i < 16; i++) {
    out.push({
      fx: (i + 0.15 + Math.random() * 0.7) / 16,
      ay: 3 + Math.random() * (SCENE_AH - 14),
      color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
      phase: Math.random() * Math.PI * 2,
      big: Math.random() < 0.3,
    });
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
  });
}

function initScene(aw: number): Scene {
  const scene: Scene = {
    branches: computeBranches(aw),
    bugs: [],
    sparkles: makeSparkles(),
    tick: 0,
    hoverId: null,
    nextId: 0,
    hatchCount: 0,
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

function drawSparkles(ctx: CanvasRenderingContext2D, scene: Scene, aw: number) {
  for (const sp of scene.sparkles) {
    const x = Math.round(sp.fx * aw);
    const bright = (Math.sin(scene.tick * 0.03 + sp.phase) + 1) / 2;
    ctx.globalAlpha = 0.12 + bright * 0.45;
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
  // limb silhouette + tapered tip
  fillPx(ctx, bodyX, b.y, bodyW, 3.5, INK);
  fillPx(ctx, tipX, b.y + 0.75, 6, 2, INK);
  fillPx(ctx, b.dir === 1 ? tipX + 5 : tipX, b.y + 1.1, 1.5, 1.3, INK);
  // leaves along the top, with a couple of twigs
  for (let i = 8; i < bodyW - 4; i += 14) {
    const lx = bodyX + i;
    fillPx(ctx, lx, b.y - 2, 2.2, 2.2, GREEN);
    fillPx(ctx, lx + 0.6, b.y - 1.4, 1, 1, GREEN_DARK);
  }
  for (let i = 16; i < bodyW - 6; i += 30) {
    const tx = bodyX + i;
    fillPx(ctx, tx, b.y - 4, 1, 4, INK);
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
) {
  const t = tick * 0.1;
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
    ld(lx, ay - 0.8 + Math.abs(wave) * 0.3, 0.8, 1.6 - Math.abs(wave) * 0.2, INK);
  }

  // Antennae behind head (black stems, pink tips)
  const hx = 11.2;
  const hy = by + Math.sin(t) * 0.28;
  const a1 = Math.sin(t * 0.75) * 0.55;
  const a2 = Math.cos(t * 0.75) * 0.55;
  ld(hx + 0.4 + a1, hy - 2.5, 0.55, 2.2, INK);
  ld(hx + 1.35 + a2, hy - 2.5, 0.55, 2.2, INK);
  ld(hx + 0.05 + a1, hy - 3.4, 1.05, 1.05, INK);
  ld(hx + 1 + a2, hy - 3.4, 1.05, 1.05, INK);
  ld(hx + 0.2 + a1, hy - 3.25, 0.75, 0.75, PINK);
  ld(hx + 1.15 + a2, hy - 3.25, 0.75, 0.75, PINK);

  // Body: outline pass, then fills (sticker style)
  for (let i = 0; i <= 4; i++) {
    const sx = 0.8 + i * 2.6;
    const wob = Math.sin(t + i * 0.95) * 0.28;
    ld(sx - 0.45, by + wob - 0.45, 3, 3.4, INK);
  }
  for (let i = 0; i <= 4; i++) {
    const sx = 0.8 + i * 2.6;
    const wob = Math.sin(t + i * 0.95) * 0.28;
    const sy = by + wob;
    const isHead = i === 4;
    ld(sx, sy, 2.1, 2.5, isHead ? GREEN_DARK : i % 2 === 0 ? GREEN : '#2bc700');
    ld(sx + 0.3, sy + 0.25, 0.8, 0.7, GREEN_LIGHT);
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
  fillPx(ctx, x + 3.6 + sway * 0.4, cy, 0.7, 3.4, INK);

  // outline pass — each row slightly proud of the fill beneath it
  for (let i = 0; i < COCOON_POD.length; i++) {
    const [ox, w] = COCOON_POD[i];
    fillPx(ctx, x + ox - 0.5, top + i - 0.5, w + 1, 2, INK);
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
  drawSparkles(ctx, scene, aw);
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
      drawCaterpillar(ctx, bug.ax, branch.y, bug.tick, bug.dir, hovered);
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
  const sceneWRef = useRef(0);
  const rafRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const reducedRef = useRef(false);
  const [cursor, setCursor] = useState('none');
  const [flies, setFlies] = useState<HatchedFly[]>([]);
  const [hint, setHint] = useState<'crawl' | 'cocoon' | 'hatched' | 'off'>('crawl');
  // SSR renders CLICK; suppressHydrationWarning on the hint covers the touch case
  const [verb] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
      ? 'TAP'
      : 'CLICK',
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
  const toArtCoords = (e: React.MouseEvent<HTMLCanvasElement>): [number, number] => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) * (canvas.width / rect.width)) / S,
      ((e.clientY - rect.top) * (canvas.height / rect.height)) / S,
    ];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const [ax, ay] = toArtCoords(e);
    const hit = scene.bugs.find((b) => hitTest(scene, b, ax, ay)) ?? null;
    const newId = hit ? hit.id : null;
    if (newId !== scene.hoverId) {
      scene.hoverId = newId;
      setCursor(newId !== null ? 'url(/cursors/magic-wand-32.png) 2 2, pointer' : 'none');
      if (reducedRef.current && canvasRef.current) {
        renderScene(canvasRef.current, scene, 0);
      }
    }
  };

  const handleMouseLeave = () => {
    const scene = sceneRef.current;
    if (scene) scene.hoverId = null;
    setCursor('none');
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    if (!canvas || !scene) return;
    const [ax, ay] = toArtCoords(e);
    const bug = scene.bugs.find((b) => hitTest(scene, b, ax, ay));
    if (!bug) return;
    const branch = scene.branches[bug.branchIdx];

    if (bug.state === 'crawl') {
      bug.state = 'cocoon';
      // keep the cocoon fully on the branch
      bug.ax = Math.max(branch.x + 2, Math.min(bug.ax, branch.x + branch.w - 12));
      setHint((h) => (h === 'crawl' ? 'cocoon' : h));
    } else {
      // hatch: swap the pixel cocoon for a real BR fly SVG
      const src = BR_FLY_SRCS[scene.hatchCount % BR_FLY_SRCS.length];
      scene.hatchCount++;
      scene.bugs = scene.bugs.filter((b) => b.id !== bug.id);
      scene.hoverId = null;
      setCursor('none');
      // At capacity, the longest-resident butterfly takes its leave — it keeps
      // flying as normal and slips out whenever it next drifts to a side.
      // Map preserves insertion order, so the first non-departing entry is the oldest.
      const resident = [...flyPhysRef.current.values()].filter((p) => !p.departing);
      if (resident.length >= MAX_FLIES) {
        resident[0].departing = true;
      }

      const flyId = scene.nextId++;
      const spawnX = Math.max(4, Math.min((bug.ax + 7.5) * S - FLY_SIZE / 2, canvas.width - FLY_SIZE - 4));
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
      setFlies((prev) => [...prev, { id: flyId, src }]);
      setHint((h) => (h === 'cocoon' || h === 'crawl' ? 'hatched' : h));
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

  const hintText =
    hint === 'crawl'
      ? `[ ${verb} A CATERPILLAR ]`
      : hint === 'cocoon'
        ? `[ NOW ${verb} THE COCOON ]`
        : '[ METAMORPHOSIS COMPLETE ]';

  return (
    <footer className="landing-footer">
      {/* ── Interactive branch scene ── */}
      <div className="footer-scene" style={{ paddingTop: FLY_CEILING }}>
        <canvas
          ref={canvasRef}
          style={{ cursor }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
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
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG sprite, next/image adds nothing */}
            <img src={fly.src} alt="" draggable={false} />
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
      </div>

      {/* ── Footer info ── */}
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-brand-name">BRYCE</span>
          <p className="footer-brand-tagline">
            A systems-thinking product designer building memorable digital experiences.
          </p>
        </div>

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

      <div className="footer-bottom">
        <span>© 2026 BRYCE · DESIGNED &amp; BUILT FROM [IDEA] TO [PROD]</span>
        <span className="footer-bottom-note">NO CATERPILLARS WERE HARMED</span>
      </div>
    </footer>
  );
}
