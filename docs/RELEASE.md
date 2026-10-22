# Release

## 1. Server

```bash
cd apps/server
npx wrangler login
npx wrangler d1 create game            # once; paste the database_id into wrangler.jsonc
npm run deploy                         # applies D1 migrations, then deploys the Worker
```

Set `WEB_ORIGINS` in `wrangler.jsonc` to your web origin(s) before launch.

## 2. Web

```bash
EXPO_PUBLIC_API_BASE=https://<your-api> npm run web:deploy -w @game/mobile
```

This runs `expo export --platform web` and `wrangler deploy` with `apps/mobile/wrangler.jsonc`
(static assets, single-page-app fallback, a year of cache for hashed bundles).

## 3. Phones

Set your own identifiers in `apps/mobile/app.json` first: `name`, `slug`, `scheme`,
`ios.bundleIdentifier`, `android.package`. Add an icon and a splash screen.

### Option A: EAS (hosted builds)

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios
```

### Option B: local builds (no EAS)

```
 expo prebuild ─► ios/ ─► xcodebuild archive ─► export .ipa ─► upload (App Store Connect API key) ─► TestFlight
               └► android/ ─► ./gradlew bundleRelease (upload key) ─► .aab ─► Play Console closed testing
```

1. `EXPO_PUBLIC_API_BASE=https://<your-api> npx expo prebuild --clean`
2. iOS: archive and export with `xcodebuild`, then upload with an App Store Connect API key.
3. Android: sign the release bundle with your upload key, then upload it in Play Console.
4. Raise the build number for every upload (`ios.buildNumber`, `android.versionCode`).
5. Keep keys and passwords in a file outside the repo (for example `~/.config/<game>/store.env`, chmod 600).

## 4. Before every store build

- [ ] `npm run gate` passes.
- [ ] `ENGINE_VERSION` is bumped if a rule change makes old logs replay differently.
- [ ] Server is deployed first when the engine version changed.
- [ ] Store texts, screenshots and the privacy page match the build.
