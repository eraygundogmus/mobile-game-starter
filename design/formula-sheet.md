# Formula sheet

Every formula of the canon, with test vectors. The vectors also live in `formula-vectors.json`;
`packages/engine/test/formulas.test.ts` reads that file. Tests come from this sheet, not from the code.

Write the vectors by hand (or with a separate script) before the code exists. Then the code must match them.

## F1. Spawn interval

```
spawnInterval(tick) = max(minInterval, startInterval − floor(tick / intervalStepTicks))
```

| tick | expected |
|---|---|
| 0 | 40 |
| 89 | 40 |
| 90 | 39 |
| 900 | 30 |
| 2520 | 12 |
| 3599 | 12 |

## F2. Fall speed (units per tick, fixed at spawn)

```
fallSpeed(tick) = min(maxSpeed, startSpeed + floor(tick / speedStepTicks))
```

| tick | expected |
|---|---|
| 0 | 3 |
| 599 | 3 |
| 600 | 4 |
| 1800 | 6 |
| 3000 | 8 |
| 3599 | 8 |

## F3. Player move

```
step     = clamp(target − x, −maxStep, maxStep)
moveTo   = clamp(x + step, playerWidth / 2, arenaWidth − playerWidth / 2)
```

| x | target | expected |
|---|---|---|
| 180 | 180 | 180 |
| 180 | 300 | 190 |
| 180 | 100 | 170 |
| 180 | 185 | 185 |
| 30 | 0 | 24 |
| 330 | 360 | 336 |
