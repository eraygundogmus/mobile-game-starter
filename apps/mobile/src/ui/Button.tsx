import { Pressable, StyleSheet, Text } from 'react-native';
import { color, font, space } from './theme';

interface Props {
  label: string;
  onPress(): void;
  primary?: boolean;
}

export function Button({ label, onPress, primary }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, primary && styles.primary, pressed && styles.pressed]}
    >
      <Text style={[styles.label, primary && styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: space.l,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.button,
  },
  primary: { backgroundColor: color.player },
  pressed: { opacity: 0.7 },
  label: { color: color.text, fontSize: font.body, fontWeight: '600' },
  primaryLabel: { color: color.bg },
});
