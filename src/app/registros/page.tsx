'use client'

import { useAuth } from '@/context/AuthContext'
import Layout from '@/components/Layout'
import AuthGuard from '@/components/AuthGuard'
import RegistrosPage from './page.client'

export default function RegistrosRoute() {
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
        <RegistrosPage />
      </AuthGuard>
    </Layout>
  )
}
