import Layout from '@/components/Layout'
import AuthGuard from '@/components/AuthGuard'
import HistorialClient from './page.client'

export const dynamic = 'force-dynamic'

export default function HistorialRoute() {
  return (
    <Layout>
      <AuthGuard>
        <HistorialClient />
      </AuthGuard>
    </Layout>
  )
}