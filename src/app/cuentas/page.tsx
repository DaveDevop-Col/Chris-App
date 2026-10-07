import Layout from '@/components/Layout'
import AuthGuard from '@/components/AuthGuard'
import CuentasClient from './page.client'

export const dynamic = 'force-dynamic'

export default function CuentasRoute() {
  return (
    <Layout>
      <AuthGuard>
        <CuentasClient />
      </AuthGuard>
    </Layout>
  )
}