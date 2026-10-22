# 05 · Phone and web app

**When:** the engine passes its gates.
**Output:** playable Expo screens, offline first.

```text
Connect the engine to the Expo app in apps/mobile. The same code must run on iOS, Android and the web.
Draw the play area with Skia: record each frame into an SkPicture on a Reanimated shared value,
so a frame does not cause a React render. Run the engine with a fixed-step loop and record one input per tick.
React state changes only on game events (HUD).
Screens: home, play, result, settings. Texts only through i18n (en and tr).
First version is offline single player. Show me screenshots from the iOS simulator and the web.
```

**Check:** a run plays at a steady frame rate; the same seed looks the same on phone and web.

<details><summary>Türkçe</summary>

```text
Motoru apps/mobile içindeki Expo uygulamasına bağla. Aynı kod iOS, Android ve web'de çalışsın.
Oyun alanını Skia ile çiz: her kareyi bir SkPicture olarak Reanimated shared value'ya yaz,
böylece her kare React render'ı tetiklemesin. Motoru sabit adımlı bir döngüyle çalıştır, her tik için bir girdi kaydet.
React state yalnızca oyun olaylarında değişsin (HUD).
Ekranlar: ana sayfa, oyun, sonuç, ayarlar. Metinler yalnızca i18n'den gelsin (en ve tr).
İlk sürüm çevrimdışı ve tek oyunculu. Bana iOS simülatöründen ve web'den ekran görüntüsü göster.
```
</details>
