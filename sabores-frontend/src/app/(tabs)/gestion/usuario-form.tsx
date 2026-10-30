import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, Screen, Skeleton } from '@/components/ui';
import { fonts, palette, radii, spacing } from '@/constants/theme';
import { UserForm } from '@/features/admin-usuarios/user-form';
import { RequireAdmin } from '@/features/session/require-session';
import { useSession } from '@/features/session/session-context';
import { useApi } from '@/hooks/use-api';
import { apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { UsuarioResponse } from '@/lib/api/types';

export default function UsuarioFormScreen() {
  return (
    <RequireAdmin>
      <UsuarioFormContenido />
    </RequireAdmin>
  );
}

function UsuarioFormContenido() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user: sesion } = useSession();
  const usuarioId = id ? Number(id) : null;
  const editando = usuarioId !== null && Number.isInteger(usuarioId) && usuarioId > 0;

  const getUsuario = useCallback(
    async (signal: AbortSignal) => {
      if (!editando || usuarioId === null) return null;

      const usuarios = await apiClient.get<UsuarioResponse[]>(apiRoutes.usuarios.list, signal);
      return usuarios.find((usuario) => usuario.id === usuarioId) ?? null;
    },
    [editando, usuarioId],
  );

  const { data: usuario, loading, error, refetch } = useApi(getUsuario);

  const volver = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/gestion/usuarios');
  };

  const noEncontrado = editando && !loading && !error && usuario === null;
  const esPropio = editando && usuarioId !== null && sesion?.id === usuarioId;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: editando ? 'Editar usuario' : 'Nuevo usuario',
          headerStyle: { backgroundColor: palette.canvas },
          headerTintColor: palette.ink,
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 18 },
        }}
      />

      <Screen scroll contentContainerStyle={styles.screen}>
        {editando && loading && !usuario ? (
          <View style={styles.skeleton}>
            <Skeleton width="35%" height={12} />
            <Skeleton height={52} radius={radii.input} />
            <Skeleton height={52} radius={radii.input} />
            <Skeleton width="60%" height={38} radius={radii.pill} />
            <Skeleton height={52} radius={radii.pill} />
          </View>
        ) : editando && error ? (
          <ErrorState
            title="No pudimos cargar el usuario"
            message={error.message}
            onRetry={refetch}
          />
        ) : noEncontrado ? (
          <EmptyState
            icon="person-outline"
            title="No encontramos ese usuario"
            description="Puede que ya no exista. Volvé a la lista para ver los usuarios del personal."
            actionLabel="Volver a usuarios"
            onAction={volver}
          />
        ) : (
          <UserForm usuario={usuario} esPropio={esPropio} onSaved={volver} />
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  skeleton: { gap: spacing.lg },
});
