// The daily run: every player gets the same seed on the same UTC day.
// Time comes in as a parameter. The engine never reads the clock.
import { hashText } from './rng';

const DAY_MS = 86_400_000;

/** UTC day key, "YYYY-MM-DD". */
export function dayKey(epochMs: number): string {
  return new Date(Math.floor(epochMs / DAY_MS) * DAY_MS).toISOString().slice(0, 10);
}

export function previousDayKey(epochMs: number): string {
  return dayKey(epochMs - DAY_MS);
}

export function isDayKey(text: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(text) && dayKey(Date.parse(`${text}T00:00:00Z`)) === text;
}

export function dailySeed(day: string): number {
  return hashText(`daily:${day}`);
}
