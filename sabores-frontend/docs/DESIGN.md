# Sabores del Litoral — Design System mobile

> cocina cálida, acentos coral, pedidos sin fricción

**Producto:** app móvil de delivery para Sabores del Litoral.
**Inspiración:** la referencia visual de Replit (“warm workshop with coral sparks”), reinterpretada para una app de pedidos, operación y administración.
**Stack:** Expo SDK 57 / React Native + API REST Spring Boot.
**Tema:** light-first.
**Roles:** Público (cliente invitado), Operador y Administrador.
**Ubicación:** `isw2-gN1-app/sabores-frontend`.

Este documento no es una copia de la web de Replit. Es un sistema mobile propio, pensado para que una persona pida desde el celular sin registrarse y para que el personal despache pedidos sin ambigüedad. El backend ya existe y es la fuente de verdad: la interfaz muestra, guía y confirma; no inventa datos, no calcula totales definitivos y no promete tiempos que el sistema no conoce.

---

## 1. Norte del producto

Sabores del Litoral tiene dos velocidades:

- **La del cliente:** quiere encontrar un local, armar un pedido, dejar sus datos y recibir un código. Tiene que ser rápido, cálido y comprensible en una sola mano.
- **La del personal:** necesita leer el estado de un pedido, saber cuál es la próxima acción válida y no equivocarse. Tiene que ser clara, compacta y difícil de operar mal.

La estética toma lo mejor de la referencia —fondo crema, naranja vivo, tarjetas grandes, tipografía editorial con tracking ajustado, bordes finos en lugar de sombras— y lo adapta a una interfaz táctil: más contraste, targets de 44 pt, estados explícitos y componentes que caben en un teléfono.

**La app no es una landing page.** Es una herramienta de uso diario: se abre, se pide, se consulta o se despacha. La calidez tiene que ayudar a la tarea, nunca decorarla de más.

---

## 2. Principios de diseño

1. **Un próximo paso obvio por pantalla.** Cada pantalla tiene una acción principal. El resto son acciones secundarias o destructivas, visualmente subordinadas.
2. **El pedido siempre a mano.** El carrito vive en una barra inferior persistente y en una hoja de resumen; nunca obliga a buscar el total en otra pantalla.
3. **Calidez con jerarquía.** El crema y el coral dan identidad, pero la tipografía y el espacio hacen el trabajo de ordenar. El naranja se usa poco y con intención.
4. **Datos reales, estados honestos.** No hay ratings, fotos, tiempos estimados, distancias ni horarios si el backend no los devuelve. Se muestra lo que existe.
5. **La operación no adivina.** El estado actual y la próxima transición válida se leen de un vistazo. Las acciones imposibles no se muestran o se explican.
6. **Mobile-first y accesible por defecto.** Zona del pulgar, safe areas, teclado, tipografía escalable, contraste AA y estados que no dependen solo del color.

---

## 3. Dirección visual

- **Base:** 70 % crema/blanco, 20 % neutros cálidos, 10 % coral/naranja.
- **Forma:** esquinas generosas, botones tipo píldora, tarjetas de 20–28 pt de radio.
- **Estructura:** bordes hairline de 1 px y contraste de superficies. Sin sombras decorativas.
- **Tipografía:** títulos grandes con tracking negativo; cuerpo cómodo; precios y códigos con números tabulares.
- **Acento:** el naranja Ember es la firma. No se usa como fondo de pantalla completa ni como texto pequeño sobre blanco.
- **Textura:** cocina cálida y ordenada, no infantil. Sin ilustraciones recargadas, sin emojis, sin stock photos de personas.
- **Personal:** el área del personal comparte el mismo sistema, pero sube la densidad y baja la decoración. Menos aire, más información accionable.

---

## 4. Tokens — Color

Los valores son tokens de diseño. En React Native se implementan en `src/constants/theme.ts`; los componentes no deben usar hex sueltos.

| Rol | Token | Hex | Uso |
|---|---|---|---|
| Ember Orange | `ember` | `#FF3C00` | Marca, iconos activos, foco, indicador de tab, superficies destacadas. No usar como texto pequeño sobre blanco. |
| Burnt Rust | `burnt` | `#EC4E02` | Estado presionado, fin de gradiente, bordes de énfasis. |
| Action Orange | `action` | `#D92F00` | Relleno cuando se necesita texto blanco con contraste AA (4.8:1). |
| Sunset Coral | `coral` | `#FF764C` | Tarjetas feature, gradientes cálidos, superficies de energía. |
| Peach Blush | `peach` | `#FFB199` | Tarjetas suaves, monogramas, lavados de sección. |
| Warm Canvas | `canvas` | `#FAF6F1` | Fondo principal de la app y de las pantallas. |
| Pure White | `white` | `#FFFFFF` | Tarjetas, inputs, hojas, barras elevadas. |
| Ink Black | `ink` | `#0E0E0F` | Texto principal, bordes fuertes, texto sobre Ember. |
| Charcoal | `charcoal` | `#312E2E` | Bordes de tarjeta, títulos secundarios. |
| Slate | `slate` | `#36373B` | Etiquetas de navegación, énfasis de cuerpo. |
| Pewter | `pewter` | `#52545A` | Cuerpo de texto, descripciones. |
| Warm Gray | `warmGray` | `#6B6664` | Texto auxiliar y metadatos. Contraste AA sobre crema. |
| Stone | `stone` | `#898C94` | Placeholder, iconos inactivos, texto no esencial. No usar para información crítica. |
| Sand | `sand` | `#DFDDD8` | Bordes, divisores, inputs en reposo. |
| Driftwood | `driftwood` | `#CBC7C3` | Rellenos sutiles, bordes muy suaves. |
| Fog | `fog` | `#EFEFEF` | Superficie alternativa, skeleton, chip neutro. |
| Dark Surface | `dark` | `#1A1919` | Tarjeta del código de seguimiento, toasts, previews oscuros. |
| Success Green | `success` | `#1E7A4D` | ENTREGADO, stock disponible, confirmaciones. |
| Info Blue | `info` | `#1D6FD1` | EN_CAMINO, enlaces e información. |
| Warning Amber | `warning` | `#9A5B00` | EN_PREPARACION, stock bajo, advertencias. |
| Danger Red | `danger` | `#B42318` | CANCELADO, errores, acciones destructivas. |

### Superficies semánticas

| Superficie | Fondo | Texto/icono | Uso |
|---|---|---|---|
| Éxito suave | `#E8F5EE` | `success` | Stock disponible, pedido entregado, confirmación. |
| Info suave | `#E8F2FF` | `info` | Pedido en camino, ayuda contextual. |
| Advertencia suave | `#FFF3E0` | `warning` | Pedido en preparación, stock bajo. |
| Peligro suave | `#FDECEA` | `danger` | Cancelado, error, acción destructiva. |
| Neutro suave | `#EFEFEF` | `slate` | Recibido, estados sin color semántico. |

### Estados del pedido

Siempre **icono + texto + color**. El color nunca es la única señal.

| Estado | Fondo | Texto/icono | Etiqueta visible |
|---|---|---|---|
| `RECIBIDO` | `fog` | `slate` | Recibido |
| `EN_PREPARACION` | `#FFF3E0` | `warning` | En preparación |
| `EN_CAMINO` | `#E8F2FF` | `info` | En camino |
| `ENTREGADO` | `#E8F5EE` | `success` | Entregado |
| `CANCELADO` | `#FDECEA` | `danger` | Cancelado |

