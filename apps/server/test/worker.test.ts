import { SELF } from 'cloudflare:test';
import { createRun, dailySeed, dayKey, encodeLog, ENGINE_VERSION, greedyBot, idleBot, InputLog, step, summarize, type Bot } from '@game/engine';
import { describe, expect, it } from 'vitest';
import type { BoardRowDTO, RunResultDTO } from '../src/runs';

function api(path: string, body?: unknown): Promise<Response> {
  return SELF.fetch(`https://api.test${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function read<T>(res: Response | Promise<Response>, status = 200): Promise<T> {
  const r = await res;
  const text = await r.text();
  expect(r.status, text).toBe(status);
  return JSON.parse(text) as T;
}

/** Plays today's daily run with a bot, like the app does. */
function botRun(bot: Bot) {
  const day = dayKey(Date.now());
  const run = createRun(dailySeed(day));
  const log = new InputLog();
  while (!run.end) {
    const input = bot(run);
    log.push(input);
    step(run, input);
  }
  return { day, log: encodeLog(log.view()), summary: summarize(run)! };
}

const newId = () => crypto.randomUUID();

describe('daily runs', () => {
  it('gives the daily seed', async () => {
    const daily = await read<{ day: string; seed: number; engine: number }>(api('/v1/daily'));
    expect(daily.seed).toBe(dailySeed(daily.day));
    expect(daily.engine).toBe(ENGINE_VERSION);
  });

  it('stores the score from its own replay, and a retry gets the same result', async () => {
    const run = botRun(greedyBot());
    const id = newId();
    const body = { id, day: run.day, name: 'Ada', log: run.log, engine: ENGINE_VERSION };
    const first = await read<RunResultDTO>(api('/v1/runs', body));
    expect(first).toMatchObject({ id, score: run.summary.score, ticks: run.summary.ticks, hash: run.summary.hash });
    expect(await read<RunResultDTO>(api('/v1/runs', body))).toEqual(first);
  });

  it('rejects a log that does not finish the run', async () => {
    const run = botRun(greedyBot());
    const short = run.log.slice(0, run.log.length - 8);
    const res = await read<{ error: string }>(api('/v1/runs', { id: newId(), day: run.day, name: 'Ada', log: short, engine: ENGINE_VERSION }), 422);
    expect(res.error).toBe('invalid_run');
  });

  it('rejects a closed day and an old engine', async () => {
    const run = botRun(idleBot);
    const base = { name: 'Ada', log: run.log, engine: ENGINE_VERSION };
    expect((await read<{ error: string }>(api('/v1/runs', { ...base, id: newId(), day: '2020-01-01' }), 400)).error).toBe('day_closed');
    expect((await read<{ error: string }>(api('/v1/runs', { ...base, id: newId(), day: run.day, engine: 0 }), 409)).error).toBe('engine_version');
  });

  it('ranks the leaderboard by score', async () => {
    const day = dayKey(Date.now());
    const good = botRun(greedyBot());
    const idle = botRun(idleBot);
    await read(api('/v1/runs', { id: newId(), day, name: 'Idle', log: idle.log, engine: ENGINE_VERSION }));
    await read(api('/v1/runs', { id: newId(), day, name: 'Greedy', log: good.log, engine: ENGINE_VERSION }));
    const board = await read<{ rows: BoardRowDTO[] }>(api(`/v1/leaderboard?day=${day}`));
    const scores = board.rows.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(board.rows[0]!.rank).toBe(1);
  });

  it('answers unknown paths with 404', async () => {
    await read(api('/nope'), 404);
  });
});
