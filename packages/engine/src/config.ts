// Every tunable number of the game. The canon (design/canon.md) owns these values:
// change the canon first, then the formula sheet, then this file.
// Integers only: lengths in arena units, time in ticks, chances in per mille.

export interface Config {
  /** Simulation steps per second. The app converts ticks to milliseconds; the engine never does. */
  ticksPerSecond: number;
  /** A run ends at this tick even when the player has lives left. */
  maxTicks: number;
  /** Logical arena. Every device shows the same area, so a wide phone gives no advantage. */
  arena: { width: number; height: number };
  player: { y: number; width: number; height: number; maxStep: number; lives: number };
  block: { height: number; minWidth: number; maxWidth: number };
  spawn: { startInterval: number; minInterval: number; intervalStepTicks: number; doublePerMille: number };
  fall: { startSpeed: number; maxSpeed: number; speedStepTicks: number };
  /** Targets for `npm run sim`. The sim fails when a bot leaves its band. */
  balance: {
    runs: number;
    greedyMedianSeconds: { min: number; max: number };
    idleMedianSeconds: { max: number };
  };
}

export const CONFIG: Config = {
  ticksPerSecond: 60,
  maxTicks: 60 * 60,
  arena: { width: 360, height: 640 },
  player: { y: 560, width: 48, height: 16, maxStep: 10, lives: 3 },
  block: { height: 24, minWidth: 24, maxWidth: 72 },
  spawn: { startInterval: 40, minInterval: 12, intervalStepTicks: 90, doublePerMille: 150 },
  fall: { startSpeed: 3, maxSpeed: 8, speedStepTicks: 600 },
  balance: {
    runs: 200,
    greedyMedianSeconds: { min: 15, max: 50 },
    idleMedianSeconds: { max: 12 },
  },
};
