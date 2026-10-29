# Sabores del Litoral — Frontend mobile

Aplicación mobile de delivery para Sabores del Litoral. El cliente está hecho con Expo/React Native y consume la API REST del backend Spring Boot.

## Stack

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript estricto
- Expo Router
- Backend: Spring Boot 4.1.1 / Java 21 / H2

## Requisitos

- Node.js LTS
- npm
- Expo Go en el celular o un emulador Android/iOS

## Cómo levantar la app

```bash
npm install
npx expo start
```

Luego escanear el QR con Expo Go o abrir el emulador desde la terminal.

## Comandos

```bash
npx expo start          # servidor de desarrollo
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

La capa HTTP usa `http://localhost:8080` si la variable no está definida. Para probar la conexión durante el desarrollo existe la ruta temporal `/api-diagnostics`, que ejecuta `GET /api/locales` y muestra los estados de carga, error o respuesta.

Para sembrar datos de prueba con la extensión REST Client de VS Code, usar [`docs/http/seed-dev.http`](docs/http/seed-dev.http). Después de crear un local, actualizar `@localId` con el identificador recibido antes de crear sus productos.

## Estructura

```text
src/
  app/                 rutas de Expo Router
    (tabs)/            Inicio, Seguir y Personal
    local/[id].tsx     carta del local
    +not-found.tsx
  components/ui/       componentes reutilizables
  constants/theme.ts   colores, tipografía, espaciado, radios y layout
  lib/format.ts        moneda, fechas y códigos
  features/            componentes de dominio
```

## Notas técnicas

- El backend actual no expone tokens JWT ni aplica autorización por roles.
- La base arranca sin locales ni productos. Para probar el catálogo hay que cargarlos por H2 o por los endpoints de administración.
- La app se mantiene en tema claro.
