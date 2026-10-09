#!/usr/bin/env node
/**
 * Sync canonical widget assets (root a11y-widget.js / a11y-widget.css)
 * to the versioned CDN filenames, npm package, and loader targets.
 */

import { copyFileSync, existsSync, readFileSync } from 'fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function md5File(path) {
  const buf = readFileSync(path);
  return createHash('md5').update(buf).digest('hex');
}

function readPackageVersion() {
  const pkgPath = join(rootDir, 'packages', 'a11y-widget', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  if (!pkg.version) {
    console.error('❌ packages/a11y-widget/package.json missing version');
    process.exit(1);
  }
  return pkg.version;
}

const version = readPackageVersion();
const versionedJs = `a11y-widget-v${version}.js`;
const versionedLoader = `a11y-widget-loader-v${version}.js`;

const filesToSync = [
  {
    source: join(rootDir, 'a11y-widget.js'),
    dest: join(rootDir, versionedJs),
    description: `Versioned runtime (${versionedJs})`
  },
  {
    source: join(rootDir, 'a11y-widget.js'),
    dest: join(rootDir, 'packages', 'a11y-widget', 'vendor', 'a11y-widget.core.js'),
    description: 'NPM vendor runtime'
  },
  {
    source: join(rootDir, 'a11y-widget.css'),
    dest: join(rootDir, 'packages', 'a11y-widget', 'assets', 'a11y-widget.css'),
    description: 'NPM widget CSS'
  }
];

console.log(`🔄 Syncing widget v${version} from canonical root assets...\n`);

for (const { source, dest, description } of filesToSync) {
  if (!existsSync(source)) {
    console.error(`❌ Source file not found: ${source}`);
    process.exit(1);
  }

  try {
    copyFileSync(source, dest);
    console.log(`✅ ${description}`);
    console.log(`   ${source}`);
    console.log(`   → ${dest}\n`);
  } catch (error) {
    console.error(`❌ Failed to sync ${description}:`, error.message);
    process.exit(1);
  }
}

const canonicalJs = join(rootDir, 'a11y-widget.js');
const versionedJsPath = join(rootDir, versionedJs);
const npmCore = join(rootDir, 'packages', 'a11y-widget', 'vendor', 'a11y-widget.core.js');

const jsHash = md5File(canonicalJs);
const versionedHash = md5File(versionedJsPath);
const npmHash = md5File(npmCore);

if (jsHash !== versionedHash || jsHash !== npmHash) {
  console.error('❌ Post-sync MD5 mismatch between canonical, versioned, and npm runtime files');
  process.exit(1);
}

if (!existsSync(join(rootDir, versionedLoader))) {
  console.warn(`⚠️  Loader not found: ${versionedLoader} (create/update manually for new releases)`);
} else {
  const loader = readFileSync(join(rootDir, versionedLoader), 'utf8');
  if (!loader.includes(`DEFAULT_VERSION_TAG = "v${version}"`)) {
    console.warn(`⚠️  Loader DEFAULT_VERSION_TAG may not match v${version} — check ${versionedLoader}`);
  }
  if (!loader.includes(`JS_FILE = "${versionedJs}"`)) {
    console.warn(`⚠️  Loader JS_FILE may not match ${versionedJs}`);
  }
}

console.log(`✨ Sync complete. Runtime MD5: ${jsHash}`);
console.log(`📦 CDN tag files to publish: ${versionedJs}, a11y-widget.css, ${versionedLoader}\n`);
