# Plan de implementación del frontend — Sabores del Litoral

> Documento de planificación. **No contiene código de implementación.**
>
> Se apoya en `DESIGN.md`, en los requerimientos del PDF, en `reglas_de_negocio.txt`, en el backend real que ya existe y en los conceptos vistos en la materia (componentes, JSX, estilos, hooks, navegación y consumo de APIs).
>
> **Nota de ejecución:** la primera rama implementada se llama `config-inicial` y absorbe la documentación de la rama 00 y la base visual/navegación de la rama 01. Las ramas 02 en adelante parten de `config-inicial`.

---

## 1. Objetivo del plan

Construir el frontend mobile de Sabores del Litoral de forma incremental, en ramas pequeñas que se integren a `main` una por una, sin romper lo anterior y sin inventar contratos que el backend no tenga.

El plan persigue cuatro resultados concretos:

1. **Flujo público completo:** ver locales, ver carta, armar pedido, confirmar y seguir el pedido con un código.
2. **Flujo del personal:** login, ver pedidos, avanzar estados, asignar repartidor, cancelar y ver pedidos en la calle.
3. **Flujo de administración:** gestionar locales, productos, ventas y usuarios.
4. **Coherencia real con el backend:** cada pantalla llama al endpoint correcto, con el método, el cuerpo y los códigos HTTP correctos; respeta las reglas de negocio y no muestra datos que la API no devuelve.

La app es **mobile**. El diseño, la navegación y los componentes se piensan para pantallas de 320–430 pt, uso con una mano, safe areas y teclado. No se construye una web responsive primero para después adaptarla.

---

## 2. Estado actual del proyecto

### 2.1 Frontend

- Expo SDK 57, React Native 0.86, React 19, TypeScript estricto.
- Expo Router ya configurado (`main: "expo-router/entry"`, rutas en `src/app/`).
- Proyecto inicial de Expo con pantallas de ejemplo (`index`, `explore`, componentes `themed-*`, tabs nativos).
- No hay capa de API, ni navegación de negocio, ni componentes de dominio.
- No hay tests de frontend.
- `app.json` está con `userInterfaceStyle: "automatic"`; el diseño pide **light-first**.
- No hay fuentes propias cargadas ni tokens del design system implementados.

### 2.2 Backend

- Spring Boot 4.1.1, Java 21, H2 en archivo, JPA, DTOs, capas controller/service/repository.
- No hay JWT, no hay Spring Security, no hay autorización por roles y no hay CORS configurado.
- El login devuelve los datos del usuario, pero **no un token**.
- Las contraseñas se guardan en texto plano (decisión didáctica documentada en el README del backend).
- La base se recrea en cada arranque (`spring.sql.init.mode=always`): **los datos cargados se pierden al reiniciar el backend**.
- Datos iniciales: categorías, 3 repartidores y el usuario `admin` / `Admin2026!`. **No hay locales ni productos precargados.**
- No hay imágenes de productos/locales, ratings, horarios, tiempos estimados, mapas ni pagos.

### 2.3 Repositorio

- `main` está estable y limpio.
- El frontend vive en `isw2-gN1-app/sabores-frontend`.
- El plan y el diseño deben incorporarse al repositorio en la primera rama de documentación.

---

## 3. Contrato real del backend

Esta sección es la fuente de verdad para el frontend. Si una pantalla necesita un dato que no está acá, **no se inventa**: se resuelve con otro endpoint existente, con un estado vacío o se consulta al equipo de backend.

### 3.1 Configuración de la API

| Tema | Definición |
|---|---|
| Base URL | Configurable por `EXPO_PUBLIC_API_URL`; por defecto `http://localhost:8080`. |
| iOS Simulator | `http://localhost:8080`. |
| Android Emulator | `http://10.0.2.2:8080`. |
| Celular físico con Expo Go | `http://<IP-LAN-de-la-PC>:8080`; mismo Wi-Fi y puerto 8080 habilitado en el firewall. |
| Web | Solo funciona si el backend agrega CORS; en este plan se prioriza mobile nativo. |
| Headers | `Accept: application/json` y `Content-Type: application/json` cuando hay cuerpo. |
| Autenticación | **No hay token.** No enviar `Authorization`. La sesión del personal es solo estado de UI. |
| Fechas de ventas | `YYYY-MM-DD` en `desde` y `hasta`. |
| Fechas de respuesta | `LocalDateTime` ISO, por ejemplo `2026-10-29T14:30:00`. |
| Montos | Números JSON (`BigDecimal` serializado); se formatean en el cliente con `es-AR`, pero **no se recalculan como verdad final**. |
| Errores | Cuerpo `{ "mensaje": string, "detalles": string[] }`. |
| Paginación | No existe. Las listas llegan completas; usar `FlatList` y filtros locales. |
| Borrado | No existe `DELETE`. Locales, productos y usuarios se desactivan. |

### 3.2 Endpoints disponibles

| # | Método | Ruta | Cuerpo / parámetros | Respuesta | Códigos | Uso en la app |
|---|---|---|---|---|---|---|
| 1 | POST | `/api/auth/login` | `{ username, password }` | `{ id, username, nombreCompleto, rol }` | 200, 401, 400 | Login del personal. |
| 2 | GET | `/api/categorias` | — | `[{ id, nombre }]` | 200 | Picker de categoría en productos. |
| 3 | GET | `/api/locales` | — | `[{ id, nombre, direccion, telefono }]` | 200 | Home público; solo activos. |
| 4 | GET | `/api/locales/{id}/carta` | `id` entero | `{ localId, localNombre, categorias: [{ categoriaId, categoriaNombre, productos: [{ id, nombre, descripcion, precio, stock, disponible }] }] }` | 200, 404 | Carta del local; 404 si no existe o está inactivo. |
| 5 | GET | `/api/repartidores` | — | `[{ id, nombreCompleto, telefono }]` | 200 | Lista de repartidores activos; no incluye carga. |
| 6 | GET | `/api/locales/todos` | — | `[{ id, nombre, direccion, telefono, activo }]` | 200 | Catálogo admin; incluye inactivos. |
| 7 | POST | `/api/locales` | `{ nombre, direccion, telefono }` | `LocalAdminResponse` | 201, 400, 409 | Crear local. |
| 8 | PUT | `/api/locales/{id}` | `{ nombre, direccion, telefono }` | `LocalAdminResponse` | 200, 400, 404, 409 | Editar local. |
| 9 | PATCH | `/api/locales/{id}/activo` | `{ activo: boolean }` | `LocalAdminResponse` | 200, 400, 404 | Activar/desactivar local. |
| 10 | GET | `/api/productos?localId=` | `localId` opcional | `[{ id, localId, localNombre, categoriaId, categoriaNombre, nombre, descripcion, precio, stock, activo }]` | 200 | Catálogo admin; sin `localId` devuelve todos. |
| 11 | POST | `/api/productos` | `{ localId, categoriaId, nombre, descripcion, precio, stock }` | `ProductoAdminResponse` | 201, 400 | Crear producto; local/categoría inexistentes se informan como 400. |
| 12 | PUT | `/api/productos/{id}` | `{ localId, categoriaId, nombre, descripcion, precio, stock }` | `ProductoAdminResponse` | 200, 400, 404 | Editar producto. |
| 13 | PATCH | `/api/productos/{id}/activo` | `{ activo: boolean }` | `ProductoAdminResponse` | 200, 400, 404 | Activar/desactivar producto. |
| 14 | POST | `/api/pedidos` | `{ localId, direccionEntrega, cliente: { nombre, telefono }, items: [{ productoId, cantidad }] }` | `{ codigoSeguimiento, total, estado, fechaHora }` | 201, 400, 409, 500 | Crear pedido; **no devuelve `id` ni ítems**. |
| 15 | GET | `/api/pedidos/seguimiento/{codigo}` | Código de 8 caracteres | `{ codigoSeguimiento, estado, localNombre, items: [{ productoNombre, cantidad, precioUnitario }], total, fechaHora }` | 200, 404 | Seguimiento público; sin datos personales. |
| 16 | GET | `/api/pedidos?estado=` | `estado` opcional (`RECIBIDO`, `EN_PREPARACION`, `EN_CAMINO`, `ENTREGADO`, `CANCELADO`) | `[{ id, codigoSeguimiento, estado, localNombre, clienteNombre, fechaHora, total }]` | 200, 400 | Lista del personal. Sin filtro: solo no terminados. |
| 17 | GET | `/api/pedidos/{id}` | `id` entero | `PedidoDetalleResponse` (cliente, teléfono, dirección, local, repartidor, ítems, montos, fecha, estado) | 200, 404 | Detalle completo para personal. |
| 18 | PATCH | `/api/pedidos/{id}/avanzar` | `{ repartidorId }` solo al pasar a `EN_CAMINO`; en otras transiciones puede ir vacío | `PedidoDetalleResponse` | 200, 400, 404, 409 | Avanzar según el diagrama de estados. |
| 19 | PATCH | `/api/pedidos/{id}/cancelar` | — | `PedidoDetalleResponse` | 200, 404, 409 | Cancelar desde `RECIBIDO` o `EN_PREPARACION`. |
| 20 | GET | `/api/repartidores/en-calle` | — | `[{ repartidorId, nombreCompleto, cantidadPedidos, codigosPedidos }]` | 200 | En la calle y asignación; solo activos, incluye 0. |
| 21 | GET | `/api/ventas?desde=&hasta=` | Ambas fechas obligatorias `YYYY-MM-DD` | `[{ localId, localNombre, cantidadPedidos, montoVendido }]` | 200, 400 | Ventas por local; incluye locales con 0. |
| 22 | GET | `/api/usuarios` | — | `[{ id, username, nombreCompleto, rol, activo, fechaAlta }]` | 200 | Lista de usuarios. |
| 23 | POST | `/api/usuarios` | `{ username, password, nombreCompleto, rol }` | `UsuarioResponse` | 201, 400, 409 | Crear usuario. |
| 24 | PUT | `/api/usuarios/{id}` | `{ nombreCompleto, rol }` | `UsuarioResponse` | 200, 400, 404 | Editar nombre y rol; username no cambia. |
| 25 | PATCH | `/api/usuarios/{id}/password` | `{ password }` | `UsuarioResponse` | 200, 400, 404 | Cambiar contraseña. |
| 26 | PATCH | `/api/usuarios/{id}/activo` | `{ activo: boolean }` | `UsuarioResponse` | 200, 400, 404 | Activar/desactivar usuario. |

