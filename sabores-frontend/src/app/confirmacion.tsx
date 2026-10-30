import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Button, Card, MoneyText, Screen } from '@/components/ui';
import { palette, radii, semantic, spacing } from '@/constants/theme';
import type { EstadoPedido } from '@/lib/api/types';
import { ESTADO_PEDIDO_ICON, ESTADO_PEDIDO_LABEL, ESTADO_PEDIDO_TONE } from '@/lib/estado-pedido';
import { formatDateTime, normalizeTrackingCode } from '@/lib/format';

export default function ConfirmacionScreen() {
  const { codigo, total, estado, fechaHora, local } = useLocalSearchParams<{
    codigo?: string;
    total?: string;
    estado?: string;
    fechaHora?: string;
    local?: string;
  }>();
  const trackingCode = normalizeTrackingCode(codigo ?? '');
  const estadoPedido: EstadoPedido =
    estado && estado in ESTADO_PEDIDO_LABEL ? (estado as EstadoPedido) : 'RECIBIDO';
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return undefined;

    const timer = setTimeout(() => setCopiado(false), 2000);
    return () => clearTimeout(timer);
  }, [copiado]);

  const copyCode = async () => {
    if (!trackingCode) return;
    await Clipboard.setStringAsync(trackingCode);
    setCopiado(true);
  };

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.icon}><AppText variant="h2" color={palette.success}>✓</AppText></View>
      <View style={styles.header}>
        <AppText variant="h1">¡Pedido confirmado!</AppText>
        <AppText variant="body" color={palette.pewter}>El local recibió tu pedido. Usá este código para seguirlo.</AppText>
      </View>
      <Card style={styles.codeCard}>
        <AppText variant="overline" color={palette.peach}>CÓDIGO DE SEGUIMIENTO</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copiado ? 'Código copiado' : 'Copiar código de seguimiento'}
          onPress={copyCode}>
          <AppText variant="code" color={palette.white}>{trackingCode || '—'}</AppText>
          <AppText variant="caption" color={palette.peach} accessibilityLiveRegion="polite">
            {copiado ? 'Copiado' : 'Tocá para copiar'}
          </AppText>
        </Pressable>
      </Card>
      <Card style={styles.details}>
        <View style={styles.row}>
          <AppText variant="body" color={palette.warmGray}>Estado</AppText>
          <Badge
            label={ESTADO_PEDIDO_LABEL[estadoPedido]}
            icon={ESTADO_PEDIDO_ICON[estadoPedido]}
            tone={ESTADO_PEDIDO_TONE[estadoPedido]}
          />
        </View>
        {local ? (
          <View style={styles.row}>
            <AppText variant="body" color={palette.warmGray}>Local</AppText>
            <AppText variant="label" style={styles.rowValue} numberOfLines={2}>{local}</AppText>
          </View>
        ) : null}
        <View style={styles.row}><AppText variant="body" color={palette.warmGray}>Total</AppText><MoneyText amount={total ?? 0} /></View>
        {fechaHora ? <AppText variant="caption" color={palette.warmGray}>Realizado el {formatDateTime(fechaHora)}</AppText> : null}
      </Card>
      <View style={styles.actions}>
        <Button title="Seguir pedido" fullWidth onPress={() => router.replace({ pathname: '/(tabs)/seguimiento', params: { codigo: trackingCode } })} />
        <Button title="Volver al inicio" variant="secondary" fullWidth onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'stretch', justifyContent: 'center', gap: spacing.xxl },
  icon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: semantic.successSoft, borderRadius: radii.pill },
  header: { alignItems: 'center', gap: spacing.sm },
  codeCard: { gap: spacing.md, backgroundColor: palette.dark, borderColor: palette.dark, alignItems: 'center' },
  details: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  rowValue: { flexShrink: 1, textAlign: 'right' },
  actions: { gap: spacing.md },
});
