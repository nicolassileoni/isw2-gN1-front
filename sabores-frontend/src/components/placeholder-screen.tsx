import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, EmptyState, IconButton, Screen } from '@/components/ui';
import { palette, spacing } from '@/constants/theme';

type PlaceholderScreenProps = {
  overline: string;
  title: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  description: string;
  rama: string;
  back?: boolean;
};

/**
 * Pantalla provisoria para las secciones que todavía no tienen su rama.
 * No muestra datos falsos: solo deja la navegación armada.
 */
export function PlaceholderScreen({
  overline,
  title,
  icon,
  description,
  rama,
  back = false,
}: PlaceholderScreenProps) {
  return (
    <Screen scroll contentContainerStyle={styles.screen}>
      {back ? (
        <View style={styles.topBar}>
          <IconButton name="chevron-back" label="Volver" onPress={() => router.back()} />
        </View>
      ) : null}
      <View style={styles.header}>
        <AppText variant="overline" color={palette.warmGray}>
          {overline}
        </AppText>
        <AppText variant="h1">{title}</AppText>
      </View>
      <EmptyState
        icon={icon}
        title="Sección en preparación"
        description={`${description} Se implementa en la rama ${rama}.`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.xl },
  topBar: { alignItems: 'flex-start', marginLeft: -spacing.sm },
  header: { gap: spacing.sm },
});
