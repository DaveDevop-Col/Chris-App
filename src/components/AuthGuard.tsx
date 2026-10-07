'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { cargando, user, perfil } = useAuth()
  const pathname = usePathname()

  const sinSesion = !cargando && !user
  const redireccionSinSesion = sinSesion && pathname !== '/login'
  const debeCambiar = perfil?.debe_cambiar_clave === true
  const redirigiendo = redireccionSinSesion || (!cargando && !!user && debeCambiar && pathname !== '/cambiar-clave')

  useEffect(() => {
    if (cargando) return
    if (!user) {
      if (pathname !== '/login') {
        window.location.replace('/login')
      }
      return
    }
    if (perfil?.debe_cambiar_clave === true && pathname !== '/cambiar-clave') {
      window.location.replace('/cambiar-clave')
      return
    }
    if (perfil?.debe_cambiar_clave === false && pathname === '/cambiar-clave') {
      window.location.replace('/')
    }
  }, [cargando, user, perfil, pathname])

  if (cargando || redirigiendo) {
    return (
      <div className='pantalla-carga' role='status' aria-live='polite'>
        <span className='spinner' aria-hidden='true' />
        <p>Cargando...</p>
      </div>
    )
  }

  return <>{children}</>
}