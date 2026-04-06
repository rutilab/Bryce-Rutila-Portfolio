/**
 * Writes src/app/icon.png (32×32) from the home butterfly asset for the tab icon.
 * Run: node scripts/generate-favicon.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcSvg = join(root, 'public', 'butterflies', 'fly-1.svg');
const out = join(root, 'src', 'app', 'icon.png');

await sharp(srcSvg)
  .resize(32, 32, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(out);

console.log('Wrote', out);
