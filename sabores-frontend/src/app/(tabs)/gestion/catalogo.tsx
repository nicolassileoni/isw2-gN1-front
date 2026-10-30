import { PlaceholderScreen } from '@/components/placeholder-screen';
import { RequireAdmin } from '@/features/session/require-session';

export default function GestionCatalogoScreen() {
  return (
    <RequireAdmin>
      <PlaceholderScreen
        overline="CATÁLOGO"
        title="Locales y productos"
        icon="restaurant-outline"
        description="Acá vas a poder crear, editar y activar o desactivar locales y productos."
        rama="feat/admin-locales y feat/admin-productos"
        back
      />
    </RequireAdmin>
  );
}
