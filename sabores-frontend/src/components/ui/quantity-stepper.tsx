import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radii, spacing } from '@/constants/theme';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  label = 'Cantidad',
}: QuantityStepperProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <View
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      style={[styles.container, disabled && styles.disabled]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quitar una unidad"
        accessibilityState={{ disabled: !canDecrease }}
        disabled={!canDecrease}
        hitSlop={8}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={styles.button}>
        <Ionicons name="remove" size={18} color={canDecrease ? palette.ink : palette.stone} />
      </Pressable>

      <AppText variant="label" style={styles.value}>
        {value}
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Agregar una unidad"
        accessibilityState={{ disabled: !canIncrease }}
        disabled={!canIncrease}
        hitSlop={8}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={styles.button}>
        <Ionicons name="add" size={18} color={canIncrease ? palette.ink : palette.stone} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xs,
  },
  button: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  value: {
    minWidth: 28,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  disabled: {
    opacity: 0.5,
  },
});