### 3.3 Códigos HTTP y errores

| Código | Cuándo aparece | Qué hacer en la UI |
|---|---|---|
| 200 | GET, PUT, PATCH correctos. | Actualizar estado con la respuesta. |
| 201 | POST de local, producto, usuario y pedido. | Navegar o refrescar; leer `Location` si hace falta. |
| 400 | Datos inválidos, campos faltantes, JSON malformado, fecha inválida, falta `repartidorId` al pasar a `EN_CAMINO`. | Mostrar errores por campo y el `mensaje`; corregir y reintentar. |
| 401 | Login con credenciales inválidas o usuario inactivo. | Mensaje genérico “Usuario o contraseña incorrectos.” |
| 403 | No lo devuelve el backend actual; se maneja por si se agrega autorización. | “No tenés permiso para esta acción.” |
| 404 | Local/carta/pedido/usuario inexistente; código de seguimiento inexistente. | Estado “No encontrado” con CTA de reintento o volver. |
| 409 | Regla de negocio: local/producto inactivo, producto de otro local, stock insuficiente, repartidor inactivo o con 3 pedidos, transición inválida, nombre duplicado, usuario duplicado. | Mostrar `mensaje`, refrescar datos y no reintentar automáticamente. |
| 500 | Error inesperado. | Mensaje genérico y opción de reintentar; no mostrar trazas. |

El backend devuelve siempre `mensaje` y `detalles` (normalmente vacío). El frontend debe usar `mensaje` como texto principal y reservar `detalles` para errores de formulario si el backend empieza a completarlo.

### 3.4 Reglas de negocio que la UI debe respetar

| Regla | Efecto en la interfaz |
|---|---|
| **RN-01** Productos del mismo local, activos, local activo. | El carrito queda atado a un local. Al cambiar de local, confirmar y vaciar. Si el local/producto se desactiva, el checkout falla con 409 y se refresca. |
| **RN-02** Cantidad ≤ stock. | Mostrar stock; limitar stepper; deshabilitar productos con `stock = 0` o `disponible = false`; ante 409, refrescar carta. |
| **RN-03** Repartidor activo y con menos de 3 pedidos `EN_CAMINO`. | En la asignación usar `/api/repartidores/en-calle`; mostrar carga `N/3`; deshabilitar `3/3`. |
| **RN-04** Cancelar solo desde `RECIBIDO` o `EN_PREPARACION`. | Mostrar “Cancelar pedido” solo en esos estados; confirmar que se repone stock. |
| **RN-05** Transiciones válidas. | Mostrar solo la próxima acción; no permitir saltear ni retroceder. |
| **RN-06** Precio del ítem al momento de pedir. | Mostrar `precioUnitario` del pedido, no el precio actual del producto. |
| **RN-07** Cliente por teléfono. | Checkout pide nombre, teléfono y dirección; no hay cuenta ni historial. El backend reutiliza el cliente por teléfono y **conserva el nombre original** si ya existía. |
| **RN-08** Código de 8 caracteres; seguimiento público sin datos personales. | Código en mayúsculas, copiable; el seguimiento muestra estado, local, ítems, total y fecha; nunca nombre, teléfono ni dirección. |
| **RN-09** Un admin no puede desactivarse ni quitarse el rol. | La UI deshabilita esos controles para el usuario logueado. **El backend actual no lo valida**; se documenta como brecha. |
| **RN-10** Locales, productos y usuarios se desactivan. | Switch de activo; no hay botón eliminar. Lo inactivo no se muestra al público. |
| **Cálculos** | Descuento 10 % solo si subtotal > $ 20.000; envío $ 1.500; total = subtotal − descuento + envío. La UI puede previsualizar, pero el total confirmado es el del backend. |
| **Estados finales** | `ENTREGADO` y `CANCELADO` no tienen acciones de avance ni cancelación. |
| **Ventas** | Solo `ENTREGADO`; monto = subtotal − descuento; no incluye envío; incluye locales con 0 ventas. |

### 3.5 Brechas entre las consignas y el backend actual

Estas brechas **no se resuelven en el frontend**. Se documentan para que el equipo no prometa comportamientos que la API no tiene.

| Tema | Consigna | Backend actual | Impacto en el frontend |
|---|---|---|---|
| Autenticación | JWT con 8 h de validez. | No hay token; el login devuelve solo los datos del usuario. | No enviar `Authorization`; la sesión es estado de UI. No implementar refresh token ni expiración. |
| Contraseñas | BCrypt. | Texto plano, según el README y los tests. | Nunca mostrar, loguear ni persistir contraseñas. |
| Autorización | 401 sin token, 403 sin rol. | Todos los endpoints están abiertos. | Las tabs y acciones por rol son solo UX; no son seguridad. |
| RN-09 | Un admin no puede desactivarse ni quitarse el rol. | No se valida: cualquier `PATCH` puede desactivar o cambiar el rol. | La UI deshabilita esos controles para el propio usuario, pero el backend puede hacerlo igual. |
| CORS | No es requisito mobile. | No hay CORS configurado. | La app nativa funciona; la versión web no, salvo que backend agregue CORS. |
| Imágenes | No están en los requerimientos. | No hay campo de imagen. | Usar monogramas/tiles por categoría; no inventar fotos. |
| Ratings, distancias, horarios, ETA | Fuera de alcance. | No existen. | No mostrarlos. |
| Locales/productos iniciales | La app debe permitir cargarlos. | La base arranca vacía. | Sembrar datos de prueba por H2 o por los endpoints de admin antes de probar el catálogo público. |
| Persistencia | H2 en archivo. | `spring.sql.init.mode=always` recrea la base al arrancar. | Los datos de demo se pierden al reiniciar; mantener el backend levantado durante la prueba o coordinar el cambio a `never`. |

### 3.6 Datos de prueba y arranque

