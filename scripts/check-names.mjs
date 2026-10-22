#!/usr/bin/env node
// Name check: fails when a file name or a text line contains a blocked term.
// Use it to keep names, terms and fiction of other games and brands out of your repo.
// scripts/blocked-names.json keeps only hashes, so the repo never spells the blocked terms.
//
// Usage: node scripts/check-names.mjs              scan the repo (exit 1 on a hit)
//        node scripts/check-names.mjs --hash "Term"  print the entry to add to blocked-names.json
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', 'build', '.wrangler', 'ios', 'android', 'masters', 'raw']);
const BINARY = /\.(png|jpe?g|webp|gif|mp3|m4a|mp4|wav|ogg|wasm|ttf|otf|zip|jks|p8)$/i;

/** Lowercase, no accents, letters and digits only. "Élan-Vital" and "elan vital" give the same text. */
const fold = (text) => text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const hash = (folded) => createHash('sha256').update(folded).digest('hex').slice(0, 16);

const argv = process.argv.slice(2);
if (argv[0] === '--hash') {
  const folded = fold(argv[1] ?? '');
  console.log(JSON.stringify({ length: folded.length, hash: hash(folded) }));
  process.exit(0);
}

const { terms } = JSON.parse(fs.readFileSync(path.join(root, 'scripts/blocked-names.json'), 'utf8'));
const byLength = new Map();
for (const t of terms) byLength.set(t.length, (byLength.get(t.length) ?? new Set()).add(t.hash));

function hits(text) {
  const folded = fold(text);
  let n = 0;
  for (const [length, set] of byLength) {
    for (let i = 0; i + length <= folded.length; i++) if (set.has(hash(folded.slice(i, i + length)))) n++;
  }
  return n;
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), out);
    } else if (e.isFile()) out.push(path.join(dir, e.name));
  }
  return out;
}

let total = 0;
if (byLength.size > 0) {
  for (const file of walk(root, [])) {
    const rel = path.relative(root, file);
    if (rel === 'scripts/blocked-names.json' || rel === 'package-lock.json') continue;
    if (hits(rel)) {
      console.log(`${rel}: blocked term in the file name`);
      total++;
    }
    if (BINARY.test(file)) continue;
    fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (hits(line)) {
        console.log(`${rel}:${i + 1}: blocked term`);
        total++;
      }
    });
  }
}
console.log(`Name check: ${terms.length} blocked terms, ${total} hits.`);
if (total > 0) process.exit(1);
