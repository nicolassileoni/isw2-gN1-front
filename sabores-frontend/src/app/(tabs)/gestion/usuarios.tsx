import { PlaceholderScreen } from '@/components/placeholder-screen';
import { RequireAdmin } from '@/features/session/require-session';

export default function GestionUsuariosScreen() {
  return (
    <RequireAdmin>
      <PlaceholderScreen
        overline="USUARIOS"
        title="Usuarios del personal"
        icon="people-outline"
        description="Acá vas a poder crear operadores y administradores, cambiar contraseñas y desactivarlos."
        rama="feat/admin-usuarios"
        back
      />
    </RequireAdmin>
  );
}