- El backend se levanta con `mvnw.cmd spring-boot:run` en Windows o `./mvnw spring-boot:run` en Git Bash/Linux/macOS.
- Usuario inicial: `admin` / `Admin2026!`.
- Categorías: Pizzas, Hamburguesas, Empanadas, Bebidas, Postres.
- Repartidores: Carlos Benítez, Micaela Ortiz, Iván Paredes.
- No hay locales ni productos: para probar el flujo público hay que crearlos.
- Mientras no exista la UI de admin, crear los datos con H2 Console (`/h2-console`) o con una colección HTTP temporal (`POST /api/locales`, `POST /api/productos`). Esos datos **no se hardcodean en la app**.
- Datos mínimos recomendados para demo:
  - 2 locales activos.
  - 5–8 productos repartidos entre las 5 categorías, con al menos uno sin stock y uno con stock bajo.
  - 1 pedido de prueba para seguimiento y para el personal.
  - 1 operador además del admin.
- Para el seguimiento público, el código de 8 caracteres se obtiene de la confirmación o de `GET /api/pedidos`.

---

## 4. Estrategia de ramas

### 4.1 Reglas de trabajo

- `main` se mantiene estable y siempre ejecutable.
- Cada rama implementa **una funcionalidad vertical** y se integra con un Pull Request.
- No se mergea una rama que dependa de otra antes de que la base esté en `main`.
- Antes del PR, cada rama se actualiza con `main` (rebase o merge, según acuerde el equipo).
- Una rama no mezcla refactors grandes con funcionalidad nueva.
- Los tokens, componentes de UI y capa de API se tocan solo en `config-inicial`; después se reutilizan.
- Cada PR debe indicar: endpoints usados, reglas de negocio respetadas, pantallas afectadas, cómo probar y capturas en 320/390 pt.
- Cada PR debe pasar `npx expo lint` y `npx tsc --noEmit`.
- No se commitean secretos. `EXPO_PUBLIC_*` es público; no poner contraseñas ni claves ahí.

### 4.2 Nombres de ramas

| Tipo | Prefijo | Ejemplo |
|---|---|---|
| Documentación | `docs/` | `docs/plan-y-diseno` |
| Configuración inicial | `config-` | `config-inicial` |
| Funcionalidad | `feat/` | `feat/catalogo-publico` |
| Corrección | `fix/` | `fix/error-stock` |
| Calidad / pulido | `chore/` o `feat/` | `feat/calidad-final` |

### 4.3 Grafo de dependencias

```text
main
└─ config-inicial
   └─ feat/api-client
         ├─ feat/catalogo-publico
         │  └─ feat/carrito
         │     └─ feat/checkout-confirmacion
         ├─ feat/seguimiento-publico
         └─ feat/sesion-personal
            ├─ feat/gestion-pedidos
            │  └─ feat/despacho
            ├─ feat/admin-locales
            │  └─ feat/admin-productos
            ├─ feat/admin-ventas
            └─ feat/admin-usuarios

Después de integrar todo:
feat/calidad-final
docs/readme-demo
```

`feat/seguimiento-publico` puede desarrollarse en paralelo con el carrito, pero se integra después del checkout para probar con un código real. Las ramas de admin pueden ir en paralelo una vez mergeada `feat/sesion-personal`, siempre que no toquen los mismos archivos.

### 4.4 Orden de integración

| Orden | Rama | Base | Depende de |
|---|---|---|---|
| 0 | `docs/plan-y-diseno` | `main` | — (absorbida por `config-inicial`) |
| 1 | `config-inicial` | `main` | 0 (absorbe documentación y base visual) |
| 2 | `feat/api-client` | `config-inicial` | 1 |
| 3 | `feat/catalogo-publico` | `feat/api-client` | 2 |
| 4 | `feat/carrito` | `feat/catalogo-publico` | 3 |
| 5 | `feat/checkout-confirmacion` | `feat/carrito` | 4 |
| 6 | `feat/seguimiento-publico` | `feat/api-client` | 2 |
| 7 | `feat/sesion-personal` | `feat/api-client` | 2 |
| 8 | `feat/gestion-pedidos` | `feat/sesion-personal` | 7 |
| 9 | `feat/despacho` | `feat/gestion-pedidos` | 8 |
| 10 | `feat/admin-locales` | `feat/sesion-personal` | 7 |
| 11 | `feat/admin-productos` | `feat/admin-locales` | 10 |
| 12 | `feat/admin-ventas` | `feat/sesion-personal` | 7 |
| 13 | `feat/admin-usuarios` | `feat/sesion-personal` | 7 |
| 14 | `feat/calidad-final` | `main` con todo integrado | 3–13 |
| 15 | `docs/readme-demo` | `main` con todo integrado | 14 |

### 4.5 Mapa de conceptos de la materia

| Concepto visto | Dónde se aplica | Ramas |
|---|---|---|
| Componentes, JSX, `View`, `Text`, `Pressable`, `TextInput`, `ScrollView` | UI kit, pantallas, tarjetas, formularios. | 1, 3–13 |
| `StyleSheet`, Flexbox, props, composición, `children` | Tokens, layout, componentes reutilizables. | 1, 3–13 |
| `FlatList` / `SectionList` | Locales, carta, pedidos, repartidores, ventas, usuarios. | 3, 8, 9, 12, 13 |
| `useState` | Búsqueda, filtros, formularios, hojas, selección. | 3–13 |
| `useEffect` + `fetch` + `async/await` | Carga inicial, detalle por parámetro, refresco. | 2–13 |
| Los tres estados: cargando, error, datos | Todas las pantallas con API. | 2–13 |
| `useContext` | Carrito y sesión del personal. | 4, 7 |
| `useRef` | Foco del primer campo con error y referencias de input. | 5, 10–13 |
| Custom hooks | `useApi`, `useCart`, `useSession`, `useOrders`. | 2, 4, 7, 8 |
| `useMemo` / `useCallback` | Solo si una lista o búsqueda se vuelve costosa; no por defecto. | 3, 8, 12 |
| Navegación Stack / Tabs | Flujo público, detalle, área del personal y administración. | 1, 3–13 |
| Parámetros de navegación | `localId`, `pedidoId`, `codigo`, `productoId`. | 3, 5, 8, 9 |
| Formularios y validación | Checkout, locales, productos, usuarios, ventas. | 5, 10–13 |
| Consumo de API REST | Capa centralizada y pantallas. | 2–13 |

> **Navegación:** la materia muestra React Navigation (`createNativeStackNavigator`, `createBottomTabNavigator`). Este repositorio ya usa **Expo Router**, que es el estándar del template y lo exige `AGENTS.md`. No se instala React Navigation. Los conceptos se aplican con `_layout.tsx`, `Stack`, `Tabs`, `Link`, `router.push`, `useLocalSearchParams` y `useRouter`. La lógica es la misma: pila, tabs, parámetros y back.

---

## 5. Ramas, una por una

### Rama 00 — `docs/plan-y-diseno`

**Base:** `main`.

**Objetivo:** dejar el diseño y el plan dentro del repositorio, para que todas las ramas siguientes tengan una referencia única.

**Alcance:**
- Agregar `PLAN_FRONTEND.md` en la raíz del repositorio (este documento).
- Agregar `docs/DESIGN.md` (copia de la adaptación del design de Replit a Sabores del Litoral).
- Actualizar el README del frontend con propósito, stack, comandos y enlaces a los documentos.
- No tocar código de la app.

**Backend:** ninguno.

**Conceptos:** documentación y trazabilidad de decisiones.

**DoD:**
- Los documentos se leen sin referencias rotas.
- El README explica cómo levantar la app y cómo correr lint/typecheck.
- No hay secretos ni datos reales.

---

### Rama 01 — `config-inicial`

**Base:** `main` (absorbe la documentación de la rama 00).

**Objetivo:** dejar una base visual y de navegación coherente con el design system, sin lógica de negocio.

**Alcance:**
- Limpiar el template: eliminar pantallas y componentes de ejemplo que no se usan (`explore`, `themed-*`, badges de Expo, etc.).
- Configurar nombre, slug, scheme, splash e ícono de Sabores del Litoral.
- Forzar tema claro en v1 (`userInterfaceStyle: "light"`), con barra de estado oscura sobre crema.
- Implementar tokens de `DESIGN.md`: colores, tipografía, espaciado, radios, superficies y estados.
- Cargar las fuentes elegidas (DM Sans/Inter o la que se acuerde) con `expo-font` y ocultar el splash cuando estén listas.
- Crear la estructura de carpetas:
  - `src/app/` para rutas.
  - `src/components/ui/` para primitivas.
  - `src/features/` para componentes de dominio.
  - `src/lib/` para API, formato y utilidades.
  - `src/constants/` para tokens.
