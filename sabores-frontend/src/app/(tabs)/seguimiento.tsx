import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { showAlert } from '@/components/ui/app-alert';

import {
  AppText,
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  ErrorState,
  MoneyText,
  Screen,
  Skeleton,
  TextField,
} from '@/components/ui';
import { fonts, layout, palette, radii, spacing } from '@/constants/theme';
import { OrderTimeline } from '@/components/order-timeline';
import { CODIGO_SEGUIMIENTO_LENGTH, useSeguimiento } from '@/features/seguimiento/use-seguimiento';
import { ApiHttpError } from '@/lib/api/client';
import type { SeguimientoResponse } from '@/lib/api/types';
import { ESTADO_PEDIDO_LABEL, ESTADO_PEDIDO_TONE } from '@/lib/estado-pedido';
import { formatDateTime, formatMoney, normalizeTrackingCode } from '@/lib/format';

function SeguimientoSkeleton() {
  return (
    <Card style={styles.skeletonCard}>
      <Skeleton width="45%" height={12} />
      <Skeleton width="70%" height={28} />
      <Skeleton height={14} />
      <Skeleton width="60%" height={14} />
      <Skeleton width="35%" height={14} />
    </Card>
  );
}

function ResultadoPedido({
  pedido,
  onCopiar,
}: {
  pedido: SeguimientoResponse;
  onCopiar: () => void;
}) {
  const cancelado = pedido.estado === 'CANCELADO';

  return (
    <View style={styles.result}>
      <Card style={styles.codeCard}>
        <AppText variant="overline" color={palette.peach}>
          CÓDIGO DE SEGUIMIENTO
        </AppText>
        <AppText variant="code" color={palette.white}>
          {pedido.codigoSeguimiento}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copiar código de seguimiento"
          onPress={onCopiar}
          style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}>
          <Ionicons name="copy-outline" size={16} color={palette.ink} />
          <AppText variant="caption" color={palette.ink}>
            Copiar código
          </AppText>
        </Pressable>
      </Card>

      <Card style={styles.statusCard}>
        <View style={styles.statusRow}>
          <AppText variant="label">Estado del pedido</AppText>
          <Badge
            label={ESTADO_PEDIDO_LABEL[pedido.estado]}
            tone={ESTADO_PEDIDO_TONE[pedido.estado]}
          />
        </View>
        <Divider />
        {cancelado ? (
          <View style={styles.cancelled} accessible accessibilityLabel="Pedido cancelado">
            <Ionicons name="close-circle" size={24} color={palette.danger} />
            <View style={styles.cancelledCopy}>
              <AppText variant="label">Este pedido fue cancelado</AppText>
              <AppText variant="caption" color={palette.warmGray}>
                No se va a entregar. Si tenés dudas, comunicate con el local.
              </AppText>
            </View>
          </View>
        ) : (
          <OrderTimeline estado={pedido.estado} />
        )}
      </Card>

      <Card style={styles.detailCard}>
        <View style={styles.detailRow}>
          <AppText variant="body" color={palette.warmGray}>
            Local
          </AppText>
          <AppText variant="label" style={styles.detailValue} numberOfLines={2}>
            {pedido.localNombre}
          </AppText>
        </View>
        <Divider />
        <AppText variant="overline" color={palette.warmGray}>
          PRODUCTOS
        </AppText>
        <View style={styles.items}>
          {pedido.items.map((item, index) => (
            <View
              key={`${item.productoNombre}-${index}`}
              style={styles.itemRow}
              accessible
              accessibilityLabel={`${item.cantidad} ${item.productoNombre}, ${formatMoney(item.precioUnitario)} cada uno`}>
              <View style={styles.itemCopy}>
                <AppText variant="label">{item.productoNombre}</AppText>
                <AppText variant="caption" color={palette.warmGray}>
                  {item.cantidad} × {formatMoney(item.precioUnitario)}
                </AppText>
              </View>
            </View>
          ))}
        </View>
        <Divider />
        <View style={styles.detailRow}>
          <AppText variant="label">Total</AppText>
          <MoneyText amount={pedido.total} />
        </View>
        <AppText variant="caption" color={palette.warmGray}>
          Realizado el {formatDateTime(pedido.fechaHora)}
        </AppText>
      </Card>
    </View>
  );
}

