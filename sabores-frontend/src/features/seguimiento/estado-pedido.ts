import type { BadgeTone } from '@/components/ui/badge';
import type { EstadoPedido } from '@/lib/api/types';

export const ESTADO_PEDIDO_LABEL: Record<EstadoPedido, string> = {
  RECIBIDO: 'Recibido',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

export const ESTADO_PEDIDO_TONE: Record<EstadoPedido, BadgeTone> = {
  RECIBIDO: 'info',
  EN_PREPARACION: 'warning',
  EN_CAMINO: 'accent',
  ENTREGADO: 'success',
  CANCELADO: 'danger',
};

export type PasoSeguimiento = {
  estado: EstadoPedido;
  label: string;
};

/** Pasos públicos del pedido. `CANCELADO` no es un paso: reemplaza la timeline. */
export const PASOS_SEGUIMIENTO: readonly PasoSeguimiento[] = [
  { estado: 'RECIBIDO', label: 'Pedido recibido' },
  { estado: 'EN_PREPARACION', label: 'En preparación' },
  { estado: 'EN_CAMINO', label: 'En camino' },
  { estado: 'ENTREGADO', label: 'Entregado' },
];

/** Índice del paso actual dentro de `PASOS_SEGUIMIENTO`; `-1` si el estado no es un paso. */
export function indicePaso(estado: EstadoPedido): number {
  return PASOS_SEGUIMIENTO.findIndex((paso) => paso.estado === estado);
}
