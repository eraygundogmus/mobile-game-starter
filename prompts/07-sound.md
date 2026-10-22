# 07 · Sound

**When:** the look is approved.
**Output:** `design/sound-design.md`, `audio/sounds.json`, mastered audio.

```text
Write design/sound-design.md: the direction, the rules and an event map (engine event -> sound id -> visual twin).
Audio is never the only signal.
Then write audio/sounds.json: every sound effect (id, trigger, prompt, seconds) and every music track
(id, trigger, prompt, seconds, loop). Music prompts: instrumental, seamless loop, no intro, no fade-out.
Run node scripts/gen-audio.mjs (plan only) and show me the list before anything is generated.
After I approve, wire the sounds to the engine events in the game loop, not to a second copy of the rules.
```

**Check:** every sound has a trigger in code; the game is fully playable with the sound off.

<details><summary>Türkçe</summary>

```text
design/sound-design.md yaz: yön, kurallar ve olay haritası (motor olayı -> ses id -> görsel karşılığı).
Ses hiçbir zaman tek sinyal olmasın.
Sonra audio/sounds.json yaz: her efekt (id, tetikleyici, prompt, süre) ve her müzik (id, tetikleyici, prompt, süre, döngü).
Müzik promptları: enstrümantal, kesintisiz döngü, giriş yok, fade-out yok.
node scripts/gen-audio.mjs çalıştır (yalnızca plan) ve bir şey üretmeden önce listeyi göster.
Onayladıktan sonra sesleri oyun döngüsündeki motor olaylarına bağla; kuralların ikinci bir kopyasına değil.
```
</details>