- Crear el esqueleto de navegación:
  - Tabs públicas: **Inicio**, **Seguir**, **Personal**.
  - Stack para detalle de local, carrito, checkout, confirmación y seguimiento.
  - Pantallas placeholder sin datos falsos.
- Crear primitivas reutilizables:
  - `Screen` con safe area y gutter.
  - `AppText` con variantes tipográficas.
  - `Button` (primario, secundario, ghost, destructivo, loading, disabled).
  - `IconButton`.
  - `TextField` con label, helper, error y foco.
  - `SearchField`.
  - `Card`.
  - `Chip`.
  - `Badge` / `StatusChip`.
  - `QuantityStepper`.
  - `BottomSheet`.
  - `EmptyState`.
  - `ErrorState`.
  - `Skeleton`.
  - `SectionHeader`.
  - `MoneyText`.
- Pantalla de galería de componentes solo para desarrollo, sin datos de negocio.

**Backend:** ninguno.

**Conceptos de la materia:** componentes, JSX, estilos con `StyleSheet`, Flexbox, props, composición, `children`, `Pressable`, `TextInput`, `ScrollView`.

**DoD:**
- La app corre en Expo Go y en emulador.
- No hay hex sueltos en pantallas; todo sale de tokens.
- La galería se ve bien en 320 y 390 pt.
- `npx expo lint` y `npx tsc --noEmit` pasan.
- No hay llamadas a la API todavía.

---

### Rama 02 — `feat/api-client`

**Base:** `config-inicial`.

**Objetivo:** tener una única capa de comunicación con el backend, tipada y con manejo de errores, antes de construir pantallas.

**Alcance:**
- Configurar `EXPO_PUBLIC_API_URL` y documentar las variantes por emulador/dispositivo.
- Crear el cliente HTTP:
  - URL base, `Accept`, `Content-Type`.
  - `fetch` con `AbortController` y timeout.
  - Parseo de JSON y de errores `{ mensaje, detalles }`.
  - Clase de error con `status`, `mensaje` y `detalles`.
  - Manejo de error de red separado del error HTTP.
  - Sin `Authorization`, porque el backend no usa token.
- Crear tipos TypeScript que reflejen exactamente los DTOs del backend:
  - `LoginResponse`, `LocalResponse`, `LocalAdminResponse`, `CartaResponse`, `CategoriaCartaResponse`, `ProductoCartaResponse`, `ProductoAdminResponse`, `PedidoCreadoResponse`, `SeguimientoResponse`, `PedidoResumenResponse`, `PedidoDetalleResponse`, `RepartidorEnCalleResponse`, `VentaLocalResponse`, `UsuarioResponse`, `ErrorResponse`.
  - Enums `EstadoPedido` y `Rol`.
- Crear un custom hook de consulta (`useApi` o equivalente) con:
  - `data`, `loading`, `error`, `refetch`.
  - `useEffect` con dependencias explícitas.
  - Cancelación al desmontar.
  - No usar hooks condicionales.
- Crear formateadores:
  - Moneda `es-AR` (`$ 12.500,00`).
  - Fecha/hora (`dd/mm/yyyy · HH:mm`).
  - Normalización de código de seguimiento (trim + mayúsculas).
  - Fecha `YYYY-MM-DD` para ventas.
- Centralizar las rutas de los endpoints.
- Agregar una colección HTTP de datos de prueba (`docs/http/seed-dev`) con los POST mínimos para crear locales y productos. No es código de la app.
- Pantalla temporal de diagnóstico que ejecute `GET /api/locales` y muestre loading/error/data. Se elimina o se deja fuera de producción al final de la rama.

**Backend:**
- `GET /api/locales` → 200 con array de locales activos.
- Error de red si el backend está apagado o la IP es incorrecta.
- Error 500 si ocurre algo inesperado.
- No hay token ni headers de autorización.

**Conceptos:** `fetch`, Promise, `async/await`, `useEffect`, `useState`, custom hooks, cleanup, estados de carga/error/datos.

**DoD:**
- La app puede llamar a `GET /api/locales` desde un celular físico con la IP correcta.
- Los errores muestran `mensaje`, no una traza.
- El hook cancela la petición al desmontar.
- No hay `any` en la capa de API.
- `npx expo lint` y `npx tsc --noEmit` pasan.

---

### Rama 03 — `feat/catalogo-publico`

**Base:** `feat/api-client`.

**Objetivo:** que el cliente vea los locales y la carta real.

**Alcance:**
- **Home / Locales**
  - `GET /api/locales` al montar.
  - Lista con `FlatList` de tarjetas de local: monograma, nombre, dirección, teléfono opcional y CTA “Ver carta”.
  - Buscador local por nombre (filtro en memoria; no hay endpoint de búsqueda).
  - Pull-to-refresh.
  - Estados: skeleton, error con reintento, vacío (“Todavía no hay locales disponibles”).
  - Navegación a la carta con `localId`.
- **Carta del local**
  - `GET /api/locales/{id}/carta` usando `localId` de `useLocalSearchParams`.
  - Header con nombre del local, dirección y teléfono.
  - `SectionList` por categoría.
  - Fila de producto: nombre, descripción a 2 líneas, precio, badge de stock y botón “Agregar”.
  - Si `disponible = false` o `stock = 0`: “Sin stock” y botón deshabilitado.
  - Pull-to-refresh para actualizar stock/precios.
  - Estados: skeleton, error, 404 (“Este local ya no está disponible”), vacío (“Este local todavía no cargó su carta”).
  - Botón “Agregar” sin lógica de carrito todavía: puede quedar deshabilitado o conectarse en la rama siguiente. La rama debe dejar el callback preparado.

**Backend:**
- `GET /api/locales` solo devuelve activos, ordenados por nombre.
- `GET /api/locales/{id}/carta` devuelve 404 si el local no existe o está inactivo.
- La carta solo incluye productos activos; `disponible` es `stock > 0`.
- No hay imágenes, ratings, horarios ni tiempos estimados.
- No usar `GET /api/categorias` en la carta: la respuesta ya trae las categorías agrupadas.

**Reglas:** RN-01, RN-02, RN-10 (productos inactivos no se muestran; local inactivo no se muestra).

**Conceptos:** `FlatList`, `SectionList`, `useState`, `useEffect`, navegación con parámetros, props, estados de carga/error/vacío.

**DoD:**
- Se ve el local creado en la base y su carta.
- Un local inactivo no aparece en Home; si se entra por URL directa, se ve el 404.
- Un producto sin stock se ve marcado y no se puede agregar.
- La búsqueda filtra solo los locales cargados.
- No hay datos hardcodeados.
- Funciona con backend real y datos sembrados.

**Nota de datos:** si la base está recién creada, no hay locales. Para probar esta rama, crear datos con H2 Console o con la colección HTTP de la rama 02. No hardcodear locales en la app.

---

### Rama 04 — `feat/carrito`

**Base:** `feat/catalogo-publico`.

**Objetivo:** armar el pedido localmente, respetando las reglas de stock y de un solo local.

**Alcance:**
- Contexto de carrito con `useContext` + `useState` (o `useReducer` si el equipo lo acuerda; la materia trabaja `useState`).
- Estado:
  - `localId` y `localNombre`.
  - Ítems: `productoId`, `nombre`, `precio`, `stock`, `cantidad`.
  - Cantidad total y subtotal estimado.
- Acciones:
  - Agregar producto.
  - Sumar/restar cantidad.
  - Quitar ítem.
  - Vaciar carrito.
  - Cambiar de local con confirmación.
- Reglas:
  - Solo productos del mismo local.
  - Cantidad mínima 1.
  - No superar stock.
  - No permitir productos sin stock.
- UI:
  - Botón “Agregar” que se transforma en stepper.
  - Barra sticky “Ver pedido” con cantidad y total estimado.
  - Hoja del carrito con ítems, steppers, subtotal, descuento, envío y total estimado.
  - Estado vacío.
  - Confirmación al vaciar o cambiar de local.