### Reglas de color

- **No usar azul para CTAs.** El naranja Ember es el color de acción; el azul solo comunica información o EN_CAMINO.
- **No usar verde para CTAs generales.** Verde es éxito/estado, no “siguiente”.
- **No usar rojo como decoración.** Rojo es peligro/cancelación.
- **CTA principal:** fondo `ember` con texto `ink` (contraste 5.42:1). Si se necesita texto blanco, usar `action` como fondo, nunca `ember`.
- **Texto sobre coral/peach:** usar `ink` o `charcoal`, no blanco.
- **Deshabilitado:** fondo `fog`, texto `stone`, sin borde de foco.
- **Foco:** anillo de 2 pt `ember` con offset de 2 pt; visible en web y con teclado externo.

---

## 5. Tokens — Tipografía

### Familias

- **Display / títulos:** **DM Sans** o **Geist**. Pesos 400, 500, 600. Tracking negativo.
- **Cuerpo / UI:** **Inter**. Pesos 400, 500, 600.
- **Fallback:** `system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, `sans-serif`.
- **Números:** Inter con `fontVariant: ['tabular-nums']` para precios, totales, cantidades y códigos.

La referencia usa ABC Diatype; DM Sans + Inter son sustitutos cercanos y gratuitos. Si el equipo decide usar una sola familia para simplificar, **Inter en todo** es aceptable, manteniendo los pesos y el tracking.

### Escala mobile

| Rol | Tamaño / línea | Peso | Tracking | Uso |
|---|---|---|---|---|
| `display` | 36 / 40 | 500 | -0.04em | Bienvenida, hero de Home, confirmación. |
| `h1` | 32 / 36 | 500 | -0.03em | Título de pantalla principal. |
| `h2` | 24 / 28 | 500 | -0.02em | Sección, nombre de local. |
| `h3` | 20 / 24 | 500 | -0.02em | Título de tarjeta, producto destacado. |
| `price-lg` | 28 / 32 | 600 | -0.02em | Total, código de seguimiento. |
| `body-lg` | 17 / 26 | 400 | 0 | Descripción principal, intro. |
| `body` | 15 / 22 | 400 | 0 | Texto general. |
| `label` | 14 / 20 | 500 | 0 | Botones, labels de formulario, tabs. |
| `caption` | 12 / 16 | 400 | 0 | Metadatos, ayuda, fechas. |
| `overline` | 11 / 14 | 600 | +0.08em | Eyebrow, categoría, estado en mayúsculas. |
| `code` | 18 / 24 | 600 | +0.18em | Código de seguimiento. |

### Reglas tipográficas

- No usar pesos 700+; la personalidad viene de 400–600 con tracking ajustado.
- No usar itálica decorativa.
- No usar mayúsculas en textos largos; solo en `overline`, códigos y badges.
- Máximo dos pesos por pantalla, salvo precios y énfasis puntual.
- Permitir escalado de fuente hasta 130–150 %. Evitar alturas fijas en textos críticos.
- Truncar descripciones a 2 líneas en tarjetas; el detalle completo vive en la hoja del producto o en la pantalla de carta.
- Los montos se formatean con `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`: `$ 12.500,00`.

---

## 6. Espaciado, layout y formas

### Base

- Unidad base: **4 pt**.
- Ritmo principal: **8 pt**.
- Pantalla de referencia: **390 × 844 pt** (iPhone 14/15). Diseñar primero para **320 pt** de ancho mínimo.

### Escala de espaciado

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4 | Separación mínima, gap de icono. |
| `space-2` | 8 | Gap interno de chips, badges. |
| `space-3` | 12 | Gap entre elementos de una tarjeta. |
| `space-4` | 16 | Padding de tarjeta compacta, gap de lista. |
| `space-5` | 20 | Gutter de pantalla, padding de tarjeta. |
| `space-6` | 24 | Separación de secciones. |
| `space-7` | 32 | Sección grande, padding de hero. |
| `space-8` | 40 | Hero, separación editorial. |
| `space-9` | 48 | Pantallas de confirmación/estado. |
| `space-10` | 64 | Aire en estados vacíos. |

### Layout

- **Gutter lateral:** 20 pt (16 pt en pantallas ≤ 340 pt).
- **Separación entre secciones:** 24–32 pt.
- **Separación entre tarjetas:** 12 pt.
- **Padding de tarjeta:** 16 pt; 20 pt en tarjetas grandes.
- **Padding de hoja inferior:** 20 pt + safe area inferior.
- **Ancho máximo de contenido:** 560 pt en tablet/web; en teléfono, full width.
- **Tab bar:** 56 pt + safe area inferior.
- **Sticky cart bar:** 72 pt + safe area inferior.
- **Contenido de listas:** padding inferior de al menos 96 pt para no quedar debajo de la barra del carrito y la tab bar.
- **Área táctil mínima:** 44 × 44 pt, aunque el icono sea de 20–24 pt.

### Radios

| Elemento | Radio |
|---|---|
| Botones y chips | 999 pt (píldora) |
| Inputs y buscador | 14 pt |
| Tarjetas estándar | 20 pt |
| Tarjetas feature / hero | 28 pt |
| Hoja inferior (top) | 28 pt |
| Badges | 999 pt |
| Tiles de imagen / monograma | 16–20 pt |
| Tab bar | 0 pt, full width con borde superior |

### Elevación

El sistema evita sombras decorativas. La profundidad se comunica con:

- borde de 1 pt `sand` o `charcoal`;
- cambio de superficie (`canvas` → `white` → `peach`/`coral`);
- separadores hairline.

Se permite **una sombra funcional** únicamente en:

- hoja inferior: `0 8 24 rgba(14, 14, 15, 0.12)`;
- toast: `0 6 16 rgba(14, 14, 15, 0.16)`.

Nunca usar sombras en tarjetas de producto, botones o listas.

---

## 7. Navegación

Usar **Expo Router**. Las rutas viven en `src/app/`; los componentes reutilizables, fuera de `src/app/`.

### Área pública

Tabs inferiores:

| Tab | Icono | Pantalla |
|---|---|---|
| **Inicio** | local/tienda | Lista de locales adheridos. |
| **Seguir** | código/lupa | Consulta pública por código de seguimiento. |
| **Personal** | usuario | Acceso discreto para operadores y administradores. |

El **carrito no es una tab**. Se accede desde la barra inferior persistente o desde el botón del local. El flujo es:

```
Inicio → Carta del local → Carrito → Checkout → Confirmación → Seguimiento
```

### Área del personal

Después del login, reemplazar las tabs públicas por:

| Tab | Operador | Administrador |
|---|---|---|
| **Pedidos** | Sí | Sí |
| **En la calle** | Sí | Sí |
| **Gestión** | No | Sí — stack con Catálogo, Ventas y Usuarios |
| **Cuenta** | Sí | Sí |

No superar 5 tabs inferiores. La administración se agrupa en **Gestión** para no llenar la tab bar de secciones poco frecuentes.

El login no tiene selector de rol: el rol lo devuelve el backend. Si un operador intenta entrar a una sección de administrador, no mostrar la tab y, si llega por deep link, mostrar un estado “No tenés permiso para esta sección”. Esto es gating de UI: el backend actual no valida roles ni tokens.

### Reglas de navegación

- La tab activa se marca con icono y label en `ember`; inactiva en `stone`.
- La tab bar es blanca, con borde superior `sand`; no flotante, no con blur.
- Los títulos raíz usan `h1`; las pantallas de detalle usan header compacto con back.
- El botón back de Android y el gesto de iOS deben funcionar siempre.
- Las hojas inferiores se cierran con swipe hacia abajo, botón de cierre y tap en el backdrop.
- El carrito se conserva al navegar dentro del mismo local; si se cambia de local, se pide confirmación para vaciarlo.

---

## 8. Componentes

### 8.1 Botón primario (píldora)

- Altura 52–56 pt; radio 999; fondo `ember`; texto `ink`, 16/600; padding horizontal 24.
- Estado presionado: `burnt`, escala 0.98, sin sombra.
- Estado cargando: spinner de 20 pt, texto “Confirmando…” y bloqueo de doble submit.
- Deshabilitado: fondo `fog`, texto `stone`.
- Ancho completo en formularios y checkout; ancho intrínseco en acciones secundarias.
- Ejemplos: “Ver carta”, “Agregar al pedido”, “Confirmar pedido”, “Seguir pedido”.

### 8.2 Botón secundario (outline)

- Fondo transparente; borde 1.5 pt `charcoal`; texto `ink`, 15/500; altura 48–52; radio 999.
- Presionado: fondo `fog`.
- Uso: “Cancelar”, “Volver”, “Ver locales”, acciones que no son el camino principal.

### 8.3 Botón de texto / ghost

- Sin fondo ni borde; texto `ember` o `ink`, 14/500; altura táctil 44.
- Uso: “Cambiar local”, “Ver detalle”, “Reintentar”, “Copiar código”.

### 8.4 Botón destructivo

- Por defecto: outline `danger`, texto `danger`.
- Solo en la confirmación final de cancelación: fondo `danger`, texto blanco.
- Nunca al lado del CTA principal sin separación visual; va debajo o dentro de una hoja de confirmación.

### 8.5 Botón de icono

- 44 × 44 pt; fondo `white` o `fog`; radio 999; icono 20–24 pt con stroke 1.75.
- Siempre con `accessibilityLabel`.
- Uso: volver, cerrar, copiar, llamar, editar, filtrar.

### 8.6 Buscador

- Altura 48–52; fondo `white`; borde 1 pt `sand`; radio 14; icono de búsqueda a la izquierda; botón limpiar a la derecha.
- Placeholder `stone`: “Buscar local” o “Buscar en la carta”.
- Al enfocar, borde `ember` de 2 pt.
- La búsqueda filtra los datos ya cargados; no prometer búsqueda global si el endpoint no la ofrece.

### 8.7 Campo de texto

- Label visible arriba, 14/500 `slate`; obligatorio con asterisco `ember`.
- Input de 52 pt; fondo `white`; borde 1.5 pt `sand`; radio 12; padding horizontal 16; texto 16/400 `ink`.
- Foco: borde `ember` 2 pt.
- Error: borde `danger`; mensaje 12/400 `danger` debajo, con icono.
- Helper: 12/400 `warmGray`.
- Placeholder `stone`, nunca reemplaza al label.
- Tipos de teclado: `phone-pad` para teléfono, `decimal-pad` para precio/stock, `default` para nombre/dirección.
- Teléfono: 8 a 15 dígitos, sin letras ni espacios; enviar solo dígitos.
- Dirección: multilínea de 2–3 líneas, máximo 150 caracteres.
- Contraseña: botón mostrar/ocultar; nunca loguear ni mostrar en texto.
- Autofill y `textContentType` cuando aplique.

### 8.8 Stepper de cantidad

- Contenedor 96–112 × 40; fondo `white`; borde 1 pt `sand`; radio 999.
- Botones de 32 pt visibles, con área táctil de 44 pt.
- Número central 15/600 con `tabular-nums`.
- Menos deshabilitado en 1; más deshabilitado al llegar al stock o al máximo permitido.
- Si se alcanza el stock: helper “Máximo disponible: N”.
- En el carrito, si se baja a 0, preguntar o quitar el ítem con animación breve.

### 8.9 Chip de categoría / filtro

- Altura 36–40; radio 999; padding horizontal 16.
- Reposo: fondo `fog`, texto `slate`, borde 1 pt transparente.
- Seleccionado: fondo `ember`, texto `ink`, sin borde.
- Deshabilitado: texto `stone`, fondo `fog`.
- Scroll horizontal con `showsHorizontalScrollIndicator={false}` y padding lateral alineado al gutter.

### 8.10 Tarjeta de local

- Fondo `white`; borde 1 pt `sand`; radio 20; padding 16.
- Monograma de 52–56 pt con iniciales del local sobre `peach`/`coral`/`fog`.
- Nombre 20/500 `ink`; dirección 13/400 `warmGray`; teléfono opcional como acción “Llamar”.
- CTA “Ver carta” a la derecha o como fila inferior.
- No mostrar “Abierto ahora”: el backend no tiene horarios. Un local activo simplemente aparece; uno inactivo no se muestra al público.
- Estado presionado: fondo `#FCFAF8`, escala 0.995.

