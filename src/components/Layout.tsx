'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const PESTANAS = [
  { ruta: '/', etiqueta: 'Inicio' },
  { ruta: '/registros', etiqueta: 'Registros' },
  { ruta: '/cuentas', etiqueta: 'Cuentas' },
  { ruta: '/historial', etiqueta: 'Historial' },
]

type Props = {
  children: ReactNode
  pestanas?: boolean
}

export default function Layout({ children, pestanas = true }: Props) {
  const { perfil, cerrarSesion } = useAuth()
  const nombre = perfil?.nombre ?? 'Invitado'
  const pathname = usePathname()

  return (
    <div className={pestanas ? 'app' : 'app app--sin-nav'}>
      <header className='app-header'>
        {pestanas ? (
          <span className='app-header__marca'>
            <Image className='app-header__logo' src='/LogoPrincipal.jpg' alt='App Chris' width={32} height={32} />
            <span>App Chris</span>
          </span>
        ) : (
          <Link href='/' className='app-header__marca'>
            <Image className='app-header__logo' src='/LogoPrincipal.jpg' alt='App Chris' width={32} height={32} />
            <span>App Chris</span>
          </Link>
        )}

        <div className='app-header__usuario'>
          <span className='app-header__nombre' title={nombre ?? ""}>
            {nombre ?? ""}
          </span>
          <button type='button' className='boton boton--fantasma boton--chico' onClick={cerrarSesion}>
            Salir
          </button>
        </div>
      </header>

      <main className='app-contenido'>{children}</main>

      {pestanas && (
        <nav className='app-nav' aria-label='Navegación principal'>
          {PESTANAS.map((pestana) => (
            <Link
              key={pestana.ruta}
              href={pestana.ruta}
              className={'app-nav__enlace' + (pathname === pestana.ruta ? ' es-activo' : '')}
            >
              {pestana.etiqueta}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}

