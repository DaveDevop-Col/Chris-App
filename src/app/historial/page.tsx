'use client'

import { useAuth } from '@/context/AuthContext'
import Layout from '@/components/Layout'
import AuthGuard from '@/components/AuthGuard'
import HistorialClient from './page.client'

export default function HistorialRoute() {
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
        <HistorialClient />
      </AuthGuard>
    </Layout>
  )
}
