import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radii, spacing } from '@/constants/theme';

type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  helper?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/**
 * DESIGN 8.21: track 44 × 26, thumb 22, activo `ember`, inactivo `driftwood`.
 * Usa un Pressable en lugar del Switch nativo para respetar los tokens y el target de 44 pt.
 */
export function Switch({
  value,
  onValueChange,
  label,
  helper,
  disabled = false,
  accessibilityLabel,
}: SwitchProps) {
  return (
    <View style={styles.container}>
      {label || helper ? (
        <View style={styles.copy}>
          {label ? <AppText variant="label">{label}</AppText> : null}
          {helper ? (
            <AppText variant="caption" color={palette.warmGray}>
              {helper}
            </AppText>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel ?? label ?? 'Activo'}
        accessibilityState={{ checked: value, disabled }}
        disabled={disabled}
        onPress={() => onValueChange(!value)}
        hitSlop={spacing.sm}
        style={styles.target}>
        <View
          style={[
            styles.track,
            value ? styles.trackOn : styles.trackOff,
            disabled && styles.trackDisabled,
          ]}>
          <View style={[styles.thumb, value && styles.thumbOn]} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: { flex: 1, gap: 2 },
  target: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: 44,
    height: 26,
    borderRadius: radii.pill,
    padding: 2,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: palette.ember },
  trackOff: { backgroundColor: palette.driftwood },
  trackDisabled: { opacity: 0.45 },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: palette.white,
  },
  thumbOn: { transform: [{ translateX: 18 }] },
});
