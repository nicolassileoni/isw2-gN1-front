import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { showAlert } from '@/components/ui/app-alert';

import { AppText, Badge, Button, Card, Divider, Screen } from '@/components/ui';
import { palette, spacing } from '@/constants/theme';
import { RequireSession } from '@/features/session/require-session';
import { useSession } from '@/features/session/session-context';

export default function CuentaScreen() {
  return (
    <RequireSession>
      <CuentaContenido />
    </RequireSession>
  );
}

function CuentaContenido() {
  const { user, logout } = useSession();

  if (!user) return null;

  const confirmarCierre = () => {
    showAlert('Cerrar sesión', '¿Querés salir del área del personal?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(tabs)/personal');
        },
      },
    ]);
  };

  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <AppText variant="overline" color={palette.warmGray}>
          CUENTA
        </AppText>
        <AppText variant="h1">{user.nombreCompleto}</AppText>
        <AppText variant="body" color={palette.pewter}>
          @{user.username}
        </AppText>
      </View>

      <Card style={styles.card}>
        <View style={styles.row}>
          <AppText variant="body" color={palette.warmGray}>
            Rol
          </AppText>
          <Badge label={user.rol} tone={user.rol === 'ADMIN' ? 'accent' : 'neutral'} />
        </View>
        <Divider />
        <View style={styles.row}>
          <AppText variant="body" color={palette.warmGray}>
            Usuario
          </AppText>
          <AppText variant="label">{user.username}</AppText>
        </View>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label">Sobre esta sesión</AppText>
        <AppText variant="caption" color={palette.warmGray}>
          La sesión y el token viven solo en memoria y se pierden al cerrar la app. No guardamos
          tu contraseña. El backend valida el token y el rol en cada solicitud.
        </AppText>
      </Card>

      <Button title="Cerrar sesión" variant="destructive" fullWidth onPress={confirmarCierre} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  header: { gap: spacing.sm },
  card: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
