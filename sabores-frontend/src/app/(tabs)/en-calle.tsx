import { PlaceholderScreen } from '@/components/placeholder-screen';
import { RequireSession } from '@/features/session/require-session';

export default function EnCalleScreen() {
  return (
    <RequireSession>
      <PlaceholderScreen
        overline="REPARTIDORES"
        title="En la calle"
        icon="bicycle-outline"
        description="Acá vas a ver la carga de cada repartidor y los pedidos que tiene en camino."
        rama="feat/despacho"
      />
    </RequireSession>
  );
}
