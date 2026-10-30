import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { layout, palette, radii, spacing } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'md' | 'sm';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

const textColors: Record<ButtonVariant, string> = {
  primary: palette.ink,
  secondary: palette.ink,
  ghost: palette.ember,
  destructive: palette.danger,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const dimmed = disabled && !loading;
  const contentColor = dimmed ? palette.stone : textColors[variant];
  const accessibilityState: AccessibilityState = { disabled: isDisabled, busy: loading };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.small,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'destructive' && styles.destructive,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        dimmed && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <AppText variant="label" color={contentColor}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.buttonHeight,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  small: {
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: palette.ember,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: palette.charcoal,
    borderWidth: 1.5,
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
  },
  destructive: {
    backgroundColor: 'transparent',
    borderColor: palette.danger,
    borderWidth: 1.5,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: palette.fog,
    borderColor: 'transparent',
  },
});
