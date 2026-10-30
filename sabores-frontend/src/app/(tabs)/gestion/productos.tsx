import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { showAlert } from '@/components/ui/app-alert';

import {
  AppText,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  IconButton,
  Screen,
  SearchField,
  Skeleton,
  Switch,
} from '@/components/ui';
import { palette, radii, semantic, spacing } from '@/constants/theme';
import { CatalogTabs } from '@/features/admin-catalogo/catalog-tabs';
import { LocalSelector } from '@/features/admin-catalogo/local-selector';
import { RequireAdmin } from '@/features/session/require-session';
import { useApi } from '@/hooks/use-api';
import { ApiHttpError, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import { formatMoney } from '@/lib/format';
import type { LocalAdminResponse, ProductoAdminResponse } from '@/lib/api/types';

function mensajeAccion(error: unknown, fallback: string): string {
  if (error instanceof ApiHttpError) return error.message || fallback;
  return error instanceof Error ? error.message : fallback;
}

function ProductosSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <Skeleton width="60%" height={18} />
          <Skeleton width="45%" height={12} />
          <Skeleton width="30%" height={26} radius={radii.pill} />
        </View>
      ))}
    </View>
  );
}

type ProductRowProps = {
  producto: ProductoAdminResponse;
  mutando: boolean;
  onEditar: () => void;
  onCambiarActivo: () => void;
};

function ProductRow({ producto, mutando, onEditar, onCambiarActivo }: ProductRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitle}>
          <AppText variant="label" numberOfLines={2}>
            {producto.nombre}
          </AppText>
          <AppText variant="caption" color={palette.warmGray}>
            {producto.categoriaNombre} · {formatMoney(producto.precio)}
          </AppText>
        </View>
        <View style={styles.cardTopActions}>
          <Badge
            label={producto.activo ? 'Activo' : 'Inactivo'}
            tone={producto.activo ? 'success' : 'neutral'}
          />
          <IconButton
            name="create-outline"
            label={`Editar ${producto.nombre}`}
            onPress={onEditar}
            variant="soft"
            size={18}
          />
        </View>
      </View>

      <View style={styles.meta}>
        <AppText variant="caption" color={palette.warmGray}>
          Stock: <AppText variant="label">{producto.stock}</AppText>
        </AppText>
        {producto.stock === 0 ? <Badge label="Sin stock" tone="warning" /> : null}
        {!producto.activo ? <Badge label="No visible" tone="neutral" /> : null}
      </View>

      <View style={styles.cardActions}>
        <Switch
          value={producto.activo}
          onValueChange={onCambiarActivo}
          label="Activo"
          helper={mutando ? 'Guardando…' : undefined}
          disabled={mutando}
          accessibilityLabel={
            producto.activo ? `Desactivar ${producto.nombre}` : `Activar ${producto.nombre}`
          }
        />
      </View>
    </View>
  );
}

export default function GestionProductosScreen() {
  return (
    <RequireAdmin>
      <ProductosContenido />
    </RequireAdmin>
  );
}

