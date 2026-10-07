'use client'

import { useAuth } from '@/context/AuthContext'
import Layout from '@/components/Layout'
import AuthGuard from '@/components/AuthGuard'
import CuentasClient from './page.client'

export default function CuentasRoute() {
  const { cargando, user } = useAuth()
  if (cargando) {
    return (
      <div className='pantalla-carga' role='status' aria-live='polite'>
        <span className='spinner' aria-hidden='true' />
        <p>Cargando...</p>
      </div>
    )
  }
  return (
    <Layout>
      <AuthGuard>
        <CuentasClient />
      </AuthGuard>
    </Layout>
  )
}
