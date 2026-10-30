import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, BottomSheet, SearchField } from '@/components/ui';
import { layout, palette, radii, spacing } from '@/constants/theme';
import type { LocalAdminResponse } from '@/lib/api/types';

type LocalSelectorProps = {
  locales: LocalAdminResponse[];
  selectedId: number | null;
  onSelect: (local: LocalAdminResponse) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string | null;
  helper?: string;
  disabled?: boolean;
};

/**
 * Selector de local con búsqueda. Se usa igual en el listado de productos y en
 * el formulario, para que la selección no dependa de un scroll horizontal
 * cuando hay muchos locales.
 */
export function LocalSelector({
  locales,
  selectedId,
  onSelect,
  label,
  required = false,
  placeholder = 'Elegí un local',
  error,
  helper,
  disabled = false,
}: LocalSelectorProps) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const seleccionado = locales.find((local) => local.id === selectedId) ?? null;

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-AR');
    if (!texto) return locales;

    return locales.filter((local) => {
      const nombre = local.nombre.toLocaleLowerCase('es-AR');
      const direccion = (local.direccion ?? '').toLocaleLowerCase('es-AR');
      return nombre.includes(texto) || direccion.includes(texto);
    });
  }, [busqueda, locales]);

  const abrir = () => {
    setBusqueda('');
    setAbierto(true);
  };

  const cerrar = () => {
    setAbierto(false);
    setBusqueda('');
  };

  const seleccionar = (local: LocalAdminResponse) => {
    onSelect(local);
    cerrar();
  };

  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="label" color={palette.slate}>
          {label}
          {required ? <AppText color={palette.ember}> *</AppText> : null}
        </AppText>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          seleccionado
            ? `${label ?? 'Local'}: ${seleccionado.nombre}, ${
                seleccionado.activo ? 'activo' : 'inactivo'
              }`
            : `${label ?? 'Local'}: ${placeholder}`
        }
        accessibilityHint={error ?? helper}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={abrir}
        style={({ pressed }) => [
          styles.trigger,
          seleccionado && !seleccionado.activo && styles.triggerInactive,
          Boolean(error) && styles.triggerError,
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}>
        <View style={styles.triggerCopy}>
          <View style={styles.triggerTitleRow}>
            <AppText
              variant="body"
              color={seleccionado ? palette.ink : palette.stone}
              numberOfLines={1}
              style={styles.triggerTitle}>
              {seleccionado?.nombre ?? placeholder}
            </AppText>

            {seleccionado ? (
              <Badge
                label={seleccionado.activo ? 'Activo' : 'Inactivo'}
                tone={seleccionado.activo ? 'success' : 'neutral'}
              />
            ) : null}
          </View>

          {seleccionado ? (
            <AppText variant="caption" color={palette.warmGray} numberOfLines={1}>
              {seleccionado.direccion || 'Sin dirección'}
            </AppText>
          ) : null}
        </View>

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

      <BottomSheet visible={abierto} onClose={cerrar} title="Elegir local">
        <View style={styles.sheetBody}>
          <SearchField
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por nombre o dirección"
            accessibilityLabel="Buscar local por nombre o dirección"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          {filtrados.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="storefront-outline" size={24} color={palette.stone} />
              <AppText variant="body" color={palette.warmGray} style={styles.emptyText}>
                No encontramos locales con esa búsqueda.
              </AppText>
            </View>
          ) : (
            <View style={styles.options}>
              {filtrados.map((local) => {
                const selected = local.id === selectedId;

                return (
                  <Pressable
                    key={local.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${local.nombre}, ${
                      local.activo ? 'activo' : 'inactivo'
                    }${local.direccion ? `, ${local.direccion}` : ''}`}
                    accessibilityState={{ selected }}
                    onPress={() => seleccionar(local)}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      !local.activo && styles.optionInactive,
                      pressed && styles.pressed,
                    ]}>
                    <View style={styles.optionCopy}>
                      <View style={styles.optionTitleRow}>
                        <AppText
                          variant="label"
                          color={local.activo ? palette.ink : palette.pewter}
                          numberOfLines={1}
                          style={styles.optionTitle}>
                          {local.nombre}
                        </AppText>
                        <Badge
                          label={local.activo ? 'Activo' : 'Inactivo'}
                          tone={local.activo ? 'success' : 'neutral'}
                        />
                      </View>

                      <AppText variant="caption" color={palette.warmGray} numberOfLines={1}>
                        {local.direccion || 'Sin dirección'}
                      </AppText>
                    </View>

                    {selected ? (
                      <Ionicons name="checkmark" size={20} color={palette.ember} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  trigger: {
    minHeight: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1.5,
    borderRadius: radii.input,
  },
  triggerInactive: {
    backgroundColor: palette.canvas,
  },
  triggerError: {
    borderColor: palette.danger,
  },
  triggerCopy: {
    flex: 1,
    gap: 2,
  },
  triggerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  triggerTitle: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  sheetBody: {
    gap: spacing.md,
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
  optionInactive: {
    backgroundColor: palette.fog,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionTitle: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
  },
});
