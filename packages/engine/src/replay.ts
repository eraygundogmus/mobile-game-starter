// Input logs, state hashes and replays. The client records one input per tick and sends the log.
// The server replays the log with the same engine. The server result is the only result.
import { CONFIG, type Config } from './config';
import { createRun, step, type EndReason, type Run } from './sim';

export interface RunSummary {
  score: number;
  ticks: number;
  lives: number;
  end: EndReason;
  hash: string;
}

/** FNV-1a over every integer of the run state. Client and server must give the same hash for the same log. */
export function stateHash(run: Run): string {
  let h = 0x811c9dc5;
  const add = (n: number) => {
    h ^= n >>> 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  };
  add(run.tick);
  add(run.rng.a);
  add(run.rng.b);
  add(run.rng.c);
  add(run.rng.d);
  add(run.x);
  add(run.lives);
  add(run.score);
  add(run.nextSpawnTick);
  add(run.nextId);
  add(run.end === null ? 0 : run.end === 'lives' ? 1 : 2);
  for (const b of run.blocks) {
    add(b.id);
    add(b.x);
    add(b.y);
    add(b.width);
    add(b.speed);
  }
  return h.toString(16).padStart(8, '0');
}

export function summarize(run: Run): RunSummary | null {
  if (!run.end) return null;
  return { score: run.score, ticks: run.tick, lives: run.lives, end: run.end, hash: stateHash(run) };
}

export interface ReplayResult {
  run: Run;
  /** Null when the log ends before the run ends. */
  summary: RunSummary | null;
  /** Inputs after the last tick. A valid log has none. */
  extraTicks: number;
}

export function replay(seed: number, log: ArrayLike<number>, config: Config = CONFIG): ReplayResult {
  const run = createRun(seed, config);
  let i = 0;
  for (; i < log.length && !run.end; i++) step(run, log[i]!);
  return { run, summary: summarize(run), extraTicks: log.length - i };
}

/** Grows by one input per tick, without allocation during a run. */
export class InputLog {
  readonly values: Uint16Array;
  length = 0;
  constructor(capacity = CONFIG.maxTicks) {
    this.values = new Uint16Array(capacity);
  }
  push(targetX: number): void {
    if (this.length < this.values.length) this.values[this.length++] = targetX;
  }
  view(): Uint16Array {
    return this.values.subarray(0, this.length);
  }
  reset(): void {
    this.length = 0;
  }
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Base64url (no padding) of the inputs as little-endian uint16. Works without Buffer or btoa. */
export function encodeLog(log: ArrayLike<number>): string {
  const bytes: number[] = [];
  for (let i = 0; i < log.length; i++) {
    const v = log[i]! & 0xffff;
    bytes.push(v & 0xff, v >>> 8);
  }
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i]! << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += B64[(n >>> 18) & 63]! + B64[(n >>> 12) & 63]!;
    if (i + 1 < bytes.length) out += B64[(n >>> 6) & 63]!;
    if (i + 2 < bytes.length) out += B64[n & 63]!;
  }
  return out;
}

/** The inverse of encodeLog. Returns null for text that is not a valid log. */
export function decodeLog(text: string, maxTicks = CONFIG.maxTicks): Uint16Array | null {
  if (text.length % 4 === 1) return null;
  const bytes: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const ch of text) {
    const v = B64.indexOf(ch);
    if (v < 0) return null;
    acc = ((acc << 6) | v) & 0xffffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acc >>> bits) & 0xff);
    }
  }
  if (bytes.length % 2 !== 0 || bytes.length / 2 > maxTicks) return null;
  const log = new Uint16Array(bytes.length / 2);
  for (let i = 0; i < log.length; i++) log[i] = bytes[2 * i]! | (bytes[2 * i + 1]! << 8);
  return log;
}
