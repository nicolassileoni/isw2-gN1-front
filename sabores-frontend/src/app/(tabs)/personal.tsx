import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Button, Card, Screen, TextField } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';
import { useSession } from '@/features/session/session-context';
import { apiClient, ApiHttpError, ApiNetworkError } from '@/lib/api/client';
import { apiRoutes } from '@/lib/api/routes';
import type { LoginResponse } from '@/lib/api/types';

const ERROR_CREDENCIALES = 'Usuario o contraseña incorrectos.';

export default function PersonalScreen() {
  const { user, login, logout } = useSession();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ingresar = async () => {
    if (enviando) return;

    const username = usuario.trim();

    if (!username || !password) {
      setError('Ingresá tu usuario y contraseña.');
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      const sesion = await apiClient.post<LoginResponse>(apiRoutes.auth.login, {
        username,
        password,
      });

      login(sesion);
      setPassword('');
      router.replace('/(tabs)/pedidos');
    } catch (requestError: unknown) {
      setPassword('');
      setError(
        requestError instanceof ApiHttpError && requestError.status === 401
          ? ERROR_CREDENCIALES
          : requestError instanceof ApiNetworkError
            ? requestError.message
            : 'No pudimos iniciar sesión. Intentá de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  };

  if (user) {
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
          <AppText variant="h1">Ya iniciaste sesión</AppText>
          <AppText variant="body" color={palette.pewter}>
            Estás como {user.nombreCompleto}.
          </AppText>
        </View>

        <Card style={styles.form}>
          <View style={styles.sessionRow}>
            <AppText variant="label">{user.nombreCompleto}</AppText>
            <Badge label={user.rol} tone={user.rol === 'ADMIN' ? 'accent' : 'neutral'} />
          </View>
          <Button
            title="Ir a mis pedidos"
            fullWidth
            onPress={() => router.replace('/(tabs)/pedidos')}
          />
          <Button title="Cerrar sesión" variant="destructive" fullWidth onPress={logout} />
        </Card>
      </Screen>
    );
  }

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
          onChangeText={(value) => {
            setUsuario(value);
            if (error) setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType="next"
          editable={!enviando}
        />

        <View style={styles.passwordBlock}>
          <TextField
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (error) setError(null);
            }}
            secureTextEntry={!mostrarPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={ingresar}
            editable={!enviando}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setMostrarPassword((current) => !current)}
            hitSlop={8}
            style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}>
            <Ionicons
              name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={palette.pewter}
            />
            <AppText variant="caption" color={palette.pewter}>
              {mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            </AppText>
          </Pressable>
        </View>

        {error ? (
          <AppText variant="caption" color={palette.danger}>
            {error}
          </AppText>
        ) : null}

        <Button
          title="Ingresar"
          onPress={ingresar}
          loading={enviando}
          disabled={!usuario || !password}
          fullWidth
        />

        <AppText variant="caption" color={palette.warmGray} style={styles.helper}>
          Usá el usuario y la contraseña que te asignó el administrador. No guardamos tu
          contraseña.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xxl },
  header: { gap: spacing.sm, alignItems: 'flex-start' },
  brandMark: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.peach,
    borderRadius: radii.input,
    marginBottom: spacing.sm,
  },
  form: { gap: spacing.lg },
  passwordBlock: { gap: spacing.sm },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    minHeight: 32,
  },
  pressed: { opacity: 0.7 },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  helper: { textAlign: 'center' },
});
