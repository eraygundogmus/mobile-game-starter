// The game rules: one run of the example game "Dodge".
// Blocks fall from the top. The player slides along the bottom. A block that hits the player
// takes one life. A block that leaves the arena gives one point.
//
// The engine is pure and deterministic: no clock, no Math.random, no I/O, no globals.
// `step` changes the run in place (fast enough for 60 ticks per second on a phone).
import { CONFIG, type Config } from './config';
import { clamp, fallSpeed, moveToward, spawnInterval } from './formulas';
import { chance, nextInt, seedRng, type RngState } from './rng';

export interface Block {
  id: number;
  /** Center x and center y, in arena units. */
  x: number;
  y: number;
  width: number;
  /** Units per tick. Fixed when the block spawns. */
  speed: number;
}

export type EndReason = 'lives' | 'time';

export interface Run {
  readonly config: Config;
  tick: number;
  rng: RngState;
  /** Player center x. */
  x: number;
  lives: number;
  score: number;
  blocks: Block[];
  nextSpawnTick: number;
  nextId: number;
  end: EndReason | null;
}

/** Render-only signals for sound, haptics and effects. They never feed back into the rules. */
export type SimEvent =
  | { type: 'spawn'; id: number }
  | { type: 'dodge'; id: number }
  | { type: 'hit'; id: number; lives: number }
  | { type: 'end'; reason: EndReason };

export function createRun(seed: number, config: Config = CONFIG): Run {
  return {
    config,
    tick: 0,
    rng: seedRng(seed),
    x: config.arena.width / 2,
    lives: config.player.lives,
    score: 0,
    blocks: [],
    nextSpawnTick: 0,
    nextId: 1,
    end: null,
  };
}

function spawnBlock(run: Run, events?: SimEvent[]): void {
  const c = run.config;
  // Even widths keep every half width an integer.
  const width = 2 * nextInt(run.rng, c.block.minWidth / 2, c.block.maxWidth / 2);
  const x = nextInt(run.rng, width / 2, c.arena.width - width / 2);
  const block: Block = { id: run.nextId++, x, y: -c.block.height / 2, width, speed: fallSpeed(run.tick, c) };
  run.blocks.push(block);
  events?.push({ type: 'spawn', id: block.id });
}

function hitsPlayer(b: Block, x: number, c: Config): boolean {
  return (
    Math.abs(b.x - x) < (b.width + c.player.width) / 2 &&
    Math.abs(b.y - c.player.y) < (c.block.height + c.player.height) / 2
  );
}

/**
 * Advances the run by one tick. `targetX` is the player input for this tick.
 * The engine validates every input, so a server can feed client logs straight in.
 */
export function step(run: Run, targetX: number, events?: SimEvent[]): void {
  if (run.end) return;
  const c = run.config;
  const target = clamp(Math.trunc(Number.isFinite(targetX) ? targetX : run.x), 0, c.arena.width);
  run.x = moveToward(run.x, target, c);

  if (run.tick >= run.nextSpawnTick) {
    spawnBlock(run, events);
    if (chance(run.rng, c.spawn.doublePerMille)) spawnBlock(run, events);
    run.nextSpawnTick = run.tick + spawnInterval(run.tick, c);
  }

  const kept: Block[] = [];
  for (const b of run.blocks) {
    b.y += b.speed;
    if (hitsPlayer(b, run.x, c)) {
      run.lives -= 1;
      events?.push({ type: 'hit', id: b.id, lives: run.lives });
    } else if (b.y - c.block.height / 2 > c.arena.height) {
      run.score += 1;
      events?.push({ type: 'dodge', id: b.id });
    } else {
      kept.push(b);
    }
  }
  run.blocks = kept;
  run.tick += 1;

  if (run.lives <= 0) run.end = 'lives';
  else if (run.tick >= c.maxTicks) run.end = 'time';
  if (run.end) events?.push({ type: 'end', reason: run.end });
}