- Cálculo de previsualización:
  - Subtotal = suma de cantidad × precio.
  - Descuento = 10 % si subtotal > $ 20.000; exactamente $ 20.000 no descuenta.
  - Envío = $ 1.500.
  - Total = subtotal − descuento + envío.
  - Estos valores son **estimados**; el total final es el del backend.
- Tests unitarios de las funciones puras del carrito y de los cálculos, si el equipo incorpora un runner. Si no, tabla de casos manuales.

**Backend:** ninguno. El carrito es local.

**Reglas:** RN-01, RN-02, RN-06 (el precio se guarda para mostrar; el backend confirma el precio al crear), cálculos de descuento/envío/total.

**Conceptos:** `useState`, `useContext`, custom hook `useCart`, composición, eventos, listas.

**DoD:**
- Se agregan productos y el badge/stepper se actualiza.
- No se puede superar el stock.
- Al intentar agregar de otro local, aparece la confirmación y el carrito se vacía solo si el usuario acepta.
- El resumen estimado coincide con la regla de descuento y envío.
- El carrito no se pierde al navegar dentro de la app; si se reinicia la app, se vacía (v1 sin persistencia).
- No se envía nada al backend todavía.

---

### Rama 05 — `feat/checkout-confirmacion`

**Base:** `feat/carrito`.

**Objetivo:** crear el pedido real y mostrar el código de seguimiento.

**Alcance:**
- Pantalla de checkout:
  - Resumen del local y cantidad de ítems.
  - Formulario: nombre (máximo 80), teléfono (8–15 dígitos), dirección (máximo 150).
  - Validación inline y al enviar.
  - `KeyboardAvoidingView` + scroll.
  - CTA “Confirmar pedido” con loading y bloqueo de doble submit.
  - Aviso “No necesitás crear una cuenta. Guardá el código para seguir tu pedido.”
- Envío:
  - `POST /api/pedidos` con exactamente:
    - `localId`
    - `direccionEntrega`
    - `cliente: { nombre, telefono }`
    - `items: [{ productoId, cantidad }]`
  - **No enviar subtotal, descuento, envío ni total.** El backend los calcula.
  - No enviar `id` ni `codigoSeguimiento`.
- Manejo de respuesta:
  - 201: guardar `codigoSeguimiento`, `total`, `estado`, `fechaHora`.
  - La respuesta **no trae ítems, local ni id**. Para mostrar el resumen completo, usar el carrito local o consultar `GET /api/pedidos/seguimiento/{codigo}`.
  - Navegar a confirmación con el código.
- Confirmación:
  - Código de 8 caracteres en tarjeta oscura, copiable.
  - Total y estado `RECIBIDO`.
  - CTA “Seguir pedido” y “Volver al inicio”.
  - Vaciar el carrito solo cuando el pedido se creó correctamente.
- Errores:
  - 400: mostrar `mensaje` y errores por campo.
  - 409: stock insuficiente, producto/local inactivo, producto de otro local; refrescar carta y mostrar mensaje.
  - 500/red: mensaje genérico y reintento.
- Cliente:
  - Si el teléfono ya existe, el backend reutiliza el cliente y conserva el nombre original. No prometer que el nombre se actualiza.

**Backend:**
- `POST /api/pedidos` → 201; `Location: /api/pedidos/seguimiento/{codigo}`.
- Reglas RN-01, RN-02, RN-06, RN-07, RN-08.
- Descuento exacto: subtotal > $ 20.000.
- Envío fijo $ 1.500.
- Pedido nace en `RECIBIDO` con stock descontado.
- Código único de 8 caracteres alfanuméricos en mayúsculas.

**Conceptos:** formularios, `TextInput`, `useState`, validación, `useRef` para foco, `async/await`, manejo de errores, navegación.

**DoD:**
- Se crea un pedido con datos válidos y se recibe un código.
- El stock se descuenta y se verifica refrescando la carta.
- Un pedido con subtotal exacto de $ 20.000 no recibe descuento.
- Un pedido con subtotal mayor recibe 10 % de descuento.
- El envío es siempre $ 1.500.
- Un error de stock muestra el mensaje del backend y no deja el botón bloqueado.
- No se envían montos desde la app.
- El carrito se vacía solo tras el 201.

---

### Rama 06 — `feat/seguimiento-publico`

**Base:** `feat/api-client` (se integra después del checkout).

**Objetivo:** consultar un pedido por código sin exponer datos personales.

**Alcance:**
- Tab **Seguir** con:
  - Input de código de 8 caracteres, mayúsculas, `maxLength=8`.
  - Botón “Buscar pedido”.
  - Normalización: trim + mayúsculas.
  - Estados: inicial, cargando, error, 404, resultado.
- Resultado:
  - Código, chip de estado y timeline de 4 pasos.
  - Local, ítems (nombre, cantidad, precio unitario), total y fecha/hora.
  - Botón “Copiar código”.
  - Si el estado es `CANCELADO`, reemplazar la timeline por un bloque de cancelación.
- Navegación desde la confirmación: `/seguimiento?codigo=...` y búsqueda automática.
- Privacidad:
  - No mostrar nombre, teléfono ni dirección.
  - No mostrar datos que el endpoint público no devuelve.
- No inventar tiempos estimados ni GPS.

**Backend:**
- `GET /api/pedidos/seguimiento/{codigo}` → 200 con estado, local, ítems, total y fecha.
- Código inexistente o vacío → 404.
- El backend normaliza el código a mayúsculas; la UI también.

**Reglas:** RN-08 y privacidad pública.

**Conceptos:** `TextInput`, `useState`, `useEffect`, `fetch`, loading/error/data, navegación con parámetros.

**DoD:**
- Un código generado en checkout se consulta correctamente.
- Un código inexistente muestra 404 claro.
- No se ven datos personales.
- La timeline representa los 5 estados correctamente.
- Funciona sin login.

---

### Rama 07 — `feat/sesion-personal`

**Base:** `feat/api-client`.

**Objetivo:** permitir el ingreso del personal y mostrar la navegación según el rol.

**Alcance:**
- Pantalla de login:
  - Usuario y contraseña.
  - Mostrar/ocultar contraseña.
  - CTA “Ingresar” con loading.
  - Error genérico 401: “Usuario o contraseña incorrectos.”
  - Sin registro, sin recuperación, sin selector de rol.
- `POST /api/auth/login` con `{ username, password }`.
- Respuesta 200: `{ id, username, nombreCompleto, rol }`.
- Contexto de sesión:
  - `user`, `rol`, `login`, `logout`.
  - Guardar solo usuario, nombre y rol en memoria.
  - Nunca guardar contraseña.
  - No hay token: no enviar `Authorization`.
- Navegación:
  - Público: Inicio, Seguir, Personal.
  - Operador: Pedidos, En la calle, Cuenta.
  - Administrador: Pedidos, En la calle, **Gestión** (stack con Catálogo, Ventas y Usuarios) y Cuenta.
  - No superar 5 tabs; agrupar administración en “Gestión”.
- Logout con confirmación.
- Guardas de UI:
  - Ocultar tabs y acciones que el rol no puede usar.
  - Si se llega por deep link a una sección no permitida, mostrar “No tenés permiso para esta sección”.
  - Aclarar en el código/documentación que esto es UX, no seguridad: el backend actual no valida roles.

**Backend:**
- `POST /api/auth/login` → 200 o 401.
- Usuario inactivo → 401.
- No devuelve token ni contraseña.
- Todos los endpoints están abiertos; el frontend no debe asumir protección real.

**Reglas:** RF-01, roles de operador/admin, RN-09 (solo mitigación de UI).

**Conceptos:** `useState`, `useContext`, custom hook `useSession`, formularios, navegación condicional, `useEffect` si se hidrata sesión.

**DoD:**
- Admin y operador ingresan y ven tabs distintas.
- Credenciales incorrectas muestran 401 genérico.
- Logout vuelve al área pública.
- No se guarda ni muestra la contraseña.
- No se envía token inexistente.
- Queda documentada la brecha de autorización del backend.

---

### Rama 08 — `feat/gestion-pedidos`

**Base:** `feat/sesion-personal`.

**Objetivo:** que el personal vea los pedidos y su detalle completo, sin modificar nada todavía.

