import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { OrderTimeline } from '@/components/order-timeline';
import {
  AppText,
  Badge,
  Card,
  Divider,
  ErrorState,
  MoneyText,
  Screen,
  Skeleton,
} from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';
import { RequireSession } from '@/features/session/require-session';
import { useApi } from '@/hooks/use-api';
import { ApiHttpError, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { PedidoDetalleResponse } from '@/lib/api/types';
import { ESTADO_PEDIDO_LABEL, ESTADO_PEDIDO_TONE } from '@/lib/estado-pedido';
import { formatDateTime, formatMoney } from '@/lib/format';

function DetalleSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton width="35%" height={12} />
      <Skeleton width="60%" height={28} />
      <Skeleton height={120} radius={radii.card} />
      <Skeleton height={140} radius={radii.card} />
    </View>
  );
}

function Fila({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="body" color={palette.warmGray}>
        {label}
      </AppText>
      <AppText variant="body" style={styles.rowValue}>
        {value}
      </AppText>
    </View>
  );
}

export default function PedidoDetalleScreen() {
  return (
    <RequireSession>
      <DetalleContenido />
    </RequireSession>
  );
}

function DetalleContenido() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pedidoId = Number(id);
  const idValido = Number.isInteger(pedidoId) && pedidoId > 0;

  const getPedido = useCallback(
    (signal: AbortSignal) => {
      if (!idValido) {
        return Promise.reject(new ApiHttpError(404, [], 'No encontramos ese pedido.'));
      }

      return apiClient.get<PedidoDetalleResponse>(apiRoutes.pedidos.detail(pedidoId), signal);
    },
    [idValido, pedidoId],
  );
  const { data: pedido, loading, error, refetch } = useApi(getPedido);

  if (loading && !pedido) {
    return (
      <Screen edges={['bottom']} scroll contentContainerStyle={styles.screen}>
        <DetalleSkeleton />
      </Screen>
    );
  }

  if (error || !pedido) {
    const noEncontrado = error instanceof ApiHttpError && error.status === 404;

    return (
      <Screen edges={['bottom']} scroll contentContainerStyle={styles.screen}>
        <ErrorState
          title={noEncontrado ? 'No encontramos ese pedido' : 'No pudimos cargar el pedido'}
          message={
            noEncontrado
              ? 'Puede que se haya borrado o que el enlace esté mal. Volvé a la lista de pedidos.'
              : (error?.message ?? 'Intentá nuevamente.')
          }
          onRetry={noEncontrado ? undefined : refetch}
        />
      </Screen>
    );
  }

  const cancelado = pedido.estado === 'CANCELADO';

  return (
    <Screen edges={['bottom']} scroll contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <AppText variant="overline" color={palette.warmGray}>
          PEDIDO
        </AppText>
        <View style={styles.titleRow}>
          <AppText variant="h1" style={styles.title} numberOfLines={1}>
            {pedido.codigoSeguimiento}
          </AppText>
          <Badge
            label={ESTADO_PEDIDO_LABEL[pedido.estado]}
            tone={ESTADO_PEDIDO_TONE[pedido.estado]}
          />
        </View>
        <AppText variant="caption" color={palette.warmGray}>
          {formatDateTime(pedido.fechaHora)}
        </AppText>
      </View>

      <Card style={styles.card}>
        {cancelado ? (
          <View style={styles.cancelled} accessible accessibilityLabel="Pedido cancelado">
            <Ionicons name="close-circle" size={24} color={palette.danger} />
            <View style={styles.cancelledCopy}>
              <AppText variant="label">Pedido cancelado</AppText>
              <AppText variant="caption" color={palette.warmGray}>
                Se repuso el stock de los productos.
              </AppText>
            </View>
          </View>
        ) : (
          <OrderTimeline estado={pedido.estado} />
        )}
      </Card>

      <Card style={styles.card}>
        <AppText variant="overline" color={palette.warmGray}>
          CLIENTE
        </AppText>
        <Fila label="Nombre" value={pedido.cliente.nombre} />
        <Fila label="Teléfono" value={pedido.cliente.telefono} />
        <Divider />
        <AppText variant="overline" color={palette.warmGray}>
          ENTREGA
        </AppText>
        <Fila label="Dirección" value={pedido.direccionEntrega} />
        <Fila label="Local" value={pedido.local.nombre} />
        <Fila label="Repartidor" value={pedido.repartidor?.nombreCompleto ?? 'Sin asignar'} />
      </Card>

      <Card style={styles.card}>
        <AppText variant="overline" color={palette.warmGray}>
          PRODUCTOS
        </AppText>
        {pedido.items.map((item) => (
          <View key={item.productoId} style={styles.item}>
            <View style={styles.itemCopy}>
              <AppText variant="label">{item.productoNombre}</AppText>
              <AppText variant="caption" color={palette.warmGray}>
                {item.cantidad} × {formatMoney(item.precioUnitario)}
              </AppText>
            </View>
            <MoneyText amount={item.subtotal} variant="label" />
          </View>
        ))}
        <Divider />
        <Fila label="Subtotal" value={formatMoney(pedido.subtotal)} />
        {pedido.descuento > 0 ? (
          <Fila label="Descuento 10%" value={`- ${formatMoney(pedido.descuento)}`} />
        ) : null}
        <Fila label="Envío" value={formatMoney(pedido.costoEnvio)} />
        <View style={styles.totalRow}>
          <AppText variant="label">Total</AppText>
          <MoneyText amount={pedido.total} />
        </View>
      </Card>

      <AppText variant="caption" color={palette.warmGray}>
        Las acciones para avanzar o cancelar el pedido llegan en la rama feat/despacho.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  header: { gap: spacing.xs },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: { flex: 1, letterSpacing: 1 },
  card: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  rowValue: { flex: 1, textAlign: 'right' },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  itemCopy: { flex: 1, gap: 2 },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cancelled: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cancelledCopy: { flex: 1, gap: spacing.xs },
  skeleton: { gap: spacing.md },
});
