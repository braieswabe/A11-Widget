#!/usr/bin/env node
/**
 * Verify jsDelivr @vX.Y.Z assets match local files (byte-identical MD5).
 */

import { readFileSync } from 'fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const REPO = 'braieswabe/A11-Widget';

function md5(buf) {
  return createHash('md5').update(buf).digest('hex');
}

function md5File(path) {
  return md5(readFileSync(path));
}

function readPackageVersion() {
  const pkg = JSON.parse(
    readFileSync(join(rootDir, 'packages', 'a11y-widget', 'package.json'), 'utf8')
  );
  return pkg.version;
}

async function fetchCdn(tag, filename) {
  const url = `https://cdn.jsdelivr.net/gh/${REPO}@${tag}/${filename}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`CDN ${res.status} for ${url}`);
  }
  const text = await res.text();
  if (text.includes("Couldn't find the requested file")) {
    throw new Error(`CDN missing file: ${url}`);
  }
  return { url, body: text, md5: md5(text) };
}

const version = readPackageVersion();
const tag = `v${version}`;
const assets = [
  { local: `a11y-widget-v${version}.js`, remote: `a11y-widget-v${version}.js` },
  { local: 'a11y-widget.css', remote: 'a11y-widget.css' },
  { local: `a11y-widget-loader-v${version}.js`, remote: `a11y-widget-loader-v${version}.js` }
];

console.log(`🔍 Verifying jsDelivr @${tag} against local files...\n`);

let failed = false;

for (const { local, remote } of assets) {
  const localPath = join(rootDir, local);
  const localMd5 = md5File(localPath);
  try {
    const cdn = await fetchCdn(tag, remote);
    const match = localMd5 === cdn.md5;
    console.log(`${match ? '✅' : '❌'} ${remote}`);
    console.log(`   local: ${localMd5}`);
    console.log(`   cdn:   ${cdn.md5}`);
    if (!match) failed = true;
  } catch (err) {
    console.log(`❌ ${remote}: ${err.message}`);
    failed = true;
  }
  console.log('');
}

if (failed) {
  console.error('CDN verification failed. Push/update git tag v' + version + ' and purge jsDelivr if needed.');
  process.exit(1);
}

console.log('✨ CDN matches local widget assets.\n');
