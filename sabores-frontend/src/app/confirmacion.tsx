import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, Card, MoneyText, Screen } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';
import { formatDateTime, normalizeTrackingCode } from '@/lib/format';

export default function ConfirmacionScreen() {
  const { codigo, total, estado, fechaHora } = useLocalSearchParams<{
    codigo?: string;
    total?: string;
    estado?: string;
    fechaHora?: string;
  }>();
  const trackingCode = normalizeTrackingCode(codigo ?? '');
  const copyCode = async () => {
    if (!trackingCode) return;
    await Clipboard.setStringAsync(trackingCode);
    Alert.alert('Código copiado', 'Guardalo para consultar el estado de tu pedido.');
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
        <Pressable accessibilityRole="button" accessibilityLabel="Copiar código de seguimiento" onPress={copyCode}>
          <AppText variant="code" color={palette.white}>{trackingCode || '—'}</AppText>
          <AppText variant="caption" color={palette.peach}>Tocá para copiar</AppText>
        </Pressable>
      </Card>
      <Card style={styles.details}>
        <View style={styles.row}><AppText variant="body" color={palette.warmGray}>Estado</AppText><AppText variant="label">{estado ?? 'RECIBIDO'}</AppText></View>
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
  icon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: '#E8F5EE', borderRadius: radii.pill },
  header: { alignItems: 'center', gap: spacing.sm },
  codeCard: { gap: spacing.md, backgroundColor: palette.ink, borderColor: palette.ink, alignItems: 'center' },
  details: { gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  actions: { gap: spacing.md },
});
