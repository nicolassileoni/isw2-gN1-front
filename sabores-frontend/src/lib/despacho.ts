import type { EstadoPedido } from '@/lib/api/types';

/** RN-04: máximo de pedidos en camino que puede tener un repartidor. */
export const MAX_PEDIDOS_REPARTIDOR = 3;

export function cargaLlena(cantidadPedidos: number): boolean {
  return cantidadPedidos >= MAX_PEDIDOS_REPARTIDOR;
}

/** Texto `N/3` usado en la hoja de repartidores y en "En la calle". */
export function cargaLabel(cantidadPedidos: number): string {
  return `${cantidadPedidos}/${MAX_PEDIDOS_REPARTIDOR}`;
}

/**
 * Acción que ofrece el detalle según el estado actual.
 * `null` = el pedido ya está cerrado y no admite acciones.
 */
export type AccionPedido = 'preparar' | 'asignar' | 'entregar' | null;

export function accionSegunEstado(estado: EstadoPedido): AccionPedido {
  switch (estado) {
    case 'RECIBIDO':
      return 'preparar';
    case 'EN_PREPARACION':
      return 'asignar';
    case 'EN_CAMINO':
      return 'entregar';
    default:
      return null;
  }
}

/** RN-05: solo se cancela antes de salir a la calle. */
export function puedeCancelarse(estado: EstadoPedido): boolean {
  return estado === 'RECIBIDO' || estado === 'EN_PREPARACION';
}
