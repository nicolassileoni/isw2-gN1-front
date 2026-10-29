import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Screen, TextField } from '@/components/ui';
import { palette, spacing } from '@/constants/theme';

export default function SeguimientoScreen() {
  const [codigo, setCodigo] = useState('');

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
          value={codigo}
          onChangeText={setCodigo}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={8}
          helper="El código tiene 8 caracteres entre letras y números."
        />
        <Button title="Buscar pedido" disabled />
      </Card>

      <Card style={styles.note}>
        <AppText variant="label">Muy pronto</AppText>
        <AppText variant="body" color={palette.warmGray}>
          La consulta pública se habilita cuando se conecte el backend. No vas a ver datos
          personales, solo el estado, el local, los productos y el total.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.xxl,
  },
  header: {
    gap: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  note: {
    gap: spacing.sm,
  },
});
