export { greedyBot, idleBot, type Bot } from './bots';
export { CONFIG, type Config } from './config';
export { dailySeed, dayKey, isDayKey, previousDayKey } from './daily';
export { clamp, fallSpeed, moveToward, spawnInterval } from './formulas';
export { decodeLog, encodeLog, InputLog, replay, stateHash, summarize, type ReplayResult, type RunSummary } from './replay';
export { chance, hashText, nextInt, nextU32, seedRng, type RngState } from './rng';
export { createRun, step, type Block, type EndReason, type Run, type SimEvent } from './sim';

/** Bump when a rule change makes old logs replay differently. Client and server must match. */
export const ENGINE_VERSION = 1;