### 8.11 Tarjeta / fila de producto

- Fila: tile de 88 × 88 a la izquierda (monograma o imagen si existiera), contenido flexible, precio y acción a la derecha.
- Fondo `white`; borde 1 pt `sand`; radio 20; padding 12–16.
- Nombre 16/500 `ink`, máximo 2 líneas.
- Descripción 13/400 `pewter`, máximo 2 líneas.
- Precio 18/600 `ink` con `tabular-nums`.
- Stock disponible: badge “Disponible” o “Quedan N” según corresponda.
- Sin stock: monograma desaturado, badge “Sin stock” en `danger` suave, botón de agregar deshabilitado.
- Acción: botón circular `ember` de 40 pt con “+”; al agregar, se transforma en stepper compacto.
- Si el producto está inactivo, no aparece en la carta pública; en admin se muestra con badge “Inactivo”.
- Tocar la tarjeta abre una hoja de detalle con descripción completa y CTA; el “+” agrega sin abrir la hoja.

### 8.12 Barra de carrito persistente

- Altura 72 + safe area; fondo `white`; borde superior 1 pt `sand`.
- Izquierda: cantidad de ítems en badge `ember` + “Ver pedido”.
- Centro/derecha: total estimado 16/600 con `tabular-nums`.
- CTA principal: “Ver pedido”.
- Aparece después del primer ítem, con slide-up de 180 ms.
- No tapa contenido: las listas reservan padding inferior.
- Si el carrito está vacío, no se muestra.

### 8.13 Hoja del carrito

- Hoja inferior con radio superior 28; fondo `white`; handle de 36 × 4 `driftwood`.
- Título “Tu pedido” + nombre del local.
- Lista de ítems con nombre, precio unitario, stepper y subtotal por ítem.
- Resumen: subtotal, descuento (solo si aplica), envío fijo, total.
- Descuento: fila en `success` con “Descuento 10 %” y monto negativo; explicar “Por superar $ 20.000”.
- Envío: “Envío fijo” `$ 1.500,00`; nunca decir “gratis”.
- Total: 20/600 `ink`; separador superior `sand`.
- CTA “Continuar” / “Confirmar pedido”.
- Vacío: estado con título “Tu pedido está vacío”, helper y CTA “Ver locales”.
- Si el usuario intenta agregar un producto de otro local: hoja de confirmación “Tu pedido es de [Local]. ¿Querés vaciarlo y empezar con [Otro local]?”.

### 8.14 Chip de estado

