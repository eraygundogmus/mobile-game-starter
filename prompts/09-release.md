# 09 · Store release

**When:** online works and `npm run gate` passes.
**Output:** TestFlight and Google Play closed testing builds, web deploy.

```text
Prepare the app for TestFlight and Google Play closed testing:
app name, bundle id and package, icon, splash screen, build numbers, all languages,
store texts (title, subtitle, short and full description, keywords), a privacy page on the web build
and a release checklist in docs/RELEASE.md. Keep every key and password outside the repo and never print them.
Deploy the server first, then the web build, then upload the phone builds. Show me each step's result.
```

**Check:** the checklist in `docs/RELEASE.md` is complete; the store accepts the build.

<details><summary>Türkçe</summary>

```text
Uygulamayı TestFlight ve Google Play kapalı testine hazırla:
uygulama adı, bundle id ve paket adı, simge, açılış ekranı, build numaraları, bütün diller,
mağaza metinleri (başlık, alt başlık, kısa ve uzun açıklama, anahtar kelimeler), web sürümünde bir gizlilik sayfası
ve docs/RELEASE.md içinde bir yayın kontrol listesi. Anahtarları ve şifreleri repo dışında tut, asla yazdırma.
Önce sunucuyu, sonra web'i yayınla, sonra telefon build'lerini yükle. Her adımın sonucunu göster.
```
</details>
