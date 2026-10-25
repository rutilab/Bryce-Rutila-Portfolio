import { ImageResponse } from 'next/og';
import { BRAND, GLYPH_H, GLYPH_W, INK, PAPER, layoutGlyph, type Pt } from '@/components/home/chipGlyphs';

/**
 * The link preview: BR1 with BRYCE etched across its die, as the splash shows
 * it before it pulls back to the page, wired out to the edges of the card.
 * Built from the same glyphs as the splash, so the two can't drift apart.
 */

export const alt = 'BRYCE etched in circuit traces across the BR1 chip';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const W = size.width;
const H = size.height;

// BR1 in its own board units (CircuitBackground's wide hero chip), scaled up
const CW = 88;
const CH = 64;
const PIN = 8;
const K = 6.4;
const OX = (W - CW * K) / 2;
const OY = (H - CH * K) / 2;
/** Board units → card pixels */
const X = (x: number) => OX + x * K;
const Y = (y: number) => OY + y * K;

const NAME = 'BRYCE';
const GAP = 2;
const NAME_W = NAME.length * GLYPH_W + (NAME.length - 1) * GAP;

const PIN_X = [0.25, 0.5, 0.75].map((f) => CW * f);
const PIN_Y = [0.3, 0.5, 0.7].map((f) => CH * f);

export default function OpengraphImage() {
  // The die, inset in the chip; BRYCE spans nearly all of it, and is drawn
  // heavier than the splash's, since a preview is often thumbnail-sized
  const die = { x: 7, y: 7, w: CW - 14, h: CH - 14 };
  const u = (die.w * 0.9) / NAME_W;
  const nx = die.x + (die.w - NAME_W * u) / 2;
  const ny = die.y + (die.h - GLYPH_H * u) / 2;
  const letters = [...NAME].map((ch, i) => ({
    color: BRAND[i],
    ...layoutGlyph(ch, u, nx + i * (GLYPH_W + GAP) * u, ny, 0, 1),
  }));

  // Bond pads round the die's rim
  const bond: Pt[] = [];
  for (let x = die.x + 4; x <= die.x + die.w - 4; x += 4) bond.push([x, die.y + 2.5], [x, die.y + die.h - 2.5]);
  for (let y = die.y + 6.5; y <= die.y + die.h - 6.5; y += 4) bond.push([die.x + 2.5, y], [die.x + die.w - 2.5, y]);

  // Traces from every pin out to the card's edge, the way the board wires BR1
  const traces: Pt[][] = [
    ...PIN_X.map((x, k): Pt[] => [[X(x), Y(-PIN)], [X(x), Y(-PIN - 6 - 4 * k)], [X(x) - 40 - 30 * k, Y(-PIN - 6 - 4 * k) - 40 - 30 * k], [X(x) - 40 - 30 * k, -10]]),
    ...PIN_X.map((x, k): Pt[] => [[X(x), Y(CH + PIN)], [X(x), Y(CH + PIN + 6 + 4 * (2 - k))], [X(x) + 40 + 30 * (2 - k), Y(CH + PIN + 6 + 4 * (2 - k)) + 40 + 30 * (2 - k)], [X(x) + 40 + 30 * (2 - k), H + 10]]),
    ...PIN_Y.map((y): Pt[] => [[X(-PIN), Y(y)], [-10, Y(y)]]),
    ...PIN_Y.map((y): Pt[] => [[X(CW + PIN), Y(y)], [W + 10, Y(y)]]),
  ];
  const path = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
  // A part on some of the runs, as the board has them
  const nodes: { p: Pt; c: string }[] = [
    { p: [X(-PIN) - 120, Y(PIN_Y[0])], c: BRAND[0] },
    { p: [X(-PIN) - 220, Y(PIN_Y[2])], c: BRAND[2] },
    { p: [X(CW + PIN) + 150, Y(PIN_Y[1])], c: BRAND[1] },
    { p: [X(CW + PIN) + 80, Y(PIN_Y[2])], c: BRAND[3] },
  ];

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: 'flex', background: PAPER }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <pattern id="grid" width={u * 0.5} height={u * 0.5} patternUnits="userSpaceOnUse">
              <path d={`M${u * 0.5} 0H0V${u * 0.5}`} fill="none" stroke={INK} strokeOpacity={0.1} strokeWidth={0.05} />
            </pattern>
          </defs>

          {/* The board around BR1 */}
          <g opacity={0.36}>
            {traces.map((t, k) => (
              <path key={k} d={path(t)} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            ))}
          </g>
          {nodes.map(({ p, c }, k) => (
            <circle key={k} cx={p[0]} cy={p[1]} r={9} fill={c} stroke={INK} strokeWidth={3} />
          ))}

          {/* BR1, in board units */}
          <g transform={`translate(${OX} ${OY}) scale(${K})`}>
            <g opacity={0.62}>
              {PIN_X.map((x) => (
                <path key={`t${x}`} d={`M${x} 0V${-PIN}M${x} ${CH}V${CH + PIN}`} stroke={INK} strokeWidth={2} />
              ))}
              {PIN_Y.map((y) => (
                <path key={`s${y}`} d={`M0 ${y}H${-PIN}M${CW} ${y}H${CW + PIN}`} stroke={INK} strokeWidth={2} />
              ))}
              {[...PIN_X.flatMap((x): Pt[] => [[x, -PIN], [x, CH + PIN]]), ...PIN_Y.flatMap((y): Pt[] => [[-PIN, y], [CW + PIN, y]])].map(
                ([x, y], k) => (
                  <rect key={`f${k}`} x={x - 1.75} y={y - 1.75} width={3.5} height={3.5} fill={INK} />
                ),
              )}
              <rect x={0} y={0} width={CW} height={CH} rx={4} fill={PAPER} stroke={INK} strokeWidth={2} />
            </g>

            {/* The die: fine grid, bond pads, and BRYCE */}
            <rect x={die.x} y={die.y} width={die.w} height={die.h} rx={1.5} fill="url(#grid)" />
            {bond.map(([x, y], k) => (
              <rect key={`b${k}`} x={x - 0.6} y={y - 0.6} width={1.2} height={1.2} fill="none" stroke={INK} strokeOpacity={0.45} strokeWidth={0.12} />
            ))}
            {letters.map((L, i) => (
              <g key={i}>
                {L.strokes.map((s, k) => (
                  <path key={k} d={s.d} fill="none" stroke={INK} strokeWidth={u * 0.26} strokeLinecap="round" strokeLinejoin="round" />
                ))}
                {L.pads.map(({ p, free }, k) =>
                  free ? (
                    <circle key={`p${k}`} cx={p[0]} cy={p[1]} r={u * 0.3} fill={L.color} stroke={INK} strokeWidth={u * 0.1} />
                  ) : (
                    <circle key={`p${k}`} cx={p[0]} cy={p[1]} r={u * 0.18} fill={INK} />
                  ),
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
