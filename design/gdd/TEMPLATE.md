# GDD: <system name>

> One file per system (`design/gdd/<system>.md`). The canon gives the short rule; this file expands it.
> Keep `design/gdd/systems-index.md` up to date when you add a system.

Status: draft | approved · Owner: · Canon sections:

## 1. Overview

What the system does, in 3–5 sentences.

## 2. Player fantasy

What the player feels or wants from this system. One short paragraph.

## 3. Rules

Numbered, testable rules. One rule per line. Refer to canon numbers by name, not by value.

## 4. Formulas

Every formula with its inputs, output, units and range. Add test vectors to `design/formula-sheet.md`.

## 5. Edge cases

What happens at 0, at the cap, on a tie, on a disconnect, on a retry, at midnight UTC.

## 6. Dependencies

Systems this one reads from and writes to. Draw it when it helps:

```
<input system> ──► <this system> ──► <output system>
```

## 7. Tuning knobs

| Knob | Config path | Safe range | Effect |
|---|---|---|---|

## 8. Acceptance criteria

Checks that prove the system works: tests, sim gates, a manual check on a phone.

## 9. Open questions

Dated list. Move answers into the canon.
