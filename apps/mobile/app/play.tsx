// One daily run: get the seed, play, then send the input log. The server answers with the verified score.
import { encodeLog, type RunSummary } from '@game/engine';
import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDaily, submitRun, type Daily } from '@/api/client';
import { GameView } from '@/game/GameView';
import { useProfile } from '@/state/profile';
import { Button } from '@/ui/Button';
import { color, font, space } from '@/ui/theme';

type Submit = { kind: 'sending' } | { kind: 'ranked'; rank: number } | { kind: 'offline' };
type Phase =
  | { kind: 'ready' }
  | { kind: 'playing' }
  | { kind: 'over'; summary: RunSummary; submit: Submit };

export default function Play() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [daily, setDaily] = useState<Daily | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'ready' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    void getDaily().then(setDaily);
  }, []);

  function finish(summary: RunSummary, log: Uint16Array) {
    if (!daily) return;
    const { name, recordScore } = useProfile.getState();
    recordScore(daily.day, summary.score);
    setPhase({ kind: 'over', summary, submit: { kind: 'sending' } });
    // The id is the idempotency key: a retry of this request can never count twice.
    submitRun({ id: randomUUID(), day: daily.day, name: name.trim() || 'Player', log: encodeLog(log) }).then(
      (r) => setPhase({ kind: 'over', summary, submit: { kind: 'ranked', rank: r.rank } }),
      () => setPhase({ kind: 'over', summary, submit: { kind: 'offline' } }),
    );
  }

  function retry() {
    setAttempt((n) => n + 1);
    setPhase({ kind: 'playing' });
  }

  if (!daily) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={color.player} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <GameView key={attempt} seed={daily.seed} playing={phase.kind === 'playing'} onEnd={finish} />

      {phase.kind === 'ready' ? (
        <Pressable style={styles.overlay} onPress={() => setPhase({ kind: 'playing' })} accessibilityRole="button">
          <Text style={styles.hint}>{t('play.start')}</Text>
        </Pressable>
      ) : null}

      {phase.kind === 'over' ? (
        <View style={styles.overlay}>
          <View style={styles.panel}>
            <Text style={styles.title}>{t('result.title')}</Text>
            <Text style={styles.score}>{t('result.score', { score: phase.summary.score })}</Text>
            <Text style={styles.status}>
              {phase.submit.kind === 'sending'
                ? t('result.sending')
                : phase.submit.kind === 'ranked'
                  ? t('result.rank', { rank: phase.submit.rank })
                  : t('result.offline')}
            </Text>
            <Button primary label={t('result.retry')} onPress={retry} />
            <Button label={t('result.home')} onPress={() => router.back()} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.l,
    backgroundColor: 'rgba(14, 17, 22, 0.6)',
  },
  hint: { color: color.text, fontSize: font.body + 2, textAlign: 'center', lineHeight: 28 },
  panel: { width: '100%', maxWidth: 360, gap: space.m, padding: space.l, borderRadius: 16, backgroundColor: color.arena },
  title: { color: color.text, fontSize: 28, fontWeight: '800', textAlign: 'center' },
  score: { color: color.accent, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  status: { color: color.muted, fontSize: font.body, textAlign: 'center' },
});
