'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

export default function InicioClient() {
  const { perfil } = useAuth()
  const nombre = perfil?.nombre ?? ''

  return (
    <div className='inicio'>
      <section className='inicio__perfil'>
        <Image className='inicio__foto' src='/ChrisJG.jpg' alt='Chris' width={140} height={140} />
        <h1 className='inicio__saludo'>Hola, {nombre}</h1>
        <p className='inicio__texto'>Bienvenido a App Chris</p>
      </section>

      <nav className='inicio__accesos'>
        <Link href='/registros' className='acceso'>
          <span className='acceso__icono' aria-hidden='true'>
            +
          </span>
          <span className='acceso__titulo'>Registros</span>
          <span className='acceso__descripcion'>Registra tus compras y productos</span>
        </Link>
        <Link href='/cuentas' className='acceso'>
          <span className='acceso__icono' aria-hidden='true'>
            $
          </span>
          <span className='acceso__titulo'>Cuentas</span>
          <span className='acceso__descripcion'>Revisa el saldo 50/50 pendiente</span>
        </Link>
        <Link href='/historial' className='acceso'>
          <span className='acceso__icono' aria-hidden='true'>
            ◷
          </span>
          <span className='acceso__titulo'>Historial</span>
          <span className='acceso__descripcion'>Consulta compras y resumen por mes</span>
        </Link>
      </nav>
    </div>
  )
}