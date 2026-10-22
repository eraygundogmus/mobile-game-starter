# Workflow: from idea to store with coding agents

This is the process behind the starter. A coding agent (Claude Code, Codex or both) writes the code.
You make the decisions. The prompts for each step are in [`prompts/`](../prompts).

## 1. The pipeline

```
 idea ─► plan ─► canon ─► engine + tests ─► sim gates ─► app ─► look ─► sound ─► online ─► store
  01      01      02         03               03          05     06      07       08        09
                              │
                              └─ 04: split into systems, one worktree + one agent per system (optional)
```

| Step | Output | Gate before the next step |
|---|---|---|
| Plan | core loop, screens, tech layout | You approve the plan. No code yet. |
| Canon | `design/canon.md`, glossary, formula sheet with vectors | Every rule has a number; every number has a name. |
| Engine | `packages/engine` + vitest | Formula vectors pass; same seed → same hash. |
| Sim gates | `npm run sim` in CI | Bots stay inside their bands. |
| App | Expo screens on the engine | Plays offline on a phone and on the web. |
| Look | `design/art-direction.md`, `art/prompts.json`, masters | One style lock; anchor first; review on a phone. |
| Sound | `design/sound-design.md`, `audio/sounds.json`, masters | Every sound has a trigger and a visual twin. |
| Online | server verifies or runs matches | Server tests in workerd pass; client never reports results. |
| Store | builds, store texts, privacy page | TestFlight and Play closed testing accept the build. |

## 2. Rules that saved the most time

1. **Plan before code.** The first prompt says "do not write code yet". A bad plan costs minutes;
   bad code costs days.
2. **The canon wins.** Agents drift. A single file with every rule and number stops the drift.
   When code and canon disagree, fix the canon first, then the code.
3. **Rules without a screen first.** The engine runs in Node with tests before any UI exists.
   A UI bug is then never a rules bug.
4. **Determinism from day one.** Seeded RNG and integer math make bugs reproducible and make a
   server check possible later at no extra cost.
5. **Gates, not opinions.** `npm run gate` (typecheck, tests, sims, names) decides "done". Ask the agent
   to run it and paste the output before it claims success.
6. **Never loosen a gate to make it pass.** Change the numbers in the canon instead.
7. **One style lock for all art.** Every image prompt starts with the same style prefix and the same
   constraints. Generate an anchor image first and pass it as a reference.
8. **Small tasks for agents.** One system, one folder, one test set per task. Large tasks drift.
9. **Names are a product risk.** Keep names and terms of other games out. `npm run names` checks it.

## 3. Parallel agents (optional)

When the canon is stable, split it into independent systems and build them in parallel:

```
 main ─┬─ worktree system-a ─ agent A ─ tests ─┐
       ├─ worktree system-b ─ agent B ─ tests ─┼─► review ─► merge one by one ─► npm run gate
       └─ worktree system-c ─ agent C ─ tests ─┘
```

1. One git worktree per system: `git worktree add ../game-system-a -b system-a`.
2. Each agent changes only its own folder and its own tests.
3. Merge one branch at a time and run `npm run gate` after each merge.
4. Shared files (config, index exports) change only on main, by you or one coordinating agent.

## 4. Review loops

- **UI audit.** When a screen looks wrong, ask for an audit against `design/art-direction.md` before a
  fix: issues by severity, with a screenshot of each. Then fix in that order.
- **Balance check.** After a rule or number change, run the sim, compare with the last report and
  write `design/balance/balance-check-<date>.md`. See `.claude/skills/balance-check`.
- **Cross-check the GDDs.** Before a release, ask an agent to read every GDD and the canon and list
  conflicts. Fix the canon, not only the GDD.
