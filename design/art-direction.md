# Art direction

> Write this before you generate a single image. Every asset prompt starts with the style lock below
> (`art/prompts.json → stylePrefix`), so all assets look like one hand made them.

## 1. Style lock (copy into stylePrefix)

Clean flat vector shapes with a soft inner glow, for a minimal portrait-mode mobile arcade game.
Rounded corners, no outlines, gentle shading. Readable at 48 px.

## 2. Palette

| Token | Hex | Use |
|---|---|---|
| bg | #0E1116 | Screen background |
| arena | #161B22 | Play area, panels |
| arenaEdge | #2A3140 | Arena border, input border |
| player | #4CC9F0 | The player, primary buttons |
| block | #F72585 | Danger |
| accent | #FFD166 | Score, rewards |
| text | #E6EDF3 | Main text |
| muted | #8B949E | Secondary text |

The app reads these values from `apps/mobile/src/ui/theme.ts`. Change both together.

## 3. Constraints (copy into constraints)

No text, letters, numbers, logos or watermarks in images. No likeness of a real person, a known
character or the art of another game. Not photorealistic.

## 4. Asset rules

1. Generate the style anchor first. Every other asset uses it as a reference image.
2. Sprites: transparent background, one object, centered, nothing else in the image.
3. Backdrops: low contrast, so sprites stay readable on top.
4. App icon: one bold idea, readable at 60 px, fills the whole square (the store adds the mask).
5. Review every master on a real phone screen before you copy it into `apps/mobile/assets`.

## 5. Readability checks

- The player and danger colors differ in hue and in brightness (color-blind safe).
- Every state change has a shape or motion cue, not only a color change.
