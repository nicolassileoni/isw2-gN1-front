import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, EmptyState, ErrorState, Screen, SearchField, Skeleton } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { LocalResponse } from '@/lib/api/types';

const features = [
  { icon: 'restaurant-outline' as const, title: 'Elegí un local', description: 'Mirá su carta, precios y stock actualizado.' },
  { icon: 'bag-check-outline' as const, title: 'Pedí sin registrarte', description: 'Dejá tus datos una sola vez al confirmar.' },
  { icon: 'receipt-outline' as const, title: 'Seguí tu pedido', description: 'Consultá el estado con tu código de 8 caracteres.' },
];

function LocalesSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[1, 2, 3].map((item) => (
        <Card key={item} style={styles.skeletonCard}>
          <Skeleton width={48} height={48} radius={radii.card} />
          <View style={styles.skeletonCopy}>
            <Skeleton width="65%" />
            <Skeleton width="90%" height={12} />
          </View>
        </Card>
      ))}
    </View>
  );
}

function LocalCard({ local }: { local: LocalResponse }) {
  const initials = local.nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver carta de ${local.nombre}`}
      accessibilityHint="Abre la carta del local"
      onPress={() => router.push({ pathname: '/local/[id]', params: { id: String(local.id) } })}
      style={({ pressed }) => [styles.localCard, pressed && styles.pressed]}>
      <View style={styles.monogram}>
        <AppText variant="label">{initials || 'SL'}</AppText>
      </View>
      <View style={styles.localCopy}>
        <AppText variant="h3" numberOfLines={1}>{local.nombre}</AppText>
        <AppText variant="caption" color={palette.warmGray} numberOfLines={1}>
          {local.direccion || 'Dirección a confirmar'}
        </AppText>
        {local.telefono ? <AppText variant="caption" color={palette.warmGray}>{local.telefono}</AppText> : null}
      </View>
      <Ionicons name="chevron-forward" size={22} color={palette.stone} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const getLocales = useCallback(
    (signal: AbortSignal) => apiClient.get<LocalResponse[]>(apiRoutes.locales.list, signal),
    [],
  );
  const { data: locales, loading, error, refetch } = useApi(getLocales);
  const filteredLocales = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es-AR');
    if (!locales || !normalizedSearch) return locales ?? [];
    return locales.filter((local) => local.nombre.toLocaleLowerCase('es-AR').includes(normalizedSearch));
  }, [locales, search]);

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={filteredLocales}
        keyExtractor={(local) => String(local.id)}
        renderItem={({ item }) => <LocalCard local={item} />}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onRefresh={refetch}
        refreshing={loading && locales !== null}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}><AppText variant="label" color={palette.ink}>SL</AppText></View>
              <AppText variant="label" color={palette.slate}>Sabores del Litoral</AppText>
            </View>
            <View style={styles.hero}>
              <Badge label="Delivery local" tone="accent" />
              <AppText variant="display">Del litoral a tu mesa.</AppText>
              <AppText variant="bodyLarge" color={palette.pewter}>
                Pedí desde tu celular, sin crear una cuenta. Elegí un local, armá tu pedido y seguilo con un código.
              </AppText>
            </View>
            <Card style={styles.featureCard}>
              <AppText variant="overline" color={palette.warmGray}>CÓMO FUNCIONA</AppText>
              <View style={styles.features}>
                {features.map((feature) => (
                  <View key={feature.title} style={styles.featureRow}>
                    <View style={styles.featureIcon}><Ionicons name={feature.icon} size={20} color={palette.ink} /></View>
                    <View style={styles.featureCopy}>
                      <AppText variant="label">{feature.title}</AppText>
                      <AppText variant="caption" color={palette.warmGray}>{feature.description}</AppText>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
            <View style={styles.localesHeader}>
              <View style={styles.sectionCopy}>
                <AppText variant="h2">Locales</AppText>
                <AppText variant="caption" color={palette.warmGray}>Adheridos</AppText>
              </View>
              {locales ? <AppText variant="caption" color={palette.warmGray}>{locales.length} disponibles</AppText> : null}
            </View>
            <SearchField
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar un local"
              accessibilityLabel="Buscar un local por nombre"
              returnKeyType="search"
            />
          </View>
        }
        ListEmptyComponent={
          loading ? <LocalesSkeleton /> : error ? (
            <ErrorState title="No se pudieron cargar los locales" message={error.message} onRetry={refetch} />
          ) : (
            <EmptyState
              icon="storefront-outline"
              title={search ? 'No encontramos locales con ese nombre' : 'Todavía no hay locales disponibles'}
              description={search ? 'Probá con otra búsqueda.' : 'Cuando se sumen locales adheridos, vas a poder ver su carta y hacer un pedido.'}
              actionLabel={search ? 'Limpiar búsqueda' : undefined}
              onAction={search ? () => setSearch('') : undefined}
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { gap: spacing.xxl, paddingBottom: spacing.sm },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.peach, borderRadius: radii.input },
  hero: { gap: spacing.md },
  featureCard: { gap: spacing.lg },
  features: { gap: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  featureIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.canvas, borderRadius: radii.input },
  featureCopy: { flex: 1, gap: 2 },
  localesHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  sectionCopy: { gap: spacing.xs },
  localCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: palette.white, borderColor: palette.sand, borderWidth: 1, borderRadius: radii.card },
  localCopy: { flex: 1, gap: 2 },
  monogram: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.peach, borderRadius: radii.card },
  pressed: { opacity: 0.8 },
  skeletonList: { gap: spacing.md },
  skeletonCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  skeletonCopy: { flex: 1, gap: spacing.sm },
});
