import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, ErrorState, Screen, Skeleton } from '@/components/ui';
import { palette, spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { apiBaseUrl, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { LocalResponse } from '@/lib/api/types';

/** Pantalla temporal para comprobar conectividad con el backend durante desarrollo. */
export default function ApiDiagnosticsScreen() {
  const getLocales = useCallback(
    (signal: AbortSignal) => apiClient.get<LocalResponse[]>(apiRoutes.locales.list, signal),
    [],
  );
  const { data: locales, loading, error, refetch } = useApi(getLocales);

  if (!__DEV__) {
    return (
      <Screen>
        <ErrorState
          title="Diagnóstico no disponible"
          message="Esta pantalla solo está habilitada durante el desarrollo."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <AppText variant="h2">Diagnóstico de API</AppText>
        <AppText variant="body" color={palette.pewter}>
          GET {apiBaseUrl}
          {apiRoutes.locales.list}
        </AppText>
      </View>

      {loading && <Skeleton height={96} />}

      {error && (
        <ErrorState
          title="No se pudieron cargar los locales"
          message={error.message}
          onRetry={refetch}
        />
      )}

      {locales && (
        <View style={styles.list}>
          <AppText variant="label">Respuesta: {locales.length} locales</AppText>
          {locales.map((local) => (
            <Card key={local.id} style={styles.local}>
              <AppText variant="label">{local.nombre}</AppText>
              {local.direccion && <AppText variant="caption">{local.direccion}</AppText>}
            </Card>
          ))}
          <Button title="Actualizar" variant="secondary" onPress={refetch} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxl },
  header: { gap: spacing.xs },
  list: { gap: spacing.md },
  local: { gap: spacing.xs },
});
