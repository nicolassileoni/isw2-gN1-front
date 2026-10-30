import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { fonts, layout, palette, radii, spacing } from '@/constants/theme';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string | null;
  helper?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps['style'];
};

export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  {
    label,
    error,
    helper,
    required = false,
    containerStyle,
    inputStyle,
    onFocus,
    onBlur,
    accessibilityLabel,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <AppText variant="label" color={palette.slate}>
        {label}
        {required ? <AppText color={palette.ember}> *</AppText> : null}
      </AppText>

      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? helper}
        placeholderTextColor={palette.stone}
        selectionColor={palette.ember}
        style={[
          styles.input,
          focused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          inputStyle,
        ]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />

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
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  input: {
    minHeight: layout.inputHeight,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1.5,
    borderRadius: radii.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  inputFocused: {
    borderColor: palette.ember,
    borderWidth: 2,
  },
  inputError: {
    borderColor: palette.danger,
  },
});
