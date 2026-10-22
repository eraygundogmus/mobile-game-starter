#!/usr/bin/env node
// Generates the art masters listed in art/prompts.json with the Higgsfield CLI.
// Each prompt = catalog stylePrefix + asset prompt + catalog constraints, so every image shares one style.
// Generate the style anchors first; later assets can point to them in "references".
//
// Usage: node scripts/gen-art.mjs                 plan only: lists what it would generate (no cost)
//        node scripts/gen-art.mjs --go            generates missing masters (paid)
//        options: --only group,group/id  --force  --jobs 4
// Needs the `higgsfield` CLI, signed in. Every generated file adds one line to art/generation-log.jsonl.
// To use another image provider, replace `generate()`; keep the catalog format.
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const go = args.includes('--go');
const force = args.includes('--force');
const only = opt('only', '').split(',').filter(Boolean);
const jobs = Number(opt('jobs', 4));

const abs = (p) => path.resolve(root, p);
const catalog = JSON.parse(fs.readFileSync(abs('art/prompts.json'), 'utf8'));
const logFile = abs('art/generation-log.jsonl');

const selected = catalog.assets.filter((a) => {
  if (only.length && !only.some((o) => o === a.group || o === `${a.group}/${a.id}`)) return false;
  return force || !fs.existsSync(abs(a.master));
});

function promptOf(a) {
  return [a.stylePrefix ?? catalog.stylePrefix, a.prompt, a.constraints ?? catalog.constraints].filter(Boolean).join('\n');
}

function cliArgs(a) {
  const p = [
    catalog.model,
    '--prompt', promptOf(a),
    '--aspect_ratio', a.aspect ?? '1:1',
    '--quality', a.quality ?? catalog.quality,
    '--resolution', a.resolution ?? catalog.resolution,
  ];
  if (a.background) p.push('--background', a.background);
  for (const ref of a.references ?? []) p.push('--image-references', abs(ref));
  return p;
}

async function hf(argv) {
  const { stdout } = await run('higgsfield', [...argv, '--json'], { maxBuffer: 16 * 1024 * 1024 });
  return JSON.parse(stdout);
}

const findId = (v) => (typeof v === 'string' ? v : Array.isArray(v) ? findId(v[0]) : (v?.id ?? v?.job_id ?? null));
function findUrl(v) {
  if (!v || typeof v !== 'object') return null;
  if (typeof v.result_url === 'string') return v.result_url;
  for (const x of Object.values(v)) {
    const u = findUrl(x);
    if (u) return u;
  }
  return null;
}

async function generate(a) {
  const missing = (a.references ?? []).find((r) => !fs.existsSync(abs(r)));
  if (missing) return console.warn(`skip ${a.group}/${a.id}: reference ${missing} does not exist yet`);
  const t0 = Date.now();
  const id = findId(await hf(['generate', 'create', ...cliArgs(a)]));
  if (!id) throw new Error('no job id');
  const url = findUrl(await hf(['generate', 'wait', id, '--quiet', '--timeout', '12m', '--interval', '4s']));
  if (!url) throw new Error('no result url');
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  fs.mkdirSync(path.dirname(abs(a.master)), { recursive: true });
  fs.writeFileSync(abs(a.master), bytes);
  fs.appendFileSync(logFile, JSON.stringify({ id: `${a.group}/${a.id}`, model: catalog.model, ms: Date.now() - t0, at: new Date().toISOString() }) + '\n');
  console.log(`ok ${a.group}/${a.id}`);
}

if (!go) {
  console.log(`Plan: ${selected.length} assets (model ${catalog.model}). Nothing was generated. Add --go to generate.\n`);
  for (const a of selected) console.log(`- ${a.group}/${a.id} -> ${a.master}${a.references?.length ? ` (refs: ${a.references.join(', ')})` : ''}`);
  process.exit(0);
}

const queue = [...selected];
const failed = [];
await Promise.all(
  Array.from({ length: jobs }, async () => {
    for (let a = queue.shift(); a; a = queue.shift()) {
      try {
        await generate(a);
      } catch (e) {
        failed.push(`${a.group}/${a.id}`);
        console.error(`FAIL ${a.group}/${a.id}: ${e.message}`);
      }
    }
  }),
);
if (failed.length) {
  console.error(`Failed: ${failed.join(', ')}`);
  process.exitCode = 1;
}