- Altura 28–32; radio 999; padding horizontal 10–12; icono 14 pt + label 11/600 `overline`.
- Usar las superficies semánticas de la tabla de estados.
- En listas del personal, el chip va arriba a la derecha de la tarjeta.
- En seguimiento público, el chip se acompaña con la timeline, no va solo.

### 8.15 Timeline de seguimiento

- 4 nodos: Recibido → En preparación → En camino → Entregado.
- Nodo completado: círculo `success` con check; nodo actual: círculo `ember` con anillo suave; nodo pendiente: círculo `sand` con icono `stone`.
- Línea conectora de 2 pt: `success` en tramos completados, `sand` en pendientes.
- Estado cancelado: reemplazar la timeline por un bloque `danger` “Pedido cancelado” y explicar que el stock fue repuesto; no mostrar pasos futuros.
- No inventar horarios por etapa ni tiempos estimados. Solo mostrar la fecha/hora del pedido que devuelve el backend.
- Textos por estado:
  - “Recibido. El local ya tiene tu pedido.”
  - “En preparación. El local está trabajando en tu pedido.”
  - “En camino. Tu pedido salió con un repartidor.”
  - “Entregado. ¡Que lo disfrutes!”

### 8.16 Tarjeta de código de seguimiento

- Fondo `dark`; radio 24; padding 20–24.
- Eyebrow 11/600 `peach`: “CÓDIGO DE SEGUIMIENTO”.
- Código 28–32/600 blanco, tracking amplio, `tabular-nums`, mayúsculas.
- Botón “Copiar código” con icono; feedback “Copiado” por toast.
- Botón “Compartir” opcional, usando el share nativo.
- No mostrar el código como texto seleccionable únicamente; siempre ofrecer copiar.

### 8.17 Tarjeta de pedido (personal)

- Fondo `white`; borde 1 pt `sand`; radio 20; padding 16.
- Fila superior: código en 14/600 `ink` + chip de estado.
- Local 16/500; cliente 13/400 `pewter`; total 16/600; hora 12/400 `warmGray`.
- Acción principal al pie: “Preparar”, “Asignar repartidor”, “Marcar entregado” según estado.
- Toda la tarjeta es táctil para abrir el detalle; la acción principal tiene su propio target.
- No mostrar acciones inválidas.

### 8.18 Tarjeta de repartidor (en la calle)

- Fondo `white`; borde 1 pt `sand`; radio 20; padding 16.
- Avatar/monograma 44 pt; nombre 16/500; teléfono opcional.
- Carga: “2 / 3 pedidos en camino” + barra de 3 segmentos; segmento activo `info`, vacío `sand`.
- Códigos como chips táctiles que abren el detalle del pedido.
- Si tiene 0 pedidos, mostrar “Sin pedidos en camino”.
- Si está en 3/3, marcar “Carga completa” en `warning` y deshabilitarlo en la hoja de asignación.

### 8.19 Tarjeta de métrica (ventas)

- Fondo `white`; borde 1 pt `sand`; radio 20; padding 16.
- Overline “LOCAL” o nombre; monto 24/600 `ink` con `tabular-nums`; cantidad de pedidos 13/400 `warmGray`.
- No mostrar flechas de crecimiento ni comparaciones si no hay datos históricos.
- Estado vacío: “No hay ventas en este rango”.

### 8.20 Fila de administración

- Fondo `white`; separador inferior 1 pt `sand`; padding vertical 14.
- Nombre 15/500; metadata 12/400 `warmGray`.
- Switch de activo a la derecha; badge “Inactivo” cuando corresponda.
- Acción “Editar” en `ember`.
- No hay botón “Eliminar”: la baja es lógica.
- Si es el propio usuario administrador, el switch de activo se deshabilita con helper “No podés desactivar tu propio usuario”.

### 8.21 Switch de activo

- Track 44 × 26; thumb 22; activo `ember`, inactivo `driftwood`; thumb blanco.
- Label visible a la izquierda: “Activo”.
- Confirmación al desactivar un local o producto: “Los clientes no van a poder verlo. ¿Continuar?”.
- La UI puede impedir la acción, pero el backend sigue siendo la autoridad.

### 8.22 Hoja de selección (picker)

- Para local, categoría, repartidor y filtros.
- Título, buscador opcional, lista de opciones con check en la seleccionada.
- Opción deshabilitada con motivo visible (“Carga completa: 3/3”).
- Confirmar/cancelar al pie; no cerrar al tocar una opción si la selección requiere confirmación.

### 8.23 Estado vacío

- Icono lineal 32–40 pt en `stone`; título 20/500 `ink`; helper 14/400 `warmGray`; CTA si existe una acción útil.
- Fondo `canvas`, sin tarjeta o con tarjeta `white` muy suave.
- Ejemplos:
  - “Todavía no hay locales disponibles.”
  - “Este local todavía no cargó su carta.”
  - “No hay pedidos en este estado.”
  - “No encontramos ese código.”

### 8.24 Skeleton

- Bloques `fog` con radio 12–20, shimmer suave de 1.2 s.
- Usar en listas y tarjetas; no mostrar spinner de pantalla completa salvo en login o submit.
- El skeleton debe respetar la estructura final para evitar saltos de layout.

### 8.25 Toast / snackbar

- Fondo `dark`; texto blanco 14/500; radio 14; padding 12–16; icono semántico.
- Posición: arriba de la tab bar o de la sticky bar; 3–4 s; swipe para descartar.
- Éxito: “Pedido confirmado”, “Código copiado”, “Cambios guardados”.
- Error: “No pudimos guardar los cambios. Intentá de nuevo.”
- No usar toast para errores de formulario; esos van inline.

### 8.26 Hoja de confirmación

- Título claro; cuerpo con la consecuencia; dos botones.
- Acción segura a la izquierda/secundaria; acción destructiva a la derecha/principal solo si el usuario confirmó.
- Para cancelar pedido: “Se repondrá el stock de todos los productos. Esta acción no se puede deshacer.”
- Para desactivar local/producto: “No se mostrará más al público.”
- Para vaciar carrito por cambio de local: “Se quitarán los productos de [Local].”

### 8.27 Monograma / tile de producto

- El backend no devuelve imágenes de producto. Usar un tile de 88 × 88 con iniciales del producto o un icono de categoría.
- Fondos permitidos: `peach`, `coral`, `fog`, `sand`; texto `ink` o `charcoal`.
- No generar colores aleatorios por producto; usar la categoría como criterio.
- Si más adelante se agregan imágenes, usar `expo-image` con placeholder del monograma y relación 1:1.

---

## 9. Blueprints de pantallas

### 9.1 Inicio / Locales (público)

**Objetivo:** que el cliente elija un local en menos de un minuto.

1. Safe area + gutter 20.
2. Wordmark “Sabores del Litoral” 20/500, con punto coral; a la derecha, acceso a “Personal” solo si no está logueado.
3. Hero editorial: `display` “¿Qué vas a pedir hoy?” + bajada 15/400 `pewter` “Elegí un local, armá tu pedido y seguilo con un código.”
4. Una tarjeta feature coral/peach como máximo: “Pedí sin registrarte. Dejá tus datos al confirmar.” Sin promociones ni tiempos falsos.
5. Buscador “Buscar local”.
6. Título de sección “Locales adheridos” + contador real.
7. Lista de tarjetas de local.
8. Estado vacío si no hay locales activos.
9. Skeleton de 3 tarjetas mientras carga.

**No mostrar:** categorías globales si no hay endpoint de productos por categoría; ratings; distancias; “abierto ahora”; tiempos de entrega; costo de envío como promo.

