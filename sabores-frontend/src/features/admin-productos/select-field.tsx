import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, BottomSheet } from '@/components/ui';
import { layout, palette, radii, spacing } from '@/constants/theme';

export type SelectOption = {
  id: number;
  label: string;
  description?: string;
};

type SelectFieldProps = {
  label: string;
  value: SelectOption | null;
  placeholder: string;
  onPress: () => void;
  error?: string | null;
  helper?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function SelectField({
  label,
  value,
  placeholder,
  onPress,
  error,
  helper,
  disabled = false,
  containerStyle,
}: SelectFieldProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <AppText variant="label" color={palette.slate}>
        {label}
        <AppText color={palette.ember}> *</AppText>
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={value ? `${label}: ${value.label}` : `${label}: ${placeholder}`}
        accessibilityHint={error ?? helper}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.input,
          Boolean(error) && styles.inputError,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}>
        <AppText
          variant="body"
          color={value ? palette.ink : palette.stone}
          numberOfLines={1}
          style={styles.value}>
          {value?.label ?? placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={palette.stone} />
      </Pressable>

      {error ? (
        <AppText variant="caption" color={palette.danger}>
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color={palette.warmGray}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

type OptionSheetProps = {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedId: number | null;
  onSelect: (option: SelectOption) => void;
  onClose: () => void;
};

export function OptionSheet({
  visible,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
}: OptionSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.options}>
        {options.length === 0 ? (
          <AppText variant="body" color={palette.warmGray}>
            No hay opciones disponibles.
          </AppText>
        ) : (
          options.map((option) => {
            const selected = option.id === selectedId;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected }}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.optionCopy}>
                  <AppText variant="label">{option.label}</AppText>
                  {option.description ? (
                    <AppText variant="caption" color={palette.warmGray}>
                      {option.description}
                    </AppText>
                  ) : null}
                </View>
                {selected ? <Ionicons name="checkmark" size={20} color={palette.ember} /> : null}
              </Pressable>
            );
          })
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  input: {
    minHeight: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1.5,
    borderRadius: radii.input,
    paddingHorizontal: spacing.lg,
  },
  inputError: {
    borderColor: palette.danger,
  },
  value: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  options: {
    gap: spacing.xs,
  },
  option: {
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.input,
  },
  optionSelected: {
    backgroundColor: palette.canvas,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
});