**Alcance:**
- Tab **Pedidos**:
  - `GET /api/pedidos` sin filtro = `RECIBIDO`, `EN_PREPARACION`, `EN_CAMINO` (no terminados), ordenados por fecha ascendente.
  - Filtros por estado: `?estado=RECIBIDO`, `EN_PREPARACION`, `EN_CAMINO`, `ENTREGADO`, `CANCELADO`.
  - No existe “todos” en un solo request; si se quiere “Todos”, se hacen las consultas necesarias o se omite.
  - Buscador por código sobre la lista cargada (no hay endpoint de búsqueda).
  - Tarjetas con código, estado, local, cliente, fecha, total y acción “Ver detalle”.
  - Pull-to-refresh.
  - Skeleton, error y vacío por filtro.
- Detalle:
  - `GET /api/pedidos/{id}`.
  - Mostrar cliente, teléfono, dirección, local, repartidor (si existe), ítems con cantidad/precio/subtotal, subtotal, descuento, envío, total y fecha.
  - Chip de estado y timeline.
  - Sin acciones de avance/cancelación en esta rama; se muestran deshabilitadas o se dejan para la siguiente.
- Orden:
  - El backend devuelve ascendente por fecha. Para operación, mostrar los más antiguos primero (FIFO) o indicar el orden; no invertir sin explicarlo.

**Backend:**
- `GET /api/pedidos?estado=` → 200; estado inválido → 400.
- `GET /api/pedidos/{id}` → 200/404.
- Los datos personales solo se muestran al personal; no reutilizar este DTO en el seguimiento público.

**Conceptos:** `FlatList`, `useState`, `useEffect`, filtros, navegación a detalle, estados, `useMemo` solo si la lista lo requiere.

**DoD:**
- Sin filtro se ven solo pedidos no terminados.
- Cada filtro devuelve el estado correcto.
- El detalle muestra todos los datos de contacto y montos.
- No hay mutaciones todavía.
- Los pedidos finales se ven al filtrarlos.
- No se muestran datos personales en pantallas públicas.

---

### Rama 09 — `feat/despacho`

**Base:** `feat/gestion-pedidos`.

**Objetivo:** operar el ciclo de vida del pedido y ver la calle.

**Alcance:**
- Detalle de pedido con acciones según estado:
  - `RECIBIDO`: “Pasar a preparación” → `PATCH /api/pedidos/{id}/avanzar` (cuerpo vacío o sin cuerpo).
  - `EN_PREPARACION`: “Asignar repartidor” → abrir hoja con `GET /api/repartidores/en-calle`; elegir uno con `cantidadPedidos < 3`; `PATCH /api/pedidos/{id}/avanzar` con `{ repartidorId }`.
  - `EN_CAMINO`: “Marcar entregado” → `PATCH /api/pedidos/{id}/avanzar` (cuerpo vacío o sin cuerpo).
  - `ENTREGADO` / `CANCELADO`: sin acciones.
  - “Cancelar pedido” solo en `RECIBIDO` y `EN_PREPARACION` → `PATCH /api/pedidos/{id}/cancelar`.
- Confirmaciones:
  - “Marcar entregado” y “Cancelar pedido” piden confirmación.
  - Cancelar explica que se repone el stock.
- Hoja de repartidores:
  - Lista activos, incluidos 0 pedidos.
  - Muestra `N/3`.
  - Deshabilita `3/3` con motivo “Carga completa”.
  - No hay teléfono en `/en-calle`; si se necesita, usar `/api/repartidores`, pero no es necesario para asignar.
- `PATCH` devuelve el detalle completo; usarlo para actualizar la pantalla sin un GET extra.
- Tras una mutación, refrescar la lista de pedidos y la pantalla de “En la calle”.
- Tab **En la calle**:
  - `GET /api/repartidores/en-calle`.
  - Tarjeta por repartidor con carga y códigos; tap en código → detalle.
  - Incluye repartidores con 0 pedidos.
- Errores:
  - 400 si falta `repartidorId` al pasar a `EN_CAMINO`.
  - 409 si repartidor inactivo, con 3 pedidos, o transición inválida.
  - 404 si el pedido o repartidor no existe.
  - Refrescar datos después del error.

**Backend:**
- `PATCH /api/pedidos/{id}/avanzar` es genérico: la UI debe decidir la acción según el estado actual y enviar `repartidorId` solo en `EN_PREPARACION → EN_CAMINO`.
- `PATCH /api/pedidos/{id}/cancelar` solo funciona en `RECIBIDO`/`EN_PREPARACION`.
- `/api/repartidores/en-calle` solo devuelve activos y calcula la carga real.
- Reglas RN-03, RN-04, RN-05.

**Conceptos:** eventos, `useState`, confirmaciones, hojas, navegación, actualización de estado con respuesta del servidor, manejo de errores.

**DoD:**
- Se recorre `RECIBIDO → EN_PREPARACION → EN_CAMINO → ENTREGADO`.
- No se puede pasar a `EN_CAMINO` sin repartidor.
- Un repartidor con 3 pedidos aparece deshabilitado y el backend rechaza el cuarto con 409.
- Cancelar desde `RECIBIDO`/`EN_PREPARACION` repone stock; desde `EN_CAMINO` no se ofrece y el backend devuelve 409 si se intenta.
- “En la calle” muestra todos los activos, incluidos los de 0.
- No se muestran acciones inválidas.
- No se permite doble submit.

---

### Rama 10 — `feat/admin-locales`

**Base:** `feat/sesion-personal`.

**Objetivo:** que el admin gestione los locales sin borrarlos.

**Alcance:**
- Tab **Gestión → Catálogo → Locales** solo para `ADMIN`.
- Lista:
  - `GET /api/locales/todos` (incluye inactivos).
  - Nombre, dirección, teléfono, chip “Activo/Inactivo”, switch y “Editar”.
  - Buscador local por nombre.
- Crear:
  - `POST /api/locales` con `{ nombre, direccion, telefono }`.
  - 201; refrescar lista.
- Editar:
  - `PUT /api/locales/{id}` con el mismo cuerpo.
  - 200; refrescar.
- Activar/desactivar:
  - `PATCH /api/locales/{id}/activo` con `{ activo }`.
  - Confirmación al desactivar: “No se mostrará más al público.”
- Validaciones de UI:
  - Nombre obligatorio, máximo 80.
  - Dirección máxima 120; teléfono máximo 15.
  - Dirección y teléfono opcionales; enviar `null` o cadena vacía según acuerde el equipo (el backend normaliza vacío a `null`).
  - Nombre duplicado → 409 “Ya existe un local con ese nombre”.
  - 400 con `mensaje` del backend.
- Sin botón “Eliminar”: no existe `DELETE`.

**Backend:**
- `GET /api/locales/todos` incluye activos e inactivos.
- `GET /api/locales` público solo activos.
- `POST` 201; `PUT` 200; `PATCH activo` 200.
- Reglas RN-10 y validaciones de locales.

**Conceptos:** formularios, `TextInput`, `useState`, `FlatList`, switch, validación, navegación, manejo de 400/409.

**DoD:**
- Se crea un local y aparece en el catálogo público.
- Se desactiva y desaparece del público, pero sigue en admin con badge “Inactivo”.
- Nombre duplicado muestra 409.
- No hay opción de eliminar.
- El switch refleja el estado real del backend.

---

### Rama 11 — `feat/admin-productos`

**Base:** `feat/admin-locales`.

**Objetivo:** que el admin gestione la carta de cada local.

**Alcance:**
- Tab **Gestión → Catálogo → Productos** solo para `ADMIN`.
- Filtro por local con `GET /api/locales/todos` (incluye inactivos) y lista con `GET /api/productos?localId=...`.
- Si no se elige local, no listar todo por accidente; el backend sin `localId` devuelve todos, pero la UI debe filtrar.
- Lista:
  - Nombre, local, categoría, precio, stock, chip “Activo/Inactivo”, switch y “Editar”.
  - Badge “Sin stock” si `stock = 0`.
- Crear:
  - `POST /api/productos` con `{ localId, categoriaId, nombre, descripcion, precio, stock }`.
- Editar:
  - `PUT /api/productos/{id}` con el mismo cuerpo.
