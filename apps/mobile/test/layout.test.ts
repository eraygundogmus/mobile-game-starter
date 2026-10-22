import { CONFIG } from '@game/engine';
import { describe, expect, it } from 'vitest';
import { dragTarget, fitArena } from '@/game/layout';

describe('fitArena', () => {
  it('keeps the arena ratio and centers it', () => {
    const fit = fitArena(400, 1000, CONFIG.arena);
    expect(fit.width / fit.height).toBeCloseTo(CONFIG.arena.width / CONFIG.arena.height);
    expect(fit.width).toBe(400);
    expect(fit.y).toBeCloseTo((1000 - fit.height) / 2);
  });

  it('gives a wide screen side margins, not a wider arena', () => {
    const fit = fitArena(1600, 640, CONFIG.arena);
    expect(fit.scale).toBe(1);
    expect(fit.x).toBe((1600 - 360) / 2);
  });
});

describe('dragTarget', () => {
  it('moves by the finger distance in arena units', () => {
    expect(dragTarget(180, 50, 2, CONFIG.arena.width)).toBe(205);
  });

  it('stays inside the arena and gives integers', () => {
    expect(dragTarget(180, 10_000, 1, CONFIG.arena.width)).toBe(CONFIG.arena.width);
    expect(dragTarget(180, -10_000, 1, CONFIG.arena.width)).toBe(0);
    expect(Number.isInteger(dragTarget(180, 3.3, 1.7, CONFIG.arena.width))).toBe(true);
  });
});