### 9.2 Carta del local (público)

**Objetivo:** armar el pedido sin perder el contexto del local.

1. Header con back, nombre del local, dirección y teléfono opcional.
2. Título “Carta” + helper “Pedí productos de un solo local”.
3. Buscador dentro de la carta (filtra los productos cargados).
4. Chips de categorías sticky bajo el header.
5. Secciones por categoría con `SectionList`.
6. Filas de producto con stock, precio y acción.
7. Sticky cart bar cuando hay ítems.
8. Estado vacío si el local no tiene productos activos.
9. Pull-to-refresh para actualizar stock y precios.

**Regla de stock:** si `stock = 0` o `disponible = false`, mostrar “Sin stock” y deshabilitar el agregado. No permitir cantidades mayores al stock.

### 9.3 Carrito

Puede ser hoja o pantalla completa; en mobile conviene hoja para no perder la carta.

1. Handle + título “Tu pedido”.
2. Nombre del local.
3. Ítems con stepper.
4. Resumen de montos.
5. Nota “El total final se calcula al confirmar” solo si se muestra un estimado local.
6. CTA “Continuar”.
7. Confirmación al vaciar o cambiar de local.

### 9.4 Checkout

**Objetivo:** pedir los datos mínimos y confirmar sin fricción.

1. Header “Confirmar pedido”.
2. Resumen compacto del local y cantidad de ítems.
3. Formulario:
   - Nombre y apellido (obligatorio).
   - Teléfono (obligatorio, 8–15 dígitos, `phone-pad`).
   - Dirección de entrega (obligatoria, multilínea, máximo 150 caracteres).
4. Aviso “No necesitás crear una cuenta. Guardá el código para seguir tu pedido.”
5. Resumen de montos: subtotal, descuento si aplica, envío fijo, total.
6. CTA “Confirmar pedido”; loading y bloqueo de doble submit.
7. Errores inline por campo; error general si falla la creación.
8. Keyboard avoiding + scroll para que el CTA nunca quede tapado.

**No incluir:** pago online, tarjeta, propina, cupón, cuenta, login, mapa, coordenadas, instrucciones de GPS.

### 9.5 Confirmación

1. Ícono de check en `success` suave (sin confeti).
2. `display` “Pedido confirmado”.
3. Bajada “Guardá este código para seguir tu pedido.”
4. Tarjeta dark con el código de 8 caracteres.
5. Total y local.
6. CTA “Seguir pedido” + ghost “Volver al inicio”.
7. Si el usuario cierra la pantalla, el pedido ya existe; no prometer “recuperar” sin código.

### 9.6 Seguimiento público

1. Título “Seguir pedido”.
2. Input de código: 8 caracteres, mayúsculas, `autoCapitalize="characters"`, `maxLength={8}`, tracking amplio.
3. CTA “Buscar pedido”.
4. Resultado:
   - Código + chip de estado.
   - Timeline.
   - Local.
   - Lista de productos y cantidades.
   - Total y fecha/hora.
5. Estado 404: “No encontramos ese código. Revisá que tenga 8 caracteres.”
6. Estado de red: “No pudimos consultar el pedido. Revisá tu conexión.”
7. **Privacidad:** no mostrar nombre, teléfono ni dirección del cliente. Solo lo que devuelve el endpoint público.

### 9.7 Login del personal

1. Fondo `canvas`; tarjeta `white` centrada con ancho máximo 420.
2. Wordmark + título “Acceso del personal”.
3. Campos usuario y contraseña.
4. CTA “Ingresar”.
5. Error genérico: “Usuario o contraseña incorrectos.” No aclarar cuál falló.
6. Sin registro, sin recuperación automática, sin selector de rol.
7. Al ingresar, redirigir a “Pedidos” y mostrar las tabs según rol.
8. Logout en “Cuenta” con confirmación breve.

### 9.8 Pedidos (operador/admin)

**Objetivo:** ver qué hay para hacer y actuar rápido.

1. Header “Pedidos” + botón refresh.
2. Segmented control: “En curso” (default), “Recibido”, “En preparación”, “En camino”, “Entregado”, “Cancelado”.
3. Buscador por código.
4. Lista de tarjetas de pedido, ordenadas por fecha descendente.
5. Cada tarjeta muestra la próxima acción válida.
6. Pull-to-refresh.
7. Empty state por filtro.
8. En “En curso”, agrupar o filtrar los estados no finales.

### 9.9 Detalle de pedido (personal)

1. Header con código y chip de estado.
2. Datos del cliente: nombre, teléfono, dirección (solo personal).
3. Local y repartidor asignado (si existe).
4. Ítems con cantidad, precio unitario y subtotal.
5. Montos: subtotal, descuento, envío, total.
6. Fecha/hora.
7. Acciones según estado:
   - `RECIBIDO`: “Pasar a preparación” + “Cancelar pedido”.
   - `EN_PREPARACION`: “Asignar repartidor” + “Cancelar pedido”.
   - `EN_CAMINO`: “Marcar entregado”.
   - `ENTREGADO` / `CANCELADO`: sin acciones; banner de estado final.
8. Confirmación para “Marcar entregado” y “Cancelar pedido”.
9. Al asignar repartidor, abrir hoja con repartidores activos y carga < 3.
10. Si no hay repartidores disponibles: “No hay repartidores disponibles. Todos están en el máximo de 3 pedidos en camino.”

### 9.10 En la calle (operador/admin)

1. Header “En la calle” + refresh.
2. Lista de repartidores activos, incluidos los de 0 pedidos.
3. Tarjeta por repartidor con carga `N / 3` y códigos.
4. Tap en código → detalle del pedido.
5. Empty state si no hay repartidores activos.
6. No mostrar mapa ni ubicación en tiempo real.

### 9.11 Catálogo (admin, dentro de Gestión)

1. Segmented control “Locales” / “Productos”.
2. Locales:
   - Buscador.
   - Filas con nombre, dirección, teléfono, switch activo, editar.
   - CTA “Nuevo local”.
3. Productos:
   - Filtro por local.
   - Buscador.
   - Filas con nombre, categoría, precio, stock, switch activo, editar.
   - CTA “Nuevo producto”.
4. Formularios:
   - Local: nombre obligatorio/único; dirección y teléfono opcionales; activo.
   - Producto: local, categoría, nombre, precio y stock obligatorios; precio/stock no negativos; descripción opcional; activo.
5. Un local o producto inactivo se ve en admin con badge “Inactivo”; no se borra.
6. Confirmación al desactivar.
7. No hay alta/baja de categorías ni repartidores.

### 9.12 Ventas (admin, dentro de Gestión)

1. Header “Ventas”.
2. Rango de fechas: “Desde” y “Hasta” con date pickers; CTA “Aplicar”.
3. Resumen general: cantidad de pedidos y monto vendido.
4. Tarjetas por local: nombre, cantidad de pedidos, monto.
5. Nota: “Solo pedidos entregados. El monto no incluye el envío.”
6. Empty state: “No hay ventas en este rango.”
7. No inventar comparaciones, gráficos de crecimiento ni proyecciones.

### 9.13 Usuarios (admin, dentro de Gestión)

1. Header “Usuarios” + “Nuevo usuario”.
2. Lista con nombre completo, username, chip de rol (`ADMIN` / `OPERADOR`), switch activo.
3. Crear/editar: username único no editable, nombre completo, rol, contraseña (mínimo 8).
4. Cambiar contraseña en un flujo aparte; nunca mostrar la actual.
5. No permitir que un administrador se desactive a sí mismo ni se quite el rol de administrador.
6. No hay eliminación física.

