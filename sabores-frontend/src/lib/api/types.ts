export type Rol = 'ADMIN' | 'OPERADOR';

export type EstadoPedido =
  | 'RECIBIDO'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type ErrorResponse = {
  mensaje: string;
  detalles: string[];
};

export type LoginResponse = {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: Rol;
  /** Opcional para tolerar versiones del backend que todavía no emiten token. */
  token?: string;
};

export type CategoriaResponse = { id: number; nombre: string };

export type LocalResponse = {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
};

export type LocalAdminResponse = LocalResponse & { activo: boolean };

/** Cuerpo de POST /api/locales y PUT /api/locales/{id}. El backend normaliza vacío a null. */
export type LocalUpsertRequest = {
  nombre: string;
  direccion: string | null;
  telefono: string | null;
};

export type ProductoCartaResponse = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  disponible: boolean;
};

export type CategoriaCartaResponse = {
  categoriaId: number;
  categoriaNombre: string;
  productos: ProductoCartaResponse[];
};

export type CartaResponse = {
  localId: number;
  localNombre: string;
  categorias: CategoriaCartaResponse[];
};

export type RepartidorResponse = {
  id: number;
  nombreCompleto: string;
  telefono: string | null;
};

export type ProductoAdminResponse = {
  id: number;
  localId: number;
  localNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  activo: boolean;
};

export type PedidoCreadoResponse = {
  codigoSeguimiento: string;
  total: number;
  estado: EstadoPedido;
  fechaHora: string;
};

export type ItemSeguimientoResponse = {
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
};

export type SeguimientoResponse = {
  codigoSeguimiento: string;
  estado: EstadoPedido;
  localNombre: string;
  items: ItemSeguimientoResponse[];
  total: number;
  fechaHora: string;
};

export type PedidoResumenResponse = {
  id: number;
  codigoSeguimiento: string;
  estado: EstadoPedido;
  localNombre: string;
  clienteNombre: string;
  fechaHora: string;
  total: number;
};

export type PedidoDetalleResponse = {
  id: number;
  codigoSeguimiento: string;
  estado: EstadoPedido;
  local: { id: number; nombre: string };
  cliente: { nombre: string; telefono: string };
  direccionEntrega: string;
  repartidor: { id: number; nombreCompleto: string } | null;
  fechaHora: string;
  items: {
    productoId: number;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
};

export type RepartidorEnCalleResponse = {
  repartidorId: number;
  nombreCompleto: string;
  cantidadPedidos: number;
  codigosPedidos: string[];
};

export type VentaLocalResponse = {
  localId: number;
  localNombre: string;
  cantidadPedidos: number;
  montoVendido: number;
};

export type UsuarioResponse = {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: Rol;
  activo: boolean;
  fechaAlta: string;
};

export type LoginRequest = { username: string; password: string };
export type LocalRequest = { nombre: string; direccion?: string | null; telefono?: string | null };
export type ProductoRequest = {
  localId: number;
  categoriaId: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock: number;
};
export type CrearPedidoRequest = {
  localId: number;
  direccionEntrega: string;
  cliente: { nombre: string; telefono: string };
  items: { productoId: number; cantidad: number }[];
};
export type CrearUsuarioRequest = {
  username: string;
  password: string;
  nombreCompleto: string;
  rol: Rol;
};
export type ActualizarUsuarioRequest = { nombreCompleto: string; rol: Rol };
