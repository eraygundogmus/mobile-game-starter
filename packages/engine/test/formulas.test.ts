import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONFIG, fallSpeed, moveToward, spawnInterval } from '../src';

interface Vectors {
  spawnInterval: { tick: number; expected: number }[];
  fallSpeed: { tick: number; expected: number }[];
  moveToward: { x: number; target: number; expected: number }[];
}

// The tests come from the formula sheet, not from the code.
const vectors = JSON.parse(readFileSync(new URL('../../../design/formula-vectors.json', import.meta.url), 'utf8')) as Vectors;

describe('formula sheet vectors', () => {
  it.each(vectors.spawnInterval)('spawnInterval($tick) = $expected', ({ tick, expected }) => {
    expect(spawnInterval(tick, CONFIG)).toBe(expected);
  });

  it.each(vectors.fallSpeed)('fallSpeed($tick) = $expected', ({ tick, expected }) => {
    expect(fallSpeed(tick, CONFIG)).toBe(expected);
  });

  it.each(vectors.moveToward)('moveToward($x, $target) = $expected', ({ x, target, expected }) => {
    expect(moveToward(x, target, CONFIG)).toBe(expected);
  });
});

describe('canon invariants', () => {
  it('a block cannot pass through the player in one tick', () => {
    expect(CONFIG.fall.maxSpeed).toBeLessThan(CONFIG.block.height + CONFIG.player.height);
  });

  it('uses integer numbers only', () => {
    const walk = (value: unknown): void => {
      if (typeof value === 'number') expect(Number.isInteger(value)).toBe(true);
      else if (value && typeof value === 'object') Object.values(value).forEach(walk);
    };
    walk(CONFIG);
  });

  it('keeps every half width an integer', () => {
    for (const n of [CONFIG.player.width, CONFIG.block.minWidth, CONFIG.block.maxWidth, CONFIG.arena.width]) {
      expect(n % 2).toBe(0);
    }
  });
});
