import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, EmptyState, ErrorState, Screen, Skeleton } from '@/components/ui';
import { layout, palette, radii, spacing } from '@/constants/theme';
import { RequireSession } from '@/features/session/require-session';
import { useApi } from '@/hooks/use-api';
import { apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { PedidoResumenResponse, RepartidorEnCalleResponse } from '@/lib/api/types';
import { MAX_PEDIDOS_REPARTIDOR, cargaLabel, cargaLlena } from '@/lib/despacho';

type EnCalleData = {
  repartidores: RepartidorEnCalleResponse[];
  pedidosEnCamino: PedidoResumenResponse[];
};

function EnCalleSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[1, 2].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <Skeleton width="50%" height={18} />
          <Skeleton width="30%" height={12} />
          <Skeleton height={8} radius={radii.pill} />
          <Skeleton width="40%" height={28} radius={radii.pill} />
        </View>
      ))}
    </View>
  );
}

function CargaBarra({ cantidad }: { cantidad: number }) {
  return (
    <View
      style={styles.barra}
      accessible
      accessibilityLabel={`${cantidad} de ${MAX_PEDIDOS_REPARTIDOR} pedidos en camino`}>
      {Array.from({ length: MAX_PEDIDOS_REPARTIDOR }, (_, index) => (
        <View key={index} style={[styles.segmento, index < cantidad && styles.segmentoLleno]} />
      ))}
    </View>
  );
}

function RepartidorCard({
  repartidor,
  idsPorCodigo,
}: {
  repartidor: RepartidorEnCalleResponse;
  idsPorCodigo: Map<string, number>;
}) {
  const lleno = cargaLlena(repartidor.cantidadPedidos);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitle}>
          <AppText variant="label" numberOfLines={1}>
            {repartidor.nombreCompleto}
          </AppText>
          <AppText variant="caption" color={palette.warmGray}>
            {lleno ? 'Carga completa' : 'Puede tomar más pedidos'}
          </AppText>
        </View>
        <Badge
          label={cargaLabel(repartidor.cantidadPedidos)}
          tone={lleno ? 'danger' : repartidor.cantidadPedidos === 0 ? 'neutral' : 'warning'}
        />
      </View>

      <CargaBarra cantidad={repartidor.cantidadPedidos} />

      {repartidor.codigosPedidos.length === 0 ? (
        <AppText variant="caption" color={palette.warmGray}>
          Sin pedidos en camino.
        </AppText>
      ) : (
        <View style={styles.codigos}>
          {repartidor.codigosPedidos.map((codigo) => {
            const pedidoId = idsPorCodigo.get(codigo);

            return (
              <Pressable
                key={codigo}
                accessibilityRole="button"
                accessibilityLabel={`Ver detalle del pedido ${codigo}`}
                disabled={pedidoId === undefined}
                onPress={() => {
                  if (pedidoId === undefined) return;
                  router.push({ pathname: '/pedido/[id]', params: { id: String(pedidoId) } });
                }}
                style={({ pressed }) => [
                  styles.codigo,
                  pedidoId === undefined && styles.codigoDisabled,
                  pressed && styles.pressed,
                ]}>
                <AppText variant="label" style={styles.codigoTexto}>
                  {codigo}
                </AppText>
                {pedidoId !== undefined ? (
                  <Ionicons name="chevron-forward" size={14} color={palette.ember} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function EnCalleScreen() {
  return (
    <RequireSession>
      <EnCalleContenido />
    </RequireSession>
  );
}

function EnCalleContenido() {
  const getEnCalle = useCallback(async (signal: AbortSignal): Promise<EnCalleData> => {
    const [repartidores, pedidosEnCamino] = await Promise.all([
      apiClient.get<RepartidorEnCalleResponse[]>(apiRoutes.repartidores.enCalle, signal),
      // El endpoint solo devuelve códigos: la lista de pedidos en camino aporta el id
      // para poder abrir el detalle al tocar un código.
      apiClient
        .get<PedidoResumenResponse[]>(apiRoutes.pedidos.list('EN_CAMINO'), signal)
        .catch(() => [] as PedidoResumenResponse[]),
    ]);

    return { repartidores, pedidosEnCamino };
  }, []);

  const { data, loading, error, refetch } = useApi(getEnCalle);
  const primeraVez = useRef(true);

  // Al volver del detalle (donde se asigna o entrega) la carga cambia: refrescamos.
  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        return;
      }

      refetch();
    }, [refetch]),
  );

  const idsPorCodigo = useMemo(
    () => new Map((data?.pedidosEnCamino ?? []).map((pedido) => [pedido.codigoSeguimiento, pedido.id])),
    [data],
  );

  const repartidores = data?.repartidores ?? [];

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={repartidores}
        keyExtractor={(repartidor) => String(repartidor.repartidorId)}
        renderItem={({ item }) => (
          <RepartidorCard repartidor={item} idsPorCodigo={idsPorCodigo} />
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={loading && data !== null}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="overline" color={palette.warmGray}>
              REPARTIDORES
            </AppText>
            <AppText variant="h1">En la calle</AppText>
            <AppText variant="body" color={palette.pewter}>
              Carga real de cada repartidor activo, hasta {MAX_PEDIDOS_REPARTIDOR} pedidos.
            </AppText>
          </View>
        }
        ListEmptyComponent={
          loading && data === null ? (
            <EnCalleSkeleton />
          ) : error ? (
            <ErrorState
              title="No pudimos cargar la calle"
              message={error.message}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              icon="bicycle-outline"
              brand
              title="No hay repartidores activos"
              description="Cuando actives repartidores, vas a ver su carga acá."
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  header: { gap: spacing.xs, paddingBottom: spacing.md },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitle: { flex: 1, gap: 2 },
  barra: { flexDirection: 'row', gap: spacing.xs },
  segmento: {
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: palette.fog,
  },
  segmentoLleno: { backgroundColor: palette.ember },
  codigos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  codigo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: palette.canvas,
    minHeight: layout.touchTarget,
  },
  codigoDisabled: { opacity: 0.6 },
  codigoTexto: { letterSpacing: 0.8 },
  pressed: { opacity: 0.75 },
  skeletonList: { gap: spacing.md },
  skeletonCard: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.card,
  },
});
