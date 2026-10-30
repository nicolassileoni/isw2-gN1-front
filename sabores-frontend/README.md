# Sabores del Litoral — Frontend mobile

Aplicación mobile de delivery para Sabores del Litoral. El cliente está desarrollado con Expo/React Native y consume la API REST del backend Spring Boot.

## Stack

- Expo SDK 58
- React Native 0.88
- React 19.3
- TypeScript estricto
- Expo Router
- Backend: Spring Boot 4.1.1 / Java 21 / H2

## Requisitos

- Node.js 24 LTS (mínimo 22.13)
- npm
- Expo Go actualizado o un emulador Android/iOS
- Backend levantado en el puerto 8080

## Cómo ejecutar

```bash
npm install
npx expo start
```

Luego escanear el QR con Expo Go o abrir el emulador desde la terminal.

### Expo Go en un celular

El celular y la PC deben estar en la misma red Wi-Fi. Si la red bloquea la conexión local:

```bash
npx expo login
npx expo start --tunnel
```

El túnel solo resuelve la conexión con Metro. La app necesita igualmente acceder al backend por la IP LAN de la PC.

### Navegador

```bash
npx expo start --web
```

Abrir la URL que imprime la terminal. Por defecto es `http://localhost:8081`; si el puerto está ocupado, Expo indica el alternativo.

`localhost:8081` es la app. El backend usa `http://localhost:8080`.

### Emulador

- Android: `npx expo start --android` (requiere Android Studio y un emulador configurado).
- iOS: `npx expo start --ios` (requiere macOS y Xcode).

### Si Expo Go indica que el SDK es viejo

Actualizar Expo Go desde la tienda y limpiar la caché:

```bash
npx expo start -c
npx expo install --check
npx expo-doctor
```

## Configuración de la API

La URL del backend se configura con `EXPO_PUBLIC_API_URL`.

| Entorno | URL |
|---|---|
| Simulador iOS | `http://localhost:8080` |
| Emulador Android | `http://10.0.2.2:8080` |
| Celular físico con Expo Go | `http://<IP-LAN-de-la-PC>:8080` |

El celular y la PC deben estar en la misma red y el puerto 8080 habilitado en el firewall. En un celular, `localhost` apunta al teléfono, no a la PC.

Para crear la configuración local:

```bash
cp .env.example .env.local
```

Editar `.env.local` con la URL correspondiente. Después de cambiar la variable, reiniciar con `npx expo start -c`.

El backend tiene CORS habilitado para la app web local. Expo Go y los emuladores no dependen de CORS.

## Roles y sesión

| Rol | Acceso |
|---|---|
| Público | Locales, cartas, categorías, pedidos y seguimiento por código. |
| Operador | Pedidos, detalle, avance de estados, cancelación y pedidos en la calle. |
| Administrador | Todo lo anterior, más locales, productos, ventas y usuarios. |

El login del personal devuelve un JWT de 8 horas. El token se conserva en memoria y se envía en cada solicitud protegida como `Authorization: Bearer <token>`.

- Al cerrar la app hay que volver a iniciar sesión.
- Un `401` cierra la sesión y redirige al ingreso.
- Un `403` indica que el rol no alcanza para esa acción.
- Las guardas de navegación son de interfaz; el backend valida el token y el rol.

## Datos de demostración

El backend carga automáticamente:

- `admin` / `Admin2026!`
- `operador` / `Operador2026!`
- 2 locales activos y 1 inactivo.
- Productos en las 5 categorías, incluido uno sin stock y uno inactivo.
- Pedidos `DEMO0001` a `DEMO0004` en distintos estados.

La base se recrea al reiniciar el backend, por lo que los datos demo vuelven a su estado inicial.

La ruta `/api-diagnostics` permite verificar la conexión con `GET /api/locales` durante el desarrollo. Para cargar datos propios, se puede usar [`docs/http/seed-dev.http`](docs/http/seed-dev.http).

## Comandos

```bash
npx expo start          # servidor de desarrollo
npx expo start -c       # servidor limpio, sin caché
npx expo start --web
npx expo start --android
npx expo start --ios
npx expo lint           # lint
npx tsc --noEmit        # typecheck
npx expo-doctor         # diagnóstico de dependencias/configuración
```

## Estructura

```text
src/
  app/                 rutas de Expo Router
    (tabs)/            Inicio, Seguir, Personal y área del personal
    gestion/           catálogo, ventas y usuarios
    local/[id].tsx     carta del local
    pedido/[id].tsx    detalle del pedido
    checkout.tsx
    confirmacion.tsx
  components/          componentes de marca y UI
  features/            contextos y componentes de dominio
  lib/api/             cliente HTTP, rutas y tipos
  lib/auth/            almacenamiento del token
  lib/format.ts        moneda, fechas y códigos
  constants/theme.ts   colores, tipografía, espaciado y layout
assets/images/brand/   logo horizontal y mascota
docs/http/             colección opcional para datos propios
```

## Alcance

La app no incluye cuentas de cliente, historial personal, pagos en línea, mapas, GPS, tiempos estimados ni seguimiento en vivo. Los locales y productos no se eliminan: se desactivan. Las categorías son fijas y se consultan desde el backend.
