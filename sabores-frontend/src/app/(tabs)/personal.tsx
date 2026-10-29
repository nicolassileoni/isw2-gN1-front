import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Card, Screen, TextField } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';

export default function PersonalScreen() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <AppText variant="label" color={palette.ink}>
            SL
          </AppText>
        </View>
        <AppText variant="overline" color={palette.warmGray}>
          PERSONAL
        </AppText>
        <AppText variant="h1">Acceso del personal</AppText>
        <AppText variant="body" color={palette.pewter}>
          Operadores y administradores ingresan con su usuario y contraseña.
        </AppText>
      </View>

      <Card style={styles.form}>
        <TextField
          label="Usuario"
          placeholder="Tu usuario"
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="Contraseña"
          placeholder="Tu contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <Button title="Ingresar" disabled />
        <AppText variant="caption" color={palette.warmGray} style={styles.helper}>
          El login se habilita en la próxima etapa. No hay registro de clientes.
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
    alignItems: 'flex-start',
  },
  brandMark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.peach,
    borderRadius: radii.input,
    marginBottom: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  helper: {
    textAlign: 'center',
  },
});
