---
name: gdd-section
description: Write or update one system's game design document in design/gdd/ from design/gdd/TEMPLATE.md, consistent with the canon, glossary and formula sheet. Use when a new system is added (economy, progression, combat, events, …) or when a system's rules change.
---

# GDD section

## Steps

1. Read `design/canon.md`, `design/glossary.tsv`, `design/formula-sheet.md` and `design/gdd/systems-index.md`.
2. Copy `design/gdd/TEMPLATE.md` to `design/gdd/<system>.md` (kebab-case), or open the existing file.
3. Fill every section. Each number comes from the canon. If the canon lacks a number, add it to the canon
   first and say so.
4. Write each formula once, in `design/formula-sheet.md`, with 4–6 vectors. The GDD links to it.
5. Add new terms to `design/glossary.tsv` (concept, en, tr, note) before you use them.
6. Add or update the row in `design/gdd/systems-index.md` (system, canon sections, GDD file, engine module, depends on).
7. List what the engine must change: files in `packages/engine/src`, new config keys, new tests.

## Checks before you finish

- [ ] No number in the GDD differs from the canon.
- [ ] Every term is in the glossary. One term means one thing.
- [ ] Every formula has vectors in the formula sheet and in `design/formula-vectors.json`.
- [ ] Balance effects are measurable by `npm run sim` (add a gate if needed).
- [ ] Open questions are in the canon section "Open questions", not hidden in the GDD.
