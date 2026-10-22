#!/usr/bin/env node
// Generates the sound effects and music listed in audio/sounds.json with ElevenLabs, then masters them with ffmpeg.
//   SFX:   POST /v1/sound-generation  { text, duration_seconds, prompt_influence, loop }
//   Music: POST /v1/music             { prompt, music_length_ms, force_instrumental }
// Raw takes go to audio/raw/ (git-ignored). Masters go to apps/mobile/assets/audio/{sfx,music}/<id>.m4a.
//
// Usage: node scripts/gen-audio.mjs              plan only (no cost)
//        ELEVENLABS_API_KEY=... node scripts/gen-audio.mjs --go   generates missing takes (paid), then masters
//        options: --only id,id  --force  --master-only
// Needs ffmpeg on PATH for mastering.
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
const masterOnly = args.includes('--master-only');
const only = opt('only', '').split(',').filter(Boolean);

const abs = (p) => path.resolve(root, p);
const catalog = JSON.parse(fs.readFileSync(abs('audio/sounds.json'), 'utf8'));
const logFile = abs('audio/generation-log.jsonl');
const API = 'https://api.elevenlabs.io';

const takes = [
  ...catalog.sfx.map((s) => ({ kind: 'sfx', spec: s, raw: abs(`audio/raw/${s.id}.mp3`), out: abs(`apps/mobile/assets/audio/sfx/${s.id}.m4a`) })),
  ...catalog.music.map((m) => ({ kind: 'music', spec: m, raw: abs(`audio/raw/${m.id}.mp3`), out: abs(`apps/mobile/assets/audio/music/${m.id}.m4a`) })),
].filter((t) => !only.length || only.includes(t.spec.id));

function request(t) {
  const s = t.spec;
  return t.kind === 'sfx'
    ? ['/v1/sound-generation', { text: s.prompt, duration_seconds: Math.min(30, Math.max(0.5, s.seconds)), prompt_influence: s.promptInfluence ?? 0.5, loop: !!s.loop }]
    : ['/v1/music', { prompt: s.prompt, music_length_ms: Math.round(s.seconds * 1000), force_instrumental: true }];
}

async function generate(t) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set');
  const [endpoint, body] = request(t);
  const t0 = Date.now();
  const res = await fetch(`${API}${endpoint}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(t.kind === 'music' ? 600_000 : 120_000),
  });
  if (!res.ok) throw new Error(`${endpoint} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  fs.mkdirSync(path.dirname(t.raw), { recursive: true });
  fs.writeFileSync(t.raw, Buffer.from(await res.arrayBuffer()));
  fs.appendFileSync(logFile, JSON.stringify({ id: t.spec.id, endpoint, ms: Date.now() - t0, at: new Date().toISOString() }) + '\n');
  console.log(`ok ${t.spec.id}`);
}

/** One loudnorm pass: SFX to -16 LUFS mono, music to -18 LUFS stereo, true peak under -1.5 dBTP. */
async function master(t) {
  if (!fs.existsSync(t.raw)) return console.warn(`skip master ${t.spec.id}: no raw take`);
  fs.mkdirSync(path.dirname(t.out), { recursive: true });
  const sfx = t.kind === 'sfx';
  const af = `loudnorm=I=${sfx ? -16 : -18}:TP=-1.5:LRA=11`;
  await run('ffmpeg', ['-hide_banner', '-nostdin', '-y', '-i', t.raw, '-af', af, '-ac', sfx ? '1' : '2', '-ar', '44100', '-c:a', 'aac', '-b:a', sfx ? '96k' : '128k', t.out]);
  console.log(`mastered ${path.relative(root, t.out)}`);
}

const todo = takes.filter((t) => force || !fs.existsSync(t.raw));
if (!go && !masterOnly) {
  console.log(`Plan: ${todo.length} takes to generate, ${takes.length} to master. Nothing was generated. Add --go to generate.\n`);
  for (const t of todo) console.log(`- ${t.kind} ${t.spec.id} (${t.spec.seconds} s): ${t.spec.prompt.slice(0, 80)}…`);
  process.exit(0);
}

if (!masterOnly) {
  for (const t of todo) {
    try {
      await generate(t);
    } catch (e) {
      console.error(`FAIL ${t.spec.id}: ${e.message}`);
      process.exitCode = 1;
    }
  }
}
for (const t of takes) await master(t);
