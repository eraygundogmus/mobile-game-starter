// Daily runs: the server replays every log with the shared engine. The client never reports a score.
import { CONFIG, dailySeed, dayKey, decodeLog, ENGINE_VERSION, isDayKey, previousDayKey, replay } from '@game/engine';
import type { Env } from './env';
import { HttpError, json, readJson } from './http';

const ID = /^[A-Za-z0-9_-]{8,64}$/;
const NAME = /^[\p{L}\p{N} ._-]{1,16}$/u;

export interface RunResultDTO {
  id: string;
  day: string;
  score: number;
  ticks: number;
  hash: string;
  rank: number;
}

export interface BoardRowDTO {
  rank: number;
  name: string;
  score: number;
  ticks: number;
}

interface RunRow {
  id: string;
  day: string;
  score: number;
  ticks: number;
  hash: string;
  created_at: number;
}

export function getDaily(now: number): Response {
  const day = dayKey(now);
  return json({ day, seed: dailySeed(day), engine: ENGINE_VERSION, maxTicks: CONFIG.maxTicks });
}

async function rankOf(env: Env, row: RunRow): Promise<number> {
  const ahead = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM runs WHERE day = ?1 AND (score > ?2 OR (score = ?2 AND created_at < ?3))',
  )
    .bind(row.day, row.score, row.created_at)
    .first<{ n: number }>();
  return (ahead?.n ?? 0) + 1;
}

async function result(env: Env, row: RunRow): Promise<Response> {
  const dto: RunResultDTO = { id: row.id, day: row.day, score: row.score, ticks: row.ticks, hash: row.hash, rank: await rankOf(env, row) };
  return json(dto);
}

export async function submitRun(request: Request, env: Env, now: number): Promise<Response> {
  const body = await readJson(request);
  const { id, day, name, log, engine } = body;
  if (typeof id !== 'string' || !ID.test(id)) throw new HttpError(400, 'bad_id');

  // Idempotency: a retry gets the stored result, even after the day has changed.
  const stored = await env.DB.prepare('SELECT id, day, score, ticks, hash, created_at FROM runs WHERE id = ?1').bind(id).first<RunRow>();
  if (stored) return result(env, stored);

  if (engine !== ENGINE_VERSION) throw new HttpError(409, 'engine_version');
  if (typeof day !== 'string' || !isDayKey(day)) throw new HttpError(400, 'bad_day');
  // Today, or yesterday for a run that ended just after midnight.
  if (day !== dayKey(now) && day !== previousDayKey(now)) throw new HttpError(400, 'day_closed');
  if (typeof name !== 'string' || !NAME.test(name.trim())) throw new HttpError(400, 'bad_name');
  if (typeof log !== 'string') throw new HttpError(400, 'bad_log');
  const inputs = decodeLog(log);
  if (!inputs) throw new HttpError(400, 'bad_log');

  const { summary, extraTicks } = replay(dailySeed(day), inputs);
  if (!summary || extraTicks > 0) throw new HttpError(422, 'invalid_run');

  await env.DB.prepare(
    'INSERT INTO runs (id, day, name, score, ticks, hash, engine, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) ON CONFLICT (id) DO NOTHING',
  )
    .bind(id, day, name.trim(), summary.score, summary.ticks, summary.hash, ENGINE_VERSION, now)
    .run();
  const row = await env.DB.prepare('SELECT id, day, score, ticks, hash, created_at FROM runs WHERE id = ?1').bind(id).first<RunRow>();
  return result(env, row!);
}

export async function getBoard(url: URL, env: Env, now: number): Promise<Response> {
  const day = url.searchParams.get('day') ?? dayKey(now);
  if (!isDayKey(day)) throw new HttpError(400, 'bad_day');
  const { results } = await env.DB.prepare(
    'SELECT name, score, ticks FROM runs WHERE day = ?1 ORDER BY score DESC, created_at ASC LIMIT 20',
  )
    .bind(day)
    .all<{ name: string; score: number; ticks: number }>();
  const rows: BoardRowDTO[] = results.map((r, i) => ({ rank: i + 1, ...r }));
  return json({ day, rows });
}
