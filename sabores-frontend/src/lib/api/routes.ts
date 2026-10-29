import type { EstadoPedido } from './types';

const withQuery = (path: string, parameters: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();

  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });

  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
};

export const apiRoutes = {
  auth: { login: '/api/auth/login' },
  categorias: '/api/categorias',
  locales: {
    list: '/api/locales',
    all: '/api/locales/todos',
    detail: (id: number) => `/api/locales/${id}`,
    carta: (id: number) => `/api/locales/${id}/carta`,
    activo: (id: number) => `/api/locales/${id}/activo`,
  },
  productos: {
    list: (localId?: number) => withQuery('/api/productos', { localId }),
    detail: (id: number) => `/api/productos/${id}`,
    activo: (id: number) => `/api/productos/${id}/activo`,
  },
  repartidores: { list: '/api/repartidores', enCalle: '/api/repartidores/en-calle' },
  pedidos: {
    list: (estado?: EstadoPedido) => withQuery('/api/pedidos', { estado }),
    detail: (id: number) => `/api/pedidos/${id}`,
    seguimiento: (codigo: string) => `/api/pedidos/seguimiento/${encodeURIComponent(codigo)}`,
    avanzar: (id: number) => `/api/pedidos/${id}/avanzar`,
    cancelar: (id: number) => `/api/pedidos/${id}/cancelar`,
  },
  ventas: (desde: string, hasta: string) => withQuery('/api/ventas', { desde, hasta }),
  usuarios: {
    list: '/api/usuarios',
    detail: (id: number) => `/api/usuarios/${id}`,
    password: (id: number) => `/api/usuarios/${id}/password`,
    activo: (id: number) => `/api/usuarios/${id}/activo`,
  },
} as const;
