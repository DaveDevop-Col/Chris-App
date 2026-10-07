import Layout from '@/components/Layout'
import AuthGuard from '@/components/AuthGuard'
import RegistrosPage from './page.client'

export const dynamic = 'force-dynamic'

export default function RegistrosRoute() {
  return (
    <Layout>
      <AuthGuard>
        <RegistrosPage />
      </AuthGuard>
    </Layout>
  )
}