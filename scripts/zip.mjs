// Packages dist/ into release/stay-paused-<version>.zip for the Chrome Web Store.
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifest = JSON.parse(await readFile('dist/manifest.json', 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));

if (manifest.version !== pkg.version) {
  console.error(
    `Version mismatch: manifest.json is ${manifest.version}, package.json is ${pkg.version}`
  );
  process.exit(1);
}

const out = resolve(`release/stay-paused-${manifest.version}.zip`);
await mkdir('release', { recursive: true });
await rm(out, { force: true });
execFileSync('zip', ['-r', '-X', out, '.'], { cwd: 'dist', stdio: 'inherit' });
console.log(`Wrote ${out}`);
