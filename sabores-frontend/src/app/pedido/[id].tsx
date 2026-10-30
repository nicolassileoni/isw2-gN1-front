import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { OrderTimeline } from '@/components/order-timeline';
import {
  AppText,
  Badge,
  Button,
  Card,
  Divider,
  ErrorState,
  MoneyText,
  Screen,
  Skeleton,
} from '@/components/ui';
import { palette, radii, semantic, spacing } from '@/constants/theme';
import { AsignarRepartidorSheet } from '@/features/despacho/asignar-repartidor-sheet';
import { RequireSession } from '@/features/session/require-session';
import { useApi } from '@/hooks/use-api';
import { ApiHttpError, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { PedidoDetalleResponse } from '@/lib/api/types';
import { accionSegunEstado, puedeCancelarse } from '@/lib/despacho';
import { ESTADO_PEDIDO_LABEL, ESTADO_PEDIDO_TONE } from '@/lib/estado-pedido';
import { formatDateTime, formatMoney } from '@/lib/format';

type AccionEnCurso = 'avanzar' | 'cancelar' | null;

/** Traduce el error del backend a algo accionable para el operador. */
function mensajeAccion(error: unknown, fallback: string): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 404) return 'El pedido ya no existe. Volvé a la lista.';
    // 400/409 traen el motivo real (transición inválida, repartidor inactivo o con 3 pedidos).
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

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

  const [accion, setAccion] = useState<AccionEnCurso>(null);
  const [accionError, setAccionError] = useState<string | null>(null);
  const [hojaVisible, setHojaVisible] = useState(false);
  // Ref además del estado: evita dos requests si se toca dos veces antes del re-render.
  const enCurso = useRef(false);

  const getPedido = useCallback(
    (signal: AbortSignal) => {
      if (!idValido) {
        return Promise.reject(new ApiHttpError(404, [], 'No encontramos ese pedido.'));
      }

      return apiClient.get<PedidoDetalleResponse>(apiRoutes.pedidos.detail(pedidoId), signal);
    },
    [idValido, pedidoId],
  );
  const { data: pedido, loading, error, refetch, setData } = useApi(getPedido);

  const ocupado = accion !== null;

  const avanzar = useCallback(
    async (body?: { repartidorId: number }) => {
      if (!pedido || enCurso.current) return;

      enCurso.current = true;
      setAccion('avanzar');
      setAccionError(null);

      try {
        const actualizado = await apiClient.patch<PedidoDetalleResponse>(
          apiRoutes.pedidos.avanzar(pedido.id),
          body,
        );
        // El PATCH devuelve el detalle completo: evitamos un GET extra.
        setData(actualizado);
        setHojaVisible(false);
      } catch (requestError: unknown) {
        setAccionError(mensajeAccion(requestError, 'No pudimos avanzar el pedido.'));
        setHojaVisible(false);
        // El estado real pudo cambiar: resincronizamos con el servidor.
        refetch();
      } finally {
        enCurso.current = false;
        setAccion(null);
      }
    },
    [pedido, setData, refetch],
  );

  const cancelar = useCallback(async () => {
    if (!pedido || enCurso.current) return;

    enCurso.current = true;
    setAccion('cancelar');
    setAccionError(null);

    try {
      const actualizado = await apiClient.patch<PedidoDetalleResponse>(
        apiRoutes.pedidos.cancelar(pedido.id),
      );
      setData(actualizado);
    } catch (requestError: unknown) {
      setAccionError(mensajeAccion(requestError, 'No pudimos cancelar el pedido.'));
      refetch();
    } finally {
      enCurso.current = false;
      setAccion(null);
    }
  }, [pedido, setData, refetch]);

  const confirmarEntrega = useCallback(() => {
    Alert.alert(
      'Marcar como entregado',
      '¿Confirmás que el pedido ya llegó al cliente? No se puede deshacer.',
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Sí, entregado', onPress: () => void avanzar() },
      ],
    );
  }, [avanzar]);

  const confirmarCancelacion = useCallback(() => {
    Alert.alert(
      'Cancelar pedido',
      'Se repone el stock de todos los productos del pedido. Esta acción no se puede deshacer.',
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Cancelar pedido', style: 'destructive', onPress: () => void cancelar() },
      ],
    );
  }, [cancelar]);

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
  const accionActual = accionSegunEstado(pedido.estado);
  const cancelable = puedeCancelarse(pedido.estado);
  const hayAcciones = accionActual !== null || cancelable;

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

      {hayAcciones ? (
        <Card style={styles.card}>
          <AppText variant="overline" color={palette.warmGray}>
            ACCIONES
          </AppText>

          {accionError ? (
            <View style={styles.errorBox} accessible accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={18} color={palette.danger} />
              <AppText variant="caption" color={palette.danger} style={styles.errorText}>
                {accionError}
              </AppText>
            </View>
          ) : null}

          {accionActual === 'preparar' ? (
            <Button
              title="Pasar a preparación"
              fullWidth
              loading={accion === 'avanzar'}
              disabled={ocupado}
              onPress={() => void avanzar()}
            />
          ) : null}

          {accionActual === 'asignar' ? (
            <Button
              title="Asignar repartidor"
              fullWidth
              loading={accion === 'avanzar'}
              disabled={ocupado}
              accessibilityHint="Elegí un repartidor con menos de 3 pedidos en camino"
              onPress={() => setHojaVisible(true)}
            />
          ) : null}

          {accionActual === 'entregar' ? (
            <Button
              title="Marcar entregado"
              fullWidth
              loading={accion === 'avanzar'}
              disabled={ocupado}
              onPress={confirmarEntrega}
            />
          ) : null}

          {cancelable ? (
            <Button
              title="Cancelar pedido"
              variant="destructive"
              fullWidth
              loading={accion === 'cancelar'}
              disabled={ocupado}
              onPress={confirmarCancelacion}
            />
          ) : null}

          <AppText variant="caption" color={palette.warmGray}>
            {pedido.estado === 'EN_CAMINO'
              ? 'El pedido ya está en la calle: solo se puede marcar como entregado.'
              : 'Cancelar repone el stock de los productos.'}
          </AppText>
        </Card>
      ) : null}

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

      {hojaVisible ? (
        <AsignarRepartidorSheet
          asignando={accion === 'avanzar'}
          onClose={() => setHojaVisible(false)}
          onConfirmar={(repartidor) => void avanzar({ repartidorId: repartidor.repartidorId })}
        />
      ) : null}
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.input,
    backgroundColor: semantic.dangerSoft,
  },
  errorText: { flex: 1 },
  skeleton: { gap: spacing.md },
});
