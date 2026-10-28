#!/usr/bin/env node
/**
 * Ensures website constants and built SPA bundle use the canonical hosted loader URL.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const pkg = JSON.parse(
  readFileSync(join(root, 'packages', 'a11y-widget', 'package.json'), 'utf8')
);
const version = pkg.version;
const tag = `v${version}`;
const loaderFile = `a11y-widget-loader-v${version}.js`;
const HOSTED_ORIGIN = 'https://a11-widget.vercel.app';
const CANONICAL_LOADER_URL = `${HOSTED_ORIGIN}/${loaderFile}`;

const constantsPath = join(root, 'website', 'src', 'constants.ts');
const constantsSrc = readFileSync(constantsPath, 'utf8');

let failed = false;

function fail(msg) {
  console.error(`❌ ${msg}`);
  failed = true;
}

function pass(msg) {
  console.log(`✅ ${msg}`);
}

const hasConstants =
  constantsSrc.includes(`WIDGET_CDN_REF = '${tag}'`) &&
  constantsSrc.includes(`WIDGET_LOADER_FILENAME = '${loaderFile}'`) &&
  constantsSrc.includes('WIDGET_HOSTED_ORIGIN') &&
  constantsSrc.includes(HOSTED_ORIGIN) &&
  constantsSrc.includes(loaderFile);
if (!hasConstants) {
  fail(`constants.ts not aligned to hosted loader ${CANONICAL_LOADER_URL}`);
} else {
  pass(`constants.ts targets ${CANONICAL_LOADER_URL}`);
}

for (const file of ['a11y-widget.js', loaderFile, `a11y-widget-v${version}.js`]) {
  const p = join(root, file);
  if (!existsSync(p)) {
    fail(`Missing release file: ${file}`);
  } else {
    pass(`Found ${file}`);
  }
}

const assetsDir = join(root, 'website', 'dist', 'assets');
const distAssets = existsSync(assetsDir)
  ? readdirSync(assetsDir)
      .filter((f) => /^index-.*\.js$/.test(f))
      .map((f) => join(assetsDir, f))
  : [];
if (distAssets.length === 0) {
  fail('No website build found. Run: cd website && npm run build');
} else {
  const bundle = readFileSync(distAssets[0], 'utf8');
  if (!bundle.includes(loaderFile)) {
    fail(`Built SPA bundle missing loader filename (rebuild website)`);
  } else {
    pass(`Built bundle (${distAssets[0].split('/').pop()}) references ${loaderFile}`);
  }
  if (bundle.includes('a11y-widget-loader-script')) {
    pass('Built bundle injects loader script (not direct runtime-only path)');
  } else {
    fail('Built bundle does not appear to use loader injection');
  }
}

if (failed) {
  process.exit(1);
}

console.log(`\n✨ Loader alignment OK for ${tag}\n`);
console.log(CANONICAL_LOADER_URL);
