import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, Screen, Skeleton } from '@/components/ui';
import { fonts, palette, radii, spacing } from '@/constants/theme';
import { LocalForm } from '@/features/admin-locales/local-form';
import { RequireAdmin } from '@/features/session/require-session';
import { useApi } from '@/hooks/use-api';
import { ApiHttpError, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { LocalAdminResponse } from '@/lib/api/types';

export default function LocalFormScreen() {
  return (
    <RequireAdmin>
      <LocalFormContenido />
    </RequireAdmin>
  );
}

function LocalFormContenido() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const localId = id ? Number(id) : null;
  const editando = localId !== null && Number.isInteger(localId) && localId > 0;

  const getLocal = useCallback(
    async (signal: AbortSignal) => {
      if (!editando || localId === null) return null;

      const locales = await apiClient.get<LocalAdminResponse[]>(apiRoutes.locales.all, signal);
      return locales.find((local) => local.id === localId) ?? null;
    },
    [editando, localId],
  );

  const { data: local, loading, error, refetch } = useApi(getLocal);

  const volver = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/gestion/catalogo');
  };

  const noEncontrado = error instanceof ApiHttpError && error.status === 404;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: editando ? 'Editar local' : 'Nuevo local',
          headerStyle: { backgroundColor: palette.canvas },
          headerTintColor: palette.ink,
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 18 },
        }}
      />

      <Screen scroll contentContainerStyle={styles.screen}>
        {editando && loading && !local ? (
          <View style={styles.skeleton}>
            <Skeleton width="35%" height={12} />
            <Skeleton height={52} radius={radii.input} />
            <Skeleton height={52} radius={radii.input} />
            <Skeleton height={52} radius={radii.input} />
            <Skeleton height={52} radius={radii.pill} />
          </View>
        ) : editando && error ? (
          <ErrorState
            title={noEncontrado ? 'No encontramos ese local' : 'No pudimos cargar el local'}
            message={
              noEncontrado
                ? 'Puede que se haya borrado o que el enlace esté mal.'
                : error.message
            }
            onRetry={noEncontrado ? undefined : refetch}
          />
        ) : editando && !local ? (
          <EmptyState
            icon="storefront-outline"
            title="No encontramos ese local"
            description="Puede que ya no exista. Volvé al catálogo para ver los locales disponibles."
            actionLabel="Volver al catálogo"
            onAction={volver}
          />
        ) : (
          <LocalForm local={local} onSaved={volver} />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  skeleton: { gap: spacing.lg },
});
