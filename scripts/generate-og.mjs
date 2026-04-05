/**
 * Generates public/og-share.jpg (1200×630) for Open Graph / iMessage link previews.
 * Run: node scripts/generate-og.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'public', 'og-share.jpg');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <text x="600" y="280" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="56" font-weight="700" text-anchor="middle" fill="#141510">Howdy I'm Bryce</text>
  <text x="600" y="360" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="26" fill="#555555" text-anchor="middle">a product designer who brings ideas to life</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile(out);

console.log('Wrote', out);
