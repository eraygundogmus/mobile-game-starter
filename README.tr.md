# mobile-game-starter

**iOS, Android ve web'de** tek TypeScript kod tabanından çalışan bir mobil oyun için küçük, çalışan bir şablon.
İçinde **deterministik bir oyun motoru**, **her turu doğrulayan bir sunucu** ve oyunu **kod ajanlarıyla
(Claude Code, Codex) yapma akışı** var.

Örnek oyunun adı **Dodge**. Bloklar düşer, sen tek parmakla alttan kayarak kaçarsın. Herkes aynı günün turunu oynar.
Sunucu her turu tekrar oynatır, sonra sıralamaya yazar. Bunu kendi oyununla değiştir.

English: [README.md](README.md)

```
             ┌──────────── packages/engine (saf TypeScript, deterministik) ────────────┐
             │ tohumlu RNG · tam sayı kurallar · girdi kaydı · replay · botlar · sim    │
             └──────────────▲────────────────────────────────────────▲──────────────────┘
                            │ aynı kod                               │ aynı kod
  apps/mobile (Expo)        │                    apps/server (Cloudflare Worker + D1)
  iOS · Android · web ──────┴── girdi kaydı ───► replay ─► skor ─► sıralama
```

## Teknolojiler

| Parça | Teknoloji |
|---|---|
| Kurallar | Saf TypeScript paket, sfc32 RNG, tam sayı matematik, vitest |
| Uygulama | Expo SDK 58, React Native 0.88, expo-router, React Native Skia, Reanimated, zustand, i18next (en, tr) |
| Web | `expo export --platform web`, Cloudflare static assets üzerinde |
| Sunucu | Cloudflare Workers, D1 (SQLite), `@cloudflare/vitest-plugin` ile workerd içinde testler |
| Görsel | Prompt kataloğu + Higgsfield CLI betiği (bütün görseller için tek stil kilidi) |
| Ses | Prompt kataloğu + ElevenLabs efekt/müzik betiği + ffmpeg ses seviyesi ayarı |
| CI | GitHub Actions: tip kontrolü, testler, denge simülasyonu kapıları, isim kontrolü |

## Hızlı başlangıç

Node 24 gerekir (`.nvmrc`). Telefon için Xcode ya da Android Studio gerekir; yoksa web sürümünü kullan.

```bash
npm install
npm run gate        # tip kontrolü + testler + denge simülasyonu + isim kontrolü
npm run server      # 1. terminal: http://localhost:8787 (yerel D1, tablolar otomatik kurulur)
npm run web         # 2. terminal: oyun tarayıcıda
npm run mobile      # ya da Expo: i (iOS) veya a (Android)
```

Gerçek telefonda `EXPO_PUBLIC_API_BASE=http://<bilgisayar-ip>:8787` ayarla (Android emülatörü: `http://10.0.2.2:8787`).
Sunucu yoksa da oyun çalışır: uygulama günün tohumunu kendisi hesaplar.

## İçinde ne var

```
packages/engine/    kurallar, RNG, replay, botlar, denge simülasyonu (npm run sim)
apps/server/        Worker: GET /v1/daily, POST /v1/runs (replay kontrolü), GET /v1/leaderboard
apps/mobile/        Expo uygulama: ana sayfa, oyun, sıralama; Skia canvas; web export ayarı
design/             canon, sözlük (EN/TR), formül sayfası + test örnekleri, GDD şablonu, görsel ve ses yönü
art/, audio/        görsel, efekt ve müzik üretimi için prompt katalogları
scripts/            gen-art.mjs, gen-audio.mjs (--go olmadan yalnızca plan), check-names.mjs
prompts/            adım adım yapım promptları (EN + TR)
docs/               ARCHITECTURE.md, WORKFLOW.md, RELEASE.md
.claude/skills/     balance-check, art-prompts, gdd-section
AGENTS.md           kod ajanları için kurallar (CLAUDE.md buna yönlendirir)
```

## Önemli fikirler

1. **Tek motor, üç yer.** Uygulama oynatır, sunucu tekrar oynatır, simülasyon test eder.
   Kurallar yalnızca bir pakette durur.
2. **Determinizm.** RNG tohumludur ve durumu turun içindedir. Matematik tam sayıdır. Saat ve `Math.random` yoktur.
   Aynı tohum ve aynı girdiler her cihazda aynı durum özetini (hash) verir.
3. **Sunucu istemciye güvenmez.** İstemci girdi kaydını gönderir (her tik için bir değer).
   Sunucu turu tekrar oynatır ve kendi skorunu kaydeder. Her turun bir istemci id'si vardır; tekrar deneme iki kez sayılmaz.
4. **Önce tasarım canon'u.** `design/canon.md` bütün kuralları ve sayıları tutar. Formüllerin test örnekleri vardır;
   testler bunları okur. Kod ile canon çelişirse canon kazanır.
5. **Fikir değil, kapı.** Botlar CI'da yüzlerce tohumlu tur oynar. Denge bandın dışına çıkarsa CI kırılır.
6. **Her karede React render yok.** Her kare bir `SkPicture` olarak Reanimated shared value'ya yazılır.

Ayrıntılar: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Kendi oyununu yap

Bütün süreç [docs/WORKFLOW.md](docs/WORKFLOW.md) içinde. Promptlar [prompts/](prompts) klasöründe
(her dosyada Türkçe sürümü de var).

```
 01 plan ─► 02 canon ─► 03 motor + sim ─► 05 uygulama ─► 06 görsel ─► 07 ses ─► 08 online ─► 09 mağaza
                              └─ 04 paralel sistemler (isteğe bağlı)          10 arayüz denetimi (her zaman)
```

1. "Use this template" düğmesine bas (ya da klonla). `npm install && npm run gate` çalıştır.
2. Adları değiştir: `apps/mobile/app.json` (ad, slug, scheme, bundle id, paket),
   `apps/server/wrangler.jsonc` ve `apps/mobile/wrangler.jsonc` (Worker adları).
3. Fikrinle 01 numaralı promptu çalıştır. Sonra 02 ile `design/canon.md` dosyasını kendi oyununla değiştir.
4. 03 ile ajanın `packages/engine` paketini canon'dan yeniden yazmasını iste. `rng.ts`, `replay.ts` ve simülasyon kalsın.
5. Sonraki promptlarla devam et. Her kod adımını `npm run gate` ile bitir.
6. Engellemek istediğin terimleri `npm run names -- --hash "Terim"` ile `scripts/blocked-names.json` dosyasına ekle.

Yayın adımları: [docs/RELEASE.md](docs/RELEASE.md).

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run gate` | tip kontrolü, bütün testler, denge kapıları, isim kontrolü |
| `npm test` | motor testleri, workerd içinde sunucu testleri, uygulama mantığı testleri |
| `npm run sim` | botlar tohumlu turlar oynar; bir denge kapısı geçmezse 1 ile çıkar |
| `npm run server` | yerel D1 veritabanıyla yerel API |
| `npm run web` / `npm run mobile` | uygulama tarayıcıda / telefonda ya da simülatörde |
| `npm run art:gen` | görsel üretim planını yazar; üretmek için `-- --go` ekle (ücretli) |
| `npm run audio:gen` | ses üretim planını yazar; üretmek için `-- --go` ekle (ücretli) |

## Lisans

[MIT](LICENSE)
