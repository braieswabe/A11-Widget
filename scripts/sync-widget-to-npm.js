#!/usr/bin/env node
/**
 * Sync widget files from root to npm package
 * Ensures npm package always has the latest widget core and CSS files
 */

import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const filesToSync = [
  {
    source: join(rootDir, 'a11y-widget-v1.1.0.js'),
    dest: join(rootDir, 'packages/a11y-widget/vendor/a11y-widget.core.js'),
    description: 'Widget core file'
  },
  {
    source: join(rootDir, 'a11y-widget.css'),
    dest: join(rootDir, 'packages/a11y-widget/assets/a11y-widget.css'),
    description: 'Widget CSS file'
  }
];

console.log('🔄 Syncing widget files to npm package...\n');

let syncedCount = 0;
let skippedCount = 0;

for (const { source, dest, description } of filesToSync) {
  if (!existsSync(source)) {
    console.error(`❌ Source file not found: ${source}`);
    process.exit(1);
  }

  try {
    copyFileSync(source, dest);
    console.log(`✅ Synced: ${description}`);
    console.log(`   ${source} → ${dest}\n`);
    syncedCount++;
  } catch (error) {
    console.error(`❌ Failed to sync ${description}:`, error.message);
    process.exit(1);
  }
}

console.log(`\n✨ Sync complete! ${syncedCount} file(s) synced, ${skippedCount} skipped.`);
console.log('📦 NPM package is now up to date with latest widget changes.\n');
