'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { cargando, user, perfil } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const debeCambiar = perfil?.debe_cambiar_clave === true
  const redirigiendo = !cargando && !!user && debeCambiar && pathname !== '/cambiar-clave'

  useEffect(() => {
    if (cargando) return
    if (!user) return
    if (perfil?.debe_cambiar_clave === true && pathname !== '/cambiar-clave') {
      router.replace('/cambiar-clave')
      return
    }
    if (perfil?.debe_cambiar_clave === false && pathname === '/cambiar-clave') {
      router.replace('/')
    }
  }, [cargando, user, perfil, pathname, router])

  if (redirigiendo) {
    return (
      <div className='pantalla-carga' role='status' aria-live='polite'>
        <span className='spinner' aria-hidden='true' />
        <p>Cargando...</p>
      </div>
    )
  }

  return <>{children}</>
}
