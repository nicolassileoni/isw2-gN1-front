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
import { RequireAdmin } from '@/features/session/require-session';
import { useApi } from '@/hooks/use-api';
import { ApiHttpError, apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { LocalAdminResponse } from '@/lib/api/types';

function mensajeAccion(error: unknown, fallback: string): string {
  if (error instanceof ApiHttpError) return error.message || fallback;
  return error instanceof Error ? error.message : fallback;
}

function LocalesSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <Skeleton width="55%" height={18} />
          <Skeleton width="75%" height={12} />
          <Skeleton width="35%" height={26} radius={radii.pill} />
        </View>
      ))}
    </View>
  );
}

type LocalRowProps = {
  local: LocalAdminResponse;
  mutando: boolean;
  onEditar: () => void;
  onCambiarActivo: () => void;
};

function LocalRow({ local, mutando, onEditar, onCambiarActivo }: LocalRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <AppText variant="label" style={styles.cardTitle} numberOfLines={2}>
          {local.nombre}
        </AppText>

        <View style={styles.cardTopActions}>
          <Badge
            label={local.activo ? 'Activo' : 'Inactivo'}
            tone={local.activo ? 'success' : 'neutral'}
          />
          <IconButton
            name="create-outline"
            label={`Editar ${local.nombre}`}
            onPress={onEditar}
            variant="soft"
            size={16}
            style={styles.editIcon}
          />
        </View>
      </View>

      <View style={styles.meta}>
        <AppText variant="caption" color={palette.warmGray} numberOfLines={1}>
          {local.direccion || 'Sin dirección'}
        </AppText>
        <AppText variant="caption" color={palette.warmGray} numberOfLines={1}>
          {local.telefono || 'Sin teléfono'}
        </AppText>
      </View>

      <View style={styles.cardActions}>
        <View style={styles.switchWrap}>
          <Switch
            value={local.activo}
            onValueChange={onCambiarActivo}
            label="Activo"
            helper={mutando ? 'Guardando…' : undefined}
            disabled={mutando}
            accessibilityLabel={
              local.activo ? `Desactivar ${local.nombre}` : `Activar ${local.nombre}`
            }
          />
        </View>
      </View>
    </View>
  );
}

export default function GestionCatalogoScreen() {
  return (
    <RequireAdmin>
      <CatalogoContenido />
    </RequireAdmin>
  );
}

function CatalogoContenido() {
  const [busqueda, setBusqueda] = useState('');
  const [accionError, setAccionError] = useState<string | null>(null);
  const [mutandoId, setMutandoId] = useState<number | null>(null);

  const getLocales = useCallback(
    (signal: AbortSignal) => apiClient.get<LocalAdminResponse[]>(apiRoutes.locales.all, signal),
    [],
  );
  const { data, loading, error, refetch, setData } = useApi(getLocales);
  const primeraVez = useRef(true);

  // Al volver del formulario la lista puede haber cambiado: refrescamos al enfocar.
  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        return;
      }

      refetch();
    }, [refetch]),
  );

  const locales = useMemo(() => {
    const lista = data ?? [];
    const texto = busqueda.trim().toLocaleLowerCase('es-AR');
    if (!texto) return lista;

    return lista.filter((local) => local.nombre.toLocaleLowerCase('es-AR').includes(texto));
  }, [data, busqueda]);

  const nuevo = () => router.push('/(tabs)/gestion/local-form');

  const editar = (local: LocalAdminResponse) =>
    router.push({ pathname: '/(tabs)/gestion/local-form', params: { id: String(local.id) } });

  const cambiarActivo = useCallback(
    async (local: LocalAdminResponse, activo: boolean) => {
      if (mutandoId !== null) return;

      const anterior = data;

      setMutandoId(local.id);
      setAccionError(null);
      // Feedback inmediato: el switch cambia ya y se confirma contra el backend.
      setData((data ?? []).map((item) => (item.id === local.id ? { ...item, activo } : item)));

      try {
        await apiClient.patch(apiRoutes.locales.activo(local.id), { activo });
        refetch();
      } catch (patchError: unknown) {
        setData(anterior);
        setAccionError(
          mensajeAccion(
            patchError,
            activo ? 'No pudimos activar el local.' : 'No pudimos desactivar el local.',
          ),
        );
      } finally {
        setMutandoId(null);
      }
    },
    [data, mutandoId, refetch, setData],
  );

  const pedirCambio = useCallback(
    (local: LocalAdminResponse) => {
      if (!local.activo) {
        void cambiarActivo(local, true);
        return;
      }

      showAlert(
        'Desactivar local',
        `“${local.nombre}” no se mostrará más al público. ¿Continuar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Desactivar', style: 'destructive', onPress: () => void cambiarActivo(local, false) },
        ],
      );
    },
    [cambiarActivo],
  );

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={locales}
        keyExtractor={(local) => String(local.id)}
        renderItem={({ item }) => (
          <LocalRow
            local={item}
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
                Locales adheridos. Los inactivos no se muestran al público.
              </AppText>
            </View>

            <CatalogTabs active="locales" />

            <SearchField
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar local"
              accessibilityLabel="Buscar local por nombre"
              returnKeyType="search"
            />

            <Button title="Nuevo local" onPress={nuevo} fullWidth />

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
            <LocalesSkeleton />
          ) : error ? (
            <ErrorState
              title="No pudimos cargar los locales"
              message={error.message}
              onRetry={refetch}
            />
          ) : (
            <EmptyState
              icon="storefront-outline"
              brand={!busqueda}
              title={busqueda ? 'No encontramos locales con ese nombre' : 'Todavía no hay locales'}
              description={
                busqueda
                  ? 'Probá con otra búsqueda.'
                  : 'Creá el primer local para empezar a cargar su carta.'
              }
              actionLabel={busqueda ? 'Limpiar búsqueda' : 'Nuevo local'}
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
  cardTitle: { flex: 1 },
  cardTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editIcon: {
    width: 28,
    height: 28,
  },
  meta: { gap: 2 },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.sand,
  },
  switchWrap: { flex: 1 },
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
