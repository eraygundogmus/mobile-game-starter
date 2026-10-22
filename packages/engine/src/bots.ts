// Bots give one input per tick. The balance sim, the server tests and the app's demo mode use them.
import type { Run } from './sim';

export type Bot = (run: Run) => number;

/** Never moves. The game must punish it (balance gate). */
export const idleBot: Bot = (run) => run.x;

/**
 * Looks `lookahead` ticks ahead and moves to the least dangerous x it can see.
 * Danger is the sum of (lookahead - ticks until impact) for every block that would overlap that x.
 */
export function greedyBot(lookahead = 75, stride = 8): Bot {
  return (run) => {
    const c = run.config;
    const half = c.player.width / 2;
    const reach = (c.block.height + c.player.height) / 2;
    let best = run.x;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let x = half; x <= c.arena.width - half; x += stride) {
      let danger = Math.abs(x - run.x) / c.player.maxStep;
      for (const b of run.blocks) {
        const ticks = (c.player.y - reach - b.y) / b.speed;
        if (ticks < -1 || ticks > lookahead) continue;
        if (Math.abs(b.x - x) < (b.width + c.player.width) / 2 + 4) danger += 10 * (lookahead - Math.max(0, ticks));
      }
      if (danger < bestScore) {
        bestScore = danger;
        best = x;
      }
    }
    return best;
  };
}
