import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import { AppText, Badge, Button, EmptyState, ErrorState, Screen, Skeleton } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { apiClient, ApiHttpError } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { CartaResponse, LocalResponse, ProductoCartaResponse } from '@/lib/api/types';
import { formatMoney } from '@/lib/format';

type CartaSection = { title: string; data: ProductoCartaResponse[] };

function CartaSkeleton() {
  return (
    <View style={styles.skeletonList}>
      <Skeleton width="45%" height={28} />
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonProduct}>
          <View style={styles.skeletonCopy}>
            <Skeleton width="60%" />
            <Skeleton width="90%" height={12} />
            <Skeleton width="35%" />
          </View>
          <Skeleton width={88} height={44} radius={radii.pill} />
        </View>
      ))}
    </View>
  );
}

function ProductoRow({ producto }: { producto: ProductoCartaResponse }) {
  const sinStock = !producto.disponible || producto.stock === 0;

  return (
    <View style={styles.product}>
      <View style={styles.productCopy}>
        <View style={styles.productTitleRow}>
          <AppText variant="label" style={styles.productName}>{producto.nombre}</AppText>
          {sinStock ? <Badge label="Sin stock" tone="danger" /> : null}
        </View>
        {producto.descripcion ? (
          <AppText variant="caption" color={palette.warmGray} numberOfLines={2}>{producto.descripcion}</AppText>
        ) : null}
        {!sinStock ? <AppText variant="caption" color={palette.warmGray}>Stock disponible: {producto.stock}</AppText> : null}
        <AppText variant="price">{formatMoney(producto.precio)}</AppText>
      </View>
      <Button title="Agregar" size="sm" disabled />
    </View>
  );
}

export default function LocalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const localId = Number(id);
  const isValidId = Number.isInteger(localId) && localId > 0;
  const getCarta = useCallback(
    (signal: AbortSignal) => {
      if (!isValidId) return Promise.reject(new ApiHttpError(404, [], 'Este local ya no está disponible.'));
      return apiClient.get<CartaResponse>(apiRoutes.locales.carta(localId), signal);
    },
    [isValidId, localId],
  );
  const getLocal = useCallback(
    async (signal: AbortSignal) => {
      if (!isValidId) return null;
      const locales = await apiClient.get<LocalResponse[]>(apiRoutes.locales.list, signal);
      return locales.find((local) => local.id === localId) ?? null;
    },
    [isValidId, localId],
  );
  const { data: carta, loading: cartaLoading, error: cartaError, refetch: refetchCarta } = useApi(getCarta);
  const { data: local, refetch: refetchLocal } = useApi(getLocal);
  const sections = useMemo<CartaSection[]>(
    () => carta?.categorias.filter((categoria) => categoria.productos.length > 0).map((categoria) => ({
      title: categoria.categoriaNombre,
      data: categoria.productos,
    })) ?? [],
    [carta],
  );
  const refetch = () => {
    refetchCarta();
    refetchLocal();
  };

  if (cartaLoading && !carta) {
    return <Screen edges={['bottom']} scroll contentContainerStyle={styles.screen}><CartaSkeleton /></Screen>;
  }

  if (cartaError) {
    const notFound = cartaError instanceof ApiHttpError && cartaError.status === 404;
    return (
      <Screen edges={['bottom']} scroll contentContainerStyle={styles.screen}>
        <ErrorState
          title={notFound ? 'Este local ya no está disponible' : 'No se pudo cargar la carta'}
          message={notFound ? 'Volvé al inicio para elegir otro local.' : cartaError.message}
          onRetry={notFound ? undefined : refetchCarta}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['bottom']}>
      <SectionList
        sections={sections}
        keyExtractor={(producto) => String(producto.id)}
        renderItem={({ item }) => <ProductoRow producto={item} />}
        renderSectionHeader={({ section }) => <AppText variant="h2" style={styles.sectionTitle}>{section.title}</AppText>}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={cartaLoading && carta !== null}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="overline" color={palette.warmGray}>CARTA</AppText>
            <AppText variant="h1">{carta?.localNombre ?? 'Carta del local'}</AppText>
            {local?.direccion ? (
              <View style={styles.contactRow}>
                <Ionicons name="location-outline" size={18} color={palette.warmGray} />
                <AppText variant="body" color={palette.pewter}>{local.direccion}</AppText>
              </View>
            ) : null}
            {local?.telefono ? (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={18} color={palette.warmGray} />
                <AppText variant="body" color={palette.pewter}>{local.telefono}</AppText>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="restaurant-outline"
            title="Este local todavía no cargó su carta"
            description="Cuando tenga productos activos, van a aparecer acá."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  header: { gap: spacing.sm, paddingBottom: spacing.xxl },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sectionTitle: { paddingTop: spacing.xxl, paddingBottom: spacing.sm },
  product: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.sand },
  productCopy: { flex: 1, gap: spacing.xs },
  productTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  productName: { flex: 1 },
  skeletonList: { gap: spacing.lg },
  skeletonProduct: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  skeletonCopy: { flex: 1, gap: spacing.sm },
});
