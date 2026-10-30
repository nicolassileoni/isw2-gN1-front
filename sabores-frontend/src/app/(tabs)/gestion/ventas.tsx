import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';

import {
  AppText,
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  IconButton,
  MoneyText,
  Screen,
  Skeleton,
  TextField,
} from '@/components/ui';
import { palette, radii, semantic, spacing } from '@/constants/theme';
import { RequireAdmin } from '@/features/session/require-session';
import { useApi } from '@/hooks/use-api';
import { apiClient } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import { formatDateInput } from '@/lib/format';
import type { VentaLocalResponse } from '@/lib/api/types';

type Rango = { desde: string; hasta: string };
type RangoErrors = Partial<Record<keyof Rango, string>>;

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && formatDateInput(date) === value;
}

function validarRango(rango: Rango): RangoErrors {
  const errors: RangoErrors = {};

  if (!isValidDateInput(rango.desde)) {
    errors.desde = 'Usá una fecha válida con formato AAAA-MM-DD.';
  }

  if (!isValidDateInput(rango.hasta)) {
    errors.hasta = 'Usá una fecha válida con formato AAAA-MM-DD.';
  }

  if (!errors.desde && !errors.hasta && rango.desde > rango.hasta) {
    errors.hasta = 'La fecha hasta debe ser igual o posterior a desde.';
  }

  return errors;
}

function VentasSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <Skeleton width="50%" height={18} />
          <Skeleton width="35%" height={12} />
          <Skeleton width="40%" height={26} radius={radii.pill} />
        </View>
      ))}
    </View>
  );
}

