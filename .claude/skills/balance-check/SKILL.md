---
name: balance-check
description: Run the balance sim after a rule or number change, compare it with the last report and write a dated balance report. Use when someone changes packages/engine/src/config.ts, a formula, numbers in design/canon.md, or asks "is the game still balanced?".
---

# Balance check

## Steps

1. Run the engine checks first. Stop and report if they fail.
   ```bash
   npm run typecheck -w @game/engine && npm test -w @game/engine
   ```
2. Run the sim and keep its JSON next to the report.
   ```bash
   mkdir -p design/balance
   npm run -s sim -w @game/engine -- --json > design/balance/sim-<YYYY-MM-DD>.json
   ```
   The command exits 1 when a gate fails. The JSON is still written.
3. Find the last report in `design/balance/` (newest `balance-check-*.md`). If there is none, this run is the baseline.
4. Write `design/balance/balance-check-<YYYY-MM-DD>.md` with the template below.
5. If a gate fails, do not change the gate. Name the canon number that moves the result back into the band,
   and propose the change in this order: canon → formula sheet → `config.ts` → tests.

## Report template

```markdown
# Balance check <YYYY-MM-DD>

Change under test: <one sentence, commit or diff summary>
Runs per bot: <runs>   Engine version: <ENGINE_VERSION>

| Bot | Median s | p10 s | p90 s | Median score | Ran to time | Previous median s |
|---|---|---|---|---|---|---|
| greedy | | | | | | |
| idle | | | | | | |

| Gate | Result |
|---|---|
| <gate name from the JSON> | PASS/FAIL |

## What moved and why
- <metric>: <old> → <new>, caused by <rule or number>.

## Proposal (only if a gate fails or a result is near a band edge)
- Canon section <x>: <number> <old> → <new>. Expected effect: <…>.
```

## Rules

- Numbers come from the sim JSON, not from estimates.
- The bands live in `CONFIG.balance` (`packages/engine/src/config.ts`) and in the canon. Both must agree.
- One report per change. Do not edit old reports.
- A median within 10 % of a band edge is a warning. Say so in the report.