### 9.14 Cuenta (personal)

1. Nombre completo, username y chip de rol.
2. “Cerrar sesión” con confirmación.
3. Versión de la app y, solo en desarrollo, la URL del backend.
4. Sin historial de pedidos del cliente: el público no tiene cuenta.

---

## 10. Reglas de negocio reflejadas en la UI

La app puede anticipar validaciones para mejorar la experiencia, pero **el backend sigue siendo la autoridad**. Si hay conflicto, mostrar el error del servidor y refrescar.

| Regla | Comportamiento de UI |
|---|---|
| **RN-01** Todos los productos de un pedido son del mismo local, activos y el local está activo. | El carrito queda atado a un local. Al agregar de otro, pedir confirmación para vaciar. Si el local o un producto se desactiva, rechazar el checkout y explicar. |
| **RN-02** La cantidad no supera el stock. | Mostrar stock; limitar el stepper; deshabilitar “Agregar” si no hay stock. Ante error de stock, refrescar la carta y marcar los productos afectados. |
| **RN-03** Repartidor activo y con menos de 3 pedidos EN_CAMINO. | En la hoja de asignación, mostrar carga `N / 3`; deshabilitar `3 / 3`; no asignar dos veces. |
| **RN-04** Solo se cancela desde RECIBIDO o EN_PREPARACION. | Mostrar “Cancelar pedido” solo en esos estados. En EN_CAMINO, ENTREGADO o CANCELADO, ocultarlo. Confirmar que se repone el stock. |
| **RN-05** Solo transiciones válidas. | Mostrar únicamente la próxima acción permitida. No permitir saltear ni retroceder. |
| **RN-06** El ítem guarda el precio al momento de pedir. | En detalle y seguimiento, mostrar el precio unitario del pedido, no el precio actual del producto. |
| **RN-07** El cliente se identifica por teléfono. | No hay cuenta ni historial. El checkout pide nombre, teléfono y dirección; la dirección pertenece al pedido. |
| **RN-08** Código de 8 caracteres, público sin datos personales. | Código en mayúsculas, copiable. En seguimiento público no mostrar nombre, teléfono ni dirección. 404 claro. |
| **RN-09** Un admin no puede desactivarse ni quitarse el rol. | Deshabilitar esos controles en su propia fila; mostrar helper. El backend valida igual. |
| **RN-10** Locales, productos y usuarios se desactivan. | Usar switch “Activo”; no hay “Eliminar”. Lo inactivo no aparece al público. |
| **Cálculos** Descuento 10 % si subtotal > $ 20.000; envío $ 1.500; total = subtotal − descuento + envío. | Mostrar los montos que devuelve el backend. El descuento solo aparece si aplica. Nunca permitir editar montos. |
| **Estados finales** ENTREGADO y CANCELADO. | No mostrar acciones de avance ni cancelación. Banner de estado final. |
| **Ventas** Solo pedidos ENTREGADO; sin envío. | La pantalla de ventas aclara “No incluye envío” y no suma el costo de envío. |

---

## 11. Datos reales vs. datos inventados

### Lo que el backend sí devuelve

- **Local:** nombre, dirección, teléfono, activo.
- **Producto:** nombre, descripción, categoría, precio, stock, disponible/activo.
- **Pedido público:** código, estado, local, ítems, total, fecha.
- **Pedido para personal:** cliente, teléfono, dirección, ítems, montos, repartidor.
- **Repartidor:** nombre, teléfono, cantidad de pedidos en camino, códigos.
- **Ventas:** local, cantidad de pedidos, monto vendido.

### Lo que no existe y no se debe simular

- Fotos de locales o productos.
- Ratings, reseñas, favoritos, “popular”.
- Tiempos estimados de entrega.
- Distancias, mapas, GPS o seguimiento en vivo.
- Horarios de apertura o “abierto/cerrado”.
- Pedido mínimo, promociones, cupones, envío gratis.
- Pagos online, tarjetas, propinas.
- Cuenta de cliente, historial, puntos.
- Comparaciones de ventas o gráficos históricos sin datos.

Si falta un dato, se resuelve con monograma, texto claro o un estado vacío. **No se rellena con datos falsos.**

---

## 12. Estados, feedback y errores

### 12.1 Carga

- Listas: skeleton con la forma de la tarjeta.
- Detalle: skeleton de header + bloques.
- Login/submit: spinner dentro del botón, no pantalla completa.
- Pull-to-refresh en Home, carta, pedidos, en la calle y ventas.

### 12.2 Vacío

- Explicar por qué está vacío y qué puede hacer el usuario.
- No usar “Oops” ni culpar al usuario.
- El CTA debe llevar a una acción real.

### 12.3 Error de red

- Banner persistente arriba del contenido: “Sin conexión. Revisá tu red.”
- CTA “Reintentar”.
- Mantener los datos ya cargados si es posible; no borrar el carrito local.

### 12.4 Errores HTTP

| Código | Mensaje de UI |
|---|---|
| 400 | “Revisá los datos ingresados.” + errores por campo. |
| 401 | “Tu sesión venció. Ingresá de nuevo.” o “Usuario o contraseña incorrectos.” |
| 403 | “No tenés permiso para hacer esta acción.” |
| 404 | “No encontramos ese pedido.” / “No encontramos ese código.” |
| 409 | “Ese dato ya existe.” o “El stock cambió. Actualizá la carta.” |
| 500 | “No pudimos completar la acción. Intentá de nuevo.” |

Nunca mostrar trazas de Java, nombres de tablas, DTOs ni mensajes técnicos.

### 12.5 Validación de formularios

- Validar al salir del campo y al enviar.
- No validar mientras el usuario todavía escribe, salvo longitud de código.
- Mostrar el error debajo del campo, con icono y texto.
- Enfocar el primer campo con error al enviar.
- El botón de envío no se deshabilita por campos vacíos; se valida al presionar y se muestran los errores. (Deshabilitarlo sin explicación confunde.)

### 12.6 Confirmaciones

- Cancelar pedido.
- Desactivar local/producto/usuario.
- Vaciar carrito por cambio de local.
- Cerrar sesión.
- Marcar entregado (acción final).

---

## 13. Voz y copy

### Tono

- Español rioplatense neutro, cálido y directo.
- Frases cortas. Verbo en imperativo para acciones.
- Sin humor forzado, sin signos de exclamación en cadena, sin jerga técnica.
- El cliente es “vos”; el sistema habla en primera persona del plural solo cuando ayuda (“No pudimos…”).
- No usar “transacción”, “backend”, “DTO”, “endpoint”, “BigDecimal” en la UI.

### Glosario de interfaz

| Usar | Evitar |
|---|---|
| Local | Restaurante, comercio, tienda |
| Carta | Menú, catálogo |
| Pedido | Orden, compra |
| Repartidor | Delivery, cadete |
| Código de seguimiento | Tracking, ID |
| En camino | En reparto, en tránsito |
| Sin stock | Agotado, no disponible (usar “Sin stock” para claridad) |

### Ejemplos

