import { PlaceholderScreen } from '@/components/placeholder-screen';
import { RequireAdmin } from '@/features/session/require-session';

export default function GestionVentasScreen() {
  return (
    <RequireAdmin>
      <PlaceholderScreen
        overline="VENTAS"
        title="Ventas por local"
        icon="trending-up-outline"
        description="Acá vas a ver la cantidad de pedidos entregados y el monto vendido por local."
        rama="feat/admin-ventas"
        back
      />
    </RequireAdmin>
  );
}
