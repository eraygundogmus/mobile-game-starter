# 06 · Visual identity and art prompts

**When:** the game plays, but it has no look yet.
**Output:** `design/art-direction.md`, `art/prompts.json`, generated masters.

```text
The game has no visual identity. Show me three different visual directions (one paragraph and a palette each).
Do not imitate any existing game.
For the direction I pick, write design/art-direction.md: a style lock, palette tokens, constraints and asset rules.
Then write art/prompts.json: one stylePrefix and one constraints text for all assets, and one entry per asset
(id, group, master path, aspect, background, references, prompt). The style anchor comes first;
every other asset uses it as a reference.
Run node scripts/gen-art.mjs (plan only) and show me the list and the cost before anything is generated.
```

**Check:** one style prefix for everything; anchor first; you approve the cost before `--go`.

<details><summary>Türkçe</summary>

```text
Oyunun bir görsel kimliği yok. Bana üç farklı görsel yön göster (her biri için bir paragraf ve bir palet).
Hiçbir oyunu taklit etme.
Seçtiğim yön için design/art-direction.md yaz: stil kilidi, palet, kısıtlar ve görsel kuralları.
Sonra art/prompts.json yaz: bütün görseller için tek bir stylePrefix ve tek bir constraints metni,
her görsel için bir kayıt (id, group, master yolu, oran, arka plan, referanslar, prompt). Önce stil çıpası gelsin;
diğer bütün görseller onu referans alsın.
node scripts/gen-art.mjs çalıştır (yalnızca plan) ve bir şey üretmeden önce listeyi ve maliyeti göster.
```
</details>
