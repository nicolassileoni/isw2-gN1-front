import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

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
import { layout, palette, radii, semantic, spacing } from '@/constants/theme';
import { ChangePasswordSheet } from '@/features/admin-usuarios/change-password-sheet';
import { RequireAdmin } from '@/features/session/require-session';
import { useSession } from '@/features/session/session-context';
import { useApi } from '@/hooks/use-api';
import { ApiHttpError, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import { formatDate } from '@/lib/format';
import type { UsuarioResponse } from '@/lib/api/types';

function mensajeAccion(error: unknown, fallback: string): string {
  if (error instanceof ApiHttpError) return error.message || fallback;
  return error instanceof Error ? error.message : fallback;
}

function UsuariosSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <Skeleton width="55%" height={18} />
          <Skeleton width="70%" height={12} />
          <Skeleton width="35%" height={26} radius={radii.pill} />
        </View>
      ))}
    </View>
  );
}

type UsuarioRowProps = {
  usuario: UsuarioResponse;
  esPropio: boolean;
  mutando: boolean;
  onEditar: () => void;
  onCambiarPassword: () => void;
  onCambiarActivo: () => void;
};

function UsuarioRow({
  usuario,
  esPropio,
  mutando,
  onEditar,
  onCambiarPassword,
  onCambiarActivo,
}: UsuarioRowProps) {
  const alta = formatDate(usuario.fechaAlta);
  const esAdmin = usuario.rol === 'ADMIN';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitle}>
          <AppText variant="label" numberOfLines={2}>
            {usuario.nombreCompleto}
          </AppText>
          <AppText variant="caption" color={palette.warmGray} numberOfLines={1}>
            @{usuario.username}
            {alta ? ` · Alta ${alta}` : ''}
          </AppText>
        </View>

        <View style={styles.badges}>
          <Badge
            label={esAdmin ? 'Administrador' : 'Operador'}
            tone={esAdmin ? 'accent' : 'neutral'}
          />
          {esPropio ? <Badge label="Tu usuario" tone="info" /> : null}
        </View>
      </View>

      <View style={styles.cardActions}>
        <Switch
          value={usuario.activo}
          onValueChange={() => onCambiarActivo()}
          label="Activo"
          helper={
            esPropio
              ? 'No podés desactivar tu propio usuario.'
              : mutando
                ? 'Guardando…'
                : undefined
          }
          disabled={esPropio || mutando}
          accessibilityLabel={
            esPropio
              ? 'No podés desactivar tu propio usuario'
              : usuario.activo
                ? `Desactivar ${usuario.nombreCompleto}`
                : `Activar ${usuario.nombreCompleto}`
          }
        />

        <View style={styles.links}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Cambiar contraseña de ${usuario.nombreCompleto}`}
            onPress={onCambiarPassword}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
            <Ionicons name="key-outline" size={16} color={palette.ember} />
            <AppText variant="label" color={palette.ember}>
              Contraseña
            </AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${usuario.nombreCompleto}`}
            onPress={onEditar}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
            <AppText variant="label" color={palette.ember}>
              Editar
            </AppText>
            <Ionicons name="chevron-forward" size={16} color={palette.ember} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function GestionUsuariosScreen() {
  return (
    <RequireAdmin>
      <UsuariosContenido />
    </RequireAdmin>
  );
}

