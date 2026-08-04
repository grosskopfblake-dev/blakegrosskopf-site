/*
  Generates the social share card: public/og.svg (source) + public/og.png (shipped).

  Why a PNG is the artifact: Twitter/X, LinkedIn, Slack and Facebook do not render
  SVG for og:image, and none of them have the site's webfonts installed — the old
  SVG card fell back to a default face and overflowed the canvas. So the card is
  laid out in a monospace stack (which every renderer has, and which is already
  part of the brand's voice) and rasterised here, once, at build time.

  Run after changing the headline or the cert line:  node scripts/build-og.mjs
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');

/* Content — keep in step with src/lib/site.ts */
const NAME = 'Blake Grosskopf';
const EYEBROW = 'OFFENSIVE SECURITY RESEARCH · RED TEAM';
const LINE_1 = 'I build cloud &amp; enterprise';
const LINE_2_LEAD = 'labs, then break';
const LINE_2_TAIL = ' them.';
const CERTS = 'SC-900 · CARTP · SC-500 · PNPT';
const DOMAIN = 'blakegrosskopf.com';

/* Tokens mirrored from src/styles/tokens.css (dark, the brand default) */
const BG = '#100E10';
const TINT = '#17111A';
const RULE = '#2A2430';
const FG = '#F3EFE8';
const FG_2 = '#A79EA3';
const FG_3 = '#7C737A';
const VERM = '#E1391F';
const VERM_HOT = '#F0603C';

const MONO = "'JetBrains Mono','DejaVu Sans Mono','Liberation Mono',monospace";
const logo = readFileSync(join(pub, 'logo.png')).toString('base64');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" font-family="${MONO}">
  <defs>
    <radialGradient id="tint" cx="82%" cy="16%" r="62%">
      <stop offset="0" stop-color="${TINT}"/>
      <stop offset="1" stop-color="${BG}"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#tint)"/>
  <path d="M0 40.5h1200M0 589.5h1200" stroke="${RULE}" stroke-width="1"/>

  <image x="72" y="60" width="60" height="60" href="data:image/png;base64,${logo}"/>
  <text x="148" y="101" fill="${FG}" font-size="25" letter-spacing="0.5">${NAME}</text>

  <text x="76" y="292" fill="${VERM_HOT}" font-size="19" letter-spacing="3.4">${EYEBROW}</text>
  <path d="M700 286.5h424" stroke="${RULE}" stroke-width="1"/>

  <text x="76" y="392" fill="${FG}" font-size="57" letter-spacing="-1">${LINE_1}</text>
  <text x="76" y="466" fill="${FG}" font-size="57" letter-spacing="-1" xml:space="preserve">${LINE_2_LEAD}<tspan fill="${FG_2}">${LINE_2_TAIL}</tspan></text>

  <rect x="76" y="516" width="34" height="3" fill="${VERM}"/>
  <text x="76" y="562" fill="${FG_2}" font-size="18" letter-spacing="2">${CERTS}</text>
  <text x="1124" y="562" fill="${FG_3}" font-size="18" letter-spacing="1" text-anchor="end">${DOMAIN}</text>
</svg>
`;

writeFileSync(join(pub, 'og.svg'), svg);
const info = await sharp(Buffer.from(svg), { density: 144 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9, palette: true })
  .toFile(join(pub, 'og.png'));

console.log(`og.png written: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)}KB`);
