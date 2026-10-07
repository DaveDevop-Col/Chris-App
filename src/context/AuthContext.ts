import type { Perfil } from '@/lib/types'

export type AuthContextValue = {
  user: any | null
  session: any | null
  perfil: Perfil | null
  cargando: boolean
  iniciarSesion: (correo: string, contrasena: string) => Promise<string | null>
  cerrarSesion: () => Promise<void>
  actualizarPerfil: (datos: Partial<Perfil>) => Promise<void>
}

import { createContext, useContext } from 'react'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}

