import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, BottomSheet, Button, ErrorState, Skeleton } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { RepartidorEnCalleResponse } from '@/lib/api/types';
import { MAX_PEDIDOS_REPARTIDOR, cargaLabel, cargaLlena } from '@/lib/despacho';

type AsignarRepartidorSheetProps = {
  asignando: boolean;
  onClose: () => void;
  onConfirmar: (repartidor: RepartidorEnCalleResponse) => void;
};

function ListaSkeleton() {
  return (
    <View style={styles.skeleton}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonRow}>
          <Skeleton width={24} height={24} radius={radii.pill} />
          <View style={styles.skeletonCopy}>
            <Skeleton width="60%" />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function AsignarRepartidorSheet({
  asignando,
  onClose,
  onConfirmar,
}: AsignarRepartidorSheetProps) {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  const getRepartidores = useCallback(
    (signal: AbortSignal) =>
      apiClient.get<RepartidorEnCalleResponse[]>(apiRoutes.repartidores.enCalle, signal),
    [],
  );
  // La hoja se monta cada vez que se abre, así que la carga siempre está fresca.
  const { data, loading, error, refetch } = useApi(getRepartidores);

  const repartidores = data ?? [];
  const elegido = repartidores.find((item) => item.repartidorId === seleccionado) ?? null;

  return (
    <BottomSheet
      visible
      onClose={() => {
        if (!asignando) onClose();
      }}
      title="Asignar repartidor"
      footer={
        <>
          <Button
            title="Asignar y salir a la calle"
            fullWidth
            loading={asignando}
            disabled={!elegido || asignando}
            onPress={() => {
              if (elegido) onConfirmar(elegido);
            }}
          />
          <Button title="Volver" variant="secondary" fullWidth disabled={asignando} onPress={onClose} />
        </>
      }>
      <AppText variant="caption" color={palette.warmGray} style={styles.helper}>
        Solo se muestran repartidores activos. El máximo es {MAX_PEDIDOS_REPARTIDOR} pedidos en
        camino por persona.
      </AppText>

      {loading && data === null ? (
        <ListaSkeleton />
      ) : error ? (
        <ErrorState
          title="No pudimos cargar los repartidores"
          message={error.message}
          onRetry={refetch}
        />
      ) : repartidores.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bicycle-outline" size={24} color={palette.stone} />
          <AppText variant="label">No hay repartidores activos</AppText>
          <AppText variant="caption" color={palette.warmGray} style={styles.emptyCopy}>
            Activá un repartidor para poder asignarle pedidos.
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {repartidores.map((repartidor) => {
            const lleno = cargaLlena(repartidor.cantidadPedidos);
            const activo = seleccionado === repartidor.repartidorId;

            return (
              <Pressable
                key={repartidor.repartidorId}
                accessibilityRole="radio"
                accessibilityState={{ checked: activo, disabled: lleno }}
                accessibilityLabel={`${repartidor.nombreCompleto}, ${cargaLabel(
                  repartidor.cantidadPedidos,
                )} pedidos${lleno ? ', carga completa' : ''}`}
                disabled={lleno || asignando}
                onPress={() => setSeleccionado(repartidor.repartidorId)}
                style={({ pressed }) => [
                  styles.row,
                  activo && styles.rowActive,
                  lleno && styles.rowDisabled,
                  pressed && !lleno && styles.pressed,
                ]}>
                <View style={[styles.radio, activo && styles.radioActive]}>
                  {activo ? <Ionicons name="checkmark" size={14} color={palette.white} /> : null}
                </View>

                <View style={styles.copy}>
                  <AppText variant="label">{repartidor.nombreCompleto}</AppText>
                  <AppText
                    variant="caption"
                    color={lleno ? palette.danger : palette.warmGray}>
                    {lleno
                      ? 'Carga completa'
                      : `${repartidor.cantidadPedidos} de ${MAX_PEDIDOS_REPARTIDOR} pedidos en camino`}
                  </AppText>
                </View>

                <Badge
                  label={cargaLabel(repartidor.cantidadPedidos)}
                  tone={lleno ? 'danger' : repartidor.cantidadPedidos === 0 ? 'neutral' : 'warning'}
                />
              </Pressable>
            );
          })}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  helper: { marginBottom: spacing.md },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.sand,
    borderRadius: radii.input,
    backgroundColor: palette.white,
  },
  rowActive: { borderColor: palette.ember },
  rowDisabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: palette.driftwood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { backgroundColor: palette.ember, borderColor: palette.ember },
  copy: { flex: 1, gap: 2 },
  empty: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  emptyCopy: { textAlign: 'center' },
  skeleton: { gap: spacing.sm },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.sand,
    borderRadius: radii.input,
  },
  skeletonCopy: { flex: 1, gap: spacing.xs },
});
