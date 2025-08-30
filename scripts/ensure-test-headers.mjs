#!/usr/bin/env node
/*
  Scans for TypeScript test files missing a top-level test suite header (describe/context)
  and injects a contextual header comment and a wrapping describe block.

  Usage:
    node scripts/ensure-test-headers.mjs           # dry run (list files to change)
    node scripts/ensure-test-headers.mjs --write   # apply changes in-place
*/

import { promises as fs } from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const write = process.argv.includes('--write');

const IGNORE_DIRS = new Set([
  'node_modules', 'out', 'dist', '.git', '.vscode', 'coverage', '.nyc_output'
]);

const TEST_EXTS = new Set(['.ts', '.tsx']);

const isTestFile = (p) => {
  const ext = path.extname(p);
  if (!TEST_EXTS.has(ext)) return false;
  const base = path.basename(p);
  return /\.(test|spec)\.(ts|tsx)$/.test(base);
};

async function walk(dir, results = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.DS_Store')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      await walk(full, results);
    } else if (e.isFile()) {
      if (isTestFile(full)) results.push(full);
    }
  }
  return results;
}

function hasSuiteHeader(src) {
  // Quick check for common frameworks
  return /(\bdescribe\s*\(|\bsuite\s*\(|\bcontext\s*\()/.test(src);
}

function splitImports(lines) {
  // Find the last import/reference line to keep imports top-level
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*import\s+[^;]+;?\s*$/.test(line) ||
        /^\s*import\s*['\"][^'\"]+['\"];?\s*$/.test(line) ||
        /^\s*\/\/\/\s*<reference\s+/.test(line)) {
      lastImportIdx = i;
      continue;
    }
    // Allow blank lines and comments between imports
    if (lastImportIdx >= 0 && /^\s*(\/\/.*)?$/.test(line)) {
      continue;
    }
    // First non-import content after at least one import
    if (lastImportIdx >= 0) break;
  }
  return lastImportIdx;
}

function titleFromPath(absPath) {
  const rel = path.relative(repoRoot, absPath).split(path.sep).join('/');
  const noExt = rel.replace(/\.(test|spec)\.(ts|tsx)$/i, '');
  return noExt; // full contextual path from repo root
}

function wrapWithDescribe(src, relPath) {
  const lines = src.split(/\r?\n/);
  const header = `// Test Suite: ${relPath}`;
  const lastImportIdx = splitImports(lines);
  const before = [];
  const after = [];
  if (lastImportIdx >= 0) {
    // Keep imports and preceding comments as-is, then insert header above them
    const importsBlock = lines.slice(0, lastImportIdx + 1).join('\n');
    const rest = lines.slice(lastImportIdx + 1);
    const trimmedRest = trimLeadingBlank(rest);
    const wrapped = indentBlock(trimmedRest.join('\n'));
    const describeName = titleFromPath(path.join(repoRoot, relPath));
    const body = `${importsBlock}\n\n` +
      `describe('${escapeQuotes(describeName)}', () => {\n` +
      `${wrapped}\n` +
      `});`;
    return `${header}\n${body}`;
  } else {
    const trimmed = trimLeadingBlank(lines);
    const wrapped = indentBlock(trimmed.join('\n'));
    const describeName = titleFromPath(path.join(repoRoot, relPath));
    return `${header}\n` +
      `describe('${escapeQuotes(describeName)}', () => {\n` +
      `${wrapped}\n` +
      `});`;
  }
}

function trimLeadingBlank(lines) {
  let start = 0;
  while (start < lines.length && /^\s*$/.test(lines[start])) start++;
  return lines.slice(start);
}

function indentBlock(block, spaces = 2) {
  const pad = ' '.repeat(spaces);
  return block
    .split(/\n/)
    .map((l) => (l.length ? pad + l : l))
    .join('\n');
}

function escapeQuotes(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function processFile(absPath) {
  const rel = path.relative(repoRoot, absPath).split(path.sep).join('/');
  const src = await fs.readFile(absPath, 'utf8');
  if (hasSuiteHeader(src)) return { changed: false, rel };
  const next = wrapWithDescribe(src, rel);
  if (write) await fs.writeFile(absPath, next, 'utf8');
  return { changed: true, rel };
}

(async () => {
  const files = await walk(repoRoot);
  const testFiles = files.filter(isTestFile);
  const results = [];
  for (const f of testFiles) {
    try {
      const r = await processFile(f);
      if (r.changed) results.push(r.rel);
    } catch (e) {
      console.error(`Failed ${f}:`, e.message);
    }
  }
  if (!write) {
    console.log('Dry run. Files that would be updated:');
    for (const r of results) console.log(' -', r);
    console.log(`Total: ${results.length}`);
  } else {
    console.log('Updated files:');
    for (const r of results) console.log(' -', r);
    console.log(`Total updated: ${results.length}`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

