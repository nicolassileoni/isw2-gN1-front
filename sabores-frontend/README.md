# Sabores del Litoral — Frontend mobile

App de delivery para Sabores del Litoral. Este repositorio contiene el cliente mobile en Expo/React Native que consume la API REST del backend Spring Boot.

## Estado actual

Rama `config-inicial`:

- Base del proyecto limpiada (se eliminaron las pantallas y componentes de ejemplo de Expo).
- Tema claro con tokens del design system.
- Tipografías DM Sans e Inter cargadas con `expo-font`.
- Navegación inicial con Expo Router:
  - Tabs públicas: Inicio, Seguir y Personal.
  - Stack para la carta de un local y pantalla de no encontrado.
- Componentes base: botones, campos, tarjetas, chips, badges, stepper, hojas, estados vacíos/error, skeletons y formateadores de moneda/fecha.
- Pantallas placeholder sin datos de negocio ni llamadas a la API.

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

La app todavía no consume la API en esta rama. La URL se configurará con `EXPO_PUBLIC_API_URL` en la rama `feat/api-client`.

Valores previstos:

| Entorno | URL |
|---|---|
| Simulador iOS | `http://localhost:8080` |
| Emulador Android | `http://10.0.2.2:8080` |
| Celular físico con Expo Go | `http://<IP-LAN-de-la-PC>:8080` |

El celular y la PC deben estar en la misma red y el puerto 8080 debe estar habilitado en el firewall. La app nativa no necesita CORS; la versión web sí, y el backend actual no lo configura.

## Estructura

```text
src/
  app/                 rutas de Expo Router
    (tabs)/            Inicio, Seguir y Personal
    local/[id].tsx     carta del local (placeholder)
    +not-found.tsx
  components/ui/       componentes reutilizables del design system
  constants/theme.ts   colores, tipografía, espaciado, radios y layout
  lib/format.ts        moneda, fechas y códigos
  features/            componentes de dominio (se incorporan por rama)
docs/
  DESIGN.md            guía visual mobile
```

## Documentación

- [Design system](docs/DESIGN.md)
- [Plan de implementación](../PLAN_FRONTEND.md)

## Notas

- El backend actual no tiene JWT ni autorización por roles. La sesión del personal será solo estado de UI.
- No hay datos iniciales de locales ni productos. Para probar el catálogo público habrá que sembrarlos por H2 o por los endpoints de administración.
- La app se mantiene en tema claro en esta versión.
