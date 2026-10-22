// Draws one frame of a run on a Skia canvas, in arena units. Render only: it never changes the run.
import type { Run } from '@game/engine';
import { ClipOp, PaintStyle, Skia, type SkCanvas, type SkPaint } from '@shopify/react-native-skia';
import { color } from '@/ui/theme';
import type { Fit } from './layout';

type PaintName = 'arena' | 'edge' | 'player' | 'block' | 'hit';
let paints: Record<PaintName, SkPaint> | null = null;

// Created on first use: on the web, Skia objects cannot exist before CanvasKit loads.
function getPaints(): Record<PaintName, SkPaint> {
  if (paints) return paints;
  const make = (hex: string, stroke = 0) => {
    const p = Skia.Paint();
    p.setColor(Skia.Color(hex));
    p.setAntiAlias(true);
    if (stroke) {
      p.setStyle(PaintStyle.Stroke);
      p.setStrokeWidth(stroke);
    }
    return p;
  };
  paints = {
    arena: make(color.arena),
    edge: make(color.arenaEdge, 2),
    player: make(color.player),
    block: make(color.block),
    hit: make(color.hit),
  };
  return paints;
}

/** `flash` > 0 draws the player in the hit color (a render-only effect). */
export function drawRun(canvas: SkCanvas, run: Run, fit: Fit, flash: number): void {
  const p = getPaints();
  const c = run.config;
  const arena = Skia.XYWHRect(0, 0, c.arena.width, c.arena.height);

  canvas.save();
  canvas.translate(fit.x, fit.y);
  canvas.scale(fit.scale, fit.scale);
  canvas.drawRect(arena, p.arena);
  canvas.clipRect(arena, ClipOp.Intersect, true);

  const bh = c.block.height;
  for (const b of run.blocks) {
    canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(b.x - b.width / 2, b.y - bh / 2, b.width, bh), 4, 4), p.block);
  }

  const { width: pw, height: ph, y: py } = c.player;
  canvas.drawRRect(Skia.RRectXY(Skia.XYWHRect(run.x - pw / 2, py - ph / 2, pw, ph), ph / 2, ph / 2), flash > 0 ? p.hit : p.player);

  canvas.restore();
  canvas.drawRect(Skia.XYWHRect(fit.x, fit.y, fit.width, fit.height), p.edge);
}
