// sfc32 with a splitmix32 seed expander. It uses only 32-bit integer operations,
// so every JavaScript engine (Hermes, V8, JavaScriptCore, workerd) gives the same numbers.
// The state is a plain object: it lives inside the run state and is part of the state hash.

export interface RngState {
  a: number;
  b: number;
  c: number;
  d: number;
}

export function seedRng(seed: number): RngState {
  let s = seed >>> 0;
  const mix = () => {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
    z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
  const state = { a: mix(), b: mix(), c: mix(), d: mix() };
  for (let i = 0; i < 12; i++) nextU32(state);
  return state;
}

/** Next unsigned 32-bit integer. Changes the state. */
export function nextU32(r: RngState): number {
  const t = (((r.a + r.b) >>> 0) + r.d) >>> 0;
  r.d = (r.d + 1) >>> 0;
  r.a = (r.b ^ (r.b >>> 9)) >>> 0;
  r.b = (r.c + (r.c << 3)) >>> 0;
  r.c = ((r.c << 21) | (r.c >>> 11)) >>> 0;
  r.c = (r.c + t) >>> 0;
  return t;
}

/** Integer in [min, max], both inclusive. */
export function nextInt(r: RngState, min: number, max: number): number {
  return min + (nextU32(r) % (max - min + 1));
}

/** True with a chance of perMille / 1000. */
export function chance(r: RngState, perMille: number): boolean {
  return nextU32(r) % 1000 < perMille;
}

/** FNV-1a (32 bit) over UTF-16 code units. Gives stable seeds from text such as day keys. */
export function hashText(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
