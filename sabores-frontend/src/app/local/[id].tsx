import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, EmptyState, Screen } from '@/components/ui';
import { palette, spacing } from '@/constants/theme';

export default function LocalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen edges={['bottom']} scroll contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <AppText variant="overline" color={palette.warmGray}>
          CARTA
        </AppText>
        <AppText variant="h1">Carta del local</AppText>
        <AppText variant="caption" color={palette.warmGray}>
          Local #{id ?? '—'}
        </AppText>
        <AppText variant="body" color={palette.pewter}>
          Acá vas a ver las categorías, los productos y el stock de este local.
        </AppText>
      </View>

      <EmptyState
        icon="restaurant-outline"
        title="Este local todavía no cargó su carta"
        description="Cuando tenga productos activos, van a aparecer acá."
        actionLabel="Volver al inicio"
        onAction={() => router.replace('/')}
      />

      <Button title="Volver" variant="secondary" onPress={() => router.back()} />
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
});
