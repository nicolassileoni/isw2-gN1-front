import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Card, EmptyState, Screen, SectionHeader } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/theme';

const features = [
  {
    icon: 'restaurant-outline' as const,
    title: 'Elegí un local',
    description: 'Mirá su carta, precios y stock actualizado.',
  },
  {
    icon: 'bag-check-outline' as const,
    title: 'Pedí sin registrarte',
    description: 'Dejá tus datos una sola vez al confirmar.',
  },
  {
    icon: 'receipt-outline' as const,
    title: 'Seguí tu pedido',
    description: 'Consultá el estado con tu código de 8 caracteres.',
  },
];

export default function HomeScreen() {
  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}>
          <AppText variant="label" color={palette.ink}>
            SL
          </AppText>
        </View>
        <AppText variant="label" color={palette.slate}>
          Sabores del Litoral
        </AppText>
      </View>

      <View style={styles.hero}>
        <Badge label="Delivery local" tone="accent" />
        <AppText variant="display">
          Del litoral{'\n'}a tu mesa.
        </AppText>
        <AppText variant="bodyLarge" color={palette.pewter}>
          Pedí desde tu celular, sin crear una cuenta. Elegí un local, armá tu pedido y seguilo
          con un código.
        </AppText>
      </View>

      <Card style={styles.featureCard}>
        <AppText variant="overline" color={palette.warmGray}>
          CÓMO FUNCIONA
        </AppText>
        <View style={styles.features}>
          {features.map((feature) => (
            <View key={feature.title} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={20} color={palette.ink} />
              </View>
              <View style={styles.featureCopy}>
                <AppText variant="label">{feature.title}</AppText>
                <AppText variant="caption" color={palette.warmGray}>
                  {feature.description}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <SectionHeader title="Locales" subtitle="Adheridos" />
      <EmptyState
        icon="storefront-outline"
        title="Todavía no hay locales disponibles"
        description="Cuando se sumen locales adheridos, vas a poder ver su carta y hacer un pedido."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.xxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandMark: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.peach,
    borderRadius: radii.input,
  },
  hero: {
    gap: spacing.md,
  },
  featureCard: {
    gap: spacing.lg,
  },
  features: {
    gap: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.canvas,
    borderRadius: radii.input,
  },
  featureCopy: {
    flex: 1,
    gap: 2,
  },
});
