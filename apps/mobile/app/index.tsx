import { dayKey } from '@game/engine';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/state/profile';
import { Button } from '@/ui/Button';
import { color, font, space } from '@/ui/theme';

export default function Home() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { name, best, bestDay, setName } = useProfile();
  const today = dayKey(Date.now());

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.l }]}>
      <View style={styles.head}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.tagline}>{t('home.tagline')}</Text>
      </View>
      <View style={styles.actions}>
        <TextInput
          value={name}
          onChangeText={setName}
          maxLength={16}
          placeholder={t('home.name')}
          placeholderTextColor={color.muted}
          accessibilityLabel={t('home.name')}
          style={styles.input}
        />
        {bestDay === today ? <Text style={styles.best}>{t('home.best', { score: best })}</Text> : null}
        <Button primary label={t('home.play')} onPress={() => router.push('/play')} />
        <Button label={t('home.board')} onPress={() => router.push('/leaderboard')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.l, justifyContent: 'space-between', backgroundColor: color.bg },
  head: { gap: space.s, alignItems: 'center', marginTop: space.xl },
  title: { color: color.text, fontSize: font.title, fontWeight: '800' },
  tagline: { color: color.muted, fontSize: font.body, textAlign: 'center' },
  actions: { gap: space.m, width: '100%', maxWidth: 420, alignSelf: 'center' },
  input: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: space.m,
    color: color.text,
    fontSize: font.body,
    backgroundColor: color.arena,
    borderWidth: 1,
    borderColor: color.arenaEdge,
  },
  best: { color: color.accent, fontSize: font.body, textAlign: 'center' },
});
