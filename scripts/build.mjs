// Bundles src/ into dist/ and copies static files. Run with --watch to rebuild on change.
import * as esbuild from 'esbuild';
import { cp, rm } from 'node:fs/promises';

const watch = process.argv.includes('--watch');
const outdir = 'dist';

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: {
    background: 'src/background.ts',
    gate: 'src/gate.ts',
    'popup/popup': 'src/popup/popup.ts',
  },
  outdir,
  bundle: true,
  // IIFE keeps the MAIN-world gate from leaking globals into the page.
  format: 'iife',
  target: 'chrome120',
  minify: false,
  sourcemap: watch ? 'inline' : false,
  logLevel: 'info',
};

async function copyStatic() {
  await cp('public', outdir, { recursive: true });
  await cp('src/popup/popup.html', `${outdir}/popup/popup.html`);
  await cp('src/popup/popup.css', `${outdir}/popup/popup.css`);
}

await rm(outdir, { recursive: true, force: true });

if (watch) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [{ name: 'copy-static', setup: (b) => b.onEnd(copyStatic) }],
  });
  await ctx.watch();
} else {
  await esbuild.build(options);
  await copyStatic();
}
