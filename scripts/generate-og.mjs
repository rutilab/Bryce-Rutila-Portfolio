/**
 * Generates public/og-share.jpg (1200×630) — static Open Graph preview of the home hero
 * (dot grid, butterflies, title + subtitle). Run: node scripts/generate-og.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');
const out = join(publicDir, 'og-share.jpg');

const W = 1200;
const H = 630;
const FRAME_W = 1440;
const FRAME_H = 1024;
const sx = W / FRAME_W;
const sy = H / FRAME_H;

/** Scaled from home `butterflies` layout (page.tsx) + mw() widths. */
const butterflies = [
  { file: 'fly-1.svg', left: 15, top: -21, width: 229.7 },
  { file: 'fly-2.svg', left: 8, top: 360, width: 235.8 },
  { file: 'fly-3.svg', left: -49, top: 840, width: 166.8 },
  { file: 'fly-4.svg', left: 1009, top: -34, width: 223.8 },
  { file: 'fly-5.svg', left: 1308, top: 491, width: 231.4 },
  { file: 'fly-6.svg', left: 1092, top: 782, width: 209 },
];

const dotGridSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#F0F0F0"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect width="100%" height="100%" fill="url(#dots)"/>
</svg>`;

const textSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <text x="${W / 2}" y="248" font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="52" font-weight="700" text-anchor="middle" fill="none" stroke="#ffffff" stroke-width="10" stroke-linejoin="round">Howdy I'm Bryce</text>
  <text x="${W / 2}" y="248" font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="52" font-weight="700" text-anchor="middle" fill="#141510">Howdy I'm Bryce</text>
  <text x="${W / 2}" y="318" font-family="Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="22" font-weight="400" text-anchor="middle" fill="#555555">a product designer who brings ideas to life</text>
</svg>`;

const baseBuf = await sharp(Buffer.from(dotGridSvg)).png().toBuffer();

const composites = [];

for (const b of butterflies) {
  const left = Math.round(b.left * sx);
  const top = Math.round(Math.max(0, b.top * sy));
  const width = Math.round(Math.max(48, b.width * sx));
  const buf = await sharp(join(publicDir, 'butterflies', b.file))
    .resize(width, null, {
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  composites.push({ input: buf, left, top });
}

const textBuf = await sharp(Buffer.from(textSvg)).png().toBuffer();
composites.push({ input: textBuf, left: 0, top: 0 });

await sharp(baseBuf)
  .composite(composites)
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(out);

console.log('Wrote', out);
