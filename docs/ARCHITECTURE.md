# Architecture

## 1. Three parts, one engine

```
             ┌──────────────── @game/engine (pure TypeScript, no I/O) ────────────────┐
             │ config.ts  rng.ts (sfc32)  formulas.ts  sim.ts  replay.ts  bots.ts     │
             └───────────────▲──────────────────────────────────────▲─────────────────┘
                             │ same code                            │ same code
          apps/mobile        │                         apps/server  │
  ┌──────────────────────────┴──────────┐          ┌────────────────┴───────────────┐
  │ GameView: fixed-step loop, input log│  HTTPS   │ Worker: /v1/daily, /v1/runs,   │
  │ Skia canvas (SkPicture on a shared  │ ───────► │ /v1/leaderboard                │
  │ value: no React render per frame)   │          │ replay(log) ─► D1 (runs table) │
  │ zustand profile, i18next texts      │          └────────────────────────────────┘
  └─────────────────────────────────────┘
        │ expo export --platform web
        ▼
  Cloudflare static assets (SPA)
```

The engine is the only place where the rules live. The app runs it to play. The server runs it to check.
Because the engine is deterministic, both give the same result for the same inputs.

## 2. Determinism

| Rule | Why |
|---|---|
| Seeded sfc32 RNG; its state lives in the run | Same seed → same blocks on every device. The state is part of the hash. |
| Integer math only (units, ticks, per mille) | Floats can differ between engines after many steps. Integers cannot. |
| No clock in the engine | Time is the tick counter. The caller converts ticks to milliseconds. |
| The engine validates every input | The server feeds client logs straight in. Bad input is clamped, never trusted. |
| `stateHash(run)` over every integer of the state | Client and server compare one short string. |

## 3. A run, end to end

```
 app                                   server
 ───                                   ──────
 GET /v1/daily ──────────────────────► { day, seed }          (offline: same seed from dayKey)
 createRun(seed)
 every frame:
   while time ≥ 1 tick:
     input = drag target x
     log.push(input); step(run, input)
 run.end ─► POST /v1/runs { id, day, name, log, engine }
                                       decodeLog(log)
                                       replay(dailySeed(day), log)
                                       reject: incomplete log, extra inputs, closed day, old engine
                                       INSERT … ON CONFLICT (id) DO NOTHING
            ◄──────────────────────── { score, ticks, hash, rank }
```

- The input log is one uint16 per tick, base64url-encoded (≈ 9.6 KB for 60 s).
- `id` comes from the client. A retry with the same id returns the stored row, so a flaky network
  can never count a run twice.

## 4. Rendering

- One Skia `<Canvas>` holds the arena. Each frame is recorded into an `SkPicture` and set on a
  Reanimated shared value. The canvas redraws without a React render.
- React state changes only on game events (hit, dodge), for the HUD.
- `src/game/layout.ts` fits the 360 × 640 arena into any screen and maps finger movement to
  arena units. It is pure, so it has Node tests.
- On the web, `index.web.ts` loads CanvasKit (`canvaskit.wasm`) before the router starts.

## 5. Grow it: live matches with Durable Objects

The starter verifies finished runs. For real-time play against other players, add an authoritative
match on a Durable Object. The same engine runs inside it.

```
 client                         Worker + Durable Objects
 ┌───────────────┐  ws /lobby   ┌──────────────┐
 │ match screen  │ ───────────► │ Lobby DO     │  queue, pairing, bot fill after N seconds
 │               │ ◄─ matchFound│              │
 │               │  ws /match   └──────┬───────┘
 │               │ ───────────► ┌──────▼───────┐
 │               │ ◄── state ── │ Match DO     │  owns the game state, timers, reconnect
 └───────────────┘              └──────────────┘
```

Rules that worked well:

1. The client sends intents with a sequence number: `{ seq, action }`. The server answers
   `actionResult { seq }` before the next `state`.
2. The client applies its own actions at once on a copy of the last server state (prediction).
   On every new `state`, it re-applies only the actions the server has not confirmed.
3. The lobby turns the session into a short-lived signed match ticket. The match socket accepts only
   the ticket, so the long-lived session never reaches a match.
4. A dropped socket reconnects to the same match. When the app starts again during a match, the lobby
   sends the match id right after the handshake.
5. Clock offset: `offset = serverNow − Date.now()`; timers on screen use server time.
6. Close codes have meanings (another socket took the seat, version mismatch, bad ticket, no such match).

Add the bindings in `apps/server/wrangler.jsonc` (`durable_objects`, `migrations`) and test the
Durable Objects with `@cloudflare/vitest-plugin`, like the existing worker tests.

## 6. Grow it: more of what the full games had

| Need | Where it goes |
|---|---|
| Accounts | better-auth on D1, Bearer tokens (SecureStore on phones, localStorage on web) |
| Push notifications | Firebase Cloud Messaging; server keeps device tokens in D1 |
| Rate limits | Workers rate-limit bindings in `wrangler.jsonc` |
| Telemetry | Workers Analytics Engine dataset, one event per meaningful action |
| Bot protection on web forms | Cloudflare Turnstile |
| Scheduled jobs | Worker `triggers.crons` |
| Share cards / user images | R2 bucket |
| Store links, landing pages | The web Worker serves pages next to the SPA |
