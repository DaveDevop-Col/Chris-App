# Chris-App

**Aplicación full-stack de gestión de compras y cuentas personales**  
Con tecnología **Vite + React 19 + TypeScript + react-router-dom + Supabase Auth + PWA**

![Chris-App Screenshot](public/LogoPrincipal.jpg)

## Descripción

Chris-App es una aplicación web progresiva (PWA) instalable en Android que permite a los usuarios gestionar sus compras, verificar saldos de cuentas y consultar un historial de transacciones. La aplicación utiliza autenticación OAuth (GitHub/Google) con Supabase y cuenta con protección de rutas, gestión de sesiones y caché controlado para garantizar la seguridad.

## Características Principales

- **Autenticación segura** con Supabase Auth (OAuth GitHub/Google)
- **Protección de rutas** con AuthGuard y manejo de sesiones
- **Aplicación PWA** instalable en dispositivos Android
- **Gestión de sesiones** con redirección completa al cerrar sesión
- **Cache control** para evitar reutilización de páginas en caché
- **Interfaz responsiva** con barra de navegación condicional

## Tecnologías Utilizadas

- **Frontend:** Vite 5, React 19, TypeScript, react-router-dom 7
- **Backend/Auth:** Supabase Auth
- **PWA:** vite-plugin-pwa con Service Worker
- **Estilos:** CSS Modules, Vite CSS

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en el puerto 3000 |
| `npm run build` | Construye la aplicación para producción |
| `npm run start` | Inicia el servidor de producción en el puerto 3001 |
| `npm run lint` | Ejecuta el linter (oxlint) |

## Estructura del Proyecto

```
src/
  app/           # Rutas de Next.js / Vite
  components/    # Componentes reutilizables (AuthGuard, Layout, etc.)
  context/       # Contextos de React (AuthProvider)
  lib/           # Utilidades y helpers
  App.jsx        # Componente raíz
```

## Despliegue

La aplicación ha sido desplegada exitosamente en:
- **Vercel** (producción)
- **PWA en Android** (instalable)

## Seguridad Implementada

- Redirección completa al cerrar sesión (`window.location.replace('/login')`)
- Manejo de evento `SIGNED_OUT` para cerrar sesiones en otras pestañas
- `Cache-Control: no-store` en todas las respuestas de redirección
- Rutas protegidas como dinámicas (`export const dynamic = 'force-dynamic'`)
- Eliminación del texto "Invitado" cuando no hay sesión activa

## Autores

- **David Jiménez** - Desarrollo y mantenimiento

---

*Para más detalles, consulta la documentación de cada componente y las commits del repositorio.*