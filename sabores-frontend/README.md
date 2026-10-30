# Sabores del Litoral — Frontend mobile

Aplicación mobile de delivery para Sabores del Litoral. El cliente está hecho con Expo/React Native y consume la API REST del backend Spring Boot.

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
- Expo Go actualizado en el celular o un emulador Android/iOS

## Cómo ver la app

### Opción A — Expo Go en el celular

1. Instalar o actualizar **Expo Go** desde App Store o Google Play. La versión actual corresponde a SDK 58.
2. Instalar dependencias una vez:

   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:

   ```bash
   npx expo start
   ```

4. Escanear el QR que muestra la terminal:
   - Android: abrir Expo Go y usar “Scan QR code”.
   - iPhone: escanear con la cámara y abrir el enlace en Expo Go.

El celular y la PC deben estar en la misma red Wi-Fi. Si la red bloquea la conexión local:

```bash
npx expo login
npx expo start --tunnel
```

### Opción B — Navegador / localhost

```bash
npx expo start --web
```

Abrir la URL que imprime la terminal. Por defecto es `http://localhost:8081`; si el puerto está ocupado, Expo indica el puerto alternativo.

> `localhost:8081` es la app. El backend usa `http://localhost:8080`.

La app se puede ver en el navegador, pero las llamadas a la API pueden fallar por CORS. Para probar el flujo completo con el backend conviene usar Expo Go o un emulador, o habilitar CORS en el backend.

### Opción C — Emulador

- Android: `npx expo start --android` (requiere Android Studio y un emulador configurado).
- iOS: `npx expo start --ios` (requiere macOS y Xcode).

### Si Expo Go dice que el SDK es viejo

- Actualizar Expo Go desde la tienda.
- Limpiar la caché de Metro:

  ```bash
  npx expo start -c
  ```

- Verificar versiones:

  ```bash
  npx expo install --check
  npx expo-doctor
  ```

## Comandos

```bash
npx expo start          # servidor de desarrollo
npx expo start -c       # servidor limpio, sin caché
npx expo start --web    # app en el navegador
npx expo start --android
npx expo start --ios
npx expo lint           # lint
npx tsc --noEmit        # typecheck
npx expo-doctor         # diagnóstico de dependencias/configuración
```

## Configuración de la API

La URL del servidor se configura con `EXPO_PUBLIC_API_URL`.

| Entorno | URL |
|---|---|
| Simulador iOS | `http://localhost:8080` |
| Emulador Android | `http://10.0.2.2:8080` |
| Celular físico con Expo Go | `http://<IP-LAN-de-la-PC>:8080` |

El celular y la PC deben estar en la misma red y el puerto 8080 debe estar habilitado en el firewall. La app nativa no necesita CORS; la versión web sí, y el backend actual no lo configura.

La capa HTTP usa `http://localhost:8080` si la variable no está definida. Para crear la configuración local:

```bash
cp .env.example .env.local
```

Editar `.env.local` con la URL que corresponda. En un celular físico, `localhost` apunta al teléfono, no a la PC: usar la IP LAN de la computadora.

Después de cambiar `EXPO_PUBLIC_API_URL`, reiniciar el servidor con `npx expo start -c` para que el nuevo valor se incluya en el bundle.

Para probar la conexión durante el desarrollo existe la ruta temporal `/api-diagnostics`, que ejecuta `GET /api/locales` y muestra los estados de carga, error o respuesta.

Para sembrar datos de prueba con la extensión REST Client de VS Code, usar [`docs/http/seed-dev.http`](docs/http/seed-dev.http). Después de crear un local, actualizar `@localId` con el identificador recibido antes de crear sus productos.

## Estructura

```text
src/
  app/                 rutas de Expo Router
    (tabs)/            Inicio, Seguir, Personal y área del personal
    local/[id].tsx     carta del local
    pedido/[id].tsx    detalle del pedido
    checkout.tsx
    confirmacion.tsx
  components/ui/       componentes reutilizables
  features/            componentes y contextos de dominio
  lib/api/             cliente HTTP, rutas y tipos
  lib/format.ts        moneda, fechas y códigos
  constants/theme.ts   colores, tipografía, espaciado, radios y layout
docs/http/             colección de prueba para la API
```

## Notas técnicas

- El backend actual no expone tokens JWT ni aplica autorización por roles.
- La base arranca sin locales ni productos. Para probar el catálogo hay que cargarlos por H2 o por los endpoints de administración.
- La app se mantiene en tema claro.