- CTA: “Ver carta”, “Agregar”, “Ver pedido”, “Confirmar pedido”, “Seguir pedido”.
- Éxito: “Pedido confirmado. Guardá tu código: ABC12345.”
- Error de stock: “Ese producto ya no tiene stock suficiente. Actualizamos la carta.”
- Error de código: “No encontramos ese código. Revisá que tenga 8 caracteres.”
- Cancelación: “¿Cancelar el pedido? Se repondrá el stock de los productos.”
- Repartidor no disponible: “Ese repartidor ya tiene 3 pedidos en camino.”
- Ventas: “Solo se cuentan pedidos entregados. El monto no incluye el envío.”

### Reglas de escritura

- Botones: 1–3 palabras, verbo + objeto.
- Títulos: sentence case, no Title Case.
- Fechas: `dd/mm/yyyy · HH:mm`.
- Montos: `$ 12.500,00`, con espacio después del símbolo.
- Código: siempre en mayúsculas y con tracking amplio.
- No usar emojis en la interfaz. Los iconos cumplen esa función.

---

## 14. Imagen, iconografía y marca

### Marca

- Wordmark textual “Sabores del Litoral” en DM Sans 500, tracking -0.02em.
- Monograma “SL” en tile `peach` con texto `ink` para espacios pequeños.
- Punto coral de 6 pt como acento de marca, no como decoración repetida.
- No inventar un logo complejo ni usar imágenes de stock.

### Iconografía

- Un solo set lineal, stroke 1.75–2, extremos redondeados, 20–24 pt.
- Preferir Lucide o un set similar; si se usa `expo-symbols`, proveer fallback en Android.
- Iconos activos `ember`; inactivos `stone`; semánticos `success`, `info`, `warning`, `danger`.
- No mezclar iconos rellenos y lineales en la misma pantalla.
- Todo icono interactivo necesita `accessibilityLabel`.

### Imágenes

- El backend no devuelve imágenes; usar monogramas por categoría.
- Si se agregan imágenes en el futuro:
  - relación 1:1 para productos y 4:3 para locales;
  - `expo-image` con placeholder;
  - no superponer texto sobre la imagen;
  - no usar fotos de personas ni de stock genérico.

### Ilustración

- Si se necesita una ilustración para estados vacíos, usar línea simple en `stone`/`peach`, con motivo de río, ola o cubiertos.
- Máximo una ilustración por pantalla; no competir con el CTA.

---

## 15. Movimiento

- Duración estándar: 150–220 ms.
- Hojas: 250–320 ms con spring suave.
- Aparición de la sticky bar: slide-up 180 ms.
- Press: escala 0.98 y cambio de superficie; sin rebote.
- Cambio de estado: crossfade del chip + actualización de la timeline; sin confeti.
- Skeletons: shimmer de 1.2 s, loop suave.
- Respetar “Reducir movimiento”: desactivar slides largos y shimmer; mantener cambios de opacidad.
- Usar `react-native-reanimated`; no animar propiedades costosas en listas largas.

---

## 16. Accesibilidad

- **Contraste:** texto normal ≥ 4.5:1; texto grande ≥ 3:1. El CTA usa `ink` sobre `ember` para cumplir AA. Si se usa texto blanco, el fondo debe ser `action` (`#D92F00`).
- **Targets:** mínimo 44 × 44 pt; usar `hitSlop` en iconos pequeños.
- **Tipografía:** permitir escalado; no fijar `height` en textos; evitar truncar información crítica como el total o el código.
- **Screen reader:** labels explícitos.
  - “Agregar [producto] al pedido”.
  - “Cantidad de [producto]: 2”.
  - “Estado del pedido: en camino”.
  - “Código de seguimiento: A B C 1 2 3 4 5”.
  - “Repartidor [nombre], 2 de 3 pedidos en camino”.
- **Color:** nunca es la única señal; siempre icono + texto.
- **Formularios:** label visible, error asociado, foco al primer error, teclado correcto.
- **Navegación:** orden de foco lógico; back siempre disponible; no depender de gestos ocultos.
- **Botones:** no usar long press como única acción.
- **Toasts:** anunciar con `accessibilityLiveRegion` y no depender de ellos para información crítica.
- **Safe areas:** respetar notch, home indicator y barra de navegación de Android.

---

## 17. Responsive y plataformas

- **320 pt:** gutter 16; tipografía grande permitida; filas de producto pueden apilar precio/acción; evitar textos largos en una línea.
- **390–430 pt:** layout de referencia; gutter 20.
- **Tablet:** contenido centrado con ancho máximo 560; listas de locales en 2 columnas si hay espacio; no estirar tarjetas a todo el ancho.
- **Web (opcional):** foco visible, hover solo como refuerzo, ancho máximo 560; no romper la experiencia mobile.
- **iOS:** safe area superior/inferior; `StatusBar` con contenido oscuro sobre crema; gesto back.
- **Android:** barra de estado oscura sobre crema; back físico; elevación solo en hojas/toasts.
- **Orientación:** portrait como principal; landscape debe permitir scroll y no cortar el CTA.
- **Tema:** light-first. En v1, forzar light aunque el sistema esté en dark. El único dark permitido es la tarjeta del código y los toasts.

---

## 18. Implementación

### 18.1 Tokens en React Native

Extender `src/constants/theme.ts` con una estructura similar a esta. Los componentes deben importar tokens, no escribir hex.

```ts
export const palette = {
  ember: '#FF3C00',
  burnt: '#EC4E02',
  action: '#D92F00',
  coral: '#FF764C',
  peach: '#FFB199',
  canvas: '#FAF6F1',
  white: '#FFFFFF',
  ink: '#0E0E0F',
  charcoal: '#312E2E',
  slate: '#36373B',
  pewter: '#52545A',
  warmGray: '#6B6664',
  stone: '#898C94',
  sand: '#DFDDD8',
  driftwood: '#CBC7C3',
  fog: '#EFEFEF',
  dark: '#1A1919',
  success: '#1E7A4D',
  info: '#1D6FD1',
  warning: '#9A5B00',
  danger: '#B42318',
} as const;

export const semantic = {
  successSoft: '#E8F5EE',
  infoSoft: '#E8F2FF',
  warningSoft: '#FFF3E0',
  dangerSoft: '#FDECEA',
  neutralSoft: '#EFEFEF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
  hero: 40,
  screen: 48,
  empty: 64,
} as const;

export const radii = {
  input: 14,
  card: 20,
  feature: 28,
  sheet: 28,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 36, lineHeight: 40, fontWeight: '500' as const, letterSpacing: -1.44 },
  h1: { fontSize: 32, lineHeight: 36, fontWeight: '500' as const, letterSpacing: -0.96 },
  h2: { fontSize: 24, lineHeight: 28, fontWeight: '500' as const, letterSpacing: -0.48 },
  h3: { fontSize: 20, lineHeight: 24, fontWeight: '500' as const, letterSpacing: -0.4 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;
```

> Los `letterSpacing` están expresados en puntos para React Native. Ajustar si se cambia el tamaño base.

### 18.2 Convenciones

- **Estilos:** `StyleSheet.create`; no NativeWind ni estilos inline salvo valores dinámicos calculados.
- **Componentes:** primitives en `src/components/ui/`; componentes de dominio en `src/features/`; pantallas en `src/app/`.
- **Listas:** `FlatList` / `SectionList`; evitar `ScrollView` para listas largas.
- **Imágenes:** `expo-image` con placeholder de monograma.
- **Fuentes:** cargar con `expo-font` y ocultar splash cuando estén listas.
- **Iconos:** un solo set; si se agrega una librería, usar `npx expo install` para resolver versiones compatibles con SDK 57.
- **Hojas:** `Modal` + Reanimated o una librería de bottom sheet si el equipo la necesita; no agregar dependencias sin acordarlo.
- **API:** un cliente centralizado con `baseUrl`, manejo de errores y timeout. No calcular montos definitivos en el cliente.
- **Sesión:** guardar solo lo necesario del usuario del personal (nombre, username, rol); nunca guardar contraseña. La autorización real es del backend.
- **Formato:** `Intl.NumberFormat('es-AR')` para moneda; `Intl.DateTimeFormat('es-AR')` para fechas.
- **Pruebas manuales:** iPhone SE (320), iPhone 15 (390), Android chico (360), tablet; con teclado abierto, fuente grande y modo avión.

