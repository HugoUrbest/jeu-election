// Génère les images de docs/ à partir des fichiers de travail du jeu (PDF et visuels).
// Usage : npm run images   (JEU_ELECTION_SRC permet de pointer vers un autre dossier source)
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = process.env.JEU_ELECTION_SRC ?? '/Users/hugo/Desktop/Perso/jeu Election';
const img = join(root, 'docs/assets/img');
const navy = '#1c2b3a';

async function variants(input, name, widths, { avif = true } = {}) {
  for (const w of widths) {
    const base = sharp(input).resize({ width: w, withoutEnlargement: true });
    await base.clone().webp({ quality: 82, effort: 6 }).toFile(join(img, `${name}-${w}.webp`));
    if (avif) await base.clone().avif({ quality: 55, effort: 6 }).toFile(join(img, `${name}-${w}.avif`));
  }
}

// Plateau : rendu vectoriel du PDF, fond transparent, marges rognées.
const tmp = mkdtempSync(join(tmpdir(), 'election-'));
const boardPng = join(tmp, 'plateau.png');
execFileSync('osascript', ['-l', 'JavaScript', join(root, 'tools/render-pdf.js'),
  join(src, 'plateau_election_v24.pdf'), boardPng, '3200', '0', 'transparent']);
const board = await sharp(boardPng).trim().png().toBuffer();
await variants(board, 'plateau', [800, 1400]);
await variants(board, 'plateau', [3000], { avif: false });

// Maquette « vue de dessus » (boîte, plateau, cartes) et couvercle.
const table = join(src, 'visuels/election_vue_de_dessus.png');
await variants(table, 'table', [1280, 1920, 2560]);
await variants(join(src, 'visuels/election_couvercle.png'), 'boite', [640, 1080]);

// Image de partage (Open Graph) 1200 x 630.
await sharp(table).resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 84, mozjpeg: true }).toFile(join(root, 'docs/og.jpg'));

// Icône iOS : cocarde sur fond bleu nuit.
const cocarde = await sharp(join(root, 'docs/favicon.svg'), { density: 300 }).resize(150, 150).png().toBuffer();
await sharp({ create: { width: 180, height: 180, channels: 4, background: navy } })
  .composite([{ input: cocarde, gravity: 'centre' }]).png().toFile(join(root, 'docs/apple-touch-icon.png'));

rmSync(tmp, { recursive: true, force: true });
console.log('Images générées dans docs/assets/img');
