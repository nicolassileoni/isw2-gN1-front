export type CartTotals = {
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
};

export const COSTO_ENVIO = 1500;
const UMBRAL_DESCUENTO = 20_000;
const PORCENTAJE_DESCUENTO = 0.1;

export function calculateCartTotals(items: readonly { precio: number; cantidad: number }[]): CartTotals {
  if (items.length === 0) return { subtotal: 0, descuento: 0, envio: 0, total: 0 };

  const subtotal = items.reduce((total, item) => total + item.precio * item.cantidad, 0);
  const descuento = subtotal > UMBRAL_DESCUENTO ? subtotal * PORCENTAJE_DESCUENTO : 0;

  return {
    subtotal,
    descuento,
    envio: COSTO_ENVIO,
    total: subtotal - descuento + COSTO_ENVIO,
  };
}
