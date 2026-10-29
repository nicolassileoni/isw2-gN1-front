import { router } from 'expo-router';

import { EmptyState, Screen } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <Screen edges={['bottom']}>
      <EmptyState
        icon="compass-outline"
        title="No encontramos esta pantalla"
        description="Puede que el enlace esté roto o que la pantalla todavía no exista."
        actionLabel="Volver al inicio"
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}
