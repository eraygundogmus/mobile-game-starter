# Design canon — Dodge (example game)

> The canon is the single source of truth for rules, numbers and names.
> Code follows the canon. When code and canon disagree, the canon wins: fix the canon first,
> then `design/formula-sheet.md`, then `packages/engine/src/config.ts`.
> Replace this example with your own game. Keep the section order.

Version: 1.0 · Engine version: 1

## 1. Pitch

A one-finger arcade game for phones and the web. Blocks fall. You slide along the bottom and dodge them.
Everybody plays the same daily run. The server checks every run, so the leaderboard is fair.

## 2. Pillars

1. **One finger, one rule.** A player understands the game in 5 seconds.
2. **Fair by construction.** The same seed and the same inputs give the same run on every device.
   The server replays every run. The client never reports a score.
3. **Short sessions.** A run lasts at most 60 seconds. A retry starts at once.

## 3. Core loop

```
open app ─► daily seed ─► run (≤ 60 s) ─► server replay ─► rank ─► play again
                                                         └──────► leaderboard
```

## 4. Rules

1. The arena is 360 × 640 units on every device. Extra screen space becomes margin.
2. The player is a capsule at y = 560. The player moves only along x.
3. Input: the player drags anywhere. The first touch does not move the player. Finger movement adds
   to the position the player had at touch start (relative drag).
4. The player moves at most `maxStep` units per tick toward the target.
5. Blocks spawn at the top. Each block gets a random width and x from the seeded RNG.
   A spawn adds a second block with a chance of `doublePerMille` / 1000.
6. A block falls at the speed of its spawn tick (formula F2) and keeps that speed.
7. A block that overlaps the player takes 1 life and disappears.
8. A block that leaves the bottom of the arena gives 1 point.
9. The run ends at 0 lives or at `maxTicks`.

## 5. Numbers

All numbers are integers: lengths in arena units, time in ticks (60 per second), chances in per mille.

| Name | Value | Note |
|---|---|---|
| ticksPerSecond | 60 | |
| maxTicks | 3600 | 60 s |
| arena | 360 × 640 | |
| player | y 560, 48 × 16, maxStep 10, lives 3 | |
| block | height 24, width 24–72 (even) | |
| spawn | startInterval 40, minInterval 12, step every 90 ticks, doublePerMille 150 | F1 |
| fall | startSpeed 3, maxSpeed 8, +1 every 600 ticks | F2 |

Invariant: `maxSpeed < block.height + player.height`, so a block cannot pass through the player in one tick.

## 6. Balance targets

`npm run sim` plays 200 seeded runs per bot. CI fails when a bot leaves its band.

| Bot | Target | Why |
|---|---|---|
| greedy (looks ahead, dodges) | median survival 15–50 s | Skill matters, but a simple bot does not solve the game. |
| idle (never moves) | median survival ≤ 12 s | Doing nothing loses fast. |

Do not loosen a gate to make it pass. Change the numbers in section 5 instead.

## 7. Online

1. `GET /v1/daily` gives the UTC day and its seed. Offline, the app computes the same seed.
2. After a run, the app sends `{ id, day, name, log, engine }`. `log` is one input per tick.
3. The server replays the log. It stores the result of its own replay. The client score is never sent.
4. `id` is an idempotency key: a retry returns the stored result.
5. The server accepts the current UTC day and the day before.

## 8. Names

Use only the terms in `design/glossary.tsv`. One term means one thing.

## 9. Open questions

Record every gap between code and canon here, with a date.

- (none)
