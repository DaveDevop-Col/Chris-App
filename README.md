# Chris-App

## Descripción

Chris-App es una aplicación web full-stack para la gestión de compras y cuentas personales, construida con **Next.js 16.3.8** y **React 19**. La aplicación está instalable como Progressive Web App (PWA) en dispositivos Android y utiliza autenticación mediante proveedor OAuth con Sesión en Supabase.

## Características Principales

- **Autenticación segura** con Supabase Auth (acceso OAuth a GitHub/Google)
- **Protección de rutas** mediante AuthGuard con redirecciones completas
- **Aplicación PWA** instalable en dispositivos Android
- **Gestión de sesiones** con cierre forzado y redirección a /login
- **Control de caché** para evitar reutilización de páginas en caché (Cache-Control: no-store)
- **Interfaz condicional** que oculta header/nav cuando no hay sesión activa
- **Persistencia del estado** de cambio de clave (`debe_cambiar_clave`)

## Tecnologías Utilizadas

- **Framework:** Next.js 16.3.8 (App Router)
- **Lenguaje:** TypeScript 5
- **Frontend:** React 19
- **Ruteo:** react-router-dom
- **Autenticación:** @supabase/ssr y @supabase/supabase-js
- **PWA:** vite-plugin-pwa (configurado en next-start production)
- **Estilos:** CSS Modules / CSS tradicional
- **Lint:** eslint ^9 con eslint-config-next 16.3.8

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en el puerto 3000 con Next.js |
| `npm run build` | Construye la aplicación para producción (`next build`) |
| `npm run start` | Inicia el servidor de producción en el puerto 3001 (`next start -p 3001`) |
| `npm run lint` | Ejecuta el linter (eslint) sobre los archivos src/ |

## Configuración de Seguridad (Implementada)

Basado en las correcciones realizadas durante el desarrollo:

1. **Cierre de sesión:** `signOut()` seguido de `window.location.replace('/login')` (aunque devuelva error)
2. **Evento SIGNED_OUT:** Listener en AuthProvider que redirige completa al recibir SIGNED_OUT
3. **AuthGuard:** Redirección completa a `/login` cuando no hay usuario, mostrando "Cargando..." mientras carga la sesión
4. **Eliminación de "Invitado":** El nombre de usuario ya no aparece cuando no hay sesión activa (`perfil?.nombre ?? ''`)
5. **Layout condicional:** Header y barra de pestañas solo se renderizan cuando `user` está autenticado
6. **Cache-Control:** `no-store` en todas las respuestas de redirección y en las rutas protegidas desde el proxy (`src/proxy.ts`)
7. **Rutas dinámicas:** `export const dynamic = 'force-dynamic'` en páginas protegidas (`page.tsx`, `registros/page.tsx`, `cuentas/page.tsx`, `historial/page.tsx`)
8. **Persistencia al "Atrás":** Configuración para que pulsar el botón Atrás después de cerrar sesión no muestre datos anteriores

## Estructura del Proyecto

```
src/
  app/           # Rutas Next.js 16 (page.tsx, login/, registros/, cuentas/, historial/, cambiar-clave/)
  components/    # Componentes reutilizables (AuthGuard, Layout, etc.)
  context/       # AuthProvider (gestión de sesión, signOut, onAuthStateChange)
  lib/           # Configuración de Supabase y utilidades
  proxy.ts       # Middleware con Cache-Control: no-store

package.json
next.config.ts
.eslintrc.json
tsconfig.json
```

## Despliegue

La aplicación ha sido probada en modo producción con:

- `npm run build` seguido de `npm run start -p 3001`
- Verificación de los casos de prueba:
  - (a) Iniciar sesión y pulsar "Salir" lleva a `/login`
  - (b) Abrir `/registros` a mano sin sesión redirige a `/login`
  - (c) Pulsar el botón "Atrás" del navegador después de cerrar sesión no muestra datos de la sesión anterior

## Proyecto en GitHub

El repositorio contiene todo el historial de desarrollo con commits que reflejan las correcciones de seguridad aplicadas. El código fuente está organizado siguiendo las convenciones de Next.js 16 con App Router.

---

*Para detalles técnicos específicos, consulta el código fuente en `src/` o el historial de commits del repositorio.*