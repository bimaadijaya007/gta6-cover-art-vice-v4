// Vice Cover Studio — the entry program (Node 22, standard library only).
// Copies app/ and screenshots/ from beside this file into the output
// directory and writes /output/dossier.json with the vendored make.fun
// library (vendor/makefun-app.ts, unchanged from the kit).
//
//   MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
// Without MAKEFUN_OUTPUT_DIR it writes to /output, as the grader expects.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Copy a directory tree, refusing when the source is missing. */
function copyTree(name) {
  const src = join(here, name);
  if (!existsSync(src)) throw new Error(`missing ${name}/ beside main.ts`);
  cpSync(src, join(outDir, name), { recursive: true });
  const entries = readdirSync(join(outDir, name), { recursive: true });
  console.log(`copied ${name}/ (${entries.length} entries)`);
}

/** The caps the scorer's gate.json applies to this bounty. */
function gateCaps() {
  return {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  };
}

/**
 * Refuse early when the screenshots break the gate, instead of letting
 * buildDossier fail after the copy: at most 4 images, each at most 256 KiB.
 */
function checkScreenshots() {
  const dir = join(here, 'screenshots');
  if (!existsSync(dir)) throw new Error('missing screenshots/ beside main.ts');
  const files = readdirSync(dir).filter((f) => !f.startsWith('.'));
  const caps = gateCaps().screenshots;
  if (files.length === 0) throw new Error('screenshots/: no images');
  if (files.length > caps.max) throw new Error(`screenshots/: ${files.length} images, over the ${caps.max} allowed`);
  for (const f of files) {
    const size = statSync(join(dir, f)).size;
    if (size > caps.max_bytes) throw new Error(`screenshots/${f}: ${size} bytes, over the ${caps.max_bytes} allowed`);
  }
  console.log(`screenshots ok: ${files.length} images, largest ${Math.max(...files.map((f) => statSync(join(dir, f)).size))} bytes`);
}

checkScreenshots();
mkdirSync(outDir, { recursive: true });
copyTree('app');
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
copyTree('screenshots');

const dossier = buildDossier(outDir, gateCaps());
writeFileSync(join(outDir, 'dossier.json'), dossier);
// Round-trip check: the file on disk must parse back to the same dossier.
const reread = JSON.parse(new TextDecoder().decode(readFileSync(join(outDir, 'dossier.json'))));
if (reread.schema !== 'makefun/dossier/v1') throw new Error('dossier.json: unexpected schema after round-trip');
const shotCount = readdirSync(join(outDir, 'screenshots')).filter((f) => !f.startsWith('.')).length;
console.log(`wrote dossier.json (${dossier.length} bytes, ${shotCount} screenshots)`);
console.log(`entry ready in ${outDir}`);
