# 03 · Engine, tests and sim gates

**When:** after the canon.
**Output:** `packages/engine` with tests, bots and `npm run sim`.

```text
Write the game rules as a pure TypeScript engine in packages/engine. Follow design/canon.md exactly.
Rules: no Date.now, no Math.random, no I/O, no globals. Randomness only from the seeded RNG in rng.ts,
and its state lives inside the game state. Tunable numbers only in config.ts.
The same seed and the same inputs must give the same state hash.
Test every formula with design/formula-vectors.json.
Add bots and a balance sim (npm run sim) that checks the canon's balance targets and exits 1 on a miss.
Do not loosen a gate to make it pass: tell me which canon number to change.
Run npm run gate and paste the output.
```

**Check:** vectors pass; a determinism test exists; the sim prints a table and its gates.

<details><summary>Türkçe</summary>

```text
Oyun kurallarını packages/engine içinde saf bir TypeScript motoru olarak yaz. design/canon.md'ye birebir uy.
Kurallar: Date.now, Math.random, I/O ve global yok. Rastgelelik yalnızca rng.ts'teki tohumlu RNG'den gelsin;
durumu oyun durumunun içinde dursun. Ayarlanabilir sayılar yalnızca config.ts'te olsun.
Aynı tohum ve aynı girdiler aynı durum özetini (hash) versin.
Her formülü design/formula-vectors.json ile test et.
Botlar ve denge hedeflerini ölçen bir simülasyon (npm run sim) ekle; hedef tutmazsa 1 ile çıksın.
Kapıyı geçmek için gevşetme: hangi canon sayısının değişmesi gerektiğini söyle.
npm run gate çalıştır ve çıktıyı yapıştır.
```
</details>