- Activar/desactivar:
  - `PATCH /api/productos/{id}/activo` con `{ activo }`.
- Categorías:
  - `GET /api/categorias` para el picker; solo lectura, no CRUD.
- Validaciones:
  - Local, categoría, nombre, precio y stock obligatorios.
  - Precio y stock no negativos.
  - Nombre máximo 80; descripción máxima 200.
  - Mostrar `mensaje` del backend en 400/404.
- Nota de negocio:
  - Cambiar el precio no altera pedidos anteriores (RN-06).
  - Un producto inactivo no aparece en la carta pública.
  - Un producto con stock 0 se muestra marcado y no se puede pedir.
- Sin botón “Eliminar”.

**Backend:**
- `GET /api/productos?localId=` → 200.
- `POST` 201; `PUT` 200; `PATCH activo` 200.
- El backend valida local/categoría existentes, precio/stock no negativos y longitudes.
- `ProductoAdminResponse` incluye local y categoría; la carta pública no incluye la categoría por producto porque ya viene agrupada.

**Conceptos:** formularios, pickers, listas, `useState`, validación, manejo de errores, filtros.

**DoD:**
- Se crea un producto y aparece en la carta pública si el local y el producto están activos.
- Se desactiva y desaparece de la carta, pero sigue en admin.
- Stock 0 se muestra como “Sin stock” y no se puede agregar al carrito.
- El picker de categorías usa los 5 valores reales.
- No hay CRUD de categorías.
- No hay botón eliminar.

---

### Rama 12 — `feat/admin-ventas`

**Base:** `feat/sesion-personal`.

**Objetivo:** ver cuánto vendió cada local en un rango de fechas.

**Alcance:**
- Tab **Gestión → Ventas** solo para `ADMIN`.
- Filtros:
  - “Desde” y “Hasta” con fecha `YYYY-MM-DD`; ambos obligatorios.
  - Se puede prellenar “Hasta” con hoy y “Desde” con hoy o con el inicio del mes, pero siempre enviar ambos.
  - Si se usa date picker, agregarlo con `npx expo install` y la versión compatible con SDK 57; si no, usar inputs validados.
- Consulta:
  - `GET /api/ventas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD`.
  - 400 si falta una fecha, el formato es inválido o `desde > hasta`.
- Resultado:
  - Resumen general: cantidad de pedidos y monto vendido total.
  - Tarjetas por local con nombre, cantidad y monto.
  - Incluye locales con 0 ventas (el backend los devuelve).
  - Nota visible: “Solo pedidos entregados. El monto no incluye el envío.”
- Sin gráficos comparativos ni proyecciones: no hay datos históricos ni endpoint de series.
- Empty state si no hay locales o si la lista viene vacía.

**Backend:**
- Solo pedidos `ENTREGADO`.
- Rango inclusivo en ambos extremos (`hasta` se convierte en `hasta + 1 día` exclusivo).
- Monto = subtotal − descuento; no incluye envío.
- Devuelve todos los locales ordenados por nombre, incluso con 0.

**Conceptos:** formularios, fechas, `useState`, `useEffect`, listas, estados, formato de moneda.

**DoD:**
- El rango devuelve los pedidos entregados correctos.
- Un local sin ventas aparece con 0.
- El envío no se suma al monto vendido.
- Fechas inválidas muestran el error del backend.
- No se inventan comparaciones ni gráficos.

---

### Rama 13 — `feat/admin-usuarios`

**Base:** `feat/sesion-personal`.

**Objetivo:** administrar operadores y administradores.

**Alcance:**
- Tab **Gestión → Usuarios** solo para `ADMIN`.
- Lista:
  - `GET /api/usuarios`.
  - Nombre completo, username, chip de rol (`ADMIN`/`OPERADOR`), switch activo, “Editar”.
- Crear:
  - `POST /api/usuarios` con `{ username, password, nombreCompleto, rol }`.
  - 201; refrescar.
- Editar:
  - `PUT /api/usuarios/{id}` con `{ nombreCompleto, rol }`.
  - El username no se puede cambiar.
- Cambiar contraseña:
  - `PATCH /api/usuarios/{id}/password` con `{ password }`.
  - Validar 8–60 caracteres.
  - No mostrar la contraseña actual.
- Activar/desactivar:
  - `PATCH /api/usuarios/{id}/activo` con `{ activo }`.
  - Confirmación.
- Reglas de UI:
  - Username único; 409 si se repite.
  - Contraseña mínimo 8.
  - Roles solo `ADMIN` y `OPERADOR`.
  - No hay eliminación física.
  - Para el propio usuario logueado: deshabilitar el switch de activo y el cambio a `OPERADOR`; mostrar helper “No podés desactivar tu propio usuario ni quitarte el rol de administrador”.
  - **Importante:** el backend actual no valida RN-09. La UI mitiga, pero no garantiza; documentarlo en el PR y en el README.
- No mostrar ni loguear contraseñas.
- Probar el login con el usuario creado y con la contraseña cambiada.

**Backend:**
- `GET`, `POST`, `PUT`, `PATCH password`, `PATCH activo`.
- No hay token ni autorización; el frontend no debe asumir seguridad.
- Las respuestas nunca incluyen contraseña.
- El username no se actualiza en `PUT`.

**Conceptos:** formularios, listas, switches, validación, roles, manejo de 400/409, estado de sesión.

**DoD:**
- Se crea un usuario y puede loguearse.
- Se cambia la contraseña y el login viejo falla, el nuevo funciona.
- Se desactiva y no puede ingresar.
- El username no se edita.
- No se muestra la contraseña.
- El usuario admin no puede desactivarse a sí mismo desde la UI.
- Queda documentada la brecha de RN-09 en el backend.

---

### Rama 14 — `feat/calidad-final`

**Base:** `main` con todas las ramas anteriores integradas.

**Objetivo:** dejar la app presentable, accesible y estable para la defensa.

**Alcance:**
- Revisar todas las pantallas con:
  - Skeleton de carga.
  - Estado de error con reintento.
  - Estado vacío.
  - Pull-to-refresh donde corresponda.
- Accesibilidad:
  - Labels en iconos y acciones.
  - Targets de 44 pt.
  - Contraste AA.
  - Tipografía escalable.
  - Estados que no dependan solo del color.
  - Teclado y foco.
- Responsive:
  - 320, 360, 390 y tablet.
  - Safe areas, notch, home indicator.
  - Landscape sin cortar CTA.
- Rendimiento:
  - `FlatList`/`SectionList` con `keyExtractor`.
  - Evitar renders innecesarios.
  - `useMemo`/`useCallback` solo donde se mida un problema.
  - Imágenes/monogramas sin bloquear.
- Consistencia:
  - Tokens, copy, formato de moneda/fecha, chips de estado.
  - No hex sueltos.
  - No datos falsos.
  - No pantallas de desarrollo visibles.
- Configuración:
  - Tema claro forzado.
  - Splash e ícono definitivos.
  - `EXPO_PUBLIC_API_URL` documentada.
- Pruebas manuales completas (ver sección 6).
- Opcional: tests unitarios de funciones puras y de estados; si se agrega Jest/RNTL, acordarlo y no bloquear la entrega por ello.

**Backend:** ninguno; solo pruebas end-to-end.

**DoD:**
- `npx expo lint`, `npx tsc --noEmit` y `npx expo-doctor` pasan.
- No hay errores en consola en el flujo principal.
- Todos los estados de error están cubiertos.
- La app se ve bien en un teléfono real y en emulador.
- El flujo completo se puede demostrar sin tocar la base a mano, salvo la carga inicial de datos.

---

### Rama 15 — `docs/readme-demo`

**Base:** `main` con todo integrado.

**Objetivo:** que cualquier integrante o docente pueda levantar y probar el sistema desde cero.

**Alcance:**
- README del frontend:
  - Requisitos (Node LTS, Expo, backend).
  - Cómo levantar el backend y la app.
  - Configuración de `EXPO_PUBLIC_API_URL` para emulador, simulador y celular físico.
  - Cómo sembrar datos de demo (H2 o endpoints).
  - Usuario admin y operador de prueba.
  - Flujo de demo público, personal y admin.
  - Script de prueba manual.
  - Limitaciones y brechas conocidas del backend:
    - Sin JWT/token.
    - Sin roles enforced.
    - Sin BCrypt.
    - Sin RN-09 enforced.
    - Sin CORS para web.
    - Base recreada en cada arranque.
    - Sin imágenes/ratings/ETA/mapas.
  - Enlaces a `docs/DESIGN.md` y `docs/PLAN_FRONTEND.md`.
