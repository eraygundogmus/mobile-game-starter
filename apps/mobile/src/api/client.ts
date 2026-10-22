// The game API (apps/server). Set EXPO_PUBLIC_API_BASE for a deployed server.
// An Android emulator reaches the computer at http://10.0.2.2:8787, a real phone at http://<computer-ip>:8787.
import { dailySeed, dayKey, ENGINE_VERSION } from '@game/engine';

export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:8787').replace(/\/+$/, '');

export interface Daily {
  day: string;
  seed: number;
  /** False when the server did not answer and the app computed the seed itself. */
  online: boolean;
}

export interface RunResult {
  id: string;
  day: string;
  score: number;
  ticks: number;
  hash: string;
  rank: number;
}

export interface BoardRow {
  rank: number;
  name: string;
  score: number;
  ticks: number;
}

async function call<T>(path: string, init?: RequestInit, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** The server day and seed. Offline, the same function in the engine gives the same seed. */
export async function getDaily(): Promise<Daily> {
  try {
    const d = await call<{ day: string; seed: number; engine: number }>('/v1/daily', undefined, 3000);
    if (d.engine === ENGINE_VERSION) return { day: d.day, seed: d.seed, online: true };
  } catch {
    // Offline or an old server: play the local daily seed.
  }
  const day = dayKey(Date.now());
  return { day, seed: dailySeed(day), online: false };
}

export function submitRun(body: { id: string; day: string; name: string; log: string }): Promise<RunResult> {
  return call<RunResult>('/v1/runs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...body, engine: ENGINE_VERSION }),
  });
}

export function getBoard(day?: string): Promise<{ day: string; rows: BoardRow[] }> {
  return call(`/v1/leaderboard${day ? `?day=${day}` : ''}`);
}
