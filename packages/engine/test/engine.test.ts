import { describe, expect, it } from 'vitest';
import {
  CONFIG, createRun, dailySeed, dayKey, decodeLog, encodeLog, greedyBot, idleBot, InputLog, isDayKey, nextInt, nextU32,
  replay, seedRng, stateHash, step, summarize, type Bot, type SimEvent,
} from '../src';

/** Plays a full run with a bot and records the input log. */
function play(seed: number, bot: Bot) {
  const run = createRun(seed);
  const log = new InputLog();
  const events: SimEvent[] = [];
  while (!run.end) {
    const input = bot(run);
    log.push(input);
    step(run, input, events);
  }
  return { run, log: log.view(), events };
}

describe('rng', () => {
  it('gives the same numbers for the same seed', () => {
    const a = seedRng(42);
    const b = seedRng(42);
    const xs = Array.from({ length: 5 }, () => nextU32(a));
    expect(Array.from({ length: 5 }, () => nextU32(b))).toEqual(xs);
    expect(Array.from({ length: 5 }, () => nextU32(seedRng(43)))).not.toEqual(xs);
  });

  it('keeps nextInt inside the range', () => {
    const r = seedRng(7);
    for (let i = 0; i < 10_000; i++) {
      const v = nextInt(r, -3, 3);
      expect(v).toBeGreaterThanOrEqual(-3);
      expect(v).toBeLessThanOrEqual(3);
    }
  });
});

describe('determinism', () => {
  it('gives the same run for the same seed and inputs', () => {
    const a = play(1234, greedyBot());
    const b = play(1234, greedyBot());
    expect(stateHash(a.run)).toBe(stateHash(b.run));
    expect(a.events).toEqual(b.events);
  });

  it('replays a recorded log to the same summary', () => {
    const live = play(99, greedyBot());
    const { summary, extraTicks } = replay(99, live.log);
    expect(extraTicks).toBe(0);
    expect(summary).toEqual(summarize(live.run));
  });

  it('survives the encode and decode round trip', () => {
    const { log } = play(5, greedyBot());
    expect(Array.from(decodeLog(encodeLog(log))!)).toEqual(Array.from(log));
  });
});

describe('replay checks', () => {
  it('gives no summary for a log that stops early', () => {
    const { log } = play(8, greedyBot());
    expect(replay(8, log.subarray(0, log.length - 1)).summary).toBeNull();
  });

  it('counts inputs after the end', () => {
    const { log } = play(8, idleBot);
    const longer = new Uint16Array(log.length + 3);
    longer.set(log);
    expect(replay(8, longer).extraTicks).toBe(3);
  });

  it('rejects text that is not a log', () => {
    expect(decodeLog('a')).toBeNull();
    expect(decodeLog('ab*d')).toBeNull();
    expect(decodeLog('AA')).toBeNull(); // one byte: half an input
    expect(decodeLog(encodeLog(new Uint16Array(CONFIG.maxTicks + 1)))).toBeNull();
  });

  it('clamps bad inputs instead of breaking', () => {
    const run = createRun(1);
    step(run, Number.NaN);
    step(run, 1e9);
    step(run, -50);
    expect(Number.isInteger(run.x)).toBe(true);
    expect(run.x).toBeGreaterThanOrEqual(CONFIG.player.width / 2);
  });
});

describe('rules', () => {
  it('ends an idle run by lives', () => {
    const { run } = play(3, idleBot);
    expect(run.end).toBe('lives');
    expect(run.lives).toBe(0);
  });

  it('never runs past maxTicks', () => {
    const { run } = play(3, greedyBot());
    expect(run.tick).toBeLessThanOrEqual(CONFIG.maxTicks);
  });
});

describe('daily seed', () => {
  it('uses the UTC day', () => {
    expect(dayKey(Date.UTC(2026, 9, 22, 23, 59))).toBe('2026-10-22');
    expect(dayKey(Date.UTC(2026, 9, 23, 0, 0))).toBe('2026-10-23');
    expect(dailySeed('2026-10-22')).toBe(dailySeed('2026-10-22'));
    expect(dailySeed('2026-10-22')).not.toBe(dailySeed('2026-10-23'));
  });

  it('accepts only real days', () => {
    expect(isDayKey('2026-10-22')).toBe(true);
    expect(isDayKey('2026-02-30')).toBe(false);
    expect(isDayKey('22-10-2026')).toBe(false);
  });
});