- Capturas de las pantallas principales.
- Checklist de entrega.

**Backend:** ninguno.

**DoD:**
- Una persona externa puede levantar backend + frontend siguiendo el README.
- El flujo de demo funciona sin explicaciones adicionales.
- Las brechas están documentadas con honestidad.

---

## 6. Pruebas manuales end-to-end

### 6.1 Preparación

1. Levantar el backend.
2. Confirmar `GET /api/locales` (puede devolver lista vacía).
3. Crear datos de demo: 2 locales, productos en las 5 categorías, un producto sin stock, un producto con stock bajo, un operador.
4. Configurar la app con la URL correcta según el dispositivo.
5. Levantar Expo y abrir en Expo Go o emulador.

### 6.2 Flujo público

1. Home muestra los locales activos.
2. Buscar un local; el filtro funciona.
3. Entrar a la carta; se ven categorías y productos.
4. Producto sin stock: marcado y no se puede agregar.
5. Agregar productos; la barra sticky muestra cantidad y total estimado.
6. Intentar agregar de otro local: aparece la confirmación.
7. Carrito: steppers, subtotal, descuento (si aplica), envío y total.
8. Checkout: probar campos vacíos, teléfono inválido y dirección larga.
9. Confirmar pedido válido: 201, código y total del backend.
10. Verificar que el stock bajó en la carta.
11. Seguir el pedido con el código: estado, local, ítems, total y fecha; sin datos personales.
12. Código inexistente: 404 claro.

### 6.3 Flujo del personal

1. Login con admin: tabs correctas.
2. Login con operador: no ve Catálogo/Ventas/Usuarios.
3. Credenciales incorrectas: 401 genérico.
4. Pedidos: sin filtro se ven los no terminados; filtros por estado.
5. Detalle: cliente, teléfono, dirección, ítems y montos.
6. Avanzar `RECIBIDO → EN_PREPARACION`.
7. Asignar repartidor con carga < 3 → `EN_CAMINO`.
8. Intentar asignar un repartidor con 3 pedidos: deshabilitado en UI; si se fuerza, 409.
9. “En la calle”: repartidores activos, incluidos 0, con códigos.
10. Marcar entregado → `ENTREGADO`.
11. Cancelar un pedido en `RECIBIDO`/`EN_PREPARACION` y verificar reposición de stock.
12. Intentar cancelar en `EN_CAMINO`: no se ofrece; si se fuerza, 409.
13. Verificar que un pedido final no tiene acciones.

### 6.4 Flujo de administración

1. Catálogo → Locales: crear, editar, desactivar; verificar que desaparece del público.
2. Nombre duplicado: 409.
3. Catálogo → Productos: crear, editar, desactivar; verificar carta pública.
4. Precio/stock negativos: 400.
5. Stock 0: “Sin stock” en la carta.
6. Cambiar el precio de un producto y verificar que un pedido anterior conserva su precio.
7. Ventas: rango con pedidos entregados, rango sin ventas, rango inválido.
8. Verificar que el monto vendido no incluye envío.
9. Usuarios: crear, editar, cambiar contraseña, desactivar, login.
10. Verificar que el admin no puede desactivarse a sí mismo desde la UI.
11. Verificar que no hay botones de eliminar en locales, productos ni usuarios.

### 6.5 Errores y red

1. Apagar el backend: las pantallas muestran error de red y reintento.
2. Backend lento: se ve skeleton/loading, no pantalla congelada.
3. 409 de stock: mensaje del backend y refresco.
4. 404 de local/carta/pedido/código: estado claro.
5. 401 de login: mensaje genérico.
6. 500: mensaje genérico, sin trazas.
7. Teclado abierto en checkout: el CTA no queda tapado.
8. Fuente grande: no se cortan totales ni códigos.
9. Modo oscuro del sistema: la app sigue en claro (v1).

---

## 7. Riesgos y decisiones abiertas

| Tema | Riesgo | Decisión del plan |
|---|---|---|
| Auth real | El backend no tiene JWT ni roles enforced. | No simular seguridad. La sesión es UX; documentar la brecha y no prometer protección. |
| RN-09 | El backend permite desactivar al propio admin. | Mitigar en UI; documentar. Si se corrige, hacerlo en backend, no en frontend. |
| Contraseñas | Texto plano en backend. | Nunca mostrarlas ni loguearlas; no persistirlas. |
| CORS | La app web no funcionará si no se agrega. | Priorizar mobile nativo; si se necesita web, backend debe agregar CORS. |
| Base vacía | No hay locales/productos iniciales. | Sembrar datos de demo con H2/HTTP; no hardcodear. |
| Reset de base | `spring.sql.init.mode=always` borra datos al reiniciar. | Mantener backend levantado durante la demo o coordinar cambio a `never`. |
| Cálculos locales | La previsualización del carrito puede diferir del backend si cambia un precio. | Mostrar “estimado”; el total final es el del backend; refrescar carta antes de checkout si es necesario. |
| `POST /api/pedidos` sin `id`/ítems | La confirmación no recibe el detalle completo. | Usar el carrito local o consultar seguimiento por código. |
| Lista de pedidos ascendente | El backend ordena por fecha ascendente. | Mostrar los más antiguos primero (FIFO) o indicar el orden; no invertir sin explicación. |
| Sin búsqueda server-side | No hay endpoint de búsqueda. | Filtrar en memoria sobre listas cargadas; no prometer búsqueda global. |
| Sin paginación | Las listas llegan completas. | `FlatList` y filtros locales; no inventar paginación. |
| Sin imágenes | No hay campo de imagen. | Monogramas/tiles por categoría. |
| Fechas de ventas | El backend exige ambas fechas. | La UI siempre envía `desde` y `hasta`; validar formato y orden. |
| Admin con muchas secciones | No conviene superar 5 tabs. | Agrupar Catálogo, Ventas y Usuarios en **Gestión**. |
| Persistencia del carrito | No hay storage instalado. | Carrito en memoria en v1; si se persiste, solo datos no sensibles y acordar dependencia. |
| Fechas/date picker | Dependencia extra. | Usar date picker compatible con SDK 57 o inputs `YYYY-MM-DD` validados. |

---

## 8. Checklist de Pull Request

Cada PR debe incluir:

- [ ] Rama con nombre `docs/`, `chore/`, `feat/` o `fix/`.
- [ ] Base correcta y actualizada con `main`.
- [ ] Alcance de una sola funcionalidad.
- [ ] Endpoints usados y contrato respetado.
- [ ] Reglas de negocio impactadas.
- [ ] Estados de carga, error y vacío.
- [ ] Sin datos hardcodeados ni fake data.
- [ ] Sin `DELETE` ni acciones que el backend no tenga.
- [ ] Sin `Authorization` ni suposición de token.
- [ ] Sin contraseñas en logs, estado persistido o UI.
- [ ] Targets de 44 pt y contraste AA en lo tocado.
- [ ] Probado en 320 y 390 pt.
- [ ] `npx expo lint` y `npx tsc --noEmit` pasan.
- [ ] Probado contra el backend real.
- [ ] Capturas o video corto del flujo.
- [ ] README/docs actualizados si cambia el contrato o la configuración.
- [ ] Sin secretos en el repo.

---

## 9. Criterio de éxito final

El frontend se considera terminado cuando:

1. Un cliente puede pedir sin registrarse desde el celular y recibe un código.
2. Puede seguir el pedido por código sin ver datos personales.
3. Un operador puede ver, preparar, despachar, entregar y cancelar pedidos según las reglas.
4. Un administrador puede gestionar locales, productos, ventas y usuarios sin eliminar registros.
5. Todas las pantallas consumen el backend real, con los endpoints y códigos correctos.
6. No hay datos inventados ni acciones que el backend no soporte.
7. La app se ve y se usa bien en mobile, con estados de carga/error/vacío y accesibilidad básica.
8. Las brechas del backend están documentadas y no se presentan como resueltas.
