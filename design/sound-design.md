# Sound design

> Write this before `audio/sounds.json`. Every sound has a trigger in the code and a visual twin on screen.

## 1. Direction

Soft, clean, synthetic. Short sounds. Positive events rise in pitch; negative events fall.
Music is a calm, steady loop that does not compete with the effects.

## 2. Rules

1. Audio is never the only signal. A player with the sound off loses no information.
2. Sound effects come from engine events (`SimEvent`), never from a second copy of the rules.
3. One sound per event. When a repeat sounds mechanical, add a variant as its own id (`hit_2`).
4. Loudness: effects at −16 LUFS, music at −18 LUFS, true peak under −1.5 dBTP (`scripts/gen-audio.mjs`).
5. The app suspends audio in the background.

The starter app does not play audio yet. To wire it: add `expo-audio`, load the masters from
`apps/mobile/assets/audio`, and play them from the event loop in `src/game/GameView.tsx`
(the same place that fires the haptic on a hit).

## 3. Event map

| Event | Sound id | Visual twin |
|---|---|---|
| button press | ui_tap | pressed state |
| SimEvent dodge | dodge | score changes |
| SimEvent hit | hit | player flash, haptic |
| SimEvent end | run_over | result panel |
| run active | music_run | — |
