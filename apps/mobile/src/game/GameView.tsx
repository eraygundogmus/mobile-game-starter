// The game screen: a fixed-step loop around the engine, a Skia canvas and a drag input.
//
//   requestAnimationFrame ─► accumulate time ─► step(run, input) at 60 ticks/s ─► input log
//                                    │
//                                    ├─► events (hit, dodge) ─► HUD state, haptics
//                                    └─► createPicture ─► shared value ─► <Picture> (no React render)
import {
  CONFIG, createRun, InputLog, step, summarize, type Run, type RunSummary, type SimEvent,
} from '@game/engine';
import { Canvas, createPicture, Picture, type SkPicture } from '@shopify/react-native-skia';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanResponder, Platform, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { color, font, space } from '@/ui/theme';
import { drawRun } from './draw';
import { dragTarget, fitArena } from './layout';

const TICK_MS = 1000 / CONFIG.ticksPerSecond;
/** After a long stall (app in background), the loop catches up at most this many ticks per frame. */
const MAX_STEPS_PER_FRAME = 8;
const HIT_FLASH_TICKS = 12;

let empty: SkPicture | null = null;
const emptyPicture = () => (empty ??= createPicture(() => {}, { width: 1, height: 1 }));

interface Props {
  seed: number;
  playing: boolean;
  onEnd(summary: RunSummary, log: Uint16Array): void;
}

export function GameView({ seed, playing, onEnd }: Props) {
  const { t } = useTranslation();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const fit = useMemo(() => fitArena(size.width, size.height, CONFIG.arena), [size]);
  const [hud, setHud] = useState({ score: 0, lives: CONFIG.player.lives });

  const picture = useSharedValue<SkPicture>(emptyPicture());
  const [run] = useState<Run>(() => createRun(seed));
  const [log] = useState(() => new InputLog());
  const live = useRef({ target: run.x, flash: 0, fit, size, onEnd });
  live.current.fit = fit;
  live.current.size = size;
  live.current.onEnd = onEnd;

  const redraw = useCallback(() => {
    const { fit: f, size: s, flash } = live.current;
    if (f.scale <= 0) return;
    picture.value = createPicture((canvas) => drawRun(canvas, run, f, flash), { width: s.width, height: s.height });
  }, [picture, run]);

  const pan = useMemo(() => {
    let startX = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startX = run.x;
        live.current.target = startX;
      },
      onPanResponderMove: (_e, g) => {
        live.current.target = dragTarget(startX, g.dx, live.current.fit.scale, CONFIG.arena.width);
      },
    });
  }, [run]);

  useEffect(redraw, [fit, redraw]);

  useEffect(() => {
    if (!playing || run.end) return;
    const events: SimEvent[] = [];
    let raf = 0;
    let last: number | null = null;
    let acc = 0;
    const frame = (now: number) => {
      if (last !== null) acc += Math.min(now - last, 250);
      last = now;
      let steps = 0;
      while (acc >= TICK_MS && !run.end && steps < MAX_STEPS_PER_FRAME) {
        const input = live.current.target;
        log.push(input);
        step(run, input, events);
        acc -= TICK_MS;
        steps++;
      }
      live.current.flash = Math.max(0, live.current.flash - steps);
      let changed = false;
      for (const e of events) {
        if (e.type === 'hit') {
          live.current.flash = HIT_FLASH_TICKS;
          if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        }
        if (e.type === 'hit' || e.type === 'dodge') changed = true;
      }
      events.length = 0;
      if (changed) setHud({ score: run.score, lives: run.lives });
      redraw();
      if (run.end) {
        live.current.onEnd(summarize(run)!, log.view().slice());
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, run, log, redraw]);

  return (
    <View
      style={styles.root}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      {...pan.panHandlers}
    >
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Picture picture={picture} />
      </Canvas>
      <View style={[styles.hud, { top: fit.y + space.s, left: fit.x + space.m, right: fit.x + space.m }]} pointerEvents="none">
        <Text style={styles.hudText}>{t('play.score', { score: hud.score })}</Text>
        <Text style={styles.hudText}>{t('play.lives', { lives: hud.lives })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  hud: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between' },
  hudText: { color: color.text, fontSize: font.body, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
