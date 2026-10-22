// Screen <-> arena mapping. Every device shows the same logical arena; extra space becomes margin.
// Pure functions, so they run in Node tests.
import { clamp } from '@game/engine';

export interface Fit {
  scale: number;
  /** Top-left of the arena on screen, in points. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export function fitArena(viewWidth: number, viewHeight: number, arena: { width: number; height: number }): Fit {
  const scale = Math.max(0, Math.min(viewWidth / arena.width, viewHeight / arena.height));
  const width = arena.width * scale;
  const height = arena.height * scale;
  return { scale, x: (viewWidth - width) / 2, y: (viewHeight - height) / 2, width, height };
}

/**
 * Relative drag: the first touch does not move the player. Later finger movement adds to the
 * position the player had at touch start. The result is an integer input for the engine.
 */
export function dragTarget(startX: number, dxPoints: number, scale: number, arenaWidth: number): number {
  if (scale <= 0) return Math.round(startX);
  return clamp(Math.round(startX + dxPoints / scale), 0, arenaWidth);
}
