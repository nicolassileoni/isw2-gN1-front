import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { EmptyState, Screen } from '@/components/ui';

import { useSession } from './session-context';

function SinAcceso({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <Screen contentContainerStyle={{ justifyContent: 'center' }}>
      <EmptyState
        icon="lock-closed-outline"
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    </Screen>
  );
}

/**
 * Guardas de interfaz. El backend valida el JWT y los roles; estas guardas solo
 * evitan que el usuario vea acciones para las que no tiene permiso.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useSession();

  if (!isAuthenticated) {
    return (
      <SinAcceso
        title="No tenés permiso para esta sección"
        description="Ingresá con tu usuario del personal para ver esta pantalla."
        actionLabel="Ir al ingreso"
        onAction={() => router.replace('/(tabs)/personal')}
      />
    );
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useSession();

  if (!isAuthenticated) {
    return (
      <SinAcceso
        title="No tenés permiso para esta sección"
        description="Ingresá con tu usuario del personal para ver esta pantalla."
        actionLabel="Ir al ingreso"
        onAction={() => router.replace('/(tabs)/personal')}
      />
    );
  }

  if (!isAdmin) {
    return (
      <SinAcceso
        title="Esta sección es solo para administradores"
        description="Tu usuario es de operador. Pedile a un administrador que te dé acceso si lo necesitás."
        actionLabel="Volver a mis pedidos"
        onAction={() => router.replace('/(tabs)/pedidos')}
      />
    );
  }

  return <>{children}</>;
}
