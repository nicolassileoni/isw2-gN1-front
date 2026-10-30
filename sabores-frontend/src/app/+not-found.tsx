import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { EmptyState, Screen } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <Screen edges={['bottom']} contentContainerStyle={styles.screen}>
      <EmptyState
        icon="compass-outline"
        brand
        title="No encontramos esta pantalla"
        description="Puede que el enlace esté roto o que la pantalla todavía no exista."
        actionLabel="Volver al inicio"
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
});
