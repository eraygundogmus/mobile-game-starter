---
name: art-prompts
description: Add or change entries in art/prompts.json so every image follows the style lock in design/art-direction.md, then plan the generation run. Use when someone asks for a new sprite, icon, backdrop, UI frame or any generated image for the game.
---

# Art prompts

## Before you write a prompt

1. Read `design/art-direction.md` (style lock, palette tokens, constraints).
2. Read `art/prompts.json`. Reuse its `stylePrefix` and `constraints`. Never write a second style.
3. Check `design/glossary.tsv` for the asset's name. Add a row first if the term is new.

## Entry format

```json
{
  "id": "kebab-case-id",
  "group": "sprite",
  "master": "art/masters/sprite/<id>.png",
  "aspect": "1:1",
  "background": "transparent",
  "references": ["art/masters/anchor/style-anchor.png"],
  "prompt": "What the asset shows: subject, shape, how it reads at small size, palette colors by name."
}
```

- `group`: `anchor`, `sprite`, `backdrop`, `brand`, or a new group that the art direction names.
- `background`: `transparent` for sprites, `opaque` for icons; leave it out for backdrops.
- Optional per asset: `quality`, `resolution`. The catalog values are the defaults.

## Prompt rules

1. Describe what is visible, not a mood. One subject per image.
2. Use the palette colors from the art direction by name and hex, not loose colors.
3. State the silhouette: it must read at 48 px on a phone.
4. Every asset except the anchor lists the anchor master in `references`.
5. Do not name other games, studios, artists or brands. Do not ask for text in the image.
6. UI frames and buttons: ask for empty frames; the app draws the text.

## Run

1. Plan only (no cost): `node scripts/gen-art.mjs --only <group>/<id>`. Show the plan to the user.
2. Generate only after the user approves: `node scripts/gen-art.mjs --only <group>/<id> --go`.
3. Look at the master in a phone-sized view before you copy it into `apps/mobile/assets`.
