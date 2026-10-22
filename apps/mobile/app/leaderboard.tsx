import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBoard, type BoardRow } from '@/api/client';
import { Button } from '@/ui/Button';
import { color, font, space } from '@/ui/theme';

type State = { kind: 'loading' } | { kind: 'error' } | { kind: 'done'; rows: BoardRow[] };

export default function Leaderboard() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    getBoard().then(
      (b) => setState({ kind: 'done', rows: b.rows }),
      () => setState({ kind: 'error' }),
    );
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.l, paddingBottom: insets.bottom + space.l }]}>
      <Text style={styles.title}>{t('board.title')}</Text>
      <View style={styles.body}>
        {state.kind === 'loading' ? <ActivityIndicator color={color.player} /> : null}
        {state.kind === 'error' ? <Text style={styles.note}>{t('board.error')}</Text> : null}
        {state.kind === 'done' && state.rows.length === 0 ? <Text style={styles.note}>{t('board.empty')}</Text> : null}
        {state.kind === 'done' && state.rows.length > 0 ? (
          <FlatList
            data={state.rows}
            keyExtractor={(r) => String(r.rank)}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={styles.rank}>{item.rank}</Text>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.score}>{item.score}</Text>
              </View>
            )}
          />
        ) : null}
      </View>
      <Button label={t('board.back')} onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.l, gap: space.m, backgroundColor: color.bg },
  title: { color: color.text, fontSize: 28, fontWeight: '800' },
  body: { flex: 1, justifyContent: 'center' },
  note: { color: color.muted, fontSize: font.body, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.s },
  rank: { width: 32, color: color.muted, fontSize: font.body, fontVariant: ['tabular-nums'] },
  name: { flex: 1, color: color.text, fontSize: font.body },
  score: { color: color.accent, fontSize: font.body, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
