import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText, BottomSheet, Button, IconButton } from '@/components/ui';
import { fonts, layout, palette, radii, spacing } from '@/constants/theme';
import { formatDateInput } from '@/lib/format';

type DateFieldProps = {
  label: string;
  /** Fecha en formato AAAA-MM-DD. */
  value: string;
  onChangeText: (value: string) => void;
  error?: string | null;
  helper?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Interpreta AAAA-MM-DD como fecha local, sin pasar por UTC. */
function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Campo AAAA-MM-DD editable con acceso a un calendario nativo. El input sigue
 * siendo la alternativa para escribir la fecha a mano.
 */
export function DateField({
  label,
  value,
  onChangeText,
  error,
  helper,
  disabled = false,
  containerStyle,
}: DateFieldProps) {
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState<Date>(() => parseDateInput(value) ?? new Date());
  const [focused, setFocused] = useState(false);

  const abrir = () => {
    setBorrador(parseDateInput(value) ?? new Date());
    setAbierto(true);
  };

  const cerrar = () => setAbierto(false);

  const confirmar = () => {
    onChangeText(formatDateInput(borrador));
    cerrar();
  };

  const cambiarIos = (_event: DateTimePickerEvent, fecha?: Date) => {
    if (fecha) setBorrador(fecha);
  };

  const cambiarAndroid = (event: DateTimePickerEvent, fecha?: Date) => {
    cerrar();
    if (event.type === 'set' && fecha) onChangeText(formatDateInput(fecha));
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <AppText variant="label" color={palette.slate}>
        {label}
        <AppText color={palette.ember}> *</AppText>
      </AppText>

      <View style={styles.row}>
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={error ?? helper ?? 'Formato AAAA-MM-DD'}
          value={value}
          onChangeText={onChangeText}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={palette.stone}
          selectionColor={palette.ember}
          maxLength={10}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numbers-and-punctuation"
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            focused && styles.inputFocused,
            Boolean(error) && styles.inputError,
            disabled && styles.disabled,
          ]}
        />

        <IconButton
          name="calendar-outline"
          label={`Elegir ${label.toLocaleLowerCase('es-AR')} en el calendario`}
          onPress={abrir}
          variant="soft"
          disabled={disabled}
        />
      </View>

      {error ? (
        <AppText variant="caption" color={palette.danger}>
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color={palette.warmGray}>
          {helper}
        </AppText>
      ) : null}

      {Platform.OS === 'ios' ? (
        <BottomSheet
          visible={abierto}
          onClose={cerrar}
          title={`Elegir ${label.toLocaleLowerCase('es-AR')}`}
          footer={
            <View style={styles.sheetActions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={cerrar}
                style={styles.sheetButton}
              />
              <Button title="Usar fecha" onPress={confirmar} style={styles.sheetButton} />
            </View>
          }>
          <View style={styles.picker}>
            <DateTimePicker
              value={borrador}
              mode="date"
              display="inline"
              locale="es-AR"
              themeVariant="light"
              accentColor={palette.ember}
              onChange={cambiarIos}
            />
          </View>
        </BottomSheet>
      ) : abierto ? (
        <DateTimePicker
          value={borrador}
          mode="date"
          display="calendar"
          onChange={cambiarAndroid}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
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
  disabled: {
    opacity: 0.5,
  },
  picker: {
    alignItems: 'center',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sheetButton: {
    flex: 1,
  },
});
