# 04 · Parallel systems (optional)

**When:** the canon has several independent systems (economy, combat, progression, …).
**Output:** one branch per system, merged one by one.

```text
Split design/canon.md into independent systems. For each system, list its folder, its canon sections,
its tests and the shared files it must not touch.
Then open one git worktree per system and give each one to a separate coding agent with this brief:
"Change only <folder>. Implement canon sections <x>. Write the tests from the formula sheet.
Run the workspace tests. Do not change shared files."
When an agent finishes, review its diff, merge it alone and run npm run gate before the next merge.
```

**Check:** no two systems change the same file; `npm run gate` passes after every merge.

<details><summary>Türkçe</summary>

```text
design/canon.md'yi birbirinden bağımsız sistemlere böl. Her sistem için klasörünü, canon bölümlerini,
testlerini ve dokunmaması gereken ortak dosyaları listele.
Sonra her sistem için ayrı bir git worktree aç ve her birini ayrı bir kod ajanına şu notla ver:
"Yalnızca <klasör> değişsin. Canon <x> bölümünü uygula. Testleri formül sayfasından yaz.
Workspace testlerini çalıştır. Ortak dosyalara dokunma."
Bir ajan bitince farkı incele, tek başına birleştir ve bir sonrakinden önce npm run gate çalıştır.
```
</details>
