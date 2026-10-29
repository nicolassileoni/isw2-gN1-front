import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { fonts, layout, palette, radii, spacing } from '@/constants/theme';

type SearchFieldProps = Omit<TextInputProps, 'style'> & {
  containerStyle?: StyleProp<ViewStyle>;
};

export function SearchField({
  containerStyle,
  value,
  onChangeText,
  onFocus,
  onBlur,
  placeholder = 'Buscar',
  ...rest
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.containerFocused, containerStyle]}>
      <Ionicons name="search-outline" size={20} color={palette.stone} />

      <TextInput
        accessibilityLabel={rest.accessibilityLabel ?? placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.stone}
        selectionColor={palette.ember}
        style={styles.input}
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

      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpiar búsqueda"
          hitSlop={8}
          onPress={() => onChangeText?.('')}>
          <Ionicons name="close-circle" size={20} color={palette.stone} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.input,
    paddingHorizontal: spacing.lg,
  },
  containerFocused: {
    borderColor: palette.ember,
    borderWidth: 2,
  },
  input: {
    flex: 1,
    color: palette.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
});
