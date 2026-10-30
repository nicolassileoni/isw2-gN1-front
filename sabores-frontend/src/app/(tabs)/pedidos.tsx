import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  AppText,
  Badge,
  Chip,
  EmptyState,
  ErrorState,
  MoneyText,
  Screen,
  SearchField,
  Skeleton,
} from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';
import { RequireSession } from '@/features/session/require-session';
import { useApi } from '@/hooks/use-api';
import { apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { EstadoPedido, PedidoResumenResponse } from '@/lib/api/types';
import { ESTADO_PEDIDO_LABEL, ESTADO_PEDIDO_TONE } from '@/lib/estado-pedido';
import { formatDateTime, normalizeTrackingCode } from '@/lib/format';

type Filtro = { valor: EstadoPedido | null; label: string };

const FILTROS: readonly Filtro[] = [
  { valor: null, label: 'En curso' },
  { valor: 'RECIBIDO', label: 'Recibido' },
  { valor: 'EN_PREPARACION', label: 'En preparación' },
  { valor: 'EN_CAMINO', label: 'En camino' },
  { valor: 'ENTREGADO', label: 'Entregado' },
  { valor: 'CANCELADO', label: 'Cancelado' },
];

function PedidosSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <Skeleton width="40%" height={18} />
          <Skeleton width="70%" />
          <Skeleton width="55%" height={12} />
          <Skeleton width="30%" height={20} />
        </View>
      ))}
    </View>
  );
}

function PedidoCard({ pedido }: { pedido: PedidoResumenResponse }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle del pedido ${pedido.codigoSeguimiento}`}
      accessibilityHint="Abre el detalle completo del pedido"
      onPress={() => router.push({ pathname: '/pedido/[id]', params: { id: String(pedido.id) } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardTop}>
        <AppText variant="label" style={styles.code}>
          {pedido.codigoSeguimiento}
        </AppText>
        <Badge
          label={ESTADO_PEDIDO_LABEL[pedido.estado]}
          tone={ESTADO_PEDIDO_TONE[pedido.estado]}
        />
      </View>

      <View style={styles.cardRow}>
        <Ionicons name="storefront-outline" size={16} color={palette.warmGray} />
        <AppText variant="body" style={styles.cardRowText} numberOfLines={1}>
          {pedido.localNombre}
        </AppText>
      </View>
      <View style={styles.cardRow}>
        <Ionicons name="person-outline" size={16} color={palette.warmGray} />
        <AppText variant="body" color={palette.pewter} style={styles.cardRowText} numberOfLines={1}>
          {pedido.clienteNombre}
        </AppText>
      </View>

      <View style={styles.cardBottom}>
        <AppText variant="caption" color={palette.warmGray}>
          {formatDateTime(pedido.fechaHora)}
        </AppText>
        <MoneyText amount={pedido.total} />
      </View>

      <View style={styles.cardAction}>
        <AppText variant="label" color={palette.ember}>
          Ver detalle
        </AppText>
        <Ionicons name="chevron-forward" size={16} color={palette.ember} />
      </View>
    </Pressable>
  );
}

export default function PedidosScreen() {
  return (
    <RequireSession>
      <PedidosContenido />
    </RequireSession>
  );
}

function PedidosContenido() {
  const [filtro, setFiltro] = useState<EstadoPedido | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const getPedidos = useCallback(
    (signal: AbortSignal) =>
      apiClient.get<PedidoResumenResponse[]>(apiRoutes.pedidos.list(filtro ?? undefined), signal),
    [filtro],
  );
  const { data, loading, error, refetch } = useApi(getPedidos);

  const pedidos = useMemo(() => {
    const lista = data ?? [];
    const texto = normalizeTrackingCode(busqueda);
    if (!texto) return lista;

    return lista.filter((pedido) => pedido.codigoSeguimiento.includes(texto));
  }, [data, busqueda]);

  const tituloVacio = busqueda
    ? 'No encontramos pedidos con ese código'
    : filtro
      ? `No hay pedidos en estado ${ESTADO_PEDIDO_LABEL[filtro].toLowerCase()}`
      : 'No hay pedidos en curso';

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={pedidos}
        keyExtractor={(pedido) => String(pedido.id)}
        renderItem={({ item }) => <PedidoCard pedido={item} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onRefresh={refetch}
        refreshing={loading && data !== null}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <AppText variant="overline" color={palette.warmGray}>
                PEDIDOS
              </AppText>
              <AppText variant="h1">Pedidos</AppText>
              <AppText variant="caption" color={palette.warmGray}>
                Ordenados del más antiguo al más reciente.
              </AppText>
            </View>

            <SearchField
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar por código"
              accessibilityLabel="Buscar pedido por código"
              returnKeyType="search"
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtros}
              accessibilityLabel="Filtros por estado">
              {FILTROS.map((opcion) => (
                <Chip
                  key={opcion.valor ?? 'todos'}
                  label={opcion.label}
                  selected={filtro === opcion.valor}
                  onPress={() => setFiltro(opcion.valor)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          loading && pedidos.length === 0 ? (
            <PedidosSkeleton />
          ) : error ? (
            <ErrorState
              title="No se pudieron cargar los pedidos"
              message={error.message}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              icon="receipt-outline"
              title={tituloVacio}
              description={
                busqueda
                  ? 'Probá con otro código o limpiá la búsqueda.'
                  : 'Cuando haya pedidos para este estado, van a aparecer acá.'
              }
              actionLabel={busqueda ? 'Limpiar búsqueda' : undefined}
              onAction={busqueda ? () => setBusqueda('') : undefined}
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
  header: { gap: spacing.lg, paddingBottom: spacing.sm },
  titleBlock: { gap: spacing.xs },
  filtros: { gap: spacing.sm, paddingRight: spacing.lg },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.card,
  },
  pressed: { opacity: 0.8 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  code: { letterSpacing: 1.2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardRowText: { flex: 1 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  skeletonList: { gap: spacing.md },
  skeletonCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.card,
  },
});