function ProductosContenido() {
  const [busqueda, setBusqueda] = useState('');
  const [accionError, setAccionError] = useState<string | null>(null);
  const [mutandoId, setMutandoId] = useState<number | null>(null);
  const [localSeleccionadoId, setLocalSeleccionadoId] = useState<number | null>(null);

  const getLocales = useCallback(
    (signal: AbortSignal) => apiClient.get<LocalAdminResponse[]>(apiRoutes.locales.all, signal),
    [],
  );
  const {
    data: localesData,
    loading: localesLoading,
    error: localesError,
    refetch: refetchLocales,
  } = useApi(getLocales);

  const locales = useMemo(() => localesData ?? [], [localesData]);
  const localSeleccionado = useMemo(
    () =>
      locales.find((local) => local.id === localSeleccionadoId) ??
      locales.find((local) => local.activo) ??
      locales[0] ??
      null,
    [locales, localSeleccionadoId],
  );
  const localId = localSeleccionado?.id ?? null;

  const getProductos = useCallback(
    (signal: AbortSignal) =>
      localId
        ? apiClient.get<ProductoAdminResponse[]>(apiRoutes.productos.list(localId), signal)
        : Promise.resolve([]),
    [localId],
  );
  const {
    data,
    loading,
    error,
    refetch,
    setData,
  } = useApi(getProductos);
  const primeraVez = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        return;
      }

      refetchLocales();
      refetch();
    }, [refetchLocales, refetch]),
  );

  const productos = useMemo(() => {
    const lista = data ?? [];
    const texto = busqueda.trim().toLocaleLowerCase('es-AR');
    if (!texto) return lista;

    return lista.filter((producto) =>
      producto.nombre.toLocaleLowerCase('es-AR').includes(texto),
    );
  }, [data, busqueda]);

  const nuevo = () => {
    if (!localSeleccionado) return;

    router.push({
      pathname: '/(tabs)/gestion/producto-form',
      params: { localId: String(localSeleccionado.id) },
    });
  };

  const editar = (producto: ProductoAdminResponse) => {
    router.push({
      pathname: '/(tabs)/gestion/producto-form',
      params: { id: String(producto.id), localId: String(producto.localId) },
    });
  };

  const cambiarActivo = useCallback(
    async (producto: ProductoAdminResponse, activo: boolean) => {
      if (mutandoId !== null) return;

      const anterior = data;

      setMutandoId(producto.id);
      setAccionError(null);
      setData((data ?? []).map((item) => (item.id === producto.id ? { ...item, activo } : item)));

      try {
        await apiClient.patch(apiRoutes.productos.activo(producto.id), { activo });
        refetch();
      } catch (patchError: unknown) {
        setData(anterior);
        setAccionError(
          mensajeAccion(
            patchError,
            activo ? 'No pudimos activar el producto.' : 'No pudimos desactivar el producto.',
          ),
        );
      } finally {
        setMutandoId(null);
      }
    },
    [data, mutandoId, refetch, setData],
  );

  const pedirCambio = useCallback(
    (producto: ProductoAdminResponse) => {
      if (!producto.activo) {
        void cambiarActivo(producto, true);
        return;
      }

      showAlert(
        'Desactivar producto',
        `“${producto.nombre}” no se mostrará en la carta pública. ¿Continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: () => void cambiarActivo(producto, false),
          },
        ],
      );
    },
    [cambiarActivo],
  );

  const seleccionarLocal = (id: number) => {
    if (id === localSeleccionado?.id) return;

    setData(null);
    setLocalSeleccionadoId(id);
    setBusqueda('');
    setAccionError(null);
  };

  const crearLocal = () => router.push('/(tabs)/gestion/local-form');

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={productos}
        keyExtractor={(producto) => String(producto.id)}
        renderItem={({ item }) => (
          <ProductRow
            producto={item}
            mutando={mutandoId === item.id}
            onEditar={() => editar(item)}
            onCambiarActivo={() => pedirCambio(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        onRefresh={refetch}
        refreshing={loading && data !== null}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topBar}>
              <IconButton
                name="chevron-back"
                label="Volver"
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace('/(tabs)/gestion')
                }
              />
            </View>

            <View style={styles.titleBlock}>
              <AppText variant="overline" color={palette.warmGray}>
                GESTIÓN
              </AppText>
              <AppText variant="h1">Catálogo</AppText>
              <AppText variant="body" color={palette.pewter}>
                Productos de la carta. Los inactivos no se muestran al público.
              </AppText>
            </View>

            <CatalogTabs active="productos" />

            {localesLoading && localesData === null ? (
              <View style={styles.localSkeleton}>
                <Skeleton width="30%" height={12} />
                <Skeleton height={40} radius={radii.pill} />
              </View>
            ) : localesError && localesData === null ? (
              <ErrorState
                title="No pudimos cargar los locales"
                message={localesError.message}
                onRetry={refetchLocales}
              />
            ) : locales.length === 0 ? (
              <EmptyState
                icon="storefront-outline"
                brand
                title="Todavía no hay locales"
                description="Creá un local antes de cargar productos en su carta."
                actionLabel="Nuevo local"
                onAction={crearLocal}
              />
            ) : (
              <>
                <LocalSelector
                  locales={locales}
                  selectedId={localSeleccionado?.id ?? null}
                  onSelect={(local) => seleccionarLocal(local.id)}
                  label="Local"
                  helper="Buscá por nombre o dirección para cambiar de carta."
                />

                {localSeleccionado && !localSeleccionado.activo ? (
                  <View style={styles.warningBox} accessibilityLiveRegion="polite">
                    <Ionicons name="alert-circle" size={18} color={palette.warning} />
                    <AppText variant="caption" color={palette.warning} style={styles.warningText}>
                      Este local está inactivo. Sus productos no se muestran en la carta pública.
                    </AppText>
                  </View>
                ) : null}

                <SearchField
                  value={busqueda}
                  onChangeText={setBusqueda}
                  placeholder="Buscar producto"
                  accessibilityLabel="Buscar producto por nombre"
                  returnKeyType="search"
                />

                <Button title="Nuevo producto" onPress={nuevo} fullWidth />
              </>
            )}

            {accionError ? (
              <View style={styles.errorBox} accessibilityLiveRegion="polite">
                <Ionicons name="alert-circle" size={18} color={palette.danger} />
                <AppText variant="caption" color={palette.danger} style={styles.errorText}>
                  {accionError}
                </AppText>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          locales.length === 0 ? undefined : loading && data === null ? (
            <ProductosSkeleton />
          ) : error ? (
            <ErrorState
              title="No pudimos cargar los productos"
              message={error.message}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              icon="fast-food-outline"
              brand={!busqueda}
              title={
                busqueda
                  ? 'No encontramos productos con ese nombre'
                  : 'Este local todavía no tiene productos'
              }
              description={
                busqueda ? 'Probá con otra búsqueda.' : 'Creá el primer producto de la carta.'
              }
              actionLabel={busqueda ? 'Limpiar búsqueda' : 'Nuevo producto'}
              onAction={busqueda ? () => setBusqueda('') : nuevo}
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
  topBar: { alignItems: 'flex-start', marginLeft: -spacing.sm },
  titleBlock: { gap: spacing.xs },
  localSkeleton: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTitle: { flex: 1, gap: 2 },
  cardTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardActions: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.sand,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.input,
    backgroundColor: semantic.warningSoft,
  },
  warningText: { flex: 1 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.input,
    backgroundColor: semantic.dangerSoft,
  },
  errorText: { flex: 1 },
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
