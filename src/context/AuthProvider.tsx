'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Perfil } from '@/lib/types'
import { AuthContext, type AuthContextValue } from './AuthContext'

const ERRORES_ES: Record<string, string> = {
  'Invalid login credentials': 'Correo o contraseña incorrectos.',
  'Email not confirmed': 'El correo todavía no está confirmado.',
  'User not found': 'El correo o la contraseña son incorrectos.',
  'Invalid email address': 'El correo no tiene un formato válido.',
}

function traducirError(mensaje: string | undefined): string {
  if (!mensaje) return 'No se pudo iniciar sesión. Intenta de nuevo.'
  return ERRORES_ES[mensaje] ?? mensaje
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)
  const [perfilCargado, setPerfilCargado] = useState<{ id: string; perfil: Perfil | null } | null>(null)

  useEffect(() => {
    let vigente = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!vigente) return
      if (!error) setSession(data.session)
      setCargando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((evento, nuevaSesion) => {
      if (!vigente) return
      setSession(nuevaSesion)
      setCargando(false)
      if (
        evento === 'SIGNED_OUT' &&
        !nuevaSesion &&
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        window.location.replace('/login')
      }
    })

    return () => {
      vigente = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const user = session?.user ?? null
  const usuarioId = user?.id ?? null

  useEffect(() => {
    if (!usuarioId) return
    const id = usuarioId
    let vigente = true

    supabase
      .from('profiles')
      .select('id, nombre, usuario, created_at, debe_cambiar_clave')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!vigente) return
        setPerfilCargado({ id, perfil: error ? null : (data as Perfil | null) })
      })

    return () => {
      vigente = false
    }
  }, [usuarioId, user])

  const perfil = perfilCargado && perfilCargado.id === usuarioId ? perfilCargado.perfil : null

  const iniciarSesion = useCallback(async (correo: string, contrasena: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: correo.trim().toLowerCase(),
      password: contrasena,
    })
    return error ? traducirError(error.message) : null
  }, [])

  const cerrarSesion = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) console.error(error)
    } finally {
      if (typeof window !== 'undefined') window.location.replace('/login')
    }
  }, [])

  const actualizarPerfil = useCallback(
    async (datos: Partial<Perfil>) => {
      if (!usuarioId) return
      const id = usuarioId
      setPerfilCargado((prev) =>
        prev && prev.id === id && prev.perfil ? { id, perfil: { ...prev.perfil, ...datos } } : prev,
      )
      const { error } = await supabase.from('profiles').update(datos).eq('id', id)
      if (error) console.error(error)
    },
    [usuarioId],
  )

  const valor = useMemo<AuthContextValue>(
    () => ({ user, session, perfil, cargando, iniciarSesion, cerrarSesion, actualizarPerfil }),
    [user, session, perfil, cargando, iniciarSesion, cerrarSesion, actualizarPerfil],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}


