import { PlaceholderScreen } from '@/components/placeholder-screen';
import { RequireSession } from '@/features/session/require-session';

export default function PedidosScreen() {
  return (
    <RequireSession>
      <PlaceholderScreen
        overline="PEDIDOS"
        title="Pedidos"
        icon="receipt-outline"
        description="Acá vas a ver los pedidos del local, sus filtros por estado y el detalle completo."
        rama="feat/gestion-pedidos"
      />
    </RequireSession>
  );
}
