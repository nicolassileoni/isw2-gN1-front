import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { palette, radii, spacing } from '@/constants/theme';
import type { EstadoPedido } from '@/lib/api/types';
import { PASOS_SEGUIMIENTO, indicePaso } from '@/lib/estado-pedido';

type OrderTimelineProps = {
  estado: EstadoPedido;
};

export function OrderTimeline({ estado }: OrderTimelineProps) {
  const actual = indicePaso(estado);
  if (actual < 0) return null;

  return (
    <View style={styles.timeline}>
      {PASOS_SEGUIMIENTO.map((paso, index) => {
        const completado = index < actual;
        const esActual = index === actual;
        const descripcion = completado ? 'completado' : esActual ? 'estado actual' : 'pendiente';

        return (
          <View
            key={paso.estado}
            style={styles.step}
            accessible
            accessibilityLabel={`${paso.label}: ${descripcion}`}>
            <View style={styles.markerColumn}>
              <View
                style={[
                  styles.marker,
                  completado && styles.markerDone,
                  esActual && styles.markerCurrent,
                ]}>
                {completado ? <Ionicons name="checkmark" size={14} color={palette.white} /> : null}
                {esActual ? <View style={styles.markerDot} /> : null}
              </View>
              {index < PASOS_SEGUIMIENTO.length - 1 ? (
                <View style={[styles.connector, completado && styles.connectorDone]} />
              ) : null}
            </View>
            <View style={styles.stepCopy}>
              <AppText
                variant="label"
                color={esActual ? palette.ink : completado ? palette.slate : palette.stone}>
                {paso.label}
              </AppText>
              {esActual ? (
                <AppText variant="caption" color={palette.ember}>
                  Estado actual
                </AppText>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: {
    paddingTop: spacing.xs,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  markerColumn: {
    width: 24,
    alignItems: 'center',
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: palette.sand,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: {
    backgroundColor: palette.ember,
    borderColor: palette.ember,
  },
  markerCurrent: {
    borderColor: palette.ember,
    backgroundColor: palette.white,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: palette.ember,
  },
  connector: {
    width: 2,
    minHeight: 18,
    flexGrow: 1,
    marginVertical: 2,
    backgroundColor: palette.sand,
  },
  connectorDone: {
    backgroundColor: palette.ember,
  },
  stepCopy: {
    flex: 1,
    gap: 2,
    paddingBottom: spacing.xl,
  },
});
