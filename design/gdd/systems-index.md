# Systems index

One row per system. A system gets its own GDD (`design/gdd/<system>.md`, from `TEMPLATE.md`) when the
canon section is not enough to build and test it.

| System | Canon | GDD | Engine module | Depends on |
|---|---|---|---|---|
| Run rules (spawn, fall, move, hit, dodge) | §4, §5 | — (canon is enough) | `sim.ts`, `formulas.ts` | RNG |
| Daily seed | §7 | — | `daily.ts` | RNG |
| Run verification | §7 | — | `replay.ts` + `apps/server/src/runs.ts` | Run rules |
| Leaderboard | §7 | — | `apps/server/src/runs.ts` | Run verification |
