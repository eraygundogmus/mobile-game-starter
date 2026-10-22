# Rules for coding agents

This repo is a mobile game (iOS, Android, web) built from `mobile-game-starter`.
Claude Code reads this file through `CLAUDE.md`. Codex and other agents read it directly.

## Source of truth

1. `design/canon.md` is the design canon. Every rule, number and name comes from it.
2. `design/glossary.tsv` is the term list (EN / TR / note). One term means one thing.
3. `design/formula-sheet.md` gives every formula with test vectors. Tests come from it.
4. `design/gdd/*.md` expand the canon per system. `docs/ARCHITECTURE.md` describes the code.
5. When code and canon disagree, the canon wins. Record the gap in canon section "Open questions".

## Layout

```
packages/engine   @game/engine   pure TypeScript rules, shared by the server and the app
apps/server       @game/server   Cloudflare Worker: daily seed, run verification, leaderboard (D1)
apps/mobile       @game/mobile   Expo app (iOS, Android) and its web export (Cloudflare static assets)
design/                          canon, glossary, formula sheet, GDDs, art and sound direction
art/, audio/                     prompt catalogs for generated art and audio
scripts/                         art and audio generation, name check
prompts/                         the build prompts, in order
```

## Engineering rules

1. The engine is pure and deterministic. No `Date.now()`, no `Math.random()`, no I/O, no globals.
   Time comes in as a parameter. Randomness comes from the seeded sfc32 RNG in `rng.ts`.
2. Use integer math in the rules. Chances are per mille (0–1000). Time is in ticks.
3. The server is authoritative. The client predicts with the engine but never reports scores,
   rewards, XP or timers. The server replays the inputs and stores its own result.
4. Every write request carries an idempotency key. A retry returns the stored response.
5. Every system ships with vitest tests. Formula tests use the vectors in `design/formula-sheet.md`.
6. Balance sims (`npm run sim`) are CI gates. Do not loosen a gate to make it pass.
   Fix the numbers in the canon first, then the formula sheet, then the code.
7. Keep tunable numbers in `packages/engine/src/config.ts`, not in code paths.
8. Render-only effects (flash, shake, sound, haptics) read engine events. They never change the run.
9. Bump `ENGINE_VERSION` when a rule change makes old input logs replay differently.
10. Match the style of the code around you. Keep comments short and only where the code is not obvious.

## Names

1. Use only names from the canon and the glossary. Add a glossary row before you add a new term.
2. Do not use names, terms or fiction from other games or brands.
3. Before every commit run `npm run names`. It must report 0 hits.

## Commands

Use Node 24 (`.nvmrc`).

```
npm install            install all workspaces
npm run gate           typecheck + tests + sim gates + name check (run before you say "done")
npm test               engine, server (workerd) and app logic tests
npm run sim            balance sim (CI gate)
npm run server         API on http://localhost:8787
npm run mobile         Expo dev server (i: iOS simulator, a: Android, w: web)
```

## Secrets

Never print, log or commit API keys, store credentials or signing keys.
Keep them in `.env` (git-ignored) or `~/.config/<game>/`.

## Git

1. Commit messages start with the area: `Engine: …`, `Server: …`, `Mobile: …`, `Design: …`, `Docs: …`, `Repo: …`.
2. One logical change per commit.

## Writing style

Docs and user-facing text follow ASD-STE100 (Simplified Technical English): short sentences, active voice,
one fact per sentence, one term for one thing.
