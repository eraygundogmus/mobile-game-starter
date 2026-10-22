# mobile-game-starter

A small, working template for a mobile game that runs on **iOS, Android and the web** from one TypeScript
codebase, with a **deterministic engine**, a **server that verifies every run**, and a **workflow for
building it with coding agents** (Claude Code, Codex).

The example game is **Dodge**: blocks fall, you slide along the bottom with one finger, everybody plays the
same daily run, and the server replays each run before it goes on the leaderboard. Replace it with your game.

Türkçe: [README.tr.md](README.tr.md)

```
             ┌────────────── packages/engine (pure TypeScript, deterministic) ──────────────┐
             │ seeded RNG · integer rules · input log · replay · bots · balance sim          │
             └──────────────▲─────────────────────────────────────────────▲─────────────────┘
                            │ same code                                   │ same code
  apps/mobile (Expo)        │                       apps/server (Cloudflare Worker + D1)
  iOS · Android · web ──────┴── POST input log ───► replay ─► score ─► leaderboard
```

## Stack

| Part | Technology |
|---|---|
| Rules | Pure TypeScript package, sfc32 RNG, integer math, vitest |
| App | Expo SDK 58, React Native 0.88, expo-router, React Native Skia, Reanimated, zustand, i18next (en, tr) |
| Web | `expo export --platform web` served as Cloudflare static assets |
| Server | Cloudflare Workers, D1 (SQLite), tests in workerd with `@cloudflare/vitest-plugin` |
| Art | Prompt catalog + Higgsfield CLI script (one style lock for every image) |
| Audio | Prompt catalog + ElevenLabs sound/music script + ffmpeg loudness pass |
| CI | GitHub Actions: typecheck, tests, balance sim gates, name check |

## Quick start

Needs Node 24 (`.nvmrc`). Phones need Xcode or Android Studio, or use the web build.

```bash
npm install
npm run gate        # typecheck + tests + balance sim + name check
npm run server      # terminal 1: API on http://localhost:8787 (local D1, migrations applied)
npm run web         # terminal 2: the game in the browser
npm run mobile      # or: Expo dev server, press i (iOS) or a (Android)
```

On a real phone, set `EXPO_PUBLIC_API_BASE=http://<computer-ip>:8787` (Android emulator: `http://10.0.2.2:8787`).
Without a server the game still plays: the app computes the same daily seed offline.

## What is inside

```
packages/engine/    rules, RNG, replay, bots, balance sim (npm run sim)
apps/server/        Worker: GET /v1/daily, POST /v1/runs (replay check), GET /v1/leaderboard
apps/mobile/        Expo app: home, play, leaderboard; Skia canvas; web export config
design/             canon, glossary (EN/TR), formula sheet + test vectors, GDD template, art and sound direction
art/, audio/        prompt catalogs for generated images, sound effects and music
scripts/            gen-art.mjs, gen-audio.mjs (plan-only unless --go), check-names.mjs
prompts/            the build prompts, step by step (EN + TR)
docs/               ARCHITECTURE.md, WORKFLOW.md, RELEASE.md
.claude/skills/     balance-check, art-prompts, gdd-section
AGENTS.md           rules for coding agents (CLAUDE.md points to it)
```

## The ideas that matter

1. **One engine, three places.** The app plays it, the server replays it, the sim tests it.
   The rules live in one package only.
2. **Determinism.** Seeded RNG with its state inside the run, integer math, no clock, no `Math.random`.
   The same seed and inputs give the same state hash on every device.
3. **The server never trusts the client.** The client sends its input log (one value per tick).
   The server replays it and stores its own score. Each run has a client id, so a retry never counts twice.
4. **Design canon first.** `design/canon.md` holds every rule and number. Formulas have test vectors that the
   tests read. When code and canon disagree, the canon wins.
5. **Gates, not opinions.** Bots play hundreds of seeded runs in CI. If the balance leaves its band, CI fails.
6. **No React render per frame.** Each frame is recorded into an `SkPicture` on a Reanimated shared value.

Details: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Build your own game

The full process is in [docs/WORKFLOW.md](docs/WORKFLOW.md). The prompts are in [prompts/](prompts).

```
 01 plan ─► 02 canon ─► 03 engine + sim ─► 05 app ─► 06 look ─► 07 sound ─► 08 online ─► 09 store
                              └─ 04 parallel systems (optional)            10 UI audit (any time)
```

1. Click "Use this template" (or clone) and run `npm install && npm run gate`.
2. Rename: `apps/mobile/app.json` (name, slug, scheme, bundle id, package), `apps/server/wrangler.jsonc`
   and `apps/mobile/wrangler.jsonc` (Worker names).
3. Run prompt 01 with your idea. Then replace `design/canon.md` with prompt 02.
4. Let the agent rebuild `packages/engine` from your canon with prompt 03. Keep `rng.ts`, `replay.ts` and the sim.
5. Continue with the next prompts. End every coding step with `npm run gate`.
6. Add your own blocked terms to `scripts/blocked-names.json` with `npm run names -- --hash "Term"`.

Release steps: [docs/RELEASE.md](docs/RELEASE.md).

## Commands

| Command | What it does |
|---|---|
| `npm run gate` | typecheck, all tests, balance sim gates, name check |
| `npm test` | engine tests, server tests in workerd, app logic tests |
| `npm run sim` | bots play seeded runs; exits 1 when a balance gate fails |
| `npm run server` | local API with a local D1 database |
| `npm run web` / `npm run mobile` | the app in the browser / on a phone or simulator |
| `npm run art:gen` | prints the image generation plan; add `-- --go` to generate (paid) |
| `npm run audio:gen` | prints the audio generation plan; add `-- --go` to generate (paid) |

## License

[MIT](LICENSE)
