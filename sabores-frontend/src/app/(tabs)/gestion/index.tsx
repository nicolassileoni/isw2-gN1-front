import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, Screen } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';
import { RequireAdmin } from '@/features/session/require-session';

const SECCIONES = [
  {
    ruta: '/(tabs)/gestion/catalogo',
    icon: 'restaurant-outline',
    titulo: 'Catálogo',
    detalle: 'Locales y productos de la carta.',
  },
  {
    ruta: '/(tabs)/gestion/ventas',
    icon: 'trending-up-outline',
    titulo: 'Ventas',
    detalle: 'Monto vendido por local en un rango de fechas.',
  },
  {
    ruta: '/(tabs)/gestion/usuarios',
    icon: 'people-outline',
    titulo: 'Usuarios',
    detalle: 'Operadores y administradores.',
  },
] as const;

export default function GestionScreen() {
  return (
    <RequireAdmin>
      <Screen scroll contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <AppText variant="overline" color={palette.warmGray}>
            GESTIÓN
          </AppText>
          <AppText variant="h1">Administración</AppText>
          <AppText variant="body" color={palette.pewter}>
            Catálogo, ventas y usuarios. Solo disponible para administradores.
          </AppText>
        </View>

        <View style={styles.list}>
          {SECCIONES.map((seccion) => (
            <Pressable
              key={seccion.ruta}
              accessibilityRole="button"
              accessibilityLabel={seccion.titulo}
              accessibilityHint={seccion.detalle}
              onPress={() => router.push(seccion.ruta)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
              <View style={styles.icon}>
                <Ionicons name={seccion.icon} size={20} color={palette.ink} />
              </View>
              <View style={styles.copy}>
                <AppText variant="label">{seccion.titulo}</AppText>
                <AppText variant="caption" color={palette.warmGray}>
                  {seccion.detalle}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={palette.stone} />
            </Pressable>
          ))}
        </View>

        <Card style={styles.note}>
          <AppText variant="caption" color={palette.warmGray}>
            El backend valida el token y el rol en cada solicitud. Las opciones de esta pantalla se muestran según el rol de la sesión.
          </AppText>
        </Card>
      </Screen>
    </RequireAdmin>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  header: { gap: spacing.sm },
  list: { gap: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: palette.white,
    borderColor: palette.sand,
    borderWidth: 1,
    borderRadius: radii.card,
  },
  pressed: { opacity: 0.8 },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.canvas,
    borderRadius: radii.input,
  },
  copy: { flex: 1, gap: 2 },
  note: { backgroundColor: palette.canvas },
});