type VentasContenidoProps = {
  data: VentaLocalResponse[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  desde: string;
  hasta: string;
  errors: RangoErrors;
  presets: { key: string; label: string; desde: string; hasta: string }[];
  aplicado: Rango;
  onCambiarDesde: (value: string) => void;
  onCambiarHasta: (value: string) => void;
  onAplicar: () => void;
  onPreset: (preset: { desde: string; hasta: string }) => void;
  onVolver: () => void;
  onIrAlCatalogo: () => void;
};

function VentasContenido({
  data,
  loading,
  error,
  refetch,
  desde,
  hasta,
  errors,
  presets,
  aplicado,
  onCambiarDesde,
  onCambiarHasta,
  onAplicar,
  onPreset,
  onVolver,
  onIrAlCatalogo,
}: VentasContenidoProps) {
  const ventas = data ?? [];
  const totalPedidos = ventas.reduce((total, venta) => total + venta.cantidadPedidos, 0);
  const totalMonto = ventas.reduce((total, venta) => total + venta.montoVendido, 0);
  const sinVentas = data !== null && data.length > 0 && totalPedidos === 0;
  const cargandoInicial = loading && data === null;

  return (
    <Screen padded={false} edges={['top']}>
      <FlatList
        data={ventas}
        keyExtractor={(venta) => String(venta.localId)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardCopy}>
              <AppText variant="label" numberOfLines={2}>
                {item.localNombre}
              </AppText>
              <AppText variant="caption" color={palette.warmGray}>
                {item.cantidadPedidos} {item.cantidadPedidos === 1 ? 'pedido' : 'pedidos'} entregados
              </AppText>
            </View>

            <View style={styles.cardAmount}>
              <MoneyText amount={item.montoVendido} variant="price" />
              {item.cantidadPedidos === 0 ? <Badge label="Sin ventas" tone="neutral" /> : null}
            </View>
          </View>
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
              <AppText variant="h1">Ventas</AppText>
              <AppText variant="body" color={palette.pewter}>
                Solo pedidos entregados. El monto no incluye el envío y se incluyen los locales
                sin ventas.
              </AppText>
            </View>

            <Card style={styles.filterCard}>
              <View style={styles.rangeRow}>
                <TextField
                  label="Desde"
                  required
                  value={desde}
                  onChangeText={onCambiarDesde}
                  placeholder="AAAA-MM-DD"
                  maxLength={10}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numbers-and-punctuation"
                  error={errors.desde}
                  containerStyle={styles.half}
                />
                <TextField
                  label="Hasta"
                  required
                  value={hasta}
                  onChangeText={onCambiarHasta}
                  placeholder="AAAA-MM-DD"
                  maxLength={10}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numbers-and-punctuation"
                  error={errors.hasta}
                  containerStyle={styles.half}
                />
              </View>

              <AppText variant="caption" color={palette.warmGray}>
                Formato AAAA-MM-DD. El rango incluye ambos días.
              </AppText>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presets}>
                {presets.map((preset) => (
                  <Chip
                    key={preset.key}
                    label={preset.label}
                    selected={aplicado.desde === preset.desde && aplicado.hasta === preset.hasta}
                    onPress={() => onPreset(preset)}
                  />
                ))}
              </ScrollView>

              <Button title="Aplicar rango" onPress={onAplicar} fullWidth />
            </Card>

            {cargandoInicial ? (
              <View style={styles.summarySkeleton}>
                <Skeleton width="45%" height={14} />
                <Skeleton width="60%" height={28} />
              </View>
            ) : data && data.length > 0 ? (
              <>
                <Card style={styles.summary}>
                  <View style={styles.summaryBlock}>
                    <AppText variant="overline" color={palette.warmGray}>
                      Pedidos entregados
                    </AppText>
                    <AppText variant="h2">{totalPedidos}</AppText>
                  </View>
                  <View style={[styles.summaryBlock, styles.summaryRight]}>
                    <AppText variant="overline" color={palette.warmGray}>
                      Monto vendido
                    </AppText>
                    <MoneyText amount={totalMonto} variant="h2" />
                    <AppText variant="caption" color={palette.warmGray}>
                      Sin envío
                    </AppText>
                  </View>
                </Card>

                {sinVentas ? (
                  <View style={styles.infoBox} accessibilityLiveRegion="polite">
                    <Ionicons name="information-circle" size={18} color={palette.info} />
                    <AppText variant="caption" color={palette.info} style={styles.infoText}>
                      No hay ventas en este rango. Los locales se muestran con 0.
                    </AppText>
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          cargandoInicial ? (
            <VentasSkeleton />
          ) : error ? (
            <ErrorState
              title="No pudimos cargar las ventas"
              message={error.message}
              onRetry={refetch}
            />
          ) : data && data.length === 0 ? (
            <EmptyState
              icon="trending-up-outline"
              title="No hay locales para mostrar"
              description="Cuando existan locales adheridos, sus ventas van a aparecer acá."
              actionLabel="Ir al catálogo"
              onAction={onIrAlCatalogo}
            />
          ) : undefined
        }
      />
    </Screen>
  );
}

export default function GestionVentasScreen() {
  return (
    <RequireAdmin>
      <VentasRango />
    </RequireAdmin>
  );
}

function VentasRango() {
  const presets = useMemo(() => {
    const hoy = new Date();
    const hasta = formatDateInput(hoy);

    return [
      { key: 'hoy', label: 'Hoy', desde: hasta, hasta },
      {
        key: 'ultimos-7',
        label: 'Últimos 7 días',
        desde: formatDateInput(addDays(hoy, -6)),
        hasta,
      },
      {
        key: 'mes',
        label: 'Este mes',
        desde: formatDateInput(startOfMonth(hoy)),
        hasta,
      },
    ];
  }, []);

  const inicial = presets[1] ?? presets[0];
  const [desde, setDesde] = useState(inicial.desde);
  const [hasta, setHasta] = useState(inicial.hasta);
  const [aplicado, setAplicado] = useState<Rango>({
    desde: inicial.desde,
    hasta: inicial.hasta,
  });
  const [errors, setErrors] = useState<RangoErrors>({});

  const getVentas = useCallback(
    (signal: AbortSignal) =>
      apiClient.get<VentaLocalResponse[]>(apiRoutes.ventas(aplicado.desde, aplicado.hasta), signal),
    [aplicado.desde, aplicado.hasta],
  );
  const { data, loading, error, refetch } = useApi(getVentas);

  const aplicar = (rango: Rango) => {
    if (rango.desde === aplicado.desde && rango.hasta === aplicado.hasta) {
      refetch();
      return;
    }

    setAplicado(rango);
  };

  const onCambiarDesde = (value: string) => {
    setDesde(value);
    setErrors((current) => ({ ...current, desde: undefined }));
  };

  const onCambiarHasta = (value: string) => {
    setHasta(value);
    setErrors((current) => ({ ...current, hasta: undefined }));
  };

  const onAplicar = () => {
    const siguientes = validarRango({ desde, hasta });
    setErrors(siguientes);

    if (Object.keys(siguientes).length > 0) return;

    aplicar({ desde, hasta });
  };

  const onPreset = (preset: Rango) => {
    setDesde(preset.desde);
    setHasta(preset.hasta);
    setErrors({});
    aplicar(preset);
  };

  const onVolver = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/gestion');
  };

  return (
    <VentasContenido
      data={data}
      loading={loading}
      error={error}
      refetch={refetch}
      desde={desde}
      hasta={hasta}
      errors={errors}
      presets={presets}
      aplicado={aplicado}
      onCambiarDesde={onCambiarDesde}
      onCambiarHasta={onCambiarHasta}
      onAplicar={onAplicar}
      onPreset={onPreset}
      onVolver={onVolver}
      onIrAlCatalogo={() => router.push('/(tabs)/gestion/catalogo')}
    />
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
  filterCard: { gap: spacing.md },
  rangeRow: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  presets: { gap: spacing.sm, paddingRight: spacing.xl },
  summarySkeleton: { gap: spacing.sm, padding: spacing.lg },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryBlock: { flex: 1, gap: spacing.xs },
  summaryRight: { alignItems: 'flex-end' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.input,
    backgroundColor: semantic.infoSoft,
  },
  infoText: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.card,
  },
  cardCopy: { flex: 1, gap: 2 },
  cardAmount: { alignItems: 'flex-end', gap: spacing.xs },
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
