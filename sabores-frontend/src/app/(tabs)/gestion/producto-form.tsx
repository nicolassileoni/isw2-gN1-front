import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, Screen, Skeleton } from '@/components/ui';
import { fonts, palette, radii, spacing } from '@/constants/theme';
import { ProductForm } from '@/features/admin-productos/product-form';
import { RequireAdmin } from '@/features/session/require-session';
import { useApi } from '@/hooks/use-api';
import { apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type {
  CategoriaResponse,
  LocalAdminResponse,
  ProductoAdminResponse,
} from '@/lib/api/types';

type FormData = {
  locales: LocalAdminResponse[];
  categorias: CategoriaResponse[];
  producto: ProductoAdminResponse | null;
};

export default function ProductoFormScreen() {
  return (
    <RequireAdmin>
      <ProductoFormContenido />
    </RequireAdmin>
  );
}

function ProductoFormContenido() {
  const { id, localId } = useLocalSearchParams<{ id?: string; localId?: string }>();
  const productoId = id ? Number(id) : null;
  const localIdParam = localId ? Number(localId) : null;
  const editando = productoId !== null && Number.isInteger(productoId) && productoId > 0;
  const localIdDefault =
    localIdParam !== null && Number.isInteger(localIdParam) && localIdParam > 0
      ? localIdParam
      : null;

  const getData = useCallback(
    async (signal: AbortSignal): Promise<FormData> => {
      const [locales, categorias] = await Promise.all([
        apiClient.get<LocalAdminResponse[]>(apiRoutes.locales.all, signal),
        apiClient.get<CategoriaResponse[]>(apiRoutes.categorias, signal),
      ]);

      if (!editando || productoId === null) {
        return { locales, categorias, producto: null };
      }

      const productos = await apiClient.get<ProductoAdminResponse[]>(
        localIdDefault ? apiRoutes.productos.list(localIdDefault) : apiRoutes.productos.list(),
        signal,
      );

      return {
        locales,
        categorias,
        producto: productos.find((producto) => producto.id === productoId) ?? null,
      };
    },
    [editando, localIdDefault, productoId],
  );

  const { data, loading, error, refetch } = useApi(getData);

  const volver = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/gestion/productos');
  };

  const crearLocal = () => router.replace('/(tabs)/gestion/local-form');
  const noEncontrado = editando && !loading && !error && data !== null && data.producto === null;
  const sinLocales = data !== null && data.locales.length === 0;
  const sinCategorias = data !== null && data.categorias.length === 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: editando ? 'Editar producto' : 'Nuevo producto',
          headerStyle: { backgroundColor: palette.canvas },
          headerTintColor: palette.ink,
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 18 },
        }}
      />

      <Screen scroll contentContainerStyle={styles.screen}>
        {loading && !data ? (
          <View style={styles.skeleton}>
            <Skeleton width="35%" height={12} />
            <Skeleton height={52} radius={radii.input} />
            <Skeleton height={52} radius={radii.input} />
            <Skeleton height={52} radius={radii.input} />
            <Skeleton height={52} radius={radii.input} />
            <Skeleton height={52} radius={radii.pill} />
          </View>
        ) : error ? (
          <ErrorState
            title="No pudimos cargar el producto"
            message={error.message}
            onRetry={refetch}
          />
        ) : noEncontrado ? (
          <EmptyState
            icon="fast-food-outline"
            title="No encontramos ese producto"
            description="Puede que ya no exista. Volvé a la lista para ver los productos del local."
            actionLabel="Volver a productos"
            onAction={volver}
          />
        ) : sinLocales ? (
          <EmptyState
            icon="storefront-outline"
            title="Todavía no hay locales"
            description="Creá un local antes de cargar productos en su carta."
            actionLabel="Nuevo local"
            onAction={crearLocal}
          />
        ) : sinCategorias ? (
          <EmptyState
            icon="pricetags-outline"
            title="No hay categorías disponibles"
            description="Las categorías se cargan junto con los datos iniciales del sistema."
            actionLabel="Volver a productos"
            onAction={volver}
          />
        ) : data ? (
          <ProductForm
            producto={data.producto}
            locales={data.locales}
            categorias={data.categorias}
            defaultLocalId={localIdDefault}
            onSaved={volver}
          />
        ) : null}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  skeleton: { gap: spacing.lg },
});
