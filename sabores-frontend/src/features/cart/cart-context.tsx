import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { calculateCartTotals, type CartTotals } from './calculations';

export type CartItem = {
  productoId: number;
  nombre: string;
  precio: number;
  stock: number;
  cantidad: number;
};

type CartLocal = { id: number; nombre: string };
type ProductToAdd = Omit<CartItem, 'cantidad'>;
type AddProductResult = 'added' | 'requires-local-change';

type CartContextValue = {
  local: CartLocal | null;
  items: CartItem[];
  cantidadTotal: number;
  totals: CartTotals;
  addProduct: (local: CartLocal, product: ProductToAdd) => AddProductResult;
  replaceWithProduct: (local: CartLocal, product: ProductToAdd) => void;
  setQuantity: (productoId: number, cantidad: number) => void;
  removeProduct: (productoId: number) => void;
  clearCart: () => void;
  getQuantity: (productoId: number) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

function addOrIncrement(items: CartItem[], product: ProductToAdd): CartItem[] {
  const current = items.find((item) => item.productoId === product.productoId);
  if (!current) return [...items, { ...product, cantidad: 1 }];

  return items.map((item) =>
    item.productoId === product.productoId
      ? { ...item, cantidad: Math.min(item.cantidad + 1, item.stock) }
      : item,
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [local, setLocal] = useState<CartLocal | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  const clearCart = () => {
    setLocal(null);
    setItems([]);
  };

  const addProduct = (nextLocal: CartLocal, product: ProductToAdd): AddProductResult => {
    if (local && local.id !== nextLocal.id) return 'requires-local-change';
    setLocal(nextLocal);
    setItems((currentItems) => addOrIncrement(currentItems, product));
    return 'added';
  };

  const replaceWithProduct = (nextLocal: CartLocal, product: ProductToAdd) => {
    setLocal(nextLocal);
    setItems([{ ...product, cantidad: 1 }]);
  };

  const setQuantity = (productoId: number, cantidad: number) => {
    setItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.productoId !== productoId) return [item];
        if (cantidad < 1) return [];
        return [{ ...item, cantidad: Math.min(cantidad, item.stock) }];
      }),
    );
  };

  const removeProduct = (productoId: number) => {
    const remainingItems = items.filter((item) => item.productoId !== productoId);
    setItems(remainingItems);
    if (remainingItems.length === 0) setLocal(null);
  };

  const cantidadTotal = useMemo(
    () => items.reduce((total, item) => total + item.cantidad, 0),
    [items],
  );
  const totals = useMemo(() => calculateCartTotals(items), [items]);
  const value: CartContextValue = {
    local,
    items,
    cantidadTotal,
    totals,
    addProduct,
    replaceWithProduct,
    setQuantity,
    removeProduct,
    clearCart,
    getQuantity: (productoId) => items.find((item) => item.productoId === productoId)?.cantidad ?? 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider.');
  return context;
}
