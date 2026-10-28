#!/usr/bin/env node
/**
 * Verify public widget assets (hosted deploy + optional jsDelivr @tag) match local files.
 */

import { readFileSync } from 'fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const REPO = 'braieswabe/A11-Widget';
const HOSTED_ORIGIN = (process.env.WIDGET_PUBLIC_ORIGIN || 'https://a11-widget.vercel.app').replace(
  /\/$/,
  ''
);

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

async function fetchAsset(baseUrl, filename) {
  const url = `${baseUrl}/${filename}`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`${res.status} for ${url}`);
  }
  const text = await res.text();
  if (text.includes("Couldn't find the requested file") || text.includes('Failed to fetch version info')) {
    throw new Error(`Missing or error body: ${url}`);
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

console.log(`🔍 Verifying hosted widget at ${HOSTED_ORIGIN} (v${version})...\n`);

let failed = false;

for (const { local, remote } of assets) {
  const localPath = join(rootDir, local);
  const localMd5 = md5File(localPath);
  try {
    const remoteAsset = await fetchAsset(HOSTED_ORIGIN, remote);
    const match = localMd5 === remoteAsset.md5;
    console.log(`${match ? '✅' : '❌'} [hosted] ${remote}`);
    console.log(`   local: ${localMd5}`);
    console.log(`   remote: ${remoteAsset.md5}`);
    if (!match) failed = true;
  } catch (err) {
    console.log(`❌ [hosted] ${remote}: ${err.message}`);
    failed = true;
  }
  console.log('');
}

console.log(`🔍 Optional: jsDelivr gh @${tag} (requires public GitHub repo)...\n`);

for (const { local, remote } of assets) {
  const localMd5 = md5File(join(rootDir, local));
  const ghBase = `https://cdn.jsdelivr.net/gh/${REPO}@${tag}`;
  try {
    const cdn = await fetchAsset(ghBase, remote);
    const match = localMd5 === cdn.md5;
    console.log(`${match ? '✅' : '⚠️'} [jsdelivr] ${remote}${match ? '' : ' (hash mismatch)'}`);
  } catch (err) {
    console.log(`⚠️ [jsdelivr] ${remote}: ${err.message}`);
  }
}

console.log('');

if (failed) {
  console.error('Hosted widget verification failed. Deploy website/dist assets or update WIDGET_PUBLIC_ORIGIN.');
  process.exit(1);
}

console.log('✨ Hosted widget matches local files.\n');