export default function SeguimientoScreen() {
  const { codigo: codigoParam } = useLocalSearchParams<{ codigo?: string }>();
  const { codigo, data, loading, error, buscar, reintentar, limpiar } = useSeguimiento();
  const [input, setInput] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const codigoDesdeNavegacion = useRef<string | null>(null);

  useEffect(() => {
    const normalizado = normalizeTrackingCode(codigoParam ?? '');
    if (normalizado.length !== CODIGO_SEGUIMIENTO_LENGTH) return;
    if (codigoDesdeNavegacion.current === normalizado) return;

    codigoDesdeNavegacion.current = normalizado;
    setInput(normalizado);
    setFieldError(null);
    buscar(normalizado);
  }, [codigoParam, buscar]);

  const onChangeCodigo = (value: string) => {
    const limpio = value
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, CODIGO_SEGUIMIENTO_LENGTH);

    setInput(limpio);
    if (fieldError) setFieldError(null);
  };

  const onBuscar = () => {
    const normalizado = normalizeTrackingCode(input);

    if (!normalizado) {
      setFieldError('Ingresá el código de seguimiento.');
      return;
    }

    if (normalizado.length !== CODIGO_SEGUIMIENTO_LENGTH) {
      setFieldError(
        `El código tiene ${CODIGO_SEGUIMIENTO_LENGTH} caracteres entre letras y números.`,
      );
      return;
    }

    setFieldError(null);
    setInput(normalizado);
    buscar(normalizado);
  };

  const onReiniciar = () => {
    setInput('');
    setFieldError(null);
    codigoDesdeNavegacion.current = null;
    limpiar();
  };

  const copiarCodigo = async () => {
    const codigoCopiable = data?.codigoSeguimiento ?? codigo;
    if (!codigoCopiable) return;

    await Clipboard.setStringAsync(codigoCopiable);
    showAlert('Código copiado', 'Guardalo para volver a consultar tu pedido.');
  };

  const noEncontrado = error instanceof ApiHttpError && error.status === 404;

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <AppText variant="overline" color={palette.warmGray}>
          SEGUIMIENTO
        </AppText>
        <AppText variant="h1">Seguir pedido</AppText>
        <AppText variant="body" color={palette.pewter}>
          Ingresá el código de 8 caracteres que recibiste al confirmar tu pedido.
        </AppText>
      </View>

      <Card style={styles.form}>
        <TextField
          label="Código de seguimiento"
          placeholder="ABC12345"
          value={input}
          onChangeText={onChangeCodigo}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={CODIGO_SEGUIMIENTO_LENGTH}
          returnKeyType="search"
          onSubmitEditing={onBuscar}
          error={fieldError}
          helper={fieldError ? undefined : 'El código tiene 8 caracteres entre letras y números.'}
          inputStyle={styles.codeInput}
        />
        <Button
          title="Buscar pedido"
          onPress={onBuscar}
          loading={loading}
          disabled={!input}
          fullWidth
        />
      </Card>

      {loading ? <SeguimientoSkeleton /> : null}

      {!loading && data ? <ResultadoPedido pedido={data} onCopiar={copiarCodigo} /> : null}

      {!loading && error && noEncontrado ? (
        <EmptyState
          icon="help-circle-outline"
          brand
          title="No encontramos ese pedido"
          description="Revisá el código e intentá de nuevo. Debe tener 8 caracteres entre letras y números."
          actionLabel="Buscar otro pedido"
          onAction={onReiniciar}
        />
      ) : null}

      {!loading && error && !noEncontrado ? (
        <View style={styles.errorBlock}>
          <ErrorState
            title="No pudimos consultar el pedido"
            message={error.message}
            onRetry={reintentar}
          />
          <Button title="Buscar otro pedido" variant="secondary" fullWidth onPress={onReiniciar} />
        </View>
      ) : null}

      {!loading && !data && !error ? (
        <Card style={styles.note}>
          <AppText variant="label">Cómo funciona</AppText>
          <AppText variant="body" color={palette.warmGray}>
            Cuando confirmás un pedido recibís un código de 8 caracteres. Acá podés ver el estado,
            el local, los productos y el total, sin datos personales.
          </AppText>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  header: { gap: spacing.sm },
  form: { gap: spacing.lg },
  codeInput: {
    fontFamily: fonts.bodySemibold,
    fontSize: 18,
    letterSpacing: 3,
  },
  skeletonCard: { gap: spacing.md },
  result: { gap: spacing.lg },
  codeCard: { gap: spacing.sm, backgroundColor: palette.ink, borderColor: palette.ink },
  copyButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: layout.touchTarget,
    borderRadius: radii.pill,
    backgroundColor: palette.peach,
  },
  pressed: { opacity: 0.85 },
  statusCard: { gap: spacing.lg },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cancelled: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cancelledCopy: { flex: 1, gap: spacing.xs },
  detailCard: { gap: spacing.md },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailValue: { flex: 1, textAlign: 'right' },
  items: { gap: spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemCopy: { flex: 1, gap: 2 },
  errorBlock: { gap: spacing.sm },
  note: { gap: spacing.sm },
});