function UsuariosContenido() {
  const { user } = useSession();
  const [busqueda, setBusqueda] = useState('');
  const [accionError, setAccionError] = useState<string | null>(null);
  const [mutandoId, setMutandoId] = useState<number | null>(null);
  const [passwordUser, setPasswordUser] = useState<UsuarioResponse | null>(null);

  const getUsuarios = useCallback(
    (signal: AbortSignal) => apiClient.get<UsuarioResponse[]>(apiRoutes.usuarios.list, signal),
    [],
  );
  const { data, loading, error, refetch, setData } = useApi(getUsuarios);
  const primeraVez = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        return;
      }

      refetch();
    }, [refetch]),
  );

  const usuarios = useMemo(() => {
    const lista = data ?? [];
    const texto = busqueda.trim().toLocaleLowerCase('es-AR');
    if (!texto) return lista;

    return lista.filter(
      (usuario) =>
        usuario.nombreCompleto.toLocaleLowerCase('es-AR').includes(texto) ||
        usuario.username.toLocaleLowerCase('es-AR').includes(texto),
    );
  }, [data, busqueda]);

  const nuevo = () => router.push('/(tabs)/gestion/usuario-form');

  const editar = (usuario: UsuarioResponse) =>
    router.push({
      pathname: '/(tabs)/gestion/usuario-form',
      params: { id: String(usuario.id) },
    });

  const cambiarActivo = useCallback(
    async (usuario: UsuarioResponse, activo: boolean) => {
      if (mutandoId !== null || usuario.id === user?.id) return;

      const anterior = data;

      setMutandoId(usuario.id);
      setAccionError(null);
      setData((data ?? []).map((item) => (item.id === usuario.id ? { ...item, activo } : item)));

      try {
        await apiClient.patch(apiRoutes.usuarios.activo(usuario.id), { activo });
        refetch();
      } catch (patchError: unknown) {
        setData(anterior);
        setAccionError(
          mensajeAccion(
            patchError,
            activo ? 'No pudimos activar el usuario.' : 'No pudimos desactivar el usuario.',
          ),
        );
      } finally {
        setMutandoId(null);
      }
    },
    [data, mutandoId, refetch, setData, user?.id],
  );

  const pedirCambio = useCallback(
    (usuario: UsuarioResponse) => {
      if (usuario.id === user?.id) return;

      if (!usuario.activo) {
        void cambiarActivo(usuario, true);
        return;
      }

      Alert.alert(
        'Desactivar usuario',
        `“${usuario.nombreCompleto}” no podrá ingresar al sistema. ¿Continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: () => void cambiarActivo(usuario, false),
          },
        ],
      );
    },
    [cambiarActivo, user?.id],
  );

  const onVolver = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/gestion');
  };

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={usuarios}
        keyExtractor={(usuario) => String(usuario.id)}
        renderItem={({ item }) => (
          <UsuarioRow
            usuario={item}
            esPropio={item.id === user?.id}
            mutando={mutandoId === item.id}
            onEditar={() => editar(item)}
            onCambiarPassword={() => setPasswordUser(item)}
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
              <IconButton name="chevron-back" label="Volver" onPress={onVolver} />
            </View>

            <View style={styles.titleBlock}>
              <AppText variant="overline" color={palette.warmGray}>
                GESTIÓN
              </AppText>
              <AppText variant="h1">Usuarios</AppText>
              <AppText variant="body" color={palette.pewter}>
                Operadores y administradores. Los usuarios no se eliminan: se desactivan.
              </AppText>
            </View>

            <SearchField
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar por nombre o usuario"
              accessibilityLabel="Buscar usuario"
              returnKeyType="search"
            />

            <Button title="Nuevo usuario" onPress={nuevo} fullWidth />

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
          loading && data === null ? (
            <UsuariosSkeleton />
          ) : error ? (
            <ErrorState
              title="No pudimos cargar los usuarios"
              message={error.message}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              icon="people-outline"
              title={
                busqueda
                  ? 'No encontramos usuarios con ese dato'
                  : 'Todavía no hay usuarios del personal'
              }
              description={
                busqueda
                  ? 'Probá con otro nombre o usuario.'
                  : 'Creá el primer operador o administrador.'
              }
              actionLabel={busqueda ? 'Limpiar búsqueda' : 'Nuevo usuario'}
              onAction={busqueda ? () => setBusqueda('') : nuevo}
            />
          )
        }
      />

      {passwordUser ? (
        <ChangePasswordSheet
          key={passwordUser.id}
          user={passwordUser}
          onClose={() => setPasswordUser(null)}
          onSaved={() => {
            setPasswordUser(null);
            refetch();
          }}
        />
      ) : null}
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  cardActions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.sand,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.lg,
  },
  link: {
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pressed: { opacity: 0.7 },
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
