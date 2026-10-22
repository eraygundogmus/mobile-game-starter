// The formulas of design/formula-sheet.md. Tests check them against design/formula-vectors.json.
import type { Config } from './config';

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Ticks until the next spawn. It gets shorter over time, down to a floor. */
export function spawnInterval(tick: number, c: Config): number {
  return Math.max(c.spawn.minInterval, c.spawn.startInterval - Math.floor(tick / c.spawn.intervalStepTicks));
}

/** Units per tick for a block that spawns at this tick. It gets faster over time, up to a cap. */
export function fallSpeed(tick: number, c: Config): number {
  return Math.min(c.fall.maxSpeed, c.fall.startSpeed + Math.floor(tick / c.fall.speedStepTicks));
}

/** The player moves toward the target by at most maxStep, and stays fully inside the arena. */
export function moveToward(x: number, target: number, c: Config): number {
  const half = c.player.width / 2;
  const step = clamp(target - x, -c.player.maxStep, c.player.maxStep);
  return clamp(x + step, half, c.arena.width - half);
}
