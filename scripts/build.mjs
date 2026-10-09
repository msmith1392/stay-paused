// Bundles src/ into dist/ and copies static files. Run with --watch to rebuild on change.
import * as esbuild from 'esbuild';
import { cp, rm } from 'node:fs/promises';

const watch = process.argv.includes('--watch');
const outdir = 'dist';

/** @type {import('esbuild').BuildOptions} */
const common = {
  outdir,
  bundle: true,
  // IIFE keeps the MAIN-world gate from leaking globals into the page.
  format: 'iife',
  target: 'chrome120',
  minify: false,
  sourcemap: watch ? 'inline' : false,
  logLevel: 'info',
};

/** @type {import('esbuild').BuildOptions[]} */
const builds = [
  {
    ...common,
    entryPoints: { background: 'src/background.ts', 'popup/popup': 'src/popup/popup.ts' },
  },
  // Two gate variants from one source. The background registers whichever the settings call for.
  { ...common, entryPoints: { gate: 'src/gate.ts' }, define: { __BLOCK_MUTED__: 'false' } },
  { ...common, entryPoints: { 'gate-strict': 'src/gate.ts' }, define: { __BLOCK_MUTED__: 'true' } },
];

async function copyStatic() {
  await cp('public', outdir, { recursive: true });
  await cp('src/popup/popup.html', `${outdir}/popup/popup.html`);
  await cp('src/popup/popup.css', `${outdir}/popup/popup.css`);
}

await rm(outdir, { recursive: true, force: true });

if (watch) {
  const plugins = [{ name: 'copy-static', setup: (b) => b.onEnd(copyStatic) }];
  for (const options of builds) {
    const ctx = await esbuild.context({ ...options, plugins });
    await ctx.watch();
  }
} else {
  await Promise.all(builds.map((options) => esbuild.build(options)));
  await copyStatic();
}
