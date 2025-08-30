/*
  Header & Docstring Audit Script

  Scans TS/JS files to determine whether they include:
  - A file-level header at the very top (block or line comment)
  - At least one JSDoc-style docstring (/** ... */) in the body

  Output:
  - Writes CSV to docs/header-docstring-tracking.csv

  Usage:
  - npm run audit:headers

  Notes:
  - Heuristic-based; intended to assist manual review rather than enforceable policy.
*/

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const includeExt = new Set(['.ts', '.tsx', '.js', '.jsx']);
const excludeDirs = new Set([
  'node_modules', 'out', 'dist', 'coverage', '.git', '.vscode', '.idea'
]);

async function readFileSafe(filePath) {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

async function* walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (excludeDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

function analyzeContent(content) {
  // Remove BOM and leading blank lines
  let text = content.replace(/^\uFEFF?/, '');
  text = text.replace(/^(?:\s*\r?\n)*/, '');

  let headerType = 'none';
  let headerContent = '';
  let headerEndIdx = 0; // index in `text` after header

  if (text.startsWith('/*')) {
    const end = text.indexOf('*/');
    if (end !== -1) {
      headerType = text.startsWith('/**') ? 'docblock' : 'block';
      headerContent = text.slice(0, end + 2);
      headerEndIdx = end + 2;
    }
  } else if (text.startsWith('//')) {
    // Gather consecutive line comments
    const lines = text.split(/\r?\n/);
    let i = 0;
    while (i < lines.length && lines[i].trimStart().startsWith('//')) i++;
    headerType = 'line';
    headerContent = lines.slice(0, i).join('\n');
    headerEndIdx = headerContent.length;
    // account for newline after header block
    if (text[headerEndIdx] === '\n') headerEndIdx += 1;
  }

  const headerContainsPurpose = /\b(purpose|description|usage)\b/i.test(headerContent);
  const afterHeader = text.slice(headerEndIdx);
  const docblockCount = (afterHeader.match(/\/\*\*/g) || []).length;

  const exportRe = /\bexport\s+(default\s+)?(class|function|const|let|var|interface|type|enum)/g;
  const exportBraceRe = /\bexport\s*\{/g; // re-exports
  const exportsCount = ((afterHeader.match(exportRe) || []).length) + ((afterHeader.match(exportBraceRe) || []).length);

  return {
    hasHeader: headerType !== 'none',
    headerType,
    headerContainsPurpose,
    docblockCount,
    hasDocstring: docblockCount > 0,
    exportsCount
  };
}

function toCsvRow(values) {
  return values.map(v => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',');
}

async function main() {
  const rows = [];
  rows.push([
    'path', 'lang', 'has_header', 'header_type', 'header_contains_purpose',
    'has_docstring', 'docblock_count', 'exports_count', 'doc_coverage_ratio'
  ]);

  for await (const filePath of walk(root)) {
    const ext = path.extname(filePath).toLowerCase();
    if (!includeExt.has(ext)) continue;

    const rel = path.relative(root, filePath).replace(/\\/g, '/');
    // Skip files under docs/media/assets by path filter
    if (rel.startsWith('docs/')) continue;

    const content = await readFileSafe(filePath);
    const a = analyzeContent(content);
    const lang = ext.replace('.', '');
    const ratio = a.exportsCount ? (a.docblockCount / a.exportsCount) : (a.docblockCount > 0 ? 1 : 0);

    rows.push([
      rel,
      lang,
      a.hasHeader,
      a.headerType,
      a.headerContainsPurpose,
      a.hasDocstring,
      a.docblockCount,
      a.exportsCount,
      ratio.toFixed(2)
    ]);
  }

  const outDir = path.join(root, 'docs');
  const outFile = path.join(outDir, 'header-docstring-tracking.csv');
  await fs.promises.mkdir(outDir, { recursive: true });
  const csv = rows.map(toCsvRow).join('\n') + '\n';
  await fs.promises.writeFile(outFile, csv, 'utf8');
  console.log(`Wrote ${outFile}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