### 18.3 Contrato de datos por pantalla

| Pantalla | Endpoint principal | Datos que usa |
|---|---|---|
| Inicio | `GET /api/locales` | nombre, dirección, teléfono. |
| Carta | `GET /api/locales/{id}/carta` | categorías, productos, precio, stock, disponible. |
| Checkout | `POST /api/pedidos` | localId, dirección, nombre, teléfono, ítems. |
| Confirmación | respuesta de `POST /api/pedidos` | código, total, estado. |
| Seguimiento | `GET /api/pedidos/seguimiento/{codigo}` | estado, local, ítems, total, fecha. |
| Login | `POST /api/auth/login` | usuario, nombre, rol. |
| Pedidos | `GET /api/pedidos?estado=` | código, estado, local, cliente, fecha, total. |
| Detalle | `GET /api/pedidos/{id}` | cliente, dirección, ítems, montos, repartidor. |
| Avanzar | `PATCH /api/pedidos/{id}/avanzar` | repartidorId cuando pasa a EN_CAMINO. |
| Cancelar | `PATCH /api/pedidos/{id}/cancelar` | estado actualizado. |
| En la calle | `GET /api/repartidores/en-calle` | repartidor, cantidad, códigos. |
| Asignación de repartidor | `GET /api/repartidores/en-calle` | repartidores activos, cantidad y códigos para calcular carga `< 3`. |
| Catálogo | `GET /api/locales/todos`, `GET /api/productos` | activos e inactivos. |
| Ventas | `GET /api/ventas?desde=&hasta=` | local, cantidad, monto. |
| Usuarios | `GET /api/usuarios` | nombre, username, rol, activo. |

### 18.4 Checklist de terminado

- [ ] Usa tokens; no hay hex sueltos en componentes.
- [ ] Targets de 44 pt y contraste AA.
- [ ] Safe areas, teclado y scroll resueltos.
- [ ] Loading, empty y error en cada pantalla de datos.
- [ ] Montos y stock vienen del backend; no hay cálculos definitivos locales.
- [ ] No hay datos inventados (ratings, fotos, tiempos, distancias, horarios).
- [ ] Las acciones inválidas no se muestran o se explican.
- [ ] El código de seguimiento se puede copiar y se lee con claridad.
- [ ] El seguimiento público no expone datos personales.
- [ ] El área del personal respeta el rol.
- [ ] Funciona en 320 pt, 390 pt y tablet.
- [ ] `npx expo lint` y `npx tsc --noEmit` pasan.

---

## 19. Do's and Don'ts

### Do

- Usar `canvas` como fondo de app y `white` para tarjetas, inputs y hojas.
- Usar `ember` para acción, foco y marca; con moderación.
- Usar botones píldora y tarjetas de 20–28 pt de radio.
- Mantener títulos con tracking negativo y cuerpo con line-height generoso.
- Reservar el coral para una tarjeta feature por pantalla como máximo.
- Mostrar estados con icono + texto + color.
- Diseñar primero para una mano y para pantallas de 320 pt.
- Usar monogramas y textos reales cuando no hay imágenes.
- Dejar que el backend calcule y confirmar con sus valores.

### Don't

- No usar azul para CTAs ni verde para acciones generales.
- No usar sombras en tarjetas, listas o botones.
- No usar esquinas rectas en botones o tarjetas.
- No usar blanco puro como fondo de pantalla.
- No usar negro `#000000` como texto; usar `ink`.
- No usar pesos 700+ en títulos.
- No poner más de 2–3 superficies coral/peach por viewport.
- No inventar ratings, fotos, tiempos, distancias, horarios ni promociones.
- No mostrar acciones imposibles solo para “completar” la interfaz.
- No mostrar datos personales en el seguimiento público.
- No usar emojis, confeti ni animaciones exageradas.

---

## 20. Prompts de referencia para construir pantallas

Estos prompts sirven para pedirle a un asistente o a un diseñador una pantalla coherente con el sistema. Siempre incluir el contexto de datos reales.

1. **Home mobile:** “Diseñá la pantalla de inicio de Sabores del Litoral en React Native. Fondo crema #FAF6F1, gutter 20, wordmark, título display 36/500 con tracking -0.04em, una tarjeta feature coral/peach, buscador, lista de tarjetas blancas de locales con monograma, nombre, dirección y CTA ‘Ver carta’. Sin ratings, fotos, distancias ni horarios. Targets de 44 pt, tab bar blanca con borde superior sand.”

2. **Carta:** “Diseñá la carta de un local con header compacto, chips de categoría sticky, filas de producto con tile de monograma 88×88, nombre, descripción a 2 líneas, precio tabular, badge de stock y botón ‘+’ que se transforma en stepper. Fondo crema, tarjetas blancas con borde sand, radio 20, sin sombras. Producto sin stock deshabilitado con badge ‘Sin stock’.”

3. **Checkout:** “Diseñá el checkout mobile con resumen del local, campos nombre, teléfono y dirección, errores inline, resumen de subtotal/descuento/envío/total y CTA primario naranja con texto ink. Sin pago online. Keyboard avoiding y CTA visible. Estilo cálido, bordes finos, tipografía Inter/DM Sans.”

4. **Seguimiento:** “Diseñá la pantalla pública de seguimiento por código: input de 8 caracteres en mayúsculas, tarjeta dark con el código, chip de estado, timeline de 4 pasos, local, productos, total y fecha. Sin nombre, teléfono ni dirección. Estado 404 claro. Sin tiempos estimados ni mapa.”

5. **Pedido para personal:** “Diseñá una tarjeta de pedido para operador: código, chip de estado, local, cliente, total, hora y acción principal según estado. Fondo blanco, borde sand, radio 20, densidad cómoda. Para EN_CAMINO mostrar ‘Marcar entregado’; para RECIBIDO ‘Pasar a preparación’ y ‘Cancelar’ subordinado; nunca acciones inválidas.”

6. **Ventas:** “Diseñá la pantalla de ventas para admin con rango de fechas, resumen general y tarjetas por local con cantidad de pedidos y monto vendido. Aclarar que solo cuenta pedidos entregados y que el monto no incluye envío. Sin gráficos inventados ni comparaciones.”

---

## 21. Referencias

- **Replit:** punto de partida conceptual — crema, coral, tipografía editorial, tarjetas grandes, bordes en lugar de sombras.
- **Airbnb:** calidez en tarjetas y confianza en el detalle.
- **Linear:** contención tipográfica y ausencia de sombras decorativas.
- **Notion:** neutros cálidos y geometría amable.
- **Apps de delivery:** prioridad al carrito, al estado del pedido y a la acción siguiente.

La referencia no se copia: se adapta a las restricciones reales de Sabores del Litoral —sin cuentas de cliente, sin pagos, sin mapas, sin fotos y con un backend que manda sobre los datos.
